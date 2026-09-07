from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_login_returns_member_access() -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "member@coopserve.org", "password": "coopserve"},
    )

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert response.json()["access_token"]
    assert response.json()["user"]["email"] == "member@coopserve.org"
    assert response.json()["user"]["role"] == "member"
    assert response.json()["user"]["capabilities"] == [
        "Create Service Request",
        "View My Requests",
        "Track Status",
        "Rate Service",
    ]


def test_login_returns_admin_and_provider_access() -> None:
    admin = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@coopserve.org", "password": "coopserve-admin"},
    )
    provider = client.post(
        "/api/v1/auth/login",
        json={"email": "provider@coopserve.org", "password": "coopserve-provider"},
    )

    assert admin.status_code == 200
    assert admin.json()["user"]["role"] == "admin"
    assert "Manage Providers" in admin.json()["user"]["capabilities"]
    assert provider.status_code == 200
    assert provider.json()["user"]["role"] == "service_provider"
    assert "Mark Resolved" in provider.json()["user"]["capabilities"]


def test_login_rejects_invalid_credentials() -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "member@coopserve.org", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"