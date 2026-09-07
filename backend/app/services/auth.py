import base64
import hashlib
import hmac
import json
import time
from dataclasses import dataclass

from app.core.config import get_settings


@dataclass(frozen=True)
class AuthenticatedUser:
    email: str
    name: str
    role: str
    capabilities: list[str]


CAPABILITIES = {
    "admin": [
        "View All Requests",
        "Assign Service Provider",
        "Update Status",
        "Manage Providers",
        "Dashboard Analytics",
    ],
    "service_provider": [
        "View Assigned Requests",
        "Accept Request",
        "Update Progress",
        "Mark Resolved",
        "View Ratings",
    ],
    "member": [
        "Create Service Request",
        "View My Requests",
        "Track Status",
        "Rate Service",
    ],
}


def find_user(email: str, password: str) -> AuthenticatedUser | None:
    settings = get_settings()
    accounts = {
        settings.demo_admin_email: (settings.demo_admin_password, "CoopServe admin", "admin"),
        settings.demo_provider_email: (
            settings.demo_provider_password,
            "CoopServe service provider",
            "service_provider",
        ),
        settings.demo_user_email: (settings.demo_user_password, "CoopServe member", "member"),
    }
    account = next(
        (
            (account_email, account_details)
            for account_email, account_details in accounts.items()
            if hmac.compare_digest(email.lower(), account_email.lower())
        ),
        None,
    )
    if account is None or not hmac.compare_digest(password, account[1][0]):
        return None
    account_email, (_, name, role) = account
    return AuthenticatedUser(account_email, name, role, CAPABILITIES[role])


def authenticate(email: str, password: str) -> bool:
    return find_user(email, password) is not None


def create_access_token(user: AuthenticatedUser) -> str:
    settings = get_settings()
    payload = {
        "sub": user.email.lower(),
        "role": user.role,
        "exp": int(time.time()) + settings.auth_token_ttl_seconds,
    }
    encoded_payload = _encode(json.dumps(payload, separators=(",", ":")).encode())
    signature = hmac.new(
        settings.auth_token_secret.encode(), encoded_payload.encode(), hashlib.sha256
    ).digest()
    return f"{encoded_payload}.{_encode(signature)}"


def _encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode().rstrip("=")