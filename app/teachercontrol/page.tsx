"use client";

import { useState, useEffect } from "react";

// Define TypeScript interfaces
interface Student {
  _id: string;
  name: string;
  email: string;
  course: string;
  attendance: boolean;
  allowed: boolean;
}

interface NewStudent {
  name: string;
  email: string;
  course: string;
}

interface Stat {
  title: string;
  value: number;
  icon: string;
  color: string;
}

interface Activity {
  date: string;
  action: string;
  icon: string;
}

function TeacherControl() {
  // Mock student data
  const mockStudents: Student[] = [
    { _id: "1", name: "John Doe", email: "john@example.com", course: "CS-101", attendance: true, allowed: true },
    { _id: "2", name: "Jane Smith", email: "jane@example.com", course: "CS-101", attendance: true, allowed: false },
    { _id: "3", name: "Bob Johnson", email: "bob@example.com", course: "CS-201", attendance: false, allowed: false },
    { _id: "4", name: "Alice Williams", email: "alice@example.com", course: "CS-201", attendance: true, allowed: true },
    { _id: "5", name: "Charlie Brown", email: "charlie@example.com", course: "CS-301", attendance: false, allowed: false },
    { _id: "6", name: "Emma Wilson", email: "emma@example.com", course: "CS-101", attendance: true, allowed: true },
    { _id: "7", name: "Michael Davis", email: "michael@example.com", course: "CS-301", attendance: true, allowed: false },
    { _id: "8", name: "Sophia Garcia", email: "sophia@example.com", course: "CS-201", attendance: false, allowed: false },
    { _id: "9", name: "David Miller", email: "david@example.com", course: "CS-101", attendance: true, allowed: true },
    { _id: "10", name: "Olivia Taylor", email: "olivia@example.com", course: "CS-301", attendance: true, allowed: true },
  ];

  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [selectedQuiz, setSelectedQuiz] = useState<string>("Quiz 1");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("All");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAddStudent, setShowAddStudent] = useState<boolean>(false);
  const [newStudent, setNewStudent] = useState<NewStudent>({
    name: "",
    email: "",
    course: "CS-101"
  });

  // Initialize students from localStorage if available, otherwise use mock data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStudents = localStorage.getItem("teacherControlStudents");
      if (savedStudents) {
        try {
          setStudents(JSON.parse(savedStudents));
        } catch (error) {
          console.error("Error loading saved students:", error);
          // Keep using mockStudents as fallback
        }
      }
    }
  }, []);

  // Save students to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && students.length > 0) {
      localStorage.setItem("teacherControlStudents", JSON.stringify(students));
    }
  }, [students]);

  // Filter students based on search and course
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "All" || student.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  // Toggle attendance
  const toggleAttendance = (id: string): void => {
    setStudents(prev =>
      prev.map(s =>
        s._id === id
          ? {
              ...s,
              attendance: !s.attendance,
              allowed: !s.attendance ? s.allowed : false // Reset allowed if marking absent
            }
          : s
      )
    );
    setStatusMessage("✅ Attendance updated!");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  // Toggle allow
  const toggleAllow = (id: string): void => {
    const student = students.find(s => s._id === id);
    if (!student) return;
    
    const newAllowed = !student.allowed;

    // Can't allow if not present
    if (!student.attendance && newAllowed) {
      alert('Cannot allow quiz access for absent students!');
      return;
    }

    setStudents(prev =>
      prev.map(s =>
        s._id === id ? { ...s, allowed: newAllowed } : s
      )
    );
    setStatusMessage("✅ Quiz access updated!");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  // Save all changes
  const handleSave = (): void => {
    setIsLoading(true);
    setTimeout(() => {
      setStatusMessage("✅ All changes saved successfully!");
      setIsLoading(false);
      setTimeout(() => setStatusMessage(""), 4000);
    }, 1000);
  };

  // Bulk actions
  const handleBulkAction = (action: 'markAllPresent' | 'allowAllPresent'): void => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (action === 'markAllPresent') {
        setStudents(prev => prev.map(student => ({
          ...student,
          attendance: true,
        })));
        setStatusMessage("✅ All students marked present!");
      } else if (action === 'allowAllPresent') {
        setStudents(prev => prev.map(student => 
          student.attendance ? { ...student, allowed: true } : student
        ));
        setStatusMessage("✅ All present students allowed for quiz!");
      }
      
      setIsLoading(false);
      setTimeout(() => setStatusMessage(""), 4000);
    }, 1000);
  };

  // Add new student
  const handleAddStudent = (e: React.FormEvent): void => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      const newId = (students.length + 1).toString();
      const newStudentObj: Student = {
        _id: newId,
        name: newStudent.name,
        email: newStudent.email,
        course: newStudent.course,
        attendance: false,
        allowed: false
      };
      
      setStudents(prev => [...prev, newStudentObj]);
      setShowAddStudent(false);
      setNewStudent({ name: "", email: "", course: "CS-101" });
      setStatusMessage("✅ Student added successfully!");
      
      setIsLoading(false);
      setTimeout(() => setStatusMessage(""), 5000);
    }, 1000);
  };

  // Delete student
  const handleDeleteStudent = (id: string, name: string): void => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    setStudents(prev => prev.filter(student => student._id !== id));
    setStatusMessage("✅ Student deleted successfully!");
    setTimeout(() => setStatusMessage(""), 4000);
  };

  const stats: Stat[] = [
    { 
      title: "Total Students", 
      value: students.length, 
      icon: "👥",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      title: "Present Today", 
      value: students.filter((s) => s.attendance).length,
      icon: "✅",
      color: "from-green-500 to-teal-500"
    },
    { 
      title: "Allowed for Quiz", 
      value: students.filter((s) => s.allowed).length,
      icon: "🎯",
      color: "from-purple-500 to-pink-500"
    },
    { 
      title: "Pending Attendance", 
      value: students.filter((s) => !s.attendance).length,
      icon: "⏳",
      color: "from-orange-500 to-red-500"
    },
  ];

  const courses = ["All", ...new Set(students.map(s => s.course))];

  const activities: Activity[] = [
    { date: "10 Oct 2025", action: "Attendance updated for Quiz 3", icon: "📊" },
    { date: "8 Oct 2025", action: `${students.filter(s => s.allowed).length} students allowed to attempt Quiz 2`, icon: "✅" },
    { date: "5 Oct 2025", action: "Teacher settings saved successfully", icon: "⚙️" },
    { date: "3 Oct 2025", action: "Reports generated for Batch 2022-CS", icon: "📈" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800">
      {/* Spacer for header */}
      <div className="h-20"></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <span className="text-lg sm:text-xl">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Quiz Selection Card */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 border border-white/60 mb-6 sm:mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Quiz Attendance & Permissions</h2>
              <p className="text-gray-600 text-sm sm:text-base">Manage student access and attendance for upcoming quizzes</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Quiz</label>
                <select
                  value={selectedQuiz}
                  onChange={(e) => setSelectedQuiz(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-sm sm:text-base"
                >
                  <option value="Quiz 1">Quiz 1 - Fundamentals of Programming</option>
                  <option value="Quiz 2">Quiz 2 - Object-Oriented Concepts</option>
                  <option value="Quiz 3">Quiz 3 - Data Structures</option>
                </select>
              </div>
              
              <div className="flex gap-3 items-end">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 sm:px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>

          {statusMessage && (
            <div className={`mt-4 p-4 rounded-xl ${
              statusMessage.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-medium text-sm sm:text-base ${statusMessage.includes('✅') ? 'text-green-700' : 'text-red-700'}`}>
                {statusMessage}
              </p>
            </div>
          )}
        </section>

        {/* Student Management Card */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 border border-white/60 mb-6 sm:mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Student Management</h2>
              <p className="text-gray-600 text-sm sm:text-base">Manage attendance and quiz permissions for individual students</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkAction('markAllPresent')}
                  disabled={isLoading}
                  className="px-3 sm:px-4 py-2 bg-green-50 text-green-700 rounded-xl font-medium hover:bg-green-100 transition-colors duration-200 disabled:opacity-50 text-sm"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => handleBulkAction('allowAllPresent')}
                  disabled={isLoading}
                  className="px-3 sm:px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-medium hover:bg-purple-100 transition-colors duration-200 disabled:opacity-50 text-sm"
                >
                  Allow All Present
                </button>
                <button
                  onClick={() => setShowAddStudent(true)}
                  className="px-3 sm:px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors duration-200 text-sm"
                >
                  + Add Student
                </button>
              </div>
            </div>
          </div>

          {/* Add Student Modal */}
          {showAddStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Student</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add students to manage their attendance and quiz permissions.
                </p>
                <form onSubmit={handleAddStudent}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        required
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-sm sm:text-base"
                        placeholder="Enter student name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={newStudent.email}
                        onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-sm sm:text-base"
                        placeholder="Enter student email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
                      <select
                        value={newStudent.course}
                        onChange={(e) => setNewStudent({...newStudent, course: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-sm sm:text-base"
                      >
                        <option value="CS-101">CS-101 - Fundamentals of Programming</option>
                        <option value="CS-201">CS-201 - Object-Oriented Concepts</option>
                        <option value="CS-301">CS-301 - Data Structures</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
                    >
                      {isLoading ? "Adding..." : "Add Student"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddStudent(false)}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Students</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-sm sm:text-base"
              >
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Student</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Course</th>
                  <th className="text-center p-4 font-semibold text-gray-700 text-sm">Attendance</th>
                  <th className="text-center p-4 font-semibold text-gray-700 text-sm">Quiz Access</th>
                  <th className="text-center p-4 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="text-center p-4 font-semibold text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr 
                    key={student._id} 
                    className="hover:bg-gray-50/50 transition-colors duration-200"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-800 text-sm sm:text-base">{student.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{student.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                        {student.course}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleAttendance(student._id)}
                        disabled={isLoading}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          student.attendance 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        } disabled:opacity-50`}
                      >
                        {student.attendance ? '✅' : '❌'}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleAllow(student._id)}
                        disabled={!student.attendance || isLoading}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          student.allowed 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : student.attendance 
                            ? 'bg-gray-100 text-gray-400 hover:bg-gray-200' 
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        } disabled:opacity-50`}
                      >
                        {student.allowed ? '🎯' : '⏸️'}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                        student.allowed 
                          ? 'bg-green-100 text-green-700' 
                          : student.attendance 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {student.allowed ? 'Allowed' : student.attendance ? 'Present' : 'Absent'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteStudent(student._id, student.name)}
                        disabled={isLoading}
                        className="px-2 sm:px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 text-xs sm:text-sm font-medium disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">No students found</p>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <span className="text-lg">💡</span>
              Only students marked <strong>present</strong> can be allowed to take the quiz. Attendance must be marked before granting quiz access.
            </p>
          </div>
        </section>

        {/* Activity and Info Grid */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Activity Logs */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>📅</span> Recent Activity
            </h3>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors duration-200">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{activity.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm sm:text-base">{activity.action}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Help Section */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>❓</span> How This Works
            </h3>
            <ul className="space-y-3 text-indigo-100 text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <span className="text-lg">📚</span>
                <span>Each quiz is linked with registered courses and topics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">✅</span>
                <span>Mark attendance before activating any quiz</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">🔒</span>
                <span>Absent students cannot access quiz links</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">⚖️</span>
                <span>Ensures assessment integrity and fairness</span>
              </li>
            </ul>
            
            <div className="mt-6 pt-4 border-t border-indigo-400">
              <div className="text-sm text-indigo-200 mb-2">
                <strong>Note:</strong> This is a standalone demo. All data is saved locally in your browser.
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default TeacherControl;