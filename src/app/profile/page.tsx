"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/lib/hooks/use-user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, BookOpen, Clock, MessageSquare, Calendar, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function ProfilePage() {
  const { user, profile, isLoading } = useUser()
  const [stats, setStats] = useState({
    chaptersAccessed: 0,
    totalChapters: 0,
    lastLogin: null as string | null,
    joinedDate: null as string | null
  })
  const supabase = createClient()

  useEffect(() => {
    if (user && profile) {
      fetchStudentStats()
    }
  }, [user, profile])

  const fetchStudentStats = async () => {
    try {
      // Get total published chapters
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('id')
        .eq('status', 'published')

      if (!chaptersError) {
        setStats(prev => ({ 
          ...prev, 
          totalChapters: chapters?.length || 0,
          joinedDate: user?.created_at || null
        }))
      }
    } catch (error) {
      console.error('Error fetching student stats:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = "/"
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading your profile...</div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Please sign in to access your profile.</p>
          <Link href="/auth">
            <Button className="mt-4">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Check approval status
  if (profile.approval_status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl text-yellow-800">Account Pending Approval</CardTitle>
              <CardDescription>Your account is waiting for admin review</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-700">
                Welcome <strong>{profile.full_name}</strong>! Your account has been created successfully, 
                but it needs to be approved by an administrator before you can access the course materials.
              </p>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">What happens next?</h3>
                <ul className="text-sm text-yellow-700 space-y-1 text-left">
                  <li>• An admin will review your account</li>
                  <li>• You'll receive approval notification</li>
                  <li>• Once approved, you can access all course materials</li>
                  <li>• This usually takes 1-2 business days</li>
                </ul>
              </div>
              <div className="pt-4">
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (profile.approval_status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-800">Account Access Denied</CardTitle>
              <CardDescription>Your access request has been reviewed</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-700">
                Unfortunately, your request to access Dr. Afef Najjari's course has been declined.
              </p>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">
                  If you believe this is an error or have questions about this decision, 
                  please contact the course administrator.
                </p>
              </div>
              <div className="pt-4">
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {profile.full_name || 'Student'}!
              </h1>
              <p className="text-gray-600">Manage your course progress and activities</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900">{profile.full_name || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {profile.role}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Student ID</label>
                  <p className="text-gray-900">{profile.student_id || 'Not assigned'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Joined</label>
                  <p className="text-gray-900">
                    {stats.joinedDate ? new Date(stats.joinedDate).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/chapters">
                  <Button className="w-full" variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Chapters
                  </Button>
                </Link>
                <Link href="/availability">
                  <Button className="w-full" variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    Professor Availability
                  </Button>
                </Link>
                <Link href="/feedback">
                  <Button className="w-full" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Give Feedback
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Course Progress & Activity */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
                <CardDescription>Your learning journey with Dr. Afef Najjari</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalChapters}</div>
                    <div className="text-sm text-gray-600">Total Chapters</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.chaptersAccessed}</div>
                    <div className="text-sm text-gray-600">Chapters Accessed</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.totalChapters > 0 ? Math.round((stats.chaptersAccessed / stats.totalChapters) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Progress</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${stats.totalChapters > 0 ? (stats.chaptersAccessed / stats.totalChapters) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent interactions with the course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium">Profile Created</p>
                      <p className="text-sm text-gray-600">
                        Joined the course • {stats.joinedDate ? new Date(stats.joinedDate).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                  
                  {stats.totalChapters > 0 ? (
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <BookOpen className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-medium">Course Materials Available</p>
                        <p className="text-sm text-gray-600">
                          {stats.totalChapters} chapter{stats.totalChapters !== 1 ? 's' : ''} ready to explore
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
                      <Clock className="w-8 h-8 text-yellow-600" />
                      <div>
                        <p className="font-medium">Waiting for Content</p>
                        <p className="text-sm text-gray-600">
                          Course chapters will be available soon
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>Get support and connect with your professor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/availability">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <Clock className="w-6 h-6 mb-2" />
                      <span>Office Hours</span>
                    </Button>
                  </Link>
                  <Link href="/feedback">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <MessageSquare className="w-6 h-6 mb-2" />
                      <span>Send Feedback</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 