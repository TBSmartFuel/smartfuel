"""add user approval status

Revision ID: 9c86d8c37b3a
Revises: e2c0e7ab95f7
Create Date: 2023-12-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9c86d8c37b3a'
down_revision: Union[str, None] = 'e2c0e7ab95f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add is_approved column with default value False
    op.add_column('users', sa.Column('is_approved', sa.Boolean(), nullable=False, server_default='false'))
    
    # Set existing admin users to approved
    op.execute("UPDATE users SET is_approved = true WHERE is_admin = true")


def downgrade() -> None:
    # Remove is_approved column
    op.drop_column('users', 'is_approved')
