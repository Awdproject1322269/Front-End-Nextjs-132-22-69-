'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

// Interfaces
interface User {
  id: string;
  name: string;
  email: string;
}

interface Report {
  id: string;
  quizTitle: string;
  difficulty: string;
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  timeSpent: string;
  date: string;
}

function MyReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const API_BASE = "http://localhost:5000/api";
  const [user, setUser] = useState<User | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser: User = JSON.parse(userData);
          setUser(parsedUser);
          setStudentId(parsedUser?.id || null);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (studentId) {
      loadReports();
    }
  }, [studentId]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/student/reports/${studentId}`);
      const data = await response.json();

      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === "all") return true;
    if (filter === "high") return report.percentage >= 80;
    if (filter === "medium") return report.percentage >= 60 && report.percentage < 80;
    if (filter === "low") return report.percentage < 60;
    return true;
  });

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-100";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getGradeColor = (grade: string) => {
    if (['A+', 'A', 'A-'].includes(grade)) return "text-green-600 bg-green-100";
    if (['B+', 'B', 'C+', 'C'].includes(grade)) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const downloadReport = (report: Report) => {
    // Create a simple PDF download
    const content = `
      QUIZ REPORT
      ===========
      
      Student: ${user?.name}
      Quiz: ${report.quizTitle}
      Date: ${new Date(report.date).toLocaleDateString()}
      
      SCORE SUMMARY
      -------------
      Score: ${report.score}/${report.totalMarks}
      Percentage: ${report.percentage}%
      Grade: ${report.grade}
      Time Spent: ${report.timeSpent}
      Difficulty: ${report.difficulty}
      
      PERFORMANCE
      -----------
      ${report.percentage >= 80 ? 'Excellent! Keep up the good work!' : 
        report.percentage >= 60 ? 'Good effort! Room for improvement.' : 
        'Keep practicing! You can do better!'}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QuizReport_${report.quizTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const calculateStats = () => {
    if (reports.length === 0) return { average: 0, best: 0, total: 0 };
    
    const totalPercentage = reports.reduce((sum: number, report: Report) => sum + report.percentage, 0);
    const bestScore = Math.max(...reports.map(report => report.percentage));
    
    return {
      average: (totalPercentage / reports.length).toFixed(1),
      best: bestScore.toFixed(1),
      total: reports.length
    };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800">
      {/* Header */}
      <div className="pt-8 pb-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">My Reports</h2>
                <p className="text-gray-600">Track your quiz performance and progress</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-800">{stats.total} quizzes taken</p>
              <p className="text-sm text-gray-600">Average: {stats.average}%</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.average}%</p>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 text-xl">📈</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.best}%</p>
                  <p className="text-sm text-gray-600">Best Score</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-xl">🏆</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total Attempts</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-purple-600 text-xl">📝</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-2 mb-8">
            <div className="flex space-x-2 overflow-x-auto">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                  filter === "all"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                All Reports ({reports.length})
              </button>
              <button
                onClick={() => setFilter("high")}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                  filter === "high"
                    ? "bg-green-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Excellent (80%+)
              </button>
              <button
                onClick={() => setFilter("medium")}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                  filter === "medium"
                    ? "bg-yellow-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Good (60-79%)
              </button>
              <button
                onClick={() => setFilter("low")}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                  filter === "low"
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Needs Improvement
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden">
          {filteredReports.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 text-lg mb-2">No reports available</p>
              <p className="text-gray-400 mb-6">Take some quizzes to see your performance reports here</p>
              <Link
                href="/availablequizzes"
                className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
              >
                Take a Quiz
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredReports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-gray-50/50 transition-colors duration-200 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">
                          {report.quizTitle}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          report.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                          report.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {report.difficulty}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Score:</span>
                          <span className="ml-2 font-semibold">{report.score}/{report.totalMarks}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Percentage:</span>
                          <span className={`ml-2 font-semibold px-2 py-1 rounded-full ${getPerformanceColor(report.percentage)}`}>
                            {report.percentage}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Grade:</span>
                          <span className={`ml-2 font-semibold px-2 py-1 rounded-full ${getGradeColor(report.grade)}`}>
                            {report.grade}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <span className="ml-2 font-semibold">{report.timeSpent}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-500">
                        Date: {new Date(report.date).toLocaleDateString()} • 
                        Time: {new Date(report.date).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => downloadReport(report)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-200 text-sm"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200 text-sm"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Quiz Report Details</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Quiz Title</p>
                  <p className="font-semibold">{selectedReport.quizTitle}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Difficulty</p>
                  <p className="font-semibold capitalize">{selectedReport.difficulty}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedReport.score}/{selectedReport.totalMarks}</p>
                  <p className="text-sm text-blue-600">Score</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedReport.percentage}%</p>
                  <p className="text-sm text-green-600">Percentage</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{selectedReport.grade}</p>
                  <p className="text-sm text-purple-600">Grade</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">{selectedReport.timeSpent}</p>
                  <p className="text-sm text-orange-600">Time Spent</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">Attempt Date & Time</p>
                <p className="font-semibold">
                  {new Date(selectedReport.date).toLocaleDateString()} at {new Date(selectedReport.date).toLocaleTimeString()}
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => downloadReport(selectedReport)}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-200"
                >
                  Download Report
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyReports;