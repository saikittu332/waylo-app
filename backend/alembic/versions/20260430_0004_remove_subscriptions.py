"""remove subscriptions

Revision ID: 20260430_0004
Revises: 20260426_0003
Create Date: 2026-04-30
"""
from typing import Sequence, Union

from alembic import op

revision: str = "20260430_0004"
down_revision: Union[str, None] = "20260426_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_subscriptions_user_id")
    op.execute("DROP TABLE IF EXISTS subscriptions")


def downgrade() -> None:
    pass
