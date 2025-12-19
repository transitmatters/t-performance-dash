import os

import boto3
from botocore.exceptions import ClientError, NoCredentialsError

# API Keys (Don't edit! Set in local environment variables.)
MBTA_V2_API_KEY = os.environ.get("MBTA_V2_API_KEY", "")
MBTA_V3_API_KEY = os.environ.get("MBTA_V3_API_KEY", "")

HEALTHCHECK_HIDE_SECRETS = [MBTA_V2_API_KEY, MBTA_V3_API_KEY]

# Backend configuration
PRODUCTION_API = "https://dashboard-api.labs.transitmatters.org"


def _check_aws_credentials():
    """Check if valid AWS credentials are available."""
    try:
        sts = boto3.client("sts")
        sts.get_caller_identity()
        return True
    except (NoCredentialsError, ClientError):
        return False


def get_backend_source():
    """
    Determine the backend data source.
    Returns: 'prod', 'aws', or 'static'
    """
    source = os.environ.get("TM_BACKEND_SOURCE", "").lower()
    if source in ("prod", "aws", "static"):
        return source
    # Auto-detect: use AWS if credentials available, otherwise static
    return "aws" if _check_aws_credentials() else "static"


# Cache the result at module load time for consistency
BACKEND_SOURCE = get_backend_source()
