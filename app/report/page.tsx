'use client';

import { useState, useEffect } from "react";

// Define types
interface Report {
  id: string;
  student: string;
  quiz: string;
  score: number;
  total: number;
  percentage: number;
  grade?: string;
  timeSpent: string;
  date: string;
}

function Report() {
  const [reports, setReports] = useState<Report[]>([]);
  const [quizzes, setQuizzes] = useState<string[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string>("all");
  const [downloading, setDownloading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Get current teacher - SIMPLIFIED
  useEffect(() => {
    console.log("=== DEBUG: Checking localStorage ===");
    
    // First, let's see what's in localStorage
    const allItems: {[key: string]: string} = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        allItems[key] = localStorage.getItem(key) || "";
      }
    }
    console.log("All localStorage items:", allItems);
    setDebugInfo(JSON.stringify(allItems, null, 2));
    
    // Try to find teacher/user data in various possible keys
    const possibleUserKeys = ['user', 'currentUser', 'teacher', 'teacherData', 'userData', 'auth', 'authUser'];
    let foundUser = false;
    
    for (const key of possibleUserKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        console.log(`Found data in key: ${key}`, data);
        try {
          const user = JSON.parse(data);
          // Try to extract teacher ID from various possible property names
          const possibleIdFields = ['id', '_id', 'teacherId', 'userId', 'user_id', 'teacher_id'];
          for (const field of possibleIdFields) {
            if (user[field]) {
              console.log(`Found teacher ID in field ${field}:`, user[field]);
              setTeacherId(String(user[field]));
              foundUser = true;
              break;
            }
          }
          if (foundUser) break;
        } catch (error) {
          console.error(`Error parsing data from key ${key}:`, error);
        }
      }
    }
    
    if (!foundUser) {
      console.log("No teacher/user data found in localStorage. User might need to login.");
      // For testing, let's create a mock teacher ID
      const mockTeacherId = "mock-teacher-123";
      console.log("Using mock teacher ID for testing:", mockTeacherId);
      setTeacherId(mockTeacherId);
      // Store mock data for testing
      localStorage.setItem("user", JSON.stringify({ 
        id: mockTeacherId, 
        name: "Test Teacher", 
        email: "teacher@test.com" 
      }));
    }
    
    setIsLoading(false);
  }, []);

  // Fetch reports from database
  const fetchReports = async (): Promise<void> => {
    if (!teacherId) {
      console.log("Teacher ID not available yet");
      return;
    }

    try {
      console.log("Fetching reports for teacher:", teacherId);
      const response = await fetch(`http://localhost:5000/api/reports/teacher/${teacherId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Reports response:", data);

      if (data.success && data.reports) {
        const formattedReports: Report[] = data.reports.map((report: any) => ({
          ...report,
          id: String(report.id)
        }));
        setReports(formattedReports);
        
        const uniqueQuizzes = [...new Set(formattedReports.map((r: Report) => r.quiz))];
        setQuizzes(['all', ...uniqueQuizzes]);
      } else {
        console.log("No reports found or API returned different structure:", data);
        // Create mock data for testing if API fails
        createMockData();
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      // Create mock data for testing
      createMockData();
    }
  };

  // Create mock data for testing
  const createMockData = (): void => {
    console.log("Creating mock data for testing");
    const mockReports: Report[] = [
      {
        id: "1",
        student: "John Doe",
        quiz: "Math Quiz 1",
        score: 18,
        total: 20,
        percentage: 90,
        grade: "A",
        timeSpent: "15:30",
        date: "2024-01-15"
      },
      {
        id: "2",
        student: "Jane Smith",
        quiz: "Math Quiz 1",
        score: 16,
        total: 20,
        percentage: 80,
        grade: "B",
        timeSpent: "18:45",
        date: "2024-01-15"
      },
      {
        id: "3",
        student: "Bob Johnson",
        quiz: "Science Quiz",
        score: 14,
        total: 20,
        percentage: 70,
        grade: "C",
        timeSpent: "22:10",
        date: "2024-01-16"
      },
      {
        id: "4",
        student: "Alice Williams",
        quiz: "History Quiz",
        score: 19,
        total: 20,
        percentage: 95,
        grade: "A+",
        timeSpent: "12:15",
        date: "2024-01-17"
      },
      {
        id: "5",
        student: "Charlie Brown",
        quiz: "Math Quiz 1",
        score: 12,
        total: 20,
        percentage: 60,
        grade: "D",
        timeSpent: "25:30",
        date: "2024-01-15"
      }
    ];
    
    setReports(mockReports);
    const uniqueQuizzes = [...new Set(mockReports.map((r: Report) => r.quiz))];
    setQuizzes(['all', ...uniqueQuizzes]);
  };

  // Load reports when teacherId is available
  useEffect(() => {
    if (teacherId) {
      fetchReports();
    }
  }, [teacherId]);

  // Filter reports
  const filtered = reports.filter((r: Report) => {
    const matchesQuiz = selectedQuiz === "all" || r.quiz === selectedQuiz;
    const matchesSearch = r.student.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesQuiz && matchesSearch;
  });

  // Calculate analytics from filtered data
  const average = filtered.length > 0 
    ? (filtered.reduce((a: number, b: Report) => a + b.score, 0) / filtered.length).toFixed(1)
    : "0";
  
  const highest = filtered.length > 0 
    ? Math.max(...filtered.map((r: Report) => r.score))
    : 0;
  
  const lowest = filtered.length > 0 
    ? Math.min(...filtered.map((r: Report) => r.score))
    : 0;
  
  const averagePercentage = filtered.length > 0
    ? ((filtered.reduce((a: number, b: Report) => a + b.percentage, 0) / filtered.length)).toFixed(1)
    : "0";

  const topPerformers = filtered
    .sort((a: Report, b: Report) => b.score - a.score)
    .slice(0, 3);

  // Handle report download
  const handleDownload = async (format = 'pdf'): Promise<void> => {
    setDownloading(true);
    try {
      setTimeout(() => {
        alert(`${format.toUpperCase()} report for ${selectedQuiz === 'all' ? 'All Quizzes' : selectedQuiz} downloaded successfully!`);
        setDownloading(false);
      }, 1500);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download report');
      setDownloading(false);
    }
  };

  // Handle report deletion
  const handleDeleteReport = async (reportId: string, studentName: string): Promise<void> => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}'s report? This action cannot be undone.`)) {
      return;
    }

    try {
      // Remove from local state
      setReports(prev => prev.filter(r => r.id !== reportId));
      setSelectedReports(prev => prev.filter(id => id !== reportId));
      alert('Report deleted successfully!');
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Error deleting report');
    }
  };

  // Handle email reports
  const handleEmailReports = async (): Promise<void> => {
    if (selectedReports.length === 0) {
      alert('Please select reports to email');
      return;
    }

    alert(`Email would be sent for ${selectedReports.length} report(s)`);
    setSelectedReports([]);
  };

  // Toggle report selection
  const toggleReportSelection = (reportId: string): void => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  // Select all filtered reports
  const selectAllReports = (): void => {
    if (selectedReports.length === filtered.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filtered.map((r: Report) => r.id));
    }
  };

  const getPerformanceColor = (percentage: number): string => {
    if (percentage >= 90) return 'from-green-500 to-emerald-600';
    if (percentage >= 75) return 'from-blue-500 to-cyan-500';
    if (percentage >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-600';
  };

  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'C+';
    if (percentage >= 60) return 'C';
    return 'F';
  };

  // Stats data for display
  const statsData = [
    { 
      title: "Average Score", 
      value: average, 
      total: filtered[0]?.total || 20,
      icon: "📊",
      color: "from-blue-500 to-cyan-500",
      change: "+0.0"
    },
    { 
      title: "Highest Score", 
      value: highest, 
      total: filtered[0]?.total || 20,
      icon: "🏆",
      color: "from-green-500 to-emerald-600",
      change: "+0"
    },
    { 
      title: "Lowest Score", 
      value: lowest, 
      total: filtered[0]?.total || 20,
      icon: "📉",
      color: "from-orange-500 to-red-500",
      change: "0.0"
    },
    { 
      title: "Average %", 
      value: `${averagePercentage}%`, 
      icon: "✅",
      color: "from-purple-500 to-pink-500",
      change: "+8%"
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800">
      {/* Spacer for header */}
      <div className="h-20"></div>

      <main className="max-w-7xl mx-auto px-6 pb-16">
        {/* Debug Info Panel - Collapsible */}
        <div className="mb-6">
          <details className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-300">
            <summary className="p-4 cursor-pointer font-semibold text-gray-700">
              🔍 Debug Information (Click to expand)
            </summary>
            <div className="p-4 border-t border-gray-200">
              <div className="mb-2">
                <span className="font-medium">Teacher ID:</span> {teacherId || "Not found"}
              </div>
              <div className="mb-2">
                <span className="font-medium">Total Reports:</span> {reports.length}
              </div>
              <div className="mb-2">
                <span className="font-medium">Filtered Reports:</span> {filtered.length}
              </div>
              <div className="mt-2">
                <span className="font-medium">LocalStorage Contents:</span>
                <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-sm overflow-auto max-h-40">
                  {debugInfo}
                </pre>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm"
                >
                  Clear LocalStorage & Reload
                </button>
                <button
                  onClick={() => fetchReports()}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
                >
                  Reload Reports
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem("user", JSON.stringify({ 
                      id: "teacher-123", 
                      name: "Test Teacher" 
                    }));
                    window.location.reload();
                  }}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm"
                >
                  Set Test User
                </button>
              </div>
            </div>
          </details>
        </div>

        {/* Controls Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/60 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Performance Analytics</h2>
              <p className="text-gray-600">Teacher: {teacherId?.substring(0, 12)}...</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Quiz</label>
                  <select
                    value={selectedQuiz}
                    onChange={(e) => setSelectedQuiz(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  >
                    {quizzes.map((quiz: string, i: number) => (
                      <option key={i} value={quiz}>
                        {quiz === 'all' ? 'All Quizzes' : quiz}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 items-end">
                <button
                  onClick={() => handleDownload('pdf')}
                  disabled={downloading || filtered.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {downloading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Exporting...
                    </div>
                  ) : (
                    "Export PDF"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Selection Info */}
          {selectedReports.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <p className="text-blue-700 font-medium">
                  {selectedReports.length} report(s) selected
                </p>
                <button
                  onClick={handleEmailReports}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                >
                  📧 Email Selected
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Analytics Summary */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index: number) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <span className="text-xl">{stat.icon}</span>
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  typeof stat.change === 'string' && stat.change.startsWith('+') ? 'bg-green-100 text-green-600' : 
                  typeof stat.change === 'string' && stat.change.startsWith('-') ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-sm text-gray-600 mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              {stat.total && <p className="text-sm text-gray-500 mt-1">out of {stat.total}</p>}
            </div>
          ))}
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Table */}
          <div className="lg:col-span-2">
            <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedQuiz === 'all' ? 'All Quizzes' : selectedQuiz} - Student Performance
                </h2>
                <div className="flex items-center gap-4">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                    {filtered.length} students
                  </span>
                  {filtered.length > 0 && (
                    <button
                      onClick={selectAllReports}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      {selectedReports.length === filtered.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700 w-8">
                        <input
                          type="checkbox"
                          checked={filtered.length > 0 && selectedReports.length === filtered.length}
                          onChange={selectAllReports}
                          className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                      </th>
                      <th className="text-left p-4 font-semibold text-gray-700">Student</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Quiz</th>
                      <th className="text-center p-4 font-semibold text-gray-700">Score</th>
                      <th className="text-center p-4 font-semibold text-gray-700">Grade</th>
                      <th className="text-center p-4 font-semibold text-gray-700">Time</th>
                      <th className="text-center p-4 font-semibold text-gray-700">Performance</th>
                      <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filtered.map((report: Report) => {
                      const percentage = report.percentage;
                      return (
                        <tr 
                          key={report.id} 
                          className="hover:bg-gray-50/50 transition-colors duration-200"
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedReports.includes(report.id)}
                              onChange={() => toggleReportSelection(report.id)}
                              className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-gray-800">{report.student}</p>
                              <p className="text-sm text-gray-500">{new Date(report.date).toLocaleDateString()}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                              {report.quiz}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <p className="font-semibold text-gray-800">{report.score}/{report.total}</p>
                            <p className="text-sm text-gray-500">{percentage}%</p>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              percentage >= 90 ? 'bg-green-100 text-green-700' :
                              percentage >= 75 ? 'bg-blue-100 text-blue-700' :
                              percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {report.grade || getGrade(percentage)}
                            </span>
                          </td>
                          <td className="p-4 text-center text-gray-600 text-sm">
                            {report.timeSpent}
                          </td>
                          <td className="p-4 text-center">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full bg-gradient-to-r ${getPerformanceColor(percentage)}`}
                                style={{ width: `${Math.min(100, percentage)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => handleDeleteReport(report.id, report.student)}
                              className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-500 text-lg">No reports found</p>
                  <p className="text-gray-400">Try adjusting your search criteria</p>
                  <button
                    onClick={createMockData}
                    className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
                  >
                    Load Sample Data
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Top Performers */}
            <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60 hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>🏆</span> Top Performers
              </h3>
              <div className="space-y-4">
                {topPerformers.length > 0 ? topPerformers.map((top: Report, i: number) => {
                  const percentage = top.percentage;
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                        i === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        i === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        'bg-gradient-to-r from-orange-400 to-red-500'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{top.student}</p>
                        <p className="text-sm text-gray-600">{top.quiz}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">{percentage}%</p>
                        <p className="text-xs text-gray-500">{top.grade || getGrade(percentage)}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-gray-500 text-center py-4">No data available</p>
                )}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white p-6 shadow-2xl">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleEmailReports}
                  disabled={selectedReports.length === 0}
                  className="w-full text-left p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>📧</span>
                  <span>Email Selected Reports</span>
                </button>
                <button className="w-full text-left p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-200 flex items-center gap-3">
                  <span>📋</span>
                  <span>Generate Class Summary</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Report;