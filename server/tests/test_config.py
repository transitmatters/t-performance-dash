import pytest

from chalicelib.config import get_backend_source


@pytest.fixture
def env(monkeypatch):
    for var in ("TM_BACKEND_SOURCE", "AWS_LAMBDA_FUNCTION_NAME", "AWS_PROFILE"):
        monkeypatch.delenv(var, raising=False)
    return monkeypatch


@pytest.mark.parametrize("source", ["prod", "aws", "static", "AWS"])
def test_explicit_source_wins(env, source):
    env.setenv("TM_BACKEND_SOURCE", source)
    env.setenv("AWS_LAMBDA_FUNCTION_NAME", "data-dashboard")
    assert get_backend_source() == source.lower()


def test_defaults_to_prod(env):
    assert get_backend_source() == "prod"


def test_other_aws_profile_defaults_to_prod(env):
    env.setenv("AWS_PROFILE", "my-work-account")
    assert get_backend_source() == "prod"


def test_transitmatters_profile_uses_aws(env):
    env.setenv("AWS_PROFILE", "transitmatters")
    assert get_backend_source() == "aws"


def test_lambda_uses_aws(env):
    # The deployed API sets no TM_BACKEND_SOURCE and must not proxy to itself
    env.setenv("AWS_LAMBDA_FUNCTION_NAME", "data-dashboard-production")
    assert get_backend_source() == "aws"


def test_unknown_source_falls_back(env):
    env.setenv("TM_BACKEND_SOURCE", "local")
    assert get_backend_source() == "prod"
