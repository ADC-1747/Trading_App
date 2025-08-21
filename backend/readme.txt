alembic revision --autogenerate -m "<message>"
alembic upgrade head
export PYTHONPATH=/app:$PYTHONPATH
