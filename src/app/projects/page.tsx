"use client"

import { useState } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { FolderKanban, Plus, Search, Calendar, Users, MoreHorizontal, Star, MapPin, HardHat, Building, Hammer, AlertTriangle, CheckCircle, Clock, Pause } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  name: string
  location: string
  description: string
  status: "Pre-construction" | "In Progress" | "On Hold" | "Substantially Complete" | "Completed"
  priority: "high" | "medium" | "low"
  progress: number
  dueDate: string
  teamMembers: number
  tasksCompleted: number
  totalTasks: number
  isStarred: boolean
  tasksByStatus: {
    todo: number
    inProgress: number
    review: number
    done: number
  }
  trades: string[]
  siteSupervisor: string
  criticalPathTasks: number
}

export default function ProjectsPage() {
  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "Downtown Office Tower",
      location: "123 Main St, Metropolis",
      description: "Construction of a 40-story commercial office building with retail space.",
      status: "In Progress",
      priority: "high",
      progress: 45,
      dueDate: "Jun 15, 2026",
      teamMembers: 25,
      tasksCompleted: 88,
      totalTasks: 210,
      isStarred: true,
      tasksByStatus: {
        todo: 45,
        inProgress: 77,
        review: 15,
        done: 73
      },
      trades: ["Structural", "Electrical", "Plumbing", "HVAC", "Finishes"],
      siteSupervisor: "David Chen",
      criticalPathTasks: 12
    },
    {
      id: "2",
      name: "Greenwood Residential Complex",
      location: "456 Oak Ave, Suburbia",
      description: "Development of a 150-unit residential complex with community amenities.",
      status: "In Progress",
      priority: "high",
      progress: 65,
      dueDate: "Dec 1, 2025",
      teamMembers: 18,
      tasksCompleted: 112,
      totalTasks: 180,
      isStarred: false,
      tasksByStatus: {
        todo: 25,
        inProgress: 43,
        review: 12,
        done: 100
      },
      trades: ["Framing", "Electrical", "Plumbing", "Drywall", "Flooring"],
      siteSupervisor: "Sarah Johnson",
      criticalPathTasks: 8
    },
    {
      id: "3",
      name: "Highway 101 Overpass",
      location: "Highway 101 & Route 5",
      description: "Seismic retrofitting and expansion of the existing highway overpass.",
      status: "Pre-construction",
      priority: "medium",
      progress: 10,
      dueDate: "Sep 1, 2026",
      teamMembers: 12,
      tasksCompleted: 5,
      totalTasks: 150,
      isStarred: true,
      tasksByStatus: {
        todo: 135,
        inProgress: 10,
        review: 0,
        done: 5
      },
      trades: ["Civil", "Structural", "Concrete", "Steel"],
      siteSupervisor: "Michael Torres",
      criticalPathTasks: 15
    },
    {
      id: "4",
      name: "Metropolis General Hospital Wing",
      location: "789 Health Blvd, Metropolis",
      description: "New west wing addition to the main hospital, including surgical suites.",
      status: "Completed",
      priority: "high",
      progress: 100,
      dueDate: "Nov 20, 2024",
      teamMembers: 30,
      tasksCompleted: 250,
      totalTasks: 250,
      isStarred: false,
      tasksByStatus: {
        todo: 0,
        inProgress: 0,
        review: 0,
        done: 250
      },
      trades: ["Medical Equipment", "HVAC", "Electrical", "Fire Safety", "Finishes"],
      siteSupervisor: "Jennifer Lee",
      criticalPathTasks: 0
    },
    {
      id: "5",
      name: "Coastal Warehouse Facility",
      location: "12 Industrial Way, Port City",
      description: "Construction of a 500,000 sq. ft. logistics and warehouse facility.",
      status: "On Hold",
      priority: "medium",
      progress: 20,
      dueDate: "Feb 15, 2026",
      teamMembers: 15,
      tasksCompleted: 25,
      totalTasks: 130,
      isStarred: false,
      tasksByStatus: {
        todo: 95,
        inProgress: 10,
        review: 0,
        done: 25
      },
      trades: ["Site Work", "Concrete", "Steel", "Roofing"],
      siteSupervisor: "Carlos Ramirez",
      criticalPathTasks: 6
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-green-100 text-green-800 border-green-200"
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Substantially Complete":
        return "bg-sky-100 text-sky-800 border-sky-200"
      case "On Hold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Pre-construction":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const activeProjects = projects.filter((p) => p.status === "In Progress")
  const completedProjects = projects.filter((p) => p.status === "Completed")

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div>
            <h1 className="font-semibold">Construction Sites</h1>
            <p className="text-sm text-muted-foreground">{activeProjects.length} active sites • {projects.reduce((acc, p) => acc + p.criticalPathTasks, 0)} critical tasks</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search projects..." className="w-[300px] pl-8" />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* Construction Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{activeProjects.length}</div>
                  <div className="text-sm text-gray-600">Active Sites</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <HardHat className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {projects.reduce((acc, p) => acc + p.teamMembers, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Crew</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {projects.reduce((acc, p) => acc + p.criticalPathTasks, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Critical Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {projects.reduce((acc, p) => acc + p.tasksByStatus.inProgress, 0)}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id}>
              <Card className="hover:shadow-md transition-shadow flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5 text-blue-600" />
                      {project.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 pt-2">{project.description}</p>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getStatusColor(project.status)}`}>{project.status}</Badge>
                    <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>{project.priority}</Badge>
                    {project.criticalPathTasks > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {project.criticalPathTasks} Critical
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>

                  {/* Task Status Breakdown */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Task Summary</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>To Do: {project.tasksByStatus.todo}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>In Progress: {project.tasksByStatus.inProgress}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Review: {project.tasksByStatus.review}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Done: {project.tasksByStatus.done}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <HardHat className="h-4 w-4" />
                      <span>Supervisor: {project.siteSupervisor}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Hammer className="h-4 w-4" />
                      <span>Trades: {project.trades.slice(0, 2).join(", ")}{project.trades.length > 2 ? ` +${project.trades.length - 2}` : ""}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{project.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{project.teamMembers} Crew</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </SidebarInset>
  )
}
