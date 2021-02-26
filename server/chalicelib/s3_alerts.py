import json
from chalicelib import MbtaPerformanceAPI, s3


def routes_for_alert(alert):
    try:
        routes = set()
        for alert_version in alert["alert_versions"]:
            for informed_entity in alert_version["informed_entity"]:
                routes.add(informed_entity["route_id"])
        return routes
    except Exception:
        return set()


def key(day):
    return f"Alerts/{str(day)}.json.gz"


def get_alerts(day, route):
    alerts_str = s3.download(key(day), "utf8")
    alerts = json.loads(alerts_str)[0]["past_alerts"]
    return list(filter(lambda alert: route[0] in routes_for_alert(alert), alerts))


def store_alerts(day):
    api_data = MbtaPerformanceAPI.get_api_data(day, "pastalerts", {})
    alerts = json.dumps(api_data).encode("utf8")
    s3.upload(key(day), alerts, True)
