'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// Define interfaces for type safety
interface User {
  id: string;
  name: string;
  role?: string;
}

interface StatItem {
  value: string;
  label: string;
  change: string;
  trend: "up" | "down";
}

interface ActivityItem {
  title: string;
  date: string;
  type: "quiz" | "report" | "creation" | "management";
  score: number | null;
}

interface TaskItem {
  course: string;
  date: string;
  type: string;
  students?: number;
  duration?: string;
}

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  link: string;
  gradient: string;
}

interface DashboardData {
  stats: StatItem[];
  recentActivities: ActivityItem[];
  upcomingTasks: TaskItem[];
  performanceData: number[];
}

function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get role from URL or use default - REMOVED localStorage checks
  const initialRole = searchParams.get('role') || "Teacher";
  const [userRole, setUserRole] = useState(initialRole);
  
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: [],
    recentActivities: [],
    upcomingTasks: [],
    performanceData: []
  });

  // Demo user data - since we're not requiring login
  const demoUsers = {
    Teacher: { id: "demo-teacher-123", name: "Professor Demo", role: "Teacher" },
    Student: { id: "demo-student-456", name: "Student Demo", role: "Student" }
  };

  const [user, setUser] = useState<User>(demoUsers[userRole as keyof typeof demoUsers]);

  // API Base URL
  const API_BASE = "http://localhost:5000/api";

  // Handle role switch
  const handleRoleSwitch = (role: "Teacher" | "Student") => {
    setUserRole(role);
    setUser(demoUsers[role]);
    
    // Update URL without reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('role', role);
    window.history.pushState({}, '', newUrl);
    
    // Load new role data
    setIsLoading(true);
    setTimeout(() => {
      if (role === "Teacher") {
        loadTeacherDashboard();
      } else {
        loadStudentDashboard();
      }
    }, 500);
  };

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (userRole === "Teacher") {
          await loadTeacherDashboard();
        } else {
          await loadStudentDashboard();
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
        // Use fallback demo data
        setDashboardData(getDemoData(userRole));
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [userRole]);

  // Load teacher dashboard data
  const loadTeacherDashboard = async () => {
    try {
      // Try to fetch real data, fall back to demo if API fails
      const response = await fetch(`${API_BASE}/quizzes/teacher/${user.id}`);
      const data = await response.json();

      if (data.success && data.quizzes?.length > 0) {
        // Real data processing
        const totalQuizzes = data.quizzes.length || 0;
        const stats: StatItem[] = [
          { value: totalQuizzes.toString(), label: "Quizzes Created", change: "+2", trend: "up" as const },
          { value: "87%", label: "Average Class Score", change: "+3%", trend: "up" as const },
          { value: "45", label: "Active Students", change: "+5", trend: "up" as const },
          { value: "12", label: "Courses Created", change: "+1", trend: "up" as const }
        ];

        const recentActivities: ActivityItem[] = data.quizzes.slice(0, 3).map((quiz: any, index: number) => ({
          title: `Quiz Created: ${quiz.title || 'Untitled'}`,
          date: new Date(quiz.createdAt || Date.now() - index * 86400000).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          type: "creation" as const,
          score: null
        }));

        setDashboardData({
          stats,
          recentActivities,
          upcomingTasks: getDemoUpcoming(userRole),
          performanceData: [75, 82, 65, 90, 78, 85, 88]
        });
      } else {
        // Use demo data
        setDashboardData(getDemoData(userRole));
      }
    } catch (error) {
      // Use demo data on error
      setDashboardData(getDemoData(userRole));
    }
    setIsLoading(false);
  };

  // Load student dashboard data
  const loadStudentDashboard = async () => {
    try {
      // Try to fetch real data, fall back to demo if API fails
      const response = await fetch(`${API_BASE}/student/dashboard/${user.id}`);
      const data = await response.json();

      if (data.success && data.recentActivities?.length > 0) {
        // Real data processing
        const stats: StatItem[] = [
          { value: (data.stats?.totalQuizzesAttempted || 8).toString(), label: "Quizzes Attempted", change: "+2", trend: "up" as const },
          { value: `${data.stats?.averageScore || 85}%`, label: "Average Score", change: "+5%", trend: "up" as const },
          { value: (data.stats?.pendingQuizzes || 3).toString(), label: "Pending Quizzes", change: "-1", trend: "down" as const },
          { value: (data.stats?.totalTeachers || 5).toString(), label: "Connected Teachers", change: "+1", trend: "up" as const }
        ];

        const recentActivities: ActivityItem[] = data.recentActivities.slice(0, 3).map((report: any) => ({
          title: `Attempted: ${report.quizTitle || 'Quiz'}`,
          date: new Date(report.date || Date.now()).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          type: "quiz" as const,
          score: report.percentage || 0
        }));

        setDashboardData({
          stats,
          recentActivities,
          upcomingTasks: getDemoUpcoming(userRole),
          performanceData: [82, 85, 78, 92, 88, 90, 87]
        });
      } else {
        // Use demo data
        setDashboardData(getDemoData(userRole));
      }
    } catch (error) {
      // Use demo data on error
      setDashboardData(getDemoData(userRole));
    }
    setIsLoading(false);
  };

  // Demo data functions
  const getDemoData = (role: string): DashboardData => {
    return role === "Teacher" ? {
      stats: [
        { value: "15", label: "Quizzes Created", change: "+2", trend: "up" },
        { value: "87%", label: "Average Class Score", change: "+3%", trend: "up" },
        { value: "45", label: "Active Students", change: "+5", trend: "up" },
        { value: "12", label: "Courses Created", change: "+1", trend: "up" },
      ],
      recentActivities: [
        { 
          title: "Data Structures Quiz Created", 
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
          type: "creation", 
          score: null 
        },
        { 
          title: "Midterm Report Generated", 
          date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
          type: "report", 
          score: null 
        },
        { 
          title: "5 New Students Connected", 
          date: new Date(Date.now() - 2 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
          type: "management", 
          score: null 
        },
      ],
      upcomingTasks: getDemoUpcoming(role),
      performanceData: [75, 82, 65, 90, 78, 85, 88]
    } : {
      stats: [
        { value: "8", label: "Quizzes Attempted", change: "+2", trend: "up" },
        { value: "85%", label: "Average Score", change: "+5%", trend: "up" },
        { value: "3", label: "Pending Quizzes", change: "-1", trend: "down" },
        { value: "5", label: "Connected Teachers", change: "+1", trend: "up" },
      ],
      recentActivities: [
        { 
          title: "Operating Systems Quiz", 
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
          type: "quiz", 
          score: 92 
        },
        { 
          title: "Database Systems Quiz", 
          date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
          type: "quiz", 
          score: 78 
        },
        { 
          title: "Computer Networks Quiz", 
          date: new Date(Date.now() - 2 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
          type: "quiz", 
          score: 85 
        },
      ],
      upcomingTasks: getDemoUpcoming(role),
      performanceData: [82, 85, 78, 92, 88, 90, 87]
    };
  };

  const getDemoUpcoming = (role: string): TaskItem[] => {
    return role === "Teacher" ? [
      { 
        course: "Advanced Algorithms", 
        date: new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
        type: "Scheduled Quiz", 
        students: 25 
      },
      { 
        course: "Software Engineering", 
        date: new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
        type: "Quiz Review", 
        students: 30 
      },
    ] : [
      { 
        course: "Data Structures Quiz", 
        date: new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
        type: "Quiz Available", 
        duration: "45 min" 
      },
      { 
        course: "Discrete Mathematics", 
        date: new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
        type: "Practice Quiz", 
        duration: "30 min" 
      },
    ];
  };

  // Student-specific features
  const studentFeatures: FeatureItem[] = [
    {
      icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      title: "My Teachers",
      description: "View connected teachers and send new connection requests.",
      link: "/my-teachers",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/1087/1087927.png", 
      title: "Available Quizzes",
      description: "Take quizzes assigned by your connected teachers.",
      link: "/available-quizzes",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png",
      title: "My Reports", 
      description: "View your quiz performance and progress reports.",
      link: "/my-reports",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/992/992700.png",
      title: "Search Teachers",
      description: "Find and connect with new teachers for more quizzes.",
      link: "/search-teachers", 
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
      title: "Quiz History",
      description: "Review your past quiz attempts and performances.",
      link: "/quiz-history",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/3524/3524659.png",
      title: "Settings",
      description: "Adjust your quiz preferences and display settings.",
      link: "/student-settings",
      gradient: "from-gray-500 to-gray-700"
    }
  ];

  // Teacher features
  const teacherFeatures: FeatureItem[] = [
    {
      icon: "https://cdn-icons-png.flaticon.com/512/1087/1087927.png",
      title: "Create Quiz",
      description: "Upload PDF or type questions to generate interactive quizzes.",
      link: "/quizcreation",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png", 
      title: "Teacher Control",
      description: "Mark attendance and allow/disallow students for quizzes.",
      link: "/teacher-control",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      title: "Manage Students", 
      description: "Approve student requests and manage linked students.",
      link: "/my-teachers", // Same as student's my-teachers
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png",
      title: "Course Management",
      description: "Register courses and add topics for quiz creation.",
      link: "/quizcreation", // Redirect to quiz creation for now
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/992/992700.png",
      title: "Reports",
      description: "View, analyze, and export quiz reports for your students.",
      link: "/report",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/3524/3524659.png",
      title: "Settings",
      description: "Adjust quiz parameters, shuffle questions, and set marks.",
      link: "/settings",
      gradient: "from-gray-500 to-gray-700"
    }
  ];

  const features = userRole === "Teacher" ? teacherFeatures : studentFeatures;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800">
      {/* Header Section */}
      <section className="pt-8 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Welcome to QuizQuest-3 Demo! 👋
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl">
                {userRole === "Teacher" 
                  ? "Demo Teacher Dashboard - Manage classes, create quizzes, and track student progress." 
                  : "Demo Student Dashboard - Attempt quizzes, track progress, and view performance."}
              </p>
              
              {/* Role Switch Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleRoleSwitch("Teacher")}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors duration-200 ${
                    userRole === "Teacher" 
                      ? "bg-indigo-600 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  👨‍🏫 Teacher View
                </button>
                <button
                  onClick={() => handleRoleSwitch("Student")}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors duration-200 ${
                    userRole === "Student" 
                      ? "bg-indigo-600 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  👨‍🎓 Student View
                </button>
              </div>
            </div>
            
            {/* Role Display with Login/Register Buttons */}
            <div className="flex items-center gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg px-6 py-3 border border-white/60 text-center font-semibold">
                {userRole === "Teacher" ? "👨‍🏫 Demo Teacher Mode" : "👨‍🎓 Demo Student Mode"}
              </div>
              
              {/* Demo Notice */}
              <div className="text-sm text-gray-500 bg-yellow-50 px-3 py-1 rounded-full">
                🚀 Demo Mode
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {dashboardData.stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                  </div>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      stat.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, 
                        parseInt(stat.value.replace('%', '')) * 
                        (stat.value.includes('%') ? 1 : 4)
                      )}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/60 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Image 
                    src={feature.icon} 
                    alt={feature.title} 
                    width={32}
                    height={32}
                    className="filter brightness-0 invert" 
                    unoptimized
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                <Link
                  href={feature.link}
                  className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700 group-hover:translate-x-1 transition-transform duration-300"
                >
                  Explore Feature <span className="ml-2">→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                📈 Recent Activities
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {dashboardData.recentActivities.length}
                </span>
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {dashboardData.recentActivities.map((activity, index) => (
                <div 
                  key={index}
                  className="p-6 hover:bg-gray-50/50 transition-colors duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        activity.type === 'quiz' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'report' ? 'bg-purple-100 text-purple-600' :
                        activity.type === 'creation' ? 'bg-green-100 text-green-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {activity.type === 'quiz' ? '📝' :
                         activity.type === 'report' ? '📊' :
                         activity.type === 'creation' ? '🆕' : '👥'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{activity.date}</p>
                      </div>
                    </div>
                    {activity.score !== null && (
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold">
                        {activity.score}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                ⏰ {userRole === "Teacher" ? "Upcoming Tasks" : "Available Quizzes"}
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {dashboardData.upcomingTasks.length}
                </span>
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {dashboardData.upcomingTasks.map((task, index) => (
                <div 
                  key={index}
                  className="p-6 hover:bg-gray-50/50 transition-colors duration-200 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">
                      {task.course}
                    </h4>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {task.date}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{task.type}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {userRole === "Teacher" 
                        ? `👥 ${task.students || 0} students` 
                        : `⏱ ${task.duration || 'N/A'}`}
                    </span>
                    <button 
                      onClick={() => router.push(task.type.includes("Quiz") ? "/available-quizzes" : "/quizcreation")}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      {userRole === "Teacher" ? "View Details →" : "Start Quiz →"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {userRole === "Teacher" ? "Performance Overview" : "My Progress"}
              </h3>
              <p className="text-gray-600">
                {userRole === "Teacher" 
                  ? "Class performance across different subjects (Demo Data)" 
                  : "Your progress across attempted quizzes (Demo Data)"}
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <div className="text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-xl">
                🎯 Interactive Demo Chart
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
            <div className="flex justify-around items-end h-64 mb-8">
              {dashboardData.performanceData.map((height, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-12 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-xl transition-all duration-1000 hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg cursor-pointer"
                    style={{ height: `${height}%` }}
                    onClick={() => alert(`Week ${index + 1}: ${height}% score`)}
                  ></div>
                  <span className="text-sm text-gray-600 mt-2">W{index + 1}</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-4">
                *Click on bars to see detailed scores. This is interactive demo data.
              </p>
              <Link 
                href="/registration" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
              >
                🚀 Create Account to Save Progress
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;