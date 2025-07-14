"use client"

import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  Plus,
  FolderKanban,
  FileQuestion,
  Shield,
} from "lucide-react"

export default function DashboardPage() {
  const stats = {
    totalTasks: 124,
    completedTasks: 88,
    inProgress: 28,
    overdue: 4,
    teamMembers: 45,
    activeProjects: 3,
    openRFIs: 5,
    safetyIncidents: 0,
  }

  const recentTasks = [
    { id: 1, title: "Foundation Pouring - Sector A", status: "in-progress", priority: "high" },
    { id: 2, title: "Electrical Rough-in - Floor 3", status: "todo", priority: "medium" },
    { id: 3, title: "Install HVAC units on Roof", status: "review", priority: "high" },
    { id: 4, title: "Submit Material Order for Drywall", status: "done", priority: "low" },
  ]

  const upcomingDeadlines = [
    { task: "Structural Steel Delivery", date: "Jan 5, 2025", priority: "high" },
    { task: "Client Walkthrough - Phase 1", date: "Jan 8, 2025", priority: "medium" },
    { task: "City Plumbing Inspection", date: "Jan 10, 2025", priority: "high" },
  ]

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div>
            <h1 className="font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back! Here's your project overview</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">Active work</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <Progress value={(stats.completedTasks / stats.totalTasks) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stats.teamMembers} crew members</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Activity
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={task.status === "done" ? "default" : "secondary"} className="text-xs">
                        {task.status}
                      </Badge>
                      <Badge
                        variant={
                          task.priority === "high"
                            ? "destructive"
                            : task.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingDeadlines.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.task}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <Badge
                    variant={
                      item.priority === "high" ? "destructive" : item.priority === "medium" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Site Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Status</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <FileQuestion className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.openRFIs}</p>
                  <p className="text-sm text-muted-foreground">Open RFIs</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.safetyIncidents}</p>
                  <p className="text-sm text-muted-foreground">Safety Incidents (Month)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Plus className="h-6 w-6" />
                  New Task
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Users className="h-6 w-6" />
                  Toolbox Talk
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <BarChart3 className="h-6 w-6" />
                  View Reports
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <FileQuestion className="h-6 w-6" />
                  Submit RFI
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
