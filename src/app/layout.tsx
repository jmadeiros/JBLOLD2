import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "../components/app-sidebar"
import { cookies } from "next/headers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "TaskFlow - Productivity Suite",
  description: "Efficient task management with Kanban boards",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <main className="flex-1 flex flex-col min-h-screen">{children}</main>
        </SidebarProvider>
      </body>
    </html>
  )
}
