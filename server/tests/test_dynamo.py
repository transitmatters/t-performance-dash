"""Tests for dynamo.py -- every query reads all of its pages."""

from datetime import date
from unittest import mock

from chalicelib import dynamo


def paged_table(*pages):
    """A Table whose query returns ``pages`` in order, each pointing at the next."""
    table = mock.Mock()
    responses = [
        {"Items": items, **({"LastEvaluatedKey": {"page": index + 1}} if index < len(pages) - 1 else {})}
        for index, items in enumerate(pages)
    ]
    table.query.side_effect = responses
    return table


class TestQueryAll:
    def test_follows_every_page(self):
        table = paged_table([{"date": "2020-01-01"}], [{"date": "2023-06-01"}], [{"date": "2026-11-01"}])
        items = dynamo._query_all(table, KeyConditionExpression="cond")
        assert [item["date"] for item in items] == ["2020-01-01", "2023-06-01", "2026-11-01"]
        assert table.query.call_args_list[1].kwargs == {
            "KeyConditionExpression": "cond",
            "ExclusiveStartKey": {"page": 1},
        }

    def test_extended_trip_metrics_reads_past_the_first_page(self, monkeypatch):
        # Service hours over ~3.5+ years used to stop at the first 1MB page for each route.
        table = paged_table([{"route": "Red-A", "date": "2022-01-01"}], [{"route": "Red-A", "date": "2026-01-01"}])
        monkeypatch.setattr(dynamo, "dynamodb", mock.Mock(Table=mock.Mock(return_value=table)), raising=False)
        rows = dynamo.query_extended_trip_metrics(date(2022, 1, 1), date(2026, 1, 1), ["Red-A"])
        assert [row["date"] for row in rows] == ["2022-01-01", "2026-01-01"]
