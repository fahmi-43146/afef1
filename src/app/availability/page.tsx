"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Video, MessageCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/client"
import { useUser } from "@/lib/hooks/use-user"

type AvailabilitySlot = Database['public']['Tables']['availability_slots']['Row']
type Announcement = Database['public']['Tables']['announcements']['Row']

export default function AvailabilityPage() {
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true)
  const { user } = useUser()
  const supabase = createClient()

  useEffect(() => {
    fetchAvailabilitySlots()
    fetchAnnouncements()
  }, [])

  const fetchAvailabilitySlots = async () => {
    setIsLoading(true)
    try {
      console.log('🔍 Fetching public availability slots...')
      
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .gte('start_time', new Date().toISOString()) // Only future slots
        .eq('is_active', true)
        .order('start_time', { ascending: true })

      console.log('📊 Public availability response:', { data, error, count: data?.length })

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
      setIsLoading(false)
    }
  }

  const fetchAnnouncements = async () => {
    setIsLoadingAnnouncements(true)
    try {
      console.log('🔍 Fetching announcements...')
      
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          profiles!announcements_author_id_fkey(full_name)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5)

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

  const groupSlotsByDay = (slots: AvailabilitySlot[]) => {
    const grouped: { [key: string]: AvailabilitySlot[] } = {}
    
    slots.forEach(slot => {
      const date = new Date(slot.start_time)
      const dayKey = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      
      if (!grouped[dayKey]) {
        grouped[dayKey] = []
      }
      grouped[dayKey].push(slot)
    })
    
    return grouped
  }

  const groupedSlots = groupSlotsByDay(availabilitySlots)
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Professor Availability</h1>
        <p className="text-gray-600">Schedule meetings and check office hours</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Weekly Schedule
              </CardTitle>
              <CardDescription>Current week availability and office hours</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading availability...</span>
                </div>
              ) : Object.keys(groupedSlots).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Availability Yet</h3>
                  <p>Check back later for updated professor availability.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedSlots).map(([day, slots]) => (
                    <div key={day}>
                      <h3 className="font-semibold text-lg text-gray-900 mb-3">{day}</h3>
                      <div className="grid gap-3">
                        {slots.map((slot) => {
                          const startTime = new Date(slot.start_time)
                          const endTime = new Date(slot.end_time)
                          const timeString = `${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                          const isAvailable = slot.is_active
                          
                          return (
                            <div
                              key={slot.id}
                              className={`flex items-center justify-between p-4 rounded-lg border ${
                                isAvailable ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <Clock className="w-4 h-4 text-gray-600" />
                                <div>
                                  <div className="font-medium">{timeString}</div>
                                  <div className="text-sm text-gray-900 font-medium">{slot.title}</div>
                                  {slot.description && (
                                    <div className="text-xs text-gray-500">{slot.description}</div>
                                  )}
                                  <div className="text-sm text-gray-600 flex items-center mt-1">
                                    {slot.virtual_link || slot.location?.includes('Zoom') || slot.location?.includes('Virtual') ? (
                                      <Video className="w-3 h-3 mr-1" />
                                    ) : (
                                      <MapPin className="w-3 h-3 mr-1" />
                                    )}
                                    {slot.location}
                                    {slot.virtual_link && (
                                      <a href={slot.virtual_link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 text-xs hover:underline">
                                        Join Link
                                      </a>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Max {slot.max_bookings || 1} booking{(slot.max_bookings || 1) > 1 ? 's' : ''}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={isAvailable ? "default" : "secondary"}
                                  className={isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                                                                  >
                                    {isAvailable ? "Available" : "Full"}
                                  </Badge>
                                {isAvailable && user && (
                                  <Button size="sm">Book Slot</Button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Contact</CardTitle>
              <CardDescription>Get in touch immediately</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-transparent" variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                <Video className="w-4 h-4 mr-2" />
                Request Video Call
              </Button>
              <div className="text-sm text-gray-600 mt-4">
                <p>
                  <strong>Email:</strong> prof.smith@university.edu
                </p>
                <p>
                  <strong>Phone:</strong> (555) 123-4567
                </p>
                <p>
                  <strong>Office:</strong> Science Building, Room 204
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Announcements & Events</CardTitle>
              <CardDescription>Latest news, upcoming events, and important deadlines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingAnnouncements ? (
                <div className="text-center py-4 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                  <p className="text-xs">Loading events...</p>
                </div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No announcements yet</p>
                  <p className="text-xs">Check back later for updates</p>
                </div>
              ) : (
                announcements.map((announcement) => {
                  const createdDate = announcement.created_at ? new Date(announcement.created_at) : null
                  const eventDate = announcement.event_date ? new Date(announcement.event_date) : null
                  const isRecent = createdDate && (Date.now() - createdDate.getTime()) < 7 * 24 * 60 * 60 * 1000 // Within 7 days
                  const today = new Date()
                  const daysLeft = eventDate ? Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null
                  
                  const getTypeIcon = (type: string) => {
                    switch(type) {
                      case 'event': return '📅'
                      case 'deadline': return '⚠️'
                      case 'update': return '📝'
                      default: return '📢'
                    }
                  }
                  
                  const getBorderColor = (importance: string) => {
                    switch(importance) {
                      case 'urgent': return 'border-red-500'
                      case 'high': return 'border-orange-500'
                      case 'low': return 'border-green-500'
                      default: return 'border-blue-500'
                    }
                  }
                  
                  return (
                    <div key={announcement.id} className={`border-l-4 ${getBorderColor(announcement.importance_level || 'normal')} pl-4`}>
                      <div className="font-medium text-sm flex items-center">
                        <span className="mr-2">{getTypeIcon(announcement.announcement_type || 'announcement')}</span>
                        {announcement.title}
                        {announcement.is_pinned && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">📌 Pinned</span>
                        )}
                        {isRecent && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">🆕 New</span>
                        )}
                        {announcement.importance_level === 'urgent' && (
                          <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded animate-pulse">🚨 URGENT</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {announcement.content}
                      </div>
                      
                      {/* Event details */}
                      {announcement.event_date && (
                        <div className="text-xs text-blue-600 mt-1">
                          📅 {eventDate?.toLocaleDateString()}
                          {announcement.event_time && ` at ${announcement.event_time}`}
                          {daysLeft !== null && (
                            <span className={`ml-2 px-2 py-0.5 rounded font-medium ${
                              daysLeft < 0 ? 'bg-red-100 text-red-700' :
                              daysLeft === 0 ? 'bg-yellow-100 text-yellow-700' :
                              daysLeft <= 3 ? 'bg-orange-100 text-orange-700' :
                              daysLeft <= 7 ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {daysLeft < 0 ? `${Math.abs(daysLeft)} days ago` :
                               daysLeft === 0 ? 'TODAY!' :
                               daysLeft === 1 ? 'Tomorrow' :
                               `${daysLeft} days left`}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {announcement.location && (
                        <div className="text-xs text-gray-600 mt-1 flex items-center">
                          {announcement.location.toLowerCase().includes('zoom') || 
                           announcement.location.toLowerCase().includes('virtual') || 
                           announcement.location.toLowerCase().includes('online') ? (
                            <Video className="w-3 h-3 mr-1" />
                          ) : (
                            <MapPin className="w-3 h-3 mr-1" />
                          )}
                          {announcement.location}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400 mt-1">
                        <div>
                          Posted: {createdDate?.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
