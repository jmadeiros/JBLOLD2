"use client"

import { SidebarInset } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { StatCard } from "@/components/ui/stat-card"
import { ActiveSites } from "@/components/active-sites"
import { WorkersToday } from "@/components/workers-today"
import { AIConstructionAssistant } from "@/components/ai-construction-assistant"
import { UpcomingMilestones } from "@/components/upcoming-milestones"
import {
  Building2,
  Users,
} from "lucide-react"

export default function DashboardPage() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div>
            <h1 className="font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back! Here's what's happening with your projects today.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        {/* Simplified Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="Active Sites"
            value="12"
            icon={Building2}
            iconColor="bg-blue-500"
            trend={{ value: "+5%", isPositive: true }}
          />
          <StatCard
            title="Total Workers"
            value="248"
            icon={Users}
            iconColor="bg-green-500"
            trend={{ value: "+12.3%", isPositive: true }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ActiveSites />
            <AIConstructionAssistant />
          </div>

          {/* Right Column - Sidebar Content */}
          <div className="space-y-6">
            <WorkersToday />
            <UpcomingMilestones />
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
