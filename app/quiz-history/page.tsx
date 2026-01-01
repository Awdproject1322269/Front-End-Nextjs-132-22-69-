'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

// Define types for the quiz report
interface QuizReport {
  id: string | number;
  quizTitle: string;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  timeSpent: string;
  date: string;
}

// Define types for user
interface User {
  id: string;
  // Add other user properties as needed
}

function QuizHistory() {
  const [reports, setReports] = useState<QuizReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, week, month, year
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const [sortBy, setSortBy] = useState("date"); // date, score, title
  const [user, setUser] = useState<User | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    // Check if we're in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);
        setStudentId(parsedUser?.id);
      }
    }
  }, []);

  useEffect(() => {
    if (studentId) {
      loadQuizHistory();
    }
  }, [studentId]);

  const loadQuizHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/student/reports/${studentId}`);
      const data = await response.json();

      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error("Error loading quiz history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterReportsByTime = (reports: QuizReport[]): QuizReport[] => {
    const now = new Date();
    const filterDate = new Date();

    switch (selectedTimeRange) {
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return reports;
    }

    return reports.filter(report => new Date(report.date) >= filterDate);
  };

  const sortReports = (reports: QuizReport[]): QuizReport[] => {
    return [...reports].sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.percentage - a.percentage;
        case "title":
          return a.quizTitle.localeCompare(b.quizTitle);
        case "date":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  };

  const filteredAndSortedReports = sortReports(filterReportsByTime(reports));

  interface PerformanceStats {
    totalQuizzes: number;
    averageScore: string;
    bestScore: string;
    improvement: string;
  }

  const getPerformanceStats = (): PerformanceStats | null => {
    if (filteredAndSortedReports.length === 0) return null;

    const totalQuizzes = filteredAndSortedReports.length;
    const averageScore = filteredAndSortedReports.reduce((sum, report) => sum + report.percentage, 0) / totalQuizzes;
    const bestScore = Math.max(...filteredAndSortedReports.map(report => report.percentage));
    const improvement = calculateImprovement();

    return {
      totalQuizzes,
      averageScore: averageScore.toFixed(1),
      bestScore: bestScore.toFixed(1),
      improvement: improvement.toString()
    };
  };

  const calculateImprovement = (): number => {
    if (filteredAndSortedReports.length < 2) return 0;

    const sortedByDate = [...filteredAndSortedReports].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const firstHalf = sortedByDate.slice(0, Math.floor(sortedByDate.length / 2));
    const secondHalf = sortedByDate.slice(Math.floor(sortedByDate.length / 2));

    const firstAvg = firstHalf.reduce((sum, report) => sum + report.percentage, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, report) => sum + report.percentage, 0) / secondHalf.length;

    return Number(((secondAvg - firstAvg) / firstAvg * 100).toFixed(1));
  };

  interface PerformanceTrend {
    text: string;
    color: string;
    bg: string;
  }

  const getPerformanceTrend = (percentage: number): PerformanceTrend => {
    if (percentage >= 80) return { text: "Excellent", color: "text-green-600", bg: "bg-green-100" };
    if (percentage >= 60) return { text: "Good", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { text: "Needs Practice", color: "text-red-600", bg: "bg-red-100" };
  };

  const stats = getPerformanceStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your quiz history...</p>
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
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Quiz History</h2>
                <p className="text-gray-600">Track your learning journey and progress over time</p>
              </div>
            </div>
            <Link
              href="/availablequizzes"
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300"
            >
              Take New Quiz
            </Link>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalQuizzes}</p>
                    <p className="text-sm text-gray-600">Total Attempts</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 text-xl">📝</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{stats.averageScore}%</p>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-green-600 text-xl">📈</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{stats.bestScore}%</p>
                    <p className="text-sm text-gray-600">Best Score</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <span className="text-yellow-600 text-xl">🏆</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {Number(stats.improvement) > 0 ? '+' : ''}{stats.improvement}%
                    </p>
                    <p className="text-sm text-gray-600">Improvement</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-purple-600 text-xl">🚀</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Sorting */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Time Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Period
                </label>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                >
                  <option value="date">Most Recent</option>
                  <option value="score">Highest Score</option>
                  <option value="title">Quiz Title</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden">
          {filteredAndSortedReports.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500 text-lg mb-2">No quiz history found</p>
              <p className="text-gray-400 mb-6">
                {selectedTimeRange !== "all" 
                  ? `No quizzes found for the selected time period` 
                  : "Start taking quizzes to build your history"}
              </p>
              <Link
                href="/availablequizzes"
                className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
              >
                Take a Quiz
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredAndSortedReports.map((report, index) => {
                const trend = getPerformanceTrend(report.percentage);
                return (
                  <div key={report.id} className="p-6 hover:bg-gray-50/50 transition-colors duration-200 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "📝"}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">
                              {report.quizTitle}
                            </h3>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            report.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                            report.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {report.difficulty}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${trend.bg} ${trend.color}`}>
                            {trend.text}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                          <div 
                            className="h-3 rounded-full transition-all duration-1000 bg-gradient-to-r from-green-400 to-blue-500"
                            style={{ width: `${report.percentage}%` }}
                          ></div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Score:</span>
                            <span className="ml-2 font-semibold">{report.score}/{report.totalMarks}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Percentage:</span>
                            <span className="ml-2 font-semibold">{report.percentage}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Grade:</span>
                            <span className="ml-2 font-semibold">{report.grade}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Time:</span>
                            <span className="ml-2 font-semibold">{report.timeSpent}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Date:</span>
                            <span className="ml-2 font-semibold">
                              {new Date(report.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Link
                          href="/myreports"
                          className="px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-200 text-sm block text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Performance Chart Placeholder */}
        {filteredAndSortedReports.length > 0 && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Performance Trend</h3>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
              <div className="flex justify-around items-end h-48">
                {filteredAndSortedReports.slice(0, 8).map((report, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-8 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-xl transition-all duration-1000 hover:from-indigo-600 hover:to-purple-600"
                      style={{ height: `${report.percentage}%` }}
                      title={`${report.quizTitle}: ${report.percentage}%`}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2">Q{index + 1}</span>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6">
                <p className="text-gray-500 text-sm">
                  *Performance trend across your recent quiz attempts
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizHistory;