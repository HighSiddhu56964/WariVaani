"""Initial Schema Creation with PostGIS Support

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-25 18:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enable PostGIS Extension
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    # 2. Create Palkhi Table
    op.create_table(
        "palkhi",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("saint_name", sa.String(length=255), nullable=False),
        sa.Column("source", sa.String(length=100), nullable=False, server_default="GOVERNMENT_REFERENCE"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index(op.f("ix_palkhi_id"), "palkhi", ["id"], unique=False)

    # 3. Create PalkhiLocation Table
    op.create_table(
        "palkhi_location",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("palkhi_id", sa.Integer(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("location_name", sa.String(length=255), nullable=False),
        sa.Column("next_checkpoint", sa.String(length=255), nullable=True),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("data_type", sa.String(length=50), nullable=False, server_default="SIMULATED"),
        sa.Column("location_geom", Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True),
        sa.ForeignKeyConstraint(["palkhi_id"], ["palkhi.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index(op.f("ix_palkhi_location_id"), "palkhi_location", ["id"], unique=False)
    op.create_index(op.f("ix_palkhi_location_palkhi_id"), "palkhi_location", ["palkhi_id"], unique=False)

    # 4. Create Facility Table
    op.create_table(
        "facility",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("type", sa.String(length=100), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("landmark", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="ACTIVE"),
        sa.Column("source", sa.String(length=100), nullable=False, server_default="DEMO_DATA"),
        sa.Column("source_url", sa.Text(), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("location_geom", Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index(op.f("ix_facility_id"), "facility", ["id"], unique=False)
    op.create_index(op.f("ix_facility_type"), "facility", ["type"], unique=False)

    # 5. Create MissingPerson Table
    op.create_table(
        "missing_person",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("ticket_id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("age", sa.Integer(), nullable=False),
        sa.Column("clothing", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("last_seen_location", sa.String(length=255), nullable=False),
        sa.Column("last_seen_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("contact", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="OPEN"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index(op.f("ix_missing_person_id"), "missing_person", ["id"], unique=False)
    op.create_index(op.f("ix_missing_person_ticket_id"), "missing_person", ["ticket_id"], unique=True)
    op.create_index(op.f("ix_missing_person_status"), "missing_person", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_missing_person_status"), table_name="missing_person")
    op.drop_index(op.f("ix_missing_person_ticket_id"), table_name="missing_person")
    op.drop_index(op.f("ix_missing_person_id"), table_name="missing_person")
    op.drop_table("missing_person")

    op.drop_index(op.f("ix_facility_type"), table_name="facility")
    op.drop_index(op.f("ix_facility_id"), table_name="facility")
    op.drop_table("facility")

    op.drop_index(op.f("ix_palkhi_location_palkhi_id"), table_name="palkhi_location")
    op.drop_index(op.f("ix_palkhi_location_id"), table_name="palkhi_location")
    op.drop_table("palkhi_location")

    op.drop_index(op.f("ix_palkhi_id"), table_name="palkhi")
    op.drop_table("palkhi")
