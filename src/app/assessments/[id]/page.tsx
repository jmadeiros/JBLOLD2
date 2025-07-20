"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Edit, 
  ClipboardList, 
  Calendar, 
  Star, 
  User,
  Download,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import type { WeeklyAssessment, Tradesperson } from "../../../../types/tradesperson"

// Mock data - in real app this would come from API
const mockTradespeople: Tradesperson[] = [
  {
    id: "1",
    name: "Marcus Thompson",
    trade: "Framing",
    avatarUrl: "/avatars/marcus.jpg",
    supervisorId: "supervisor-1",
    projectId: "project-1"
  },
  {
    id: "2", 
    name: "Priya Patel",
    trade: "Electrical",
    avatarUrl: "/avatars/priya.jpg",
    supervisorId: "supervisor-1",
    projectId: "project-1"
  },
  {
    id: "3",
    name: "James Wilson",
    trade: "Plumbing", 
    avatarUrl: "/avatars/james.jpg",
    supervisorId: "supervisor-1",
    projectId: "project-1"
  }
];

const mockAssessments: WeeklyAssessment[] = [
  {
    id: "assessment-1",
    tradespersonId: "1",
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
    tradespersonId: "2", 
    assessedBy: "supervisor-1",
    weekEndingDate: "2024-01-12",
    scores: {
      punctuality: 10,
      taskCompletion: 9,
      workQuality: 9,
      safety: 9,
      communication: 9,
      problemSolving: 8,
      workplaceOrganisation: 7,
      toolUsage: 8,
      teamwork: 9,
      workErrors: 10
    },
    overallScore: 8.8,
    notes: "Consistently outstanding performance. Very reliable team member.",
    createdAt: "2024-01-12T17:00:00Z"
  },
  {
    id: "assessment-3",
    tradespersonId: "3",
    assessedBy: "supervisor-1", 
    weekEndingDate: "2024-01-05",
    scores: {
      punctuality: 7,
      taskCompletion: 8,
      workQuality: 8,
      safety: 9,
      communication: 7,
      problemSolving: 6,
      workplaceOrganisation: 7,
      toolUsage: 8,
      teamwork: 8,
      workErrors: 7
    },
    overallScore: 7.5,
    notes: "Good performance overall. Could improve punctuality and problem-solving skills.",
    createdAt: "2024-01-05T17:00:00Z"
  }
];

const assessmentQuestions = [
  { key: 'punctuality', label: 'Punctuality & Readiness', description: 'Were they on time and ready to work?', icon: '⏰' },
  { key: 'taskCompletion', label: 'Task Completion', description: 'Did they complete all assigned tasks?', icon: '✅' },
  { key: 'workQuality', label: 'Work Quality & Standards', description: 'Did their work meet project specifications and quality standards?', icon: '⭐' },
  { key: 'safety', label: 'Safety Protocols', description: 'Did they follow all safety protocols?', icon: '🦺' },
  { key: 'communication', label: 'Team Communication', description: 'Did they communicate effectively with the team or supervisor?', icon: '💬' },
  { key: 'problemSolving', label: 'Problem Solving', description: 'Did they show initiative in solving problems?', icon: '🧠' },
  { key: 'workplaceOrganisation', label: 'Workplace Organisation', description: 'Was their work area kept clean and organised?', icon: '🧹' },
  { key: 'toolUsage', label: 'Tool & Equipment Usage', description: 'Did they use tools and equipment properly?', icon: '🔧' },
  { key: 'teamwork', label: 'Team Collaboration', description: 'Did they collaborate well with other team members?', icon: '🤝' },
  { key: 'workErrors', label: 'Work Accuracy', description: 'Were there any major snags or errors in their work? (Rate 10 for no errors, 1 for major errors)', icon: '🎯' }
] as const;

export default function ViewAssessmentPage() {
  const params = useParams()
  const assessmentId = params.id as string
  const [assessment, setAssessment] = useState<WeeklyAssessment | null>(null)
  const [tradesperson, setTradesperson] = useState<Tradesperson | null>(null)

  useEffect(() => {
    // In real app, fetch assessment from API
    const foundAssessment = mockAssessments.find(a => a.id === assessmentId)
    if (foundAssessment) {
      setAssessment(foundAssessment)
      const foundTradesperson = mockTradespeople.find(t => t.id === foundAssessment.tradespersonId)
      setTradesperson(foundTradesperson || null)
    }
  }, [assessmentId])

  if (!assessment || !tradesperson) {
    return (
      <SidebarInset>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Assessment not found</p>
            <Link href="/assessments">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Assessments
              </Button>
            </Link>
          </div>
        </div>
      </SidebarInset>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return "text-green-600"
    if (score >= 7.0) return "text-blue-600" 
    if (score >= 5.5) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8.5) return "bg-green-100 text-green-800 border-green-200"
    if (score >= 7.0) return "bg-blue-100 text-blue-800 border-blue-200"
    if (score >= 5.5) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const getProgressColor = (score: number) => {
    if (score >= 8.5) return "bg-green-500"
    if (score >= 7.0) return "bg-blue-500"
    if (score >= 5.5) return "bg-yellow-500"
    return "bg-red-500"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPerformanceLabel = (score: number) => {
    if (score >= 9) return "Outstanding"
    if (score >= 8) return "Excellent"
    if (score >= 7) return "Very Good"
    if (score >= 6) return "Good"
    if (score >= 5) return "Satisfactory"
    if (score >= 4) return "Below Average"
    return "Poor"
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Assessment Details</h1>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/assessments">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <ClipboardList className="h-7 w-7 text-blue-600" />
                Weekly Assessment Details
              </h2>
            </div>
            <p className="text-gray-600">Assessment for {tradesperson.name}</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Link href={`/assessments/${assessment.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Assessment
              </Button>
            </Link>
          </div>
        </div>

        {/* Assessment Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Assessment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Team Member Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={tradesperson.avatarUrl} />
                    <AvatarFallback className="text-lg">
                      {tradesperson.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{tradesperson.name}</h3>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-sm">
                        {tradesperson.trade}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Week ending {formatDate(assessment.weekEndingDate)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Assessed by: Supervisor • Created: {formatDate(assessment.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Overall Score */}
              <div className="text-center">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(assessment.overallScore)}`}>
                    {assessment.overallScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">Overall Score</div>
                  <Badge className={`${getScoreBadgeColor(assessment.overallScore)} text-sm px-3 py-1`}>
                    {getPerformanceLabel(assessment.overallScore)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {assessmentQuestions.map((question) => {
                const score = assessment.scores[question.key]
                return (
                  <div key={question.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{question.icon}</span>
                        <div>
                          <h4 className="font-semibold">{question.label}</h4>
                          <p className="text-sm text-gray-600">{question.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                          {score}/10
                        </div>
                        <div className="text-xs text-gray-500">
                          {getPerformanceLabel(score)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Progress 
                          value={score * 10} 
                          className="h-3"
                          style={{
                            '--progress-background': score >= 8.5 ? '#10b981' : 
                                                   score >= 7.0 ? '#3b82f6' : 
                                                   score >= 5.5 ? '#f59e0b' : '#ef4444'
                          } as React.CSSProperties}
                        />
                      </div>
                      <div className="text-sm text-gray-500 min-w-[60px] text-right">
                        {score * 10}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-600">
                  {Object.values(assessment.scores).filter(s => s >= 8.5).length}
                </div>
                <div className="text-sm text-gray-600">Outstanding (8.5-10)</div>
                <div className="text-xs text-gray-500">
                  {((Object.values(assessment.scores).filter(s => s >= 8.5).length / Object.values(assessment.scores).length) * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600">
                  {Object.values(assessment.scores).filter(s => s >= 7.0 && s < 8.5).length}
                </div>
                <div className="text-sm text-gray-600">Good (7.0-8.4)</div>
                <div className="text-xs text-gray-500">
                  {((Object.values(assessment.scores).filter(s => s >= 7.0 && s < 8.5).length / Object.values(assessment.scores).length) * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-3xl font-bold text-yellow-600">
                  {Object.values(assessment.scores).filter(s => s >= 5.5 && s < 7.0).length}
                </div>
                <div className="text-sm text-gray-600">Fair (5.5-6.9)</div>
                <div className="text-xs text-gray-500">
                  {((Object.values(assessment.scores).filter(s => s >= 5.5 && s < 7.0).length / Object.values(assessment.scores).length) * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-3xl font-bold text-red-600">
                  {Object.values(assessment.scores).filter(s => s < 5.5).length}
                </div>
                <div className="text-sm text-gray-600">Needs Work (<5.5)</div>
                <div className="text-xs text-gray-500">
                  {((Object.values(assessment.scores).filter(s => s < 5.5).length / Object.values(assessment.scores).length) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        {assessment.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-gray-700 leading-relaxed italic">
                  "{assessment.notes}"
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Strengths & Areas for Improvement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">Top Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(assessment.scores)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([key, score]) => {
                    const question = assessmentQuestions.find(q => q.key === key)
                    return (
                      <div key={key} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{question?.icon}</span>
                          <span className="font-medium">{question?.label}</span>
                        </div>
                        <div className="text-green-700 font-bold">{score}/10</div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-amber-700">Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(assessment.scores)
                  .sort(([,a], [,b]) => a - b)
                  .slice(0, 3)
                  .map(([key, score]) => {
                    const question = assessmentQuestions.find(q => q.key === key)
                    return (
                      <div key={key} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{question?.icon}</span>
                          <span className="font-medium">{question?.label}</span>
                        </div>
                        <div className="text-amber-700 font-bold">{score}/10</div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
} 