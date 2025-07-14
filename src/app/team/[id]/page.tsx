"use client"

import { useState, useEffect } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Mail, Phone, MapPin, Award, CheckCircle, Clock, TrendingUp, FolderKanban, DollarSign, Calculator, BarChart3 } from "lucide-react"
import Link from "next/link"
import type { Task } from "../../../../types/task"
import { formatCurrency } from "@/lib/cvc-utils"

// Mock data - in a real app, this would be fetched from an API
const allTeamMembers = [
  {
    id: "1",
    name: "David Chen",
    email: "david.chen@construction.co",
    role: "Project Manager",
    department: "Management",
    status: "active",
    avatar: "/placeholder.svg?height=128&width=128",
    phone: "+1 (555) 123-4567",
    location: "On-site Office",
    joinDate: "Jan 2020",
    activeTasks: 2,
    completedTasks: 142,
  },
  // ... other team members
]

const allTasks: Task[] = [
  {
    id: "3",
    title: "Weekly Safety Inspection",
    completed: true,
    priority: "high",
    status: "done",
    assignee: "David Chen",
    createdAt: new Date(2024, 11, 15),
    updatedAt: new Date(2024, 11, 15),
    dueDate: new Date(2024, 11, 15),
    projectId: "1",
    projectName: "Downtown Office Tower",
    cvc: {
      estimatedContributionValue: 2500,
      costs: {
        labourCost: 800,
        materialsCost: 300,
        equipmentCost: 200,
        travelAccommodation: 50,
        subcontractorFees: 0,
        bonusesAdjustments: 0,
      },
      totalCost: 1350,
      cvcScore: 1150,
      cvcPercentage: 46.0,
      isNegative: false,
      hoursLogged: 35.5,
      hourlyRate: 22
    },
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
    dueDate: new Date(2024, 11, 29),
    projectId: "1",
    projectName: "Downtown Office Tower",
    cvc: {
      estimatedContributionValue: 1200,
      costs: {
        labourCost: 400,
        materialsCost: 100,
        equipmentCost: 50,
        travelAccommodation: 0,
        subcontractorFees: 0,
        bonusesAdjustments: 0,
      },
      totalCost: 550,
      cvcScore: 650,
      cvcPercentage: 54.17,
      isNegative: false,
      hoursLogged: 18.2,
      hourlyRate: 22
    },
  },
  {
    id: "9",
    title: "Coordinate with city inspector",
    completed: true,
    priority: "high",
    status: "done",
    assignee: "David Chen",
    createdAt: new Date(2024, 11, 20),
    updatedAt: new Date(2024, 11, 22),
    dueDate: new Date(2024, 11, 21), // Late
  },
  {
    id: "10",
    title: "Review structural engineering plans",
    completed: false,
    priority: "medium",
    status: "in-progress",
    assignee: "David Chen",
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
]

const timesheetData = [
  { id: 1, projectId: "1", date: "2025-07-07", hoursWorked: 8.5, hoursBudgeted: 8 },
  { id: 2, projectId: "1", date: "2025-07-08", hoursWorked: 9, hoursBudgeted: 8 },
  { id: 3, projectId: "2", date: "2025-07-09", hoursWorked: 7.5, hoursBudgeted: 8 },
  { id: 4, projectId: "1", date: "2025-07-10", hoursWorked: 8, hoursBudgeted: 8 },
  { id: 5, projectId: "2", date: "2025-07-11", hoursWorked: 8, hoursBudgeted: 8 },
]

interface PerformanceMetrics {
  onTimeCompletionRate: number
  budgetAdherence: number
  overallScore: number
}

export default function TeamMemberProfilePage({ params }: { params: { id: string } }) {
  const [member, setMember] = useState(allTeamMembers.find((m) => m.id === params.id))
  const [tasks, setTasks] = useState(allTasks.filter((t) => t.assignee === member?.name))
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    if (member) {
      // Calculate On-Time Completion Rate
      const completedTasksWithDueDate = tasks.filter((t) => t.completed && t.dueDate)
      const onTimeTasks = completedTasksWithDueDate.filter((t) => t.updatedAt <= t.dueDate!)
      const onTimeRate =
        completedTasksWithDueDate.length > 0 ? (onTimeTasks.length / completedTasksWithDueDate.length) * 100 : 100

      // Calculate Budget Adherence from Timesheets
      const totalHoursWorked = timesheetData.reduce((acc, entry) => acc + entry.hoursWorked, 0)
      const totalHoursBudgeted = timesheetData.reduce((acc, entry) => acc + entry.hoursBudgeted, 0)
      const budgetAdherenceRate =
        totalHoursWorked > 0 ? Math.max(0, (totalHoursBudgeted / totalHoursWorked) * 100) : 100

      // Calculate Overall Score (weighted)
      const overall = onTimeRate * 0.6 + budgetAdherenceRate * 0.4

      setMetrics({
        onTimeCompletionRate: Math.round(onTimeRate),
        budgetAdherence: Math.round(budgetAdherenceRate),
        overallScore: Math.round(overall),
      })
    }
  }, [member, tasks])

  if (!member) {
    return (
      <SidebarInset>
        <div className="flex-1 p-6 text-center">
          <h1 className="text-2xl font-bold">Team Member not found</h1>
          <Link href="/team">
            <Button variant="link">Go back to team page</Button>
          </Link>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/team">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold">{member.name}'s Profile</h1>
            <p className="text-sm text-muted-foreground">{member.role}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Performance Metrics
                <Badge className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Score: {metrics?.overallScore ?? "N/A"}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Overall score is a weighted average of key performance indicators.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" /> On-Time Task Completion
                  </h4>
                  <span className="font-bold text-lg">{metrics?.onTimeCompletionRate}%</span>
                </div>
                <Progress value={metrics?.onTimeCompletionRate} />
                <p className="text-xs text-muted-foreground">Percentage of tasks completed by their due date.</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" /> Budget Adherence
                  </h4>
                  <span className="font-bold text-lg">{metrics?.budgetAdherence}%</span>
                </div>
                <Progress value={metrics?.budgetAdherence} />
                <p className="text-xs text-muted-foreground">
                  Percentage of hours worked against budgeted hours from timesheets.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CVC Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                CVC Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* CVC Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">
                      <DollarSign className="h-5 w-5" />
                      {formatCurrency(
                        tasks.reduce((sum, task) => sum + (task.cvc?.cvcScore || 0), 0)
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Total CVC Value</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(
                        tasks.reduce((sum, task) => sum + (task.cvc?.cvcPercentage || 0), 0) / 
                        tasks.filter(t => t.cvc).length
                      )}%
                    </div>
                    <p className="text-sm text-muted-foreground">Avg CVC Percentage</p>
                  </div>
                </div>

                {/* Task Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Task CVC Breakdown</h4>
                  {tasks.filter(t => t.cvc).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.cvc?.hoursLogged || 0}h logged
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={task.cvc?.isNegative ? "destructive" : "default"}>
                          {formatCurrency(task.cvc?.cvcScore || 0)}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {task.cvc?.cvcPercentage || 0}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks
                  .filter((t) => !t.completed)
                  .map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <FolderKanban className="h-3 w-3" />
                          <span>{task.projectName}</span>
                        </div>
                      </div>
                      <Badge variant="secondary">{task.status}</Badge>
                    </div>
                  ))}
                {tasks.filter((t) => !t.completed).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No active tasks.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={member.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{member.name}</CardTitle>
                <p className="text-muted-foreground">{member.department}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${member.email}`} className="hover:underline">
                  {member.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{member.location}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Timesheet Summary
              </CardTitle>
              <p className="text-sm text-muted-foreground">Last 5 entries.</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timesheetData.map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium">Project {entry.projectId}</p>
                      <p className="text-xs text-muted-foreground">{entry.date}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          entry.hoursWorked > entry.hoursBudgeted ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {entry.hoursWorked}h
                      </p>
                      <p className="text-xs text-muted-foreground">({entry.hoursBudgeted}h budgeted)</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills & Certifications</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="outline">OSHA 30</Badge>
              <Badge variant="outline">Project Management Professional (PMP)</Badge>
              <Badge variant="outline">First Aid/CPR</Badge>
              <Badge variant="outline">Procore Certified</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
