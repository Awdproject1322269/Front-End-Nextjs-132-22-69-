'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define types
interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  role?: string;
}

interface Profile {
  name: string;
  email: string;
}

interface Preferences {
  fontSize: "small" | "medium" | "large" | "xlarge";
  theme: "light" | "dark" | "auto";
  soundNotifications: boolean;
  autoSave: boolean;
}

interface DisplaySettings {
  questionsPerPage: number;
  showTimer: boolean;
  showProgress: boolean;
  confirmSubmission: boolean;
}

type SettingsSection = "profile" | "preferences" | "display";

function StudentSettings() {
  const [activeTab, setActiveTab] = useState<SettingsSection>("profile");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  // Profile State
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: ""
  });

  // Quiz Preferences State
  const [preferences, setPreferences] = useState<Preferences>({
    fontSize: "medium",
    theme: "light",
    soundNotifications: true,
    autoSave: true
  });

  // Display Settings State
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    questionsPerPage: 5,
    showTimer: true,
    showProgress: true,
    confirmSubmission: true
  });

  const API_BASE = "http://localhost:5000/api";
  const router = useRouter();

  useEffect(() => {
    // Check if we're in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);
        setStudentId(parsedUser?.id || null);
        loadUserProfile(parsedUser);
      }
    }
    loadSettingsFromStorage();
  }, []);

  const loadUserProfile = (userData: User): void => {
    if (userData) {
      setProfile({
        name: userData.name || "",
        email: userData.email || ""
      });
    }
  };

  const loadSettingsFromStorage = (): void => {
    if (typeof window !== 'undefined') {
      const savedPreferences = localStorage.getItem('studentPreferences');
      const savedDisplaySettings = localStorage.getItem('studentDisplaySettings');

      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences));
        } catch (error) {
          console.error("Error parsing preferences:", error);
        }
      }
      if (savedDisplaySettings) {
        try {
          setDisplaySettings(JSON.parse(savedDisplaySettings));
        } catch (error) {
          console.error("Error parsing display settings:", error);
        }
      }
    }
  };

  const saveSettings = async (section: SettingsSection): Promise<void> => {
    try {
      setIsLoading(true);
      setSaveStatus("Saving...");

      if (section === "profile") {
        if (!studentId) {
          setSaveStatus("Student ID not found ❌");
          setIsLoading(false);
          return;
        }
        
        // Update profile via API
        const response = await fetch(`${API_BASE}/student/profile/${studentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profile)
        });

        const data = await response.json();
        
        if (data.success) {
          // Update local storage
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(data.student));
          }
          setUser(data.student);
          setSaveStatus("Profile updated successfully! ✅");
        } else {
          setSaveStatus("Failed to update profile ❌");
        }
      } else if (section === "preferences") {
        if (typeof window !== 'undefined') {
          localStorage.setItem('studentPreferences', JSON.stringify(preferences));
        }
        setSaveStatus("Preferences saved successfully! ✅");
      } else if (section === "display") {
        if (typeof window !== 'undefined') {
          localStorage.setItem('studentDisplaySettings', JSON.stringify(displaySettings));
        }
        setSaveStatus("Display settings saved successfully! ✅");
      }

      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("Error saving settings ❌");
      setTimeout(() => setSaveStatus(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (field: keyof Profile, value: string): void => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: keyof Preferences, value: string | boolean): void => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDisplaySettingChange = (field: keyof DisplaySettings, value: number | boolean): void => {
    setDisplaySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetToDefaults = (section: SettingsSection): void => {
    if (section === "preferences") {
      setPreferences({
        fontSize: "medium",
        theme: "light",
        soundNotifications: true,
        autoSave: true
      });
    } else if (section === "display") {
      setDisplaySettings({
        questionsPerPage: 5,
        showTimer: true,
        showProgress: true,
        confirmSubmission: true
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800">
      {/* Header */}
      <div className="pt-8 pb-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-700 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Student Settings</h2>
                <p className="text-gray-600">Customize your learning experience and preferences</p>
              </div>
            </div>
          </div>

          {/* Save Status */}
          {saveStatus && (
            <div className={`mb-6 p-4 rounded-2xl font-semibold ${
              saveStatus.includes("✅") 
                ? "bg-green-100 text-green-700 border border-green-200" 
                : "bg-red-100 text-red-700 border border-red-200"
            }`}>
              {saveStatus}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-2 mb-8">
            <div className="flex space-x-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === "profile"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                👤 Profile
              </button>
              <button
                onClick={() => setActiveTab("preferences")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === "preferences"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                🎨 Preferences
              </button>
              <button
                onClick={() => setActiveTab("display")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === "display"
                    ? "bg-green-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                🖥️ Display
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden">
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleProfileChange("name", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange("email", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="bg-blue-50 rounded-2xl p-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Account Information</h4>
                  <div className="text-sm text-blue-600 space-y-1">
                    <p>Role: Student</p>
                    <p>Student ID: {studentId || 'N/A'}</p>
                    <p>Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => saveSettings("profile")}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Preferences */}
          {activeTab === "preferences" && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Quiz Preferences</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size
                  </label>
                  <select
                    value={preferences.fontSize}
                    onChange={(e) => handlePreferenceChange("fontSize", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="xlarge">Extra Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Theme
                  </label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => handlePreferenceChange("theme", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.soundNotifications}
                      onChange={(e) => handlePreferenceChange("soundNotifications", e.target.checked)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-gray-700 font-medium">Enable sound notifications</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.autoSave}
                      onChange={(e) => handlePreferenceChange("autoSave", e.target.checked)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-gray-700 font-medium">Auto-save quiz progress</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => saveSettings("preferences")}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save Preferences"}
                  </button>
                  <button
                    onClick={() => resetToDefaults("preferences")}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Display Settings */}
          {activeTab === "display" && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Display Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Questions Per Page
                  </label>
                  <select
                    value={displaySettings.questionsPerPage}
                    onChange={(e) => handleDisplaySettingChange("questionsPerPage", parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  >
                    <option value={1}>1 Question</option>
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={0}>All Questions (Single Page)</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">
                    Number of questions to show on each page during quizzes
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={displaySettings.showTimer}
                      onChange={(e) => handleDisplaySettingChange("showTimer", e.target.checked)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-gray-700 font-medium">Show quiz timer</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={displaySettings.showProgress}
                      onChange={(e) => handleDisplaySettingChange("showProgress", e.target.checked)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-gray-700 font-medium">Show progress bar</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={displaySettings.confirmSubmission}
                      onChange={(e) => handleDisplaySettingChange("confirmSubmission", e.target.checked)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-gray-700 font-medium">Confirm before quiz submission</span>
                  </label>
                </div>

                <div className="bg-green-50 rounded-2xl p-6">
                  <h4 className="font-semibold text-green-800 mb-2">Preview</h4>
                  <div className="text-sm text-green-600 space-y-2">
                    <p>• {displaySettings.questionsPerPage === 0 ? 'All questions on one page' : `${displaySettings.questionsPerPage} questions per page`}</p>
                    <p>• Timer: {displaySettings.showTimer ? 'Visible' : 'Hidden'}</p>
                    <p>• Progress: {displaySettings.showProgress ? 'Visible' : 'Hidden'}</p>
                    <p>• Confirmation: {displaySettings.confirmSubmission ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => saveSettings("display")}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save Display Settings"}
                  </button>
                  <button
                    onClick={() => resetToDefaults("display")}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors duration-200"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentSettings;