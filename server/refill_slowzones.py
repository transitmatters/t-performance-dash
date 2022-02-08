import datetime

from chalicelib.parallel import date_range
from chalicelib.s3_alerts import store_alerts, get_alerts


START = datetime.date(2022, 1, 3)
END = datetime.date.today() - datetime.timedelta(days=2)


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
