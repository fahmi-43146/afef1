import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { UserProvider } from "@/lib/hooks/use-user"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Professor Afef Najjari Course Management",
  description: "Course management system for professors and students",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <Navigation />
          {children}
        </UserProvider>
      </body>
    </html>
  )
}
