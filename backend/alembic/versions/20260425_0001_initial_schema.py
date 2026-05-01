"""initial schema

Revision ID: 20260425_0001
Revises:
Create Date: 2026-04-25
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260425_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("phone", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=True),
        sa.Column("assistant_name", sa.String(length=80), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("phone"),
    )
    op.create_index(op.f("ix_users_phone"), "users", ["phone"], unique=False)

    op.create_table(
        "vehicles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("vehicle_name", sa.String(length=160), nullable=False),
        sa.Column("fuel_type", sa.String(length=40), nullable=False),
        sa.Column("city_mpg", sa.Float(), nullable=True),
        sa.Column("highway_mpg", sa.Float(), nullable=True),
        sa.Column("tank_capacity_gallons", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_vehicles_user_id"), "vehicles", ["user_id"], unique=False)

    op.create_table(
        "trips",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("vehicle_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("origin", sa.String(length=240), nullable=False),
        sa.Column("destination", sa.String(length=240), nullable=False),
        sa.Column("trip_mode", sa.String(length=40), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("distance_miles", sa.Float(), nullable=True),
        sa.Column("duration_hours", sa.Float(), nullable=True),
        sa.Column("estimated_fuel_cost", sa.Float(), nullable=True),
        sa.Column("estimated_savings", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicles.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_trips_user_id"), "trips", ["user_id"], unique=False)

    op.create_table(
        "saved_plans",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("origin", sa.String(length=240), nullable=False),
        sa.Column("destination", sa.String(length=240), nullable=False),
        sa.Column("trip_mode", sa.String(length=40), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("plan_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["trip_id"], ["trips.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_saved_plans_user_id"), "saved_plans", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_saved_plans_user_id"), table_name="saved_plans")
    op.drop_table("saved_plans")
    op.drop_index(op.f("ix_trips_user_id"), table_name="trips")
    op.drop_table("trips")
    op.drop_index(op.f("ix_vehicles_user_id"), table_name="vehicles")
    op.drop_table("vehicles")
    op.drop_index(op.f("ix_users_phone"), table_name="users")
    op.drop_table("users")
