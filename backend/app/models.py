import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firebase_uid: Mapped[Optional[str]] = mapped_column(String(128), unique=True, index=True, nullable=True)
    phone: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    name: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    assistant_name: Mapped[str] = mapped_column(String(80), default="Waylo")
    active_vehicle_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True)
    fuel_savings_alerts: Mapped[bool] = mapped_column(Boolean, default=True)
    rest_reminders_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    rest_reminder_hours: Mapped[float] = mapped_column(Float, default=2.5)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    vehicles: Mapped[list["Vehicle"]] = relationship(back_populates="user", cascade="all, delete-orphan", foreign_keys="Vehicle.user_id")
    trips: Mapped[list["Trip"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    saved_plans: Mapped[list["SavedPlan"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    vehicle_name: Mapped[str] = mapped_column(String(160))
    fuel_type: Mapped[str] = mapped_column(String(40), default="gas")
    city_mpg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    highway_mpg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    tank_capacity_gallons: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="vehicles", foreign_keys=[user_id])
    trips: Mapped[list["Trip"]] = relationship(back_populates="vehicle")


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    vehicle_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True)
    origin: Mapped[str] = mapped_column(String(240))
    destination: Mapped[str] = mapped_column(String(240))
    trip_mode: Mapped[str] = mapped_column(String(40), default="Cheapest")
    status: Mapped[str] = mapped_column(String(40), default="planned")
    distance_miles: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    duration_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    estimated_fuel_cost: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    estimated_savings: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="trips")
    vehicle: Mapped[Optional["Vehicle"]] = relationship(back_populates="trips")
    saved_plans: Mapped[list["SavedPlan"]] = relationship(back_populates="trip")
    stops: Mapped[list["TripStop"]] = relationship(back_populates="trip", cascade="all, delete-orphan")


class TripStop(Base):
    __tablename__ = "trip_stops"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    stop_type: Mapped[str] = mapped_column(String(40))
    name: Mapped[str] = mapped_column(String(180))
    address: Mapped[Optional[str]] = mapped_column(String(240), nullable=True)
    distance_from_start_miles: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    distance_from_current_miles: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fuel_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    decision: Mapped[str] = mapped_column(String(40), default="recommended")
    recommendation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    stop_payload: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    trip: Mapped[Trip] = relationship(back_populates="stops")


class SavedPlan(Base):
    __tablename__ = "saved_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    trip_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(180))
    origin: Mapped[str] = mapped_column(String(240))
    destination: Mapped[str] = mapped_column(String(240))
    trip_mode: Mapped[str] = mapped_column(String(40), default="Cheapest")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    plan_payload: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="saved_plans")
    trip: Mapped[Optional["Trip"]] = relationship(back_populates="saved_plans")
