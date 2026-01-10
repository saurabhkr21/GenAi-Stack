from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from typing import List

router = APIRouter()

@router.post("/chat/log", response_model=schemas.ChatLog)
def log_chat(chat_log: schemas.ChatLogCreate, db: Session = Depends(get_db)):
    db_chat = models.ChatLog(**chat_log.dict())
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat

@router.get("/chat/history/{workflow_id}", response_model=List[schemas.ChatLog])
def get_chat_history(workflow_id: int, db: Session = Depends(get_db)):
    return db.query(models.ChatLog).filter(models.ChatLog.workflow_id == workflow_id).all()
