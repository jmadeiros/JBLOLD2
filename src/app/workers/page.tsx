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
import { Search, Mail, MapPin, UserPlus, Award, TrendingUp, DollarSign, Calculator, Clock, CheckCircle, Users } from "lucide-react"
import type { Task } from "../../../types/task"
import type { Tradesperson, WeeklyAssessment, TimesheetEntry, TradesPersonPerformance } from "../../../types/tradesperson"
import { formatCurrency, formatPercentage } from "@/lib/cvc-utils"
import { TeamLeaderboard } from "@/components/workers/team-leaderboard"
import { WeeklyAssessmentForm } from "@/components/workers/weekly-assessment-form"
import { TimesheetManager } from "@/components/workers/timesheet-manager"
import { toast } from "sonner"
import Link from "next/link"

// NOTE: In a real app, this data would come from APIs
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

// Mock data for new tradesperson system
const MOCK_TRADESPEOPLE: Tradesperson[] = [
  {
    id: "tp-1",
    name: "Carlos Ramirez",
    trade: "Concrete",
    supervisorId: "sup-1",
    projectId: "proj-1",
    hourlyRate: 28,
    startDate: "2024-01-15"
  },
  {
    id: "tp-2",
    name: "Maria Garcia",
    trade: "Electrical",
    supervisorId: "sup-1", 
    projectId: "proj-1",
    hourlyRate: 32,
    startDate: "2024-02-01"
  },
  {
    id: "tp-3",
    name: "Frank Miller",
    trade: "HVAC",
    supervisorId: "sup-1",
    projectId: "proj-1", 
    hourlyRate: 30,
    startDate: "2024-03-10"
  },
  {
    id: "tp-4",
    name: "Jake Thompson",
    trade: "Framing",
    supervisorId: "sup-1",
    projectId: "proj-1",
    hourlyRate: 26,
    startDate: "2024-01-20"
  },
  {
    id: "tp-5",
    name: "Sarah Connor",
    trade: "Plumbing", 
    supervisorId: "sup-1",
    projectId: "proj-1",
    hourlyRate: 29,
    startDate: "2024-02-15"
  }
]

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

  // New state for tradesperson system
  const [tradespeople, setTradespeople] = useState<Tradesperson[]>(MOCK_TRADESPEOPLE)
  const [assessments, setAssessments] = useState<WeeklyAssessment[]>([])
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([])
  const [selectedTradesperson, setSelectedTradesperson] = useState<Tradesperson | null>(null)
  const [showAssessmentForm, setShowAssessmentForm] = useState(false)

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

  // Performance calculation for leaderboard
  const calculatePerformances = (): TradesPersonPerformance[] => {
    return tradespeople.map((person, index) => {
      // Get latest assessment
      const personAssessments = assessments.filter(a => a.tradespersonId === person.id)
      const latestAssessment = personAssessments.sort((a, b) => 
        new Date(b.weekEndingDate).getTime() - new Date(a.weekEndingDate).getTime()
      )[0]

      // Calculate average score from recent assessments
      const recentAssessments = personAssessments.slice(0, 4) // Last 4 weeks
      const averageScore = recentAssessments.length > 0 
        ? recentAssessments.reduce((sum, a) => sum + a.overallScore, 0) / recentAssessments.length
        : 7.0 // Default score

      // Calculate weekly hours
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay() + 1)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      const weeklyEntries = timesheets.filter(t => 
        t.tradespersonId === person.id &&
        new Date(t.date) >= startOfWeek &&
        new Date(t.date) <= endOfWeek
      )
      const weeklyHours = weeklyEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0)

      // Mock completion rate calculation (in real app, this would be from actual daily tasks)
      const completionRate = 75 + Math.random() * 25 // 75-100%

      return {
        tradesperson: person,
        latestAssessment,
        averageScore,
        weeklyHours,
        completionRate,
        rank: index + 1 // Will be recalculated when sorted
      }
    }).sort((a, b) => b.averageScore - a.averageScore).map((item, index) => ({
      ...item,
      rank: index + 1
    }))
  }

  // Handler functions
  const handleAssessment = (tradespersonId: string) => {
    const person = tradespeople.find(p => p.id === tradespersonId)
    if (person) {
      setSelectedTradesperson(person)
      setShowAssessmentForm(true)
    }
  }

  const handleSubmitAssessment = (assessment: Omit<WeeklyAssessment, "id" | "createdAt">) => {
    const newAssessment: WeeklyAssessment = {
      ...assessment,
      id: `assessment-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    setAssessments(prev => [...prev, newAssessment])
    toast.success(`Assessment submitted for ${selectedTradesperson?.name}`)
  }

  const handleAddTimesheetEntry = (entry: Omit<TimesheetEntry, "id">) => {
    const newEntry: TimesheetEntry = {
      ...entry,
      id: `timesheet-${Date.now()}`
    }
    setTimesheets(prev => [...prev, newEntry])
    toast.success("Timesheet entry added")
  }

  const handleUpdateTimesheetEntry = (entryId: string, updates: Partial<TimesheetEntry>) => {
    setTimesheets(prev => prev.map(entry => 
      entry.id === entryId ? { ...entry, ...updates } : entry
    ))
    toast.success("Timesheet entry updated")
  }

  const handleApproveTimesheetEntry = (entryId: string) => {
    setTimesheets(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, approved: true, approvedBy: "current-supervisor", approvedAt: new Date().toISOString() }
        : entry
    ))
    toast.success("Timesheet entry approved")
  }

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
            <h1 className="font-semibold">Team Performance Dashboard</h1>
            <p className="text-sm text-muted-foreground">{tradespeople.length} tradespeople • {assessments.length} assessments completed</p>
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
        {/* Performance Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {calculatePerformances().filter(p => p.averageScore >= 8.5).length}
                  </div>
                  <div className="text-sm text-gray-600">Top Performers</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {calculatePerformances().length > 0 ? 
                      (calculatePerformances().reduce((sum, p) => sum + p.averageScore, 0) / calculatePerformances().length).toFixed(1) 
                      : '7.0'}
                  </div>
                  <div className="text-sm text-gray-600">Team Average</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(calculatePerformances().reduce((sum, p) => sum + p.weeklyHours, 0))}h
                  </div>
                  <div className="text-sm text-gray-600">Total Hours This Week</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(calculatePerformances().reduce((sum, p) => sum + p.completionRate, 0) / Math.max(calculatePerformances().length, 1))}%
                  </div>
                  <div className="text-sm text-gray-600">Task Completion</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Performance Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Leaderboard - Main Focus */}
          <div className="lg:col-span-3">
            <TeamLeaderboard 
              performances={calculatePerformances()}
              onViewProfile={(tradespersonId) => {
                // Map tradesperson ID to team member for individual page
                const tradesperson = tradespeople.find(tp => tp.id === tradespersonId)
                if (tradesperson) {
                  // For now, navigate to the first team member's individual page
                  // In a real app, you'd create individual pages for each tradesperson
                  window.location.href = `/team/1` // Placeholder for individual performance page
                }
              }}
            />
          </div>

          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => window.location.href = '/team?tab=timesheets'}>
                  <Clock className="h-4 w-4 mr-2" />
                  Manage Timesheets
                </Button>
                <Button variant="outline" className="w-full">
                  <Award className="h-4 w-4 mr-2" />
                  Weekly Reports
                </Button>
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Add Team Member
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Assessments Due</span>
                    <span className="font-semibold text-orange-600">
                      {tradespeople.length - assessments.filter(a => {
                        const weekStart = new Date()
                        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
                        return new Date(a.weekEndingDate) >= weekStart
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Hours Logged</span>
                    <span className="font-semibold text-green-600">
                      {Math.round(calculatePerformances().reduce((sum, p) => sum + p.weeklyHours, 0))}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overtime Hours</span>
                    <span className="font-semibold text-blue-600">
                      {Math.round(timesheets.reduce((sum, t) => sum + t.overtimeHours, 0))}h
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tradespeople.map((person, index) => {
            const performance = calculatePerformances().find(p => p.tradesperson.id === person.id)
            const completedTasks = Math.floor(Math.random() * 5)
            const pendingTasks = Math.floor(Math.random() * 5) + 1
            const performancePercent = performance?.averageScore ? Math.round(performance.averageScore * 10) : Math.floor(Math.random() * 100)
            const rank = performance?.rank || (index + 1)
            
            // Generate status based on index for demo
            const statusOptions = ['active', 'busy', 'away'] as const
            const status = statusOptions[index % statusOptions.length]
            
            return (
              <Card key={person.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = `/team/1`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-600">
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{person.name}</h3>
                        <p className="text-gray-600 text-sm">{person.trade}</p>
                      </div>
                    </div>
                    <Badge className={`${rank <= 3 ? 'bg-black text-white' : 'bg-gray-600 text-white'} px-3 py-1`}>
                      Rank #{rank}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <Badge className={`text-xs ${
                      status === 'active' ? 'bg-green-100 text-green-800' :
                      status === 'busy' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {person.trade === 'Concrete' ? 'Management' : 
                       person.trade === 'Electrical' || person.trade === 'HVAC' || person.trade === 'Framing' || person.trade === 'Plumbing' ? 'Trades' : 
                       'Engineering'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{person.name.toLowerCase().replace(' ', '.')}</span>@example.com
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{status === 'away' ? 'Off-site' : person.trade === 'Concrete' ? 'Main Office' : 'On-site'}</span>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium flex items-center gap-1">
                          📈 Performance
                        </span>
                        <span className="font-bold text-lg">{performancePercent}%</span>
                      </div>
                      <Progress value={performancePercent} className="h-2 mb-3" />
                      
                      <div className="flex justify-between text-center">
                        <div>
                          <div className="text-xl font-bold text-orange-600">{completedTasks}</div>
                          <div className="text-xs text-gray-500">Completed</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-green-600">{pendingTasks}</div>
                          <div className="text-xs text-gray-500">Pending</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Weekly Assessment Form */}
        {selectedTradesperson && (
          <WeeklyAssessmentForm
            tradesperson={selectedTradesperson}
            onSubmit={handleSubmitAssessment}
            open={showAssessmentForm}
            onOpenChange={setShowAssessmentForm}
          />
        )}
      </div>
    </SidebarInset>
  )
}
