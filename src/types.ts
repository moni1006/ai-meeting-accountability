export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface Comment {
  id: string;
  taskId: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  meetingId: string;
  description: string;
  assignedTo: string;
  deadline: string; // ISO date
  priority: TaskPriority;
  status: TaskStatus;
  comments: Comment[];
  createdAt: string;
}

export interface Decision {
  id: string;
  meetingId: string;
  decisionText: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // ISO date
  participants: string[];
  transcript: string;
  summary: string;
  createdAt: string;
  analyzed: boolean;
}

export interface AIAnalysisResult {
  summary: string;
  decisions: string[];
  tasks: Omit<Task, 'id' | 'meetingId' | 'comments' | 'createdAt' | 'status'>[];
}

export interface DashboardStats {
  totalMeetings: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  accountability: number;
}
