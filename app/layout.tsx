import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link"; // Add this import
import "./globals.css";
import Navbar from "./Navbar";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "QuizQuest-3",
    template: "%s | QuizQuest-3"
  },
  description: "Advanced quiz management system for modern education. Create, manage, and attempt quizzes with real-time analytics.",
  keywords: ["quiz", "education", "learning", "assessment", "teachers", "students"],
  authors: [
    { name: "Muhammad Abdullah" },
    { name: "Hassan Shah" },
    { name: "Farhan Butt" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen`}>
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-indigo-600 text-white px-4 py-2 rounded-lg z-50"
        >
          Skip to main content
        </a>
        
        {/* Navbar */}
        <Navbar/>
        
        {/* Main content with accessible ID */}
        <main id="main-content" className="min-h-screen pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-gradient-to-r from-gray-900 to-indigo-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h4 className="font-bold text-2xl mb-4 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                QuizQuest-3
              </h4>
              <p className="text-gray-300 max-w-md leading-relaxed">
                Designed for teachers and students to make assessment easy, meaningful, and engaging. 
                Transform your educational experience with our intelligent platform.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {['Home', 'About', 'Dashboard', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link 
                      href={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`} 
                      className="text-gray-300 hover:text-white transition-colors duration-200 hover:underline"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Contact Info</h4>
              <div className="space-y-3 text-gray-300">
                <p>
                  <a
                    href="mailto:muhammadabdullah495969@gmail.com"
                    className="hover:text-white transition-colors duration-200 hover:underline"
                  >
                    muhammadabdullah495969@gmail.com
                  </a>
                </p>
                <p>+92 322 9684562</p>
                <p>University of Gujrat, Pakistan</p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 text-center mt-12 pt-8 border-t border-gray-700">
            <p className="text-gray-400">
              © 2025 QuizQuest-3 | Designed by Muhammad Abdullah, Hassan Shah & Farhan Butt
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}