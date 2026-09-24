"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel
from typing import List, Optional


# --- Auth ---
class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


# --- Task ---
class TaskBase(BaseModel):
    description: str
    assigned_to: str
    deadline: str
    priority: str = "Medium"
    status: str = "Not Started"


class TaskCreate(TaskBase):
    meeting_id: int


class TaskUpdate(BaseModel):
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    deadline: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None


class TaskOut(TaskBase):
    id: int
    meeting_id: int

    class Config:
        from_attributes = True


# --- Decision ---
class DecisionOut(BaseModel):
    id: int
    meeting_id: int
    decision_text: str

    class Config:
        from_attributes = True


# --- Meeting ---
class MeetingCreate(BaseModel):
    title: str
    date: str
    participants: List[str] = []
    transcript: str = ""


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    analyzed: Optional[bool] = None


class MeetingOut(BaseModel):
    id: int
    title: str
    date: str
    participants: List[str]
    transcript: str
    summary: str
    analyzed: bool

    class Config:
        from_attributes = True


class MeetingWithTasks(MeetingOut):
    tasks: List[TaskOut] = []
    decisions: List[DecisionOut] = []


# --- AI Analysis ---
class AnalyzeResponse(BaseModel):
    summary: str
    decisions: List[str]
    tasks: List[TaskBase]


# --- Dashboard ---
class DashboardStats(BaseModel):
    total_meetings: int
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int
    accountability: float
