"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Star, Clock, CheckCircle } from "lucide-react"
import type { Tradesperson, WeeklyAssessment } from "../../../types/tradesperson"

interface WeeklyAssessmentFormProps {
  tradesperson: Tradesperson
  onSubmit: (assessment: Omit<WeeklyAssessment, "id" | "createdAt">) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface AssessmentCriteria {
  key: keyof WeeklyAssessment["scores"]
  label: string
  description: string
  icon: string
}

const assessmentCriteria: AssessmentCriteria[] = [
  {
    key: "punctuality",
    label: "Punctuality",
    description: "Arrives on time, ready to work",
    icon: "⏰"
  },
  {
    key: "taskCompletion",
    label: "Task Completion",
    description: "Completes assigned tasks efficiently",
    icon: "✅"
  },
  {
    key: "workQuality",
    label: "Work Quality",
    description: "Quality of workmanship and attention to detail",
    icon: "⭐"
  },
  {
    key: "safetyCompliance",
    label: "Safety Compliance",
    description: "Follows safety protocols and regulations",
    icon: "🦺"
  },
  {
    key: "communication",
    label: "Communication",
    description: "Clear communication with team and supervisors",
    icon: "💬"
  },
  {
    key: "teamwork",
    label: "Teamwork",
    description: "Collaborates well with other trades",
    icon: "🤝"
  },
  {
    key: "problemSolving",
    label: "Problem Solving",
    description: "Identifies and resolves issues independently",
    icon: "🧠"
  },
  {
    key: "efficiency",
    label: "Efficiency",
    description: "Works efficiently and meets productivity targets",
    icon: "⚡"
  },
  {
    key: "toolManagement",
    label: "Tool Management",
    description: "Proper care and organization of tools/equipment",
    icon: "🔧"
  },
  {
    key: "siteCleanliness",
    label: "Site Cleanliness",
    description: "Maintains clean and organized work area",
    icon: "🧹"
  }
]

export function WeeklyAssessmentForm({ tradesperson, onSubmit, open, onOpenChange }: WeeklyAssessmentFormProps) {
  const [scores, setScores] = useState<WeeklyAssessment["scores"]>({
    punctuality: 7,
    taskCompletion: 7,
    workQuality: 7,
    safetyCompliance: 7,
    communication: 7,
    teamwork: 7,
    problemSolving: 7,
    efficiency: 7,
    toolManagement: 7,
    siteCleanliness: 7
  })
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return "text-green-600"
    if (score >= 7.0) return "text-blue-600"
    if (score >= 5.5) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 9) return "Excellent"
    if (score >= 8) return "Very Good"
    if (score >= 7) return "Good"
    if (score >= 6) return "Satisfactory"
    if (score >= 5) return "Needs Improvement"
    return "Poor"
  }

  const handleScoreChange = (criteriaKey: keyof WeeklyAssessment["scores"], value: number[]) => {
    setScores(prev => ({
      ...prev,
      [criteriaKey]: value[0]
    }))
  }

  const calculateOverallScore = () => {
    const values = Object.values(scores)
    return values.reduce((sum, score) => sum + score, 0) / values.length
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Get the Friday of the current week
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7
    const friday = new Date(now)
    friday.setDate(now.getDate() + daysUntilFriday)
    
    const assessment: Omit<WeeklyAssessment, "id" | "createdAt"> = {
      tradespersonId: tradesperson.id,
      assessedBy: "current-supervisor", // In real app, get from auth
      weekEndingDate: friday.toISOString().split('T')[0],
      scores,
      overallScore: calculateOverallScore(),
      notes: notes.trim() || undefined
    }

    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    onSubmit(assessment)
    
    // Reset form
    setScores({
      punctuality: 7,
      taskCompletion: 7,
      workQuality: 7,
      safetyCompliance: 7,
      communication: 7,
      teamwork: 7,
      problemSolving: 7,
      efficiency: 7,
      toolManagement: 7,
      siteCleanliness: 7
    })
    setNotes("")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const overallScore = calculateOverallScore()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Calendar className="h-5 w-5" />
            Weekly Assessment
          </DialogTitle>
        </DialogHeader>

        {/* Tradesperson Info */}
        <Card className="bg-gray-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={tradesperson.avatarUrl} />
                <AvatarFallback>
                  {tradesperson.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-lg">{tradesperson.name}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{tradesperson.trade}</Badge>
                  <span className="text-sm text-gray-500">
                    Week ending {new Date().toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Overall</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Criteria */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-700">
            Rate each area from 1 (Poor) to 10 (Excellent)
          </div>
          
          {assessmentCriteria.map((criteria) => (
            <div key={criteria.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{criteria.icon}</span>
                  <div>
                    <Label className="text-sm font-medium">{criteria.label}</Label>
                    <div className="text-xs text-gray-500">{criteria.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 min-w-[100px] justify-end">
                  <span className={`text-sm font-semibold ${getScoreColor(scores[criteria.key])}`}>
                    {scores[criteria.key]}/10
                  </span>
                  <span className="text-xs text-gray-500 min-w-[80px] text-right">
                    {getScoreLabel(scores[criteria.key])}
                  </span>
                </div>
              </div>
              <Slider
                value={[scores[criteria.key]]}
                onValueChange={(value: number[]) => handleScoreChange(criteria.key, value)}
                max={10}
                min={1}
                step={0.5}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any specific feedback, achievements, or areas for improvement..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Summary */}
        <Card className="bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Assessment Summary</span>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore.toFixed(1)}/10
                </div>
                <div className="text-sm text-gray-600">
                  {getScoreLabel(overallScore)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Assessment
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 