import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    phone: str = Field(min_length=7, max_length=32)
    firebase_uid: Optional[str] = None
    name: Optional[str] = None
    assistant_name: str = "Waylo"
    active_vehicle_id: Optional[uuid.UUID] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    assistant_name: Optional[str] = None
    active_vehicle_id: Optional[uuid.UUID] = None


class UserRead(UserCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    phone: str
    otp_code: Optional[str] = None


class FirebaseLoginRequest(BaseModel):
    id_token: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class VehicleCreate(BaseModel):
    user_id: uuid.UUID
    vehicle_name: str
    fuel_type: str = "gas"
    city_mpg: Optional[float] = None
    highway_mpg: Optional[float] = None
    tank_capacity_gallons: Optional[float] = None


class VehicleUpdate(BaseModel):
    vehicle_name: Optional[str] = None
    fuel_type: Optional[str] = None
    city_mpg: Optional[float] = None
    highway_mpg: Optional[float] = None
    tank_capacity_gallons: Optional[float] = None


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

