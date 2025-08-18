FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app ./app


# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--ssl-keyfile=/app/certs/selfsigned.key", "--ssl-certfile=/app/certs/selfsigned.crt", "--reload"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--ssl-keyfile=/app/certs/localhost+2-key.pem", "--ssl-certfile=/app/certs/localhost+2.pem", "--reload"]
