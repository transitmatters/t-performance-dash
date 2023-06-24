import os

MBTA_V2_API_KEY = os.environ.get("MBTA_V2_API_KEY", "")
MBTA_V3_API_KEY = os.environ.get("MBTA_V3_API_KEY", "")

HEALTHCHECK_HIDE_SECRETS = [
    MBTA_V2_API_KEY,
    MBTA_V3_API_KEY
]
