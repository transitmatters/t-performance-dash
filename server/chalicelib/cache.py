from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

EASTERN_TIME = ZoneInfo("US/Eastern")

# Cache duration constants (in seconds)
FIFTEEN_MINUTES = 900
ONE_HOUR = 3600
ONE_DAY = 86400
THREE_MONTHS = 7776000  # 90 days


def get_cache_max_age(query_params: dict) -> int:
    """
    Determine cache duration based on the date range in query parameters.

    For data from today, cache for 15 minutes (still updating).
    For recent data (within 6 months), cache for 1 hour.
    For historical data (more than 6 months old), cache for 3 months.

    Args:
        query_params: Dictionary of query parameters from the request

    Returns:
        Cache max-age in seconds
    """
    cache_max_age = ONE_HOUR  # Default: 1 hour

    # Check for date parameter - try common date parameter names
    # Priority: end_date > date > to_date
    end_date_str = query_params.get("end_date") or query_params.get("date") or query_params.get("to_date")

    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").replace(tzinfo=EASTERN_TIME)
            now = datetime.now(EASTERN_TIME)
            today = now.replace(hour=0, minute=0, second=0, microsecond=0)
            six_months_ago = now - timedelta(days=180)

            # If data is from today, cache for only 15 minutes (data still updating)
            if end_date >= today:
                cache_max_age = FIFTEEN_MINUTES
            # If data is from more than 6 months ago, it's historical and won't change much
            elif end_date < six_months_ago:
                cache_max_age = THREE_MONTHS
            # Otherwise, cache for 1 hour (recent but not today)
            else:
                cache_max_age = ONE_HOUR
        except ValueError:
            # If date parsing fails, use default cache duration
            pass

    return cache_max_age
