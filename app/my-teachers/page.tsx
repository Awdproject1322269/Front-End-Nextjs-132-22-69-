'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Interfaces
interface User {
  id: string;
  name: string;
  email: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  course?: string;
  connectedAt?: string;
}

interface ConnectionRequest {
  id: string;
  teacherName: string;
  teacherEmail: string;
  course?: string;
  requestedAt?: string;
}

function MyTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"connected" | "pending">("connected");
  const router = useRouter();

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
      loadTeachersData();
    }
  }, [studentId]);

  const loadTeachersData = async () => {
    try {
      setIsLoading(true);
      
      const [teachersRes, pendingRes] = await Promise.all([
        fetch(`${API_BASE}/student/teachers/${studentId}`),
        fetch(`${API_BASE}/student/connections/pending/${studentId}`)
      ]);

      const teachersData = await teachersRes.json();
      const pendingData = await pendingRes.json();

      if (teachersData.success) setTeachers(teachersData.teachers || []);
      if (pendingData.success) setPendingRequests(pendingData.requests || []);

    } catch (error) {
      console.error("Error loading teachers data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: Remove connection function
  const handleRemoveConnection = async (teacherId: string) => {
    if (!window.confirm("Are you sure you want to remove this teacher connection?")) {
      return;
    }

    try {
      // ✅ CORRECT: Find connection between student and teacher
      const response = await fetch(`${API_BASE}/connections/find/${studentId}/${teacherId}`);
      const data = await response.json();
      
      if (data.success && data.connection) {
        const deleteRes = await fetch(`${API_BASE}/connections/remove/${data.connection._id}`, {
          method: 'DELETE'
        });

        const deleteData = await deleteRes.json();
        
        if (deleteData.success) {
          alert("Teacher connection removed successfully!");
          loadTeachersData();
        }
      } else {
        alert("Connection not found!");
      }
    } catch (error) {
      console.error("Error removing connection:", error);
      alert("Failed to remove connection!");
    }
  };

  // ✅ FIXED: Cancel request function
  const handleCancelRequest = async (requestId: string) => {
    try {
      const response = await fetch(`${API_BASE}/connections/remove/${requestId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Connection request cancelled successfully!");
        loadTeachersData();
      } else {
        alert(data.message || "Failed to cancel request");
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
      alert("Failed to cancel request!");
    }
  };

  // Helper function to get initials
  const getInitials = (name: string | undefined): string => {
    if (!name) return 'T';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your teachers...</p>
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
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">My Teachers</h2>
                <p className="text-gray-600">Manage your connected teachers and pending requests</p>
              </div>
            </div>
            <Link
              href="/searchteachers"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            >
              + Find Teachers
            </Link>
          </div>

          {/* Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-2 mb-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("connected")}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === "connected"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Connected Teachers ({teachers.length})
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === "pending"
                    ? "bg-orange-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Pending Requests ({pendingRequests.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {activeTab === "connected" ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Connected Teachers</h3>
              <p className="text-gray-600">Teachers who have approved your connection requests</p>
            </div>

            {teachers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👨‍🏫</div>
                <p className="text-gray-500 text-lg">No connected teachers yet</p>
                <p className="text-gray-400">Find and connect with teachers to access their quizzes</p>
                <Link
                  href="/searchteachers"
                  className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                >
                  Find Teachers
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="p-6 hover:bg-gray-50/50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {getInitials(teacher.name)}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">{teacher.name}</h4>
                          <p className="text-gray-600">{teacher.email}</p>
                          {teacher.course && (
                            <p className="text-sm text-gray-500 mt-1">Course: {teacher.course}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            Connected: {teacher.connectedAt ? new Date(teacher.connectedAt).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push(`/availablequizzes?teacher=${teacher.id}`)}
                          className="px-4 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors duration-200"
                        >
                          View Quizzes
                        </button>
                        <button
                          onClick={() => handleRemoveConnection(teacher.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Pending Requests</h3>
              <p className="text-gray-600">Connection requests waiting for teacher approval</p>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⏳</div>
                <p className="text-gray-500 text-lg">No pending requests</p>
                <p className="text-gray-400">All your connection requests have been processed</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="p-6 hover:bg-gray-50/50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {getInitials(request.teacherName)}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">{request.teacherName}</h4>
                          <p className="text-gray-600">{request.teacherEmail}</p>
                          {request.course && (
                            <p className="text-sm text-gray-500 mt-1">Course: {request.course}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            Requested: {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
                          Pending
                        </span>
                        <button
                          onClick={() => handleCancelRequest(request.id)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTeachers;