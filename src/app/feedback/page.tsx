"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Star, ThumbsUp, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/client"
import { useUser } from "@/lib/hooks/use-user"

type Feedback = Database['public']['Tables']['feedback']['Row']

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    type: "",
    rating: "",
    subject: "",
    message: "",
    anonymous: true,
  })
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, profile, isLoading: userLoading } = useUser()

  const supabase = createClient()

  useEffect(() => {
    if (!userLoading) {
      fetchFeedback()
    }
  }, [user, profile, userLoading])

  const fetchFeedback = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let query = supabase.from('feedback').select('*').order('created_at', { ascending: false })
      
      // Only show reviewed/resolved feedback to regular users, all feedback to admins
      if (!profile || profile.role !== 'admin') {
        query = query.in('status', ['reviewed', 'resolved'])
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          full_error: error
        })
        throw new Error(`Database error: ${error.message}`)
      }
      
      setFeedbackList(data || [])
    } catch (err: any) {
      console.error('Error fetching feedback:', err)
      setError(err.message || 'Failed to load feedback')
      setFeedbackList([])
    } finally {
      setIsLoading(false)
    }
  }

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert("Please sign in to submit feedback")
      return
    }

    if (!formData.type || !formData.subject || !formData.message) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            user_id: user.id,
            chapter_id: null, // Optional - general feedback not tied to specific chapter
            type: formData.type,
            subject: formData.subject,
            message: formData.message,
            rating: formData.rating ? parseInt(formData.rating) : null,
            is_anonymous: formData.anonymous,
            status: 'pending'
          }
        ])

      if (error) {
        console.error('Feedback submission error:', error)
        throw new Error(`Failed to submit feedback: ${error.message}`)
      }

      // Reset form
      setFormData({
        type: "",
        rating: "",
        subject: "",
        message: "",
        anonymous: true,
      })
      
      alert("Thank you for your feedback! It will be reviewed before being published.")
      
      // Refresh feedback list
      await fetchFeedback()
      
    } catch (err: any) {
      console.error('Error submitting feedback:', err)
      alert(err.message || 'Failed to submit feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveFeedback = async (feedbackId: number, newStatus: 'reviewed' | 'resolved' | 'rejected') => {
    if (!profile || profile.role !== 'admin') return

    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status: newStatus })
        .eq('id', feedbackId)

      if (error) throw error

      alert(`Feedback ${newStatus} successfully`)
      await fetchFeedback()
      
    } catch (err: any) {
      console.error(`Error updating feedback status to ${newStatus}:`, err)
      alert(`Failed to update feedback status`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reviewed":
        return <Badge className="bg-green-100 text-green-800">Reviewed</Badge>
      case "resolved":
        return <Badge className="bg-blue-100 text-blue-800">Resolved</Badge>
      case "under_review":
        return <Badge className="bg-orange-100 text-orange-800">Under Review</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Feedback</h1>
        <p className="text-gray-600">Share your thoughts and help improve the course experience</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Submit Feedback
              </CardTitle>
              <CardDescription>Your feedback helps improve the course for everyone</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Feedback Type</Label>
                    <Select value={formData.type} onValueChange={(value: string) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course_content">Course Content</SelectItem>
                        <SelectItem value="technical_issue">Technical Issue</SelectItem>
                        <SelectItem value="suggestion">Suggestion</SelectItem>
                        <SelectItem value="general">General Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rating">Overall Rating</Label>
                    <Select
                      value={formData.rating}
                      onValueChange={(value: string) => setFormData({ ...formData, rating: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rate 1-5" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 - Excellent</SelectItem>
                        <SelectItem value="4">4 - Good</SelectItem>
                        <SelectItem value="3">3 - Average</SelectItem>
                        <SelectItem value="2">2 - Poor</SelectItem>
                        <SelectItem value="1">1 - Very Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your feedback"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please provide detailed feedback..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.anonymous}
                    onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="anonymous" className="text-sm">
                    Submit anonymously
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting || !user}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : !user ? (
                    "Sign in to submit feedback"
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>See how your feedback is being addressed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading feedback...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-600">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>{error}</p>
                  </div>
                ) : feedbackList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No feedback available yet.</p>
                  </div>
                ) : (
                  feedbackList.map((feedback: Feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{feedback.type}</Badge>
                          {getStatusBadge(feedback.status)}
                        </div>
                        <div className="flex items-center space-x-1">
                          {feedback.rating && renderStars(feedback.rating)}
                        </div>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{feedback.subject}</h4>
                      <p className="text-sm text-gray-700 mb-2">{feedback.message}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By {feedback.is_anonymous ? "Anonymous" : "Student"}</span>
                        <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {/* Admin controls */}
                      {profile?.role === 'admin' && feedback.status === 'pending' && (
                        <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveFeedback(feedback.id, 'reviewed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveFeedback(feedback.id, 'resolved')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Resolve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleApproveFeedback(feedback.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ThumbsUp className="w-5 h-5 mr-2" />
                Feedback Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-blue-500" />
                  <p>Be specific about issues or suggestions to help us improve</p>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-blue-500" />
                  <p>Technical issues will be addressed within 24-48 hours</p>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-blue-500" />
                  <p>Course content feedback helps shape future chapters</p>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-blue-500" />
                  <p>All feedback is reviewed and considered for improvements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
