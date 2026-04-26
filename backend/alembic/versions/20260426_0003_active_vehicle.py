"""add active vehicle to users

Revision ID: 20260426_0003
Revises: 20260426_0002
Create Date: 2026-04-26
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260426_0003"
down_revision: Union[str, None] = "20260426_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("active_vehicle_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(
        op.f("fk_users_active_vehicle_id_vehicles"),
        "users",
        "vehicles",
        ["active_vehicle_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(op.f("fk_users_active_vehicle_id_vehicles"), "users", type_="foreignkey")
    op.drop_column("users", "active_vehicle_id")
