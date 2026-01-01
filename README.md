
🤝 Development Team 🧑‍💻 Developers

Names:
Farhan Butt, Abdullah Gujjar, Hassan Shah

GitHub Repository:
Awdproject1322269

Email:
awdproject123@gmail.com

🎯 QuizQuest-3 — Quiz #2 Update (Next.js Version)

QuizQuest-3 is a modern, role-based quiz application built using Next.js (App Router) and Node.js.
Quiz #2 focuses on complete CRUD operations and fully functional Teacher & Student Dashboards with full MongoDB database integration.

✨ Quiz #2 – Update Overview

In this update, all modules are fully completed and connected with the database.

👨‍🏫 Teacher Dashboard (Fully Completed)

✔️ Quiz Creation (CRUD)
✔️ Manage Students (CRUD)
✔️ Manage Courses (CRUD)
✔️ Reports & Analytics
✔️ Teacher Settings Page
✔️ Detailed Quiz Reports
✔️ Teacher Control Panel

👨‍🎓 Student Dashboard (New & Fully Completed)
Student Dashboard Features

✔️ My Teachers — View assigned teachers
✔️ Available Quizzes — View quizzes ready to attempt
✔️ My Reports — View performance reports
✔️ Search Teachers — Search teachers by name
✔️ Quiz History — View attempted quizzes
✔️ Settings — Update profile & preferences

CRUD for Students

✔️ Update student profile
✔️ View & delete quiz attempt history
✔️ Store quiz scores & reports

📚 Database Integration (MongoDB)

MongoDB with Mongoose is used across the entire project.
All CRUD operations, authentication, dashboards, and reports are fully database-driven.

✔️ Teacher Dashboard – Database Usage

✔️ Quizzes stored & updated
✔️ Students saved & managed
✔️ Courses created, updated & deleted
✔️ Reports generated from quiz attempts
✔️ Teacher settings saved in user document

✔️ Student Dashboard – Database Usage

✔️ Profile saved & updated
✔️ Quiz attempts stored
✔️ Quiz history fetched from database
✔️ Available quizzes loaded dynamically
✔️ Reports generated from attempts
✔️ Teacher list & search connected to DB

✔️ MongoDB Collections Used

users

quizzes

courses

attempts

reports

🚀 Live Demo (Local Development)

Frontend (Next.js):
http://localhost:3000

Backend API:
http://localhost:5000

🛠️ Tech Stack
Frontend (Next.js)

Next.js (App Router)

React.js

Next Navigation

Tailwind CSS

Axios

Server & Client Components

Backend

Node.js

Express.js

MongoDB

Mongoose

bcryptjs

CORS

📦 Installation & Setup
1️⃣ Frontend Setup (Next.js)
cd reactproject/quizproject-nextjs
npm install
npm run dev


Runs on:
👉 http://localhost:3000

2️⃣ Backend Setup
cd reactproject/backend
npm install
npm run dev


Runs on:
👉 http://localhost:5000

3️⃣ Database Setup

Open MongoDB Compass

Connect to:

mongodb://localhost:27017


Database quizapp is auto-created

Auto-Generated Collections

users

quizzes

courses

attempts

reports

⚙️ Environment Variables

Create a file:
backend/.env

PORT=5000
MONGODB_URI=mongodb://localhost:27017/quizapp

📊 API Endpoints (CRUD Completed)
Authentication

POST /api/register

POST /api/login

👨‍🏫 Teacher CRUD
Quizzes

POST /api/quizzes

GET /api/quizzes

PUT /api/quizzes/:id

DELETE /api/quizzes/:id

Students

POST /api/students

PUT /api/students/:id

DELETE /api/students/:id

Courses

POST /api/courses

GET /api/courses

PUT /api/courses/:id

DELETE /api/courses/:id

👨‍🎓 Student CRUD
Quiz Attempts

GET /api/quiz-attempts

POST /api/quiz-attempt

DELETE /api/quiz-attempt/:id

Settings / Profile

PUT /api/student/profile

Test API

GET /api — Check backend status

🎨 UI / UX Enhancements

✔️ Complete dashboards
✔️ CRUD forms for all modules
✔️ Glassmorphism design
✔️ Smooth animations
✔️ Tables for quizzes, students, courses & history
✔️ Success & error notifications
✔️ Auto scroll to top
✔️ Loading states everywhere
✔️ Search filters for teachers

🔒 Security Features

✔️ Role-based authentication
✔️ Protected routes (Next.js Middleware + Backend)
✔️ Auto logout after 30 minutes
✔️ Password hashing using bcryptjs
✔️ Session persistence using localStorage
✔️ Input validation

📈 Performance Features

✔️ Optimized dashboard rendering
✔️ Fast API responses
✔️ Loading indicators
✔️ Error boundaries
✔️ Form validation

🐛 Troubleshooting
❌ Backend Not Responding

Check:

http://localhost:5000/api

❌ MongoDB Not Connecting

Ensure MongoDB Compass is connected to:

localhost:27017

❌ Frontend Errors
rm -rf node_modules package-lock.json
npm install

❌ CRUD Not Working

✔️ Check browser Network tab
✔️ Verify API endpoint
✔️ Ensure backend is running

🙏 Acknowledgments

Next.js Community

React.js Community

Tailwind CSS

MongoDB

Vite

Express.js
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
