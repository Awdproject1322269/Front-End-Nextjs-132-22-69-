'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Link from "next/link";

// Define form data interface
interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactMethod {
  icon: string;
  title: string;
  description: string;
  value: string;
  link: string;
  color: string;
}

interface FAQ {
  question: string;
  answer: string;
}

function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    alert("🎉 Your message has been sent successfully! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactMethods: ContactMethod[] = [
    {
      icon: "📧",
      title: "Email Us",
      description: "Send us an email anytime",
      value: "muhammadabdullah495969@gmail.com",
      link: "mailto:muhammadabdullah495969@gmail.com",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "📞",
      title: "Call Us",
      description: "Mon to Fri, 9AM - 5PM",
      value: "+92 322 9684562",
      link: "tel:+923229684562",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: "📍",
      title: "Visit Us",
      description: "Come say hello at our office",
      value: "University of Gujrat, Pakistan",
      link: "https://maps.google.com",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "💬",
      title: "Live Chat",
      description: "Instant support",
      value: "Start Chat",
      link: "#chat",
      color: "from-orange-500 to-red-500"
    }
  ];

  const faqs: FAQ[] = [
    {
      question: "How quickly do you respond to messages?",
      answer: "We typically respond within 24 hours during business days."
    },
    {
      question: "Do you offer technical support?",
      answer: "Yes, we provide comprehensive technical support for all QuizQuest-3 users."
    },
    {
      question: "Can I schedule a demo?",
      answer: "Absolutely! Contact us to schedule a personalized demo of our platform."
    },
    {
      question: "Are you available for custom development?",
      answer: "Yes, we offer custom development services for educational institutions."
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Have questions, suggestions, or feedback? We'd love to hear from you! 
            Reach out using the form below or contact us directly.
          </p>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="max-w-6xl mx-auto px-6 mb-16 mt-22">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.link}
              className="group block"
            >
              <div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center h-full flex flex-col"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${method.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                  <span className="text-2xl">{method.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                  {method.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 flex-grow">{method.description}</p>
                <p className="text-gray-800 font-medium group-hover:text-indigo-700 transition-colors duration-300 break-words text-sm leading-tight">
                  {method.value}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/60">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Let's Start a Conversation</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Whether you're a teacher looking to enhance your classroom experience 
                or a student seeking better learning tools, we're here to help you 
                get the most out of QuizQuest-3.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🕒</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Response Time</h4>
                    <p className="text-gray-600">We typically reply within 2-4 hours during business days</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Global Support</h4>
                    <p className="text-gray-600">Supporting educators and students worldwide</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Expert Advice</h4>
                    <p className="text-gray-600">Get insights from educational technology experts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/60">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h4 className="font-semibold text-gray-800 mb-2">{faq.question}</h4>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/60">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Send Us a Message</h2>
            <p className="text-gray-600 mb-8">Fill out the form below and we'll get back to you soon.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  placeholder="What's this regarding?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Message *
                </label>
                <textarea
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                  isSubmitting 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending Message...
                  </div>
                ) : (
                  "Send Message"
                )}
              </button>
              
              <p className="text-center text-gray-500 text-sm">
                We'll get back to you within 24 hours
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Map & Location Section */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/60">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Our Location</h2>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">University of Gujrat</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Located in the heart of Punjab, Pakistan, our team is based at the 
                University of Gujrat where we're constantly working to improve 
                educational technology for students and teachers worldwide.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📍</span>
                  </div>
                  <span className="text-gray-700">Gujrat, Punjab, Pakistan</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🕒</span>
                  </div>
                  <span className="text-gray-700">Monday - Friday: 9:00 AM - 5:00 PM</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">🗺️</div>
                <p className="text-gray-600 font-medium">Interactive Map</p>
                <p className="text-gray-500 text-sm">(Map integration available)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 mb-20 text-center">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of educators and students using QuizQuest-3 to create engaging learning experiences.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/registration"
                className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Start Free Today
              </Link>
              <Link
                href="/about"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Contact;