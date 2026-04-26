import os
import time
import uuid
from typing import Optional

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError


DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/waylo"),
)
os.environ["DATABASE_URL"] = DATABASE_URL


def wait_for_database() -> None:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    deadline = time.time() + 30
    last_error: Optional[Exception] = None

    while time.time() < deadline:
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return
        except OperationalError as exc:
            last_error = exc
            time.sleep(1)

    message = f"Database is not reachable at {DATABASE_URL}: {last_error}"
    if os.getenv("WAYLO_REQUIRE_DATABASE_TESTS") == "1":
        pytest.fail(message)
    pytest.skip(message)


@pytest.fixture(scope="session", autouse=True)
def migrated_database() -> None:
    wait_for_database()
    alembic_config = Config("alembic.ini")
    command.upgrade(alembic_config, "head")


@pytest.fixture()
def client() -> TestClient:
    from app.main import app

    return TestClient(app)


def test_create_user_vehicle_trip_and_get_trips_by_user(client: TestClient) -> None:
    unique_phone = f"+1555{uuid.uuid4().hex[:10]}"

    user_response = client.post(
        "/users",
        json={
            "phone": unique_phone,
            "name": "Sai",
            "assistant_name": "Waylo",
        },
    )
    assert user_response.status_code == 201
    user = user_response.json()
    assert user["phone"] == unique_phone

    vehicle_response = client.post(
        "/vehicles",
        json={
            "user_id": user["id"],
            "vehicle_name": "Toyota Camry 2021",
            "fuel_type": "gas",
            "city_mpg": 28,
            "highway_mpg": 35,
            "tank_capacity_gallons": 15.8,
        },
    )
    assert vehicle_response.status_code == 201
    vehicle = vehicle_response.json()
    assert vehicle["user_id"] == user["id"]
    assert vehicle["vehicle_name"] == "Toyota Camry 2021"

    vehicles_response = client.get("/vehicles", params={"user_id": user["id"]})
    assert vehicles_response.status_code == 200
    assert vehicles_response.json()[0]["id"] == vehicle["id"]

    vehicle_update_response = client.patch(
        f"/vehicles/{vehicle['id']}",
        json={"highway_mpg": 36},
    )
    assert vehicle_update_response.status_code == 200
    assert vehicle_update_response.json()["highway_mpg"] == 36

    trip_response = client.post(
        "/trips",
        json={
            "user_id": user["id"],
            "vehicle_id": vehicle["id"],
            "origin": "San Francisco, CA",
            "destination": "Los Angeles, CA",
            "trip_mode": "Cheapest",
            "status": "planned",
            "distance_miles": 383,
            "duration_hours": 6.75,
            "estimated_fuel_cost": 52.36,
            "estimated_savings": 14.28,
        },
    )
    assert trip_response.status_code == 201
    trip = trip_response.json()
    assert trip["user_id"] == user["id"]
    assert trip["vehicle_id"] == vehicle["id"]

    trips_response = client.get("/trips", params={"user_id": user["id"]})
    assert trips_response.status_code == 200
    trips = trips_response.json()
    assert len(trips) == 1
    assert trips[0]["id"] == trip["id"]

    saved_plan_response = client.post(
        "/saved-plans",
        json={
            "user_id": user["id"],
            "trip_id": trip["id"],
            "title": "San Francisco -> Los Angeles",
            "origin": "San Francisco, CA",
            "destination": "Los Angeles, CA",
            "trip_mode": "Cheapest",
            "notes": "Saved from the mobile app",
            "plan_payload": {"distanceMiles": 383},
        },
    )
    assert saved_plan_response.status_code == 201

    saved_plans_response = client.get("/saved-plans", params={"user_id": user["id"]})
    assert saved_plans_response.status_code == 200
    assert saved_plans_response.json()[0]["trip_id"] == trip["id"]
