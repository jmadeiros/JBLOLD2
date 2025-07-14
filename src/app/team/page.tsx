"use client"

import { useState, useEffect } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Search, Mail, MapPin, UserPlus, Award, TrendingUp, DollarSign, Calculator } from "lucide-react"
import type { Task } from "../../../types/task"
import { formatCurrency, formatPercentage } from "@/lib/cvc-utils"
import Link from "next/link"

// NOTE: In a real app, this data would come from an API
const allTasks: Task[] = [
  {
    id: "1",
    title: "Foundation Pouring - Sector A",
    completed: true,
    priority: "high",
    status: "done",
    dueDate: new Date(2025, 0, 5),
    assignee: "Carlos Ramirez",
    createdAt: new Date(2024, 11, 20),
    updatedAt: new Date(2025, 0, 4), // On time
    cvc: {
      estimatedContributionValue: 8500,
      costs: {
        labourCost: 1760,
        materialsCost: 2500,
        equipmentCost: 800,
        travelAccommodation: 150,
        subcontractorFees: 1200,
        bonusesAdjustments: 0
      },
      totalCost: 6410,
      cvcScore: 2090,
      cvcPercentage: 24.6,
      isNegative: false,
      hoursLogged: 35.5,
      hourlyRate: 22
    }
  },
  {
    id: "2",
    title: "Electrical Rough-in - Floor 3",
    completed: true,
    priority: "medium",
    status: "done",
    dueDate: new Date(2025, 0, 8),
    assignee: "Maria Garcia",
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2025, 0, 9), // Late
    cvc: {
      estimatedContributionValue: 4500,
      costs: {
        labourCost: 1320,
        materialsCost: 1800,
        equipmentCost: 200,
        travelAccommodation: 100,
        subcontractorFees: 0,
        bonusesAdjustments: 0
      },
      totalCost: 3420,
      cvcScore: 1080,
      cvcPercentage: 24.0,
      isNegative: false,
      hoursLogged: 28.5,
      hourlyRate: 22
    }
  },
  {
    id: "4",
    title: "Install HVAC units on Roof",
    completed: true,
    priority: "high",
    status: "done",
    dueDate: new Date(2024, 11, 30),
    assignee: "Frank Miller",
    createdAt: new Date(2024, 11, 28),
    updatedAt: new Date(2024, 11, 30), // On time
    cvc: {
      estimatedContributionValue: 12000,
      costs: {
        labourCost: 1540,
        materialsCost: 8500,
        equipmentCost: 2500,
        travelAccommodation: 200,
        subcontractorFees: 1800,
        bonusesAdjustments: 500
      },
      totalCost: 15040,
      cvcScore: -3040,
      cvcPercentage: -25.3,
      isNegative: true,
      hoursLogged: 42.0,
      hourlyRate: 22
    }
  },
  {
    id: "5",
    title: "Submit Material Order for Drywall",
    completed: true,
    priority: "low",
    status: "done",
    assignee: "David Chen",
    createdAt: new Date(2024, 11, 10),
    updatedAt: new Date(2024, 11, 28),
    dueDate: new Date(2024, 11, 29), // On time
    cvc: {
      estimatedContributionValue: 600,
      costs: {
        labourCost: 88,
        materialsCost: 0,
        equipmentCost: 0,
        travelAccommodation: 25,
        subcontractorFees: 0,
        bonusesAdjustments: 0
      },
      totalCost: 113,
      cvcScore: 487,
      cvcPercentage: 81.2,
      isNegative: false,
      hoursLogged: 4,
      hourlyRate: 22
    }
  },
  {
    id: "6",
    title: "Plumbing Inspection - Floor 2",
    completed: true,
    priority: "high",
    status: "done",
    assignee: "Carlos Ramirez",
    createdAt: new Date(2024, 11, 25),
    updatedAt: new Date(2024, 11, 27),
    dueDate: new Date(2024, 11, 26), // Late
    cvc: {
      estimatedContributionValue: 1200,
      costs: {
        labourCost: 264,
        materialsCost: 150,
        equipmentCost: 50,
        travelAccommodation: 40,
        subcontractorFees: 200,
        bonusesAdjustments: -50
      },
      totalCost: 654,
      cvcScore: 546,
      cvcPercentage: 45.5,
      isNegative: false,
      hoursLogged: 12,
      hourlyRate: 22
    }
  },
  {
    id: "7",
    title: "Install Windows - Floor 5",
    completed: true,
    priority: "medium",
    status: "done",
    assignee: "Maria Garcia",
    createdAt: new Date(2024, 11, 28),
    updatedAt: new Date(2024, 11, 28),
    dueDate: new Date(2024, 11, 29), // On time
    cvc: {
      estimatedContributionValue: 3200,
      costs: {
        labourCost: 880,
        materialsCost: 1500,
        equipmentCost: 150,
        travelAccommodation: 80,
        subcontractorFees: 0,
        bonusesAdjustments: 0
      },
      totalCost: 2610,
      cvcScore: 590,
      cvcPercentage: 18.4,
      isNegative: false,
      hoursLogged: 20,
      hourlyRate: 22
    }
  },
  {
    id: "8",
    title: "Site Cleanup - Sector B",
    completed: true,
    priority: "low",
    status: "done",
    assignee: "Frank Miller",
    createdAt: new Date(2024, 11, 29),
    updatedAt: new Date(2024, 11, 29),
    // No due date
    cvc: {
      estimatedContributionValue: 800,
      costs: {
        labourCost: 220,
        materialsCost: 100,
        equipmentCost: 80,
        travelAccommodation: 30,
        subcontractorFees: 0,
        bonusesAdjustments: 0
      },
      totalCost: 430,
      cvcScore: 370,
      cvcPercentage: 46.3,
      isNegative: false,
      hoursLogged: 10,
      hourlyRate: 22
    }
  },
]

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  department: "Management" | "Site Crew" | "Engineering" | "Trades"
  status: "active" | "away" | "busy"
  avatar?: string
  phone?: string
  location: string
  joinDate: string
  activeTasks: number
  completedTasks: number
  performanceScore?: number
  rank?: number
  cvcMetrics?: {
    totalCVCValue: number
    averageCVCPercentage: number
    totalContribution: number
    totalCost: number
    totalHours: number
    tasksWithCVC: number
  }
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "David Chen",
      email: "david.chen@construction.co",
      role: "Project Manager",
      department: "Management",
      status: "active",
      phone: "+1 (555) 123-4567",
      location: "On-site Office",
      joinDate: "Jan 2020",
      activeTasks: 2,
      completedTasks: 142,
    },
    {
      id: "2",
      name: "Carlos Ramirez",
      email: "carlos.ramirez@construction.co",
      role: "Site Supervisor",
      department: "Site Crew",
      status: "busy",
      phone: "+1 (555) 234-5678",
      location: "Site - Sector A",
      joinDate: "Mar 2018",
      activeTasks: 4,
      completedTasks: 267,
    },
    {
      id: "3",
      name: "Maria Garcia",
      email: "maria.garcia@construction.co",
      role: "Lead Electrician",
      department: "Trades",
      status: "active",
      phone: "+1 (555) 345-6789",
      location: "Site - Floor 3",
      joinDate: "Jun 2021",
      activeTasks: 3,
      completedTasks: 128,
    },
    {
      id: "4",
      name: "Frank Miller",
      email: "frank.miller@construction.co",
      role: "HVAC Specialist",
      department: "Trades",
      status: "away",
      phone: "+1 (555) 456-7890",
      location: "Off-site",
      joinDate: "Sep 2022",
      activeTasks: 1,
      completedTasks: 85,
    },
    {
      id: "5",
      name: "Sarah Jenkins",
      email: "sarah.jenkins@construction.co",
      role: "Structural Engineer",
      department: "Engineering",
      status: "active",
      phone: "+1 (555) 567-8901",
      location: "Main Office",
      joinDate: "Nov 2019",
      activeTasks: 2,
      completedTasks: 95,
    },
  ])

  useEffect(() => {
    const calculatePerformance = (member: TeamMember): number => {
      const memberTasks = allTasks.filter((task) => task.assignee === member.name && task.completed)
      if (memberTasks.length === 0) return 50 // Default score for no completed tasks

      const tasksWithDueDate = memberTasks.filter((task) => task.dueDate)
      if (tasksWithDueDate.length === 0) return 75 // Higher score if no tasks had deadlines

      const onTimeTasks = tasksWithDueDate.filter(
        (task) => task.updatedAt && task.dueDate && task.updatedAt <= task.dueDate,
      )

      const onTimePercentage = (onTimeTasks.length / tasksWithDueDate.length) * 100

      // Weighted score: 70% on-time completion, 30% total tasks completed (capped)
      const completionScore = Math.min(member.completedTasks / 100, 1) * 100 // Capped at 100 tasks for this metric
      const finalScore = onTimePercentage * 0.7 + completionScore * 0.3

      return Math.round(finalScore)
    }

    const calculateCVCMetrics = (member: TeamMember) => {
      const memberTasks = allTasks.filter((task) => task.assignee === member.name && task.cvc)
      
      if (memberTasks.length === 0) return undefined

      const totalCVCValue = memberTasks.reduce((sum, task) => sum + (task.cvc?.cvcScore || 0), 0)
      const totalContribution = memberTasks.reduce((sum, task) => sum + (task.cvc?.estimatedContributionValue || 0), 0)
      const totalCost = memberTasks.reduce((sum, task) => sum + (task.cvc?.totalCost || 0), 0)
      const totalHours = memberTasks.reduce((sum, task) => sum + (task.cvc?.hoursLogged || 0), 0)
      const averageCVCPercentage = memberTasks.length > 0 
        ? memberTasks.reduce((sum, task) => sum + (task.cvc?.cvcPercentage || 0), 0) / memberTasks.length 
        : 0

      return {
        totalCVCValue,
        averageCVCPercentage,
        totalContribution,
        totalCost,
        totalHours,
        tasksWithCVC: memberTasks.length,
      }
    }

    const rankedMembers = teamMembers
      .map((member) => ({
        ...member,
        performanceScore: calculatePerformance(member),
        cvcMetrics: calculateCVCMetrics(member),
      }))
      .sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0))
      .map((member, index) => ({
        ...member,
        rank: index + 1,
      }))

    setTeamMembers(rankedMembers)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "busy":
        return "bg-red-100 text-red-800 border-red-200"
      case "away":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getStatusColorDot = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500"
      case "busy": return "bg-red-500"
      case "away": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  const getJobDescription = (role: string) => {
    const descriptions: { [key: string]: string } = {
      "Site Supervisor": "Oversees daily operations, crew coordination",
      "Project Manager": "Project oversight, client relations, scheduling",
      "Master Electrician": "Electrical systems, panel installation, wiring",
      "Lead Plumber": "Plumbing installation, pipe fitting, inspections", 
      "HVAC Technician": "Heating, ventilation, air conditioning systems",
      "Concrete Specialist": "Foundation, concrete pours, quality testing",
      "Heavy Equipment Operator": "Excavators, cranes, heavy machinery",
      "Carpenter/Framer": "Framing, drywall, finishing carpentry",
      "Safety Inspector": "Safety compliance, inspections, training",
      "Welder/Ironworker": "Structural steel, welding, metal fabrication",
      "Drywall Specialist": "Drywall installation, taping, finishing"
    }
    return descriptions[role] || "Construction specialist"
  }

  // Drag and drop functionality
  const [draggedMember, setDraggedMember] = useState<TeamMember | null>(null)

  const handleDragStart = (e: React.DragEvent, member: TeamMember) => {
    setDraggedMember(member)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, task: Task) => {
    e.preventDefault()
    if (draggedMember) {
      // "Slot in" functionality - append to existing assignee rather than replace
      const currentAssignee = task.assignee || ""
      const newAssignee = currentAssignee 
        ? `${currentAssignee}, ${draggedMember.name}`
        : draggedMember.name

      // In a real app, this would update the task via API
      console.log(`Adding ${draggedMember.name} to task "${task.title}"`)
      console.log(`Updated assignee: ${newAssignee}`)
      
      // Update the task in the local state (simplified for demo)
      task.assignee = newAssignee
      
      setDraggedMember(null)
      
      // Show a success message or trigger a re-render
      alert(`${draggedMember.name} has been added to the task "${task.title}"`)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const departments = [...new Set(teamMembers.map((member) => member.department))]
  const totalTasks = teamMembers.reduce((acc, member) => acc + member.activeTasks + member.completedTasks, 0)
  const activeTasks = teamMembers.reduce((acc, member) => acc + member.activeTasks, 0)

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div>
            <h1 className="font-semibold">Team</h1>
            <p className="text-sm text-muted-foreground">{teamMembers.length} team members</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search team members..." className="w-[300px] pl-8" />
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{teamMembers.length}</div>
              <div className="text-sm text-gray-600">Team Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{departments.length}</div>
              <div className="text-sm text-gray-600">Departments</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-orange-600">{activeTasks}</div>
              <div className="text-sm text-gray-600">Active Tasks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-600">{totalTasks}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Construction Crew - Drag to Assign Tasks
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Drag team members onto tasks below to add them to assignments. Team members will be added to existing assignments rather than replacing them.
            </p>
          </CardHeader>
        </Card>

        {/* Current Tasks - Drop Zones */}
        <Card>
          <CardHeader>
            <CardTitle>Active Tasks - Drop Team Members Here</CardTitle>
            <p className="text-sm text-muted-foreground">
              Drop team members onto these tasks to assign them. Multiple members can be assigned to the same task.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allTasks.filter(task => !task.completed).slice(0, 5).map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, task)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current assignee: {task.assignee || "Unassigned - Supervisor needs to assign"}
                    </div>
                    {task.dueDate && (
                      <div className="text-xs text-muted-foreground">
                        Due: {task.dueDate.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Drop team member here →
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment Status Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Team Member Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Active - Available for assignment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Busy - Currently assigned to critical tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Away - Off-site or unavailable</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">How to Assign</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>1. Drag a team member from below</div>
                  <div>2. Drop onto a task above</div>
                  <div>3. They'll be added to existing assignments</div>
                  <div>4. Multiple members can work on same task</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Members</TabsTrigger>
            {departments.map((dept) => (
              <TabsTrigger key={dept} value={dept.toLowerCase()}>
                {dept}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-start gap-3 p-3 border rounded-lg cursor-grab hover:bg-muted/50 bg-white shadow-sm transition-all hover:shadow-md"
                  draggable
                  onDragStart={(e) => handleDragStart(e, member)}
                >
                  <div className={`w-4 h-4 rounded-full ${getStatusColorDot(member.status)} mt-0.5 flex-shrink-0`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{member.name}</span>
                      <Badge 
                        className={`text-xs ${
                          member.status === "active" ? "bg-green-100 text-green-800" :
                          member.status === "busy" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {member.status}
                      </Badge>
                    </div>
                    <div className="text-xs font-medium text-blue-700 mb-1">{member.role}</div>
                    <div className="text-xs text-muted-foreground">
                      {getJobDescription(member.role)}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {member.department}
                    </Badge>
                  </div>
                  <div 
                    className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                    onClick={() => window.location.href = `/team/${member.id}`}
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {departments.map((dept) => (
            <TabsContent key={dept.toLowerCase()} value={dept.toLowerCase()} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {teamMembers
                  .filter((member) => member.department === dept)
                  .map((member) => (
                    <div
                      key={member.id}
                      className="flex items-start gap-3 p-3 border rounded-lg cursor-grab hover:bg-muted/50 bg-white shadow-sm transition-all hover:shadow-md"
                      draggable
                      onDragStart={(e) => handleDragStart(e, member)}
                    >
                      <div className={`w-4 h-4 rounded-full ${getStatusColorDot(member.status)} mt-0.5 flex-shrink-0`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">{member.name}</span>
                          <Badge 
                            className={`text-xs ${
                              member.status === "active" ? "bg-green-100 text-green-800" :
                              member.status === "busy" ? "bg-red-100 text-red-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {member.status}
                          </Badge>
                        </div>
                        <div className="text-xs font-medium text-blue-700 mb-1">{member.role}</div>
                        <div className="text-xs text-muted-foreground">
                          {getJobDescription(member.role)}
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {member.department}
                        </Badge>
                      </div>
                      <div 
                        className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                        onClick={() => window.location.href = `/team/${member.id}`}
                      >
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </SidebarInset>
  )
}
