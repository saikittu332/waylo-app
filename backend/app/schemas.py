import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    phone: str = Field(min_length=7, max_length=32)
    name: str | None = None
    assistant_name: str = "Waylo"


class UserRead(UserCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    phone: str
    otp_code: str | None = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class VehicleCreate(BaseModel):
    user_id: uuid.UUID
    vehicle_name: str
    fuel_type: str = "gas"
    city_mpg: float | None = None
    highway_mpg: float | None = None
    tank_capacity_gallons: float | None = None


class VehicleRead(VehicleCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TripCreate(BaseModel):
    user_id: uuid.UUID
    vehicle_id: uuid.UUID | None = None
    origin: str
    destination: str
    trip_mode: str = "Cheapest"
    status: str = "planned"
    distance_miles: float | None = None
    duration_hours: float | None = None
    estimated_fuel_cost: float | None = None
    estimated_savings: float | None = None


class TripRead(TripCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SavedPlanCreate(BaseModel):
    user_id: uuid.UUID
    trip_id: uuid.UUID | None = None
    title: str
    origin: str
    destination: str
    trip_mode: str = "Cheapest"
    notes: str | None = None
    plan_payload: dict[str, Any] = Field(default_factory=dict)


class SavedPlanRead(SavedPlanCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubscriptionCreate(BaseModel):
    user_id: uuid.UUID
    plan_name: str = "Free"
    status: str = "active"
    is_premium: bool = False
    current_period_end: datetime | None = None


class SubscriptionRead(SubscriptionCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
