from pathlib import Path
from typing import Any

import firebase_admin
from firebase_admin import auth, credentials

from app.config import settings


def initialize_firebase() -> None:
    if firebase_admin._apps:
        return

    service_account_path = Path(settings.firebase_service_account_path)
    if not service_account_path.is_absolute():
        service_account_path = Path.cwd() / service_account_path

    if not service_account_path.exists():
        raise RuntimeError(
            "Firebase service account file was not found. "
            "Set FIREBASE_SERVICE_ACCOUNT_PATH to your local service account JSON path."
        )

    firebase_admin.initialize_app(credentials.Certificate(service_account_path))


def verify_firebase_id_token(id_token: str) -> dict[str, Any]:
    initialize_firebase()
    return auth.verify_id_token(id_token)
