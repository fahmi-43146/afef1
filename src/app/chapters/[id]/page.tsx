"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import { ArrowLeft, BookOpen, Clock, Play, Lock, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/client"
import { useUser } from "@/lib/hooks/use-user"

type Chapter = Database['public']['Tables']['chapters']['Row']

export default function ChapterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [progress, setProgress] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [chapterId, setChapterId] = useState<string>("")

  const { profile, isLoading: userLoading } = useUser()
  const userRole = profile?.role || 'student'
  const supabase = createClient()

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      setChapterId(resolvedParams.id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (chapterId) {
      fetchChapter()
    }
  }, [chapterId])

  // Handle access control after both chapter and userRole are loaded
  useEffect(() => {
    if (chapter && userRole && !isLoading) {
      // If chapter is not published
      if (chapter.status !== 'published') {
        // Admin/Professor can stay and see the page
        if (userRole === 'admin') {
          // Let them stay, they'll see the warning banner
          return
        } else {
          // Regular users get redirected back to chapters
          window.location.href = '/chapters'
          return
        }
      }
    }
  }, [chapter, userRole, isLoading])

  const fetchChapter = async () => {
    if (!chapterId) return
    
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', parseInt(chapterId))
        .single()

      if (error) throw error
      setChapter(data)

      // For non-published chapters, check user role
      if (data && data.status !== 'published') {
        // Will handle redirect in separate useEffect after userRole is set
      }
    } catch (error) {
      console.error('Error fetching chapter:', error)
      setChapter(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Removed checkUserRole function - now using useUser hook

  const canAccessChapter = () => {
    if (!chapter) return false
    
    // Admin can access any chapter
    if (userRole === 'admin') return true
    
    // Students can only access published chapters
    return chapter.status === 'published'
  }

  const handleStartChapter = () => {
    setIsStarted(true)
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 1000)
  }

  const getStatusMessage = () => {
    if (!chapter) return "Chapter not found"
    
    switch (chapter.status) {
      case 'draft':
        return "This chapter is still in draft and not yet published."
      case 'scheduled':
        return chapter.release_date 
          ? `This chapter is scheduled to be released on ${new Date(chapter.release_date).toLocaleDateString()}.`
          : "This chapter is scheduled for release soon."
      case 'archived':
        return "This chapter has been archived and is no longer available."
      default:
        return "This chapter is not currently available."
    }
  }

  if (isLoading || userLoading === true) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Loading chapter...</span>
        </div>
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Chapter Not Found</h1>
          <p className="text-gray-600 mb-6">The chapter you're looking for doesn't exist or has been removed.</p>
          <Link href="/chapters">
            <Button>Back to Chapters</Button>
          </Link>
        </div>
      </div>
    )
  }

    return (
    <div className="container mx-auto px-4 py-8">

      <div className="mb-6">
        <Link href="/chapters" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Chapters
        </Link>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{chapter.title}</h1>
            <p className="text-gray-600">{chapter.description || "No description available"}</p>
                         {!canAccessChapter() && (
               <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400 rounded-lg">
                 <div className="flex items-start">
                   <div className="flex-shrink-0">
                     <Lock className="w-5 h-5 text-orange-500" />
                   </div>
                   <div className="ml-3">
                     <h3 className="text-sm font-medium text-orange-800">
                       Chapter {chapter.status.charAt(0).toUpperCase() + chapter.status.slice(1)}
                     </h3>
                     <p className="text-sm text-orange-700 mt-1">
                       {getStatusMessage()}
                     </p>
                   </div>
                 </div>
               </div>
             )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {chapter.duration && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{chapter.duration} min</span>
              </div>
            )}
            <div className="px-2 py-1 bg-gray-100 rounded text-xs">
              {chapter.status.charAt(0).toUpperCase() + chapter.status.slice(1)}
            </div>
          </div>
        </div>

        {isStarted && canAccessChapter() && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Chapter Content
                </CardTitle>
                {!isStarted && canAccessChapter() && (
                  <Button onClick={handleStartChapter} className="flex items-center">
                    <Play className="w-4 h-4 mr-2" />
                    Start Chapter
                  </Button>
                )}
                {!canAccessChapter() && (
                  <Button 
                    variant="outline" 
                    disabled 
                    className="flex items-center"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Locked
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {canAccessChapter() ? (
                <div className="prose max-w-none">
                  {chapter.content ? (
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {chapter.content}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No content available for this chapter yet.</p>
                      {userRole === 'admin' && (
                        <p className="text-sm mt-2">Add content in the admin panel.</p>
                      )}
                    </div>
                  )}
                </div>
                             ) : (
                 <div className="text-center py-16">
                   <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                     <Lock className="w-8 h-8 text-gray-400" />
                   </div>
                   <h3 className="text-xl font-semibold text-gray-900 mb-3">Content Locked</h3>
                   <p className="text-gray-600 max-w-md mx-auto mb-6">{getStatusMessage()}</p>
                   <Link href="/chapters">
                     <Button 
                       variant="default"
                       className="bg-orange-500 hover:bg-orange-600"
                     >
                       <ArrowLeft className="w-4 h-4 mr-2" />
                       Back to Chapters
                     </Button>
                   </Link>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chapter Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order:</span>
                <span>{chapter.order_index}</span>
              </div>
              {chapter.duration && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span>{chapter.duration} minutes</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="capitalize">{chapter.status}</span>
              </div>
              {chapter.release_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Release Date:</span>
                  <span>{new Date(chapter.release_date).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Created:</span>
                <span>{new Date(chapter.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {canAccessChapter() && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-transparent" variant="outline">
                  Take Notes
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  Ask Question
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  Mark as Complete
                </Button>
              </CardContent>
            </Card>
          )}

          {userRole === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin">
                  <Button className="w-full" variant="outline">
                    Edit Chapter
                  </Button>
                </Link>
                {chapter.status !== 'published' && (
                  <div className="px-3 py-2 bg-blue-50 rounded-lg text-center">
                    <p className="text-xs text-blue-700">
                      🔍 Preview Mode Active
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
