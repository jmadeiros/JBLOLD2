import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "../components/app-sidebar"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "TaskFlow - Productivity Suite",
  description: "Efficient task management with Kanban boards",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Default to open for static export (cookies not available)
  const defaultOpen = true

  return (
    <html lang="en">
      <body className={inter.className}>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <main className="flex-1 flex flex-col min-h-screen">{children}</main>
          </SidebarProvider>
          <Toaster />
      </body>
    </html>
  )
}
