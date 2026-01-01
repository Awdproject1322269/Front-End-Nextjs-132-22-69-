'use client';

import { useState, useEffect } from "react";

interface GeneralSettings {
  questionsPerPage: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  marksPerQuestion: number;
  timeLimit: number;
  allowReview: boolean;
  autoSubmit: boolean;
  showResults: boolean;
  difficulty: string;
}

interface SecuritySettings {
  autoSubmit: boolean;
  sessionTimeout: number;
  preventCopyPaste: boolean;
  fullScreenMode: boolean;
}

interface NotificationsSettings {
  emailNotifications: boolean;
  quizSubmissions: boolean;
  studentQuestions: boolean;
  systemUpdates: boolean;
  performanceReports: boolean;
  deliverySchedule: string;
  [key: string]: boolean | string; // Index signature for dynamic access
}

interface SettingsType {
  general: GeneralSettings;
  security: SecuritySettings;
  notifications: NotificationsSettings;
}

type SettingsCategory = keyof SettingsType;

function Settings() {
  const [settings, setSettings] = useState<SettingsType>({
    general: {
      questionsPerPage: 5,
      shuffleQuestions: true,
      shuffleOptions: false,
      marksPerQuestion: 1,
      timeLimit: 30,
      allowReview: true,
      autoSubmit: false,
      showResults: true,
      difficulty: "medium",
    },
    security: {
      autoSubmit: false,
      sessionTimeout: 30,
      preventCopyPaste: true,
      fullScreenMode: false
    },
    notifications: {
      emailNotifications: true,
      quizSubmissions: true,
      studentQuestions: true,
      systemUpdates: false,
      performanceReports: true,
      deliverySchedule: "immediately"
    }
  });

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsCategory>("general");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Load settings from localStorage on component mount
  useEffect(() => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem("quizSettings");
        const savedLastUpdated = localStorage.getItem("settingsLastUpdated");
        
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
        }
        
        if (savedLastUpdated) {
          setLastUpdated(savedLastUpdated);
        }
      } catch (error) {
        console.error("Error loading settings from localStorage:", error);
      }
    }
    setIsLoading(false);
  }, []);

  const handleChange = (category: SettingsCategory, field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          // Save to localStorage
          localStorage.setItem("quizSettings", JSON.stringify(settings));
          
          const now = new Date().toISOString();
          localStorage.setItem("settingsLastUpdated", now);
          setLastUpdated(now);
          
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        } catch (error) {
          console.error("Error saving settings:", error);
          alert('Error saving settings to browser storage');
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    if (!window.confirm("Are you sure you want to reset all settings to default?")) {
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const defaultSettings: SettingsType = {
        general: {
          questionsPerPage: 5,
          shuffleQuestions: true,
          shuffleOptions: false,
          marksPerQuestion: 1,
          timeLimit: 30,
          allowReview: true,
          autoSubmit: false,
          showResults: true,
          difficulty: "medium",
        },
        security: {
          autoSubmit: false,
          sessionTimeout: 30,
          preventCopyPaste: true,
          fullScreenMode: false
        },
        notifications: {
          emailNotifications: true,
          quizSubmissions: true,
          studentQuestions: true,
          systemUpdates: false,
          performanceReports: true,
          deliverySchedule: "immediately"
        }
      };
      
      setSettings(defaultSettings);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem("quizSettings", JSON.stringify(defaultSettings));
        const now = new Date().toISOString();
        localStorage.setItem("settingsLastUpdated", now);
        setLastUpdated(now);
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      alert('Settings reset to defaults successfully!');
      
      setIsLoading(false);
    }, 1000);
  };

  const tabs = [
    { id: "general", name: "General", icon: "⚙" },
    { id: "security", name: "Security", icon: "🔒" },
    { id: "notifications", name: "Notifications", icon: "🔔" },
  ];

  if (isLoading && !saved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800">
      {/* Spacer for header */}
      <div className="h-20"></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Success Message */}
        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 animate-in slide-in-from-top">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">✅</span>
              </div>
              <div>
                <p className="font-semibold text-green-800">Settings saved successfully!</p>
                <p className="text-green-600 text-sm">
                  {lastUpdated && `Last updated: ${new Date(lastUpdated).toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 border border-white/60 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings Categories</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingsCategory)}
                    className={`w-full text-left px-3 sm:px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="w-full px-3 sm:px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>🔄</span>
                  Reset to Defaults
                </button>
              </div>

              {lastUpdated && (
                <div className="mt-4 text-xs text-gray-500 text-center">
                  Last updated: {new Date(lastUpdated).toLocaleDateString()}
                </div>
              )}

              <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Settings are saved in your browser's local storage.
                </p>
              </div>
            </div>
          </div>

          {/* Main Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden">
              {/* General Settings */}
              {activeTab === "general" && (
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <span className="text-xl sm:text-2xl">⚙</span>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">General Settings</h2>
                      <p className="text-gray-600">Configure basic quiz behavior and defaults</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Questions Per Page
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={settings.general.questionsPerPage}
                            onChange={(e) => handleChange("general", "questionsPerPage", Number(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="w-12 text-center font-semibold text-gray-800">
                            {settings.general.questionsPerPage}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Number of questions displayed per page during quiz</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Default Marks Per Question
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={settings.general.marksPerQuestion}
                          onChange={(e) => handleChange("general", "marksPerQuestion", Number(e.target.value))}
                          className="w-full max-w-32 px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Default Time Limit (minutes)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="180"
                          value={settings.general.timeLimit}
                          onChange={(e) => handleChange("general", "timeLimit", Number(e.target.value))}
                          className="w-full max-w-32 px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Default Difficulty
                        </label>
                        <select
                          value={settings.general.difficulty}
                          onChange={(e) => handleChange("general", "difficulty", e.target.value)}
                          className="w-full max-w-48 px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-800">Shuffle Questions</p>
                          <p className="text-sm text-gray-600">Randomize question order</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.general.shuffleQuestions}
                            onChange={(e) => handleChange("general", "shuffleQuestions", e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-12 h-6 rounded-full peer transition-all duration-300 ${
                            settings.general.shuffleQuestions ? 'bg-indigo-600' : 'bg-gray-300'
                          }`}></div>
                          <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ${
                            settings.general.shuffleQuestions ? 'translate-x-6' : ''
                          }`}></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-800">Shuffle Options</p>
                          <p className="text-sm text-gray-600">Randomize MCQ options</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.general.shuffleOptions}
                            onChange={(e) => handleChange("general", "shuffleOptions", e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-12 h-6 rounded-full peer transition-all duration-300 ${
                            settings.general.shuffleOptions ? 'bg-indigo-600' : 'bg-gray-300'
                          }`}></div>
                          <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ${
                            settings.general.shuffleOptions ? 'translate-x-6' : ''
                          }`}></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-800">Allow Review</p>
                          <p className="text-sm text-gray-600">Students can review answers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.general.allowReview}
                            onChange={(e) => handleChange("general", "allowReview", e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-12 h-6 rounded-full peer transition-all duration-300 ${
                            settings.general.allowReview ? 'bg-indigo-600' : 'bg-gray-300'
                          }`}></div>
                          <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ${
                            settings.general.allowReview ? 'translate-x-6' : ''
                          }`}></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-800">Show Results</p>
                          <p className="text-sm text-gray-600">Display results after quiz</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.general.showResults}
                            onChange={(e) => handleChange("general", "showResults", e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-12 h-6 rounded-full peer transition-all duration-300 ${
                            settings.general.showResults ? 'bg-indigo-600' : 'bg-gray-300'
                          }`}></div>
                          <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ${
                            settings.general.showResults ? 'translate-x-6' : ''
                          }`}></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                      <span className="text-xl sm:text-2xl">🔒</span>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Security Settings</h2>
                      <p className="text-gray-600">Configure security and integrity features</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-800">Auto-Submit on Timeout</p>
                        <p className="text-sm text-gray-600">Automatically submit when time expires</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security.autoSubmit}
                          onChange={(e) => handleChange("security", "autoSubmit", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className={`w-12 h-6 rounded-full peer transition-all duration-300 ${
                          settings.security.autoSubmit ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ${
                          settings.security.autoSubmit ? 'translate-x-6' : ''
                        }`}></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-800">Prevent Copy/Paste</p>
                        <p className="text-sm text-gray-600">Disable copy-paste during quiz</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security.preventCopyPaste}
                          onChange={(e) => handleChange("security", "preventCopyPaste", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className={`w-12 h-6 rounded-full peer transition-all duration-300 ${
                          settings.security.preventCopyPaste ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ${
                          settings.security.preventCopyPaste ? 'translate-x-6' : ''
                        }`}></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-800">Full Screen Mode</p>
                        <p className="text-sm text-gray-600">Require full screen during quiz</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security.fullScreenMode}
                          onChange={(e) => handleChange("security", "fullScreenMode", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className={`w-12 h-6 rounded-full peer transition-all duration-300 ${
                          settings.security.fullScreenMode ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ${
                          settings.security.fullScreenMode ? 'translate-x-6' : ''
                        }`}></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleChange("security", "sessionTimeout", Number(e.target.value))}
                        className="w-full max-w-32 px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                      />
                      <p className="text-xs text-gray-500 mt-2">Automatic logout after inactivity</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">Data Protection</h4>
                        <p className="text-sm text-green-600">Settings are stored locally in your browser</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-green-500">✅</span>
                          <span className="text-sm text-green-700">Local Storage</span>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">Session Security</h4>
                        <p className="text-sm text-blue-600">Auto-save prevents data loss</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-blue-500">💾</span>
                          <span className="text-sm text-blue-700">Auto-Save Enabled</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800 mb-2">Security Recommendations</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Enable auto-submit to prevent time exploitation</li>
                        <li>• Use question shuffling to discourage cheating</li>
                        <li>• Consider disabling review mode for high-stakes tests</li>
                        <li>• Enable full screen mode for important assessments</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === "notifications" && (
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                      <span className="text-xl sm:text-2xl">🔔</span>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Notification Settings</h2>
                      <p className="text-gray-600">Manage alerts and communication preferences</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-800">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) => handleChange("notifications", "emailNotifications", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className={`w-12 h-6 rounded-full peer transition-all duration-300 ${
                          settings.notifications.emailNotifications ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ${
                          settings.notifications.emailNotifications ? 'translate-x-6' : ''
                        }`}></div>
                      </label>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-3">Notification Types</h4>
                        <div className="space-y-3">
                          {[
                            { name: "Quiz Submissions", field: "quizSubmissions" },
                            { name: "Student Questions", field: "studentQuestions" },
                            { name: "System Updates", field: "systemUpdates" },
                            { name: "Performance Reports", field: "performanceReports" },
                          ].map((type, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">{type.name}</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.notifications[type.field] as boolean}
                                  onChange={(e) => handleChange("notifications", type.field, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className={`w-8 h-4 rounded-full peer transition-all duration-300 ${
                                  settings.notifications[type.field] ? 'bg-indigo-600' : 'bg-gray-300'
                                }`}></div>
                                <div className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-all duration-300 ${
                                  settings.notifications[type.field] ? 'translate-x-4' : ''
                                }`}></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                        <h4 className="font-semibold text-indigo-800 mb-2">Delivery Schedule</h4>
                        <p className="text-sm text-indigo-600 mb-3">Choose when to receive notifications</p>
                        <select 
                          value={settings.notifications.deliverySchedule}
                          onChange={(e) => handleChange("notifications", "deliverySchedule", e.target.value)}
                          className="w-full px-3 py-2 border border-indigo-200 rounded-lg bg-white text-indigo-700"
                        >
                          <option value="immediately">Immediately</option>
                          <option value="daily">Daily Digest</option>
                          <option value="weekly">Weekly Summary</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">Apply Settings</p>
                    <p className="text-sm text-gray-600">Save your preferences across all quizzes</p>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-6 sm:px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save All Settings"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;