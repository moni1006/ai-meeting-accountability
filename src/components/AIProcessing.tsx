import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

const steps = [
  'Parsing meeting transcript...',
  'Identifying action items...',
  'Extracting assignees and deadlines...',
  'Determining task priorities...',
  'Generating meeting summary...',
  'Compiling key decisions...',
];

export function AIProcessing({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= steps.length) {
      const timer = setTimeout(onComplete, 400);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 500);
    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 animate-ping opacity-30" />
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-2">AI is analyzing your meeting</h3>
      <p className="text-sm text-gray-500 mb-8">Extracting action items, decisions, and accountability</p>

      <div className="w-full max-w-md space-y-2.5">
        {steps.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                done ? 'bg-green-50' : active ? 'bg-blue-50' : 'bg-gray-50'
              }`}
            >
              {done ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : active ? (
                <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
              )}
              <span className={`text-sm ${done ? 'text-green-700' : active ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
