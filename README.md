# AI Meeting to Accountability System

Convert meeting discussions into clear action items and track them until completion. Built for college hackathons — works end-to-end with a Mock AI mode (no API key required).

## Features

- **AI Meeting Analysis** — Paste any meeting transcript and the AI automatically extracts:
  - Meeting summary
  - Key decisions
  - Action items with assignee, deadline, and priority
- **Mock AI Mode** — Rule-based NLP extractor works without any external API key. Ready to connect a real AI API (e.g., OpenAI) by setting an environment variable.
- **Accountability Dashboard** — Tracks total meetings, total/completed/pending/overdue tasks, and an overall accountability percentage.
- **Task Management** — Edit tasks, change assignees, update deadlines, change priority, update status, add comments.
- **Automatic Overdue Detection** — Tasks are automatically marked Overdue when the deadline passes.
- **Meeting History** — Browse past meetings with task counts and completion percentages.
- **Charts & Visualizations** — Task status donut chart, team accountability bar chart, circular progress indicator.
- **Responsive Design** — Works on mobile, tablet, and desktop.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Tailwind CSS, Vite |
| Backend | Python FastAPI |
| Database | SQLite (via SQLAlchemy) |
| AI | Mock AI (rule-based NLP) — ready for OpenAI integration |

## Project Structure

```
.
├── src/                    # React frontend
│   ├── components/         # Shared UI components (Sidebar, charts, UI primitives)
│   ├── lib/                # Router, store (state management), mock AI, utilities
│   ├── pages/              # Login, Dashboard, CreateMeeting, Analysis, Accountability, History, MeetingDetails, TaskDetails
│   ├── types.ts            # TypeScript type definitions
│   ├── App.tsx             # Main app with routing
│   └── main.tsx            # Entry point
├── backend/                # Python FastAPI backend
│   ├── main.py             # FastAPI app with all endpoints
│   ├── models.py           # SQLAlchemy models (Users, Meetings, Tasks, Decisions)
│   ├── schemas.py          # Pydantic schemas for request/response
│   ├── database.py         # SQLite database setup
│   ├── ai_analyzer.py      # AI analysis module (Mock AI + ready for real API)
│   └── requirements.txt    # Python dependencies
├── .env.example            # Environment variable template
├── package.json            # Frontend dependencies
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+

### 1. Frontend (React + Vite)

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend runs at `http://localhost:5173`.

### 2. Backend (FastAPI + SQLite)

```bash
# Go to backend directory
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

The backend runs at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

> **Note:** The frontend includes a built-in localStorage-based data layer, so it works standalone without the backend for demo purposes. To connect the FastAPI backend, set `VITE_API_URL` in your `.env` file.

### 3. Environment Variables

Copy `.env.example` to `.env` and configure if needed:

```bash
cp .env.example .env
```

The app works with defaults — no environment variables are required for the Mock AI mode.

## Demo Login

- **Email:** demo@meeting.ai
- **Password:** demo123

Or click "Demo Login" on the login page.

## Sample Transcript

```
Today we discussed the project launch. Ravi will complete the backend API by September 28. Priya will prepare the presentation by September 27. Arun will test the application by September 29. The team agreed to launch the prototype on September 30.
```

Click "Load Sample Transcript" on the Create Meeting page to try it instantly.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/demo-login` | Quick demo login |

### Meetings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/meetings` | Create a new meeting |
| GET | `/meetings` | List all meetings |
| GET | `/meetings/{id}` | Get meeting with tasks & decisions |
| POST | `/meetings/{id}/analyze` | Run AI analysis on meeting transcript |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List all tasks (optional `?status=` filter) |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/{id}` | Update a task |
| DELETE | `/tasks/{id}` | Delete a task |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get dashboard statistics |

## Connecting a Real AI API

The AI module in `backend/ai_analyzer.py` is structured to easily connect a real AI provider:

1. Add your API key to `.env`: `OPENAI_API_KEY=your_key`
2. In `backend/ai_analyzer.py`, replace the body of the `analyze()` function with a call to the AI API
3. The mock analyzer remains as a fallback when no key is set

## Accountability Calculation

```
Accountability % = (Completed Tasks / Total Tasks) × 100
```

Tasks are automatically marked as **Overdue** when the deadline has passed and the task is not completed.

## Pages

1. **Login** — Email/password login with demo login button
2. **Dashboard** — Stats cards, accountability circular progress, task status chart, team accountability chart, upcoming deadlines, recent meetings
3. **Create Meeting** — Form with title, date, participants, transcript + "Analyze Meeting with AI" button with processing animation
4. **AI Analysis** — Displays summary, key decisions, and editable action items table. Confirm, edit, or reject.
5. **Accountability Dashboard** — Task management table with filters (person, status, priority, deadline)
6. **Meeting History** — Cards showing past meetings with completion progress bars
7. **Meeting Details** — Full meeting info with summary, decisions, tasks table
8. **Task Details** — Edit task fields, update status, add comments

## License

MIT — Built for educational/hackathon use.
