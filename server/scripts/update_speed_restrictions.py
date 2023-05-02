import requests
import json
import csv
from os import path
from typing import Dict, Union

SOURCE_URL = "https://opendata.arcgis.com/api/v3/datasets/b2e900925d47489aaf4d6d857867ccc7_0/downloads/data?format=csv&spatialRefId=4326&where=1=1"
TARGET_PATH = path.normpath(
    path.join(
        path.dirname(__file__),
        "..",
        "..",
        "public",
        "static",
        "slowzones",
        "speed_restrictions.json",
    )
)


def parse_weird_date(date: str) -> Union[None, str]:
    if date:
        date_part = date.split(" ")[0].strip()
        [year, month, day] = [s.strip() for s in date_part.split("/")]
        return f"{year}-{month}-{day}"
    return None


def process_row(row: Dict[str, str]) -> Dict[str, str]:
    try:
        [from_stop_id, to_stop_id] = [
            s.strip() for s in row["Loc_GTFS_Stop_ID"].split("|")
        ]
    except ValueError:
        from_stop_id = row["Loc_GTFS_Stop_ID"].strip()
        to_stop_id = None
    return {
        "id": row["ID"],
        "line": row["Line"].replace("Line", "").strip(),
        "description": row["Location_Description"],
        "reason": row["Restriction_Reason"],
        "status": row["Restriction_Status"],
        "fromStopId": from_stop_id,
        "toStopId": to_stop_id,
        "reported": parse_weird_date(row["Date_Restriction_Reported"]),
        "cleared": parse_weird_date(row["Date_Restriction_Cleared"]),
        "speedMph": int(row["Restriction_Speed_MPH"].replace("mph", "").strip()),
        "trackFeet": int(row["Restriction_Distance_Feet"].replace(",", "").strip()),
    }


def main():
    req = requests.get(SOURCE_URL)
    rows = csv.DictReader(req.text.splitlines(), delimiter=",")
    out_rows = [process_row(row) for row in rows]
    out_json = json.dumps(out_rows, indent=2)
    with open(TARGET_PATH, "w") as f:
        f.write(out_json)


if __name__ == "__main__":
    main()
