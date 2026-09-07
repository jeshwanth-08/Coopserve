"""create initiatives and volunteer signups

Revision ID: 20260906_01
Revises:
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260906_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    initiative_status = postgresql.ENUM(
        "open", "in_progress", "completed", name="initiative_status", create_type=False
    )
    enum_type = postgresql.ENUM("open", "in_progress", "completed", name="initiative_status")
    enum_type.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "initiatives",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=40), nullable=False),
        sa.Column("location", sa.String(length=120), nullable=False),
        sa.Column("organizer", sa.String(length=80), nullable=False),
        sa.Column("status", initiative_status, nullable=False, server_default="open"),
        sa.Column("volunteer_goal", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("volunteer_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_initiatives_title", "initiatives", ["title"])
    op.create_index("ix_initiatives_category", "initiatives", ["category"])
    op.create_table(
        "volunteer_signups",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("initiative_id", sa.Integer(), nullable=False),
        sa.Column("volunteer_name", sa.String(length=80), nullable=False),
        sa.Column("volunteer_email", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_volunteer_signups_initiative_id", "volunteer_signups", ["initiative_id"])
    op.create_index("ix_volunteer_signups_volunteer_email", "volunteer_signups", ["volunteer_email"])


def downgrade() -> None:
    op.drop_index("ix_volunteer_signups_volunteer_email", table_name="volunteer_signups")
    op.drop_index("ix_volunteer_signups_initiative_id", table_name="volunteer_signups")
    op.drop_table("volunteer_signups")
    op.drop_index("ix_initiatives_category", table_name="initiatives")
    op.drop_index("ix_initiatives_title", table_name="initiatives")
    op.drop_table("initiatives")
    sa.Enum(name="initiative_status").drop(op.get_bind(), checkfirst=True)