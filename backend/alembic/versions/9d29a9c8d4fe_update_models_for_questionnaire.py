"""update_models_for_questionnaire

Revision ID: 9d29a9c8d4fe
Revises: e5952928fed2
Create Date: 2024-12-25 20:57:19.853567

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '9d29a9c8d4fe'
down_revision: Union[str, None] = 'e5952928fed2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create ENUM types first
    question_category = postgresql.ENUM('PERSONAL_INFO', 'GOALS', 'FOOD_INTAKE', 'WORKOUT_ROUTINE', 
                                      'STRESS_LEVELS', 'TOXICITY_LIFESTYLE', 'WAIVER', 
                                      name='questioncategory')
    question_category.create(op.get_bind())

    question_type = postgresql.ENUM('TEXT', 'NUMBER', 'BOOLEAN', 'MULTIPLE_CHOICE', 'SLIDER', 
                                  'RADIO', 'CHECKBOX', name='questiontype')
    question_type.create(op.get_bind())

    # Then proceed with other changes
    op.add_column('meal_plans', sa.Column('updated_at', sa.DateTime(), nullable=True))
    op.add_column('meal_plans', sa.Column('is_active', sa.Boolean(), nullable=True))
    op.add_column('meal_plans', sa.Column('start_date', sa.DateTime(), nullable=False))
    op.add_column('meal_plans', sa.Column('end_date', sa.DateTime(), nullable=True))
    op.alter_column('meal_plans', 'user_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.alter_column('meal_plans', 'plan_data',
               existing_type=postgresql.JSON(astext_type=sa.Text()),
               nullable=False)
    op.add_column('questions', sa.Column('validation', sa.JSON(), nullable=True))
    op.add_column('questions', sa.Column('parent_id', sa.Integer(), nullable=True))
    op.add_column('questions', sa.Column('field_key', sa.String(), nullable=False))
    op.alter_column('questions', 'text',
               existing_type=sa.VARCHAR(),
               nullable=False)
    
    # Handle category conversion
    op.execute('ALTER TABLE questions ALTER COLUMN category TYPE questioncategory USING category::text::questioncategory')
    op.alter_column('questions', 'category', nullable=False)
    
    # Handle question_type conversion
    op.execute('ALTER TABLE questions ALTER COLUMN question_type TYPE questiontype USING question_type::text::questiontype')
    op.alter_column('questions', 'question_type', nullable=False)
    
    op.alter_column('questions', 'order',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.create_foreign_key(None, 'questions', 'questions', ['parent_id'], ['id'])
    op.add_column('user_responses', sa.Column('response_value', sa.JSON(), nullable=False))
    op.add_column('user_responses', sa.Column('updated_at', sa.DateTime(), nullable=True))
    op.alter_column('user_responses', 'user_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.alter_column('user_responses', 'question_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.drop_column('user_responses', 'response')


def downgrade() -> None:
    # Convert ENUM types back to VARCHAR before dropping them
    op.execute('ALTER TABLE questions ALTER COLUMN category TYPE varchar USING category::text')
    op.execute('ALTER TABLE questions ALTER COLUMN question_type TYPE varchar USING question_type::text')
    
    op.add_column('user_responses', sa.Column('response', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.alter_column('user_responses', 'question_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.alter_column('user_responses', 'user_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.drop_column('user_responses', 'updated_at')
    op.drop_column('user_responses', 'response_value')
    op.drop_constraint(None, 'questions', type_='foreignkey')
    op.alter_column('questions', 'order',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.alter_column('questions', 'text',
               existing_type=sa.VARCHAR(),
               nullable=True)
    op.drop_column('questions', 'field_key')
    op.drop_column('questions', 'parent_id')
    op.drop_column('questions', 'validation')
    op.alter_column('meal_plans', 'plan_data',
               existing_type=postgresql.JSON(astext_type=sa.Text()),
               nullable=True)
    op.alter_column('meal_plans', 'user_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.drop_column('meal_plans', 'end_date')
    op.drop_column('meal_plans', 'start_date')
    op.drop_column('meal_plans', 'is_active')
    op.drop_column('meal_plans', 'updated_at')

    # Drop ENUM types last
    postgresql.ENUM(name='questiontype').drop(op.get_bind())
    postgresql.ENUM(name='questioncategory').drop(op.get_bind())
