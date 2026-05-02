import uuid
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.firebase_auth import verify_firebase_id_token
from app.models import SavedPlan, Trip, TripStop, User, Vehicle
from app.schemas import (
    FirebaseLoginRequest,
    LoginRequest,
    LoginResponse,
    SavedPlanCreate,
    SavedPlanRead,
    SavedPlanUpdate,
    TripCreate,
    TripRead,
    TripStopCreate,
    TripStopRead,
    TripStopUpdate,
    TripUpdate,
    UserCreate,
    UserRead,
    UserUpdate,
    VehicleCreate,
    VehicleRead,
    VehicleUpdate,
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


@app.post("/auth/firebase-login", response_model=LoginResponse)
def firebase_login(payload: FirebaseLoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    try:
        decoded_token = verify_firebase_id_token(payload.id_token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid Firebase ID token.") from exc

    firebase_uid = decoded_token.get("uid")
    phone = decoded_token.get("phone_number")
    if not firebase_uid or not phone:
        raise HTTPException(status_code=401, detail="Firebase token is missing uid or phone number.")

    user = db.scalar(select(User).where(User.firebase_uid == firebase_uid))
    if user is None:
        user = db.scalar(select(User).where(User.phone == phone))

    if user is None:
        user = User(phone=phone, firebase_uid=firebase_uid, assistant_name="Waylo")
        db.add(user)
    else:
        user.firebase_uid = firebase_uid
        user.phone = phone

    db.commit()
    db.refresh(user)
    return LoginResponse(access_token=payload.id_token, token_type="firebase", user=user)


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


@app.patch("/users/{user_id}", response_model=UserRead)
def update_user(user_id: uuid.UUID, payload: UserUpdate, db: Session = Depends(get_db)) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    if payload.active_vehicle_id:
        ensure_vehicle_belongs_to_user(db, payload.active_vehicle_id, user_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@app.post("/vehicles", response_model=VehicleRead, status_code=status.HTTP_201_CREATED)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)) -> Vehicle:
    ensure_user_exists(db, payload.user_id)
    ensure_unique_vehicle_name(db, payload.user_id, payload.vehicle_name)
    vehicle = Vehicle(**payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@app.get("/vehicles", response_model=list[VehicleRead])
def list_vehicles(user_id: uuid.UUID = Query(), db: Session = Depends(get_db)) -> list[Vehicle]:
    ensure_user_exists(db, user_id)
    query = select(Vehicle).where(Vehicle.user_id == user_id).order_by(Vehicle.created_at.desc())
    return list(db.scalars(query).all())


@app.patch("/vehicles/{vehicle_id}", response_model=VehicleRead)
def update_vehicle(vehicle_id: uuid.UUID, payload: VehicleUpdate, db: Session = Depends(get_db)) -> Vehicle:
    vehicle = db.get(Vehicle, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found.")
    if payload.vehicle_name:
        ensure_unique_vehicle_name(db, vehicle.user_id, payload.vehicle_name, exclude_vehicle_id=vehicle_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(vehicle, key, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@app.delete("/vehicles/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: uuid.UUID, db: Session = Depends(get_db)) -> None:
    vehicle = db.get(Vehicle, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found.")
    user = db.get(User, vehicle.user_id)
    if user and user.active_vehicle_id == vehicle_id:
        user.active_vehicle_id = None
    db.delete(vehicle)
    db.commit()


@app.post("/trips", response_model=TripRead, status_code=status.HTTP_201_CREATED)
def create_trip(payload: TripCreate, db: Session = Depends(get_db)) -> Trip:
    ensure_user_exists(db, payload.user_id)
    if payload.vehicle_id:
        ensure_vehicle_belongs_to_user(db, payload.vehicle_id, payload.user_id)
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
        ensure_user_exists(db, user_id)
        query = query.where(Trip.user_id == user_id)
    return list(db.scalars(query).all())


@app.patch("/trips/{trip_id}", response_model=TripRead)
def update_trip(trip_id: uuid.UUID, payload: TripUpdate, db: Session = Depends(get_db)) -> Trip:
    trip = db.get(Trip, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(trip, key, value)
    db.commit()
    db.refresh(trip)
    return trip


@app.post("/trip-stops", response_model=TripStopRead, status_code=status.HTTP_201_CREATED)
def create_trip_stop(payload: TripStopCreate, db: Session = Depends(get_db)) -> TripStop:
    ensure_trip_exists(db, payload.trip_id)
    trip_stop = TripStop(**payload.model_dump())
    db.add(trip_stop)
    db.commit()
    db.refresh(trip_stop)
    return trip_stop


@app.get("/trip-stops", response_model=list[TripStopRead])
def list_trip_stops(trip_id: uuid.UUID = Query(), db: Session = Depends(get_db)) -> list[TripStop]:
    ensure_trip_exists(db, trip_id)
    query = select(TripStop).where(TripStop.trip_id == trip_id).order_by(TripStop.distance_from_start_miles.asc())
    return list(db.scalars(query).all())


@app.patch("/trip-stops/{trip_stop_id}", response_model=TripStopRead)
def update_trip_stop(trip_stop_id: uuid.UUID, payload: TripStopUpdate, db: Session = Depends(get_db)) -> TripStop:
    trip_stop = db.get(TripStop, trip_stop_id)
    if trip_stop is None:
        raise HTTPException(status_code=404, detail="Trip stop not found.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(trip_stop, key, value)
    db.commit()
    db.refresh(trip_stop)
    return trip_stop


@app.post("/saved-plans", response_model=SavedPlanRead, status_code=status.HTTP_201_CREATED)
def create_saved_plan(payload: SavedPlanCreate, db: Session = Depends(get_db)) -> SavedPlan:
    ensure_user_exists(db, payload.user_id)
    if payload.trip_id:
        ensure_trip_belongs_to_user(db, payload.trip_id, payload.user_id)
    saved_plan = SavedPlan(**payload.model_dump())
    db.add(saved_plan)
    db.commit()
    db.refresh(saved_plan)
    return saved_plan


@app.get("/saved-plans", response_model=list[SavedPlanRead])
def list_saved_plans(user_id: uuid.UUID = Query(), db: Session = Depends(get_db)) -> list[SavedPlan]:
    ensure_user_exists(db, user_id)
    query = select(SavedPlan).where(SavedPlan.user_id == user_id).order_by(SavedPlan.created_at.desc())
    return list(db.scalars(query).all())


@app.patch("/saved-plans/{saved_plan_id}", response_model=SavedPlanRead)
def update_saved_plan(saved_plan_id: uuid.UUID, payload: SavedPlanUpdate, db: Session = Depends(get_db)) -> SavedPlan:
    saved_plan = db.get(SavedPlan, saved_plan_id)
    if saved_plan is None:
        raise HTTPException(status_code=404, detail="Saved plan not found.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(saved_plan, key, value)
    db.commit()
    db.refresh(saved_plan)
    return saved_plan


@app.delete("/saved-plans/{saved_plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_plan(saved_plan_id: uuid.UUID, db: Session = Depends(get_db)) -> None:
    saved_plan = db.get(SavedPlan, saved_plan_id)
    if saved_plan is None:
        raise HTTPException(status_code=404, detail="Saved plan not found.")
    db.delete(saved_plan)
    db.commit()


def ensure_user_exists(db: Session, user_id: uuid.UUID) -> None:
    if db.get(User, user_id) is None:
        raise HTTPException(status_code=404, detail="User not found.")


def ensure_vehicle_exists(db: Session, vehicle_id: uuid.UUID) -> None:
    if db.get(Vehicle, vehicle_id) is None:
        raise HTTPException(status_code=404, detail="Vehicle not found.")


def ensure_vehicle_belongs_to_user(db: Session, vehicle_id: uuid.UUID, user_id: uuid.UUID) -> None:
    vehicle = db.get(Vehicle, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found.")
    if vehicle.user_id != user_id:
        raise HTTPException(status_code=400, detail="Vehicle does not belong to this user.")


def ensure_trip_exists(db: Session, trip_id: uuid.UUID) -> None:
    if db.get(Trip, trip_id) is None:
        raise HTTPException(status_code=404, detail="Trip not found.")


def ensure_trip_belongs_to_user(db: Session, trip_id: uuid.UUID, user_id: uuid.UUID) -> None:
    trip = db.get(Trip, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found.")
    if trip.user_id != user_id:
        raise HTTPException(status_code=400, detail="Trip does not belong to this user.")


def ensure_unique_vehicle_name(
    db: Session,
    user_id: uuid.UUID,
    vehicle_name: str,
    exclude_vehicle_id: Optional[uuid.UUID] = None,
) -> None:
    normalized_name = vehicle_name.strip().lower()
    query = select(Vehicle).where(Vehicle.user_id == user_id)
    for vehicle in db.scalars(query).all():
        if exclude_vehicle_id and vehicle.id == exclude_vehicle_id:
            continue
        if vehicle.vehicle_name.strip().lower() == normalized_name:
            raise HTTPException(status_code=409, detail="A vehicle with this name already exists.")
