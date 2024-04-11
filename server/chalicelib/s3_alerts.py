from datetime import date
import json
from chalicelib import s3


def routes_for_alert(alert):
    routes = set()

    if "alert_versions" in alert:
        try:
            for alert_version in alert["alert_versions"]:
                for informed_entity in alert_version["informed_entity"]:
                    if "route_id" in informed_entity:
                        routes.add(informed_entity["route_id"])
        except KeyError as e:
            print(f"Handled KeyError: Couldn't access {e} from alert {alert}")
    elif "attributes" in alert:
        try:
            for informed_entity in alert["attributes"]["informed_entity"]:
                if "route" in informed_entity:
                    routes.add(informed_entity["route"])
        except KeyError as e:
            print(f"Handled KeyError: Couldn't access {e} from alert {alert}")

    return routes


def key(day, v3: bool = False):
    if v3:
        return f"Alerts/v3/{str(day)}.json.gz"
    return f"Alerts/{str(day)}.json.gz"


def get_v2_alerts(day: date, routes):
    alerts_str = s3.download(key(day), "utf8")
    # TODO: Handle either format (v2 or v3) of alerts
    alerts = json.loads(alerts_str)[0]["past_alerts"]

    def matches_route(alert):
        targets = routes_for_alert(alert)
        return any(r in targets for r in routes)

    return list(filter(matches_route, alerts))


def get_v3_alerts(day: date, routes: list[str]):
    alerts_str = s3.download(key(day, v3=True), "utf8")
    alerts = json.loads(alerts_str)

    def matches_route(alert):
        targets = routes_for_alert(alert)
        return any(r in targets for r in routes)

    return list(filter(matches_route, alerts.values()))
