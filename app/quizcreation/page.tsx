'use client';

import { useState, useEffect, ChangeEvent } from "react";
import Link from "next/link";

// ==================== INTERFACES ====================
interface Question {
  id: string;
  text: string;
  type: "mcq" | "tf" | "sa";
  options: string[];
  correct: number | null;
  marks: number;
  explanation?: string;
  addedDuringEdit?: boolean;
  optionsRendered?: string[];
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  difficulty: string;
  duration: number;
  totalMarks: number;
  questionsCount: number;
  createdAt: string;
  teacherId?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Template {
  name: string;
  generator: () => Question[];
}

// ==================== UTILITY FUNCTIONS ====================
function uid(prefix = ""): string {
  return prefix + Math.random().toString(36).slice(2, 9);
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function defaultMCQOptions(topic = "Topic"): string[] {
  return [
    `${topic} — correct concept`,
    `${topic} — common misconception`,
    `Related idea about ${topic}`,
    `Practical example of ${topic}`,
  ];
}

function makeSampleQuestion(topic: string, difficulty: string, idx: number): Question {
  const rnd = Math.random();
  if (rnd < 0.6) {
    const options = defaultMCQOptions(topic + ` (${difficulty})`);
    return {
      id: uid("q_"),
      text: `MCQ ${idx + 1}: Brief question about ${topic} (${difficulty}).`,
      type: "mcq",
      options,
      correct: 0,
      marks: difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3,
    };
  } else if (rnd < 0.8) {
    return {
      id: uid("q_"),
      text: `TF ${idx + 1}: The statement about ${topic} is true or false?`,
      type: "tf",
      options: ["True", "False"],
      correct: 0,
      marks: difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3,
    };
  } else {
    return {
      id: uid("q_"),
      text: `SA ${idx + 1}: Explain one key idea about ${topic} in short.`,
      type: "sa",
      options: [],
      correct: null,
      marks: difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3,
    };
  }
}

// ==================== MAIN COMPONENT ====================
export default function QuizCreation() {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numToGenerate, setNumToGenerate] = useState(5);
  const [marksPerQuestionDefault, setMarksPerQuestionDefault] = useState(1);
  const [shuffleQuestionsOnPreview, setShuffleQuestionsOnPreview] = useState(false);
  const [shuffleOptionsOnPreview, setShuffleOptionsOnPreview] = useState(false);

  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [savedQuizzes, setSavedQuizzes] = useState<Quiz[]>([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  // ==================== EVENT HANDLERS ====================
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFileName(file.name);

    setTimeout(() => {
      const sampleTopic = file.name.split(".")[0] || "Uploaded Material";
      const newQs = Array.from({ length: Math.min(8, numToGenerate) }).map((_, i) =>
        makeSampleQuestion(sampleTopic, difficulty, i)
      );
      setGeneratedQuestions(newQs);
      setUploading(false);
    }, 1400);
  };

  const handleGenerateFromTopic = () => {
    if (!topic.trim()) {
      alert("Please enter a topic first.");
      return;
    }
    setUploading(true);
    setTimeout(() => {
      const newQs = Array.from({ length: Math.max(1, Math.min(20, +numToGenerate)) }).map(
        (_, i) => makeSampleQuestion(topic.trim(), difficulty, i)
      );
      newQs.forEach((q) => (q.marks = marksPerQuestionDefault || q.marks));
      setGeneratedQuestions(newQs);
      setUploading(false);
    }, 900);
  };

  const updateGeneratedQuestion = (id: string, field: keyof Question, value: any) => {
    setGeneratedQuestions((prev) => 
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateGeneratedMCQOption = (id: string, optIndex: number, value: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { 
          ...q, 
          options: q.options.map((o, i) => (i === optIndex ? value : o)) 
        } : q
      )
    );
  };

  const addOptionToMCQ = (id: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => 
        q.id === id ? { 
          ...q, 
          options: [...q.options, "New option"] 
        } : q
      )
    );
  };

  const removeOptionFromMCQ = (id: string, optIndex: number) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              options: q.options.filter((_, i) => i !== optIndex),
              correct: q.correct === optIndex ? 0 : (q.correct && q.correct > optIndex ? q.correct - 1 : q.correct),
            }
          : q
      )
    );
  };

  const addToQuiz = (question: Question) => {
    const instance = { 
      ...question, 
      id: uid("quiz_"),
      addedDuringEdit: !!editingQuizId
    };
    setQuizQuestions((prev) => [...prev, instance]);
  };

  const removeFromQuiz = (quizId: string) => {
    if (window.confirm("Are you sure you want to remove this question from the quiz?")) {
      setQuizQuestions((prev) => prev.filter((q) => q.id !== quizId));
    }
  };

  // ==================== API FUNCTIONS ====================
  const fetchTeacherQuizzes = async () => {
    try {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem("user");
        if (!userData) {
          console.error('User not found in localStorage');
          return;
        }
        
        const user: User = JSON.parse(userData);
        const response = await fetch(`http://localhost:5000/api/quizzes/teacher/${user.id}`);
        const data = await response.json();
        
        if (data.success) {
          setSavedQuizzes(data.quizzes || []);
        }
      }
    } catch (error) {
      console.error('Fetch quizzes error:', error);
    }
  };

  const resetAfterSave = () => {
    setQuizQuestions([]);
    setGeneratedQuestions([]);
    setTopic("");
    setFileName("");
    setQuizTitle("");
    setEditingQuizId(null);
  };

  const saveQuiz = async (title: string) => {
    if (!title.trim()) {
      alert('Please enter quiz title');
      return;
    }
    
    if (quizQuestions.length === 0) {
      alert('Please add at least one question to the quiz');
      return;
    }

    if (editingQuizId) {
      await updateQuizInDatabase(editingQuizId, {
        title,
        questions: quizQuestions,
        difficulty,
        duration: 30
      });
      setEditingQuizId(null);
    } else {
      await saveQuizToDatabase(title, quizQuestions);
    }
  };

  const saveQuizToDatabase = async (title: string, questions: Question[]) => {
    try {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem("user");
        if (!userData) {
          alert('User not found! Please login again.');
          return;
        }
        
        const user: User = JSON.parse(userData);
        
        if (!user || !user.id) {
          alert('User not found! Please login again.');
          return;
        }

        const formattedQuestions = questions.map((question, index) => {
          let correctAnswer: number = question.correct !== null ? Number(question.correct) : 0;
          
          if (isNaN(correctAnswer)) {
            correctAnswer = 0;
          }

          return {
            id: question.id || `q${index + 1}`,
            text: question.text || `Question ${index + 1}`,
            type: question.type || 'mcq',
            options: question.options || [],
            correctAnswer: correctAnswer,
            marks: parseInt(question.marks.toString()) || 1,
            explanation: question.explanation || ""
          };
        });

        console.log("📤 Saving quiz with questions:", formattedQuestions);

        const response = await fetch('http://localhost:5000/api/quizzes/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            questions: formattedQuestions,
            difficulty,
            duration: 30,
            teacherId: user.id
          }),
        });

        const data = await response.json();

        if (data.success) {
          alert('Quiz saved successfully!');
          resetAfterSave();
          fetchTeacherQuizzes();
        } else {
          alert(data.message || 'Failed to save quiz');
        }
      }
    } catch (error) {
      console.error('Save quiz error:', error);
      alert('Failed to save quiz to database!');
    }
  };

  const updateQuizInDatabase = async (quizId: string, updatedData: Partial<Quiz>) => {
    try {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem("user");
        if (!userData) {
          alert('User not found! Please login again.');
          return;
        }
        
        const user: User = JSON.parse(userData);
        
        if (!user || !user.id) {
          alert('User not found! Please login again.');
          return;
        }

        const formattedQuestions = updatedData.questions?.map((question, index) => {
          let correctAnswer: number = question.correct !== null ? Number(question.correct) : 0;
          
          if (isNaN(correctAnswer)) {
            correctAnswer = 0;
          }

          return {
            id: question.id || `q${index + 1}`,
            text: question.text || `Question ${index + 1}`,
            type: question.type || 'mcq',
            options: question.options || [],
            correctAnswer: correctAnswer,
            marks: parseInt(question.marks.toString()) || 1,
            explanation: question.explanation || ""
          };
        }) || [];

        const response = await fetch(`http://localhost:5000/api/quizzes/update/${quizId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...updatedData,
            questions: formattedQuestions
          }),
        });

        const data = await response.json();

        if (data.success) {
          alert('Quiz updated successfully!');
          fetchTeacherQuizzes();
        } else {
          alert(data.message || 'Failed to update quiz');
        }
      }
    } catch (error) {
      console.error('Update quiz error:', error);
      alert('Failed to update quiz!');
    }
  };

  const handleEditQuiz = async (quiz: Quiz) => {
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${quiz.id}`);
      const data = await response.json();

      if (data.success) {
        const fullQuiz: Quiz = data.quiz;
        
        const questionsWithNewIds = fullQuiz.questions.map(q => ({
          ...q,
          id: uid("quiz_")
        }));
        
        setQuizTitle(fullQuiz.title || "");
        setQuizQuestions(questionsWithNewIds);
        setDifficulty(fullQuiz.difficulty || "medium");
        setEditingQuizId(fullQuiz.id);
        
        setGeneratedQuestions([]);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        alert(`Editing quiz: ${fullQuiz.title}`);
      } else {
        alert("Failed to load quiz data");
      }
    } catch (error) {
      console.error("Error loading quiz:", error);
      alert("Error loading quiz for editing");
    }
  };

  const deleteQuizFromDatabase = async (quizId: string) => {
    if (!window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem("user");
        if (!userData) {
          alert('User not found! Please login again.');
          return;
        }
        
        const user: User = JSON.parse(userData);
        
        if (!user || !user.id) {
          alert('User not found! Please login again.');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/quizzes/delete/${quizId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          alert('Quiz deleted successfully!');
          fetchTeacherQuizzes();
        } else {
          alert(data.message || 'Failed to delete quiz');
        }
      }
    } catch (error) {
      console.error('Delete quiz error:', error);
      alert('Failed to delete quiz!');
    }
  };

  const exportQuizJSON = (quizObj: any) => {
    const json = JSON.stringify(quizObj, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (quizObj.title || "quiz").replace(/\s+/g, "_") + ".json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewList = (list: Question[]): Question[] => {
    const questions = shuffleQuestionsOnPreview ? shuffleArray(list) : [...list];
    return questions.map((q) => {
      const optionsRendered =
        q.type === "mcq" && q.options && q.options.length
          ? shuffleOptionsOnPreview
            ? shuffleArray(q.options)
            : q.options
          : q.options;
      return { ...q, optionsRendered };
    });
  };

  const templates: Template[] = [
    { 
      name: "Quick 5 MCQs", 
      generator: () => Array.from({ length: 5 }).map((_, i) => ({ 
        ...makeSampleQuestion("Core Topic", "medium", i), 
        type: "mcq" 
      })) 
    },
    { 
      name: "Mixed 10", 
      generator: () => Array.from({ length: 10 }).map((_, i) => 
        makeSampleQuestion("Mixed Topic", i % 3 === 0 ? "hard" : "easy", i)
      ) 
    },
  ];

  // ==================== USE EFFECT ====================
  useEffect(() => {
    fetchTeacherQuizzes();
  }, []);

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800">
      {/* Spacer for header */}
      <div className="h-20"></div>

      <main className="max-w-7xl mx-auto px-6 pb-16">
        {/* Hero Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-8 border border-white/60">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Create Engaging Quizzes</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Use AI-powered question generation from uploaded materials or topics. 
                Edit questions in real-time and build perfect quizzes for your students.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                onClick={() => {
                  const tpl = templates[0].generator();
                  setGeneratedQuestions(tpl);
                }}
              >
                🚀 Load Template
              </button>
              <button
                className="px-6 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300"
                onClick={() => {
                  setGeneratedQuestions([]);
                  setQuizQuestions([]);
                  setSavedQuizzes([]);
                  setFileName("");
                  setTopic("");
                }}
              >
                🔄 Reset All
              </button>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column: Upload + Generation */}
          <div className="lg:col-span-2 space-y-8">
            {/* File Upload Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/60 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">📤</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Upload Learning Materials</h3>
                  <p className="text-gray-600">Upload PDF, DOC, PPT files to generate questions automatically</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors duration-300">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <div className="text-4xl mb-3">📄</div>
                      <p className="text-gray-700 font-medium mb-2">Choose File</p>
                      <p className="text-gray-500 text-sm">PDF, DOC, PPT files supported</p>
                    </label>
                  </div>
                  <div className="text-center">
                    {uploading ? (
                      <div className="flex items-center justify-center gap-2 text-indigo-600">
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        Processing {fileName}...
                      </div>
                    ) : fileName ? (
                      <p className="text-green-600 font-medium">✅ Processed: {fileName}</p>
                    ) : (
                      <p className="text-gray-500">No file selected</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Questions
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={numToGenerate}
                      onChange={(e) => setNumToGenerate(Math.max(1, Math.min(50, Number(e.target.value || 1))))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Default Marks per Question
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={marksPerQuestionDefault}
                      onChange={(e) => setMarksPerQuestionDefault(Math.max(0, Number(e.target.value || 0)))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Topic Generator Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/60 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Generate by Topic</h3>
                  <p className="text-gray-600">Create questions based on specific topics and difficulty levels</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Topic</label>
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="E.g. Data Structures, OS Scheduling..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-3">
                  <button
                    onClick={handleGenerateFromTopic}
                    disabled={uploading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </div>
                    ) : (
                      "Generate Questions"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setTopic("Operating Systems - CPU Scheduling");
                      setDifficulty("hard");
                      setNumToGenerate(6);
                    }}
                    className="px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300"
                  >
                    💡 Suggest
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffleQuestionsOnPreview}
                      onChange={(e) => setShuffleQuestionsOnPreview(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Shuffle Questions
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffleOptionsOnPreview}
                      onChange={(e) => setShuffleOptionsOnPreview(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Shuffle Options
                  </label>
                </div>
              </div>
            </div>

            {/* Generated Questions Editor */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/60 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                    <span className="text-xl">📝</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Generated Questions</h3>
                    <p className="text-gray-600">{generatedQuestions.length} questions ready for editing</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 bg-indigo-50 px-3 py-1 rounded-full">
                  Click <span className="font-semibold text-indigo-600">Add to Quiz</span> to include
                </div>
              </div>

              {generatedQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-gray-500 text-lg">No questions generated yet</p>
                  <p className="text-gray-400">Upload a file or generate questions by topic to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {generatedQuestions.map((q) => (
                    <div key={q.id} className="border border-gray-200 rounded-2xl p-6 hover:border-indigo-300 transition-all duration-300">
                      <div className="flex gap-6">
                        <div className="flex-1">
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Question Text</label>
                            <textarea
                              value={q.text}
                              onChange={(e) => updateGeneratedQuestion(q.id, "text", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 resize-none"
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-6 items-center">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                              <select
                                value={q.type}
                                onChange={(e) => updateGeneratedQuestion(q.id, "type", e.target.value as "mcq" | "tf" | "sa")}
                                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                              >
                                <option value="mcq">Multiple Choice</option>
                                <option value="tf">True / False</option>
                                <option value="sa">Short Answer</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Marks</label>
                              <input
                                type="number"
                                min="0"
                                value={q.marks ?? marksPerQuestionDefault}
                                onChange={(e) => updateGeneratedQuestion(q.id, "marks", Math.max(0, Number(e.target.value || 0)))}
                                className="w-24 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                              />
                            </div>
                          </div>

                          {/* MCQ Options Editor */}
                          {q.type === "mcq" && (
                            <div className="mt-6">
                              <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Options (Select correct answer)
                              </label>
                              <div className="space-y-3">
                                {q.options.map((opt, i) => (
                                  <div key={i} className="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      name={`correct-${q.id}`}
                                      checked={q.correct === i}
                                      onChange={() => updateGeneratedQuestion(q.id, "correct", i)}
                                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <input
                                      value={opt}
                                      onChange={(e) => updateGeneratedMCQOption(q.id, i, e.target.value)}
                                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                                      placeholder={`Option ${i + 1}`}
                                    />
                                    <button
                                      onClick={() => removeOptionFromMCQ(q.id, i)}
                                      className="px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-200"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                                <div className="flex gap-3">
                                  <button 
                                    onClick={() => addOptionToMCQ(q.id)}
                                    className="px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors duration-200 font-medium"
                                  >
                                    + Add Option
                                  </button>
                                  <button 
                                    onClick={() => updateGeneratedQuestion(q.id, "options", defaultMCQOptions(topic || "Topic"))}
                                    className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                                  >
                                    Reset Options
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="w-48 flex flex-col gap-3">
                          <button 
                            onClick={() => addToQuiz(q)}
                            className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5"
                          >
                            Add to Quiz
                          </button>
                          <button
                            onClick={() => {
                              const clone = { ...q, id: uid("q_") };
                              setGeneratedQuestions((prev) => [clone, ...prev]);
                            }}
                            className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                          >
                            Duplicate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column: Quiz preview + saved quizzes */}
          <aside className="space-y-8">
            {/* Current Quiz Preview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Current Quiz</h4>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  {quizQuestions.length} questions
                </span>
              </div>

              {quizQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-gray-500">No questions added yet</p>
                  <p className="text-gray-400 text-sm">Add questions from the left panel</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-auto pr-2">
                  {previewList(quizQuestions).map((q, idx) => (
                    <div key={q.id} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors duration-200">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                              Q{idx + 1}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              q.type === 'mcq' ? 'bg-blue-100 text-blue-700' :
                              q.type === 'tf' ? 'bg-green-100 text-green-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {q.type.toUpperCase()}
                            </span>
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
                              {q.marks} marks
                            </span>
                            {q.addedDuringEdit && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-800 mb-2">{q.text}</p>
                          
                          {q.type === "mcq" && q.options && (
                            <ul className="space-y-1 text-sm">
                              {((q as any).optionsRendered || q.options).map((opt: string, i: number) => (
                                <li key={i} className={`${q.correct === i ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                                  • {opt}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <button 
                          onClick={() => removeFromQuiz(q.id)}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => {
                    const title = prompt("Enter quiz title:", quizTitle || "");
                    if (title) {
                      if (editingQuizId && window.confirm(`Update "${title}"? This will overwrite the existing quiz.`)) {
                        saveQuiz(title);
                      } else if (!editingQuizId) {
                        saveQuiz(title);
                      }
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                >
                  {editingQuizId ? "Update Quiz" : "Save Quiz"}
                </button>
                <button 
                  onClick={() => exportQuizJSON({ title: quizTitle || "CurrentQuiz", questions: quizQuestions })}
                  className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Export JSON
                </button>
              </div>
            </div>

            {/* Saved Quizzes */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 hover:shadow-xl transition-all duration-300">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Saved Quizzes</h4>
              
              {savedQuizzes.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">💾</div>
                  <p className="text-gray-500 text-sm">No saved quizzes yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    <div className="space-y-3">
                      {savedQuizzes.map((sq, index) => (
                        <div key={sq.id || index} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors duration-200 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-800 mb-1 truncate">{sq.title}</h5>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                <span>{sq.questionsCount || sq.questions?.length || 0} questions</span>
                                <span>•</span>
                                <span className="capitalize">{sq.difficulty || 'medium'}</span>
                                <span>•</span>
                                <span>{sq.totalMarks || 'N/A'} total marks</span>
                                <span>•</span>
                                <span className="whitespace-nowrap">
                                  {new Date(sq.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-end">
                              <button 
                                onClick={() => handleEditQuiz(sq)}
                                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm whitespace-nowrap"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => exportQuizJSON(sq)}
                                className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors duration-200 text-sm whitespace-nowrap"
                              >
                                Download
                              </button>
                              <button 
                                onClick={() => deleteQuizFromDatabase(sq.id)}
                                className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm whitespace-nowrap"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
              <h4 className="font-semibold text-lg mb-3">💡 Quick Tips</h4>
              <ul className="space-y-2 text-indigo-100 text-sm">
                <li>• Use clear, concise question wording</li>
                <li>• Keep MCQ distractors plausible but distinct</li>
                <li>• Weight harder questions with more marks</li>
                <li>• Export JSON for backend integration</li>
                <li>• Use shuffle options for test security</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}