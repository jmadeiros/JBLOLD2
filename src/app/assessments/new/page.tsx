"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, ClipboardList, Star, User } from "lucide-react"
import Link from "next/link"
import type { WeeklyAssessment, Tradesperson } from "../../../../types/tradesperson"
import { toast } from "sonner"

// Force static export
export const dynamic = 'force-static'

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

const assessmentQuestions = [
  { key: 'punctuality', label: 'Punctuality & Readiness', description: 'Were they on time and ready to work?' },
  { key: 'taskCompletion', label: 'Task Completion', description: 'Did they complete all assigned tasks?' },
  { key: 'workQuality', label: 'Work Quality & Standards', description: 'Did their work meet project specifications and quality standards?' },
  { key: 'safety', label: 'Safety Protocols', description: 'Did they follow all safety protocols?' },
  { key: 'communication', label: 'Team Communication', description: 'Did they communicate effectively with the team or supervisor?' },
  { key: 'problemSolving', label: 'Problem Solving', description: 'Did they show initiative in solving problems?' },
  { key: 'workplaceOrganisation', label: 'Workplace Organisation', description: 'Was their work area kept clean and organised?' },
  { key: 'toolUsage', label: 'Tool & Equipment Usage', description: 'Did they use tools and equipment properly?' },
  { key: 'teamwork', label: 'Team Collaboration', description: 'Did they collaborate well with other team members?' },
  { key: 'workErrors', label: 'Work Accuracy', description: 'Were there any major snags or errors in their work? (Rate 10 for no errors, 1 for major errors)' }
] as const;

export default function NewAssessmentPage() {
  const router = useRouter()
  const [selectedTradespersonId, setSelectedTradespersonId] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Get current date for week ending
  const [weekEndingDate, setWeekEndingDate] = useState(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    const sunday = new Date(today)
    sunday.setDate(today.getDate() + daysUntilSunday)
    return sunday.toISOString().split('T')[0]
  })

  // Assessment scoring (1-10 scale)
  const [scores, setScores] = useState({
    productivity: 7,
    qualityOfWork: 7,
    safetyCompliance: 7,
    teamwork: 7,
    reliability: 7,
    skillLevel: 7
  })

  // Handle search params on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tradespersonParam = urlParams.get('tradesperson')
      if (tradespersonParam) {
        setSelectedTradespersonId(tradespersonParam)
      }
    }
  }, [])

  // Calculate overall score (average of all ratings)
  const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length;

  const selectedTradesperson = mockTradespeople.find(t => t.id === selectedTradespersonId)

  const handleScoreChange = (questionKey: keyof typeof scores, value: string) => {
    setScores(prev => ({
      ...prev,
      [questionKey]: parseInt(value, 10)
    }));
  };

  const handleSave = async () => {
    if (!selectedTradespersonId) {
      toast.error("Please select a team member")
      return
    }

    setIsSubmitting(true)

    const assessment: Omit<WeeklyAssessment, "id" | "createdAt"> = {
      tradespersonId: selectedTradespersonId,
      assessedBy: "supervisor-1", // In real app, this would be current user ID
      weekEndingDate,
      scores,
      overallScore: parseFloat(overallScore.toFixed(1)),
      notes: notes.trim() || undefined,
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success("Assessment saved successfully!")
    router.push("/assessments")
    setIsSubmitting(false)
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-blue-600";
    if (score >= 4) return "text-yellow-600";
    return "text-red-600";
  };

  const getOverallBadgeColor = () => {
    if (overallScore >= 8) return "bg-green-100 text-green-800 border-green-200";
    if (overallScore >= 6) return "bg-blue-100 text-blue-800 border-blue-200";
    if (overallScore >= 4) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">New Assessment</h1>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
                New Weekly Assessment
              </h2>
            </div>
            <p className="text-gray-600">Create a new performance assessment for a team member</p>
          </div>
          
          {selectedTradesperson && (
            <Badge className={`${getOverallBadgeColor()} text-base px-4 py-2`}>
              Overall Score: {overallScore.toFixed(1)}/10
            </Badge>
          )}
        </div>

        {/* Team Member Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Team Member
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tradesperson">Team Member</Label>
                <Select value={selectedTradespersonId} onValueChange={setSelectedTradespersonId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTradespeople.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        <div className="flex items-center gap-2">
                          <span>{person.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {person.trade}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekEnding">Week Ending (Friday)</Label>
                <input
                  id="weekEnding"
                  type="date"
                  value={weekEndingDate}
                  onChange={(e) => setWeekEndingDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {selectedTradesperson && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedTradesperson.avatarUrl} />
                    <AvatarFallback>
                      {selectedTradesperson.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedTradesperson.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedTradesperson.trade}</Badge>
                      <span className="text-sm text-gray-500">
                        Week ending {new Date(weekEndingDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedTradesperson && (
          <>
            {/* Assessment Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Performance Assessment</CardTitle>
                <p className="text-sm text-muted-foreground">Rate each area from 1 (Poor) to 10 (Excellent)</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {assessmentQuestions.map((question) => (
                    <div key={question.key} className="space-y-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={question.key} className="font-semibold text-base">
                          {question.label}
                        </Label>
                        <span className={`font-bold text-xl ${getScoreColor(scores[question.key])}`}>
                          {scores[question.key]}/10
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {question.description}
                      </p>
                      <Select
                        value={scores[question.key].toString()}
                        onValueChange={(value) => handleScoreChange(question.key, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                            <SelectItem key={score} value={score.toString()}>
                              <div className="flex items-center justify-between w-full">
                                <span className="font-medium">{score}</span>
                                <span className="text-xs text-muted-foreground ml-4">
                                  {score <= 3 ? "Poor" : score <= 5 ? "Fair" : score <= 7 ? "Good" : score <= 9 ? "Very Good" : "Excellent"}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Additional Feedback</CardTitle>
                <p className="text-sm text-muted-foreground">Provide specific feedback, achievements, or areas for improvement</p>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="notes"
                  placeholder="Add any specific feedback, achievements, or areas for improvement..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Summary Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Assessment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(scores).filter(s => s >= 8).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Excellent (8-10)</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {Object.values(scores).filter(s => s >= 6 && s < 8).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Good (6-7)</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-yellow-600">
                      {Object.values(scores).filter(s => s >= 4 && s < 6).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Fair (4-5)</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-red-600">
                      {Object.values(scores).filter(s => s < 4).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Poor (1-3)</div>
                  </div>
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                      {overallScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button 
                onClick={handleSave} 
                className="flex-1 py-3 text-base"
                disabled={isSubmitting}
              >
                <Save className="h-5 w-5 mr-2" />
                {isSubmitting ? "Saving..." : "Save Assessment"}
              </Button>
              <Link href="/assessments">
                <Button variant="outline" className="px-8 py-3 text-base">
                  Cancel
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </SidebarInset>
  )
} 