import json
from datetime import date

from botocore.exceptions import ClientError

from chalicelib import ridership


def test_get_station_ridership_returns_weekly_station_counts(monkeypatch):
    def query(start_date, end_date, line_id):
        assert (start_date, end_date, line_id) == (date(2026, 9, 1), date(2026, 9, 30), "line-Blue")
        return [
            {"lineId": "line-Blue", "date": "2026-09-07", "timestamp": 1788753600, "stations": {"place-aport": 3100}},
            {"lineId": "line-Blue", "date": "2026-09-14", "timestamp": 1789358400, "stations": {"place-aport": 3200}},
        ]

    monkeypatch.setattr(ridership, "query_station_ridership", query)

    assert ridership.get_station_ridership("line-Blue", date(2026, 9, 1), date(2026, 9, 30)) == [
        {"date": "2026-09-07", "stations": {"place-aport": 3100}},
        {"date": "2026-09-14", "stations": {"place-aport": 3200}},
    ]


def test_get_bus_stop_ridership_reads_the_route_file(monkeypatch):
    route = {"route_id": "28", "seasons": [{"season": "Fall 2025", "directions": []}], "stop_names": {}}

    def download(key, compressed=True):
        assert (key, compressed) == ("BusStopRidership/28.json", False)
        return json.dumps(route)

    monkeypatch.setattr(ridership.s3, "download", download)

    assert ridership.get_bus_stop_ridership("28") == route


def test_get_bus_stop_ridership_has_no_seasons_for_a_route_without_a_file(monkeypatch):
    def download(key, compressed=True):
        raise ClientError({"Error": {"Code": "NoSuchKey"}}, "GetObject")

    monkeypatch.setattr(ridership.s3, "download", download)

    assert ridership.get_bus_stop_ridership("34E") == {"route_id": "34E", "seasons": [], "stop_names": {}}
