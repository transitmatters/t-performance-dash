import datetime

from chalicelib.parallel import date_range
from chalicelib.s3_alerts import store_alerts, get_alerts

import sys
if len(sys.argv) < 3:
    print("usage: python refill_slowzones.py 2021-04-12 2021-05-01")
start_str = sys.argv[1]
end_str = sys.argv[2]

START = datetime.datetime.strptime(start_str, "%Y-%m-%d").date()
END = datetime.datetime.strptime(end_str, "%Y-%m-%d").date()

def do_alerts_exist(d):
    try:
        get_alerts(d, ["Red"])
    except Exception as err:
        if err.response["Error"]["Code"] == "NoSuchKey":
            return False
    return True


for d in date_range(START, END):
    if do_alerts_exist(d):
        continue
    print("storing", d)
    for i in range(3):
        print("  attempt", i + 1, "of 3")
        try:
            store_alerts(d)
            print("success")
            break
        except Exception:
            continue
