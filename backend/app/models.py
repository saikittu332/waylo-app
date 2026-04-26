import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    assistant_name: Mapped[str] = mapped_column(String(80), default="Waylo")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    vehicles: Mapped[list["Vehicle"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    trips: Mapped[list["Trip"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    saved_plans: Mapped[list["SavedPlan"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    subscriptions: Mapped[list["Subscription"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    vehicle_name: Mapped[str] = mapped_column(String(160))
    fuel_type: Mapped[str] = mapped_column(String(40), default="gas")
    city_mpg: Mapped[float | None] = mapped_column(Float, nullable=True)
    highway_mpg: Mapped[float | None] = mapped_column(Float, nullable=True)
    tank_capacity_gallons: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="vehicles")
    trips: Mapped[list["Trip"]] = relationship(back_populates="vehicle")


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    vehicle_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True)
    origin: Mapped[str] = mapped_column(String(240))
    destination: Mapped[str] = mapped_column(String(240))
    trip_mode: Mapped[str] = mapped_column(String(40), default="Cheapest")
    status: Mapped[str] = mapped_column(String(40), default="planned")
    distance_miles: Mapped[float | None] = mapped_column(Float, nullable=True)
    duration_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_fuel_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_savings: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="trips")
    vehicle: Mapped[Vehicle | None] = relationship(back_populates="trips")
    saved_plans: Mapped[list["SavedPlan"]] = relationship(back_populates="trip")


class SavedPlan(Base):
    __tablename__ = "saved_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    trip_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(180))
    origin: Mapped[str] = mapped_column(String(240))
    destination: Mapped[str] = mapped_column(String(240))
    trip_mode: Mapped[str] = mapped_column(String(40), default="Cheapest")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    plan_payload: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="saved_plans")
    trip: Mapped[Trip | None] = relationship(back_populates="saved_plans")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    plan_name: Mapped[str] = mapped_column(String(80), default="Free")
    status: Mapped[str] = mapped_column(String(40), default="active")
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    current_period_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="subscriptions")
