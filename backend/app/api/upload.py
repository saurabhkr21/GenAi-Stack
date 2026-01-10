from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import shutil
import os
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from typing import List

router = APIRouter()

UPLOAD_DIR = "uploads"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=schemas.Document)
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        file_location = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get file size
        file_size = os.path.getsize(file_location)
        
        # Create DB record
        db_document = models.Document(
            filename=file.filename,
            file_path=file_location,
            file_type=file.content_type or "application/octet-stream",
            file_size=file_size
        )
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        
        return db_document
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not upload file: {str(e)}")

@router.get("/documents", response_model=List[schemas.Document])
def get_documents(db: Session = Depends(get_db)):
    return db.query(models.Document).all()

