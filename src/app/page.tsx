"use client"

import { BookOpen, Clock, MessageSquare, User, Settings } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/lib/hooks/use-user"

export default function HomePage() {
  const { user, profile, isLoading } = useUser()
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Dr Afef Najjari's Course</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Access course materials, check availability, and stay connected with your learning journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BookOpen className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <CardTitle>Course Chapters</CardTitle>
              <CardDescription>Access available course materials and chapters</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chapters">
                <Button className="w-full">View Chapters</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Clock className="w-12 h-12 mx-auto text-green-600 mb-2" />
              <CardTitle>Office Hours</CardTitle>
              <CardDescription>Check professor availability and schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/availability">
                <Button variant="outline" className="w-full bg-transparent">
                  Check Availability
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-purple-600 mb-2" />
              <CardTitle>Feedback</CardTitle>
              <CardDescription>Share your thoughts and suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/feedback">
                <Button variant="outline" className="w-full bg-transparent">
                  Give Feedback
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Conditional card based on authentication */}
          {!isLoading && (
            <>
              {!user ? (
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <User className="w-12 h-12 mx-auto text-orange-600 mb-2" />
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>Access admin dashboard and management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/auth">
                      <Button variant="secondary" className="w-full">
                        Sign In / Sign Up
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : profile?.role === 'admin' ? (
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <Settings className="w-12 h-12 mx-auto text-blue-600 mb-2" />
                    <CardTitle>Admin Dashboard</CardTitle>
                    <CardDescription>Manage courses and student interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/admin">
                      <Button className="w-full">
                        Open Dashboard
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <User className="w-12 h-12 mx-auto text-green-600 mb-2" />
                    <CardTitle>Student Dashboard</CardTitle>
                    <CardDescription>Track your progress and access course materials</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/profile">
                      <Button className="w-full">
                        View Dashboard
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Information</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">About This Course</h3>
              <p className="text-gray-600 mb-4">
                This comprehensive course covers advanced topics in computer science with practical applications and
                hands-on projects. Students will gain deep understanding through structured chapters and interactive
                learning materials.
              </p>
              <ul className="text-gray-600 space-y-1">
                <li>• Weekly chapter releases</li>
                <li>• Interactive assignments</li>
                <li>• Regular office hours</li>
                <li>• Continuous feedback system</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Chapters:</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Now:</span>
                  <span className="font-semibold text-green-600">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Release:</span>
                  <span className="font-semibold">Monday, 9 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Office Hours:</span>
                  <span className="font-semibold">Tue/Thu 2-4 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
