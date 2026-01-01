'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// Define TypeScript interfaces
interface Teacher {
  id: string;
  name: string;
  course: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  teacherName: string;
  questionsCount: number;
  totalMarks: number;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isAttempted: boolean;
  createdAt: string;
  course?: string;
}

interface User {
  id: string;
  name: string;
}

function AvailableQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "attempted" | "pending">("all");
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const API_BASE = "http://localhost:5000/api";
  const [user, setUser] = useState<User | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser: User = JSON.parse(userData);
          setUser(parsedUser);
          setStudentId(parsedUser?.id || null);
          setStudentName(parsedUser?.name || null);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (studentId) {
      const teacherId = searchParams.get('teacher');
      if (teacherId) {
        setSelectedTeacher(teacherId);
      }
      loadTeachersAndQuizzes();
    }
  }, [studentId, searchParams]);

  const loadTeachersAndQuizzes = async () => {
    try {
      setIsLoading(true);
      
      // Load teachers first
      const teachersResponse = await fetch(`${API_BASE}/student/teachers/${studentId}`);
      const teachersData = await teachersResponse.json();
      
      if (teachersData.success) {
        setTeachers(teachersData.teachers || []);
      }

      // Then load quizzes
      await loadQuizzes();

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuizzes = async () => {
    try {
      if (!studentId) {
        console.error("Student ID is required");
        return;
      }
      
      console.log("🔄 Loading quizzes for student:", studentId);
      
      const API_URL = `${API_BASE}/student/quizzes/${studentId}`;
      console.log("📡 API URL:", API_URL);
      
      const response = await fetch(API_URL);
      console.log("📊 Response Status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ API Response Data:", data);
      
      if (data.success) {
        const quizzesData: Quiz[] = data.quizzes || [];
        setQuizzes(quizzesData);
        applyFilters(quizzesData, selectedTeacher);
      } else {
        console.error("❌ API returned success: false", data);
      }
    } catch (error) {
      console.error("❌ Error loading quizzes:", error);
    }
  };

  const applyFilters = (quizzesList: Quiz[], teacherId: string | null = null) => {
    let filtered = quizzesList;

    // Apply teacher filter
    if (teacherId) {
      filtered = filtered.filter(quiz => {
        const quizTeacher = teachers.find(t => t.name === quiz.teacherName);
        return quizTeacher && quizTeacher.id === teacherId;
      });
    }

    // Apply status filter
    if (filter === "attempted") {
      filtered = filtered.filter(quiz => quiz.isAttempted === true);
    } else if (filter === "pending") {
      filtered = filtered.filter(quiz => !quiz.isAttempted);
    }

    setFilteredQuizzes(filtered);
  };

  useEffect(() => {
    if (quizzes.length > 0) {
      applyFilters(quizzes, selectedTeacher);
    }
  }, [filter, selectedTeacher, quizzes]);

  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacher(teacherId || null);
  };

  const handleStartQuiz = async (quiz: Quiz) => {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${quiz.id}`);
      const data = await response.json();
      
      if (data.success) {
        // Create URL with state parameters
        const quizParams = new URLSearchParams({
          quizId: quiz.id,
          studentId: studentId || '',
          studentName: studentName || ''
        }).toString();
        
        router.push(`/quizattempt?${quizParams}`);
      } else {
        console.error("Failed to load quiz details");
      }
    } catch (error) {
      console.error("Error loading quiz details:", error);
    }
  };

  // Get teacher name by ID
  const getTeacherName = (teacherId: string | null) => {
    if (!teacherId) return 'All Teachers';
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading available quizzes...</p>
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
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Available Quizzes
                  {selectedTeacher && ` - ${getTeacherName(selectedTeacher)}`}
                </h2>
                <p className="text-gray-600">
                  {selectedTeacher 
                    ? `Quizzes from ${getTeacherName(selectedTeacher)} only`
                    : 'Take quizzes from your connected teachers'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-800">
                {filteredQuizzes.filter(q => !q.isAttempted).length} quizzes available
              </p>
              <p className="text-sm text-gray-600">
                {filteredQuizzes.filter(q => q.isAttempted).length} completed
              </p>
            </div>
          </div>

          {/* Teacher Filter */}
          {teachers.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-4 mb-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-semibold">Filter by Teacher:</span>
                <select 
                  value={selectedTeacher || ''}
                  onChange={(e) => handleTeacherChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Teachers</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.course})
                    </option>
                  ))}
                </select>
                {selectedTeacher && (
                  <button
                    onClick={() => setSelectedTeacher(null)}
                    className="px-3 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-2 mb-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter("all")}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  filter === "all"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                All Quizzes ({filteredQuizzes.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  filter === "pending"
                    ? "bg-green-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Available ({filteredQuizzes.filter(q => !q.isAttempted).length})
              </button>
              <button
                onClick={() => setFilter("attempted")}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  filter === "attempted"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Completed ({filteredQuizzes.filter(q => q.isAttempted).length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden">
          {filteredQuizzes.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">
                {filter === "attempted" ? "🎉" : "📚"}
              </div>
              <p className="text-gray-500 text-lg mb-2">
                {selectedTeacher 
                  ? `No quizzes available from ${getTeacherName(selectedTeacher)}`
                  : filter === "attempted" 
                    ? "No quizzes completed yet" 
                    : "No quizzes available"
                }
              </p>
              <p className="text-gray-400 mb-6">
                {selectedTeacher
                  ? "This teacher hasn't created any quizzes yet"
                  : filter === "attempted"
                    ? "Start taking quizzes to see your completed attempts here"
                    : "Connect with more teachers to access their quizzes"
                }
              </p>
              {filter !== "attempted" && (
                <Link
                  href="/myteachers"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                >
                  Back to Teachers
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-6 p-6">
              {filteredQuizzes.map((quiz) => (
                <div key={quiz.id} className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                        {quiz.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {quiz.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>By: {quiz.teacherName}</span>
                        <span>•</span>
                        <span>Questions: {quiz.questionsCount}</span>
                        <span>•</span>
                        <span>Marks: {quiz.totalMarks}</span>
                        <span>•</span>
                        <span>Duration: {quiz.duration} min</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        quiz.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                        quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {quiz.difficulty}
                      </span>
                      {quiz.isAttempted ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                          Completed
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">
                          Available
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Created: {new Date(quiz.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-3">
                      {quiz.isAttempted ? (
                        <Link
                          href="/myreports"
                          className="px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-200"
                        >
                          View Result
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleStartQuiz(quiz)}
                          className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                        >
                          Start Quiz
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AvailableQuizzes;