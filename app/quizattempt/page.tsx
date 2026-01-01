'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Interfaces
interface User {
  id: string;
  name: string;
  email: string;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  questions: Question[];
  totalMarks: number;
  duration: number;
  difficulty: string;
}

interface Answer {
  questionId: string;
  selectedAnswer: number | null;
  timeSpent: number;
}

// QuizTimer component
function QuizTimer({ duration, onTimeUp, isActive }: { duration: number; onTimeUp: () => void; isActive: boolean }) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  
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

function QuizAttempt() {
  const router = useRouter();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Demo quiz data - NO API CALLS
  const demoQuiz: Quiz = {
    id: "demo-quiz-123",
    title: "Demo Quiz - Computer Science Basics",
    description: "Test your knowledge of fundamental computer science concepts",
    teacherId: "demo-teacher-456",
    questions: [
      {
        id: "q1",
        text: "What does CPU stand for?",
        options: [
          "Central Processing Unit",
          "Computer Processing Unit", 
          "Central Process Unit",
          "Computer Process Unit"
        ],
        correctAnswer: 0,
        marks: 5,
        explanation: "CPU is the primary component of a computer that performs most processing tasks"
      },
      {
        id: "q2", 
        text: "Which data structure uses LIFO (Last In, First Out) principle?",
        options: [
          "Queue",
          "Stack",
          "Array",
          "Linked List"
        ],
        correctAnswer: 1,
        marks: 5,
        explanation: "Stack follows LIFO while Queue follows FIFO"
      },
      {
        id: "q3",
        text: "What is the time complexity of binary search?",
        options: [
          "O(1)",
          "O(log n)", 
          "O(n)",
          "O(n²)"
        ],
        correctAnswer: 1,
        marks: 5,
        explanation: "Binary search halves the search space with each comparison"
      },
      {
        id: "q4",
        text: "Which programming language is known for its use in web development?",
        options: [
          "C++",
          "Java",
          "JavaScript",
          "Python"
        ],
        correctAnswer: 2,
        marks: 5,
        explanation: "JavaScript is primarily used for client-side web development"
      }
    ],
    totalMarks: 20,
    duration: 10,
    difficulty: "medium"
  };

  // Initialize from URL parameters (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const quizId = params.get('quizId');
      const userId = params.get('studentId');
      const userName = params.get('studentName');
      
      // For demo, always use demo quiz
      setTimeout(() => {
        setQuiz(demoQuiz);
        
        // Initialize answers
        const initialAnswers: Answer[] = demoQuiz.questions.map((question: Question) => ({
          questionId: question.id,
          selectedAnswer: null,
          timeSpent: 0
        }));
        setAnswers(initialAnswers);
        
        if (userId) setStudentId(userId);
        if (userName) setStudentName(userName);
        
        // Also check localStorage as fallback
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            const parsedUser: User = JSON.parse(userData);
            if (!userId) setStudentId(parsedUser?.id || "demo-student");
            if (!userName) setStudentName(parsedUser?.name || "Demo Student");
          } catch (error) {
            console.error("Error parsing user data:", error);
            setStudentId("demo-student");
            setStudentName("Demo Student");
          }
        } else {
          setStudentId("demo-student");
          setStudentName("Demo Student");
        }
        
        setIsLoading(false);
      }, 500);
    }
  }, []);

  // Debug useEffect
  useEffect(() => {
    if (quiz && quiz.questions) {
      console.log("🔍 Quiz Questions Debug:", {
        totalQuestions: quiz.questions.length,
        questions: quiz.questions.map((q, i) => ({
          index: i,
          id: q.id,
          text: q.text?.substring(0, 50) + '...',
          correctAnswer: q.correctAnswer,
          options: q.options,
          marks: q.marks
        }))
      });
    }
  }, [quiz]);

  // Track time spent on each question
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (quizStarted && !quizSubmitted && quiz) {
      interval = setInterval(() => {
        setAnswers(prev => prev.map((answer, index) => 
          index === currentQuestionIndex 
            ? { ...answer, timeSpent: answer.timeSpent + 1 }
            : answer
        ));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [quizStarted, quizSubmitted, currentQuestionIndex, quiz]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading demo quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-600 font-medium text-lg mb-4">
            Demo Quiz not available
          </p>
          <p className="text-gray-500 text-sm mb-6">
            This is a demo. In a real app, quiz data would be loaded.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => prev.map((answer, index) => 
      index === currentQuestionIndex 
        ? { ...answer, selectedAnswer: optionIndex }
        : answer
    ));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleTimeUp = async () => {
    if (!quizSubmitted) {
      console.log("⏰ Time's up! Auto-submitting quiz...");
      await handleDemoSubmit("Time's up! Quiz submitted automatically.");
    }
  };

  const submitQuiz = async () => {
    await handleDemoSubmit("Quiz submitted successfully! 🎉");
  };

  const handleDemoSubmit = async (message: string) => {
    try {
      setQuizSubmitted(true);
      setShowConfirmation(false);
      
      // Calculate score for demo
      let score = 0;
      const detailedAnswers = answers.map((answer, index) => {
        const question = quiz.questions[index];
        
        if (!question) return answer;

        const isCorrect = answer.selectedAnswer === question.correctAnswer;
        if (isCorrect) {
          score += question.marks || 1;
        }

        return {
          questionId: question.id || `q${index}`,
          selectedAnswer: answer.selectedAnswer,
          isCorrect: isCorrect,
          timeSpent: answer.timeSpent || 0
        };
      });

      const totalMarks = quiz.totalMarks;
      const percentage = ((score / totalMarks) * 100).toFixed(1);

      console.log("🎉 Demo Quiz Results:", {
        score,
        totalMarks,
        percentage,
        answers: detailedAnswers
      });

      // Store results in localStorage for demo
      const quizResult = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        score,
        totalMarks,
        percentage,
        date: new Date().toISOString(),
        answers: detailedAnswers
      };

      // Save to localStorage for demo reports
      const existingResults = JSON.parse(localStorage.getItem('demoQuizResults') || '[]');
      existingResults.push(quizResult);
      localStorage.setItem('demoQuizResults', JSON.stringify(existingResults));

      alert(message);
      router.push("/myreports");
      
    } catch (error) {
      console.error("❌ Error in demo quiz:", error);
      alert("Demo quiz completed! Check your reports.");
      router.push("/myreports");
    }
  };

  const formatTotalTimeSpent = (): string => {
    const totalSeconds = answers.reduce((sum: number, answer: Answer) => sum + answer.timeSpent, 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateProgress = (): number => {
    return ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  };

  const getAnsweredCount = (): number => {
    return answers.filter(answer => answer.selectedAnswer !== null).length;
  };

  // Quiz Instructions Screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/60 p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📝</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{quiz.title}</h1>
              <p className="text-gray-600 text-lg">{quiz.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-2xl p-6">
                <h3 className="font-semibold text-blue-800 mb-3">📋 Quiz Details</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>• Total Questions: {quiz.questions.length}</p>
                  <p>• Total Marks: {quiz.totalMarks}</p>
                  <p>• Duration: {quiz.duration} minutes</p>
                  <p>• Difficulty: <span className="capitalize">{quiz.difficulty}</span></p>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-6">
                <h3 className="font-semibold text-green-800 mb-3">📝 Instructions</h3>
                <div className="space-y-2 text-sm text-green-700">
                  <p>• Read each question carefully</p>
                  <p>• Select the best answer</p>
                  <p>• You can navigate between questions</p>
                  <p>• Timer will be shown during the quiz</p>
                  <p>• Submit before time runs out</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Demo Mode</h3>
              <div className="text-sm text-yellow-700">
                <p>• This is a standalone frontend demo</p>
                <p>• All data is simulated</p>
                <p>• No backend connection required</p>
                <p>• Results saved in browser storage only</p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleStartQuiz}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl font-bold text-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-lg"
              >
                🚀 Start Demo Quiz
              </button>
              <p className="text-gray-500 text-sm mt-4">
                You have {quiz.duration} minutes to complete this demo quiz
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Quiz Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with Timer and Navigation */}
          <div className="lg:col-span-1 space-y-6">
            <QuizTimer 
              duration={quiz.duration} 
              onTimeUp={handleTimeUp}
              isActive={!quizSubmitted}
            />

            {/* Progress Summary */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Progress</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Questions Answered</span>
                    <span>{getAnsweredCount()}/{quiz.questions.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-green-500 transition-all duration-500"
                      style={{ width: `${(getAnsweredCount() / quiz.questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Current Progress</span>
                    <span>{currentQuestionIndex + 1}/{quiz.questions.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Question Navigation */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Jump to Question</h4>
                <div className="grid grid-cols-5 gap-2">
                  {quiz.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        index === currentQuestionIndex
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : answers[index]?.selectedAnswer !== null
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowConfirmation(true)}
              disabled={quizSubmitted}
              className="w-full py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {quizSubmitted ? 'Submitting...' : '📨 Submit Quiz'}
            </button>

            {/* Demo Notice */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white p-4">
              <p className="text-sm text-center">🎯 Standalone Frontend Demo</p>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
                  <p className="text-gray-600">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    quiz.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                    quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {quiz.difficulty}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">Marks: {currentQuestion.marks}</p>
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 leading-relaxed">
                  {currentQuestion.text}
                </h2>
                
                {currentQuestion.explanation && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <p className="text-blue-700 text-sm">
                      <span className="font-semibold">Hint:</span> {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Answer Options */}
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      currentAnswer?.selectedAnswer === index
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 font-semibold ${
                        currentAnswer?.selectedAnswer === index
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-gray-800 text-lg">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  ← Previous
                </button>
                
                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === quiz.questions.length - 1}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Submit Quiz?</h3>
              <p className="text-gray-600 mb-6">
                You have answered {getAnsweredCount()} out of {quiz.questions.length} questions. 
                Are you sure you want to submit?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={submitQuiz}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors duration-200"
                >
                  Submit Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizAttempt;