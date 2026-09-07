"""create personal service requests

Revision ID: 20260907_03
Revises: 20260906_02
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260907_03"
down_revision = "20260906_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    request_status = postgresql.ENUM(
        "pending", "assigned", "in_progress", "resolved", name="service_request_status", create_type=False
    )
    request_status.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "service_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("issue_category", sa.String(length=40), nullable=False),
        sa.Column("location", sa.String(length=120), nullable=False),
        sa.Column("urgency", sa.String(length=20), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("requester_contact", sa.String(length=255), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("status", request_status, nullable=False, server_default="pending"),
        sa.Column("assigned_to", sa.String(length=120), nullable=True),
        sa.Column("assigned_contact", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_service_requests_issue_category", "service_requests", ["issue_category"])
    op.create_index("ix_service_requests_location", "service_requests", ["location"])


def downgrade() -> None:
    op.drop_index("ix_service_requests_location", table_name="service_requests")
    op.drop_index("ix_service_requests_issue_category", table_name="service_requests")
    op.drop_table("service_requests")
    sa.Enum(name="service_request_status").drop(op.get_bind(), checkfirst=True)