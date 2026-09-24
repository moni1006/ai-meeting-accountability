import React from 'react';
import type { TaskStatus, TaskPriority } from '@/types';

export function StatusBadge({ status }: { status: TaskStatus }) {
  const styles: Record<TaskStatus, string> = {
    'Not Started': 'bg-gray-100 text-gray-700 border-gray-200',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
    'Completed': 'bg-green-50 text-green-700 border-green-200',
    'Overdue': 'bg-red-50 text-red-700 border-red-200',
  };
  const dots: Record<TaskStatus, string> = {
    'Not Started': 'bg-gray-400',
    'In Progress': 'bg-blue-500',
    'Completed': 'bg-green-500',
    'Overdue': 'bg-red-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const styles: Record<TaskPriority, string> = {
    High: 'bg-red-50 text-red-700 border-red-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-gray-50 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[priority]}`}>
      {priority}
    </span>
  );
}

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`w-full bg-gray-100 rounded-full h-2.5 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function CircularProgress({ value, size = 120, label }: { value: number; size?: number; label?: string }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="url(#grad-circular)" strokeWidth={8}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="grad-circular" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">{value}%</span>
        {label && <span className="text-xs text-gray-500 mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, onClick, variant = 'primary', className = '', type = 'button', disabled }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const variants: Record<string, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200',
    ghost: 'hover:bg-gray-100 text-gray-600',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-200',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({ label, value, onChange, type = 'text', placeholder, className = '' }: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>
  );
}

export function Textarea({ label, value, onChange, placeholder, rows = 6, className = '' }: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
      />
    </div>
  );
}

export function Select({ label, value, onChange, options, className = '' }: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
