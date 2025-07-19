"use client"

import { useState, useEffect } from "react"
import type { Task } from "../../types/task"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import type { CheckedState } from "@radix-ui/react-checkbox"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, X, Edit, Eye } from "lucide-react"
import { format } from "date-fns"

interface TaskDialogProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
}

interface TaskDetailsViewProps {
  task: Task
  onSave: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
}

function TaskDetailsView({ task, onSave }: TaskDetailsViewProps) {
  const [isAssessing, setIsAssessing] = useState(false)
  const [assessedWorker, setAssessedWorker] = useState("")
  const [assessment, setAssessment] = useState({
    onTimeAndReady: null as boolean | null,
    completedTasks: null as boolean | null,
    majorSnags: null as boolean | null,
    safetyProtocols: null as boolean | null,
    communication: null as boolean | null,
    initiative: null as boolean | null,
    workAreaClean: null as boolean | null,
    toolsProper: null as boolean | null,
    collaboration: null as boolean | null,
    qualityStandards: null as boolean | null,
  })
  const [overallRating, setOverallRating] = useState<"excellent" | "good" | "satisfactory" | "needs-improvement" | null>(null)
  const [additionalNotes, setAdditionalNotes] = useState("")

  const assessmentQuestions = [
    { key: 'onTimeAndReady', question: 'Were they on time and ready to work?' },
    { key: 'completedTasks', question: 'Did they complete all assigned tasks?' },
    { key: 'majorSnags', question: 'Were there any major snags or errors in their work?' },
    { key: 'safetyProtocols', question: 'Did they follow all safety protocols?' },
    { key: 'communication', question: 'Did they communicate effectively with the team or supervisor?' },
    { key: 'initiative', question: 'Did they show initiative in solving problems?' },
    { key: 'workAreaClean', question: 'Was their work area kept clean and organised?' },
    { key: 'toolsProper', question: 'Did they use tools and equipment properly?' },
    { key: 'collaboration', question: 'Did they collaborate well with other team members?' },
    { key: 'qualityStandards', question: 'Did their work meet project specifications and quality standards?' },
  ]

  useEffect(() => {
    if (task.supervisorAssessment) {
      setAssessedWorker(task.supervisorAssessment.assessedWorker)
      setAssessment(task.supervisorAssessment.questions)
      setOverallRating(task.supervisorAssessment.overallRating)
      setAdditionalNotes(task.supervisorAssessment.additionalNotes || "")
    } else if (task.assignee) {
      setAssessedWorker(task.assignee.split(',')[0].trim()) // Default to first assignee
    }
  }, [task])

  const handleSaveAssessment = () => {
    const updatedTask = {
      ...task,
      supervisorAssessment: {
        assessedBy: "Current Supervisor", // In real app, this would be the logged-in user
        assessedAt: new Date(),
        assessedWorker: assessedWorker,
        questions: assessment,
        overallRating: overallRating,
        additionalNotes: additionalNotes,
      },
      updatedAt: new Date()
    }

    onSave(updatedTask)
    setIsAssessing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "bg-green-100 text-green-800"
      case "in-progress": return "bg-blue-100 text-blue-800"
      case "review": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
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

  return (
    <div className="space-y-6">
      {/* Task Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority.toUpperCase()}
          </Badge>
          <Badge className={getStatusColor(task.status)}>
            {task.status === "in-progress" ? "In Progress" : 
             task.status === "todo" ? "To Do" :
             task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </Badge>
        </div>

        {task.description && (
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Assignee:</span>
            <p className="text-muted-foreground">{task.assignee || "Unassigned"}</p>
          </div>
          <div>
            <span className="font-medium">Due Date:</span>
            <p className="text-muted-foreground">
              {task.dueDate ? format(task.dueDate, "PPP") : "No due date"}
            </p>
          </div>
          <div>
            <span className="font-medium">Project:</span>
            <p className="text-muted-foreground">{task.projectName || "No project"}</p>
          </div>
          <div>
            <span className="font-medium">Category:</span>
            <p className="text-muted-foreground">{task.category || "No category"}</p>
          </div>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Supervisor Assessment Section */}
      {task.assignee && (task.status === "done" || task.status === "in-progress") && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Supervisor Assessment</h3>
            {!isAssessing && !task.supervisorAssessment && (
              <Button onClick={() => setIsAssessing(true)}>
                Start Assessment
              </Button>
            )}
            {!isAssessing && task.supervisorAssessment && (
              <Button variant="outline" onClick={() => setIsAssessing(true)}>
                Edit Assessment
              </Button>
            )}
          </div>

          {task.supervisorAssessment && !isAssessing && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Assessed Worker:</span>
                      <Badge variant="outline" className="font-medium">{task.supervisorAssessment.assessedWorker}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Assessed On:</span>
                      <span className="text-sm text-gray-600">{format(task.supervisorAssessment.assessedAt, "PPP")}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Assessed By:</span>
                      <span className="text-sm text-gray-600">{task.supervisorAssessment.assessedBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Overall Rating:</span>
                      <Badge className={`text-sm font-medium ${
                        task.supervisorAssessment.overallRating === "excellent" ? "bg-green-100 text-green-800 border-green-300" :
                        task.supervisorAssessment.overallRating === "good" ? "bg-blue-100 text-blue-800 border-blue-300" :
                        task.supervisorAssessment.overallRating === "satisfactory" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                        "bg-red-100 text-red-800 border-red-300"
                      }`}>
                        {task.supervisorAssessment.overallRating?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t border-blue-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Assessment Details</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {assessmentQuestions.map((q) => {
                      const answer = task.supervisorAssessment!.questions[q.key as keyof typeof task.supervisorAssessment.questions]
                      return (
                        <div key={q.key} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-100">
                          <span className="text-sm text-gray-700 flex-1">{q.question}</span>
                          <Badge variant={answer === true ? "default" : answer === false ? "destructive" : "secondary"} 
                                 className="ml-3 text-xs font-medium">
                            {answer === true ? "Yes" : answer === false ? "No" : "N/A"}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {task.supervisorAssessment.additionalNotes && (
                  <div className="mt-6 pt-4 border-t border-blue-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Additional Notes</h4>
                    <div className="bg-white rounded-lg border border-gray-100 p-4">
                      <p className="text-sm text-gray-600 leading-relaxed">{task.supervisorAssessment.additionalNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isAssessing && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Worker Being Assessed</label>
                <Select value={assessedWorker} onValueChange={setAssessedWorker}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {task.assignee?.split(',').map(worker => (
                      <SelectItem key={worker.trim()} value={worker.trim()}>
                        {worker.trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Assessment Questions</h4>
                {assessmentQuestions.map((q) => (
                  <div key={q.key} className="space-y-2">
                    <label className="text-sm font-medium">{q.question}</label>
                    <div className="flex gap-4">
                      <Button
                        variant={assessment[q.key as keyof typeof assessment] === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAssessment(prev => ({ ...prev, [q.key]: true }))}
                      >
                        Yes
                      </Button>
                      <Button
                        variant={assessment[q.key as keyof typeof assessment] === false ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => setAssessment(prev => ({ ...prev, [q.key]: false }))}
                      >
                        No
                      </Button>
                      <Button
                        variant={assessment[q.key as keyof typeof assessment] === null ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setAssessment(prev => ({ ...prev, [q.key]: null }))}
                      >
                        N/A
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Overall Rating</label>
                <Select value={overallRating || ""} onValueChange={(value: any) => setOverallRating(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select overall rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                    <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Notes (Optional)</label>
                <Textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Add any additional notes about the worker's performance..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveAssessment} disabled={!assessedWorker || !overallRating}>
                  Save Assessment
                </Button>
                <Button variant="outline" onClick={() => setIsAssessing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!task.supervisorAssessment && !isAssessing && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No assessment completed yet.</p>
              <p className="text-sm">Start an assessment to evaluate worker performance.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function TaskDialog({ task, isOpen, onClose, onSave }: TaskDialogProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Task["priority"]>("medium")
  const [status, setStatus] = useState<Task["status"]>("todo")
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringType, setRecurringType] = useState<Task["recurringType"]>("daily")
  const [assignee, setAssignee] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [completed, setCompleted] = useState(false)
  
  // CVC Fields
  const [estimatedContributionValue, setEstimatedContributionValue] = useState<number>(0)
  const [labourCost, setLabourCost] = useState<number>(0)
  const [materialsCost, setMaterialsCost] = useState<number>(0)
  const [equipmentCost, setEquipmentCost] = useState<number>(0)
  const [travelAccommodation, setTravelAccommodation] = useState<number>(0)
    const [subcontractorFees, setSubcontractorFees] = useState<number>(0)
  const [bonusesAdjustments, setBonusesAdjustments] = useState<number>(0)
  
  // Additional recurring task states
  const [recurringFrequency, setRecurringFrequency] = useState<number>(1)
  const [recurringWeekdays, setRecurringWeekdays] = useState<number[]>([1]) // Monday by default
  const [recurringEndDate, setRecurringEndDate] = useState<Date | undefined>()
  const [recurringEndCount, setRecurringEndCount] = useState<number | undefined>()
  const [recurringEndType, setRecurringEndType] = useState<"date" | "count" | "never">("never")
  

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
      setPriority(task.priority)
      setStatus(task.status)
      setDueDate(task.dueDate)
      setIsRecurring(task.isRecurring || false)
      setRecurringType(task.recurringType || "daily")
      setRecurringFrequency(task.recurringPattern?.frequency || 1)
      setRecurringWeekdays(task.recurringPattern?.weekdays || [1])
      setRecurringEndDate(task.recurringEndDate)
      setRecurringEndCount(task.recurringEndCount)
      setRecurringEndType(task.recurringEndDate ? "date" : task.recurringEndCount ? "count" : "never")
      setAssignee(task.assignee || "")
      setTags(task.tags || [])
      setCompleted(task.completed)
      
      // Set CVC fields
      setEstimatedContributionValue(task.cvc?.estimatedContributionValue || 0)
      setLabourCost(task.cvc?.costs.labourCost || 0)
      setMaterialsCost(task.cvc?.costs.materialsCost || 0)
      setEquipmentCost(task.cvc?.costs.equipmentCost || 0)
      setTravelAccommodation(task.cvc?.costs.travelAccommodation || 0)
      setSubcontractorFees(task.cvc?.costs.subcontractorFees || 0)
      setBonusesAdjustments(task.cvc?.costs.bonusesAdjustments || 0)

      
      setIsEditMode(false) // Always start in view mode for existing tasks
    } else {
      // Reset for new task
      setTitle("")
      setDescription("")
      setPriority("medium")
      setStatus("todo")
      setDueDate(undefined)
      setIsRecurring(false)
      setRecurringType("daily")
      setRecurringFrequency(1)
      setRecurringWeekdays([1])
      setRecurringEndDate(undefined)
      setRecurringEndCount(undefined)
      setRecurringEndType("never")
      setAssignee("")
      setTags([])
      setCompleted(false)
      
      // Reset CVC fields
      setEstimatedContributionValue(0)
      setLabourCost(0)
      setMaterialsCost(0)
      setEquipmentCost(0)
      setTravelAccommodation(0)
      setSubcontractorFees(0)
      setBonusesAdjustments(0)
      
      
      setIsEditMode(true) // Start in edit mode for new tasks
    }
  }, [task])

  const handleSave = () => {
    if (!title.trim()) return

    // Calculate CVC metrics
    const totalCost = labourCost + materialsCost + equipmentCost + travelAccommodation + subcontractorFees + bonusesAdjustments
    const cvcScore = estimatedContributionValue - totalCost
    const cvcPercentage = estimatedContributionValue > 0 ? (cvcScore / estimatedContributionValue) * 100 : 0
    const isNegative = cvcScore < 0

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      dueDate,
      isRecurring,
      recurringType: isRecurring ? recurringType : undefined,
      recurringPattern: isRecurring ? {
        frequency: recurringFrequency,
        weekdays: recurringType === "weekly" ? recurringWeekdays : undefined,
      } : undefined,
      recurringEndDate: isRecurring && recurringEndType === "date" ? recurringEndDate : undefined,
      recurringEndCount: isRecurring && recurringEndType === "count" ? recurringEndCount : undefined,
      assignee: assignee.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      completed,
      cvc: {
        estimatedContributionValue,
        costs: {
          labourCost,
          materialsCost,
          equipmentCost,
          travelAccommodation,
          subcontractorFees,
          bonusesAdjustments,
        },
        totalCost,
        cvcScore,
        cvcPercentage,
        isNegative,

      },
    })
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {task ? (isEditMode ? "Edit Task" : task.title) : "Create New Task"}
            </DialogTitle>
            {task && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogHeader>

        {task && !isEditMode ? (
          // View mode - show task details and assessment
          <TaskDetailsView task={task} onSave={onSave} />
        ) : (
          // Edit mode - show edit form
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter task title..." />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={(value: Task["priority"]) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(value: Task["status"]) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Recurring */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={isRecurring} 
                onCheckedChange={(checked: CheckedState) => setIsRecurring(checked === true)} 
              />
              <label className="text-sm font-medium">Recurring Task</label>
            </div>
            {isRecurring && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recurrence Type</label>
                  <Select value={recurringType} onValueChange={(value: string) => setRecurringType(value as Task["recurringType"])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Frequency</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Every</span>
                    <Input
                      type="number"
                      value={recurringFrequency}
                      onChange={(e) => setRecurringFrequency(Number(e.target.value))}
                      min="1"
                      max="12"
                      className="w-20"
                    />
                    <span className="text-sm">
                      {recurringType === "daily" ? "days" : recurringType === "weekly" ? "weeks" : "months"}
                    </span>
                  </div>
                </div>

                {recurringType === "weekly" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Days of the week</label>
                    <div className="flex flex-wrap gap-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${index}`}
                            checked={recurringWeekdays.includes(index)}
                            onCheckedChange={(checked: CheckedState) => {
                              if (checked) {
                                setRecurringWeekdays([...recurringWeekdays, index])
                              } else {
                                setRecurringWeekdays(recurringWeekdays.filter(d => d !== index))
                              }
                            }}
                          />
                          <label htmlFor={`day-${index}`} className="text-sm">{day}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">End recurrence</label>
                  <Select value={recurringEndType} onValueChange={(value: "date" | "count" | "never") => setRecurringEndType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="date">On date</SelectItem>
                      <SelectItem value="count">After number of occurrences</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {recurringEndType === "date" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End date</label>
                    <Input
                      type="date"
                      value={recurringEndDate ? recurringEndDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setRecurringEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </div>
                )}

                {recurringEndType === "count" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Number of occurrences</label>
                    <Input
                      type="number"
                      value={recurringEndCount || ''}
                      onChange={(e) => setRecurringEndCount(e.target.value ? Number(e.target.value) : undefined)}
                      min="1"
                      max="100"
                      placeholder="10"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assignee</label>
            <Input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Assign to..." />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Completed */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={completed} 
              onCheckedChange={(checked: CheckedState) => setCompleted(checked === true)} 
            />
            <label className="text-sm font-medium">Mark as completed</label>
          </div>

          {/* CVC Fields */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Cost vs Contribution (CVC)</h3>
            
            {/* Estimated Contribution Value */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Contribution Value (£)</label>
              <Input 
                type="number" 
                value={estimatedContributionValue} 
                onChange={(e) => setEstimatedContributionValue(Number(e.target.value))} 
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-4">
              <h4 className="font-medium">Cost Breakdown</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Labour Cost (£)</label>
                  <Input 
                    type="number" 
                    value={labourCost} 
                    onChange={(e) => setLabourCost(Number(e.target.value))} 
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Materials Cost (£)</label>
                  <Input 
                    type="number" 
                    value={materialsCost} 
                    onChange={(e) => setMaterialsCost(Number(e.target.value))} 
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Equipment Cost (£)</label>
                  <Input 
                    type="number" 
                    value={equipmentCost} 
                    onChange={(e) => setEquipmentCost(Number(e.target.value))} 
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Travel & Accommodation (£)</label>
                  <Input 
                    type="number" 
                    value={travelAccommodation} 
                    onChange={(e) => setTravelAccommodation(Number(e.target.value))} 
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subcontractor Fees (£)</label>
                  <Input 
                    type="number" 
                    value={subcontractorFees} 
                    onChange={(e) => setSubcontractorFees(Number(e.target.value))} 
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bonuses & Adjustments (£)</label>
                  <Input 
                    type="number" 
                    value={bonusesAdjustments} 
                    onChange={(e) => setBonusesAdjustments(Number(e.target.value))} 
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            </div>


          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {task ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
