"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, Save, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/client"

type Chapter = Database['public']['Tables']['chapters']['Row']
type ChapterInsert = Database['public']['Tables']['chapters']['Insert']
type ChapterUpdate = Database['public']['Tables']['chapters']['Update']

interface ChapterFormProps {
  onChapterCreated?: (chapter: Chapter) => void
  onChapterUpdated?: (chapter: Chapter) => void
  onChapterDeleted?: (chapterId: number) => void
}

export default function ChapterForm({ onChapterCreated, onChapterUpdated, onChapterDeleted }: ChapterFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [newChapter, setNewChapter] = useState<Partial<ChapterInsert>>({
    title: "",
    description: "",
    content: "",
    duration: null,
    order_index: 0,
    status: "draft",
    release_date: null,
  })

  const supabase = createClient()

  // Fetch chapters on component mount
  useEffect(() => {
    fetchChapters()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('chapters_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chapters' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newChapter = payload.new as Chapter
            setChapters(prev => [...prev, newChapter].sort((a, b) => a.order_index - b.order_index))
            onChapterCreated?.(newChapter)
          } else if (payload.eventType === 'UPDATE') {
            const updatedChapter = payload.new as Chapter
            setChapters(prev => prev.map(ch => ch.id === updatedChapter.id ? updatedChapter : ch))
            onChapterUpdated?.(updatedChapter)
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id as number
            setChapters(prev => prev.filter(ch => ch.id !== deletedId))
            onChapterDeleted?.(deletedId)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchChapters = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setChapters(data || [])
    } catch (error) {
      console.error('Error fetching chapters:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChapter.title) return

    setIsSaving(true)
    try {
      // Calculate next order index
      const maxOrder = chapters.length > 0 ? Math.max(...chapters.map(ch => ch.order_index)) : 0
      
      const chapterData: ChapterInsert = {
        ...newChapter,
        title: newChapter.title!,
        order_index: maxOrder + 1,
        duration: newChapter.duration || null,
        release_date: newChapter.release_date || null,
      }

      const { data, error } = await supabase
        .from('chapters')
        .insert([chapterData])
        .select()
        .single()

      if (error) throw error

      // Reset form
      setNewChapter({
        title: "",
        description: "",
        content: "",
        duration: null,
        order_index: 0,
        status: "draft",
        release_date: null,
      })

      // Optimistic update (real-time will also update)
      setChapters(prev => [...prev, data].sort((a, b) => a.order_index - b.order_index))
      
    } catch (error) {
      console.error('Error creating chapter:', error)
      alert('Failed to create chapter. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateChapter = async (chapterId: number, updates: ChapterUpdate) => {
    try {
      const { error } = await supabase
        .from('chapters')
        .update(updates)
        .eq('id', chapterId)

      if (error) throw error
      
      setEditingChapter(null)
    } catch (error) {
      console.error('Error updating chapter:', error)
      alert('Failed to update chapter. Please try again.')
    }
  }

  const handleDeleteChapter = async (chapterId: number) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return

    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting chapter:', error)
      alert('Failed to delete chapter. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-orange-100 text-orange-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Create New Chapter Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Create New Chapter
          </CardTitle>
          <CardDescription>Add a new chapter to your course with dynamic features</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateChapter} className="space-y-4">
            <div>
              <Label htmlFor="title">Chapter Title *</Label>
              <Input
                id="title"
                placeholder="Enter chapter title"
                value={newChapter.title || ""}
                onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the chapter"
                value={newChapter.description || ""}
                onChange={(e) => setNewChapter({ ...newChapter, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Chapter content (markdown supported)"
                value={newChapter.content || ""}
                onChange={(e) => setNewChapter({ ...newChapter, content: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g., 45"
                  value={newChapter.duration || ""}
                  onChange={(e) => setNewChapter({ 
                    ...newChapter, 
                    duration: e.target.value ? parseInt(e.target.value) : null 
                  })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={newChapter.status || "draft"}
                  onChange={(e) => setNewChapter({ 
                    ...newChapter, 
                    status: e.target.value as "draft" | "scheduled" | "published" | "archived"
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="draft">📝 Draft</option>
                  <option value="scheduled">📅 Scheduled</option>
                  <option value="published">✅ Published</option>
                  <option value="archived">📦 Archived</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="releaseDate">Release Date</Label>
              <Input
                id="releaseDate"
                type="datetime-local"
                value={newChapter.release_date || ""}
                onChange={(e) => setNewChapter({ ...newChapter, release_date: e.target.value || null })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSaving || !newChapter.title}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Chapter
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Chapters List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Existing Chapters</span>
            <Badge variant="secondary" className="text-sm">
              {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
            </Badge>
          </CardTitle>
          <CardDescription>Manage your published and draft chapters with real-time updates</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading chapters...</span>
            </div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No chapters yet. Create your first chapter!
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                  {editingChapter?.id === chapter.id ? (
                    // Edit Mode - Improved Layout
                    <div className="p-4 space-y-4 bg-blue-50 border-l-4 border-l-blue-500">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={editingChapter.title}
                          onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={editingChapter.description || ""}
                          onChange={(e) => setEditingChapter({ ...editingChapter, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Duration (min)</Label>
                          <Input
                            type="number"
                            value={editingChapter.duration || ""}
                            onChange={(e) => setEditingChapter({ 
                              ...editingChapter, 
                              duration: e.target.value ? parseInt(e.target.value) : null 
                            })}
                          />
                        </div>
                        <div>
                          <Label>Status</Label>
                          <select
                            value={editingChapter.status}
                            onChange={(e) => setEditingChapter({ 
                              ...editingChapter, 
                              status: e.target.value as "draft" | "scheduled" | "published" | "archived"
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="draft">📝 Draft</option>
                            <option value="scheduled">📅 Scheduled</option>
                            <option value="published">✅ Published</option>
                            <option value="archived">📦 Archived</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-3 border-t border-blue-200">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingChapter(null)}
                          className="px-4"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateChapter(editingChapter.id, {
                            title: editingChapter.title,
                            description: editingChapter.description,
                            duration: editingChapter.duration,
                            status: editingChapter.status
                          })}
                          className="px-4 bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode - Improved Layout
                    <div className="p-4 space-y-3">
                      {/* Header Row */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-base text-gray-900 truncate">{chapter.title}</div>
                          {chapter.description && (
                            <div className="text-sm text-gray-600 mt-1 line-clamp-2">{chapter.description}</div>
                          )}
                        </div>
                        <Badge className={`${getStatusColor(chapter.status)} ml-3 flex-shrink-0`}>
                          {chapter.status === 'draft' ? '📝' : 
                           chapter.status === 'scheduled' ? '📅' : 
                           chapter.status === 'published' ? '✅' : '📦'} {chapter.status}
                        </Badge>
                      </div>

                      {/* Chapter Info Row */}
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span className="bg-gray-100 px-2 py-1 rounded">Order: {chapter.order_index}</span>
                        {chapter.duration && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">⏱️ {chapter.duration} min</span>
                        )}
                        {chapter.release_date && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                            📅 {new Date(chapter.release_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                                             {/* Actions Row */}
                       <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                         <div className="flex items-center space-x-2">
                           <label className="text-xs font-medium text-gray-700">Quick Status:</label>
                           <select
                             value={chapter.status}
                             onChange={(e) => handleUpdateChapter(chapter.id, { 
                               status: e.target.value as "draft" | "scheduled" | "published" | "archived"
                             })}
                             className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           >
                             <option value="draft">📝 Draft</option>
                             <option value="scheduled">📅 Scheduled</option>
                             <option value="published">✅ Published</option>
                             <option value="archived">📦 Archived</option>
                           </select>
                         </div>
                         
                         <div className="flex items-center space-x-2 ml-6">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingChapter(chapter)}
                            className="h-8 px-3 text-xs hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteChapter(chapter.id)}
                            className="h-8 px-3 text-xs text-red-600 hover:bg-red-50 hover:border-red-300"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 