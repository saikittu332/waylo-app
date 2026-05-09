import json
from pathlib import Path
from typing import Any

import firebase_admin
from firebase_admin import auth, credentials

from app.config import settings


def initialize_firebase() -> None:
    if firebase_admin._apps:
        return

    if settings.firebase_service_account_json.strip():
        try:
            service_account_info = json.loads(settings.firebase_service_account_json)
        except json.JSONDecodeError as exc:
            raise RuntimeError("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.") from exc

        firebase_admin.initialize_app(credentials.Certificate(service_account_info))
        return

    service_account_path = Path(settings.firebase_service_account_path)
    if not service_account_path.is_absolute():
        service_account_path = Path.cwd() / service_account_path

    if not service_account_path.exists():
        raise RuntimeError(
            "Firebase service account was not found. "
            "Set FIREBASE_SERVICE_ACCOUNT_JSON in hosted environments or "
            "FIREBASE_SERVICE_ACCOUNT_PATH for local file-based development."
        )

    firebase_admin.initialize_app(credentials.Certificate(service_account_path))


def verify_firebase_id_token(id_token: str) -> dict[str, Any]:
    initialize_firebase()
    return auth.verify_id_token(id_token)
