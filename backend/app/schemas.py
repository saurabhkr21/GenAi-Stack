from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    data: Dict[str, Any]

class WorkflowCreate(WorkflowBase):
    pass

class Workflow(WorkflowBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WorkflowRunRequest(BaseModel):
    inputs: Dict[str, Any]

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class DocumentBase(BaseModel):
    filename: str
    file_type: str
    file_size: int

class DocumentCreate(DocumentBase):
    file_path: str

class Document(DocumentBase):
    id: int
    upload_date: datetime
    
    class Config:
        from_attributes = True

class ChatLogBase(BaseModel):
    session_id: Optional[str] = None
    workflow_id: Optional[int] = None
    user_message: str
    ai_response: str

class ChatLogCreate(ChatLogBase):
    pass

class ChatLog(ChatLogBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

