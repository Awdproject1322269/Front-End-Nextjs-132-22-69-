'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function Login() {
  const [role, setRole] = useState("Teacher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/dashboard"); // Default dashboard
  const router = useRouter();

  // ✅ YEH CODE ADD KARO - Redirect path check karo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRedirect = localStorage.getItem('redirectAfterLogin');
      if (savedRedirect) {
        setRedirectPath(savedRedirect);
      }
    }
  }, []);

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          email,
          password
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("role", data.user.role);
          localStorage.setItem("loginTime", Date.now().toString());
        }
        
        // ✅ CHECK KARO KYA USER TEACHER HAI AUR TEACHER SERVICE ACCESS KAR RAHA HAI
        const savedRedirect = typeof window !== 'undefined' ? localStorage.getItem('redirectAfterLogin') : null;
        const isTeacherService = savedRedirect && 
          ['/quizcreation', '/teachercontrol', '/report', '/settings'].includes(savedRedirect);
        
        if (isTeacherService && data.user.role !== "Teacher") {
          // ❌ STUDENT NE TEACHER SERVICE ACCESS KARNE KI KOSHISH KI
          alert("❌ Access Denied! This service is only available for Teachers.");
          setIsLoading(false);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('redirectAfterLogin'); // Clear redirect
          }
          return;
        }

        // ✅ SUCCESSFUL LOGIN - REDIRECT KARO
        if (savedRedirect && data.user.role === "Teacher") {
          // Teacher hai aur teacher service access kar raha hai
          router.push(savedRedirect);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('redirectAfterLogin'); // Clear after use
          }
        } else {
          // Normal login - dashboard par jao with role parameter
          router.push(`/dashboard?role=${data.user.role}`);
        }
        
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed! Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">QuizQuest-3</h1>
            <p className="text-indigo-100">
              {redirectPath !== "/dashboard" ? "Teacher Access Required" : "Welcome back!"}
            </p>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h2>
              <p className="text-gray-600">
                {redirectPath !== "/dashboard" 
                  ? "Please login as Teacher to continue" 
                  : "Access your account as a teacher or student"
                }
              </p>
            </div>

            {/* Role Selection */}
            <div className="bg-gray-50 rounded-2xl p-2 mb-8">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRole("Teacher")}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    role === "Teacher"
                      ? "bg-white text-indigo-600 shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                  }`}
                >
                  👨‍🏫 Teacher
                </button>
                <button
                  onClick={() => setRole("Student")}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    role === "Student"
                      ? "bg-white text-indigo-600 shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                  }`}
                >
                  👨‍🎓 Student
                </button>
              </div>
            </div>

            {redirectPath !== "/dashboard" && role === "Student" && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
                ⚠️ You are trying to access a Teacher-only service. Please login as Teacher.
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6" autoComplete="on">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="login-email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </div>
                ) : (
                  `Login as ${role}`
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/registration"
                  className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition-colors duration-200"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;