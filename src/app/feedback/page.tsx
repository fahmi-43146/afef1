"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Star, ThumbsUp, AlertCircle } from "lucide-react"

const recentFeedback = [
  {
    id: 1,
    student: "Anonymous",
    type: "Course Content",
    rating: 5,
    comment: "The chapter on algorithms was very well explained. The examples helped a lot!",
    date: "2024-01-20",
    status: "reviewed",
  },
  {
    id: 2,
    student: "Anonymous",
    type: "Technical Issue",
    rating: 3,
    comment: "Had trouble accessing Chapter 4. The video wouldn't load properly.",
    date: "2024-01-18",
    status: "resolved",
  },
  {
    id: 3,
    student: "Anonymous",
    type: "Suggestion",
    rating: 4,
    comment: "Could we have more practice problems for each chapter?",
    date: "2024-01-15",
    status: "under_review",
  },
]

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    type: "",
    rating: "",
    subject: "",
    message: "",
    anonymous: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Feedback submitted:", formData)
    // Reset form
    setFormData({
      type: "",
      rating: "",
      subject: "",
      message: "",
      anonymous: true,
    })
    alert("Thank you for your feedback!")
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

                <Button type="submit" className="w-full">
                  Submit Feedback
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
                {recentFeedback.map((feedback) => (
                  <div key={feedback.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{feedback.type}</Badge>
                        {getStatusBadge(feedback.status)}
                      </div>
                      <div className="flex items-center space-x-1">{renderStars(feedback.rating)}</div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{feedback.comment}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>By {feedback.student}</span>
                      <span>{new Date(feedback.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
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
