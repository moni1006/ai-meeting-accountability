"""
AI Analysis module — Mock AI mode.

This module extracts action items, decisions, and a summary from meeting
transcripts using rule-based NLP (no external API required).

To connect a real AI API later:
1. Set OPENAI_API_KEY (or your provider's key) in .env
2. Replace the `analyze` function body with an API call
3. Keep `mock_analyze` as a fallback when no key is present
"""
import re
from datetime import datetime, timedelta
from typing import List, Tuple

MONTHS = {
    "january": 1, "jan": 1, "february": 2, "feb": 2, "march": 3, "mar": 3,
    "april": 4, "apr": 4, "may": 5, "june": 5, "jun": 5, "july": 6, "jul": 6,
    "august": 7, "aug": 7, "september": 8, "sep": 8, "sept": 8, "october": 9,
    "oct": 9, "november": 10, "nov": 10, "december": 11, "dec": 11,
}


def parse_date(text: str) -> str:
    """Try to find a date in text. Returns ISO date string or default +7 days."""
    patterns = [
        r"(?:by|before|on)\s+(\w+)\s+(\d{1,2})(?:,?\s*(\d{4}))?",
        r"(\d{1,2})\s+(\w+)\s+(\d{4})",
        r"(\w+)\s+(\d{1,2})(?:,?\s*(\d{4}))?",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            groups = match.groups()
            if groups[0] and groups[0].isdigit():
                day_str, month_name, year_str = groups[0], groups[1], groups[2] if len(groups) > 2 else None
            else:
                month_name, day_str = groups[0], groups[1]
                year_str = groups[2] if len(groups) > 2 else None

            month = MONTHS.get(month_name.lower())
            if not month:
                continue
            try:
                day = int(day_str)
            except (ValueError, TypeError):
                continue
            year = int(year_str) if year_str else datetime.now().year
            try:
                return datetime(year, month, day).strftime("%Y-%m-%d")
            except ValueError:
                continue
    return (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")


def guess_priority(description: str, deadline: str) -> str:
    """Guess priority based on keywords and deadline proximity."""
    lower = description.lower()
    urgent_words = ["urgent", "critical", "asap", "immediately", "high", "launch", "release", "deploy", "fix"]
    if any(w in lower for w in urgent_words):
        return "High"
    try:
        days_left = (datetime.strptime(deadline, "%Y-%m-%d") - datetime.now()).days
    except ValueError:
        days_left = 7
    if days_left <= 3:
        return "High"
    return "Medium"


def capitalize(s: str) -> str:
    return s[0].upper() + s[1:] if s else s


def split_sentences(text: str) -> List[str]:
    """Split text into sentences."""
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    return [s.strip() for s in sentences if s.strip()]


def extract_tasks(transcript: str) -> List[dict]:
    """Extract tasks from transcript using pattern matching."""
    tasks = []
    seen = set()
    sentences = split_sentences(transcript)

    for sentence in sentences:
        # Pattern: Name will/should/shall/must/needs to <do something> [by <date>]
        pattern = r"(\w+)\s+(?:will|should|shall|must|is going to|needs to|has to|is responsible for)\s+(.+?)(?:\s+by\s+|\s+before\s+|$)"
        match = re.search(pattern, sentence, re.IGNORECASE)
        if not match:
            continue

        assigned_to = capitalize(match.group(1).strip())
        description = capitalize(match.group(2).strip().rstrip(".!?"))
        deadline = parse_date(sentence)
        priority = guess_priority(description, deadline)

        key = assigned_to + description
        if key in seen:
            continue
        seen.add(key)

        tasks.append({
            "description": description,
            "assigned_to": assigned_to,
            "deadline": deadline,
            "priority": priority,
            "status": "Not Started",
        })

    return tasks


def extract_decisions(transcript: str) -> List[str]:
    """Extract key decisions from transcript."""
    decisions = []
    sentences = split_sentences(transcript)
    keywords = ["agreed", "decided", "launch", "approved", "confirmed", "concluded"]

    for s in sentences:
        lower = s.lower()
        if any(kw in lower for kw in keywords):
            decisions.append(s)

    if not decisions and len(sentences) > 1:
        decisions.append(sentences[-1])
    return decisions


def generate_summary(transcript: str, tasks: List[dict]) -> str:
    """Generate a brief meeting summary."""
    sentences = split_sentences(transcript)
    first = sentences[0] if sentences else "Meeting transcript analyzed."
    if tasks:
        names = list(dict.fromkeys(t["assigned_to"] for t in tasks))
        return f"{first} The team identified {len(tasks)} action item{'s' if len(tasks) > 1 else ''} assigned to {', '.join(names)}."
    return first


def mock_analyze(transcript: str) -> dict:
    """
    Mock AI analysis — works without any API key.
    Returns dict with: summary, decisions (list of str), tasks (list of dict).
    """
    tasks = extract_tasks(transcript)
    summary = generate_summary(transcript, tasks)
    decisions = extract_decisions(transcript)
    return {"summary": summary, "decisions": decisions, "tasks": tasks}


def analyze(transcript: str) -> dict:
    """
    Main entry point for AI analysis.
    Uses mock_analyze by default. When OPENAI_API_KEY is set,
    replace this with a real API call (see instructions at top of file).
    """
    import os
    api_key = os.getenv("OPENAI_API_KEY", "")
    if api_key:
        # TODO: Connect to real AI API here
        # For now, fall back to mock
        return mock_analyze(transcript)
    return mock_analyze(transcript)
