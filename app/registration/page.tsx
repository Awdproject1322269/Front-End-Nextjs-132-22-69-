"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function Registration() {
  const [role, setRole] = useState("Teacher");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirm) {
      alert("Please fill in all fields!");
      return;
    }

    if (password !== confirm) {
      alert("Passwords don't match!");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    setIsLoading(true);
    
    try {
      // Use environment variable for API base URL
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";
      
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          name,
          email,
          password,
          confirm
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("role", data.user.role);
          localStorage.setItem("loginTime", Date.now().toString());
        }
        
        router.push("/dashboard");
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed! Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
          {/* Decorative Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">QuizQuest-3</h1>
            <p className="text-indigo-100">Join our learning community</p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Account</h2>
              <p className="text-gray-600">Choose your role and start your journey</p>
            </div>

            {/* Role Selection */}
            <div className="bg-gray-50 rounded-2xl p-2 mb-6 sm:mb-8">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
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
                  type="button"
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

            {/* Role Description */}
            <div className={`mb-6 sm:mb-8 p-4 rounded-2xl border-2 transition-all duration-300 ${
              role === "Teacher" 
                ? "bg-indigo-50 border-indigo-200" 
                : "bg-purple-50 border-purple-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  role === "Teacher" ? "bg-indigo-100" : "bg-purple-100"
                }`}>
                  {role === "Teacher" ? "👨‍🏫" : "👨‍🎓"}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{role} Benefits</h3>
                  <p className="text-sm text-gray-600">
                    {role === "Teacher" 
                      ? "Create quizzes, track progress, manage classes" 
                      : "Take quizzes, view reports, track learning"}
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4 sm:space-y-6" autoComplete="on">
              {/* Name Field */}
              <div>
                <label htmlFor="registration-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    id="registration-name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                    required
                    autoComplete="name"
                  />
                  <div className="absolute right-3 top-3 text-gray-400">
                    👤
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="registration-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    id="registration-email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                    required
                    autoComplete="email"
                  />
                  <div className="absolute right-3 top-3 text-gray-400">
                    ✉️
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    id="registration-password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <div className="absolute right-3 top-3 text-gray-400">
                    🔒
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    id="registration-confirm"
                    placeholder="Confirm your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={`w-full border px-4 py-3 rounded-xl focus:ring-2 transition-all duration-300 bg-white/50 backdrop-blur-sm text-sm sm:text-base ${
                      confirm && password !== confirm 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                        : confirm && password === confirm 
                        ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                        : "border-gray-300 focus:border-indigo-500"
                    }`}
                    required
                    autoComplete="new-password"
                  />
                  <div className="absolute right-3 top-3">
                    {confirm && password !== confirm ? (
                      <span className="text-red-500">❌</span>
                    ) : confirm && password === confirm ? (
                      <span className="text-green-500">✅</span>
                    ) : (
                      <span className="text-gray-400">🔒</span>
                    )}
                  </div>
                </div>
                {confirm && password !== confirm && (
                  <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-3 sm:py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                  isLoading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                } text-sm sm:text-base`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  `Register as ${role}`
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600 text-sm sm:text-base">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Terms */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By registering, you agree to our{" "}
                <a href="/terms" className="text-indigo-600 hover:underline">Terms of Service</a>{" "}
                and{" "}
                <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-3 sm:gap-4 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-white/60">
            <div className="text-2xl mb-2">🚀</div>
            <p className="text-xs sm:text-sm font-medium text-gray-700">Quick Setup</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-white/60">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-xs sm:text-sm font-medium text-gray-700">Secure</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-white/60">
            <div className="text-2xl mb-2">💯</div>
            <p className="text-xs sm:text-sm font-medium text-gray-700">Free Forever</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;