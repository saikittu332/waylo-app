import uuid
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import SavedPlan, Subscription, Trip, User, Vehicle
from app.schemas import (
    LoginRequest,
    LoginResponse,
    SavedPlanCreate,
    SavedPlanRead,
    SubscriptionCreate,
    SubscriptionRead,
    TripCreate,
    TripRead,
    UserCreate,
    UserRead,
    VehicleCreate,
    VehicleRead,
)

app = FastAPI(title=settings.api_title)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.app_env}


@app.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    user = db.scalar(select(User).where(User.phone == payload.phone))
    if user is None:
        user = User(phone=payload.phone, assistant_name="Waylo")
        db.add(user)
        db.commit()
        db.refresh(user)

    # Placeholder token until Firebase/JWT auth is integrated.
    return LoginResponse(access_token=f"mock-token-{user.id}", user=user)


@app.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    user = User(**payload.model_dump())
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="A user with this phone already exists.") from exc
    db.refresh(user)
    return user


@app.post("/vehicles", response_model=VehicleRead, status_code=status.HTTP_201_CREATED)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)) -> Vehicle:
    ensure_user_exists(db, payload.user_id)
    vehicle = Vehicle(**payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@app.post("/trips", response_model=TripRead, status_code=status.HTTP_201_CREATED)
def create_trip(payload: TripCreate, db: Session = Depends(get_db)) -> Trip:
    ensure_user_exists(db, payload.user_id)
    if payload.vehicle_id:
        ensure_vehicle_exists(db, payload.vehicle_id)
    trip = Trip(**payload.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@app.get("/trips", response_model=list[TripRead])
def list_trips(
    user_id: Optional[uuid.UUID] = Query(default=None),
    db: Session = Depends(get_db),
) -> list[Trip]:
    query = select(Trip).order_by(Trip.created_at.desc())
    if user_id:
        query = query.where(Trip.user_id == user_id)
    return list(db.scalars(query).all())


@app.post("/saved-plans", response_model=SavedPlanRead, status_code=status.HTTP_201_CREATED)
def create_saved_plan(payload: SavedPlanCreate, db: Session = Depends(get_db)) -> SavedPlan:
    ensure_user_exists(db, payload.user_id)
    if payload.trip_id:
        ensure_trip_exists(db, payload.trip_id)
    saved_plan = SavedPlan(**payload.model_dump())
    db.add(saved_plan)
    db.commit()
    db.refresh(saved_plan)
    return saved_plan


@app.post("/subscriptions", response_model=SubscriptionRead, status_code=status.HTTP_201_CREATED)
def create_subscription(payload: SubscriptionCreate, db: Session = Depends(get_db)) -> Subscription:
    ensure_user_exists(db, payload.user_id)
    subscription = Subscription(**payload.model_dump())
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


def ensure_user_exists(db: Session, user_id: uuid.UUID) -> None:
    if db.get(User, user_id) is None:
        raise HTTPException(status_code=404, detail="User not found.")


def ensure_vehicle_exists(db: Session, vehicle_id: uuid.UUID) -> None:
    if db.get(Vehicle, vehicle_id) is None:
        raise HTTPException(status_code=404, detail="Vehicle not found.")


def ensure_trip_exists(db: Session, trip_id: uuid.UUID) -> None:
    if db.get(Trip, trip_id) is None:
        raise HTTPException(status_code=404, detail="Trip not found.")
