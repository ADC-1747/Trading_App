FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app ./app
COPY . .

COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh


# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--ssl-keyfile=/app/certs/selfsigned.key", "--ssl-certfile=/app/certs/selfsigned.crt", "--reload"]
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--ssl-keyfile=/app/certs/localhost+2-key.pem", "--ssl-certfile=/app/certs/localhost+2.pem", "--reload"]
CMD ["sh", "-c", "/wait-for-it.sh db:5432 --timeout=30 --strict -- uvicorn app.main:app --host 0.0.0.0 --port 8000 --ssl-keyfile=/app/certs/localhost+2-key.pem --ssl-certfile=/app/certs/localhost+2.pem --reload"]
