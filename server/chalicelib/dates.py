from datetime import datetime


DATE_FORMAT_MASSDOT = "%Y-%m-%d %H:%M:%S"
DATE_FORMAT_TIMEZONE = "%Y-%m-%d %H:%M:%S%z"
DATE_FORMAT_OUT = "%Y-%m-%dT%H:%M:%S"


def parse_event_date(date_str: str):
    if len(date_str) == 19:
        return datetime.strptime(date_str, DATE_FORMAT_MASSDOT)
    else:
        return datetime.strptime(date_str, DATE_FORMAT_TIMEZONE)


def return_formatted_date(date: datetime):
    return date.strftime(DATE_FORMAT_OUT)
