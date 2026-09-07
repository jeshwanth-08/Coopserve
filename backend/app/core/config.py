from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CoopServe API"
    debug: bool = False
    database_url: str = "postgresql+asyncpg://coopserve:coopserve@localhost:5432/coopserve"
    cors_origins: str = "http://localhost:5173"
    demo_user_email: str = "member@coopserve.org"
    demo_user_password: str = "coopserve"
    demo_admin_email: str = "admin@coopserve.org"
    demo_admin_password: str = "coopserve-admin"
    demo_provider_email: str = "provider@coopserve.org"
    demo_provider_password: str = "coopserve-provider"
    auth_token_secret: str = "change-this-coopserve-secret"
    auth_token_ttl_seconds: int = 60 * 60 * 8

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
