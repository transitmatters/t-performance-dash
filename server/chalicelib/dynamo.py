"""DynamoDB access layer for querying trip metrics, scheduled service, and ridership data."""

from datetime import date
from boto3.dynamodb.conditions import Attr, Key
import boto3
from dynamodb_json import json_util as ddb_json
from chalicelib import constants
from typing import List
import concurrent.futures
import os


# DynamoDB resource - initialized to None. This will be set by app.py
dynamodb = None


def set_dynamodb_resource():
    """Initialize the global DynamoDB resource with the configured AWS region."""
    global dynamodb

    region = os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
    dynamodb = boto3.resource("dynamodb", region_name=region)


def _query_all(table, **query_kwargs) -> List[dict]:
    """Run a DynamoDB query and follow ``LastEvaluatedKey`` until every page is read.

    One query page stops at 1MB, which a multi-year range for one partition can exceed.

    Args:
      table: A boto3 DynamoDB Table resource.
      **query_kwargs: Arguments for ``table.query``, e.g. ``KeyConditionExpression``.

    Returns:
      list[dict]: Deserialized records from every page.
    """
    items = []
    while True:
        response = table.query(**query_kwargs)
        items.extend(ddb_json.loads(response["Items"]))
        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            return items
        query_kwargs = {**query_kwargs, "ExclusiveStartKey": last_evaluated_key}


def query_daily_trips_on_route(table_name: str, route, start_date: str | date, end_date: str | date):
    """Query daily trip metrics for a single route from DynamoDB.

    Args:
      table_name: str: The DynamoDB table name to query.
      route: The route ID (partition key).
      start_date: str | date: Start of date range (inclusive).
      end_date: str | date: End of date range (inclusive).

    Returns:
      list[dict]: Deserialized trip metric records.
    """
    table = dynamodb.Table(table_name)
    query_kwargs = {"KeyConditionExpression": Key("route").eq(route) & Key("date").between(start_date, end_date)}
    return _query_all(table, **query_kwargs)


def scan_trip_metrics_in_range(table_name: str, start_date: str | date, end_date: str | date) -> List[dict]:
    """Scan a delivered-trip-metrics table for every route's rows within a date range.

    Date is the table's sort key, not its partition key, so there is no way to read across
    every route for a range without a full scan -- unlike query(), a scan's cost scales with
    the table's *total* size, not the size of the range requested, no matter how the
    FilterExpression narrows the returned rows. Fine for a table this small; callers should
    keep results cached and reconsider (e.g. a GSI keyed by date) if the table grows large.

    Args:
      table_name: str: The DynamoDB table name to scan.
      start_date: str | date: Start of date range (inclusive).
      end_date: str | date: End of date range (inclusive).

    Returns:
      list[dict]: Deserialized trip metric records within the range, across all routes.
    """
    table = dynamodb.Table(table_name)
    items = []
    scan_kwargs = {"FilterExpression": Attr("date").between(start_date, end_date)}
    while True:
        response = table.scan(**scan_kwargs)
        items.extend(ddb_json.loads(response["Items"]))
        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break
        scan_kwargs["ExclusiveStartKey"] = last_evaluated_key
    return items


def query_daily_trips_on_line(table_name: str, line: str, start_date: str | date, end_date: str | date):
    """Query daily trip metrics for all routes on a line, in parallel.

    Resolves the line to its constituent routes via LINE_TO_ROUTE_MAP and queries
    each route concurrently using a thread pool.

    Args:
      table_name: str: The DynamoDB table name to query.
      line: str: The line identifier (e.g., "Red", "Orange").
      start_date: str | date: Start of date range (inclusive).
      end_date: str | date: End of date range (inclusive).

    Returns:
      list[list[dict]]: A list of result lists, one per route on the line.
    """
    return query_daily_trips_on_routes(table_name, constants.LINE_TO_ROUTE_MAP[line], start_date, end_date)


def query_daily_trips_on_routes(table_name: str, route_keys, start_date: str | date, end_date: str | date):
    """Query daily trip metrics for several routes, in parallel.

    Args:
      table_name: str: The DynamoDB table name to query.
      route_keys: Iterable of route IDs (partition keys).
      start_date: str | date: Start of date range (inclusive).
      end_date: str | date: End of date range (inclusive).

    Returns:
      list[list[dict]]: A list of result lists, one per route.
    """
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = [
            executor.submit(
                query_daily_trips_on_route,
                table_name,
                route_key,
                start_date,
                end_date,
            )
            for route_key in route_keys
        ]
        results = []
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            results.append(result)
    return results


def query_scheduled_service(start_date: date, end_date: date, route_id: str = None):
    """Query scheduled service data from the ScheduledServiceDaily DynamoDB table.

    Args:
      start_date: date: Start of date range (inclusive).
      end_date: date: End of date range (inclusive).
      route_id: str: The route ID to query. (Default value = None)

    Returns:
      list[dict]: Deserialized scheduled service records.
    """
    table = dynamodb.Table("ScheduledServiceDaily")
    line_condition = Key("routeId").eq(route_id)
    date_condition = Key("date").between(start_date.isoformat(), end_date.isoformat())
    return _query_all(table, KeyConditionExpression=line_condition & date_condition)


def query_ridership(start_date: date, end_date: date, line_id: str = None):
    """Query ridership data from the Ridership DynamoDB table.

    Args:
      start_date: date: Start of date range (inclusive).
      end_date: date: End of date range (inclusive).
      line_id: str: The line ID to query. (Default value = None)

    Returns:
      list[dict]: Deserialized ridership records.
    """
    table = dynamodb.Table("Ridership")
    line_condition = Key("lineId").eq(line_id)
    date_condition = Key("date").between(start_date.isoformat(), end_date.isoformat())
    return _query_all(table, KeyConditionExpression=line_condition & date_condition)


def query_reliability(route_id: str, start_date: date, end_date: date):
    """Query daily on-time performance counts from the Reliability DynamoDB table.

    Args:
      route_id: str: The route ID (``"RIDE"``, ``"CR-Worcester"``, ...).
      start_date: date: Start of date range (inclusive).
      end_date: date: End of date range (inclusive).

    Returns:
      list[dict]: Deserialized reliability records.
    """
    table = dynamodb.Table("Reliability")
    query_kwargs = {
        "KeyConditionExpression": Key("routeId").eq(route_id)
        & Key("date").between(start_date.isoformat(), end_date.isoformat())
    }
    return _query_all(table, **query_kwargs)


def query_headway_reliability(route: str, start_date: date, end_date: date):
    """Query daily headway counts for a subway line from the HeadwayReliability DynamoDB table.

    Args:
      route: str: The line (``"line-red"``, ...).
      start_date: date: Start of date range (inclusive).
      end_date: date: End of date range (inclusive).

    Returns:
      list[dict]: Deserialized daily records.
    """
    table = dynamodb.Table("HeadwayReliability")
    query_kwargs = {
        "KeyConditionExpression": Key("route").eq(route)
        & Key("date").between(start_date.isoformat(), end_date.isoformat())
    }
    return _query_all(table, **query_kwargs)


def query_regional_rail_scorecard(route_id: str, start_date: date, end_date: date):
    """Query scheduled Regional Rail metrics from the ScheduledServiceRegionalRail DynamoDB table.

    Args:
      route_id: str: The Commuter Rail route ID (``"CR-Worcester"``, ...).
      start_date: date: Start of date range (inclusive).
      end_date: date: End of date range (inclusive).

    Returns:
      list[dict]: Deserialized scorecard records, one per day.
    """
    table = dynamodb.Table("ScheduledServiceRegionalRail")
    query_kwargs = {
        "KeyConditionExpression": Key("routeId").eq(route_id)
        & Key("date").between(start_date.isoformat(), end_date.isoformat())
    }
    return _query_all(table, **query_kwargs)


def query_agg_trip_metrics(start_date: str | date, end_date: str | date, table_name: str, line: str = None):
    """Query aggregated trip metrics from a DynamoDB table, keyed by line and date.

    Args:
      start_date: str | date: Start of date range (inclusive).
      end_date: str | date: End of date range (inclusive).
      table_name: str: The DynamoDB table name to query.
      line: str: The line identifier (partition key). (Default value = None)

    Returns:
      list[dict]: Deserialized aggregated trip metric records.
    """
    table = dynamodb.Table(table_name)
    line_condition = Key("line").eq(line)
    date_condition = Key("date").between(start_date, end_date)
    return _query_all(table, KeyConditionExpression=line_condition & date_condition)


def query_station_ridership(start_date: date, end_date: date, line_id: str) -> List[dict]:
    """Query weekly per-station ridership from the StationRidership DynamoDB table.

    Args:
      start_date: date: Start of date range (inclusive).
      end_date: date: End of date range (inclusive).
      line_id: str: The line ID to query, e.g. ``line-Red``.

    Returns:
      list[dict]: Deserialized records, one per week, each with a ``stations`` map of stop ID to count.
    """
    table = dynamodb.Table("StationRidership")
    query_kwargs = {
        "KeyConditionExpression": Key("lineId").eq(line_id)
        & Key("date").between(start_date.isoformat(), end_date.isoformat()),
    }
    return _query_all(table, **query_kwargs)


def query_shutdowns(line: str, start_date: str | date, end_date: str | date) -> List[dict]:
    """Query the Shutdowns table for one line's shutdowns that overlap a date range.

    Args:
      line: str: The line identifier (partition key), e.g. ``Red`` or ``Green-B``.
      start_date: str | date: Start of date range (inclusive).
      end_date: str | date: End of date range (inclusive).

    Returns:
      list[dict]: Deserialized shutdown records.
    """
    table = dynamodb.Table("Shutdowns")
    query_kwargs = {
        "KeyConditionExpression": Key("line").eq(line),
        "FilterExpression": Attr("first_start").lte(str(end_date)) & Attr("last_end").gte(str(start_date)),
    }
    return _query_all(table, **query_kwargs)


def query_extended_trip_metrics(
    start_date: date,
    end_date: date,
    route_ids: List[str],
):
    """Query extended trip metrics from DynamoDB for multiple routes.

    Queries the DeliveredTripMetricsExtended table for each route ID sequentially.

    Args:
      start_date: date: Start of date range (inclusive).
      end_date: date: End of date range (inclusive).
      route_ids: List[str]: Route IDs to query.

    Returns:
      list[dict]: Combined deserialized records from all queried routes.
    """
    table = dynamodb.Table("DeliveredTripMetricsExtended")
    start_date_str = start_date.strftime("%Y-%m-%d")
    end_date_str = end_date.strftime("%Y-%m-%d")
    response_dicts = []
    for route_id in route_ids:
        condition = Key("route").eq(route_id) & Key("date").between(start_date_str, end_date_str)
        response_dicts.extend(_query_all(table, KeyConditionExpression=condition))
    return response_dicts


def query_historic_max_ridership(start_date: date, end_date: date, line_id: str = None):
    potential_vals = query_ridership(start_date, end_date, line_id)
    ridership = {val["count"] for val in potential_vals}
    max_ridership = max(ridership)

    return max_ridership
