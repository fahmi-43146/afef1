"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Home, Clock, MessageSquare, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/hooks/use-user"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"

export function Navigation() {
  const pathname = usePathname()
  const { user, profile, isLoading } = useUser()
  const supabase = createClient()

  // Filter nav items based on auth state - remove admin link when user is authenticated
  const baseNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/chapters", label: "Chapters", icon: BookOpen },
    { href: "/availability", label: "Availability", icon: Clock },
    { href: "/feedback", label: "Feedback", icon: MessageSquare },
  ]
  
  // Only show admin link in main nav when user is not authenticated
  const navItems = user 
    ? baseNavItems 
    : [...baseNavItems, { href: "/admin", label: "Admin", icon: Settings }]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Dr Najjari Class</span>
          </Link>

          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Info / Auth */}
          <div className="flex items-center space-x-4">
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline-block">
                      {profile.full_name || profile.email}
                      {profile.role === 'admin' && (
                        <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Admin</span>
                      )}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem 
                      onClick={() => window.location.href = "/admin"}
                      className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => window.location.href = "/profile"}
                    className="cursor-pointer hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="cursor-pointer hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 0v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !isLoading ? (
              <Button variant="outline" onClick={() => window.location.href = "/auth"}>
                Sign In
              </Button>
            ) : null}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
