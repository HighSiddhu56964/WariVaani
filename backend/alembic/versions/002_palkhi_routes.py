"""Add Route Checkpoints and Multi-Palkhi Support

Revision ID: 002_palkhi_routes
Revises: 001_initial_schema
Create Date: 2026-08-28 18:55:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "002_palkhi_routes"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add columns to palkhi table
    op.add_column("palkhi", sa.Column("route_name", sa.String(length=255), nullable=True))
    op.add_column("palkhi", sa.Column("source_year", sa.Integer(), server_default="2025", nullable=False))
    op.add_column("palkhi", sa.Column("data_type", sa.String(length=100), server_default="REFERENCE_2025", nullable=False))
    op.add_column("palkhi", sa.Column("current_checkpoint_id", sa.Integer(), nullable=True))
    op.add_column("palkhi", sa.Column("current_latitude", sa.Float(), nullable=True))
    op.add_column("palkhi", sa.Column("current_longitude", sa.Float(), nullable=True))
    op.add_column("palkhi", sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False))

    # 2. Add columns to palkhi_location table (RouteCheckpoint)
    op.add_column("palkhi_location", sa.Column("sequence_number", sa.Integer(), server_default="1", nullable=False))
    op.add_column("palkhi_location", sa.Column("arrival_date_reference", sa.String(length=100), nullable=True))
    op.add_column("palkhi_location", sa.Column("departure_date_reference", sa.String(length=100), nullable=True))
    op.add_column("palkhi_location", sa.Column("halt_type", sa.String(length=50), server_default="HALT", nullable=False))
    op.add_column("palkhi_location", sa.Column("notes", sa.Text(), nullable=True))
    op.add_column("palkhi_location", sa.Column("is_ringan", sa.Boolean(), server_default="false", nullable=False))
    op.add_column("palkhi_location", sa.Column("ringan_type", sa.String(length=100), nullable=True))
    op.add_column("palkhi_location", sa.Column("source_year", sa.Integer(), server_default="2025", nullable=False))

    # Index sequence_number
    op.create_index(op.f("ix_palkhi_location_sequence_number"), "palkhi_location", ["sequence_number"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_palkhi_location_sequence_number"), table_name="palkhi_location")
    op.drop_column("palkhi_location", "source_year")
    op.drop_column("palkhi_location", "ringan_type")
    op.drop_column("palkhi_location", "is_ringan")
    op.drop_column("palkhi_location", "notes")
    op.drop_column("palkhi_location", "halt_type")
    op.drop_column("palkhi_location", "departure_date_reference")
    op.drop_column("palkhi_location", "arrival_date_reference")
    op.drop_column("palkhi_location", "sequence_number")

    op.drop_column("palkhi", "updated_at")
    op.drop_column("palkhi", "current_longitude")
    op.drop_column("palkhi", "current_latitude")
    op.drop_column("palkhi", "current_checkpoint_id")
    op.drop_column("palkhi", "data_type")
    op.drop_column("palkhi", "source_year")
    op.drop_column("palkhi", "route_name")
