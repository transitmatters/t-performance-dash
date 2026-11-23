import datetime
import importlib
import shutil
import socket
import sys
from pathlib import Path

import pandas as pd

# server/bus holds standalone scripts rather than a package, and they import each other by bare name.
# This stays on sys.path for the rest of the pytest session, so a bare `import manifest` (or bus2train,
# gtfs_archive, stop_list, active_routes, compare_manifest) anywhere else in the tests would get the
# bus script. Server code imports through chalicelib, so nothing clashes today.
BUS_DIR = Path(__file__).resolve().parents[1] / "bus"
sys.path.insert(0, str(BUS_DIR))

import gtfs_archive  # noqa: E402
import manifest  # noqa: E402
from manifest import create_manifest, load_gtfs_data, order_checkpoints  # noqa: E402


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
            # under min_count on its own, but min_count drops rarely served timepoints, not stops: a stop
            # at a busy timepoint (a detour stop, say) keeps its trips' events in the station
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


ARCHIVES = pd.DataFrame(
    {
        "feed_start_date": [20250101, 20250601],
        "feed_end_date": [20250531, 20250630],
        "archive_url": ["https://cdn.mbta.com/archive/20250101.zip", "https://cdn.mbta.com/archive/20250601.zip"],
    }
)


def no_download(*args, **kwargs):
    raise AssertionError("the archive is already on disk")


def test_get_gtfs_archive_returns_an_archive_already_on_disk(monkeypatch, tmp_path):
    main_dir = tmp_path / "gtfs_archives"
    (main_dir / "20250601").mkdir(parents=True)
    monkeypatch.setattr(gtfs_archive, "MAIN_DIR", main_dir)
    monkeypatch.setattr(gtfs_archive, "_archives", lambda: ARCHIVES)
    monkeypatch.setattr(gtfs_archive.urllib.request, "urlretrieve", no_download)

    assert gtfs_archive.get_gtfs_archive(20250605) == main_dir / "20250601"


def test_get_gtfs_archive_creates_its_folder_on_the_first_download(monkeypatch, tmp_path):
    feed = tmp_path / "feed"
    feed.mkdir()
    (feed / "calendar.txt").write_text("service_id\n")
    zip_path = shutil.make_archive(str(tmp_path / "20250601"), "zip", feed)
    # not created on import any more, so the first download makes it
    main_dir = tmp_path / "data" / "gtfs_archives"
    monkeypatch.setattr(gtfs_archive, "MAIN_DIR", main_dir)
    monkeypatch.setattr(gtfs_archive, "_archives", lambda: ARCHIVES)
    monkeypatch.setattr(gtfs_archive.urllib.request, "urlretrieve", lambda url: (zip_path, None))
    monkeypatch.setattr(gtfs_archive.urllib.request, "urlcleanup", lambda: None)

    archive = gtfs_archive.get_gtfs_archive(20250605)

    assert archive == main_dir / "20250601"
    assert (archive / "calendar.txt").exists()
    # extracted into place, with no temporary folder left behind
    assert [path.name for path in main_dir.iterdir()] == ["20250601"]


def write_archive(archive_dir):
    archive_dir.mkdir()
    days = "monday,tuesday,wednesday,thursday,friday,saturday,sunday"
    (archive_dir / "calendar.txt").write_text(
        f"service_id,{days},start_date,end_date\n"
        "wkdy,1,1,1,1,1,0,0,20250101,20251231\n"
        "sat,0,0,0,0,0,1,0,20250101,20251231\n"
    )
    (archive_dir / "calendar_dates.txt").write_text("service_id,date,exception_type\n")
    (archive_dir / "trips.txt").write_text(
        "route_id,service_id,trip_id,direction_id,trip_headsign\n"
        "1,wkdy,weekday-trip,1,Harvard\n"
        "1,sat,saturday-trip,1,Harvard\n"
        "2,wkdy,other-route,1,Elsewhere\n"
    )
    (archive_dir / "stop_times.txt").write_text(
        "trip_id,arrival_time,stop_id,stop_sequence,checkpoint_id\n"
        "weekday-trip,08:00:00,110,1,HHGAT\n"
        "weekday-trip,08:05:00,111,2,\n"
        "weekday-trip,08:10:00,72,3,CNTSQ\n"
        "saturday-trip,09:00:00,110,1,HHGAT\n"
        "saturday-trip,09:10:00,72,2,CNTSQ\n"
        "other-route,08:00:00,500,1,ELSWH\n"
    )
    (archive_dir / "checkpoints.txt").write_text("checkpoint_id,checkpoint_name\nHHGAT,Harvard\nCNTSQ,Central\n")


def test_load_gtfs_data_counts_each_scheduled_checkpoint_stop_per_day(monkeypatch, tmp_path):
    archive_dir = tmp_path / "20250601"
    write_archive(archive_dir)
    monkeypatch.setattr(manifest, "get_gtfs_archive", lambda dateint: archive_dir)

    # Thursday to Saturday: the weekday trip runs twice and the Saturday trip once
    data = load_gtfs_data(datetime.date(2025, 6, 5), 3, ["1"])

    assert list(data.columns) == [
        "route_id",
        "stop_id",
        "time_point_id",
        "direction_id",
        "time_point_order",
        "checkpoints_file",
    ]
    # stop 111 isn't a checkpoint and route 2 wasn't asked for
    assert sorted(data[["stop_id", "time_point_id"]].itertuples(index=False, name=None)) == [
        ("110", "hhgat"),
        ("110", "hhgat"),
        ("110", "hhgat"),
        ("72", "cntsq"),
        ("72", "cntsq"),
        ("72", "cntsq"),
    ]
    assert data.groupby("time_point_id").time_point_order.first().to_dict() == {"cntsq": 2, "hhgat": 1}
    assert set(data.checkpoints_file) == {str(archive_dir / "checkpoints.txt")}
