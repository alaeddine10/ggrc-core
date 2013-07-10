"""Rename whodunnit column to modified_by_id

Revision ID: 14a59edf62de
Revises: 3288290c842a
Create Date: 2013-06-10 20:48:03.804966

"""

# revision identifiers, used by Alembic.
revision = '14a59edf62de'
down_revision = '3288290c842a'

from alembic import op
import sqlalchemy as sa

def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        'log_events', 'whodunnit', new_column_name='modified_by_id',
        type_=sa.String(length=250))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        'log_events', 'modified_by_id', new_column_name='whodunnit',
        type_=sa.String(length=250))
    ### end Alembic commands ###