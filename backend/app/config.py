from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = Field(default="development", validation_alias="WAYLO_ENV")
    api_title: str = Field(default="Waylo API", validation_alias="WAYLO_API_TITLE")
    firebase_service_account_path: str = Field(
        default="./firebase-service-account.json",
        validation_alias="FIREBASE_SERVICE_ACCOUNT_PATH",
    )
    firebase_service_account_json: str = Field(default="", validation_alias="FIREBASE_SERVICE_ACCOUNT_JSON")
    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/waylo",
        validation_alias="DATABASE_URL",
    )
    cors_origins: str = Field(default="*", validation_alias="CORS_ORIGINS")

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+psycopg://", 1)
        if self.database_url.startswith("postgres://"):
            return self.database_url.replace("postgres://", "postgresql+psycopg://", 1)
        return self.database_url

    @property
    def cors_origin_list(self) -> list[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
