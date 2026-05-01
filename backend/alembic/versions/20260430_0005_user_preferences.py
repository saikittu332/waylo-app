"""add user planning preferences

Revision ID: 20260430_0005
Revises: 20260430_0004
Create Date: 2026-04-30
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260430_0005"
down_revision: Union[str, None] = "20260430_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("fuel_savings_alerts", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column("users", sa.Column("rest_reminders_enabled", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column("users", sa.Column("rest_reminder_hours", sa.Float(), nullable=False, server_default="2.5"))
    op.alter_column("users", "fuel_savings_alerts", server_default=None)
    op.alter_column("users", "rest_reminders_enabled", server_default=None)
    op.alter_column("users", "rest_reminder_hours", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "rest_reminder_hours")
    op.drop_column("users", "rest_reminders_enabled")
    op.drop_column("users", "fuel_savings_alerts")
