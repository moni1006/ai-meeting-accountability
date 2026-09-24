"""
FastAPI main application — all endpoints.

Run: uvicorn backend.main:app --reload --port 8000
"""
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.database import get_db, init_db
from backend import models, schemas
from backend.ai_analyzer import analyze

app = FastAPI(title="AI Meeting to Accountability System", version="1.0.0")

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


# ── Auth ──────────────────────────────────────────────

@app.post("/auth/login", response_model=schemas.UserOut)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.email == credentials.email,
        models.User.password == credentials.password,
    ).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user


@app.post("/auth/demo-login", response_model=schemas.UserOut)
def demo_login(db: Session = Depends(get_db)):
    """Create or return the demo user."""
    user = db.query(models.User).filter(models.User.email == "demo@meeting.ai").first()
    if not user:
        user = models.User(name="Demo User", email="demo@meeting.ai", password="demo123")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


# ── Meetings ──────────────────────────────────────────

@app.post("/meetings", response_model=schemas.MeetingOut)
def create_meeting(meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    db_meeting = models.Meeting(
        title=meeting.title,
        date=meeting.date,
        participants=",".join(meeting.participants),
        transcript=meeting.transcript,
        summary="",
        analyzed=0,
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return _meeting_to_out(db_meeting)


@app.get("/meetings", response_model=list[schemas.MeetingOut])
def list_meetings(db: Session = Depends(get_db)):
    meetings = db.query(models.Meeting).order_by(models.Meeting.created_at.desc()).all()
    return [_meeting_to_out(m) for m in meetings]


@app.get("/meetings/{meeting_id}", response_model=schemas.MeetingWithTasks)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Auto-detect overdue tasks
    _update_overdue(db, meeting_id)

    tasks = db.query(models.Task).filter(models.Task.meeting_id == meeting_id).all()
    decisions = db.query(models.Decision).filter(models.Decision.meeting_id == meeting_id).all()

    return {
        "id": meeting.id,
        "title": meeting.title,
        "date": meeting.date,
        "participants": meeting.participants.split(",") if meeting.participants else [],
        "transcript": meeting.transcript,
        "summary": meeting.summary,
        "analyzed": bool(meeting.analyzed),
        "tasks": tasks,
        "decisions": decisions,
    }


@app.post("/meetings/{meeting_id}/analyze", response_model=schemas.AnalyzeResponse)
def analyze_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    result = analyze(meeting.transcript)

    # Save analysis to DB
    meeting.summary = result["summary"]
    meeting.analyzed = 1

    # Clear old decisions and tasks for this meeting
    db.query(models.Decision).filter(models.Decision.meeting_id == meeting_id).delete()
    db.query(models.Task).filter(models.Task.meeting_id == meeting_id).delete()

    # Save decisions
    for text in result["decisions"]:
        db.add(models.Decision(meeting_id=meeting_id, decision_text=text))

    # Save tasks
    for t in result["tasks"]:
        db.add(models.Task(
            meeting_id=meeting_id,
            description=t["description"],
            assigned_to=t["assigned_to"],
            deadline=t["deadline"],
            priority=t["priority"],
            status="Not Started",
        ))

    db.commit()
    return result


# ── Tasks ─────────────────────────────────────────────

@app.get("/tasks", response_model=list[schemas.TaskOut])
def list_tasks(status: str = None, db: Session = Depends(get_db)):
    _update_all_overdue(db)
    query = db.query(models.Task)
    if status:
        query = query.filter(models.Task.status == status)
    return query.all()


@app.post("/tasks", response_model=schemas.TaskOut)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == task.meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db_task = models.Task(
        meeting_id=task.meeting_id,
        description=task.description,
        assigned_to=task.assigned_to,
        deadline=task.deadline,
        priority=task.priority,
        status=task.status,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@app.put("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, updates: schemas.TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"detail": "Task deleted"}


# ── Dashboard ─────────────────────────────────────────

@app.get("/dashboard", response_model=schemas.DashboardStats)
def dashboard(db: Session = Depends(get_db)):
    _update_all_overdue(db)
    total_meetings = db.query(models.Meeting).count()
    total_tasks = db.query(models.Task).count()
    completed = db.query(models.Task).filter(models.Task.status == "Completed").count()
    overdue = db.query(models.Task).filter(models.Task.status == "Overdue").count()
    pending = total_tasks - completed - overdue
    accountability = round((completed / total_tasks * 100), 1) if total_tasks > 0 else 0.0
    return {
        "total_meetings": total_meetings,
        "total_tasks": total_tasks,
        "completed_tasks": completed,
        "pending_tasks": pending,
        "overdue_tasks": overdue,
        "accountability": accountability,
    }


# ── Helpers ───────────────────────────────────────────

def _update_overdue(db: Session, meeting_id: int):
    """Mark tasks as Overdue if deadline has passed and not Completed."""
    today = datetime.now().strftime("%Y-%m-%d")
    tasks = db.query(models.Task).filter(
        models.Task.meeting_id == meeting_id,
        models.Task.status != "Completed",
        models.Task.deadline < today,
    ).all()
    for t in tasks:
        t.status = "Overdue"
    if tasks:
        db.commit()


def _update_all_overdue(db: Session):
    """Mark all overdue tasks across all meetings."""
    today = datetime.now().strftime("%Y-%m-%d")
    tasks = db.query(models.Task).filter(
        models.Task.status != "Completed",
        models.Task.deadline < today,
    ).all()
    for t in tasks:
        t.status = "Overdue"
    if tasks:
        db.commit()


def _meeting_to_out(m: models.Meeting) -> schemas.MeetingOut:
    return {
        "id": m.id,
        "title": m.title,
        "date": m.date,
        "participants": m.participants.split(",") if m.participants else [],
        "transcript": m.transcript,
        "summary": m.summary,
        "analyzed": bool(m.analyzed),
    }


@app.get("/")
def root():
    return {"message": "AI Meeting to Accountability System API", "docs": "/docs"}
