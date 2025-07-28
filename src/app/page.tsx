"use client"

import { BookOpen, Clock, MessageSquare, User, Settings } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/lib/hooks/use-user"

export default function HomePage() {
  const { user, profile, isLoading } = useUser()
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 relative overflow-hidden">
      {/* Biology-themed background patterns */}
      <div className="absolute inset-0 opacity-10">
        {/* DNA Helix patterns */}
        <div className="absolute top-10 left-10 w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
            <path d="M20 10 Q50 30 80 10 Q50 50 80 90 Q50 70 20 90 Q50 50 20 10" 
                  stroke="#10b981" strokeWidth="2" fill="none" className="animate-pulse"/>
            <circle cx="20" cy="10" r="3" fill="#059669"/>
            <circle cx="80" cy="10" r="3" fill="#047857"/>
            <circle cx="20" cy="90" r="3" fill="#065f46"/>
            <circle cx="80" cy="90" r="3" fill="#10b981"/>
          </svg>
        </div>
        
        {/* Molecular structure */}
        <div className="absolute top-20 right-20 w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-bounce">
            <circle cx="50" cy="20" r="8" fill="#14b8a6" className="animate-pulse"/>
            <circle cx="20" cy="50" r="6" fill="#0d9488"/>
            <circle cx="80" cy="50" r="6" fill="#0f766e"/>
            <circle cx="50" cy="80" r="8" fill="#134e4a"/>
            <line x1="50" y1="20" x2="20" y2="50" stroke="#059669" strokeWidth="2"/>
            <line x1="50" y1="20" x2="80" y2="50" stroke="#059669" strokeWidth="2"/>
            <line x1="20" y1="50" x2="50" y2="80" stroke="#059669" strokeWidth="2"/>
            <line x1="80" y1="50" x2="50" y2="80" stroke="#059669" strokeWidth="2"/>
          </svg>
        </div>

        {/* Cell structure */}
        <div className="absolute bottom-20 left-20 w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="5,5" className="animate-spin-slow"/>
            <circle cx="50" cy="50" r="25" fill="none" stroke="#059669" strokeWidth="2"/>
            <circle cx="50" cy="50" r="15" fill="#14b8a6" opacity="0.6"/>
            <circle cx="40" cy="40" r="4" fill="#0d9488"/>
            <circle cx="60" cy="35" r="3" fill="#0f766e"/>
            <circle cx="35" cy="60" r="3" fill="#134e4a"/>
            <circle cx="65" cy="65" r="4" fill="#047857"/>
          </svg>
        </div>

        {/* Benzene ring */}
        <div className="absolute bottom-32 right-32 w-20 h-20">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-bounce">
            <polygon points="50,15 85,35 85,65 50,85 15,65 15,35" 
                     fill="none" stroke="#10b981" strokeWidth="3"/>
            <circle cx="50" cy="15" r="4" fill="#059669"/>
            <circle cx="85" cy="35" r="4" fill="#047857"/>
            <circle cx="85" cy="65" r="4" fill="#065f46"/>
            <circle cx="50" cy="85" r="4" fill="#10b981"/>
            <circle cx="15" cy="65" r="4" fill="#14b8a6"/>
            <circle cx="15" cy="35" r="4" fill="#0d9488"/>
          </svg>
        </div>

        {/* Floating biology symbols */}
        <div className="absolute top-1/4 left-1/4 opacity-20 animate-float">
          <span className="text-4xl text-green-600">🧬</span>
        </div>
        <div className="absolute top-1/3 right-1/3 opacity-20 animate-float-delayed">
          <span className="text-3xl text-emerald-600">🔬</span>
        </div>
        <div className="absolute bottom-1/4 left-1/3 opacity-20 animate-float">
          <span className="text-4xl text-teal-600">🧪</span>
        </div>
        <div className="absolute bottom-1/3 right-1/4 opacity-20 animate-float-delayed">
          <span className="text-3xl text-green-700">🦠</span>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header section with biology-themed design */}
        <div className="text-center mb-20 animate-fade-in relative">
          {/* DNA strand decorative element */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-96 h-8 opacity-30">
            <svg viewBox="0 0 400 40" className="w-full h-full">
              <path d="M0 20 Q100 5 200 20 Q300 35 400 20" stroke="#10b981" strokeWidth="3" fill="none" className="animate-pulse"/>
              <path d="M0 20 Q100 35 200 20 Q300 5 400 20" stroke="#059669" strokeWidth="3" fill="none" className="animate-pulse"/>
            </svg>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 animate-slide-down">
            Welcome to Dr Afef Najjari's Biology Course
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed animate-slide-up">
            Explore the fascinating world of biology through interactive learning, discover course materials, 
            and connect with your scientific journey. 🧬
          </p>
          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-expand"></div>
            <div className="text-2xl animate-pulse">⚗️</div>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-expand-delayed"></div>
          </div>
        </div>

        {/* Enhanced cards grid with biology icons */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-sm border-green-200 hover:border-green-400 animate-fade-in-delayed-1 relative overflow-hidden">
            {/* Biology pattern background */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <svg viewBox="0 0 50 50" className="w-full h-full">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#10b981" strokeWidth="2"/>
                <circle cx="25" cy="25" r="12" fill="none" stroke="#059669" strokeWidth="1"/>
                <circle cx="25" cy="25" r="6" fill="#14b8a6"/>
              </svg>
            </div>
            <CardHeader className="text-center pb-4">
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">📚</span>
                </div>
              </div>
              <CardTitle className="text-green-800 text-xl font-bold">Course Chapters</CardTitle>
              <CardDescription className="text-gray-600 mt-2">Access comprehensive biology materials and detailed chapters</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chapters">
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Explore Chapters 🧬
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-sm border-teal-200 hover:border-teal-400 animate-fade-in-delayed-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <svg viewBox="0 0 50 50" className="w-full h-full">
                <polygon points="25,5 45,20 45,35 25,45 5,35 5,20" fill="none" stroke="#0d9488" strokeWidth="2"/>
                <circle cx="25" cy="25" r="8" fill="#14b8a6" opacity="0.5"/>
              </svg>
            </div>
            <CardHeader className="text-center pb-4">
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center group-hover:from-teal-200 group-hover:to-cyan-200 transition-all duration-300">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🕐</span>
                </div>
              </div>
              <CardTitle className="text-teal-800 text-xl font-bold">Office Hours</CardTitle>
              <CardDescription className="text-gray-600 mt-2">Schedule meetings and check professor availability</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/availability">
                <Button variant="outline" className="w-full border-2 border-teal-500 text-teal-700 hover:bg-teal-500 hover:text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                  Check Availability 🔬
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-sm border-emerald-200 hover:border-emerald-400 animate-fade-in-delayed-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <svg viewBox="0 0 50 50" className="w-full h-full">
                <path d="M10 25 Q25 10 40 25 Q25 40 10 25" fill="none" stroke="#059669" strokeWidth="2"/>
                <circle cx="25" cy="25" r="5" fill="#10b981"/>
              </svg>
            </div>
            <CardHeader className="text-center pb-4">
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center group-hover:from-emerald-200 group-hover:to-green-200 transition-all duration-300">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">💬</span>
                </div>
              </div>
              <CardTitle className="text-emerald-800 text-xl font-bold">Feedback</CardTitle>
              <CardDescription className="text-gray-600 mt-2">Share insights and suggestions about your learning experience</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/feedback">
                <Button variant="outline" className="w-full border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-500 hover:text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                  Provide Feedback 🧪
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Conditional card based on authentication */}
          {!isLoading && (
            <>
              {!user ? (
                <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-sm border-orange-200 hover:border-orange-400 animate-fade-in-delayed-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                    <svg viewBox="0 0 50 50" className="w-full h-full">
                      <circle cx="25" cy="15" r="8" fill="none" stroke="#ea580c" strokeWidth="2"/>
                      <path d="M10 35 Q25 25 40 35 L40 45 L10 45 Z" fill="none" stroke="#ea580c" strokeWidth="2"/>
                    </svg>
                  </div>
                  <CardHeader className="text-center pb-4">
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center group-hover:from-orange-200 group-hover:to-amber-200 transition-all duration-300">
                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">👤</span>
                      </div>
                    </div>
                    <CardTitle className="text-orange-800 text-xl font-bold">Sign In</CardTitle>
                    <CardDescription className="text-gray-600 mt-2">Access your student portal and track progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/auth">
                      <Button variant="secondary" className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        Sign In / Sign Up 🦠
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : profile?.role === 'admin' ? (
                <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-sm border-blue-200 hover:border-blue-400 animate-fade-in-delayed-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                    <svg viewBox="0 0 50 50" className="w-full h-full">
                      <circle cx="25" cy="25" r="20" fill="none" stroke="#2563eb" strokeWidth="2"/>
                      <circle cx="25" cy="25" r="3" fill="#2563eb"/>
                      <line x1="25" y1="15" x2="25" y2="35" stroke="#2563eb" strokeWidth="2"/>
                      <line x1="15" y1="25" x2="35" y2="25" stroke="#2563eb" strokeWidth="2"/>
                    </svg>
                  </div>
                  <CardHeader className="text-center pb-4">
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">⚙️</span>
                      </div>
                    </div>
                    <CardTitle className="text-blue-800 text-xl font-bold">Admin Dashboard</CardTitle>
                    <CardDescription className="text-gray-600 mt-2">Manage courses, students, and educational content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/admin">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        Open Dashboard 🔬
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-sm border-green-200 hover:border-green-400 animate-fade-in-delayed-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                    <svg viewBox="0 0 50 50" className="w-full h-full">
                      <circle cx="25" cy="15" r="8" fill="none" stroke="#16a34a" strokeWidth="2"/>
                      <path d="M10 35 Q25 25 40 35 L40 45 L10 45 Z" fill="#16a34a" opacity="0.3"/>
                    </svg>
                  </div>
                  <CardHeader className="text-center pb-4">
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300">
                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🎓</span>
                      </div>
                    </div>
                    <CardTitle className="text-green-800 text-xl font-bold">Student Dashboard</CardTitle>
                    <CardDescription className="text-gray-600 mt-2">Track progress and access personalized content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/profile">
                      <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        View Dashboard 🧬
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Enhanced course information section with biology patterns */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 border border-green-200 animate-fade-in-delayed-5 relative overflow-hidden">
          {/* Biology pattern overlay */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" strokeWidth="4"/>
              <circle cx="100" cy="100" r="60" fill="none" stroke="#059669" strokeWidth="3"/>
              <circle cx="100" cy="100" r="40" fill="none" stroke="#047857" strokeWidth="2"/>
              <circle cx="100" cy="100" r="20" fill="#14b8a6" opacity="0.3"/>
              <path d="M50 100 Q100 50 150 100 Q100 150 50 100" fill="none" stroke="#10b981" strokeWidth="2"/>
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-8 text-center relative z-10">
            🧬 Biology Course Information 🔬
          </h2>
          <div className="grid md:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-green-800 mb-4 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-3"></div>
                About This Course 🌱
              </h3>
              <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                Dive deep into the fascinating world of biology through our comprehensive course that combines 
                theoretical knowledge with practical applications. Explore life sciences from molecular levels 
                to ecological systems through structured learning and interactive experiences.
              </p>
              <ul className="text-gray-700 space-y-3 text-lg">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-4"></div>
                  Weekly chapter releases with multimedia content 📊
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-4"></div>
                  Interactive lab simulations and assignments 🧪
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mr-4"></div>
                  Regular office hours for personalized guidance 👨‍🏫
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-4"></div>
                  Continuous assessment and feedback system 📈
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-green-800 mb-4 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full mr-3"></div>
                Course Statistics 📊
              </h3>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-2xl opacity-20">🧬</div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium text-lg">Total Chapters:</span>
                    <span className="font-bold text-2xl text-green-700">12</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-2xl opacity-20">🔬</div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium text-lg">Available Now:</span>
                    <span className="font-bold text-2xl text-emerald-600">5</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-green-50 p-4 rounded-xl border border-teal-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-2xl opacity-20">⏰</div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium text-lg">Next Release:</span>
                    <span className="font-bold text-lg text-teal-600">Monday, 9 AM</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-2xl opacity-20">🧪</div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium text-lg">Office Hours:</span>
                    <span className="font-bold text-lg text-green-600">Tue/Thu 2-4 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes expand {
          from { width: 0; }
          to { width: 6rem; }
        }
        @keyframes expand-delayed {
          from { width: 0; }
          to { width: 6rem; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-fade-in-delayed-1 {
          animation: fade-in 0.8s ease-out 0.2s both;
        }
        .animate-fade-in-delayed-2 {
          animation: fade-in 0.8s ease-out 0.4s both;
        }
        .animate-fade-in-delayed-3 {
          animation: fade-in 0.8s ease-out 0.6s both;
        }
        .animate-fade-in-delayed-4 {
          animation: fade-in 0.8s ease-out 0.8s both;
        }
        .animate-fade-in-delayed-5 {
          animation: fade-in 0.8s ease-out 1s both;
        }
        .animate-slide-down {
          animation: slide-down 1s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 1s ease-out 0.3s both;
        }
        .animate-expand {
          animation: expand 1s ease-out 0.8s both;
        }
        .animate-expand-delayed {
          animation: expand-delayed 1s ease-out 1.2s both;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 1.5s;
        }
      `}</style>
    </div>
  )
}
