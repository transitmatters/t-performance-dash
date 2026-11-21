import importlib
import socket
import sys
from pathlib import Path

import pandas as pd

# server/bus holds standalone scripts rather than a package, and they import each other by bare name
BUS_DIR = Path(__file__).resolve().parents[1] / "bus"
sys.path.insert(0, str(BUS_DIR))

from manifest import create_manifest, order_checkpoints  # noqa: E402


def make_stop_times(trips):
    """Build order_checkpoints() input from (trip_id, direction_id, [checkpoint, ...]) tuples."""
    rows = [
        {
            "trip_id": trip_id,
            "direction_id": direction_id,
            "stop_sequence": index * 10,
            "time_point_id": tpt,
            "trip_rank": index + 1,
        }
        for trip_id, direction_id, tpts in trips
        for index, tpt in enumerate(tpts)
    ]
    return pd.DataFrame(rows)


def test_import_downloads_nothing_and_creates_no_directories(monkeypatch, tmp_path):
    def no_network(*args, **kwargs):
        raise AssertionError("importing manifest should not use the network")

    monkeypatch.setattr(socket, "getaddrinfo", no_network)
    monkeypatch.chdir(tmp_path)
    monkeypatch.delenv("GTFS_DATA_DIR", raising=False)
    # re-run each module's top-level code; monkeypatch puts the originals back afterwards
    for name in ("manifest", "bus2train", "gtfs_archive"):
        monkeypatch.delitem(sys.modules, name, raising=False)

    importlib.import_module("manifest")

    assert list(tmp_path.iterdir()) == []


def test_order_checkpoints_slots_short_turn_into_trunk():
    stop_times = make_stop_times(
        [
            ("trunk", 1, ["a", "b", "c", "d"]),
            # short turns start at c, so c is most often first; only the trunk trip shows it comes after b
            ("short-1", 1, ["c", "d"]),
            ("short-2", 1, ["c", "d"]),
            # outbound runs the other way and must not create a cycle
            ("outbound", 0, ["d", "c", "b", "a"]),
        ]
    )

    assert order_checkpoints(stop_times) == {"a": 1, "b": 2, "c": 3, "d": 4}


def test_order_checkpoints_breaks_loop_by_most_common_position():
    stop_times = make_stop_times(
        [
            # q and p each come first on some trips, so neither has to come first
            ("loop-1", 1, ["q", "p", "z"]),
            ("loop-2", 1, ["q", "p", "z"]),
            ("loop-3", 1, ["p", "q", "z"]),
        ]
    )

    # q is usually first, so it wins even though p sorts first by name
    assert order_checkpoints(stop_times) == {"q": 1, "p": 2, "z": 3}


def make_events(rows):
    """Expand (route_id, direction_id, stop_id, time_point_id, time_point_order, count) into one row per event."""
    columns = ["route_id", "direction_id", "stop_id", "time_point_id", "time_point_order"]
    return pd.DataFrame([row[:-1] for row in rows for _ in range(row[-1])], columns=columns)


def write_checkpoints(tmp_path):
    path = tmp_path / "checkpoints.txt"
    path.write_text(
        "checkpoint_id,checkpoint_name\n"
        "HHGAT,Harvard (Bus)\n"
        "CNTSQ,Central Square\n"
        "MIT,MIT\n"
        "DUDLY,Nubian\n"
        "RARE,Rarely Served\n"
    )
    return path


def test_create_manifest_single_route(tmp_path):
    events = make_events(
        [
            # listed out of order to check stations come back sorted by inbound order
            ("1", 1, "75", "MIT", 3, 2),
            # a few inbound trips record MIT at a different position; the most common one wins
            ("1", 1, "75", "MIT", 5, 1),
            ("1", 0, "97", "MIT", 1, 2),
            ("1", 1, "110", "HHGAT", 1, 3),
            ("1", 0, "111", "HHGAT", 3, 3),
            ("1", 1, "72", "CNTSQ", 2, 3),
            ("1", 0, "1059", "CNTSQ", 2, 3),
            # seen twice in total, under min_count
            ("1", 1, "99", "RARE", 4, 2),
        ]
    )

    manifest = create_manifest(
        events,
        ["1"],
        write_checkpoints(tmp_path),
        min_count=3,
        service_start="2025-01-01",
    )

    assert manifest == {
        "1": {
            "type": "bus",
            "direction": {"0": "outbound", "1": "inbound"},
            "service_start": "2025-01-01",
            "stations": [
                {
                    "stop_name": "Harvard",
                    "branches": None,
                    "station": "hhgat",
                    "order": 1,
                    "stops": {"1": ["1-1-110"], "0": ["1-0-111"]},
                },
                {
                    "stop_name": "Central Square",
                    "branches": None,
                    "station": "cntsq",
                    "order": 2,
                    "stops": {"1": ["1-1-72"], "0": ["1-0-1059"]},
                },
                {
                    "stop_name": "MIT",
                    "branches": None,
                    "station": "mit",
                    "order": 3,
                    "stops": {"1": ["1-1-75"], "0": ["1-0-97"]},
                },
            ],
        }
    }


def test_create_manifest_lists_branches_for_combined_routes(tmp_path):
    events = make_events(
        [
            ("34", 1, "110", "HHGAT", 1, 5),
            ("34E", 1, "110", "HHGAT", 1, 5),
            ("34E", 1, "112", "HHGAT", 1, 1),
            ("34E", 1, "72", "DUDLY", 2, 5),
        ]
    )

    manifest = create_manifest(
        events,
        ["34", "34E"],
        write_checkpoints(tmp_path),
        name="34",
        min_count=3,
        service_end="2025-06-30",
    )

    assert list(manifest) == ["34"]
    route = manifest["34"]
    assert route["service_end"] == "2025-06-30"
    assert "service_start" not in route
    assert [(stop["station"], stop["branches"]) for stop in route["stations"]] == [
        ("hhgat", ["34", "34E"]),
        ("dudly", ["34E"]),
    ]
    assert route["stations"][0]["stops"] == {"1": ["34-1-110", "34E-1-110", "34E-1-112"], "0": []}


def test_create_manifest_defaults_name_to_joined_routes(tmp_path):
    events = make_events([("57", 1, "900", "MIT", 1, 3), ("57A", 1, "900", "MIT", 1, 3)])

    manifest = create_manifest(events, ["57", "57A"], None, min_count=3)

    assert list(manifest) == ["57/57A"]
