from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = Field(default="development", validation_alias="WAYLO_ENV")
    api_title: str = Field(default="Waylo API", validation_alias="WAYLO_API_TITLE")
    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/waylo",
        validation_alias="DATABASE_URL",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()
