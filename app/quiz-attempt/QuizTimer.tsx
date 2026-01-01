'use client';

import { useState, useEffect } from "react";

interface QuizTimerProps {
  duration: number; // in minutes
  onTimeUp: () => void;
  isActive: boolean;
}

function QuizTimer({ duration, onTimeUp, isActive }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds
  
  useEffect(() => {
    if (!isActive) return;
    
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeLeft, onTimeUp, isActive]);
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getProgressPercentage = (): number => {
    const totalSeconds = duration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };
  
  const getTimeColor = (): string => {
    const percentageLeft = (timeLeft / (duration * 60)) * 100;
    if (percentageLeft > 50) return "text-green-500";
    if (percentageLeft > 25) return "text-yellow-500";
    return "text-red-500";
  };
  
  const getProgressBarColor = (): string => {
    const percentageLeft = (timeLeft / (duration * 60)) * 100;
    if (percentageLeft > 50) return "bg-green-500";
    if (percentageLeft > 25) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">⏰</span>
          <h3 className="text-lg font-bold text-gray-800">Time Remaining</h3>
        </div>
        
        <div className={`text-4xl font-bold mb-3 ${getTimeColor()}`}>
          {formatTime(timeLeft)}
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          Total Duration: {duration} minutes
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(getProgressPercentage())}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getProgressBarColor()} transition-all duration-300`}
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        {timeLeft <= 60 ? (
          <p className="text-red-500 font-semibold">⚠️ Less than a minute left!</p>
        ) : timeLeft <= 300 ? (
          <p className="text-yellow-600">⚠️ Less than 5 minutes left!</p>
        ) : (
          <p>✅ You have plenty of time</p>
        )}
      </div>
    </div>
  );
}

export default QuizTimer;