import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


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


class UserUpdate(BaseModel):
    name: Optional[str] = None
    assistant_name: Optional[str] = None
    active_vehicle_id: Optional[uuid.UUID] = None
    fuel_savings_alerts: Optional[bool] = None
    rest_reminders_enabled: Optional[bool] = None
    rest_reminder_hours: Optional[float] = Field(default=None, ge=1.0, le=6.0)


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


class VehicleUpdate(BaseModel):
    vehicle_name: Optional[str] = Field(default=None, min_length=2, max_length=160)
    fuel_type: Optional[str] = None
    city_mpg: Optional[float] = Field(default=None, ge=0, le=250)
    highway_mpg: Optional[float] = Field(default=None, ge=0, le=250)
    tank_capacity_gallons: Optional[float] = Field(default=None, ge=0, le=80)


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


class TripUpdate(BaseModel):
    status: Optional[str] = None
    distance_miles: Optional[float] = None
    duration_hours: Optional[float] = None
    estimated_fuel_cost: Optional[float] = None
    estimated_savings: Optional[float] = None


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


class TripStopUpdate(BaseModel):
    decision: Optional[str] = None
    recommendation: Optional[str] = None
    stop_payload: Optional[dict[str, Any]] = None


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


class SavedPlanUpdate(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None
    plan_payload: Optional[dict[str, Any]] = None


class SavedPlanRead(SavedPlanCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
