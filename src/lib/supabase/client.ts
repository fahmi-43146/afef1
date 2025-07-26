import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Client-side Supabase client (for use in client components)
export const createClient = () => createClientComponentClient<Database>()

// Database types (you can generate these with Supabase CLI)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: "student" | "professor" | "admin"
          avatar_url: string | null
          student_id: string | null
          department: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: "student" | "professor" | "admin"
          avatar_url?: string | null
          student_id?: string | null
          department?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: "student" | "professor" | "admin"
          avatar_url?: string | null
          student_id?: string | null
          department?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chapters: {
        Row: {
          id: number
          title: string
          description: string | null
          content: string | null
          duration: number | null
          order_index: number
          status: "draft" | "scheduled" | "published" | "archived"
          release_date: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          content?: string | null
          duration?: number | null
          order_index: number
          status?: "draft" | "scheduled" | "published" | "archived"
          release_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          content?: string | null
          duration?: number | null
          order_index?: number
          status?: "draft" | "scheduled" | "published" | "archived"
          release_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      availability_slots: {
        Row: {
          id: number
          professor_id: string | null
          title: string
          description: string | null
          slot_type: string | null
          start_time: string
          end_time: string
          location: string | null
          virtual_link: string | null
          max_bookings: number | null
          is_recurring: boolean | null
          recurrence_pattern: string | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: number
          professor_id?: string | null
          title: string
          description?: string | null
          slot_type?: string | null
          start_time: string
          end_time: string
          location?: string | null
          virtual_link?: string | null
          max_bookings?: number | null
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: number
          professor_id?: string | null
          title?: string
          description?: string | null
          slot_type?: string | null
          start_time?: string
          end_time?: string
          location?: string | null
          virtual_link?: string | null
          max_bookings?: number | null
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          is_active?: boolean | null
          created_at?: string | null
        }
      }
      bookings: {
        Row: {
          id: number
          availability_slot_id: number
          student_id: string
          booking_reason: string | null
          status: "confirmed" | "cancelled" | "completed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          availability_slot_id: number
          student_id: string
          booking_reason?: string | null
          status?: "confirmed" | "cancelled" | "completed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          availability_slot_id?: number
          student_id?: string
          booking_reason?: string | null
          status?: "confirmed" | "cancelled" | "completed"
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: number
          title: string
          content: string
          author_id: string | null
          is_pinned: boolean | null
          is_published: boolean | null
          published_at: string | null
          created_at: string | null
          updated_at: string | null
          event_date: string | null
          event_time: string | null
          location: string | null
          importance_level: 'low' | 'normal' | 'high' | 'urgent' | null
          announcement_type: 'announcement' | 'event' | 'deadline' | 'update' | null
        }
        Insert: {
          id?: number
          title: string
          content: string
          author_id?: string | null
          is_pinned?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          event_date?: string | null
          event_time?: string | null
          location?: string | null
          importance_level?: 'low' | 'normal' | 'high' | 'urgent' | null
          announcement_type?: 'announcement' | 'event' | 'deadline' | 'update' | null
        }
        Update: {
          id?: number
          title?: string
          content?: string
          author_id?: string | null
          is_pinned?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          event_date?: string | null
          event_time?: string | null
          location?: string | null
          importance_level?: 'low' | 'normal' | 'high' | 'urgent' | null
          announcement_type?: 'announcement' | 'event' | 'deadline' | 'update' | null
        }
      }
    }
  }
} 