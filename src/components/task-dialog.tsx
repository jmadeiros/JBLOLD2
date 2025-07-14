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
import { CVCBreakdown } from "./cvc-breakdown"

interface TaskDialogProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
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
          // View mode - show CVC breakdown
          <div className="space-y-4">
            <CVCBreakdown task={task} />
          </div>
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
