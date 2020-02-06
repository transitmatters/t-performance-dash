import os

if 'MBTA_V2_API_KEY' in os.environ:
    MBTA_V2_API_KEY = os.environ['MBTA_V2_API_KEY']
    MBTA_V3_API_KEY = os.environ['MBTA_V3_API_KEY']
else:
    MBTA_V2_API_KEY = ''
    MBTA_V3_API_KEY = ''

