"""add trip stops

Revision ID: 20260430_0006
Revises: 20260430_0005
Create Date: 2026-04-30
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260430_0006"
down_revision: Union[str, None] = "20260430_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "trip_stops",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("stop_type", sa.String(length=40), nullable=False),
        sa.Column("name", sa.String(length=180), nullable=False),
        sa.Column("address", sa.String(length=240), nullable=True),
        sa.Column("distance_from_start_miles", sa.Float(), nullable=True),
        sa.Column("distance_from_current_miles", sa.Float(), nullable=True),
        sa.Column("rating", sa.Float(), nullable=True),
        sa.Column("fuel_price", sa.Float(), nullable=True),
        sa.Column("decision", sa.String(length=40), nullable=False),
        sa.Column("recommendation", sa.Text(), nullable=True),
        sa.Column("stop_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["trip_id"], ["trips.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_trip_stops_trip_id"), "trip_stops", ["trip_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_trip_stops_trip_id"), table_name="trip_stops")
    op.drop_table("trip_stops")
