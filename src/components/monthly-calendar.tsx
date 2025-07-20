"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Clock,
  Star
} from "lucide-react"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  isSameMonth,
  startOfWeek,
  endOfWeek
} from "date-fns"
import type { Task } from "../../types/task"

interface MonthlyCalendarProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
}

// Helper functions to consistently identify task types for this view
const isTaskAdmin = (task: Task) => {
  const adminCategories = ["Safety", "Procurement", "Site Work"]
  const adminTags = ["admin", "inspection", "permit", "compliance", "cleanup"]
  if (adminCategories.includes(task.category || '')) return true
  if (task.tags?.some(tag => adminTags.includes(tag))) return true
  return false
}

const isTaskMilestone = (task: Task) => {
  return task.tags?.includes("milestone") || task.tags?.includes("critical")
}


export function MonthlyCalendar({ tasks, onTaskClick }: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Navigate months
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1))
  }

  // Get calendar days (including padding days from previous/next month)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd
    })
  }, [currentDate])

  // Filter and categorize tasks by type
  const categorizedTasks = useMemo(() => {
    const adminTasks = tasks.filter(isTaskAdmin)
    const milestones = tasks.filter(isTaskMilestone)
    const shownTasks = [...new Set([...adminTasks, ...milestones])] // Use Set to avoid duplicates
    
    return { 
      adminTasks, 
      milestones,
      completedCount: shownTasks.filter(t => t.completed).length
    }
  }, [tasks])

  // Get tasks for a specific day - only admin and milestone tasks
  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      
      // Only show admin and milestone tasks
      const isAdmin = isTaskAdmin(task)
      const isMilestone = isTaskMilestone(task)
      
      if (!isAdmin && !isMilestone) {
        return false
      }
      
      // Check if task is due on this day or spans this day
      if (task.startDate && task.dueDate) {
        return day >= task.startDate && day <= task.dueDate
      }
      
      return isSameDay(task.dueDate, day)
    })
  }

  // Get task type for styling
  const getTaskType = (task: Task) => {
    if (isTaskMilestone(task)) return "milestone"
    if (isTaskAdmin(task)) return "admin"
    return "regular" // Fallback, should not be hit with current filter
  }

  // Get task type styling
  const getTaskStyling = (type: string) => {
    switch (type) {
      case "milestone":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Get task icon
  const getTaskIcon = (type: string) => {
    switch (type) {
      case "milestone":
        return <Flag className="h-3 w-3" />
      case "admin":
        return <Calendar className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" /> // Fallback icon
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            30-Day Calendar View
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[150px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs pt-3">
          <div className="flex items-center gap-1.5">
            <Flag className="h-3 w-3 text-purple-600" />
            <span>Milestones & Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-blue-600" />
            <span>Admin & Site Work</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Calendar Grid */}
        <div className="space-y-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, dayIdx) => {
              const dayTasks = getTasksForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isTodayDate = isToday(day)
              
              return (
                <div
                  key={dayIdx}
                  className={`
                    min-h-[100px] p-1 border border-border rounded-lg
                    ${isCurrentMonth ? "bg-background" : "bg-muted/20"}
                    ${isTodayDate ? "ring-2 ring-blue-500 bg-blue-50/50" : ""}
                  `}
                >
                  {/* Day Number */}
                  <div className={`
                    text-xs font-medium mb-1 text-center
                    ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"}
                    ${isTodayDate ? "text-blue-600 font-bold" : ""}
                  `}>
                    {format(day, "d")}
                  </div>
                  
                  {/* Tasks for this day */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task, taskIdx) => {
                      const taskType = getTaskType(task)
                      const styling = getTaskStyling(taskType)
                      
                      return (
                        <div
                          key={taskIdx}
                          onClick={() => onTaskClick?.(task)}
                          className={`
                            text-xs p-1 rounded border cursor-pointer hover:opacity-80 transition-opacity
                            ${styling}
                            ${task.completed ? "opacity-50 line-through" : ""}
                          `}
                          title={`${task.title} - ${task.category}`}
                        >
                          <div className="flex items-center gap-1 truncate">
                            {getTaskIcon(taskType)}
                            <span className="truncate">{task.title}</span>
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Show count if more tasks */}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {categorizedTasks.milestones.length}
            </div>
            <div className="text-xs text-muted-foreground">Milestones</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {categorizedTasks.adminTasks.length}
            </div>
            <div className="text-xs text-muted-foreground">Admin Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {categorizedTasks.completedCount}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 