from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

from .auth import get_current_user

router = APIRouter()


@router.get("/symbols", response_model=List[schemas.SymbolResponse])
def get_symbols(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Symbol).all()
