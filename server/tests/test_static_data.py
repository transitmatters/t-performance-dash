"""Tests for chalicelib/static_data.py — the production API proxy used when TM_BACKEND_SOURCE=prod."""

from unittest.mock import MagicMock

import pytest
from chalice.app import MultiDict

from chalicelib import static_data
from chalicelib.config import PRODUCTION_API


@pytest.fixture
def requested_urls(monkeypatch):
    """Replace requests.get with a stub and collect the URLs proxy_request asks for."""
    urls = []

    def fake_get(url, timeout):
        urls.append(url)
        response = MagicMock()
        response.json.return_value = []
        return response

    monkeypatch.setattr(static_data.requests, "get", fake_get)
    return urls


class TestProxyRequest:
    def test_multidict_keeps_every_value_of_a_repeated_param(self, requested_urls):
        query_params = MultiDict(
            {"from_stop": ["70196", "70197"], "to_stop": ["70150", "70151"], "start_date": ["2024-01-01"]}
        )
        static_data.proxy_request("/api/aggregate/traveltimes2", query_params)
        assert requested_urls == [
            f"{PRODUCTION_API}/api/aggregate/traveltimes2"
            "?from_stop=70196&from_stop=70197&to_stop=70150&to_stop=70151&start_date=2024-01-01"
        ]

    def test_dict_list_values_become_repeated_params(self, requested_urls):
        static_data.proxy_request("/api/headways/2024-01-01", {"stop": ["70061", "70063"]})
        assert requested_urls == [f"{PRODUCTION_API}/api/headways/2024-01-01?stop=70061&stop=70063"]

    def test_empty_params_add_no_query_string(self, requested_urls):
        static_data.proxy_request("/api/service_ridership_dashboard", {})
        assert requested_urls == [f"{PRODUCTION_API}/api/service_ridership_dashboard"]
