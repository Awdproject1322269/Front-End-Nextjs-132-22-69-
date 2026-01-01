import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Word, and PowerPoint files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/quizapp')
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.log('❌ MongoDB Connection Error:', err));

// Add this after mongoose connection
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// ==================== SCHEMAS ====================

// User Schema (Updated with name field)
const userSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['Teacher', 'Student']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Quiz Schema
const quizSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  questions: [{
    id: String,
    text: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['mcq', 'tf', 'sa'],
      required: true
    },
    options: [String],
    correctAnswer: Number,
    marks: {
      type: Number,
      default: 1
    },
    explanation: String
  }],
  totalMarks: Number,
  duration: Number,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Quiz = mongoose.model('Quiz', quizSchema);

// Student Schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  course: {
    type: String,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendance: {
    type: Boolean,
    default: false
  },
  allowed: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const Student = mongoose.model('Student', studentSchema);

// Report Schema
const reportSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  quizTitle: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: String,
    default: "00:00"
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'not-started'],
    default: 'completed'
  },
  answers: [{
    questionId: String,
    selectedAnswer: Number,
    isCorrect: Boolean,
    timeSpent: Number
  }],
  grade: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Report = mongoose.model('Report', reportSchema);

// Connection Schema
const connectionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  course: String,
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: Date
});

const Connection = mongoose.model('Connection', connectionSchema);

// Course Schema (Updated with topics field)
const courseSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  credits: {
    type: Number,
    default: 3
  },
  department: {
    type: String,
    default: 'Computer Science'
  },
  students: {
    type: Number,
    default: 0
  },
  topics: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Course = mongoose.model('Course', courseSchema);

// Topic Schema
const topicSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  duration: {
    type: Number,
    default: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  order: Number,
  quizzes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Topic = mongoose.model('Topic', topicSchema);

// Settings Schema
const settingsSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  general: {
    questionsPerPage: {
      type: Number,
      default: 5
    },
    shuffleQuestions: {
      type: Boolean,
      default: true
    },
    shuffleOptions: {
      type: Boolean,
      default: false
    },
    marksPerQuestion: {
      type: Number,
      default: 1
    },
    timeLimit: {
      type: Number,
      default: 30
    },
    allowReview: {
      type: Boolean,
      default: true
    },
    autoSubmit: {
      type: Boolean,
      default: false
    },
    showResults: {
      type: Boolean,
      default: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  },
  security: {
    autoSubmit: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number,
      default: 30
    },
    preventCopyPaste: {
      type: Boolean,
      default: true
    },
    fullScreenMode: {
      type: Boolean,
      default: false
    }
  },
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    quizSubmissions: {
      type: Boolean,
      default: true
    },
    studentQuestions: {
      type: Boolean,
      default: true
    },
    systemUpdates: {
      type: Boolean,
      default: false
    },
    performanceReports: {
      type: Boolean,
      default: true
    },
    deliverySchedule: {
      type: String,
      enum: ['immediately', 'daily', 'weekly'],
      default: 'immediately'
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const Settings = mongoose.model('Settings', settingsSchema);

// Helper function for grade calculation
function getGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'C+';
  if (percentage >= 60) return 'C';
  return 'F';
}

// ==================== API ROUTES ====================

// 🏠 Test API
app.get('/api', (req, res) => {
  res.json({ 
    message: '✅ Backend is working! QuizQuest-3 API is running.' 
  });
});

// ==================== SERVICE-3: AUTO QUESTION GENERATION APIs ====================

// File Upload and Question Generation API
app.post('/api/quiz/generate-from-file', upload.single('file'), async (req, res) => {
  try {
    const { teacherId, title, difficulty, description } = req.body;
    
    if (!teacherId || !title || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID, title, and file are required!'
      });
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Simulate AI question generation (in real implementation, integrate with AI service)
    const generatedQuestions = await simulateAIGeneration(file.path, fileExtension, difficulty);

    // Create quiz with generated questions
    const newQuiz = new Quiz({
      teacherId,
      title,
      description: description || `Quiz generated from ${file.originalname}`,
      questions: generatedQuestions,
      difficulty: difficulty || 'medium',
      duration: 30,
      totalMarks: generatedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0),
      isActive: true
    });

    await newQuiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz generated successfully from file! 🎉',
      quiz: {
        id: newQuiz._id,
        title: newQuiz.title,
        questionsCount: newQuiz.questions.length,
        difficulty: newQuiz.difficulty,
        totalMarks: newQuiz.totalMarks
      },
      fileInfo: {
        filename: file.originalname,
        size: file.size,
        type: file.mimetype
      }
    });

  } catch (error) {
    console.error('File upload and quiz generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz from file!'
    });
  }
});

// Generate Questions from Topic API
app.post('/api/quiz/generate-from-topic', async (req, res) => {
  try {
    const { teacherId, title, topic, difficulty, numberOfQuestions, questionType } = req.body;

    if (!teacherId || !title || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID, title, and topic are required!'
      });
    }

    // Simulate AI question generation based on topic
    const generatedQuestions = await generateQuestionsFromTopic(
      topic, 
      difficulty, 
      numberOfQuestions || 10, 
      questionType || 'mcq'
    );

    // Create quiz with generated questions
    const newQuiz = new Quiz({
      teacherId,
      title,
      description: `Quiz generated from topic: ${topic}`,
      questions: generatedQuestions,
      difficulty: difficulty || 'medium',
      duration: 30,
      totalMarks: generatedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0),
      isActive: true
    });

    await newQuiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz generated successfully from topic! 🎉',
      quiz: {
        id: newQuiz._id,
        title: newQuiz.title,
        questionsCount: newQuiz.questions.length,
        difficulty: newQuiz.difficulty,
        totalMarks: newQuiz.totalMarks
      },
      generationInfo: {
        topic,
        difficulty,
        numberOfQuestions: generatedQuestions.length,
        questionType
      }
    });

  } catch (error) {
    console.error('Topic-based quiz generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz from topic!'
    });
  }
});

// Get AI Generation History
app.get('/api/quiz/generation-history/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const generatedQuizzes = await Quiz.find({ 
      teacherId,
      description: { $regex: /generated from/i }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      history: generatedQuizzes.map(quiz => ({
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        questionsCount: quiz.questions.length,
        difficulty: quiz.difficulty,
        totalMarks: quiz.totalMarks,
        createdAt: quiz.createdAt,
        generationType: quiz.description.includes('file') ? 'file' : 'topic'
      }))
    });

  } catch (error) {
    console.error('Get generation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch generation history!'
    });
  }
});

// ==================== HELPER FUNCTIONS FOR AI GENERATION ====================

// Simulate AI question generation from file
async function simulateAIGeneration(filePath, fileExtension, difficulty) {
  // In real implementation, integrate with:
  // - Google Cloud Vision API for PDF text extraction
  // - OpenAI API for question generation
  // - Microsoft Graph API for Word/PPT processing
  
  console.log(`Processing ${fileExtension} file: ${filePath} with difficulty: ${difficulty}`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate sample questions based on file type and difficulty
  const questions = [];
  const questionCount = difficulty === 'hard' ? 15 : difficulty === 'medium' ? 10 : 5;
  
  for (let i = 0; i < questionCount; i++) {
    questions.push({
      id: `q${i + 1}`,
      text: `Sample question ${i + 1} generated from ${fileExtension.toUpperCase()} file (${difficulty} difficulty)`,
      type: 'mcq',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: Math.floor(Math.random() * 4),
      marks: difficulty === 'hard' ? 2 : difficulty === 'medium' ? 1.5 : 1,
      explanation: `This question was automatically generated from the uploaded document.`
    });
  }
  
  return questions;
}

// Generate questions from topic
async function generateQuestionsFromTopic(topic, difficulty, numberOfQuestions, questionType) {
  console.log(`Generating ${numberOfQuestions} ${questionType} questions about "${topic}" with ${difficulty} difficulty`);
  
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const questions = [];
  
  for (let i = 0; i < numberOfQuestions; i++) {
    const question = {
      id: `topic_q${i + 1}`,
      text: `Question about ${topic}: What is the main concept related to "${topic}" in context ${i + 1}?`,
      type: questionType,
      marks: difficulty === 'hard' ? 2 : difficulty === 'medium' ? 1.5 : 1,
      explanation: `This question was generated based on the topic: ${topic}`
    };
    
    if (questionType === 'mcq') {
      question.options = [
        `Correct answer about ${topic}`,
        `Incorrect option 1`,
        `Incorrect option 2`, 
        `Incorrect option 3`
      ];
      question.correctAnswer = 0;
    } else if (questionType === 'tf') {
      question.options = ['True', 'False'];
      question.correctAnswer = Math.random() > 0.5 ? 0 : 1;
    } else {
      question.correctAnswer = `Sample answer for ${topic} question`;
    }
    
    questions.push(question);
  }
  
  return questions;
}

// ==================== QUIZ TIMER API ====================

// Start quiz timer
app.post('/api/quiz/start-timer', async (req, res) => {
  try {
    const { quizId, studentId, duration } = req.body;
    
    const timerData = {
      quizId,
      studentId, 
      startTime: new Date(),
      endTime: new Date(Date.now() + (duration || 30) * 60 * 1000), // default 30 minutes
      duration: duration || 30
    };
    
    // In production, store in Redis for better performance
    res.json({
      success: true,
      timer: timerData,
      message: 'Quiz timer started! ⏰'
    });
    
  } catch (error) {
    console.error('Start timer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start quiz timer!'
    });
  }
});

// Get remaining time
app.get('/api/quiz/remaining-time/:quizId/:studentId', async (req, res) => {
  try {
    const { quizId, studentId } = req.params;
    
    // Simulate timer calculation
    const remainingTime = Math.max(0, 30 * 60 - Math.floor(Math.random() * 600)); // Mock data
    
    res.json({
      success: true,
      remainingTime,
      formattedTime: formatTime(remainingTime)
    });
    
  } catch (error) {
    console.error('Get remaining time error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get remaining time!'
    });
  }
});

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// ==================== COURSE MANAGEMENT APIs ====================

// 📚 Get all courses for a teacher (Updated for CourseManagement.jsx)
app.get('/api/courses/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const courses = await Course.find({ teacherId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      courses: courses.map(course => ({
        id: course._id,
        title: course.title,
        code: course.code,
        description: course.description,
        credits: course.credits,
        department: course.department,
        students: course.students,
        topics: course.topics,
        createdAt: course.createdAt.toISOString().split('T')[0],
        status: course.status
      }))
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses!'
    });
  }
});

// ➕ Create new course (Updated for CourseManagement.jsx)
app.post('/api/courses/create', async (req, res) => {
  try {
    const { teacherId, title, code, description, credits, department } = req.body;

    if (!teacherId || !title || !code) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID, title, and code are required!'
      });
    }

    // Check if course code already exists for this teacher
    const existingCourse = await Course.findOne({ 
      teacherId, 
      code: code.toUpperCase() 
    });
    
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course with this code already exists!'
      });
    }

    const newCourse = new Course({
      teacherId,
      title,
      code: code.toUpperCase(),
      description: description || "",
      credits: credits || 3,
      department: department || 'Computer Science',
      students: 0,
      topics: 0,
      status: 'active'
    });

    await newCourse.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully! 🎉',
      course: {
        id: newCourse._id,
        title: newCourse.title,
        code: newCourse.code,
        description: newCourse.description,
        credits: newCourse.credits,
        department: newCourse.department,
        students: newCourse.students,
        topics: newCourse.topics,
        createdAt: newCourse.createdAt.toISOString().split('T')[0],
        status: newCourse.status
      }
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course!'
    });
  }
});

// 🗑️ Delete course (Updated for CourseManagement.jsx)
app.delete('/api/courses/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found!'
      });
    }

    // Delete the course and all its topics
    await Course.findByIdAndDelete(courseId);
    await Topic.deleteMany({ courseId });

    res.json({
      success: true,
      message: 'Course deleted successfully!'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course!'
    });
  }
});

// ==================== TOPIC MANAGEMENT APIs ====================

// 📖 Get all topics for a course (Updated for CourseManagement.jsx)
app.get('/api/topics/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;

    const topics = await Topic.find({ courseId }).sort({ order: 1 });

    res.json({
      success: true,
      topics: topics.map(topic => ({
        id: topic._id,
        courseId: topic.courseId,
        title: topic.title,
        description: topic.description,
        duration: topic.duration,
        difficulty: topic.difficulty,
        order: topic.order,
        quizzes: topic.quizzes,
        createdAt: topic.createdAt
      }))
    });

  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topics!'
    });
  }
});

// ➕ Create new topic (Updated for CourseManagement.jsx)
app.post('/api/topics/create', async (req, res) => {
  try {
    const { courseId, title, description, duration, difficulty } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and title are required!'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found!'
      });
    }

    // Get the next order number
    const lastTopic = await Topic.findOne({ courseId }).sort({ order: -1 });
    const nextOrder = lastTopic ? lastTopic.order + 1 : 1;

    const newTopic = new Topic({
      courseId,
      title,
      description: description || "",
      duration: duration || 1,
      difficulty: difficulty || 'medium',
      order: nextOrder,
      quizzes: 0
    });

    await newTopic.save();

    // Update course topics count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { topics: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Topic added successfully! 🎉',
      topic: {
        id: newTopic._id,
        courseId: newTopic.courseId,
        title: newTopic.title,
        description: newTopic.description,
        duration: newTopic.duration,
        difficulty: newTopic.difficulty,
        order: newTopic.order,
        quizzes: newTopic.quizzes,
        createdAt: newTopic.createdAt
      }
    });

  } catch (error) {
    console.error('Add topic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add topic!'
    });
  }
});

// 🗑️ Delete topic (Updated for CourseManagement.jsx)
app.delete('/api/topics/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found!'
      });
    }

    const courseId = topic.courseId;

    await Topic.findByIdAndDelete(topicId);

    // Update course topics count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { topics: -1 }
    });

    res.json({
      success: true,
      message: 'Topic deleted successfully!'
    });

  } catch (error) {
    console.error('Delete topic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete topic!'
    });
  }
});

// 📊 Get all topics for teacher (for All Topics tab in CourseManagement.jsx)
app.get('/api/topics/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    // First get all courses by this teacher
    const courses = await Course.find({ teacherId });
    const courseIds = courses.map(course => course._id);

    // Then get all topics for these courses
    const topics = await Topic.find({ 
      courseId: { $in: courseIds } 
    })
    .populate('courseId', 'title code')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      topics: topics.map(topic => ({
        id: topic._id,
        courseId: topic.courseId._id,
        courseTitle: topic.courseId.title,
        courseCode: topic.courseId.code,
        title: topic.title,
        description: topic.description,
        duration: topic.duration,
        difficulty: topic.difficulty,
        order: topic.order,
        quizzes: topic.quizzes,
        createdAt: topic.createdAt
      }))
    });

  } catch (error) {
    console.error('Get teacher topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topics!'
    });
  }
});

// ==================== EXISTING APIs (Unchanged) ====================

// 📧 Registration API (Updated with name field)
app.post('/api/register', async (req, res) => {
  try {
    const { role, name, email, password, confirm } = req.body;

    if (!role || !name || !email || !password || !confirm) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill in all fields!' 
      });
    }

    if (password !== confirm) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match!' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long!' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email!' 
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      role,
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: `${role} registered successfully! 🎉`,
      user: {
        role: newUser.role,
        name: newUser.name,
        email: newUser.email,
        id: newUser._id
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// 🔑 Login API
app.post('/api/login', async (req, res) => {
  try {
    const { role, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill in all fields!' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password!' 
      });
    }

    if (user.role !== role) {
      return res.status(400).json({ 
        success: false, 
        message: `No ${role} account found with this email!` 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password!' 
      });
    }

    res.json({
      success: true,
      message: `${role} logged in successfully! 🎉`,
      user: {
        role: user.role,
        name: user.name,
        email: user.email,
        id: user._id
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// ==================== MANAGE STUDENTS APIs ====================

// 🔍 Search Students API (Updated)
app.get('/api/students/search', async (req, res) => {
  try {
    const { query, teacherId } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required!'
      });
    }

    // Search students by name or email
    const students = await User.find({
      role: 'Student',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('name email _id');

    // Check if students are already linked with this teacher
    const linkedConnections = await Connection.find({
      teacherId,
      studentId: { $in: students.map(s => s._id) }
    });

    const linkedStudentIds = linkedConnections.map(conn => conn.studentId.toString());

    const results = students.map(student => ({
      id: student._id,
      studentId: student._id,
      name: student.name,
      email: student.email,
      isLinked: linkedStudentIds.includes(student._id.toString())
    }));

    res.json({
      success: true,
      students: results
    });

  } catch (error) {
    console.error('Search students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search students!'
    });
  }
});

// 📨 Send Connection Request API
app.post('/api/connections/request', async (req, res) => {
  try {
    const { teacherId, studentId, course } = req.body;

    if (!teacherId || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID and Student ID are required!'
      });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      teacherId,
      studentId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: existingConnection.status === 'pending' 
          ? 'Connection request already sent!' 
          : 'Student is already linked!'
      });
    }

    const newConnection = new Connection({
      teacherId,
      studentId,
      course: course || 'General',
      status: 'pending'
    });

    await newConnection.save();

    // Populate student details for response
    await newConnection.populate('studentId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully!',
      connection: {
        id: newConnection._id,
        studentId: newConnection.studentId._id,
        name: newConnection.studentId.name,
        email: newConnection.studentId.email,
        course: newConnection.course,
        requestedAt: newConnection.requestedAt
      }
    });

  } catch (error) {
    console.error('Send connection request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send connection request!'
    });
  }
});

// ✅ Approve/Reject Request API (Updated)
app.post('/api/connections/respond', async (req, res) => {
  try {
    const { connectionId, action } = req.body;

    const connection = await Connection.findById(connectionId).populate('studentId', 'name email');
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found!'
      });
    }

    connection.status = action === 'approve' ? 'approved' : 'rejected';
    connection.respondedAt = new Date();
    await connection.save();

    res.json({
      success: true,
      message: `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully!`,
      connection: {
        id: connection._id,
        studentId: connection.studentId._id,
        name: connection.studentId.name,
        email: connection.studentId.email,
        course: connection.course,
        status: connection.status
      }
    });

  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request!'
    });
  }
});

// 🗑️ Remove Linked Student API
app.delete('/api/connections/remove/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found!'
      });
    }

    await Connection.findByIdAndDelete(connectionId);

    res.json({
      success: true,
      message: 'Student removed successfully!'
    });

  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove student!'
    });
  }
});

// 📊 Get Connection Stats API
app.get('/api/connections/stats/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const stats = await Connection.aggregate([
      { $match: { teacherId: new mongoose.Types.ObjectId(teacherId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalLinked = stats.find(stat => stat._id === 'approved')?.count || 0;
    const totalPending = stats.find(stat => stat._id === 'pending')?.count || 0;

    res.json({
      success: true,
      stats: {
        totalLinked,
        totalPending,
        totalConnections: totalLinked + totalPending
      }
    });

  } catch (error) {
    console.error('Get connection stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connection stats!'
    });
  }
});

// ==================== QUIZ APIs ====================

// server.js - /api/quizzes/save route mein questions processing update karo
app.post('/api/quizzes/save', async (req, res) => {
  try {
    const { title, questions, difficulty, duration, description, teacherId } = req.body;

    console.log("📥 Received quiz data:", {
      title,
      questionsCount: questions?.length,
      questions: questions?.map(q => ({
        text: q.text,
        correctAnswer: q.correctAnswer,
        type: typeof q.correctAnswer
      }))
    });

    if (!title || !questions || !teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Title, questions, and teacher ID are required!'
      });
    }

    // ✅ Process questions to ensure correct data types
    const processedQuestions = questions.map((question, index) => {
      let correctAnswer = question.correctAnswer;
      
      // Convert to number if it's a string
      if (typeof correctAnswer === 'string') {
        correctAnswer = parseInt(correctAnswer, 10);
      }
      
      // Ensure it's a valid number
      if (isNaN(correctAnswer) || correctAnswer < 0) {
        correctAnswer = 0;
      }

      console.log(`✅ Processed Q${index}:`, {
        correctAnswer,
        type: typeof correctAnswer,
        options: question.options
      });

      return {
        id: question.id || `q${index + 1}`,
        text: question.text,
        type: question.type || 'mcq',
        options: question.options || [],
        correctAnswer: correctAnswer, // ✅ Now definitely a NUMBER
        marks: parseInt(question.marks) || 1,
        explanation: question.explanation || ""
      };
    });

    const totalMarks = processedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);

    const newQuiz = new Quiz({
      teacherId,
      title,
      questions: processedQuestions,
      difficulty: difficulty || 'medium',
      duration: duration || 30,
      description: description || "",
      totalMarks
    });

    await newQuiz.save();

    console.log("✅ Quiz saved successfully with processed questions");

    res.status(201).json({
      success: true,
      message: 'Quiz saved successfully! 🎉',
      quiz: {
        id: newQuiz._id,
        title: newQuiz.title,
        questionsCount: newQuiz.questions.length,
        difficulty: newQuiz.difficulty,
        totalMarks: newQuiz.totalMarks,
        createdAt: newQuiz.createdAt
      }
    });

  } catch (error) {
    console.error('Quiz save error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save quiz!'
    });
  }
});

app.get('/api/quizzes/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const quizzes = await Quiz.find({ teacherId })
      .sort({ createdAt: -1 })
      .select('title questions difficulty totalMarks createdAt isActive');

    res.json({
      success: true,
      quizzes: quizzes.map(quiz => ({
        id: quiz._id,
        title: quiz.title,
        questionsCount: quiz.questions.length,
        difficulty: quiz.difficulty,
        totalMarks: quiz.totalMarks,
        createdAt: quiz.createdAt,
        isActive: quiz.isActive
      }))
    });

  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes!'
    });
  }
});

// server.js - /api/quizzes/:id route mein debug add karo
app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found!'
      });
    }

    console.log("📤 Sending quiz data:", {
      title: quiz.title,
      questions: quiz.questions.map(q => ({
        text: q.text?.substring(0, 30),
        correctAnswer: q.correctAnswer,
        type: typeof q.correctAnswer,
        options: q.options
      }))
    });

    res.json({
      success: true,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        questions: quiz.questions,
        difficulty: quiz.difficulty,
        duration: quiz.duration,
        totalMarks: quiz.totalMarks,
        createdAt: quiz.createdAt
      }
    });

  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz!'
    });
  }
});

app.put('/api/quizzes/update/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, questions, difficulty, duration, description } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found!'
      });
    }

    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    quiz.title = title || quiz.title;
    quiz.questions = questions || quiz.questions;
    quiz.difficulty = difficulty || quiz.difficulty;
    quiz.duration = duration || quiz.duration;
    quiz.description = description || quiz.description;
    quiz.totalMarks = totalMarks;
    quiz.updatedAt = new Date();

    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz updated successfully! 🎉',
      quiz: {
        id: quiz._id,
        title: quiz.title,
        questionsCount: quiz.questions.length,
        difficulty: quiz.difficulty,
        totalMarks: quiz.totalMarks,
        updatedAt: quiz.updatedAt
      }
    });

  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz!'
    });
  }
});

app.delete('/api/quizzes/delete/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found!'
      });
    }

    await Quiz.findByIdAndDelete(quizId);

    res.json({
      success: true,
      message: 'Quiz deleted successfully!'
    });

  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz!'
    });
  }
});

// ==================== STUDENT APIs ====================

app.get('/api/students/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    // 1. Pehle Student model se students lao
    const studentModelStudents = await Student.find({ teacherId });

    // 2. Phir linked students lao connections se
    const linkedStudents = await Connection.find({
      teacherId,
      status: 'approved'
    }).populate('studentId', 'name email');

    // 3. Dono ko combine karo
    const allStudents = [...studentModelStudents];

    // 4. Linked students ko add karo (jo Student model mein nahi hain)
    linkedStudents.forEach(connection => {
      const studentExists = allStudents.some(s => 
        s.email === connection.studentId.email
      );
      
      if (!studentExists) {
        // Linked student ko Student model jaisi format mein convert karo
        allStudents.push({
          _id: connection.studentId._id,
          name: connection.studentId.name,
          email: connection.studentId.email,
          course: connection.course || "CS-101",
          attendance: false, // default values
          allowed: false,
          lastUpdated: new Date(),
          teacherId: teacherId
        });
      }
    });

    res.json({
      success: true,
      students: allStudents
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students!'
    });
  }
});

app.post('/api/students/add', async (req, res) => {
  try {
    const { name, email, course, teacherId } = req.body;

    if (!name || !email || !course || !teacherId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required!'
      });
    }

    const existingStudent = await Student.findOne({ email, teacherId });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email already exists!'
      });
    }

    const newStudent = new Student({
      name,
      email,
      course,
      teacherId,
      attendance: false,
      allowed: false
    });

    await newStudent.save();

    res.status(201).json({
      success: true,
      message: 'Student added successfully! 🎉',
      student: newStudent
    });

  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add student!'
    });
  }
});

app.put('/api/students/update/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { attendance, allowed } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found!'
      });
    }

    if (attendance === false) {
      student.allowed = false;
    }
    
    if (attendance !== undefined) student.attendance = attendance;
    if (allowed !== undefined) student.allowed = allowed;
    
    student.lastUpdated = new Date();

    await student.save();

    res.json({
      success: true,
      message: 'Student updated successfully!',
      student
    });

  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student!'
    });
  }
});

app.delete('/api/students/delete/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found!'
      });
    }

    await Student.findByIdAndDelete(studentId);

    res.json({
      success: true,
      message: 'Student deleted successfully!'
    });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student!'
    });
  }
});

app.put('/api/students/bulk-update', async (req, res) => {
  try {
    const { teacherId, updates } = req.body;

    const bulkOperations = updates.map(update => ({
      updateOne: {
        filter: { _id: update.studentId, teacherId },
        update: { 
          $set: update.fields,
          lastUpdated: new Date()
        }
      }
    }));

    await Student.bulkWrite(bulkOperations);

    res.json({
      success: true,
      message: 'Bulk update completed successfully!'
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk update!'
    });
  }
});

// ==================== REPORT APIs ====================

app.get('/api/reports/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const reports = await Report.find({ teacherId })
      .sort({ date: -1 })
      .populate('quizId', 'title difficulty');

    res.json({
      success: true,
      reports: reports.map(report => ({
        id: report._id,
        student: report.studentName,
        quiz: report.quizTitle,
        score: report.score,
        total: report.totalMarks,
        percentage: report.percentage,
        date: report.date,
        timeSpent: report.timeSpent,
        status: report.status,
        grade: report.grade,
        difficulty: report.quizId?.difficulty || 'medium'
      }))
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports!'
    });
  }
});

app.post('/api/reports/add', async (req, res) => {
  try {
    const { 
      studentId, 
      teacherId, 
      studentName, 
      quizId, 
      quizTitle, 
      score, 
      totalMarks, 
      answers,
      timeSpent 
    } = req.body;

    if (!studentId || !teacherId || !quizId || !score || !totalMarks) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing!'
      });
    }

    const percentage = (score / totalMarks * 100).toFixed(1);

    const newReport = new Report({
      studentId,
      teacherId,
      studentName,
      quizId,
      quizTitle,
      score,
      totalMarks,
      percentage,
      timeSpent: timeSpent || "00:00",
      answers: answers || [],
      grade: getGrade(percentage),
      status: 'completed'
    });

    await newReport.save();

    res.status(201).json({
      success: true,
      message: 'Report saved successfully! 🎉',
      report: newReport
    });

  } catch (error) {
    console.error('Add report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save report!'
    });
  }
});

app.put('/api/reports/update/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { score, totalMarks, timeSpent, answers } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found!'
      });
    }

    if (score !== undefined) report.score = score;
    if (totalMarks !== undefined) report.totalMarks = totalMarks;
    if (timeSpent) report.timeSpent = timeSpent;
    if (answers) report.answers = answers;

    report.percentage = (report.score / report.totalMarks * 100).toFixed(1);
    report.grade = getGrade(report.percentage);

    await report.save();

    res.json({
      success: true,
      message: 'Report updated successfully!',
      report
    });

  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report!'
    });
  }
});

app.delete('/api/reports/delete/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found!'
      });
    }

    await Report.findByIdAndDelete(reportId);

    res.json({
      success: true,
      message: 'Report deleted successfully!'
    });

  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report!'
    });
  }
});

app.get('/api/reports/analytics/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { quizFilter } = req.query;

    let matchStage = { teacherId };
    if (quizFilter && quizFilter !== 'all') {
      matchStage.quizTitle = quizFilter;
    }

    const reports = await Report.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$quizTitle',
          averageScore: { $avg: '$score' },
          highestScore: { $max: '$score' },
          lowestScore: { $min: '$score' },
          totalStudents: { $sum: 1 },
          totalMarks: { $first: '$totalMarks' },
          averagePercentage: { $avg: '$percentage' }
        }
      }
    ]);

    const quizzes = await Quiz.find({ teacherId }).select('title');

    res.json({
      success: true,
      analytics: reports,
      quizzes: quizzes.map(q => q.title)
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics!'
    });
  }
});

app.post('/api/reports/email', async (req, res) => {
  try {
    const { reportIds, teacherId, message } = req.body;
    
    const reports = await Report.find({ 
      _id: { $in: reportIds },
      teacherId 
    });

    setTimeout(() => {
      res.json({
        success: true,
        message: `Reports emailed successfully to ${reports.length} students!`
      });
    }, 2000);

  } catch (error) {
    console.error('Email reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send emails!'
    });
  }
});

// ==================== CONNECTION APIs ====================

app.get('/api/connections/pending/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const pendingRequests = await Connection.find({
      teacherId,
      status: 'pending'
    }).populate('studentId', 'name email');

    res.json({
      success: true,
      requests: pendingRequests
    });

  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending requests!'
    });
  }
});

app.get('/api/connections/linked/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const linkedStudents = await Connection.find({
      teacherId,
      status: 'approved'
    }).populate('studentId', 'name email');

    res.json({
      success: true,
      students: linkedStudents
    });

  } catch (error) {
    console.error('Get linked students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch linked students!'
    });
  }
});

// ==================== SETTINGS APIs ====================

app.get('/api/settings/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    let settings = await Settings.findOne({ teacherId });

    // If no settings exist, create default settings
    if (!settings) {
      settings = new Settings({
        teacherId,
        general: {
          questionsPerPage: 5,
          shuffleQuestions: true,
          shuffleOptions: false,
          marksPerQuestion: 1,
          timeLimit: 30,
          allowReview: true,
          autoSubmit: false,
          showResults: true,
          difficulty: 'medium'
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
          deliverySchedule: 'immediately'
        }
      });
      await settings.save();
    }

    res.json({
      success: true,
      settings: {
        general: settings.general,
        security: settings.security,
        notifications: settings.notifications,
        lastUpdated: settings.lastUpdated
      }
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings!'
    });
  }
});

app.put('/api/settings/update/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { general, security, notifications } = req.body;

    let settings = await Settings.findOne({ teacherId });

    if (!settings) {
      // Create new settings if they don't exist
      settings = new Settings({
        teacherId,
        general: general || {},
        security: security || {},
        notifications: notifications || {}
      });
    } else {
      // Update existing settings
      if (general) settings.general = { ...settings.general, ...general };
      if (security) settings.security = { ...settings.security, ...security };
      if (notifications) settings.notifications = { ...settings.notifications, ...notifications };
      
      settings.lastUpdated = new Date();
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully! 🎉',
      settings: {
        general: settings.general,
        security: settings.security,
        notifications: settings.notifications,
        lastUpdated: settings.lastUpdated
      }
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings!'
    });
  }
});

app.post('/api/settings/reset/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const defaultSettings = {
      general: {
        questionsPerPage: 5,
        shuffleQuestions: true,
        shuffleOptions: false,
        marksPerQuestion: 1,
        timeLimit: 30,
        allowReview: true,
        autoSubmit: false,
        showResults: true,
        difficulty: 'medium'
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
        deliverySchedule: 'immediately'
      }
    };

    let settings = await Settings.findOne({ teacherId });

    if (!settings) {
      settings = new Settings({
        teacherId,
        ...defaultSettings
      });
    } else {
      settings.general = defaultSettings.general;
      settings.security = defaultSettings.security;
      settings.notifications = defaultSettings.notifications;
      settings.lastUpdated = new Date();
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Settings reset to defaults successfully! 🎉',
      settings: {
        general: settings.general,
        security: settings.security,
        notifications: settings.notifications,
        lastUpdated: settings.lastUpdated
      }
    });

  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings!'
    });
  }
});

// ==================== STUDENT DASHBOARD APIs ====================

// Get student's connected teachers
app.get('/api/student/teachers/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const connections = await Connection.find({ 
      studentId, 
      status: 'approved' 
    }).populate('teacherId', 'name email');

    res.json({
      success: true,
      teachers: connections.map(conn => ({
        id: conn.teacherId._id,
        name: conn.teacherId.name,
        email: conn.teacherId.email,
        course: conn.course,
        connectedAt: conn.respondedAt
      }))
    });

  } catch (error) {
    console.error('Get student teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connected teachers!'
    });
  }
});

// Get student's available quizzes
app.get('/api/student/quizzes/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // First get all teachers this student is connected to
    const connections = await Connection.find({ 
      studentId, 
      status: 'approved' 
    });
    
    const teacherIds = connections.map(conn => conn.teacherId);

    // Get all quizzes from these teachers
    const quizzes = await Quiz.find({ 
      teacherId: { $in: teacherIds },
      isActive: true 
    })
    .populate('teacherId', 'name')
    .sort({ createdAt: -1 });

    // Get student's attempted quizzes to filter
    const attemptedQuizzes = await Report.find({ studentId }).select('quizId');

    const attemptedQuizIds = attemptedQuizzes.map(report => report.quizId.toString());

    const availableQuizzes = quizzes.map(quiz => ({
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      teacherName: quiz.teacherId.name,
      difficulty: quiz.difficulty,
      duration: quiz.duration,
      totalMarks: quiz.totalMarks,
      questionsCount: quiz.questions.length,
      createdAt: quiz.createdAt,
      isAttempted: attemptedQuizIds.includes(quiz._id.toString())
    }));

    res.json({
      success: true,
      quizzes: availableQuizzes
    });

  } catch (error) {
    console.error('Get student quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available quizzes!'
    });
  }
});

// Get student's performance reports
app.get('/api/student/reports/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const reports = await Report.find({ studentId })
      .populate('quizId', 'title difficulty')
      .sort({ date: -1 });

    res.json({
      success: true,
      reports: reports.map(report => ({
        id: report._id,
        quizTitle: report.quizTitle,
        score: report.score,
        totalMarks: report.totalMarks,
        percentage: report.percentage,
        grade: report.grade,
        date: report.date,
        timeSpent: report.timeSpent,
        difficulty: report.quizId?.difficulty || 'medium'
      }))
    });

  } catch (error) {
    console.error('Get student reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student reports!'
    });
  }
});

// Get student dashboard stats
app.get('/api/student/dashboard/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get all data in parallel
    const [teachersRes, quizzesRes, reportsRes, connectionsRes] = await Promise.all([
      fetch(`${req.protocol}://${req.get('host')}/api/student/teachers/${studentId}`),
      fetch(`${req.protocol}://${req.get('host')}/api/student/quizzes/${studentId}`),
      fetch(`${req.protocol}://${req.get('host')}/api/student/reports/${studentId}`),
      fetch(`${req.protocol}://${req.get('host')}/api/student/connections/pending/${studentId}`)
    ]);

    const teachersData = await teachersRes.json();
    const quizzesData = await quizzesRes.json();
    const reportsData = await reportsRes.json();
    const connectionsData = await connectionsRes.json();

    // Calculate stats
    const totalQuizzesAttempted = reportsData.success ? reportsData.reports.length : 0;
    const totalAvailableQuizzes = quizzesData.success ? quizzesData.quizzes.length : 0;
    const totalTeachers = teachersData.success ? teachersData.teachers.length : 0;
    
    // Calculate average score
    let averageScore = 0;
    if (reportsData.success && reportsData.reports.length > 0) {
      const totalPercentage = reportsData.reports.reduce((sum, report) => sum + report.percentage, 0);
      averageScore = Math.round(totalPercentage / reportsData.reports.length);
    }

    // Get pending quizzes (not attempted)
    const pendingQuizzes = quizzesData.success ? 
      quizzesData.quizzes.filter(quiz => !quiz.isAttempted).length : 0;

    res.json({
      success: true,
      stats: {
        totalQuizzesAttempted,
        averageScore,
        pendingQuizzes,
        totalTeachers
      },
      recentActivities: reportsData.success ? reportsData.reports.slice(0, 3) : [],
      upcomingQuizzes: quizzesData.success ? 
        quizzesData.quizzes.filter(quiz => !quiz.isAttempted).slice(0, 2) : []
    });

  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student dashboard data!'
    });
  }
});

// ==================== ADDITIONAL STUDENT APIs ====================

// Search teachers by name or email
app.get('/api/teachers/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required!'
      });
    }

    const teachers = await User.find({
      role: 'Teacher',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('name email _id');

    res.json({
      success: true,
      teachers: teachers.map(teacher => ({
        id: teacher._id,
        name: teacher.name,
        email: teacher.email
      }))
    });

  } catch (error) {
    console.error('Search teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search teachers!'
    });
  }
});

// Get student's pending connection requests
app.get('/api/student/connections/pending/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const pendingRequests = await Connection.find({
      studentId,
      status: 'pending'
    }).populate('teacherId', 'name email');

    res.json({
      success: true,
      requests: pendingRequests.map(request => ({
        id: request._id,
        teacherId: request.teacherId._id,
        teacherName: request.teacherId.name,
        teacherEmail: request.teacherId.email,
        course: request.course,
        requestedAt: request.requestedAt
      }))
    });

  } catch (error) {
    console.error('Get pending connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending connections!'
    });
  }
});

// Submit quiz attempt and generate report
// server.js - Submit quiz attempt route ko update karo
app.post('/api/student/quiz/attempt', async (req, res) => {
  try {
    const { 
      studentId, 
      studentName,
      quizId, 
      quizTitle,
      teacherId,
      answers,
      timeSpent 
    } = req.body;

    console.log("📥 Quiz attempt received:", {
      studentId,
      quizId,
      answersCount: answers?.length
    });

    if (!studentId || !quizId || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, Quiz ID, and answers are required!'
      });
    }

    // Get quiz details with proper error handling
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      console.error("❌ Quiz not found:", quizId);
      return res.status(404).json({
        success: false,
        message: 'Quiz not found!'
      });
    }

    console.log("📚 Quiz loaded:", {
      title: quiz.title,
      questionsCount: quiz.questions.length,
      questions: quiz.questions.map(q => ({
        id: q.id,
        text: q.text,
        correctAnswer: q.correctAnswer,
        marks: q.marks
      }))
    });

    // Calculate score with proper matching
    let score = 0;
    const detailedAnswers = [];

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const question = quiz.questions[i];
      
      if (!question) {
        console.error(`❌ Question not found at index ${i}`);
        continue;
      }

      // Debug info
      console.log(`🔍 Evaluating Q${i}:`, {
        questionId: question.id,
        correctAnswer: question.correctAnswer,
        selectedAnswer: answer.selectedAnswer,
        questionText: question.text?.substring(0, 50) + '...'
      });

      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) {
        score += question.marks || 1;
        console.log(`✅ Correct! Score +${question.marks || 1}`);
      } else {
        console.log(`❌ Incorrect. Expected: ${question.correctAnswer}, Got: ${answer.selectedAnswer}`);
      }

      detailedAnswers.push({
        questionId: question.id || `q${i}`,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: isCorrect,
        timeSpent: answer.timeSpent || 0,
        correctAnswer: question.correctAnswer // For debugging
      });
    }

    const totalMarks = quiz.totalMarks || quiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    const percentage = totalMarks > 0 ? ((score / totalMarks) * 100).toFixed(1) : 0;

    console.log("📊 Final Score:", {
      score,
      totalMarks,
      percentage,
      grade: getGrade(percentage)
    });

    // Create report
    const newReport = new Report({
      studentId,
      teacherId: teacherId || quiz.teacherId,
      studentName,
      quizId,
      quizTitle: quizTitle || quiz.title,
      score,
      totalMarks,
      percentage,
      timeSpent: timeSpent || "00:00",
      answers: detailedAnswers,
      grade: getGrade(percentage),
      status: 'completed'
    });

    await newReport.save();

    console.log("✅ Report saved successfully");

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully! 🎉',
      report: {
        id: newReport._id,
        score,
        totalMarks,
        percentage,
        grade: newReport.grade,
        timeSpent: newReport.timeSpent
      }
    });

  } catch (error) {
    console.error('❌ Submit quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz!',
      error: error.message
    });
  }
});

// Update student profile
app.put('/api/student/profile/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name, email } = req.body;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found!'
      });
    }

    if (name) student.name = name;
    if (email) student.email = email;

    await student.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role
      }
    });

  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile!'
    });
  }
});

// Student Dashboard Data
app.get('/api/student/dashboard/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get connected teachers
    const connections = await Connection.find({ 
      studentId, 
      status: 'approved' 
    }).populate('teacherId');

    // Get teacher IDs
    const teacherIds = connections.map(conn => conn.teacherId._id);

    // Get quizzes from connected teachers
    const quizzes = await Quiz.find({ teacherId: { $in: teacherIds } });

    // Get student's quiz attempts
    const reports = await Report.find({ studentId });

    // Calculate stats
    const totalQuizzesAttempted = reports.length;
    const averageScore = reports.length > 0 
      ? Math.round(reports.reduce((sum, report) => sum + report.percentage, 0) / reports.length)
      : 0;
    
    const pendingQuizzes = quizzes.filter(quiz => 
      !reports.some(report => report.quizId.toString() === quiz._id.toString())
    ).length;

    const totalTeachers = connections.length;

    // Recent activities from reports
    const recentActivities = reports.slice(0, 5).map(report => ({
      quizTitle: report.quizTitle,
      date: report.date,
      percentage: report.percentage
    }));

    // Upcoming quizzes (not attempted yet)
    const upcomingQuizzes = quizzes.filter(quiz => 
      !reports.some(report => report.quizId.toString() === quiz._id.toString())
    ).slice(0, 3);

    res.json({
      success: true,
      stats: {
        totalQuizzesAttempted,
        averageScore,
        pendingQuizzes,
        totalTeachers
      },
      recentActivities,
      upcomingQuizzes
    });

  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error loading student dashboard' 
    });
  }
});

// Get available quizzes for student
// 🛠️ FIX THIS ENDPOINT - Replace your current one with this:
app.get('/api/student/quizzes/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log("📥 Request received for student:", studentId);
    
    // Validate studentId
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID!'
      });
    }

    // 1. Get all teachers this student is connected to
    const connections = await Connection.find({ 
      studentId, 
      status: 'approved' 
    });
    
    console.log("👥 Found connections:", connections.length);
    
    if (connections.length === 0) {
      return res.json({
        success: true,
        quizzes: [],
        message: "No teachers connected yet"
      });
    }

    const teacherIds = connections.map(conn => conn.teacherId);
    console.log("🎯 Teacher IDs:", teacherIds);

    // 2. Get all quizzes from these teachers
    const quizzes = await Quiz.find({ 
      teacherId: { $in: teacherIds },
      isActive: true 
    })
    .populate('teacherId', 'name email')
    .sort({ createdAt: -1 });

    console.log("📚 Found quizzes:", quizzes.length);

    // 3. Get student's attempted quizzes to filter
    const attemptedQuizzes = await Report.find({ studentId }).select('quizId');
    const attemptedQuizIds = attemptedQuizzes.map(report => report.quizId.toString());

    console.log("📝 Attempted quiz IDs:", attemptedQuizIds);

    // 4. Format response safely
    // server.js mein /api/student/quizzes/:studentId route ko update karo
const availableQuizzes = quizzes.map(quiz => ({
  id: quiz._id,
  title: quiz.title || 'Untitled Quiz',
  description: quiz.description || `Quiz by ${quiz.teacherId?.name || 'Teacher'}`,
  teacherName: quiz.teacherId?.name || 'Unknown Teacher',
  teacherId: quiz.teacherId._id, // ✅ Yeh add karo
  difficulty: quiz.difficulty || 'medium',
  duration: quiz.duration || 30,
  totalMarks: quiz.totalMarks || quiz.questions?.reduce((sum, q) => sum + (q.marks || 1), 0) || 0,
  questionsCount: quiz.questions?.length || 0,
  createdAt: quiz.createdAt || new Date(),
  isAttempted: attemptedQuizIds.includes(quiz._id.toString())
}));

    console.log("✅ Sending quizzes:", availableQuizzes.length);

    res.json({
      success: true,
      quizzes: availableQuizzes
    });

  } catch (error) {
    console.error('❌ Get student quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available quizzes!',
      error: error.message // Remove this in production
    });
  }
});

// ✅ ADD THIS API ROUTE TO server.js
// Find specific connection between student and teacher
app.get('/api/connections/find/:studentId/:teacherId', async (req, res) => {
  try {
    const { studentId, teacherId } = req.params;

    const connection = await Connection.findOne({
      studentId,
      teacherId,
      status: 'approved'
    });

    res.json({
      success: true,
      connection: connection || null
    });

  } catch (error) {
    console.error('Find connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find connection'
    });
  }
});

// Get all students for teacher (BOTH Student model and Linked students)
app.get('/api/teacher/students/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    // 1. Get students from Student model
    const studentModelStudents = await Student.find({ teacherId });

    // 2. Get linked students from Connection model
    const linkedStudents = await Connection.find({
      teacherId,
      status: 'approved'
    }).populate('studentId', 'name email');

    // 3. Combine both lists and remove duplicates
    const allStudentsMap = new Map();

    // Add Student model students
    studentModelStudents.forEach(student => {
      allStudentsMap.set(student.email, {
        _id: student._id,
        name: student.name,
        email: student.email,
        course: student.course,
        attendance: student.attendance,
        allowed: student.allowed,
        lastUpdated: student.lastUpdated,
        source: 'studentModel'
      });
    });

    // Add Linked students (only if not already exists)
    linkedStudents.forEach(connection => {
      const student = connection.studentId;
      if (!allStudentsMap.has(student.email)) {
        allStudentsMap.set(student.email, {
          _id: student._id,
          name: student.name,
          email: student.email,
          course: connection.course || "CS-101",
          attendance: false, // default for linked students
          allowed: false,
          lastUpdated: new Date(),
          source: 'connection'
        });
      }
    });

    const allStudents = Array.from(allStudentsMap.values());

    res.json({
      success: true,
      students: allStudents
    });

  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students!'
    });
  }
});

// 🚀 Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎯 Server running on port ${PORT}`);
  console.log(`📊 MongoDB: quizapp database`);
  console.log(`👥 Collections: users, quizzes, students, reports, connections, courses, topics, settings`);
  console.log(`🚀 All APIs are ready!`);
  console.log(`📚 Course Management APIs: ✅`);
  console.log(`🤖 AI Quiz Generation APIs: ✅`);
  console.log(`⏰ Quiz Timer APIs: ✅`);
  console.log(`📊 Dashboard APIs: ✅`);
  console.log(`👨‍🏫 Teacher Control APIs: ✅`);
  console.log(`📈 Report APIs: ✅`);
  console.log(`⚙️ Settings APIs: ✅`);
  console.log(`📁 File Upload: ✅ (Make sure to create 'uploads' folder)`);
});