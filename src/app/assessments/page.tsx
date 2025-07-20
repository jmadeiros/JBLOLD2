"use client"

import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Plus, 
  ClipboardList, 
  Calendar, 
  Star, 
  Eye,
  Edit,
  Download,
  Filter 
} from "lucide-react"
import Link from "next/link"
import type { WeeklyAssessment, Tradesperson } from "../../../types/tradesperson"

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

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<WeeklyAssessment[]>(mockAssessments)
  const [tradespeople, setTradespeople] = useState<Tradesperson[]>(mockTradespeople)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTrade, setFilterTrade] = useState<string>("all")
  const [filterWeek, setFilterWeek] = useState<string>("all")

  // Filter assessments based on search and filters
  const filteredAssessments = assessments.filter(assessment => {
    const tradesperson = tradespeople.find(t => t.id === assessment.tradespersonId)
    const nameMatch = tradesperson?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const tradeMatch = filterTrade === "all" || tradesperson?.trade === filterTrade
    const weekMatch = filterWeek === "all" || assessment.weekEndingDate === filterWeek
    
    return nameMatch && tradeMatch && weekMatch
  })

  // Get unique trades for filter
  const uniqueTrades = Array.from(new Set(tradespeople.map(t => t.trade)))
  
  // Get unique weeks for filter
  const uniqueWeeks = Array.from(new Set(assessments.map(a => a.weekEndingDate))).sort().reverse()

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric'
    })
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Weekly Assessments</h1>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <ClipboardList className="h-7 w-7 text-blue-600" />
              Weekly Assessments
            </h2>
            <p className="text-gray-600 mt-1">Manage and track team member performance assessments</p>
          </div>
          <Link href="/assessments/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Assessments</p>
                  <p className="text-2xl font-bold">{assessments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold">
                    {(assessments.reduce((sum, a) => sum + a.overallScore, 0) / assessments.length || 0).toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold">
                    {assessments.filter(a => a.weekEndingDate === uniqueWeeks[0]).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">A+</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">High Performers</p>
                  <p className="text-2xl font-bold">
                    {assessments.filter(a => a.overallScore >= 8.5).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search by name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by trade</label>
                <Select value={filterTrade} onValueChange={setFilterTrade}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trades</SelectItem>
                    {uniqueTrades.map(trade => (
                      <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by week</label>
                <Select value={filterWeek} onValueChange={setFilterWeek}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Weeks</SelectItem>
                    {uniqueWeeks.map(week => (
                      <SelectItem key={week} value={week}>
                        Week ending {formatDate(week)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessments List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Assessments</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAssessments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No assessments found</p>
                </div>
              ) : (
                filteredAssessments.map((assessment) => {
                  const tradesperson = tradespeople.find(t => t.id === assessment.tradespersonId)
                  return (
                    <div key={assessment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={tradesperson?.avatarUrl} />
                            <AvatarFallback>
                              {tradesperson?.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <h3 className="font-semibold text-lg">{tradesperson?.name}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <Badge variant="outline">{tradesperson?.trade}</Badge>
                              <span>Week ending {formatDate(assessment.weekEndingDate)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(assessment.overallScore)}`}>
                              {assessment.overallScore.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500">Overall Score</div>
                          </div>

                          <Badge className={getScoreBadgeColor(assessment.overallScore)}>
                            {assessment.overallScore >= 8.5 ? "Excellent" :
                             assessment.overallScore >= 7.0 ? "Good" :
                             assessment.overallScore >= 5.5 ? "Fair" : "Needs Improvement"}
                          </Badge>

                          <div className="flex gap-2">
                            <Link href={`/team/${assessment.tradespersonId}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Team Member
                              </Button>
                            </Link>
                            <Link href={`/assessments/new?tradesperson=${assessment.tradespersonId}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Weekly Assessment
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {assessment.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600 italic">"{assessment.notes}"</p>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
} 