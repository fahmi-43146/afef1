"use client"

import { useUser } from "@/lib/hooks/use-user"
import { Loader2 } from "lucide-react"

interface AuthWrapperProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export default function AuthWrapper({ 
  children, 
  requireAuth = true, 
  redirectTo = "/auth" 
}: AuthWrapperProps) {
  const { user, isLoading } = useUser()
  const isAuthenticated = !!user

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect logic
  if (requireAuth && !isAuthenticated) {
    window.location.href = redirectTo
    return null
  }

  if (!requireAuth && isAuthenticated) {
    window.location.href = "/"
    return null
  }

  return <>{children}</>
} 