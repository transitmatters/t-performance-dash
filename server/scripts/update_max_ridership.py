#!/usr/bin/env python3
from chalicelib.dynamo import query_historic_max_ridership
from datetime import date, datetime
from dateutil.relativedelta import relativedelta
import sys
import os

# To run  cd /home/andrew/transitmatters/t-performance-dash/server && PYTHONPATH=. poetry run python scripts/update_max_ridership.py


def get_max_ridership_by_lineId(line_id: str, start_date: date, end_date: date):
    """
    Get the maximum ridership for a given line within a date range.

    Args:
        line_id: Line identifier (e.g., 'line-Red', 'line-Blue', 'line-Green', 'line-Orange', 'line-Fairmount','line-1')
        start_date: Start date for the query
        end_date: End date for the query

    Returns:
        Maximum ridership count for the specified line and date range
    """
    max_ridership = query_historic_max_ridership(start_date, end_date, line_id)
    print(f"Maximum ridership for {line_id} from {start_date} to {end_date}: {max_ridership}")
    return max_ridership


def get_line_id(line_id: str) -> str:
    if line_id.startswith("CR-"):
        line_id = line_id.replace("CR-", "line-")
        return line_id
    # Check if first character is digit, if so then it is a bus
    if line_id[0].isdigit():
        if line_id == "57":
            line_id = "5757A"
        line_id = "line-" + line_id
        return line_id
    # This is meant for Red, Blue, Orange, Green, and Mattapan
    if line_id in [
        "line-red",
        "line-orange",
        "line-blue",
        "line-green",
        "line-mattapan",
    ]:
        line_id = "line-" + line_id.replace("line-", "").capitalize()
        return line_id


if __name__ == "__main__":
    # Example: Get max ridership for all lines
    lines = [
        "line-red",
        "line-orange",
        "line-blue",
        "line-green",
        "line-mattapan",
        "1",
        "4",
        "7",
        "8",
        "9",
        "10",
        "11",
        "14",
        "15",
        "16",
        "1719",
        "18",
        "21",
        "22",
        "23",
        "26",
        "28",
        "29",
        "30",
        "31",
        "32",
        "34",
        "35",
        "36",
        "37",
        "38",
        "39",
        "41",
        "42",
        "43",
        "44",
        "45",
        "47",
        "51",
        "55",
        "57",
        "6170170",
        "66",
        "69",
        "71",
        "73",
        "77",
        "80",
        "83",
        "85",
        "86-legacy",
        "86",
        "87",
        "88",
        "89",
        "90",
        "91",
        "92",
        "93",
        "94",
        "95",
        "96",
        "97",
        "99",
        "104",
        "109",
        "104109",
        "110",
        "111",
        "116",
        "114116117",
        "220221222",
        "CR-Fitchburg",
        "CR-Franklin",
        "CR-Greenbush",
        "CR-Haverhill",
        "CR-Lowell",
        "CR-Worcester",
        "CR-Fairmount",
        "CR-Kingston",
        "CR-Middleborough",
        "CR-Needham",
        "CR-Newburyport",
        "CR-NewBedford",
        "CR-Providence",
        "line-commuter-rail",
    ]
    # Example usage with command line arguments
    if len(sys.argv) >= 4:
        line_id = sys.argv[1]
        start_date_str = sys.argv[2]  # Format: YYYY-MM-DD
        end_date_str = sys.argv[3]  # Format: YYYY-MM-DD

        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        peak_ridership = {}

        for line in lines:
            if line and line != "line-commuter-rail":
                line_id = get_line_id(line)
                try:
                    max_ridership = get_max_ridership_by_lineId(line_id, start_date, end_date)
                    peak_ridership[line] = max_ridership

                except Exception as e:
                    print(f"Error getting ridership for {line}: {e}")

        if os.path.isdir("data"):
            pass
        else:
            os.mkdir("data")

        with open("data/peakridership.txt", "w") as f:
            f.write(str(peak_ridership))
    else:
        # Default value is 1 year before today's date -> 2016
        print("Usage: python update_max_ridership.py <line_id> <start_date> <end_date>")
        print("\nRunning with default values...")
        start_date = date(2016, 1, 1)
        end_date = datetime.now() - relativedelta(years=1)

        peak_ridership = {}
        for line in lines:
            if line and line != "line-commuter-rail":
                line_id = get_line_id(line)
                try:
                    max_ridership = get_max_ridership_by_lineId(line_id, start_date, end_date)
                    peak_ridership[line] = max_ridership

                except Exception as e:
                    print(f"Error getting ridership for {line}: {e}")

        if os.path.isdir("data"):
            pass
        else:
            os.mkdir("data")

        with open("data/peakridership.txt", "w") as f:
            f.write(str(peak_ridership))
