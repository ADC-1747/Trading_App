from fastapi import FastAPI
from . import models
from .database import engine
from .routers import auth
from fastapi.middleware.cors import CORSMiddleware

# origins = ["http://localhost:3000"]
origins = ["https://localhost:3000"]



# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "API is running!"}
