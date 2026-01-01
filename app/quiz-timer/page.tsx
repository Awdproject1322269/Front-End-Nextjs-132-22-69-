'use client';

import { useState, useEffect, useRef } from "react";

interface QuizTimerProps {
  duration: number;
  onTimeUp: () => void;
  isActive?: boolean;
}

function QuizTimer({ duration, onTimeUp, isActive = true }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(isActive);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    // Reset timer when duration changes
    setTimeLeft(duration * 60);
    setIsRunning(isActive);
    pausedTimeRef.current = 0;
    
    if (isActive) {
      startTimeRef.current = Date.now();
    }
  }, [duration, isActive]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          
          if (newTime <= 0) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            setIsRunning(false);
            if (typeof onTimeUp === 'function') {
              onTimeUp();
            }
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onTimeUp]);

  const handlePauseResume = () => {
    if (isRunning) {
      // Pause
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      // Resume
      setIsRunning(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (): string => {
    const percentage = (timeLeft / (duration * 60)) * 100;
    if (percentage > 50) return "bg-green-500";
    if (percentage > 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const progressPercentage = (timeLeft / (duration * 60)) * 100;

  // Auto-submit when time reaches 0
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      if (typeof onTimeUp === 'function') {
        onTimeUp();
      }
    }
  }, [timeLeft, isActive, onTimeUp]);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">⏰</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Quiz Timer</h3>
            <p className="text-sm text-gray-600">Time remaining</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-bold ${
            progressPercentage > 50 ? 'text-green-600' : 
            progressPercentage > 25 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {formatTime(timeLeft)}
          </div>
          <p className="text-sm text-gray-500">of {duration} min</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Time Warnings */}
      {progressPercentage <= 25 && progressPercentage > 0 && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-yellow-700 text-sm font-medium text-center">
            ⚡ Hurry up! Time is running out
          </p>
        </div>
      )}

      {timeLeft === 0 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-sm font-medium text-center">
            ⏰ Time's up! Quiz submitted automatically
          </p>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handlePauseResume}
          className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-colors duration-200 ${
            isRunning 
              ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isRunning ? '⏸️ Pause' : '▶️ Resume'}
        </button>
      </div>

      {/* Time Status */}
      <div className="mt-3 text-center">
        <span className={`text-sm font-medium ${
          isRunning ? 'text-green-600' : 'text-yellow-600'
        }`}>
          {isRunning ? '⏰ Running' : '⏸️ Paused'}
        </span>
      </div>
    </div>
  );
}

export default QuizTimer;