from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Section(BaseModel):
    title: str
    # Optionally add more fields (e.g., initial_content: Optional[str] = None)

class Slide(BaseModel):
    title: str

class ProjectConfig(BaseModel):
    sections: Optional[List[str]] = None  # For docx projects
    slides: Optional[List[Dict[str, str]]] = None  # For pptx projects, simple for flexibility

class ProjectCreate(BaseModel):
    name: str = Field(..., example="Electric Vehicles Market Outlook 2025")
    description: str = Field(..., example="A comprehensive analysis of the global electric vehicles (EV) market in 2025.")
    document_type: str = Field(..., example="docx")  # or "pptx"
    config: ProjectConfig

class Project(BaseModel):
    id: int
    name: str
    description: str
    document_type: str
    config: ProjectConfig
    created_at: str

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: int
    email: str

    class Config:
        orm_mode = True

class ContentSection(BaseModel):
    title: str
    text: str

class ContentSlide(BaseModel):
    title: str
    text: str

class Feedback(BaseModel):
    section_index: int
    feedback_type: str  # "like" or "dislike"

class Comment(BaseModel):
    section_index: int
    comment: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

