"""create system prompts table

Revision ID: create_system_prompts
Revises: # Add the ID of the previous migration here
Create Date: 2024-01-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'create_system_prompts'
down_revision = None  # Update this with the previous migration ID
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'system_prompts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('prompt_text', sa.String(), nullable=False),
        sa.Column('output_format', sa.String(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('created_by_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], )
    )
    
    # Create initial system prompt for meal plan generation
    op.execute("""
        INSERT INTO system_prompts (name, prompt_text, output_format, description, created_by_id)
        SELECT 'meal_plan_generation',
               'You are a professional nutritionist and wellness expert. Generate a detailed wellness profile and meal plan based on the user''s information.',
               '{
                   "daily_calories": "number",
                   "macros": {
                       "protein": "number",
                       "carbs": "number",
                       "fats": "number"
                   },
                   "weekly_plan": {
                       "monday": {
                           "breakfast": [{"name": "string", "portions": "string", "calories": "number"}],
                           "lunch": [{"name": "string", "portions": "string", "calories": "number"}],
                           "dinner": [{"name": "string", "portions": "string", "calories": "number"}],
                           "snacks": [{"name": "string", "portions": "string", "calories": "number"}]
                       }
                   },
                   "recommendations": "string[]"
               }',
               'System prompt for generating personalized meal plans',
               id
        FROM users
        WHERE is_admin = true
        ORDER BY created_at ASC
        LIMIT 1;
    """)

def downgrade():
    op.drop_table('system_prompts') 