import json
from chalicelib import MbtaPerformanceAPI, s3


def routes_for_alert(alert):
    routes = set()
    try:
        for alert_version in alert["alert_versions"]:
            for informed_entity in alert_version["informed_entity"]:
                if "route_id" in informed_entity:
                    routes.add(informed_entity["route_id"])
    except KeyError as e:
        print(f"Handled KeyError: Couldn't access {e} from alert {alert}")

    return routes


def key(day):
    return f"Alerts/{str(day)}.json.gz"


def get_alerts(day, route):
    alerts_str = s3.download(key(day), "utf8")
    alerts = json.loads(alerts_str)[0]["past_alerts"]
    return list(filter(lambda alert: route[0] in routes_for_alert(alert), alerts))


def store_alerts(day):
    api_data = MbtaPerformanceAPI.get_api_data("pastalerts", {}, day)
    alerts = json.dumps(api_data).encode("utf8")
    s3.upload(key(day), alerts, True)
