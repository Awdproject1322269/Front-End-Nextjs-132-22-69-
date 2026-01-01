'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [testiIndex, setTestiIndex] = useState(0);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const router = useRouter();

  const testimonials = [
    {
      name: "Ayesha Khan",
      role: "Student",
      text: "QuizQuest-3 helped me improve my exam scores — quizzes are clear and the dashboard tracks progress perfectly.",
      avatar: "https://i.pravatar.cc/100?img=32",
    },
    {
      name: "Dr. Salman",
      role: "Teacher",
      text: "Creating quizzes from topics is quick and easy. Attendance-based access helped manage my class efficiently.",
      avatar: "https://i.pravatar.cc/100?img=12",
    },
    {
      name: "Ali Raza",
      role: "Student",
      text: "Love the reports and performance charts — they helped me focus on weak topics and improve fast.",
      avatar: "https://i.pravatar.cc/100?img=5",
    },
  ];

  const faqs = [
    {
      q: "Who can use QuizQuest-3?",
      a: "Both teachers and students. Teachers create and manage quizzes, while students participate and review their reports.",
    },
    {
      q: "Can teachers upload files to create questions?",
      a: "Yes — teachers can upload files (PDF/DOC/PPT) and the system will assist in generating quiz questions from the content (simulated in this frontend prototype).",
    },
    {
      q: "How are quiz settings controlled?",
      a: "Teachers can set number of questions per page, marks per question, shuffle options, and allow/disallow students for individual quizzes.",
    },
    {
      q: "Is there a reporting feature?",
      a: "Yes — teachers can view and download detailed quiz reports showing student performance and analytics.",
    },
  ];

  const nextTestimonial = () => setTestiIndex((t) => (t + 1) % testimonials.length);
  const prevTestimonial = () => setTestiIndex((t) => (t - 1 + testimonials.length) % testimonials.length);

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const handleTeacherFeatureClick = (featureLink: string) => {
    localStorage.setItem('redirectAfterLogin', featureLink);
    router.push('/login');
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Welcome to QuizQuest-3
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Transform learning with our intelligent quiz platform — create engaging assessments, 
            track progress, and unlock insights for teachers and students.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/registration"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium"
            >
              Get Started Free
            </Link>
            <Link
              href="/about"
              className="border-2 border-indigo-200 text-indigo-700 px-8 py-4 rounded-xl hover:bg-indigo-50 transition-all duration-300 font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { number: "120+", label: "Quizzes Created" },
            { number: "2,300+", label: "Students Registered" },
            { number: "85%", label: "Average Score" },
            { number: "98%", label: "Uptime (UI Prototype)" },
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center border border-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {stat.number}
              </h3>
              <p className="text-gray-600 mt-2 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to create, manage, and analyze quizzes effectively
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
              title: "Registration",
              description: "Sign up as a Teacher or Student and start your learning journey instantly.",
              link: "/registration",
              public: true
            },
            {
              icon: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png",
              title: "Dashboard",
              description: "Personalized dashboards for teachers and students to manage profiles and quizzes.",
              link: "/dashboard",
              public: true
            },
            {
              icon: "https://cdn-icons-png.flaticon.com/512/1087/1087927.png",
              title: "Quiz Creation",
              description: "Teachers can create, edit, and publish quizzes effortlessly using AI-powered tools.",
              link: "/quizcreation",
              teacherOnly: true
            },
            {
              icon: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
              title: "Teacher Control",
              description: "Allow or disallow specific quizzes, control student access, and manage participation.",
              link: "/teacher-control",
              teacherOnly: true
            },
            {
              icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
              title: "Reports",
              description: "Generate detailed reports on student performance, quiz statistics, and improvement areas.",
              link: "/report",
              teacherOnly: true
            },
            {
              icon: "https://cdn-icons-png.flaticon.com/512/3524/3524659.png",
              title: "Settings",
              description: "Adjust quiz settings — shuffle questions, marks, and page layout to suit your needs.",
              link: "/settings",
              teacherOnly: true
            },
          ].map((feature, index) => (
            <div
              key={index}
              className={`group bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                feature.teacherOnly ? 'relative' : ''
              }`}
            >
              {/* Teacher Only Badge */}
              {feature.teacherOnly && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  Teacher Only
                </div>
              )}
              
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img src={feature.icon} alt={feature.title} className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">{feature.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Teacher Only Services */}
              {feature.teacherOnly ? (
                <button
                  onClick={() => handleTeacherFeatureClick(feature.link)}
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold group-hover:translate-x-1 transition-transform duration-300"
                >
                  Login to Access <span className="ml-2">→</span>
                </button>
              ) : (
                <Link
                  href={feature.link}
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold group-hover:translate-x-1 transition-transform duration-300"
                >
                  Get Started <span className="ml-2">→</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to transform your teaching and learning experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-indigo-300 to-purple-300"></div>
            
            {[
              { step: "1", title: "Register", description: "Create teacher or student account in a minute." },
              { step: "2", title: "Create / Join", description: "Teachers create quizzes; students join via dashboard." },
              { step: "3", title: "Analyze", description: "View instant reports and export them for records." },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Popular Courses</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of courses and start your learning journey today
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Data Structures", topics: 12, level: "Intermediate" },
            { title: "Discrete Mathematics", topics: 8, level: "Advanced" },
            { title: "Operating Systems", topics: 10, level: "Intermediate" },
            { title: "Computer Networks", topics: 7, level: "Beginner" },
            { title: "Software Engineering", topics: 9, level: "Intermediate" },
            { title: "Database Systems", topics: 11, level: "Advanced" },
          ].map((course, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors duration-300">
                {course.title}
              </h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">{course.topics} topics</span>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                  course.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {course.level}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <Link 
                  href="/registration" 
                  className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center group-hover:translate-x-1 transition-transform duration-300"
                >
                  Join Course <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied teachers and students
            </p>
          </div>

          <div className="relative bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            {/* Navigation Buttons */}
            <button 
              onClick={prevTestimonial}
              className="hidden md:flex absolute -left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 items-center justify-center hover:scale-110 transition-all duration-300"
            >
              ‹
            </button>
            <button 
              onClick={nextTestimonial}
              className="hidden md:flex absolute -right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 items-center justify-center hover:scale-110 transition-all duration-300"
            >
              ›
            </button>

            {/* Testimonial Content */}
            <div className="flex flex-col lg:flex-row items-center gap-8 px-4 md:px-8">
              <div className="flex-1 text-center lg:text-left">
                <div className="w-24 h-24 mx-auto lg:mx-0 mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-1 shadow-lg">
                  <img 
                    src={testimonials[testiIndex].avatar} 
                    alt="avatar" 
                    className="w-full h-full rounded-full object-cover" 
                  />
                </div>
                <p className="text-xl text-gray-700 italic mb-6 leading-relaxed">
                  "{testimonials[testiIndex].text}"
                </p>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">{testimonials[testiIndex].name}</p>
                  <p className="text-gray-500">{testimonials[testiIndex].role}</p>
                </div>
              </div>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setTestiIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === testiIndex 
                      ? 'bg-indigo-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about QuizQuest-3
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left px-8 py-6 flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="text-lg font-semibold text-gray-800 pr-4">{faq.q}</span>
                <span className={`text-indigo-600 text-2xl transition-transform duration-300 ${
                  activeFAQ === index ? 'rotate-180' : ''
                }`}>
                  ⌄
                </span>
              </button>
              <div
                className={`px-8 overflow-hidden transition-all duration-300 ${
                  activeFAQ === index ? 'max-h-96 pb-6' : 'max-h-0'
                }`}
              >
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white p-12 text-center shadow-2xl relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-6">Ready to Transform Learning?</h3>
            <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of educators and students using QuizQuest-3 to create engaging learning experiences.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/registration" 
                className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Start Free Today
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}