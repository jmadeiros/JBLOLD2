"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Save, X } from "lucide-react"
import type { WeeklyAssessment, Tradesperson } from "../../types/tradesperson"

interface WeeklyAssessmentFormProps {
  tradesperson: Tradesperson;
  existingAssessment?: WeeklyAssessment;
  onSave: (assessment: WeeklyAssessment) => void;
  onCancel: () => void;
}

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

export function WeeklyAssessmentForm({ tradesperson, existingAssessment, onSave, onCancel }: WeeklyAssessmentFormProps) {
  const [scores, setScores] = useState(() => 
    existingAssessment?.scores || {
      punctuality: 5,
      taskCompletion: 5,
      workQuality: 5,
      safety: 5,
      communication: 5,
      problemSolving: 5,
      workplaceOrganisation: 5,
      toolUsage: 5,
      teamwork: 5,
      workErrors: 5
    }
  );
  
  const [notes, setNotes] = useState(existingAssessment?.notes || "");
  const [weekEndingDate, setWeekEndingDate] = useState(() => {
    if (existingAssessment?.weekEndingDate) {
      return existingAssessment.weekEndingDate;
    }
    // Default to this Friday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + daysUntilFriday);
    return friday.toISOString().split('T')[0];
  });

  // Calculate overall score (average of all ratings)
  const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length;

  const handleScoreChange = (questionKey: keyof typeof scores, value: string) => {
    setScores(prev => ({
      ...prev,
      [questionKey]: parseInt(value, 10)
    }));
  };

  const handleSave = () => {
    const assessment: WeeklyAssessment = {
      id: existingAssessment?.id || Date.now().toString(),
      tradespersonId: tradesperson.id,
      assessedBy: "supervisor-1", // In real app, this would be current user ID
      weekEndingDate,
      scores,
      overallScore: parseFloat(overallScore.toFixed(1)),
      notes: notes.trim() || undefined,
      createdAt: existingAssessment?.createdAt || new Date().toISOString()
    };
    
    onSave(assessment);
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
    <div className="w-full max-w-7xl mx-auto p-8 space-y-8 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-blue-600" />
            Weekly Assessment
          </h2>
          <Badge className={`${getOverallBadgeColor()} text-base px-4 py-2`}>
            Overall Score: {overallScore.toFixed(1)}/10
          </Badge>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-xl">
          <div className="flex items-center gap-8 text-sm">
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-600">Team Member:</span>
              <span className="text-xl font-semibold text-gray-900">{tradesperson.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-600">Trade:</span>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-sm">
                {tradesperson.trade}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-600">Week Ending:</span>
              <span className="font-medium">{new Date(weekEndingDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Week Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Assessment Period</CardTitle>
          <p className="text-sm text-muted-foreground">Select the Friday ending the assessment week</p>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label htmlFor="weekEnding" className="text-sm font-medium">Week Ending (Friday)</Label>
            <input
              id="weekEnding"
              type="date"
              value={weekEndingDate}
              onChange={(e) => setWeekEndingDate(e.target.value)}
              className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assessment Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Performance Assessment</CardTitle>
          <p className="text-sm text-muted-foreground">Rate each area from 1 (Poor) to 10 (Excellent)</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {assessmentQuestions.map((question) => (
              <div key={question.key} className="space-y-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
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
        <Button onClick={handleSave} className="flex-1 py-3 text-base">
          <Save className="h-5 w-5 mr-2" />
          Save Assessment
        </Button>
        <Button variant="outline" onClick={onCancel} className="px-8 py-3 text-base">
          <X className="h-5 w-5 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
} 