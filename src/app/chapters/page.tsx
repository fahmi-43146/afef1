"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Clock, Lock, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/client"
import { useUser } from "@/lib/hooks/use-user"

type Chapter = Database['public']['Tables']['chapters']['Row']

export default function ChaptersPage() {
  const [filter, setFilter] = useState("all")
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isLoading: userLoading } = useUser()

  const supabase = createClient()

  useEffect(() => {
    fetchChapters()
  }, [])

  const fetchChapters = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Database error: ${error.message}`)
      }
      
      setChapters(data || [])
    } catch (err: any) {
      console.error('Error fetching chapters:', err)
      setError(err.message || 'Failed to load chapters')
      setChapters([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredChapters = chapters.filter((chapter) => {
    if (filter === "available") return chapter.status === "published"
    if (filter === "scheduled") return chapter.status === "scheduled" 
    if (filter === "completed") return false // We'll implement progress tracking later
    return true // Show all chapters in "all" filter
  })

  const getStatusIcon = (status: string, completed: boolean = false) => {
    if (completed) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (status === "published") return <BookOpen className="w-5 h-5 text-blue-600" />
    if (status === "scheduled") return <Clock className="w-5 h-5 text-orange-600" />
    if (status === "draft") return <BookOpen className="w-5 h-5 text-gray-600" />
    return <Lock className="w-5 h-5 text-gray-400" />
  }

  const getStatusBadge = (status: string, completed: boolean = false) => {
    if (completed) return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    if (status === "published") return <Badge className="bg-blue-100 text-blue-800">Available</Badge>
    if (status === "scheduled") return <Badge className="bg-orange-100 text-orange-800">Scheduled</Badge>
    if (status === "draft") return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
    return <Badge variant="secondary">Unknown</Badge>
  }

  if (userLoading === true || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Loading chapters...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Chapters</h3>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={fetchChapters} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Chapters</h1>
        <p className="text-gray-600">Access your course materials and track your progress</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} size="sm">
          All Chapters
        </Button>
        <Button
          variant={filter === "available" ? "default" : "outline"}
          onClick={() => setFilter("available")}
          size="sm"
        >
          Available
        </Button>
        <Button
          variant={filter === "scheduled" ? "default" : "outline"}
          onClick={() => setFilter("scheduled")}
          size="sm"
        >
          Scheduled
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          onClick={() => setFilter("completed")}
          size="sm"
        >
          Completed
        </Button>
      </div>

              <div className="grid gap-6">
          {filteredChapters.map((chapter) => (
            <Link key={chapter.id} href={`/chapters/${chapter.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(chapter.status)}
                      <div>
                        <CardTitle className="text-xl">{chapter.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {chapter.description || "No description available"}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(chapter.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Released: {new Date(chapter.created_at).toLocaleDateString()}</span>
                      {chapter.duration && <span>Duration: {chapter.duration} min</span>}
                    </div>
                    <div className="flex space-x-2">
                      {chapter.status === "published" && (
                        <Button onClick={(e) => e.stopPropagation()}>Start Chapter</Button>
                      )}
                      {chapter.status === "scheduled" && (
                        <Button variant="outline" disabled>
                          Available {chapter.release_date ? new Date(chapter.release_date).toLocaleDateString() : 'Soon'}
                        </Button>
                      )}
                      {chapter.status === "draft" && (
                        <Button variant="outline" disabled>
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>

      {filteredChapters.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No chapters found</h3>
              <p>
                {filter === "all" 
                  ? "No chapters are available yet. Please check back later." 
                  : `No chapters match the "${filter}" filter.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
