'use client';

import { useState, useEffect } from "react";

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  credits: number;
  department: string;
  students: number;
  topics: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  courseId: string;
  courseTitle: string;
  courseCode: string;
  order: number;
  quizzes: number;
}

function CourseManagement() {
  const [activeTab, setActiveTab] = useState("mycourses");
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Form data
  const [courseForm, setCourseForm] = useState({
    title: "",
    code: "",
    description: "",
    credits: 3,
    department: "Computer Science"
  });

  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    duration: 1,
    difficulty: "medium" as "easy" | "medium" | "hard"
  });

  // Mock data
  const mockCourses: Course[] = [
    {
      id: "1",
      title: "Data Structures",
      code: "CS-201",
      description: "Fundamental data structures and algorithms",
      credits: 3,
      department: "Computer Science",
      students: 45,
      topics: 8,
      status: 'active',
      createdAt: "Jan 15, 2024"
    },
    {
      id: "2",
      title: "Database Systems",
      code: "CS-301",
      description: "Relational database design and SQL",
      credits: 4,
      department: "Computer Science",
      students: 32,
      topics: 6,
      status: 'active',
      createdAt: "Feb 10, 2024"
    },
    {
      id: "3",
      title: "Operating Systems",
      code: "CS-401",
      description: "Principles of operating system design",
      credits: 3,
      department: "Computer Science",
      students: 28,
      topics: 7,
      status: 'active',
      createdAt: "Mar 5, 2024"
    }
  ];

  const mockTopics: Topic[] = [
    {
      id: "1",
      title: "Arrays and Linked Lists",
      description: "Basic linear data structures",
      duration: 2,
      difficulty: "easy",
      courseId: "1",
      courseTitle: "Data Structures",
      courseCode: "CS-201",
      order: 1,
      quizzes: 3
    },
    {
      id: "2",
      title: "Stacks and Queues",
      description: "Abstract data types and their implementations",
      duration: 2,
      difficulty: "medium",
      courseId: "1",
      courseTitle: "Data Structures",
      courseCode: "CS-201",
      order: 2,
      quizzes: 2
    },
    {
      id: "3",
      title: "Relational Database Design",
      description: "ER diagrams and normalization",
      duration: 3,
      difficulty: "medium",
      courseId: "2",
      courseTitle: "Database Systems",
      courseCode: "CS-301",
      order: 1,
      quizzes: 4
    },
    {
      id: "4",
      title: "SQL Queries",
      description: "Structured Query Language fundamentals",
      duration: 2,
      difficulty: "easy",
      courseId: "2",
      courseTitle: "Database Systems",
      courseCode: "CS-301",
      order: 2,
      quizzes: 5
    },
    {
      id: "5",
      title: "Process Management",
      description: "Process scheduling and synchronization",
      duration: 2,
      difficulty: "hard",
      courseId: "3",
      courseTitle: "Operating Systems",
      courseCode: "CS-401",
      order: 1,
      quizzes: 3
    }
  ];

  // State for data
  const [courses, setCourses] = useState<Course[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Initialize data
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setCourses(mockCourses);
      setTopics(mockTopics);
      setIsLoading(false);
    }, 800);
  }, []);

  // Handle create course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const newCourse: Course = {
        id: `course_${Date.now()}`,
        title: courseForm.title,
        code: courseForm.code,
        description: courseForm.description,
        credits: courseForm.credits,
        department: courseForm.department,
        students: 0,
        topics: 0,
        status: 'active',
        createdAt: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      };
      
      setCourses(prev => [...prev, newCourse]);
      setCourseForm({
        title: "",
        code: "",
        description: "",
        credits: 3,
        department: "Computer Science"
      });
      setShowCreateForm(false);
      alert("Course created successfully!");
      setIsLoading(false);
    }, 600);
  };

  // Handle add topic
  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const newTopic: Topic = {
        id: `topic_${Date.now()}`,
        title: topicForm.title,
        description: topicForm.description,
        duration: topicForm.duration,
        difficulty: topicForm.difficulty,
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        courseCode: selectedCourse.code,
        order: topics.filter(t => t.courseId === selectedCourse.id).length + 1,
        quizzes: 0
      };
      
      setTopics(prev => [...prev, newTopic]);
      
      // Update course topics count
      setCourses(prev => prev.map(course => 
        course.id === selectedCourse.id 
          ? { ...course, topics: course.topics + 1 }
          : course
      ));
      
      setTopicForm({
        title: "",
        description: "",
        duration: 1,
        difficulty: "medium"
      });
      setShowTopicForm(false);
      setSelectedCourse(null);
      
      alert("Topic added successfully!");
      setIsLoading(false);
    }, 600);
  };

  // Handle delete course
  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setCourses(prev => prev.filter(course => course.id !== courseId));
      // Also remove associated topics
      setTopics(prev => prev.filter(topic => topic.courseId !== courseId));
      alert("Course deleted successfully!");
      setIsLoading(false);
    }, 500);
  };

  // Handle delete topic
  const handleDeleteTopic = async (topicId: string) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) {
      return;
    }

    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
        setTopics(prev => prev.filter(t => t.id !== topicId));
        // Update course topics count
        setCourses(prev => prev.map(course => 
          course.id === topic.courseId 
            ? { ...course, topics: Math.max(0, course.topics - 1) }
            : course
        ));
      }
      alert("Topic deleted successfully!");
      setIsLoading(false);
    }, 500);
  };

  // Get topics for selected course
  const getCourseTopics = (courseId: string) => {
    return topics.filter(topic => topic.courseId === courseId)
                .sort((a, b) => a.order - b.order);
  };

  if (isLoading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading course management...</p>
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Course Management</h2>
                <p className="text-gray-600">Create courses, add topics, and organize your teaching materials (Demo)</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            >
              + New Course
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Management</h3>
              <nav className="space-y-2">
                {[
                  { id: "mycourses", name: "My Courses", icon: "📖", count: courses.length },
                  { id: "topics", name: "All Topics", icon: "📝", count: topics.length },
                  { id: "analytics", name: "Analytics", icon: "📊", count: null },
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

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Course Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Courses:</span>
                    <span className="font-semibold text-blue-600">{courses.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Topics:</span>
                    <span className="font-semibold text-green-600">{topics.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Students:</span>
                    <span className="font-semibold text-purple-600">
                      {courses.reduce((sum, course) => sum + course.students, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Demo Notice */}
              <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Demo Mode:</strong> All operations work locally. Data resets on refresh.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden">
              
              {/* My Courses Tab */}
              {activeTab === "mycourses" && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">My Courses</h3>
                      <p className="text-gray-600">Manage your courses and their content</p>
                    </div>
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {courses.length} courses
                    </span>
                  </div>

                  {courses.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📚</div>
                      <p className="text-gray-500 text-lg">No courses created yet</p>
                      <p className="text-gray-400">Create your first course to get started</p>
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                      >
                        Create First Course
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {courses.map((course) => (
                        <div key={course.id} className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all duration-300 group">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                                {course.title}
                              </h4>
                              <p className="text-gray-600 text-sm">{course.code} • {course.credits} Credits</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              course.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {course.status}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-4 text-sm">{course.description}</p>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-4">
                              <span>👥 {course.students} students</span>
                              <span>📝 {course.topics} topics</span>
                            </div>
                            <span>Created: {course.createdAt}</span>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setSelectedCourse(course);
                                setShowTopicForm(true);
                              }}
                              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-200"
                            >
                              Add Topic
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </div>

                          {/* Course Topics Preview */}
                          {getCourseTopics(course.id).length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h5 className="font-semibold text-gray-800 mb-2">Topics:</h5>
                              <div className="space-y-2">
                                {getCourseTopics(course.id).slice(0, 3).map(topic => (
                                  <div key={topic.id} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{topic.title}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      topic.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                                      topic.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                      'bg-red-100 text-red-600'
                                    }`}>
                                      {topic.difficulty}
                                    </span>
                                  </div>
                                ))}
                                {getCourseTopics(course.id).length > 3 && (
                                  <p className="text-gray-500 text-xs">+{getCourseTopics(course.id).length - 3} more topics</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* All Topics Tab */}
              {activeTab === "topics" && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">All Topics</h3>
                      <p className="text-gray-600">Manage topics across all your courses</p>
                    </div>
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {topics.length} topics
                    </span>
                  </div>

                  {topics.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📝</div>
                      <p className="text-gray-500 text-lg">No topics created yet</p>
                      <p className="text-gray-400">Add topics to your courses to see them here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topics.map((topic) => (
                        <div key={topic.id} className="border border-gray-200 rounded-2xl p-6 hover:border-green-300 transition-all duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-800">{topic.title}</h4>
                              <p className="text-gray-600 text-sm">
                                {topic.courseTitle} ({topic.courseCode}) • Order: {topic.order} • Duration: {topic.duration} week(s)
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              topic.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                              topic.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {topic.difficulty}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-4 text-sm">{topic.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              📊 {topic.quizzes} quizzes created
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => window.location.href = '/quizcreation'}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors duration-200 text-sm"
                              >
                                Create Quiz
                              </button>
                              <button
                                onClick={() => handleDeleteTopic(topic.id)}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors duration-200 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === "analytics" && (
                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Course Analytics</h3>
                    <p className="text-gray-600">Insights and statistics about your courses (Demo Data)</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {courses.reduce((sum, course) => sum + course.students, 0)}
                      </div>
                      <p className="text-blue-700 font-semibold">Total Students</p>
                      <p className="text-blue-600 text-sm">Across all courses</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                      <div className="text-3xl font-bold text-green-600 mb-2">{topics.length}</div>
                      <p className="text-green-700 font-semibold">Total Topics</p>
                      <p className="text-green-600 text-sm">Teaching materials</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {courses.length}
                      </div>
                      <p className="text-purple-700 font-semibold">Active Courses</p>
                      <p className="text-purple-600 text-sm">Currently teaching</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
                    <h4 className="font-semibold text-gray-800 mb-4">Student Distribution</h4>
                    <div className="space-y-3">
                      {courses.map(course => (
                        <div key={course.id} className="flex items-center justify-between">
                          <span className="text-gray-700">{course.title}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-indigo-500 h-3 rounded-full transition-all duration-1000"
                                style={{ 
                                  width: `${(course.students / Math.max(1, courses.reduce((sum, c) => sum + c.students, 0))) * 100}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8">{course.students}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Course Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Create New Course</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                  <input
                    type="text"
                    required
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    placeholder="e.g., Data Structures"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
                  <input
                    type="text"
                    required
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({...courseForm, code: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    placeholder="e.g., CS-201"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    required
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    placeholder="Course description..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credits</label>
                    <select
                      value={courseForm.credits}
                      onChange={(e) => setCourseForm({...courseForm, credits: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    >
                      {[1,2,3,4].map(credit => (
                        <option key={credit} value={credit}>{credit} credit{credit > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      value={courseForm.department}
                      onChange={(e) => setCourseForm({...courseForm, department: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    >
                      <option>Computer Science</option>
                      <option>Software Engineering</option>
                      <option>Information Technology</option>
                      <option>Data Science</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? "Creating..." : "Create Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Topic Modal */}
        {showTopicForm && selectedCourse && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Add Topic to {selectedCourse.title}</h3>
                <button
                  onClick={() => {
                    setShowTopicForm(false);
                    setSelectedCourse(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleAddTopic} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic Title</label>
                  <input
                    type="text"
                    required
                    value={topicForm.title}
                    onChange={(e) => setTopicForm({...topicForm, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    placeholder="e.g., Arrays and Linked Lists"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    required
                    value={topicForm.description}
                    onChange={(e) => setTopicForm({...topicForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    placeholder="Topic description..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (weeks)</label>
                    <select
                      value={topicForm.duration}
                      onChange={(e) => setTopicForm({...topicForm, duration: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    >
                      {[1,2,3,4,5,6].map(week => (
                        <option key={week} value={week}>{week} week{week > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={topicForm.difficulty}
                      onChange={(e) => setTopicForm({...topicForm, difficulty: e.target.value as "easy" | "medium" | "hard"})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTopicForm(false);
                      setSelectedCourse(null);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? "Adding..." : "Add Topic"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Demo Notice */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white p-6">
          <h3 className="text-lg font-semibold mb-2">💡 Course Management Demo</h3>
          <p className="text-indigo-100">
            This is a standalone frontend demo. You can create courses, add topics, and explore the interface.
            All data is simulated and resets when you refresh the page.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CourseManagement;