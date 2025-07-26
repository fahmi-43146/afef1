import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./client"

// Server-side Supabase client (for use in server components)
export const createServerSupabaseClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

// Alternative export for consistency (same function, different name)
export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

// Helper function to get user session on server
export async function getServerSession() {
  const supabase = createServerSupabaseClient()

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error)
      return null
    }

    return session
  } catch (error) {
    console.error("Error in getServerSession:", error)
    return null
  }
}

// Helper function to get user profile on server
export async function getServerProfile(userId: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error getting profile:", error)
      return null
    }

    return profile
  } catch (error) {
    console.error("Error in getServerProfile:", error)
    return null
  }
}