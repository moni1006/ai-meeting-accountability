import type { AIAnalysisResult, TaskPriority } from '@/types';

// Simple keyword-based mock AI that extracts tasks from meeting transcripts.
// Designed to work without any external API key.

interface ExtractedTask {
  description: string;
  assignedTo: string;
  deadline: string;
  priority: TaskPriority;
}

const MONTHS: Record<string, number> = {
  january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
  april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
  august: 7, aug: 7, september: 8, sep: 8, sept: 8, october: 9, oct: 9,
  november: 10, nov: 10, december: 11, dec: 11,
};

function parseDate(text: string): string | null {
  // "September 28", "September 28, 2026", "28 September 2026", "Sep 28"
  const m1 = text.match(/(?:by|before|on)\s+(\w+)\s+(\d{1,2})(?:,?\s*(\d{4}))?/i);
  const m2 = text.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/i);
  const m3 = text.match(/(\w+)\s+(\d{1,2})(?:,?\s*(\d{4}))?/i);

  const tryMatch = (m: RegExpMatchArray | null): string | null => {
    if (!m) return null;
    let monthName: string, dayStr: string, yearStr: string | undefined;
    if (m.length === 4 && /^\d/.test(m[1])) {
      dayStr = m[1]; monthName = m[2]; yearStr = m[3];
    } else {
      monthName = m[1]; dayStr = m[2]; yearStr = m[3];
    }
    const month = MONTHS[monthName.toLowerCase()];
    if (month === undefined) return null;
    const day = parseInt(dayStr, 10);
    if (isNaN(day)) return null;
    const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
    const d = new Date(year, month, day);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  };

  return tryMatch(m1) || tryMatch(m2) || tryMatch(m3);
}

function guessPriority(description: string, deadline: string): TaskPriority {
  const lower = description.toLowerCase();
  const urgent = ['urgent', 'critical', 'asap', 'immediately', 'high', 'launch', 'release', 'deploy', 'fix'];
  if (urgent.some(w => lower.includes(w))) return 'High';
  const days = (new Date(deadline).getTime() - Date.now()) / 86400000;
  if (days <= 3) return 'High';
  if (days <= 7) return 'Medium';
  return 'Medium';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function extractTasks(transcript: string): ExtractedTask[] {
  const tasks: ExtractedTask[] = [];
  // Split into sentences
  const sentences = transcript.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    // Pattern: Name will/should/shall/must <do something> by <date>
    const taskMatch = sentence.match(/(\w+)\s+(?:will|should|shall|must|is going to|needs to|has to|is responsible for|to)\s+(.+?)(?:\s+by\s+|\s+before\s+|$)/i);
    if (!taskMatch) continue;

    const assignedTo = capitalize(taskMatch[1].trim());
    let description = taskMatch[2].trim().replace(/[.!?]+$/, '');
    description = capitalize(description);

    // Try to find a deadline in the full sentence (not just after "by")
    const deadline = parseDate(sentence) || parseDate(taskMatch[2]) || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const priority = guessPriority(description, deadline);

    tasks.push({ description, assignedTo, deadline, priority });
  }

  // Deduplicate
  const seen = new Set<string>();
  return tasks.filter(t => {
    const key = t.assignedTo + t.description;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function generateSummary(transcript: string, tasks: ExtractedTask[]): string {
  const firstSentence = transcript.split(/(?<=[.!?])\s+/)[0];
  if (tasks.length > 0) {
    const names = [...new Set(tasks.map(t => t.assignedTo))];
    return `${firstSentence} The team identified ${tasks.length} action item${tasks.length > 1 ? 's' : ''} assigned to ${names.join(', ')}.`;
  }
  return firstSentence;
}

function extractDecisions(transcript: string): string[] {
  const decisions: string[] = [];
  const sentences = transcript.split(/(?<=[.!?])\s+/);
  for (const s of sentences) {
    const lower = s.toLowerCase();
    if (lower.includes('agreed') || lower.includes('decided') || lower.includes('launch') || lower.includes('approved') || lower.includes('confirmed')) {
      decisions.push(s.trim().replace(/\s+/g, ' '));
    }
  }
  if (decisions.length === 0 && sentences.length > 1) {
    decisions.push(sentences[sentences.length - 1].trim());
  }
  return decisions;
}

export function mockAnalyze(transcript: string): AIAnalysisResult {
  const tasks = extractTasks(transcript);
  const summary = generateSummary(transcript, tasks);
  const decisions = extractDecisions(transcript);

  return {
    summary,
    decisions,
    tasks: tasks.map(t => ({
      description: t.description,
      assignedTo: t.assignedTo,
      deadline: t.deadline,
      priority: t.priority,
    })),
  };
}

export const SAMPLE_TRANSCRIPT = `Today we discussed the project launch. Ravi will complete the backend API by September 28. Priya will prepare the presentation by September 27. Arun will test the application by September 29. The team agreed to launch the prototype on September 30.`;
