"""merge_multiple_heads

Revision ID: 8ecce8f969b4
Revises: 9c86d8c37b3a, create_system_prompts
Create Date: 2025-01-09 06:46:40.793068

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8ecce8f969b4'
down_revision: Union[str, None] = ('9c86d8c37b3a', 'create_system_prompts')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
