"""Application configuration: API keys and backend source selection."""

import logging
import os

logger = logging.getLogger(__name__)

# API Keys (Don't edit! Set in local environment variables.)
MBTA_V2_API_KEY = os.environ.get("MBTA_V2_API_KEY", "")
MBTA_V3_API_KEY = os.environ.get("MBTA_V3_API_KEY", "")

HEALTHCHECK_HIDE_SECRETS = [MBTA_V2_API_KEY, MBTA_V3_API_KEY]

# Backend configuration
PRODUCTION_API = "https://dashboard-api.labs.transitmatters.org"
BACKEND_SOURCES = ("prod", "aws", "static")
# The AWS CLI profile deploy.sh uses for TransitMatters credentials
TM_AWS_PROFILE = "transitmatters"


def get_backend_source():
    """Determine the backend data source.

    TM_BACKEND_SOURCE wins when set to a known mode. Otherwise:

    - On Lambda, use 'aws'. The deployed API must never proxy to the production API, which is itself.
    - With AWS_PROFILE=transitmatters, use 'aws', since those are TransitMatters credentials.
    - Otherwise use 'prod'. Any AWS credentials could be for another account, so they're not
      enough on their own to pick 'aws'.

    Returns:
        str: 'prod' to proxy requests to the production API, 'aws' to query AWS
             directly, or 'static' to use local static data.
    """
    source = os.environ.get("TM_BACKEND_SOURCE", "").lower()
    if source in BACKEND_SOURCES:
        return source
    if source:
        logger.warning(f"Ignoring unknown TM_BACKEND_SOURCE={source!r}, expected one of {', '.join(BACKEND_SOURCES)}")
    if os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
        return "aws"
    if os.environ.get("AWS_PROFILE") == TM_AWS_PROFILE:
        return "aws"
    return "prod"


# Cache the result at module load time for consistency
BACKEND_SOURCE = get_backend_source()
logger.info(f"Backend data source: {BACKEND_SOURCE} (choose with TM_BACKEND_SOURCE=prod|aws|static)")
