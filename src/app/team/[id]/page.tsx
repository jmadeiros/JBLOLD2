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
import { ArrowLeft, Mail, Phone, MapPin, Award, CheckCircle, Clock, TrendingUp, FolderKanban, Star, Calendar, ClipboardList } from "lucide-react"
import Link from "next/link"
import type { WeeklyAssessment } from "../../../../types/tradesperson"

// Mock data - in a real app, this would be fetched from an API
const allTeamMembers = [
  {
    id: "1",
    name: "Mike Johnson",
    email: "mike.johnson@construction.co",
    role: "Electrical Specialist",
    department: "Electrical",
    status: "active",
    avatar: "/placeholder.svg?height=128&width=128",
    phone: "+1 (555) 123-4567",
    location: "Site - Floor 2",
    joinDate: "Jan 2020",
    activeTasks: 3,
    completedTasks: 87,
    trade: "Electrical"
  },
  {
    id: "2", 
    name: "Sarah Williams",
    email: "sarah.williams@construction.co",
    role: "Plumbing Specialist",
    department: "Plumbing",
    status: "active",
    avatar: "/placeholder.svg?height=128&width=128",
    phone: "+1 (555) 234-5678",
    location: "Site - Floor 3",
    joinDate: "Mar 2021",
    activeTasks: 2,
    completedTasks: 64,
    trade: "Plumbing"
  },
  {
    id: "3",
    name: "Alex Rodriguez",
    email: "alex.rodriguez@construction.co",
    role: "Framing Specialist", 
    department: "Framing",
    status: "busy",
    avatar: "/placeholder.svg?height=128&width=128",
    phone: "+1 (555) 345-6789",
    location: "Site - Ground Floor",
    joinDate: "Jul 2019",
    activeTasks: 4,
    completedTasks: 95,
    trade: "Framing"
  },
  {
    id: "4",
    name: "Emma Thompson",
    email: "emma.thompson@construction.co",
    role: "HVAC Specialist",
    department: "HVAC", 
    status: "away",
    avatar: "/placeholder.svg?height=128&width=128",
    phone: "+1 (555) 456-7890",
    location: "Off-site Training",
    joinDate: "Nov 2022",
    activeTasks: 1,
    completedTasks: 28,
    trade: "HVAC"
  }
]

// Enhanced timesheet data with more details
const timesheetData = [
  { 
    id: 1, 
    projectId: "1", 
    projectName: "Downtown Office Tower",
    date: "2025-01-07", 
    hoursWorked: 8.5, 
    hoursBudgeted: 8,
    taskDescription: "Foundation work - Sector A",
    overtime: 0.5
  },
  { 
    id: 2, 
    projectId: "1", 
    projectName: "Downtown Office Tower",
    date: "2025-01-08", 
    hoursWorked: 9, 
    hoursBudgeted: 8,
    taskDescription: "Electrical rough-in",
    overtime: 1
  },
  { 
    id: 3, 
    projectId: "2", 
    projectName: "Residential Complex",
    date: "2025-01-09", 
    hoursWorked: 7.5, 
    hoursBudgeted: 8,
    taskDescription: "Plumbing installation",
    overtime: 0
  },
  { 
    id: 4, 
    projectId: "1", 
    projectName: "Downtown Office Tower",
    date: "2025-01-10", 
    hoursWorked: 8, 
    hoursBudgeted: 8,
    taskDescription: "Site cleanup",
    overtime: 0
  },
  { 
    id: 5, 
    projectId: "2", 
    projectName: "Residential Complex",
    date: "2025-01-11", 
    hoursWorked: 8, 
    hoursBudgeted: 8,
    taskDescription: "HVAC installation",
    overtime: 0
  },
]

interface PerformanceMetrics {
  onTimeCompletionRate: number
  budgetAdherence: number
  overallScore: number
}

interface TeamMemberProfilePageProps {
  params: Promise<{ id: string }>
}

export default function TeamMemberProfilePage({ params }: TeamMemberProfilePageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [member, setMember] = useState<typeof allTeamMembers[0] | null>(null)
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [assessments, setAssessments] = useState<WeeklyAssessment[]>([])

  // Resolve async params
  useEffect(() => {
    params.then(p => setResolvedParams(p))
  }, [params])

  // Set member when params are resolved
  useEffect(() => {
    if (resolvedParams) {
      const foundMember = allTeamMembers.find((m) => m.id === resolvedParams.id)
      setMember(foundMember || null)
    }
  }, [resolvedParams])

  // Mock assessments data
  useEffect(() => {
    if (member) {
      const mockAssessments: WeeklyAssessment[] = [
        {
          id: "assessment-1",
          tradespersonId: member.id,
          assessedBy: "supervisor-1",
          weekEndingDate: "2024-01-12",
                     scores: {
             punctuality: 9,
             taskCompletion: 8,
             workQuality: 9,
             safety: 10,
             communication: 8,
             problemSolving: 7,
             workplaceOrganisation: 8,
             toolUsage: 9,
             teamwork: 8,
             workErrors: 9
           },
          overallScore: 8.3,
          notes: "Excellent work this week. Shows great leadership potential.",
          createdAt: "2024-01-12T17:00:00Z"
        },
        {
          id: "assessment-2",
          tradespersonId: member.id,
          assessedBy: "supervisor-1",
          weekEndingDate: "2024-01-05",
                     scores: {
             punctuality: 8,
             taskCompletion: 9,
             workQuality: 8,
             safety: 9,
             communication: 7,
             problemSolving: 8,
             workplaceOrganisation: 8,
             toolUsage: 8,
             teamwork: 9,
             workErrors: 8
           },
          overallScore: 8.2,
          notes: "Consistently good performance. Good teamwork skills.",
          createdAt: "2024-01-05T17:00:00Z"
        }
      ]
      setAssessments(mockAssessments)
    }
  }, [member])

  useEffect(() => {
    if (member) {
      // Calculate On-Time Completion Rate (mock calculation)
      const onTimeRate = 85 + Math.random() * 15 // Mock data between 85-100%

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
  }, [member])

  const getAssessmentAverage = () => {
    if (assessments.length === 0) return null
    const totalScore = assessments.reduce((sum, assessment) => sum + assessment.overallScore, 0)
    return (totalScore / assessments.length).toFixed(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (!resolvedParams || !member) {
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
          {/* Assessment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Assessment History
                {getAssessmentAverage() && (
                  <Badge className="ml-auto bg-blue-100 text-blue-800 border-blue-200">
                    Avg: {getAssessmentAverage()}/10
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Recent supervisor assessments and feedback
              </p>
            </CardHeader>
            <CardContent>
              {assessments.length > 0 ? (
                <div className="space-y-4">
                  {assessments.slice(0, 5).map((assessment) => (
                    <div key={assessment.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Week ending {new Date(assessment.weekEndingDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Assessed by: {assessment.assessedBy}
                          </p>
                        </div>
                        <Badge 
                          className={assessment.overallScore >= 8 ? "bg-green-100 text-green-800 border-green-200" : 
                                     assessment.overallScore >= 6 ? "bg-blue-100 text-blue-800 border-blue-200" : 
                                     "bg-red-100 text-red-800 border-red-200"}
                        >
                          {assessment.overallScore.toFixed(1)}/10
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{assessment.scores.punctuality}</div>
                          <div className="text-muted-foreground">Punctuality</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{assessment.scores.taskCompletion}</div>
                          <div className="text-muted-foreground">Task Completion</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{assessment.scores.workQuality}</div>
                          <div className="text-muted-foreground">Work Quality</div>
                        </div>
                      </div>
                      {assessment.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                          <strong>Feedback:</strong> {assessment.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No assessments available yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Performance Metrics
                <Badge className="text-lg flex items-center gap-2 bg-blue-100 text-blue-800 border-blue-200">
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

          <Card>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Install electrical panels</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FolderKanban className="h-3 w-3" />
                      <span>Downtown Office Tower</span>
                    </div>
                  </div>
                  <Badge variant="secondary">in-progress</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Wire lighting fixtures</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FolderKanban className="h-3 w-3" />
                      <span>Residential Complex</span>
                    </div>
                  </div>
                  <Badge variant="secondary">todo</Badge>
                </div>
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

          {/* Enhanced Timesheet Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Timesheets
              </CardTitle>
              <p className="text-sm text-muted-foreground">Last 5 time entries with details.</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timesheetData.map((entry) => (
                  <div key={entry.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">{entry.projectName}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          entry.hoursWorked > entry.hoursBudgeted ? "text-red-500" : "text-green-500"
                        }`}>
                          {entry.hoursWorked}h
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ({entry.hoursBudgeted}h budgeted)
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {entry.taskDescription}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">
                        Project #{entry.projectId}
                      </span>
                      {entry.overtime > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          +{entry.overtime}h OT
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Timesheet Summary */}
                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-lg">
                        {timesheetData.reduce((sum, entry) => sum + entry.hoursWorked, 0)}h
                      </div>
                      <div className="text-muted-foreground">Total Worked</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">
                        {timesheetData.reduce((sum, entry) => sum + entry.overtime, 0)}h
                      </div>
                      <div className="text-muted-foreground">Overtime</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills & Certifications</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="outline">OSHA 30</Badge>
              <Badge variant="outline">Electrical License</Badge>
              <Badge variant="outline">First Aid/CPR</Badge>
              <Badge variant="outline">NECA Certified</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
