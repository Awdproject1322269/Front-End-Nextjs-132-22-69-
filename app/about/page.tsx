'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import teamPhoto1 from "../assets/abd.jpg";
import teamPhoto2 from "../assets/Butt.jpg";
import teamPhoto3 from "../assets/Shah.jpg";

function About() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      title: "Smart Quiz Generation",
      desc: "Teachers can easily create quizzes manually or generate them automatically using uploaded materials.",
      icon: "https://cdn-icons-png.flaticon.com/512/2554/2554831.png",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Performance Insights",
      desc: "Get instant analytics and reports that track student progress and class performance.",
      icon: "https://cdn-icons-png.flaticon.com/512/992/992700.png",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Real-Time Accessibility",
      desc: "Students can participate in quizzes from any device, anytime, with live updates and results.",
      icon: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png",
      gradient: "from-green-500 to-teal-500"
    },
    {
      title: "Secure & Reliable",
      desc: "Built with modern security standards ensuring safe data handling and privacy for all users.",
      icon: "https://cdn-icons-png.flaticon.com/512/3064/3064197.png",
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "User-Friendly Interface",
      desc: "An intuitive, clean, and responsive UI designed with Tailwind CSS for the best user experience.",
      icon: "https://cdn-icons-png.flaticon.com/512/1828/1828970.png",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      title: "Cloud-Based Platform",
      desc: "Your data and quizzes are accessible anywhere with real-time synchronization and backups.",
      icon: "https://cdn-icons-png.flaticon.com/512/4144/4144723.png",
      gradient: "from-yellow-500 to-orange-500"
    },
  ];

  const teamMembers = [
    {
      photo: teamPhoto1,
      name: "Muhammad Abdullah",
      role: "Frontend Developer",
      desc: "Builds responsive and visually appealing React interfaces using Tailwind CSS and Vite.",
      skills: ["React", "Tailwind", "JavaScript", "UI/UX"]
    },
    {
      photo: teamPhoto2,
      name: "Farhan Butt",
      role: "Backend & Database Engineer",
      desc: "Manages data handling, logic, and APIs ensuring secure performance of QuizQuest-3.",
      skills: ["Node.js", "MongoDB", "Express", "API Design"]
    },
    {
      photo: teamPhoto3,
      name: "Hassan Shah",
      role: "UI/UX Designer",
      desc: "Designs intuitive user experiences and maintains a consistent, modern visual identity.",
      skills: ["Figma", "UI Design", "UX Research", "Prototyping"]
    },
  ];

  const techStack = [
    { name: "React.js", category: "Frontend" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "Vite", category: "Build Tool" },
    { name: "Node.js", category: "Backend" },
    { name: "Express", category: "Backend" },
    { name: "MongoDB", category: "Database" },
    { name: "JavaScript", category: "Language" },
    { name: "Git", category: "Version Control" },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            About QuizQuest-3
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing digital learning with an intelligent quiz platform that makes 
            education interactive, engaging, and accessible for everyone.
          </p>
        </div>
      </section>

      {/* Mission Vision Story Grid */}
      <section className="max-w-6xl mx-auto px-6 mb-20 mt-22">
        <div className="grid lg:grid-cols-3 gap-8">
          {[
            {
              title: "Our Story",
              content: "QuizQuest-3 was born from a simple observation — educators needed a smooth, efficient way to create, conduct, and analyze quizzes without complex tools. What started as a small academic project evolved into a full-featured platform that empowers both teachers and students.",
              icon: "📖",
              delay: "100"
            },
            {
              title: "Our Vision",
              content: "We envision a world where learning is fun, accessible, and driven by curiosity. QuizQuest-3 aims to bridge the gap between education and technology by providing interactive, data-driven tools that encourage active learning.",
              icon: "🎯",
              delay: "200"
            },
            {
              title: "Our Mission",
              content: "Our mission is to enhance digital learning by empowering teachers to create interactive quizzes effortlessly while offering students a smooth, engaging platform to test and improve their knowledge.",
              icon: "🚀",
              delay: "300"
            },
          ].map((item, index) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/60 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group"
              style={{ transitionDelay: `${item.delay}ms` }}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose QuizQuest-3?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the features that make our platform stand out in digital education
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/60 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <Image 
                  src={feature.icon} 
                  alt={feature.title} 
                  width={32}
                  height={32}
                  className="filter brightness-0 invert" 
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 group-hover:text-indigo-600 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 border border-white/60 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Technology Stack</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Built with modern technologies to ensure speed, reliability, and scalability
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {techStack.map((tech, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {tech.category === 'Frontend' && '⚛️'}
                  {tech.category === 'Styling' && '🎨'}
                  {tech.category === 'Build Tool' && '🔧'}
                  {tech.category === 'Backend' && '⚙️'}
                  {tech.category === 'Database' && '🗄️'}
                  {tech.category === 'Language' && '💻'}
                  {tech.category === 'Version Control' && '📚'}
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">{tech.name}</h4>
                <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">
                  {tech.category}
                </span>
              </div>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Architecture Overview</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our full-stack application follows modern development practices with a React frontend, 
              Node.js backend, and MongoDB database, ensuring optimal performance and user experience.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The passionate developers behind QuizQuest-3
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center border border-white/60 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-1 group-hover:scale-110 transition-transform duration-300">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    width={128}
                    height={128}
                    className="w-full h-full rounded-full object-cover border-4 border-white"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  {member.role}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors duration-300">
                {member.name}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {member.desc}
              </p>
              
              <div className="flex flex-wrap justify-center gap-2">
                {member.skills.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Future Goals */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white p-12 text-center shadow-2xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-6">Future Roadmap</h2>
            <p className="text-indigo-100 text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              Our journey continues with exciting upcoming features including AI-driven quiz generation, 
              voice-based assessments, gamified learning modules, and mobile applications to make 
              QuizQuest-3 even more innovative and accessible for global learners.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["AI Integration", "Mobile App", "Gamification", "Voice Assessment", "Advanced Analytics"].map((feature, index) => (
                <span key={index} className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-medium">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 mb-20 text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 border border-white/60">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Transform Learning?</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of educators and students already using QuizQuest-3 to create engaging learning experiences.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/registration"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default About;