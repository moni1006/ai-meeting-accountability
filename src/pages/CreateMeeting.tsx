import React, { useState } from 'react';
import { FilePlus2, Sparkles, FileText, Wand2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRouter } from '@/lib/router';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { AIProcessing } from '@/components/AIProcessing';
import { mockAnalyze, SAMPLE_TRANSCRIPT } from '@/lib/mockAI';

export function CreateMeeting() {
  const { addMeeting } = useStore();
  const { navigate } = useRouter();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [participants, setParticipants] = useState('');
  const [transcript, setTranscript] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = () => {
    if (!title.trim()) { setError('Please enter a meeting title'); return; }
    if (!transcript.trim()) { setError('Please enter meeting transcript or notes'); return; }
    setError('');

    const meetingId = addMeeting({
      title: title.trim(),
      date,
      participants: participants.split(',').map(p => p.trim()).filter(Boolean),
      transcript: transcript.trim(),
      summary: '',
    });

    // Run mock AI analysis (simulated with animation)
    // Pre-compute result so it's ready when animation finishes
    const result = mockAnalyze(transcript.trim());
    setAnalyzing(true);

    // Store result for the analysis page
    sessionStorage.setItem('pending_analysis_' + meetingId, JSON.stringify(result));
  };

  const handleAnalysisComplete = () => {
    // Find the meeting we just created (last one added with this title)
    // We stored the meetingId in the closure but need to navigate
    // Use the meetingId from the analyze handler
    const stored = sessionStorage.getItem('last_meeting_id');
    if (stored) {
      navigate(`/analysis/${stored}`);
    }
  };

  const handleAnalyzeClick = () => {
    if (!title.trim()) { setError('Please enter a meeting title'); return; }
    if (!transcript.trim()) { setError('Please enter meeting transcript or notes'); return; }
    setError('');

    const meetingId = addMeeting({
      title: title.trim(),
      date,
      participants: participants.split(',').map(p => p.trim()).filter(Boolean),
      transcript: transcript.trim(),
      summary: '',
    });

    const result = mockAnalyze(transcript.trim());
    sessionStorage.setItem('pending_analysis_' + meetingId, JSON.stringify(result));
    sessionStorage.setItem('last_meeting_id', meetingId);
    setAnalyzing(true);
  };

  const loadSample = () => {
    setTitle('Project Launch Planning');
    setParticipants('Ravi, Priya, Arun');
    setTranscript(SAMPLE_TRANSCRIPT);
  };

  if (analyzing) {
    return (
      <Card className="p-8">
        <AIProcessing onComplete={() => {
          const meetingId = sessionStorage.getItem('last_meeting_id');
          if (meetingId) navigate(`/analysis/${meetingId}`);
        }} />
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Create Meeting</h1>
        <p className="text-sm text-gray-500 mt-1">Enter meeting details and let AI extract action items</p>
      </div>

      <Card className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Meeting Title" value={title} onChange={setTitle} placeholder="e.g. Weekly Team Sync" />
          <Input label="Date" type="date" value={date} onChange={setDate} />
        </div>

        <Input label="Participants (comma-separated)" value={participants} onChange={setParticipants} placeholder="e.g. Ravi, Priya, Arun" />

        <Textarea
          label="Meeting Transcript / Notes"
          value={transcript}
          onChange={setTranscript}
          placeholder="Paste your meeting transcript or notes here... e.g. 'Today we discussed the project launch. Ravi will complete the backend API by September 28...'"
          rows={8}
        />

        {error && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button onClick={handleAnalyzeClick} className="flex-1 sm:flex-none">
            <Sparkles className="w-4 h-4" />
            Analyze Meeting with AI
          </Button>
          <Button variant="secondary" onClick={loadSample}>
            <Wand2 className="w-4 h-4" />
            Load Sample Transcript
          </Button>
        </div>
      </Card>

      {/* Info card */}
      <Card className="p-5 bg-blue-50/50 border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700">How it works</h3>
            <p className="text-sm text-gray-500 mt-1">
              Enter your meeting transcript and click "Analyze Meeting with AI". The AI will automatically extract a summary, key decisions, and action items with assignees, deadlines, and priorities. You can review and edit everything before confirming.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
