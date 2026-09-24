"""
SQLAlchemy models for Users, Meetings, Tasks, and Decisions.
"""
from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    password = Column(String(200), nullable=False)


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    date = Column(String(50), nullable=False)  # ISO date string
    participants = Column(Text, nullable=False, default="")  # comma-separated
    transcript = Column(Text, nullable=False, default="")
    summary = Column(Text, nullable=False, default="")
    analyzed = Column(Integer, nullable=False, default=0)  # 0 or 1
    created_at = Column(DateTime, server_default=func.now())

    tasks = relationship("Task", back_populates="meeting", cascade="all, delete-orphan")
    decisions = relationship("Decision", back_populates="meeting", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    description = Column(Text, nullable=False)
    assigned_to = Column(String(200), nullable=False)
    deadline = Column(String(50), nullable=False)  # ISO date string
    priority = Column(String(20), nullable=False, default="Medium")  # High, Medium, Low
    status = Column(String(30), nullable=False, default="Not Started")  # Not Started, In Progress, Completed, Overdue

    meeting = relationship("Meeting", back_populates="tasks")


class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    decision_text = Column(Text, nullable=False)

    meeting = relationship("Meeting", back_populates="decisions")
