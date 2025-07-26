"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Users, BookOpen, MessageSquare, BarChart3, Edit2, Trash2 } from "lucide-react"
import ChapterForm from "@/components/chapter-form"
import AuthWrapper from "@/components/auth-wrapper"
import { useUser } from "@/lib/hooks/use-user"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/client"

type AvailabilitySlot = Database['public']['Tables']['availability_slots']['Row']
type AvailabilitySlotInsert = Database['public']['Tables']['availability_slots']['Insert']
type Announcement = Database['public']['Tables']['announcements']['Row']
type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert']
type AnnouncementUpdate = Database['public']['Tables']['announcements']['Update']

export default function AdminPage() {
  const { profile, isLoading, user } = useUser()
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false)
  const [studentStats, setStudentStats] = useState({
    totalStudents: 0,
    newStudentsThisWeek: 0,
    newStudentsThisMonth: 0,
    recentStudents: [] as any[]
  })
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [formData, setFormData] = useState({
    title: 'Office Hours',
    description: '',
    start_time: '',
    end_time: '',
    location: 'Office (Room 204)',
    virtual_link: '',
    max_bookings: 1,
    slot_type: 'office_hours'
  })
  const [announcementData, setAnnouncementData] = useState<{
    title: string
    content: string
    is_published: boolean
    is_pinned: boolean
    announcement_type: 'announcement' | 'event' | 'deadline' | 'update'
    importance_level: 'low' | 'normal' | 'high' | 'urgent'
    event_date: string
    event_time: string
    location: string
  }>({
    title: '',
    content: '',
    is_published: true,
    is_pinned: false,
    announcement_type: 'announcement',
    importance_level: 'normal',
    event_date: '',
    event_time: '',
    location: ''
  })

  // Edit state
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      testTableAccess()
      fetchAvailabilitySlots()
      fetchAnnouncements()
      fetchStudentStats()
    }
  }, [user, profile])

  const testTableAccess = async () => {
    try {
      console.log('🧪 Testing table access...')
      
      // Simple count query to test table access
      const { count, error } = await supabase
        .from('availability_slots')
        .select('*', { count: 'exact', head: true })

      console.log('📊 Table access test:', { count, error })
      
      if (error) {
        console.error('❌ Table access failed:', {
          message: error.message,
          code: error.code,
          hint: error.hint
        })
      }
    } catch (error) {
      console.error('❌ Table access test failed:', error)
    }
  }

  const fetchAvailabilitySlots = async () => {
    if (!user) return
    
    setIsLoadingSlots(true)
    try {
      console.log('🔍 Fetching availability slots for user:', user.id)
      
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('professor_id', user.id)
        .eq('is_active', true)
        .order('start_time', { ascending: true })

      console.log('📊 Supabase response:', { data, error, userHasData: !!data?.length })

      if (error) {
        console.error('❌ Supabase error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      }
      
      setAvailabilitySlots(data || [])
    } catch (error: any) {
      console.error('❌ Error fetching availability slots:', {
        message: error?.message,
        code: error?.code,
        fullError: error
      })
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handleCreateAvailabilitySlot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.start_time || !formData.end_time) return

    try {
      const newSlot: AvailabilitySlotInsert = {
        professor_id: user.id,
        title: formData.title,
        description: formData.description || null,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location,
        virtual_link: formData.virtual_link || null,
        max_bookings: formData.max_bookings,
        slot_type: formData.slot_type,
        is_active: true,
        is_recurring: false
      }

      const { error } = await supabase
        .from('availability_slots')
        .insert([newSlot])

      if (error) throw error

      // Reset form
      setFormData({
        title: 'Office Hours',
        description: '',
        start_time: '',
        end_time: '',
        location: 'Office (Room 204)',
        virtual_link: '',
        max_bookings: 1,
        slot_type: 'office_hours'
      })

      // Refresh slots
      fetchAvailabilitySlots()
    } catch (error) {
      console.error('Error creating availability slot:', error)
    }
  }

  const fetchAnnouncements = async () => {
    if (!user) return
    
    setIsLoadingAnnouncements(true)
    try {
      console.log('🔍 Fetching announcements for user:', user.id)
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

      console.log('📊 Announcements response:', { data, error, count: data?.length })

      if (error) {
        console.error('❌ Supabase error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      }
      
      setAnnouncements(data || [])
    } catch (error: any) {
      console.error('❌ Error fetching announcements:', {
        message: error?.message,
        code: error?.code,
        fullError: error
      })
    } finally {
      setIsLoadingAnnouncements(false)
    }
  }

  const fetchStudentStats = async () => {
    if (!user) return
    
    setIsLoadingStats(true)
    try {
      console.log('🔍 Fetching student statistics...')
      
      // Get total students
      const { data: allStudents, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false })

      if (studentsError) throw studentsError

      // Calculate date ranges
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const newStudentsThisWeek = allStudents?.filter(student => 
        new Date(student.created_at) >= oneWeekAgo
      ).length || 0

      const newStudentsThisMonth = allStudents?.filter(student => 
        new Date(student.created_at) >= oneMonthAgo
      ).length || 0

      setStudentStats({
        totalStudents: allStudents?.length || 0,
        newStudentsThisWeek,
        newStudentsThisMonth,
        recentStudents: allStudents?.slice(0, 5) || []
      })

      console.log('📊 Student stats:', {
        total: allStudents?.length,
        thisWeek: newStudentsThisWeek,
        thisMonth: newStudentsThisMonth
      })
      
    } catch (error: any) {
      console.error('❌ Error fetching student stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !announcementData.title) return

    try {
      console.log('🔍 Creating announcement with data:', announcementData)
      console.log('🔍 User ID:', user.id)

      const newAnnouncement: AnnouncementInsert = {
        author_id: user.id,
        title: announcementData.title,
        content: announcementData.content,
        is_published: announcementData.is_published,
        is_pinned: announcementData.is_pinned,
        announcement_type: announcementData.announcement_type,
        importance_level: announcementData.importance_level,
        event_date: announcementData.event_date || null,
        event_time: announcementData.event_time || null,
        location: announcementData.location || null
      }

      console.log('📊 Sending to database:', newAnnouncement)

      const { data, error } = await supabase
        .from('announcements')
        .insert([newAnnouncement])
        .select()

      console.log('📊 Database response:', { data, error })

      if (error) {
        console.error('❌ Supabase error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      console.log('✅ Announcement created successfully!')
      
      // Show success message
      alert('✅ Announcement created successfully!')

      // Reset form
      setAnnouncementData({
        title: '',
        content: '',
        is_published: true,
        is_pinned: false,
        announcement_type: 'announcement',
        importance_level: 'normal',
        event_date: '',
        event_time: '',
        location: ''
      })

      // Refresh announcements
      fetchAnnouncements()
    } catch (error: any) {
      console.error('❌ Error creating announcement:', {
        message: error?.message,
        code: error?.code,
        fullError: error
      })
    }
  }

  const handleEditAnnouncement = (announcement: Announcement) => {
    console.log('📝 Editing announcement:', announcement)
    setEditingAnnouncement(announcement)
    
    // Pre-fill the form with existing data
    setAnnouncementData({
      title: announcement.title,
      content: announcement.content,
      is_published: announcement.is_published || false,
      is_pinned: announcement.is_pinned || false,
      announcement_type: announcement.announcement_type || 'announcement',
      importance_level: announcement.importance_level || 'normal',
      event_date: announcement.event_date || '',
      event_time: announcement.event_time || '',
      location: announcement.location || ''
    })
    
    setIsEditDialogOpen(true)
  }

  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !editingAnnouncement) {
      console.error('❌ No user or editing announcement')
      return
    }

    try {
      console.log('🔄 Updating announcement:', editingAnnouncement.id, announcementData)
      
      const supabase = createClient()
      const updateData: AnnouncementUpdate = {
        title: announcementData.title,
        content: announcementData.content,
        is_published: announcementData.is_published,
        is_pinned: announcementData.is_pinned,
        announcement_type: announcementData.announcement_type,
        importance_level: announcementData.importance_level,
        event_date: announcementData.event_date || null,
        event_time: announcementData.event_time || null,
        location: announcementData.location || null,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('announcements')
        .update(updateData)
        .eq('id', editingAnnouncement.id)
        .select()

      if (error) {
        console.error('❌ Supabase update error:', error)
        throw error
      }

      console.log('✅ Announcement updated successfully:', data)
      
      // Show success message
      alert('✅ Announcement updated successfully!')
      
      // Refresh announcements list
      await fetchAnnouncements()
      
      // Reset form and close dialog
      setAnnouncementData({
        title: '',
        content: '',
        is_published: true,
        is_pinned: false,
        announcement_type: 'announcement',
        importance_level: 'normal',
        event_date: '',
        event_time: '',
        location: ''
      })
      setEditingAnnouncement(null)
      setIsEditDialogOpen(false)
      
    } catch (error) {
      console.error('❌ Error updating announcement:', error)
    }
  }

  const handleDeleteAnnouncement = async (announcementId: number) => {
    if (!user) {
      console.error('❌ No user')
      return
    }

    try {
      console.log('🗑️ Deleting announcement:', announcementId)
      
      const supabase = createClient()
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId)

      if (error) {
        console.error('❌ Supabase delete error:', error)
        throw error
      }

      console.log('✅ Announcement deleted successfully')
      
      // Show success message
      alert('✅ Announcement deleted successfully!')
      
      // Refresh announcements list
      await fetchAnnouncements()
      
    } catch (error) {
      console.error('❌ Error deleting announcement:', error)
    }
  }

  const stats = [
    { label: "Total Students", value: "156", icon: Users, color: "text-blue-600" },
    { label: "Published Chapters", value: "5", icon: BookOpen, color: "text-green-600" },
    { label: "Pending Feedback", value: "12", icon: MessageSquare, color: "text-orange-600" },
    { label: "Completion Rate", value: "78%", icon: BarChart3, color: "text-purple-600" },
  ]

  const chapters = [
    { id: 1, title: "Introduction to Advanced Algorithms", status: "published", students: 142 },
    { id: 2, title: "Data Structures Deep Dive", status: "published", students: 138 },
    { id: 3, title: "Graph Theory Fundamentals", status: "published", students: 125 },
    { id: 4, title: "Dynamic Programming Mastery", status: "published", students: 98 },
    { id: 5, title: "Machine Learning Algorithms", status: "published", students: 87 },
    { id: 6, title: "Advanced Database Systems", status: "scheduled", students: 0 },
    { id: 7, title: "Distributed Systems Architecture", status: "draft", students: 0 },
  ]

  return (
    <AuthWrapper requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {profile?.full_name 
            ? `Welcome back, ${profile.full_name}!` 
            : "Admin Dashboard"
          }
        </h1>
        <p className="text-gray-600">
          {profile?.full_name 
            ? "Here's your course management overview for today"
            : "Manage your course content and student interactions with dynamic features"
          }
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="chapters" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="announcements">Events</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="chapters" className="space-y-6">
          {/* Dynamic Chapter Form Component */}
          <ChapterForm 
            onChapterCreated={(chapter) => {
              console.log('New chapter created:', chapter)
              // You can add additional logic here if needed
            }}
            onChapterUpdated={(chapter) => {
              console.log('Chapter updated:', chapter)
              // You can add additional logic here if needed
            }}
            onChapterDeleted={(chapterId) => {
              console.log('Chapter deleted:', chapterId)
              // You can add additional logic here if needed
            }}
          />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Set Availability
                </CardTitle>
                <CardDescription>Manage your office hours and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAvailabilitySlot} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Office Hours"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Brief description of this availability slot..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_time">Start Date & Time</Label>
                      <Input
                        id="start_time"
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_time">End Date & Time</Label>
                      <Input
                        id="end_time"
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max_bookings">Max Bookings</Label>
                      <Input 
                        id="max_bookings" 
                        type="number" 
                        value={formData.max_bookings}
                        onChange={(e) => setFormData({...formData, max_bookings: parseInt(e.target.value) || 1})}
                        min="1"
                        max="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="slot_type">Type</Label>
                      <select
                        id="slot_type"
                        value={formData.slot_type}
                        onChange={(e) => setFormData({...formData, slot_type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="office_hours">🕐 Office Hours</option>
                        <option value="consultation">💼 Consultation</option>
                        <option value="meeting">🤝 Meeting</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g., Office Room 204, Library, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="virtual_link">Virtual Link (Optional)</Label>
                    <Input
                      id="virtual_link"
                      type="url"
                      value={formData.virtual_link}
                      onChange={(e) => setFormData({...formData, virtual_link: e.target.value})}
                      placeholder="e.g., https://zoom.us/j/123456789"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Add Availability Slot
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Schedule</CardTitle>
                <CardDescription>Your scheduled appointments and office hours</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSlots ? (
                  <div className="text-center py-4 text-gray-500">Loading schedule...</div>
                ) : availabilitySlots.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p>No upcoming availability slots.</p>
                    <p className="text-xs mt-1">Create your first slot above!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availabilitySlots.slice(0, 5).map((slot) => {
                      const startDate = new Date(slot.start_time)
                      const endDate = new Date(slot.end_time)
                      const isToday = startDate.toDateString() === new Date().toDateString()
                      
                      return (
                        <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium text-sm">{slot.title}</div>
                            {slot.description && (
                              <div className="text-xs text-gray-500">{slot.description}</div>
                            )}
                            <div className="text-xs text-gray-600">
                              {isToday ? 'Today' : startDate.toLocaleDateString()}, {' '}
                              {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {' '}
                              {endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            <div className="text-xs text-gray-600">{slot.location}</div>
                            <div className="text-xs text-gray-500">
                              Max {slot.max_bookings || 1} booking{(slot.max_bookings || 1) > 1 ? 's' : ''}
                            </div>
                          </div>
                          <Badge 
                            className={
                              slot.is_active 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {slot.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
                              <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Create Announcement
                  </CardTitle>
                  <CardDescription>Add important announcements and news</CardDescription>
                </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  <div>
                    <Label htmlFor="ann_title">Title</Label>
                    <Input
                      id="ann_title"
                      type="text"
                      value={announcementData.title}
                      onChange={(e) => setAnnouncementData({...announcementData, title: e.target.value})}
                      placeholder="e.g., Midterm Review Session"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="ann_content">Content</Label>
                    <Textarea
                      id="ann_content"
                      value={announcementData.content}
                      onChange={(e) => setAnnouncementData({...announcementData, content: e.target.value})}
                      placeholder="Announcement content..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ann_type">Type</Label>
                      <select
                        id="ann_type"
                        value={announcementData.announcement_type}
                        onChange={(e) => setAnnouncementData({...announcementData, announcement_type: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="announcement">📢 Announcement</option>
                        <option value="event">📅 Event</option>
                        <option value="deadline">⚠️ Deadline</option>
                        <option value="update">📝 Update</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="ann_importance">Importance</Label>
                      <select
                        id="ann_importance"
                        value={announcementData.importance_level}
                        onChange={(e) => setAnnouncementData({...announcementData, importance_level: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="low">🟢 Low</option>
                        <option value="normal">🟡 Normal</option>
                        <option value="high">🟠 High</option>
                        <option value="urgent">🔴 Urgent</option>
                      </select>
                    </div>
                  </div>

                  {/* Event Details - Show for events and deadlines */}
                  {(announcementData.announcement_type === 'event' || announcementData.announcement_type === 'deadline') && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-sm">Event Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ann_event_date">Date</Label>
                          <Input
                            id="ann_event_date"
                            type="date"
                            value={announcementData.event_date}
                            onChange={(e) => setAnnouncementData({...announcementData, event_date: e.target.value})}
                            required={announcementData.announcement_type === 'event'}
                          />
                        </div>
                        <div>
                          <Label htmlFor="ann_event_time">Time</Label>
                          <Input
                            id="ann_event_time"
                            type="time"
                            value={announcementData.event_time}
                            onChange={(e) => setAnnouncementData({...announcementData, event_time: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="ann_location">Location</Label>
                        <Input
                          id="ann_location"
                          type="text"
                          value={announcementData.location}
                          onChange={(e) => setAnnouncementData({...announcementData, location: e.target.value})}
                          placeholder="e.g., Room 101, Zoom link, etc."
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={announcementData.is_pinned}
                        onChange={(e) => setAnnouncementData({...announcementData, is_pinned: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm">📌 Pin this announcement</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={announcementData.is_published}
                        onChange={(e) => setAnnouncementData({...announcementData, is_published: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm">✅ Publish immediately</span>
                    </label>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Create Announcement
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>Your published events and announcements</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAnnouncements ? (
                  <div className="text-center py-4 text-gray-500">Loading announcements...</div>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p>No announcements yet.</p>
                    <p className="text-xs mt-1">Create your first announcement!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.slice(0, 5).map((announcement) => {
                      const eventDate = announcement.event_date ? new Date(announcement.event_date) : null
                      const today = new Date()
                      const daysLeft = eventDate ? Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null
                      
                      const getImportanceBadgeColor = (level: string) => {
                        switch(level) {
                          case 'low': return 'bg-green-100 text-green-800'
                          case 'high': return 'bg-orange-100 text-orange-800'
                          case 'urgent': return 'bg-red-100 text-red-800'
                          default: return 'bg-gray-100 text-gray-800'
                        }
                      }
                      
                      const getTypeIcon = (type: string) => {
                        switch(type) {
                          case 'event': return '📅'
                          case 'deadline': return '⚠️'
                          case 'update': return '📝'
                          default: return '📢'
                        }
                      }
                      
                      return (
                        <div key={announcement.id} className="flex items-start justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-sm flex items-center">
                              <span className="mr-2">{getTypeIcon(announcement.announcement_type || 'announcement')}</span>
                              {announcement.title}
                              {announcement.is_pinned && (
                                <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">📌 Pinned</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{announcement.content}</div>
                            
                            {/* Event details */}
                            {announcement.event_date && (
                              <div className="text-xs text-blue-600 mt-1">
                                📅 {eventDate?.toLocaleDateString()}
                                {announcement.event_time && ` at ${announcement.event_time}`}
                                {daysLeft !== null && (
                                  <span className={`ml-2 px-2 py-0.5 rounded ${
                                    daysLeft < 0 ? 'bg-red-100 text-red-700' :
                                    daysLeft === 0 ? 'bg-yellow-100 text-yellow-700' :
                                    daysLeft <= 7 ? 'bg-orange-100 text-orange-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {daysLeft < 0 ? `${Math.abs(daysLeft)} days ago` :
                                     daysLeft === 0 ? 'Today!' :
                                     `${daysLeft} days left`}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {announcement.location && (
                              <div className="text-xs text-gray-600 mt-1">
                                📍 {announcement.location}
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-400 mt-1">
                              Created: {new Date(announcement.created_at || '').toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <div className="flex items-center space-x-1 mb-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditAnnouncement(announcement)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 hover:border-red-300"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white border-2 border-red-200 shadow-2xl max-w-md">
                                  <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg"></div>
                                  <div className="relative z-10">
                                    <AlertDialogHeader className="text-center pb-4">
                                      <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                        <Trash2 className="w-6 h-6 text-red-600" />
                                      </div>
                                      <AlertDialogTitle className="text-xl font-bold text-gray-900">
                                        Delete Announcement
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-gray-700 text-base mt-2 leading-relaxed">
                                        Are you sure you want to delete <strong>"{announcement.title}"</strong>?
                                        <br />
                                        <span className="text-red-600 font-medium">This action cannot be undone.</span>
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex gap-3 pt-6">
                                      <AlertDialogCancel className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 font-medium">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                      >
                                        🗑️ Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </div>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>

                            <Badge 
                              className={
                                announcement.is_published 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {announcement.is_published ? 'Published' : 'Draft'}
                            </Badge>
                            
                            {announcement.importance_level && announcement.importance_level !== 'normal' && (
                              <Badge className={getImportanceBadgeColor(announcement.importance_level)}>
                                {announcement.importance_level.charAt(0).toUpperCase() + announcement.importance_level.slice(1)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Student Feedback
              </CardTitle>
              <CardDescription>Review and respond to student feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Course Content</Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
                    </div>
                    <div className="text-sm text-gray-500">2 hours ago</div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    "The examples in Chapter 3 were great, but I think we need more practice problems for the graph
                    algorithms section."
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm">Mark as Reviewed</Button>
                    <Button size="sm" variant="outline">
                      Respond
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Technical Issue</Badge>
                      <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                    </div>
                    <div className="text-sm text-gray-500">1 day ago</div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    "Video in Chapter 4 wasn't loading properly. Fixed after clearing browser cache."
                  </p>
                  <div className="text-xs text-gray-600">Resolved by: Technical support team</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Student Analytics */}
          <div className="grid lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {isLoadingStats ? "..." : studentStats.totalStudents}
                </div>
                <p className="text-xs text-gray-500 mt-1">Registered students</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {isLoadingStats ? "..." : studentStats.newStudentsThisWeek}
                </div>
                <p className="text-xs text-gray-500 mt-1">New registrations</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {isLoadingStats ? "..." : studentStats.newStudentsThisMonth}
                </div>
                <p className="text-xs text-gray-500 mt-1">New registrations</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {isLoadingStats ? "..." : 
                    studentStats.totalStudents > 0 ? 
                    `${Math.round((studentStats.newStudentsThisMonth / Math.max(studentStats.totalStudents - studentStats.newStudentsThisMonth, 1)) * 100)}%` 
                    : "0%"
                  }
                </div>
                <p className="text-xs text-gray-500 mt-1">Monthly growth</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Recent Students
                </CardTitle>
                <CardDescription>Latest student registrations</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="text-center py-4 text-gray-500">Loading...</div>
                ) : studentStats.recentStudents.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No students yet</div>
                ) : (
                  <div className="space-y-3">
                    {studentStats.recentStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm font-medium">{student.full_name || 'Unnamed Student'}</div>
                          <div className="text-xs text-gray-500">{student.email}</div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(student.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chapter Engagement</CardTitle>
                <CardDescription>Student progress and completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chapters.slice(0, 5).map((chapter) => (
                    <div key={chapter.id} className="flex items-center justify-between">
                      <div className="text-sm font-medium">{chapter.title}</div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-600">{chapter.students} students</div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(chapter.students / Math.max(studentStats.totalStudents, 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest student interactions and submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>15 students completed Chapter 5</span>
                    <span className="text-gray-500 ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>New feedback received</span>
                    <span className="text-gray-500 ml-auto">3 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Chapter 6 scheduled for release</span>
                    <span className="text-gray-500 ml-auto">1 day ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
                 </TabsContent>
       </Tabs>
     </div>

     {/* Edit Announcement Dialog */}
     <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
       <DialogContent className="max-w-2xl">
         <DialogHeader>
           <DialogTitle>Edit Announcement</DialogTitle>
           <DialogDescription>
             Update your announcement details below.
           </DialogDescription>
         </DialogHeader>
         
         <form onSubmit={handleUpdateAnnouncement} className="space-y-4">
           <div>
             <Label htmlFor="edit_title">Title</Label>
             <Input
               id="edit_title"
               value={announcementData.title}
               onChange={(e) => setAnnouncementData({...announcementData, title: e.target.value})}
               placeholder="Announcement title..."
               required
             />
           </div>

           <div>
             <Label htmlFor="edit_content">Content</Label>
             <Textarea
               id="edit_content"
               value={announcementData.content}
               onChange={(e) => setAnnouncementData({...announcementData, content: e.target.value})}
               placeholder="Announcement content..."
               rows={4}
               required
             />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
               <Label htmlFor="edit_type">Type</Label>
               <select
                 id="edit_type"
                 value={announcementData.announcement_type}
                 onChange={(e) => setAnnouncementData({...announcementData, announcement_type: e.target.value as any})}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
               >
                 <option value="announcement">📢 Announcement</option>
                 <option value="event">📅 Event</option>
                 <option value="deadline">⚠️ Deadline</option>
                 <option value="update">📝 Update</option>
               </select>
             </div>
             
             <div>
               <Label htmlFor="edit_importance">Importance</Label>
               <select
                 id="edit_importance"
                 value={announcementData.importance_level}
                 onChange={(e) => setAnnouncementData({...announcementData, importance_level: e.target.value as any})}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
               >
                 <option value="low">🟢 Low</option>
                 <option value="normal">🟡 Normal</option>
                 <option value="high">🟠 High</option>
                 <option value="urgent">🔴 Urgent</option>
               </select>
             </div>
           </div>

           {/* Event Details - Show for events and deadlines */}
           {(announcementData.announcement_type === 'event' || announcementData.announcement_type === 'deadline') && (
             <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
               <h4 className="font-medium text-sm">Event Details</h4>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="edit_event_date">Date</Label>
                   <Input
                     id="edit_event_date"
                     type="date"
                     value={announcementData.event_date}
                     onChange={(e) => setAnnouncementData({...announcementData, event_date: e.target.value})}
                     required={announcementData.announcement_type === 'event'}
                   />
                 </div>
                 <div>
                   <Label htmlFor="edit_event_time">Time</Label>
                   <Input
                     id="edit_event_time"
                     type="time"
                     value={announcementData.event_time}
                     onChange={(e) => setAnnouncementData({...announcementData, event_time: e.target.value})}
                   />
                 </div>
               </div>
               <div>
                 <Label htmlFor="edit_location">Location</Label>
                 <Input
                   id="edit_location"
                   type="text"
                   value={announcementData.location}
                   onChange={(e) => setAnnouncementData({...announcementData, location: e.target.value})}
                   placeholder="e.g., Room 101, Zoom link, etc."
                 />
               </div>
             </div>
           )}

           <div className="flex items-center space-x-4">
             <label className="flex items-center space-x-2">
               <input
                 type="checkbox"
                 checked={announcementData.is_pinned}
                 onChange={(e) => setAnnouncementData({...announcementData, is_pinned: e.target.checked})}
                 className="rounded"
               />
               <span className="text-sm">📌 Pin this announcement</span>
             </label>
             
             <label className="flex items-center space-x-2">
               <input
                 type="checkbox"
                 checked={announcementData.is_published}
                 onChange={(e) => setAnnouncementData({...announcementData, is_published: e.target.checked})}
                 className="rounded"
               />
               <span className="text-sm">✅ Publish immediately</span>
             </label>
           </div>

           <div className="flex justify-end space-x-2">
             <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
               Cancel
             </Button>
             <Button type="submit">
               Update Announcement
             </Button>
           </div>
         </form>
       </DialogContent>
     </Dialog>
     
    </AuthWrapper>
   )
}
