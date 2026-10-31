from datetime import date

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
