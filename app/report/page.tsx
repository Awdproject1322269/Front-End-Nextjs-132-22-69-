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
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  // Mock data - No API calls needed
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
    },
    {
      id: "6",
      student: "Emma Wilson",
      quiz: "Science Quiz",
      score: 20,
      total: 20,
      percentage: 100,
      grade: "A+",
      timeSpent: "10:20",
      date: "2024-01-16"
    },
    {
      id: "7",
      student: "Michael Brown",
      quiz: "History Quiz",
      score: 15,
      total: 20,
      percentage: 75,
      grade: "B",
      timeSpent: "20:15",
      date: "2024-01-17"
    },
    {
      id: "8",
      student: "Sophia Davis",
      quiz: "English Quiz",
      score: 17,
      total: 20,
      percentage: 85,
      grade: "B+",
      timeSpent: "14:45",
      date: "2024-01-18"
    },
    {
      id: "9",
      student: "David Miller",
      quiz: "Physics Quiz",
      score: 19,
      total: 20,
      percentage: 95,
      grade: "A+",
      timeSpent: "16:20",
      date: "2024-01-19"
    },
    {
      id: "10",
      student: "Olivia Taylor",
      quiz: "Chemistry Quiz",
      score: 16,
      total: 20,
      percentage: 80,
      grade: "B",
      timeSpent: "19:10",
      date: "2024-01-20"
    }
  ];

  // Load reports on component mount
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      // Simulate loading delay
      setTimeout(() => {
        setReports(mockReports);
        const uniqueQuizzes = [...new Set(mockReports.map((r: Report) => r.quiz))];
        setQuizzes(['all', ...uniqueQuizzes]);
        setIsLoading(false);
      }, 800);
    };

    loadData();
  }, []);

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
    if (filtered.length === 0) {
      alert("No reports to download!");
      return;
    }
    
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
      
      // Update quizzes list
      const updatedReports = reports.filter(r => r.id !== reportId);
      const uniqueQuizzes = [...new Set(updatedReports.map((r: Report) => r.quiz))];
      setQuizzes(['all', ...uniqueQuizzes]);
      
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
          <p className="text-gray-600 font-medium">Loading reports dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800">
      {/* Spacer for header */}
      <div className="h-20"></div>

      <main className="max-w-7xl mx-auto px-6 pb-16">
        {/* Controls Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/60 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Performance Analytics</h2>
              <p className="text-gray-600">View and manage student quiz reports (Demo Data)</p>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Search Students</label>
                  <input
                    type="text"
                    placeholder="Search by student name..."
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

          {/* Demo Notice */}
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">💡</span>
              </div>
              <div>
                <p className="text-blue-700 font-medium">Demo Mode</p>
                <p className="text-blue-600 text-sm">Showing sample data. All operations work locally in your browser.</p>
              </div>
            </div>
          </div>

          {/* Selection Info */}
          {selectedReports.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <p className="text-green-700 font-medium">
                  {selectedReports.length} report(s) selected
                </p>
                <button
                  onClick={handleEmailReports}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
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
                <button 
                  onClick={() => handleDownload('csv')}
                  disabled={filtered.length === 0}
                  className="w-full text-left p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>📥</span>
                  <span>Download as CSV</span>
                </button>
                <button 
                  onClick={() => {
                    setReports(mockReports);
                    setSelectedQuiz("all");
                    setSearchTerm("");
                    alert("Data reset to default!");
                  }}
                  className="w-full text-left p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-200 flex items-center gap-3"
                >
                  <span>🔄</span>
                  <span>Reset Demo Data</span>
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