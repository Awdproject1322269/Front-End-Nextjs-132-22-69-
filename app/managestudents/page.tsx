'use client';

import { useState, useEffect } from "react";

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  requestedAt?: string;
  linkedSince?: string;
  status: 'active' | 'pending';
  isLinked?: boolean;
}

function ManageStudents() {
  const [activeTab, setActiveTab] = useState("requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [courseFilter, setCourseFilter] = useState("all");

  // Mock data
  const mockPendingRequests: Student[] = [
    { id: "1", name: "John Doe", email: "john@example.com", course: "Computer Science", requestedAt: "Jan 15, 2024", status: 'pending' },
    { id: "2", name: "Jane Smith", email: "jane@example.com", course: "Mathematics", requestedAt: "Jan 16, 2024", status: 'pending' },
    { id: "3", name: "Bob Johnson", email: "bob@example.com", course: "Physics", requestedAt: "Jan 17, 2024", status: 'pending' },
  ];

  const mockLinkedStudents: Student[] = [
    { id: "4", name: "Alice Williams", email: "alice@example.com", course: "Computer Science", linkedSince: "Dec 20, 2023", status: 'active' },
    { id: "5", name: "Charlie Brown", email: "charlie@example.com", course: "Mathematics", linkedSince: "Dec 15, 2023", status: 'active' },
    { id: "6", name: "Emma Wilson", email: "emma@example.com", course: "Physics", linkedSince: "Jan 5, 2024", status: 'active' },
    { id: "7", name: "Michael Davis", email: "michael@example.com", course: "Computer Science", linkedSince: "Jan 10, 2024", status: 'active' },
    { id: "8", name: "Sophia Garcia", email: "sophia@example.com", course: "Chemistry", linkedSince: "Jan 12, 2024", status: 'active' },
  ];

  const mockSearchResults: Student[] = [
    { id: "9", name: "David Miller", email: "david@example.com", course: "Biology", isLinked: false, status: 'pending' },
    { id: "10", name: "Olivia Taylor", email: "olivia@example.com", course: "Computer Science", isLinked: false, status: 'pending' },
    { id: "11", name: "James Wilson", email: "james@example.com", course: "Mathematics", isLinked: true, status: 'active' },
  ];

  // State for data
  const [pendingRequests, setPendingRequests] = useState<Student[]>([]);
  const [linkedStudents, setLinkedStudents] = useState<Student[]>([]);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [stats, setStats] = useState({
    totalLinked: 0,
    totalPending: 0,
    totalConnections: 0
  });

  // Initialize data
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setPendingRequests(mockPendingRequests);
      setLinkedStudents(mockLinkedStudents);
      setSearchResults([]);
      setStats({
        totalLinked: mockLinkedStudents.length,
        totalPending: mockPendingRequests.length,
        totalConnections: mockLinkedStudents.length + mockPendingRequests.length
      });
      setIsLoading(false);
    }, 500);
  }, []);

  // Handle search students
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      // Filter mock data based on search query
      const results = mockSearchResults.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setIsLoading(false);
    }, 800);
  };

  // Handle approve request
  const handleApprove = async (requestId: string, studentName: string) => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      // Remove from pending requests
      const requestToApprove = pendingRequests.find(req => req.id === requestId);
      if (requestToApprove) {
        // Add to linked students
        const approvedStudent: Student = {
          ...requestToApprove,
          id: `linked_${requestId}`,
          linkedSince: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          status: 'active'
        };
        
        setLinkedStudents(prev => [...prev, approvedStudent]);
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
        
        // Update stats
        setStats(prev => ({
          totalLinked: prev.totalLinked + 1,
          totalPending: prev.totalPending - 1,
          totalConnections: prev.totalConnections
        }));
        
        alert(`Request from ${studentName} approved successfully!`);
      }
      setIsLoading(false);
    }, 500);
  };

  // Handle reject request
  const handleReject = async (requestId: string, studentName: string) => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalPending: prev.totalPending - 1
      }));
      
      alert(`Request from ${studentName} rejected.`);
      setIsLoading(false);
    }, 500);
  };

  // Handle send connection request
  const handleSendRequest = async (student: Student, course: string) => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      // Create a new pending request
      const newRequest: Student = {
        id: `new_${Date.now()}`,
        name: student.name,
        email: student.email,
        course: course,
        requestedAt: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        status: 'pending'
      };
      
      setPendingRequests(prev => [...prev, newRequest]);
      setSearchResults(prev => prev.filter(s => s.id !== student.id));
      
      // Update stats
      setStats(prev => ({
        totalLinked: prev.totalLinked,
        totalPending: prev.totalPending + 1,
        totalConnections: prev.totalConnections + 1
      }));
      
      alert(`Connection request sent to ${student.name} successfully!`);
      setIsLoading(false);
    }, 500);
  };

  // Handle remove student
  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName}?`)) {
      return;
    }

    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setLinkedStudents(prev => prev.filter(student => student.id !== studentId));
      
      // Update stats
      setStats(prev => ({
        totalLinked: prev.totalLinked - 1,
        totalPending: prev.totalPending,
        totalConnections: prev.totalConnections - 1
      }));
      
      alert("Student removed successfully!");
      setIsLoading(false);
    }, 500);
  };

  // Filter linked students by course
  const filteredLinkedStudents = courseFilter === "all" 
    ? linkedStudents 
    : linkedStudents.filter(student => student.course === courseFilter);

  // Get unique courses for filter
  const uniqueCourses = [...new Set(linkedStudents.map(student => student.course))];

  if (isLoading && pendingRequests.length === 0 && linkedStudents.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading student management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800">
      {/* Spacer for header */}
      <div className="h-20"></div>

      <main className="max-w-7xl mx-auto px-6 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Manage Students</h2>
              <p className="text-gray-600">Approve student requests and manage your linked students (Demo)</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Management</h3>
              <nav className="space-y-2">
                {[
                  { id: "requests", name: "Pending Requests", icon: "📨", count: stats.totalPending },
                  { id: "linked", name: "Linked Students", icon: "✅", count: stats.totalLinked },
                  { id: "search", name: "Search Students", icon: "🔍", count: null },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="flex-1">{tab.name}</span>
                    {tab.count !== null && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Stats Summary */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Linked:</span>
                    <span className="font-semibold text-green-600">{stats.totalLinked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Requests:</span>
                    <span className="font-semibold text-orange-600">{stats.totalPending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Connections:</span>
                    <span className="font-semibold text-blue-600">{stats.totalConnections}</span>
                  </div>
                </div>
              </div>

              {/* Demo Notice */}
              <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Demo Mode:</strong> All data is simulated. No backend connection required.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden">
              
              {/* Pending Requests Tab */}
              {activeTab === "requests" && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Pending Requests</h3>
                      <p className="text-gray-600">Approve or reject student connection requests</p>
                    </div>
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {pendingRequests.length} requests
                    </span>
                  </div>

                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-gray-500 text-lg">No pending requests</p>
                      <p className="text-gray-400">Students will appear here when they send connection requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <div key={request.id} className="border border-gray-200 rounded-2xl p-6 hover:border-indigo-300 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl flex items-center justify-center">
                                <span className="text-xl">👤</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">{request.name}</h4>
                                <p className="text-gray-600 text-sm">{request.email}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  <span>Course: {request.course}</span>
                                  <span>Requested: {request.requestedAt}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleApprove(request.id, request.name)}
                                disabled={isLoading}
                                className="px-4 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors duration-200 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(request.id, request.name)}
                                disabled={isLoading}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Linked Students Tab */}
              {activeTab === "linked" && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Linked Students</h3>
                      <p className="text-gray-600">Manage your connected students and their access</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {uniqueCourses.length > 0 && (
                        <select
                          value={courseFilter}
                          onChange={(e) => setCourseFilter(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="all">All Courses</option>
                          {uniqueCourses.map(course => (
                            <option key={course} value={course}>{course}</option>
                          ))}
                        </select>
                      )}
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold">
                        {filteredLinkedStudents.length} students
                      </span>
                    </div>
                  </div>

                  {filteredLinkedStudents.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">✅</div>
                      <p className="text-gray-500 text-lg">No linked students yet</p>
                      <p className="text-gray-400">Approve student requests to see them here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredLinkedStudents.map((student) => (
                        <div key={student.id} className="border border-gray-200 rounded-2xl p-6 hover:border-green-300 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-teal-100 rounded-2xl flex items-center justify-center">
                                <span className="text-xl">👤</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">{student.name}</h4>
                                <p className="text-gray-600 text-sm">{student.email}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  <span>Course: {student.course}</span>
                                  <span>Linked: {student.linkedSince}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    student.status === 'active' 
                                      ? 'bg-green-100 text-green-600' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {student.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => window.location.href = '/teachercontrol'}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors duration-200"
                              >
                                Manage Access
                              </button>
                              <button
                                onClick={() => handleRemoveStudent(student.id, student.name)}
                                disabled={isLoading}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
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
              )}

              {/* Search Students Tab */}
              {activeTab === "search" && (
                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Search Students</h3>
                    <p className="text-gray-600">Find students by name or email and send them invitations</p>
                  </div>

                  {/* Search Bar */}
                  <div className="flex gap-3 mb-8">
                    <input
                      type="text"
                      placeholder="Search by student name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={isLoading || !searchQuery.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
                    >
                      {isLoading ? "Searching..." : "Search"}
                    </button>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800">Search Results ({searchResults.length})</h4>
                      {searchResults.map((student) => (
                        <div key={student.id} className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center">
                                <span className="text-xl">👤</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">{student.name}</h4>
                                <p className="text-gray-600 text-sm">{student.email}</p>
                                <p className={`text-sm mt-1 ${
                                  student.isLinked ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                  {student.isLinked ? '✓ Already linked' : 'Available for connection'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const course = prompt(`Enter course name for ${student.name}:`, "General");
                                if (course) {
                                  handleSendRequest(student, course);
                                }
                              }}
                              disabled={student.isLinked || isLoading}
                              className={`px-4 py-2 rounded-xl font-semibold transition-colors duration-200 ${
                                student.isLinked
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              }`}
                            >
                              {student.isLinked ? 'Already Linked' : 'Send Request'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery && !isLoading ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🔍</div>
                      <p className="text-gray-500">No students found matching your search</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">👥</div>
                      <p className="text-gray-500">Search for students by name or email</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Demo Notice */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white p-6">
          <h3 className="text-lg font-semibold mb-2">💡 Demo Information</h3>
          <p className="text-indigo-100">
            This is a standalone frontend demo. All student data is simulated and changes are temporary.
            To persist data, you would need backend integration.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ManageStudents;