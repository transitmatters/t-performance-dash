from datetime import date

import pytest
from chalice import BadRequestError

from chalicelib import shutdowns

START, END = date(2026, 7, 1), date(2026, 7, 31)


def item(line, alert_id, first_start, stops):
    return {"line": line, "alert_id": alert_id, "first_start": first_start, "stops": stops}


def test_green_covers_every_branch_once(monkeypatch):
    by_line = {
        "Green-B": [item("Green-B", "2", "2026-07-11", ["place-bland", "place-kencl"])],
        "Green-C": [item("Green-C", "2", "2026-07-11", ["place-kencl", "place-smary"])],
        "Green-E": [item("Green-E", "1", "2026-07-02", ["place-symcl"])],
    }
    queried = []

    def query(line, start, end):
        queried.append(line)
        return by_line.get(line, [])

    monkeypatch.setattr(shutdowns.dynamo, "query_shutdowns", query)

    result = shutdowns.get_shutdowns("Green", START, END)
    assert queried == shutdowns.GREEN_BRANCHES
    assert result == [
        item("Green", "1", "2026-07-02", ["place-symcl"]),
        item("Green", "2", "2026-07-11", ["place-bland", "place-kencl", "place-smary"]),
    ]


def test_single_line(monkeypatch):
    monkeypatch.setattr(
        shutdowns.dynamo, "query_shutdowns", lambda line, start, end: [item(line, "1", "2026-07-02", [])]
    )
    assert shutdowns.get_shutdowns("CR-Worcester", START, END) == [item("CR-Worcester", "1", "2026-07-02", [])]


def test_unknown_line():
    with pytest.raises(BadRequestError):
        shutdowns.get_shutdowns("Purple", START, END)
