import copy
import json

import pytest

from scripts.check_stations_copy import DASHBOARD_STATIONS, compare, main


@pytest.fixture(scope="module")
def dashboard():
    return json.loads(DASHBOARD_STATIONS.read_text())


@pytest.fixture
def stations(dashboard):
    return copy.deepcopy(dashboard)


def find(line, place_id, nth=0):
    return [stop for stop in line["stations"] if stop["station"] == place_id][nth]


def test_identical_copy_matches(dashboard, stations):
    assert compare(dashboard, stations) == []


def test_copy_may_drop_add_fields_and_lowercase_lines(dashboard, stations):
    # Like the bot (no amenities), slow-zones (adds grade_separated) and shutdown-tracker (lowercase keys).
    for line in stations.values():
        del line["gtfs_direction_id"]
        for stop in line["stations"]:
            stop.pop("accessible", None)
            stop["grade_separated"] = True
    lowercased = {key.lower(): value for key, value in stations.items()}

    assert compare(dashboard, lowercased) == []


def test_changed_stop_ids(dashboard, stations):
    find(stations["Red"], "place-davis")["stops"]["0"] = ["70063"]

    assert compare(dashboard, stations) == [
        "Red Davis (place-davis): stops is {'0': ['70063'], '1': ['70063']} in the copy "
        "but {'0': ['70064'], '1': ['70063']} in the dashboard"
    ]


def test_changed_line_field(dashboard, stations):
    stations["Red"]["direction"] = {"0": "southbound", "1": "northbound"}

    [problem] = compare(dashboard, stations)
    assert problem.startswith("Red: direction is {'0': 'southbound'")


def test_station_repeated_on_a_line(dashboard, stations):
    # JFK/UMass is listed once per Red Line branch; each listing is compared with its counterpart.
    find(stations["Red"], "place-jfk", nth=1)["order"] = 99

    [problem] = compare(dashboard, stations)
    assert problem.startswith("Red JFK/UMass")
    assert "order is 99 in the copy" in problem


def test_missing_and_extra_stations(dashboard, stations):
    green = stations["Green"]["stations"]
    green.remove(find(stations["Green"], "place-unsqu"))
    green.append({"stop_name": "Somerville Ave", "station": "place-new", "order": 0, "stops": {"0": [], "1": []}})

    assert compare(dashboard, stations) == [
        "Green: Union Square (place-unsqu) is missing from the copy",
        "Green: Somerville Ave (place-new) is in the copy but not in the dashboard",
    ]


def test_missing_line_unless_lines_given(dashboard, stations):
    del stations["Mattapan"]

    assert compare(dashboard, stations) == ["Mattapan is missing from the copy"]
    assert compare(dashboard, stations, ["red", "Orange", "Blue", "Green"]) == []


def test_main_exit_codes(tmp_path, stations, capsys):
    path = tmp_path / "stations.json"
    path.write_text(json.dumps(stations))
    assert main([str(path)]) == 0

    del stations["Blue"]
    path.write_text(json.dumps(stations))
    assert main([str(path)]) == 1
    assert "Blue is missing from the copy" in capsys.readouterr().out
    assert main([str(path), "--lines", "Red, Orange"]) == 0
