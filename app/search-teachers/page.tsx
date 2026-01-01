'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

// Define types
interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface ConnectedTeacher {
  id: string;
  name: string;
  email: string;
}

interface PendingRequest {
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  course: string;
  requestedAt: Date | string;
}

interface User {
  id: string;
  name?: string;
  email?: string;
}

function SearchTeachers() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connectedTeachers, setConnectedTeachers] = useState<ConnectedTeacher[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
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
        setStudentId(parsedUser?.id || null);
      }
    }
  }, []);

  useEffect(() => {
    if (studentId) {
      loadConnectedTeachers();
    }
  }, [studentId]);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const delaySearch = setTimeout(() => {
        searchTeachers();
      }, 500);

      return () => clearTimeout(delaySearch);
    } else {
      setTeachers([]);
    }
  }, [searchQuery]);

  const loadConnectedTeachers = async (): Promise<void> => {
    try {
      if (!studentId) return;
      
      const [teachersRes, pendingRes] = await Promise.all([
        fetch(`${API_BASE}/student/teachers/${studentId}`),
        fetch(`${API_BASE}/student/connections/pending/${studentId}`)
      ]);

      const teachersData = await teachersRes.json();
      const pendingData = await pendingRes.json();

      if (teachersData.success) setConnectedTeachers(teachersData.teachers || []);
      if (pendingData.success) setPendingRequests(pendingData.requests || []);
    } catch (error) {
      console.error("Error loading connected teachers:", error);
    }
  };

  const searchTeachers = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/teachers/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.success) {
        // Filter out already connected teachers and pending requests
        const connectedIds = connectedTeachers.map(t => t.id);
        const pendingIds = pendingRequests.map(r => r.teacherId);
        
        const filteredTeachers = data.teachers.filter((teacher: Teacher) => 
          !connectedIds.includes(teacher.id) && !pendingIds.includes(teacher.id)
        );
        
        setTeachers(filteredTeachers);
      }
    } catch (error) {
      console.error("Error searching teachers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendConnectionRequest = async (teacherId: string, teacherName: string): Promise<void> => {
    try {
      if (!studentId) return;
      
      const course = prompt(`Enter course name for ${teacherName}:`, "General");
      if (!course) return;

      const response = await fetch(`${API_BASE}/connections/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: teacherId,
          studentId: studentId,
          course: course
        })
      });

      const data = await response.json();

      if (data.success) {
        alert("Connection request sent successfully!");
        // Remove from search results and add to pending
        setTeachers(prev => prev.filter(t => t.id !== teacherId));
        setPendingRequests(prev => [...prev, {
          teacherId: teacherId,
          teacherName: teacherName,
          course: course,
          requestedAt: new Date()
        }]);
      } else {
        alert(data.message || "Failed to send connection request");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      alert("Failed to send connection request");
    }
  };

  const isTeacherConnected = (teacherId: string): boolean => {
    return connectedTeachers.some(t => t.id === teacherId);
  };

  const isTeacherPending = (teacherId: string): boolean => {
    return pendingRequests.some(r => r.teacherId === teacherId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800">
      {/* Header */}
      <div className="pt-8 pb-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Search Teachers</h2>
                <p className="text-gray-600">Find and connect with teachers to access their quizzes</p>
              </div>
            </div>
            <Link
              href="/myteachers"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            >
              My Teachers
            </Link>
          </div>

          {/* Search Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6 mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teachers by name or email..."
                className="w-full px-6 py-4 pl-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-lg"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <span className="text-gray-400 text-xl">🔍</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Start typing to search for teachers (minimum 3 characters)
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{connectedTeachers.length}</p>
                <p className="text-sm text-gray-600">Connected Teachers</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{pendingRequests.length}</p>
                <p className="text-sm text-gray-600">Pending Requests</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-orange-600 text-xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800">
              {searchQuery ? "Search Results" : "Find Teachers"}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `Searching for "${searchQuery}"` 
                : "Start typing to search for teachers"}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Searching teachers...</p>
            </div>
          ) : teachers.length === 0 && searchQuery ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😕</div>
              <p className="text-gray-500 text-lg">No teachers found</p>
              <p className="text-gray-400">Try searching with different keywords</p>
            </div>
          ) : teachers.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {teachers.map((teacher: Teacher) => (
                <div key={teacher.id} className="p-6 hover:bg-gray-50/50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {teacher.name?.split(' ').map((n: string) => n[0]).join('') || 'T'}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">{teacher.name}</h4>
                        <p className="text-gray-600">{teacher.email}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => sendConnectionRequest(teacher.id, teacher.name)}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : !searchQuery ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👨‍🏫</div>
              <p className="text-gray-500 text-lg">Search for teachers</p>
              <p className="text-gray-400">Enter a teacher's name or email to start searching</p>
            </div>
          ) : null}
        </div>

        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Pending Connection Requests</h3>
              <p className="text-gray-600">Waiting for teacher approval</p>
            </div>
            
            <div className="divide-y divide-gray-100">
              {pendingRequests.map((request: PendingRequest) => (
                <div key={request.teacherId} className="p-6 hover:bg-gray-50/50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {request.teacherName?.split(' ').map((n: string) => n[0]).join('') || 'T'}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">{request.teacherName}</h4>
                        <p className="text-gray-600">{request.teacherEmail || 'No email provided'}</p>
                        {request.course && (
                          <p className="text-sm text-gray-500 mt-1">Course: {request.course}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          Requested: {new Date(request.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
                      Pending Approval
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchTeachers;