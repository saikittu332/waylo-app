import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

FUEL_TYPES = {"gas", "diesel", "hybrid", "ev"}
TRIP_MODES = {"Fastest", "Cheapest", "Scenic", "Comfort"}
TRIP_STATUSES = {"planned", "active", "completed", "cancelled"}
STOP_DECISIONS = {"recommended", "added", "skipped"}


def clean_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    return " ".join(value.strip().split())


class UserCreate(BaseModel):
    phone: str = Field(min_length=7, max_length=32)
    firebase_uid: Optional[str] = None
    name: Optional[str] = None
    assistant_name: str = "Waylo"
    active_vehicle_id: Optional[uuid.UUID] = None
    fuel_savings_alerts: bool = True
    rest_reminders_enabled: bool = True
    rest_reminder_hours: float = Field(default=2.5, ge=1.0, le=6.0)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        digits = "".join(character for character in value if character.isdigit())
        if len(digits) < 10:
            raise ValueError("Phone number must include at least 10 digits.")
        return value

    @field_validator("name", "assistant_name")
    @classmethod
    def normalize_names(cls, value: Optional[str]) -> Optional[str]:
        return clean_text(value)


class UserUpdate(BaseModel):
    name: Optional[str] = None
    assistant_name: Optional[str] = None
    active_vehicle_id: Optional[uuid.UUID] = None
    fuel_savings_alerts: Optional[bool] = None
    rest_reminders_enabled: Optional[bool] = None
    rest_reminder_hours: Optional[float] = Field(default=None, ge=1.0, le=6.0)

    @field_validator("name", "assistant_name")
    @classmethod
    def normalize_names(cls, value: Optional[str]) -> Optional[str]:
        return clean_text(value)


class UserRead(UserCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    phone: str
    otp_code: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        digits = "".join(character for character in value if character.isdigit())
        if len(digits) < 10:
            raise ValueError("Phone number must include at least 10 digits.")
        return value


class FirebaseLoginRequest(BaseModel):
    id_token: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class VehicleCreate(BaseModel):
    user_id: uuid.UUID
    vehicle_name: str = Field(min_length=2, max_length=160)
    fuel_type: str = "gas"
    city_mpg: Optional[float] = Field(default=None, ge=0, le=250)
    highway_mpg: Optional[float] = Field(default=None, ge=0, le=250)
    tank_capacity_gallons: Optional[float] = Field(default=None, ge=0, le=80)

    @field_validator("vehicle_name")
    @classmethod
    def normalize_vehicle_name(cls, value: str) -> str:
        return clean_text(value) or value

    @field_validator("fuel_type")
    @classmethod
    def validate_fuel_type(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in FUEL_TYPES:
            raise ValueError("Fuel type must be gas, diesel, hybrid, or EV.")
        return "EV" if normalized == "ev" else normalized


class VehicleUpdate(BaseModel):
    vehicle_name: Optional[str] = Field(default=None, min_length=2, max_length=160)
    fuel_type: Optional[str] = None
    city_mpg: Optional[float] = Field(default=None, ge=0, le=250)
    highway_mpg: Optional[float] = Field(default=None, ge=0, le=250)
    tank_capacity_gallons: Optional[float] = Field(default=None, ge=0, le=80)

    @field_validator("vehicle_name")
    @classmethod
    def normalize_vehicle_name(cls, value: Optional[str]) -> Optional[str]:
        return clean_text(value)

    @field_validator("fuel_type")
    @classmethod
    def validate_fuel_type(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        normalized = value.strip().lower()
        if normalized not in FUEL_TYPES:
            raise ValueError("Fuel type must be gas, diesel, hybrid, or EV.")
        return "EV" if normalized == "ev" else normalized


class VehicleRead(VehicleCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TripCreate(BaseModel):
    user_id: uuid.UUID
    vehicle_id: Optional[uuid.UUID] = None
    origin: str
    destination: str
    trip_mode: str = "Cheapest"
    status: str = "planned"
    distance_miles: Optional[float] = None
    duration_hours: Optional[float] = None
    estimated_fuel_cost: Optional[float] = None
    estimated_savings: Optional[float] = None

    @field_validator("origin", "destination")
    @classmethod
    def normalize_places(cls, value: str) -> str:
        return clean_text(value) or value

    @field_validator("trip_mode")
    @classmethod
    def validate_trip_mode(cls, value: str) -> str:
        if value not in TRIP_MODES:
            raise ValueError("Trip mode must be Fastest, Cheapest, Scenic, or Comfort.")
        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value not in TRIP_STATUSES:
            raise ValueError("Trip status must be planned, active, completed, or cancelled.")
        return value


class TripUpdate(BaseModel):
    status: Optional[str] = None
    distance_miles: Optional[float] = None
    duration_hours: Optional[float] = None
    estimated_fuel_cost: Optional[float] = None
    estimated_savings: Optional[float] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in TRIP_STATUSES:
            raise ValueError("Trip status must be planned, active, completed, or cancelled.")
        return value


class TripRead(TripCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TripStopCreate(BaseModel):
    trip_id: uuid.UUID
    stop_type: str
    name: str = Field(min_length=2, max_length=180)
    address: Optional[str] = None
    distance_from_start_miles: Optional[float] = Field(default=None, ge=0)
    distance_from_current_miles: Optional[float] = Field(default=None, ge=0)
    rating: Optional[float] = Field(default=None, ge=0, le=5)
    fuel_price: Optional[float] = Field(default=None, ge=0)
    decision: str = "recommended"
    recommendation: Optional[str] = None
    stop_payload: dict[str, Any] = Field(default_factory=dict)

    @field_validator("stop_type")
    @classmethod
    def validate_stop_type(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in {"fuel", "rest", "food", "scenic"}:
            raise ValueError("Stop type must be fuel, rest, food, or scenic.")
        return normalized

    @field_validator("decision")
    @classmethod
    def validate_decision(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in STOP_DECISIONS:
            raise ValueError("Stop decision must be recommended, added, or skipped.")
        return normalized


class TripStopUpdate(BaseModel):
    decision: Optional[str] = None
    recommendation: Optional[str] = None
    stop_payload: Optional[dict[str, Any]] = None

    @field_validator("decision")
    @classmethod
    def validate_decision(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        normalized = value.strip().lower()
        if normalized not in STOP_DECISIONS:
            raise ValueError("Stop decision must be recommended, added, or skipped.")
        return normalized


class TripStopRead(TripStopCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SavedPlanCreate(BaseModel):
    user_id: uuid.UUID
    trip_id: Optional[uuid.UUID] = None
    title: str
    origin: str
    destination: str
    trip_mode: str = "Cheapest"
    notes: Optional[str] = None
    plan_payload: dict[str, Any] = Field(default_factory=dict)

    @field_validator("title", "origin", "destination")
    @classmethod
    def normalize_saved_plan_text(cls, value: str) -> str:
        return clean_text(value) or value

    @field_validator("trip_mode")
    @classmethod
    def validate_trip_mode(cls, value: str) -> str:
        if value not in TRIP_MODES:
            raise ValueError("Trip mode must be Fastest, Cheapest, Scenic, or Comfort.")
        return value


class SavedPlanUpdate(BaseModel):
    title: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    trip_mode: Optional[str] = None
    notes: Optional[str] = None
    plan_payload: Optional[dict[str, Any]] = None

    @field_validator("title", "origin", "destination")
    @classmethod
    def normalize_saved_plan_text(cls, value: Optional[str]) -> Optional[str]:
        return clean_text(value)

    @field_validator("trip_mode")
    @classmethod
    def validate_trip_mode(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in TRIP_MODES:
            raise ValueError("Trip mode must be Fastest, Cheapest, Scenic, or Comfort.")
        return value


class SavedPlanRead(SavedPlanCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
