"""seed demo initiatives

Revision ID: 20260906_02
Revises: 20260906_01
"""

from datetime import datetime, timezone

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260906_02"
down_revision = "20260906_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    initiatives = sa.table(
        "initiatives",
        sa.column("title", sa.String),
        sa.column("description", sa.Text),
        sa.column("category", sa.String),
        sa.column("location", sa.String),
        sa.column("organizer", sa.String),
        sa.column(
            "status",
            postgresql.ENUM(
                "open", "in_progress", "completed", name="initiative_status", create_type=False
            ),
        ),
        sa.column("volunteer_goal", sa.Integer),
        sa.column("volunteer_count", sa.Integer),
        sa.column("created_at", sa.DateTime(timezone=True)),
    )
    op.bulk_insert(initiatives, [
        {"title": "Fix the leaking tap in Room 204", "description": "The tap has been overflowing since this morning and needs a local repair volunteer.", "category": "Community care", "location": "Block B, Room 204", "organizer": "Resident association", "status": "open", "volunteer_goal": 1, "volunteer_count": 0, "created_at": datetime(2026, 9, 5, tzinfo=timezone.utc)},
        {"title": "Restore the lake edge", "description": "Clear plastic waste and plant native reeds around the north bank.", "category": "Environment", "location": "Vijayanagar", "organizer": "Asha Collective", "status": "open", "volunteer_goal": 30, "volunteer_count": 18, "created_at": datetime(2026, 9, 5, tzinfo=timezone.utc)},
        {"title": "Saturday study circle", "description": "A weekly reading and maths circle for children in grades 5 to 8.", "category": "Education", "location": "Rajajinagar", "organizer": "Maya Foundation", "status": "in_progress", "volunteer_goal": 12, "volunteer_count": 9, "created_at": datetime(2026, 9, 4, tzinfo=timezone.utc)},
    ])


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM initiatives WHERE title IN ('Fix the leaking tap in Room 204', 'Restore the lake edge', 'Saturday study circle')"))