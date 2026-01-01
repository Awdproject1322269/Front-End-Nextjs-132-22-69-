"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Define TypeScript interfaces
interface Student {
  _id: string;
  name: string;
  email: string;
  course: string;
  attendance: boolean;
  allowed: boolean;
  source?: 'studentModel' | 'connection' | undefined;
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
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string>("Quiz 1");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("All");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddStudent, setShowAddStudent] = useState<boolean>(false);
  const [newStudent, setNewStudent] = useState<NewStudent>({
    name: "",
    email: "",
    course: "CS-101"
  });

  const router = useRouter();
  
  // Use environment variable for API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

  // Get current teacher
  const getCurrentTeacher = (): string | null => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user).id : null;
    }
    return null;
  };

  // Fetch students from API
  const fetchStudents = async (): Promise<void> => {
    try {
      const teacherId = getCurrentTeacher();
      if (!teacherId) {
        console.error("Teacher not found in localStorage");
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_BASE}/teacher/students/${teacherId}`);
      const data = await response.json();

      if (data.success) {
        setStudents(data.students);
      } else {
        console.error("Failed to fetch students:", data.message);
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  // Load students on component mount
  useEffect(() => {
    fetchStudents().finally(() => setIsLoading(false));
  }, []);

  // Filter students based on search and course
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "All" || student.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  // Toggle attendance with database update
  const toggleAttendance = async (id: string): Promise<void> => {
    try {
      const student = students.find(s => s._id === id);
      if (!student) return;
      
      const newAttendance = !student.attendance;
      
      // Check if student exists in Student model or is linked student
      if (student.source === 'studentModel' || student.source === undefined) {
        const response = await fetch(`${API_BASE}/students/update/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attendance: newAttendance,
            allowed: newAttendance ? student.allowed : false
          }),
        });

        const data = await response.json();

        if (data.success) {
          setStudents(prev =>
            prev.map(s =>
              s._id === id
                ? {
                    ...s,
                    attendance: newAttendance,
                    allowed: newAttendance ? s.allowed : false
                  }
                : s
            )
          );
        } else {
          alert('Failed to update attendance: ' + data.message);
        }
      } else {
        // For linked students, just update local state
        setStudents(prev =>
          prev.map(s =>
            s._id === id
              ? {
                  ...s,
                  attendance: newAttendance,
                  allowed: newAttendance ? s.allowed : false
                }
              : s
          )
        );
        setStatusMessage("✅ Attendance updated for linked student!");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Error updating attendance');
    }
  };

  // Toggle allow with database update
  const toggleAllow = async (id: string): Promise<void> => {
    try {
      const student = students.find(s => s._id === id);
      if (!student) return;
      
      const newAllowed = !student.allowed;

      // Can't allow if not present
      if (!student.attendance && newAllowed) {
        alert('Cannot allow quiz access for absent students!');
        return;
      }

      // Check if student exists in Student model or is linked student
      if (student.source === 'studentModel' || student.source === undefined) {
        const response = await fetch(`${API_BASE}/students/update/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ allowed: newAllowed }),
        });

        const data = await response.json();

        if (data.success) {
          setStudents(prev =>
            prev.map(s =>
              s._id === id ? { ...s, allowed: newAllowed } : s
            )
          );
        } else {
          alert('Failed to update quiz access: ' + data.message);
        }
      } else {
        // For linked students, just update local state
        setStudents(prev =>
          prev.map(s =>
            s._id === id ? { ...s, allowed: newAllowed } : s
          )
        );
        setStatusMessage("✅ Quiz access updated for linked student!");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    } catch (error) {
      console.error('Error updating quiz access:', error);
      alert('Error updating quiz access');
    }
  };

  // Save all changes
  const handleSave = async (): Promise<void> => {
    setIsLoading(true);
    try {
      setStatusMessage("✅ Attendance and quiz permissions updated successfully!");
      setTimeout(() => setStatusMessage(""), 4000);
    } catch (error) {
      setStatusMessage("❌ Error saving changes");
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: 'markAllPresent' | 'allowAllPresent'): Promise<void> => {
    setIsLoading(true);
    try {
      const teacherId = getCurrentTeacher();
      if (!teacherId) return;
      
      if (action === 'markAllPresent') {
        // Separate students by type
        const studentModelStudents = students.filter(s => s.source === 'studentModel' || s.source === undefined);
        const linkedStudents = students.filter(s => s.source === 'connection');
        
        // Update Student model students via bulk API
        if (studentModelStudents.length > 0) {
          const updates = studentModelStudents.map(student => ({
            studentId: student._id,
            fields: { 
              attendance: true,
            }
          }));

          const response = await fetch(`${API_BASE}/students/bulk-update`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ teacherId, updates }),
          });

          const data = await response.json();
          
          if (!data.success) {
            console.error('Bulk update failed for student model students:', data.message);
          }
        }

        // Update local state for ALL students (both types)
        setStudents(prev => prev.map(student => ({
          ...student,
          attendance: true,
        })));
        
        setStatusMessage("✅ All students marked present!");
      } 
      else if (action === 'allowAllPresent') {
        // Allow all present students (both types)
        const presentStudents = students.filter(s => s.attendance);
        
        // Separate present students by type
        const studentModelPresent = presentStudents.filter(s => s.source === 'studentModel' || s.source === undefined);
        const linkedPresent = presentStudents.filter(s => s.source === 'connection');
        
        // Update Student model students via bulk API
        if (studentModelPresent.length > 0) {
          const updates = studentModelPresent.map(student => ({
            studentId: student._id,
            fields: { allowed: true }
          }));

          const response = await fetch(`${API_BASE}/students/bulk-update`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ teacherId, updates }),
          });

          const data = await response.json();
          
          if (!data.success) {
            console.error('Bulk update failed for student model students:', data.message);
          }
        }

        // Update local state for ALL present students (both types)
        setStudents(prev => prev.map(student => 
          student.attendance ? { ...student, allowed: true } : student
        ));
        
        setStatusMessage("✅ All present students allowed for quiz!");
      }

      setTimeout(() => setStatusMessage(""), 4000);

    } catch (error) {
      console.error('Bulk action error:', error);
      setStatusMessage("❌ Error performing bulk action");
    } finally {
      setIsLoading(false);
    }
  };

  // Add new student with automatic connection creation AND Student model entry
  const handleAddStudent = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const teacherId = getCurrentTeacher();
      if (!teacherId) {
        alert("Teacher not found");
        return;
      }
      
      // 1. First check if student already exists as a user
      const userCheckResponse = await fetch(`${API_BASE}/students/search?query=${encodeURIComponent(newStudent.email)}&teacherId=${teacherId}`);
      const userCheckData = await userCheckResponse.json();

      let studentId: string;
      let studentUser: Student;

      if (userCheckData.success && userCheckData.students.length > 0) {
        // Student already exists as user
        studentUser = userCheckData.students[0];
        studentId = studentUser._id;
      } else {
        // 2. Create new student in teacher's student list (Student model)
        const studentResponse = await fetch(`${API_BASE}/students/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: newStudent.name,
            email: newStudent.email,
            course: newStudent.course,
            teacherId 
          }),
        });

        const studentData = await studentResponse.json();

        if (!studentData.success) {
          alert('Failed to add student: ' + studentData.message);
          return;
        }

        studentId = studentData.student._id;
      }

      // 3. Create connection request
      const connectionResponse = await fetch(`${API_BASE}/connections/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          studentId: studentId,
          course: newStudent.course
        }),
      });

      const connectionData = await connectionResponse.json();

      if (connectionData.success) {
        // 4. Automatically approve the connection
        const approveResponse = await fetch(`${API_BASE}/connections/respond`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connectionId: connectionData.connection.id,
            action: 'approve'
          }),
        });

        const approveData = await approveResponse.json();

        if (approveData.success) {
          setShowAddStudent(false);
          setNewStudent({ name: "", email: "", course: "CS-101" });
          setStatusMessage("✅ Student added and connected successfully!");
          await fetchStudents(); // Refresh list
        } else {
          setStatusMessage("⚠️ Student added but connection failed. Please approve manually in Manage Students.");
        }
      } else {
        setStatusMessage("⚠️ Student added but connection failed. Please connect manually in Manage Students.");
      }

      setTimeout(() => setStatusMessage(""), 5000);
      
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete student
  const handleDeleteStudent = async (id: string, name: string): Promise<void> => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/students/delete/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setStatusMessage("✅ Student deleted successfully!");
        await fetchStudents(); // Refresh list
        setTimeout(() => setStatusMessage(""), 4000);
      } else {
        alert('Failed to delete student: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Error deleting student');
    }
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

  if (isLoading && !statusMessage && students.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading teacher dashboard...</p>
        </div>
      </div>
    );
  }

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
                  Student will be automatically connected to your account and can access your quizzes.
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
                        <option value="CS-101">CS-101</option>
                        <option value="CS-201">CS-201</option>
                        <option value="CS-301">CS-301</option>
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
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
              >
                <span>💬</span>
                Contact Support
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default TeacherControl;