"use client"

import React from "react"
import type { Task } from "../../types/task"
import { useMemo, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  differenceInDays,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  endOfWeek,
  isWithinInterval,
  startOfDay,
  addDays,
} from "date-fns"
import { cn } from "@/lib/utils"
import { User, ChevronDown, ChevronRight, Users } from "lucide-react"

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

const nameToColor = (name: string) => {
  const colors = [
    "bg-red-200 text-red-800",
    "bg-orange-200 text-orange-800",
    "bg-amber-200 text-amber-800",
    "bg-yellow-200 text-yellow-800",
    "bg-lime-200 text-lime-800",
    "bg-green-200 text-green-800",
    "bg-emerald-200 text-emerald-800",
    "bg-teal-200 text-teal-800",
    "bg-cyan-200 text-cyan-800",
    "bg-sky-200 text-sky-800",
    "bg-blue-200 text-blue-800",
    "bg-indigo-200 text-indigo-800",
    "bg-violet-200 text-violet-800",
    "bg-purple-200 text-purple-800",
    "bg-fuchsia-200 text-fuchsia-800",
    "bg-pink-200 text-pink-800",
    "bg-rose-200 text-rose-800",
  ]
  let hash = 0
  if (name.length === 0) return colors[0]
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const DAY_WIDTH_PX = 32
const ROW_HEIGHT_PX = 48
const GROUP_HEADER_HEIGHT_PX = 40
const SIDE_PANEL_WIDTH_PX = 350
const HEADER_HEIGHT_PX = 80

const TASK_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-red-500",
  "bg-gray-500",
]

interface GanttTimelineProps {
  tasks: Task[]
  viewStartDate: Date
  viewEndDate: Date
  onTaskUpdate?: (updatedTask: Task, reason: string) => void
}

interface DragState {
  isDragging: boolean
  task: Task | null
  originalStartIndex: number
  originalEndIndex: number
  currentStartIndex: number
  offset: { x: number; y: number }
}

interface ReasonDialogState {
  isOpen: boolean
  task: Task | null
  originalDates: { start: Date; end: Date } | null
  newDates: { start: Date; end: Date } | null
  reason: string
}

export function GanttTimeline({ tasks, viewStartDate, viewEndDate, onTaskUpdate }: GanttTimelineProps) {
  // Group tasks by trade/assignee and manage collapsed state
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  
  // Drag and drop state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    task: null,
    originalStartIndex: -1,
    originalEndIndex: -1,
    currentStartIndex: -1,
    offset: { x: 0, y: 0 }
  })
  
  // Reason dialog state
  const [reasonDialog, setReasonDialog] = useState<ReasonDialogState>({
    isOpen: false,
    task: null,
    originalDates: null,
    newDates: null,
    reason: ""
  })

  const taskGroups = useMemo(() => {
    const groupMap = new Map<string, { tasks: Task[]; color: string }>()
    
    tasks.forEach((task) => {
      // Group by assignee (trade) or category as fallback
      const groupKey = task.assignee || task.category || "Unassigned"
      
      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, { 
            tasks: [],
          color: nameToColor(groupKey) 
          })
        }
      groupMap.get(groupKey)!.tasks.push(task)
    })

    return Array.from(groupMap.entries()).map(([name, data]) => ({
      id: name.replace(/\s+/g, '-').toLowerCase(),
      name,
      tasks: data.tasks.sort((a, b) => (a.startDate || new Date(0)).getTime() - (b.startDate || new Date(0)).getTime()),
      isExpanded: !collapsedGroups.has(name),
      color: data.color
    }))
  }, [tasks, collapsedGroups])

  const { days, weeks } = useMemo(() => {
    const days = eachDayOfInterval({ start: viewStartDate, end: viewEndDate })
    const weeks = eachWeekOfInterval({ start: viewStartDate, end: viewEndDate }, { weekStartsOn: 1 }).map(
      (weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
        return { start: weekStart, end: weekEnd }
      },
    )
    return { days, weeks }
  }, [viewStartDate, viewEndDate])

  const totalDays = days.length
  const timelineWidth = totalDays * DAY_WIDTH_PX

  const today = startOfDay(new Date())
  const todayPosition = isWithinInterval(today, { start: viewStartDate, end: viewEndDate })
    ? differenceInDays(today, viewStartDate) * DAY_WIDTH_PX
    : -1

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupName)) {
        newSet.delete(groupName)
      } else {
        newSet.add(groupName)
      }
      return newSet
    })
  }

  // Drag handlers
  const handleTaskMouseDown = (e: React.MouseEvent, task: Task) => {
    if (!task.startDate || !task.dueDate) return

    const container = e.currentTarget.closest('.overflow-auto');
    if (!container) return;

    const startDayIndex = differenceInDays(task.startDate, viewStartDate)
    const endDayIndex = differenceInDays(task.dueDate, viewStartDate)
    
    const rect = e.currentTarget.getBoundingClientRect()
    // The key fix: subtract the container's left edge and add scrollLeft
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }

    setDragState({
      isDragging: true,
      task,
      originalStartIndex: startDayIndex,
      originalEndIndex: endDayIndex,
      currentStartIndex: startDayIndex,
      offset
    })

    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.task) return

    const container = e.currentTarget
    const rect = container.getBoundingClientRect()
    // Correct calculation: use clientX relative to the container and factor in scroll
    const relativeX = e.clientX - rect.left + container.scrollLeft - SIDE_PANEL_WIDTH_PX - dragState.offset.x
    
    const newStartIndex = Math.round(relativeX / DAY_WIDTH_PX)
    const clampedStartIndex = Math.max(0, Math.min(newStartIndex, totalDays - 1))

    setDragState(prev => ({
      ...prev,
      currentStartIndex: clampedStartIndex
    }))
  }

  const handleMouseUp = () => {
    if (!dragState.isDragging || !dragState.task) return

    const task = dragState.task
    const daysDifference = dragState.currentStartIndex - dragState.originalStartIndex
    
    if (daysDifference !== 0) {
      // Calculate new dates
      const newStartDate = addDays(task.startDate!, daysDifference)
      const newEndDate = addDays(task.dueDate!, daysDifference)
      
      // Open reason dialog
      setReasonDialog({
        isOpen: true,
        task,
        originalDates: { start: task.startDate!, end: task.dueDate! },
        newDates: { start: newStartDate, end: newEndDate },
        reason: ""
      })
    }

    setDragState({
      isDragging: false,
      task: null,
      originalStartIndex: -1,
      originalEndIndex: -1,
      currentStartIndex: -1,
      offset: { x: 0, y: 0 }
    })
  }

  const handleReasonSubmit = () => {
    if (!reasonDialog.task || !reasonDialog.newDates || !reasonDialog.reason.trim() || !onTaskUpdate) return

    const updatedTask: Task = {
      ...reasonDialog.task,
      startDate: reasonDialog.newDates.start,
      dueDate: reasonDialog.newDates.end,
      updatedAt: new Date(),
      // Add movement history for tracking
      movementHistory: [
        ...(reasonDialog.task.movementHistory || []),
        {
          id: Date.now().toString(),
          timestamp: new Date(),
          reason: reasonDialog.reason.trim(),
          originalStartDate: reasonDialog.originalDates!.start,
          originalEndDate: reasonDialog.originalDates!.end,
          newStartDate: reasonDialog.newDates.start,
          newEndDate: reasonDialog.newDates.end,
          movedBy: "Current User" // In real app, this would be the logged-in user
        }
      ]
    }

    onTaskUpdate(updatedTask, reasonDialog.reason.trim())

    setReasonDialog({
      isOpen: false,
      task: null,
      originalDates: null,
      newDates: null,
      reason: ""
    })
  }

  const handleReasonCancel = () => {
    setReasonDialog({
      isOpen: false,
      task: null,
      originalDates: null,
      newDates: null,
      reason: ""
    })
  }

  return (
    <div className="relative border rounded-lg bg-card text-card-foreground shadow-sm h-[600px] overflow-hidden">
            {/* Main Content - Single scroll container */}
      <div
        className="absolute inset-0 overflow-auto"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Handle mouse leaving the container
      >
        <div className="relative" style={{ width: `${SIDE_PANEL_WIDTH_PX + timelineWidth}px` }}>
          {/* Timeline Headers Row - Sticky at top, scrolls horizontally with content */}
          <div className="flex sticky top-0 z-20 bg-card border-b" style={{ height: `${HEADER_HEIGHT_PX}px` }}>
            {/* Frozen Left Panel Header */}
            <div 
              className="sticky left-0 z-30 bg-card border-r flex items-center px-4 py-3 font-semibold"
              style={{ width: `${SIDE_PANEL_WIDTH_PX}px`, flexShrink: 0 }}
            >
              Task Groups & Details
        </div>
            
            {/* Timeline Headers */}
            <div className="flex flex-col bg-muted/30" style={{ width: `${timelineWidth}px` }}>
              {/* Week Headers */}
              <div className="flex border-b">
            {weeks.map((week, index) => {
              const daysInWeek = eachDayOfInterval({ start: week.start, end: week.end }).filter(
                (d) => d >= viewStartDate && d <= viewEndDate,
              ).length
              if (daysInWeek === 0) return null
              return (
                <div
                  key={index}
                      className="text-center text-sm font-semibold py-2 border-r bg-muted/50"
                  style={{ width: `${daysInWeek * DAY_WIDTH_PX}px` }}
                >
                  {format(week.start, "MMM d")} - {format(week.end, "d")}
                </div>
              )
            })}
          </div>
              
              {/* Day Headers */}
          <div className="flex">
            {days.map((day, index) => (
              <div
                key={index}
                    className="text-center text-xs text-muted-foreground py-1 border-r bg-muted/30"
                style={{ width: `${DAY_WIDTH_PX}px` }}
              >
                    {format(day, "d")}
              </div>
            ))}
              </div>
          </div>
        </div>

          {taskGroups.map((group) => (
            <div key={group.id}>
              {/* Group Header Row */}
              <div className="flex" style={{ height: `${GROUP_HEADER_HEIGHT_PX}px` }}>
                {/* Frozen Left Side */}
              <div
                  className="sticky left-0 z-20 bg-muted/20 border-b border-r flex items-center gap-2 px-3 py-2 hover:bg-muted/40 cursor-pointer font-medium"
                  style={{ width: `${SIDE_PANEL_WIDTH_PX}px` }}
                  onClick={() => toggleGroup(group.name)}
                >
                  {group.isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Users className="h-4 w-4" />
                  <span className="truncate">{group.name}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {group.tasks.length}
                  </Badge>
              </div>
                
                {/* Timeline Side */}
              <div
                  className="bg-muted/10 border-b relative"
                  style={{ width: `${timelineWidth}px` }}
              />
            </div>

              {/* Group Tasks */}
              {group.isExpanded && group.tasks.map((task, taskIndex) => {
              const startDayIndex = task.startDate ? differenceInDays(task.startDate, viewStartDate) : -1
              const endDayIndex = task.dueDate ? differenceInDays(task.dueDate, viewStartDate) : -1
              const duration = startDayIndex >= 0 && endDayIndex >= 0 ? endDayIndex - startDayIndex + 1 : 0

              return (
                  <div key={task.id} className="flex hover:bg-muted/50 transition-colors" style={{ height: `${ROW_HEIGHT_PX}px` }}>
                    {/* Frozen Left Side - Task Details */}
                  <div
                      className="sticky left-0 z-20 bg-card border-b border-r flex items-center justify-between text-sm p-3"
                      style={{ width: `${SIDE_PANEL_WIDTH_PX}px` }}
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <div className="font-medium truncate mb-1">{task.title}</div>
                        <div className="flex items-center gap-2">
                          {task.category && (
                            <Badge variant="outline" className="text-xs">
                              {task.category}
                            </Badge>
                          )}
                          <Badge 
                            variant={task.priority === "high" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className={cn("text-xs font-bold", group.color)}>
                        {getInitials(task.assignee)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                    
                    {/* Timeline Side - Task Bars */}
                  <div
                      className="relative border-b"
                      style={{ width: `${timelineWidth}px` }}
                  >
                    {duration > 0 && startDayIndex < totalDays && startDayIndex >= 0 && (
                      <>
                        {/* Task Movement Trail */}
                        {task.movementHistory && task.movementHistory.length > 0 && (
                          <div
                            className="absolute h-7 my-auto rounded-sm border-2 border-gray-400 border-dashed bg-gray-200/50"
                            style={{
                              top: `calc((${ROW_HEIGHT_PX}px - 28px) / 2)`,
                              left: `${differenceInDays(task.movementHistory[task.movementHistory.length - 1].originalStartDate, viewStartDate) * DAY_WIDTH_PX + 2}px`,
                              width: `${(differenceInDays(task.movementHistory[task.movementHistory.length - 1].originalEndDate, task.movementHistory[task.movementHistory.length - 1].originalStartDate) + 1) * DAY_WIDTH_PX - 4}px`,
                            }}
                            title={`Originally from ${format(task.movementHistory[task.movementHistory.length - 1].originalStartDate, "MMM d")} to ${format(task.movementHistory[task.movementHistory.length - 1].originalEndDate, "MMM d")}`}
                          />
                        )}

                        {/* Task Bar */}
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "absolute h-7 my-auto rounded-sm flex items-center px-2 text-white text-xs shadow-sm hover:shadow-md transition-all",
                                  TASK_COLORS[taskIndex % TASK_COLORS.length],
                                  dragState.isDragging && dragState.task?.id === task.id 
                                    ? "cursor-grabbing opacity-80 z-50" 
                                    : "cursor-grab hover:scale-105"
                                )}
                                style={{
                                  top: `calc((${ROW_HEIGHT_PX}px - 28px) / 2)`,
                                  left: `${(dragState.isDragging && dragState.task?.id === task.id 
                                    ? dragState.currentStartIndex 
                                    : startDayIndex) * DAY_WIDTH_PX + 2}px`,
                                  width: `${duration * DAY_WIDTH_PX - 4}px`,
                                }}
                                onMouseDown={(e) => handleTaskMouseDown(e, task)}
                              >
                                <span className="truncate">{task.title}</span>
                                {task.movementHistory && task.movementHistory.length > 0 && (
                                  <span className="ml-1 text-xs">📅</span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="p-1 space-y-1">
                                <p className="font-bold">{task.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(task.startDate!, "MMM d")} - {format(task.dueDate!, "MMM d, yyyy")}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                                    {task.priority}
                                  </Badge>
                                  {task.category && <Badge variant="outline">{task.category}</Badge>}
                                </div>
                                {task.assignee && (
                                  <div className="flex items-center gap-2 pt-1 border-t mt-1">
                                    <User className="w-4 h-4" />
                                    <span>{task.assignee}</span>
                                  </div>
                                )}
                                {task.movementHistory && task.movementHistory.length > 0 && (
                                  <div className="pt-1 border-t mt-1">
                                    <p className="text-xs font-medium">Last moved:</p>
                                    <p className="text-xs text-muted-foreground">
                                      {format(task.movementHistory[task.movementHistory.length - 1].timestamp, "MMM d, yyyy")}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Reason: {task.movementHistory[task.movementHistory.length - 1].reason}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
            </div>
        ))}

        {/* Today Marker */}
        {todayPosition >= 0 && (
          <div
              className="absolute w-0.5 bg-red-500/70 z-10 pointer-events-none"
              style={{ 
                left: `${SIDE_PANEL_WIDTH_PX + todayPosition + DAY_WIDTH_PX / 2}px`,
                top: 0,
                bottom: 0
              }}
            >
              <div className="absolute top-1 -translate-x-1/2 text-xs text-red-500 font-semibold bg-card px-1 rounded shadow-sm">
                Today
              </div>
            </div>
          )}
          </div>
      </div>
      
      {/* Task Movement Reason Dialog */}
      <Dialog open={reasonDialog.isOpen} onOpenChange={handleReasonCancel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reason for Task Movement</DialogTitle>
          </DialogHeader>
          
          {reasonDialog.task && reasonDialog.originalDates && reasonDialog.newDates && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">{reasonDialog.task.title}</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original:</span>
                    <span>
                      {format(reasonDialog.originalDates.start, "MMM d")} - {format(reasonDialog.originalDates.end, "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New:</span>
                    <span className="font-medium">
                      {format(reasonDialog.newDates.start, "MMM d")} - {format(reasonDialog.newDates.end, "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Change:</span>
                    <span className={
                      differenceInDays(reasonDialog.newDates.start, reasonDialog.originalDates.start) > 0 
                        ? "text-orange-600" 
                        : "text-green-600"
                    }>
                      {differenceInDays(reasonDialog.newDates.start, reasonDialog.originalDates.start) > 0 ? "+" : ""}
                      {differenceInDays(reasonDialog.newDates.start, reasonDialog.originalDates.start)} days
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Reason for movement <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={reasonDialog.reason}
                  onChange={(e) => setReasonDialog(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Delayed due to material delivery, Completed ahead of schedule, Client requested change..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleReasonCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleReasonSubmit}
              disabled={!reasonDialog.reason.trim()}
            >
              Update Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
