"use client"

import type React from "react"

import type { Task } from "../../types/task"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, RotateCcw, AlertTriangle, User, FolderKanban, DollarSign, TrendingUp, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { 
  calculateCVCMetrics, 
  formatCurrency, 
  formatPercentage, 
  getCVCStatusColor, 
  hasTimeLoggedButIncomplete 
} from "@/lib/cvc-utils"

interface TaskCardProps {
  task: Task
  onDragStart: (e: React.DragEvent, task: Task) => void
  onTaskClick: (task: Task) => void
  showProject?: boolean
}

export function TaskCard({ task, onDragStart, onTaskClick, showProject = false }: TaskCardProps) {
  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTimeUrgency = (dueDate?: Date) => {
    if (!dueDate) return null

    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { label: "Overdue", color: "bg-red-500 text-white" }
    if (diffDays === 0) return { label: "Due Today", color: "bg-orange-500 text-white" }
    if (diffDays === 1) return { label: "Due Tomorrow", color: "bg-yellow-500 text-white" }
    if (diffDays <= 3) return { label: `${diffDays} days`, color: "bg-blue-500 text-white" }
    return { label: format(dueDate, "MMM d"), color: "bg-gray-500 text-white" }
  }

  const urgency = getTimeUrgency(task.dueDate)
  const cvcData = calculateCVCMetrics(task)
  const cvcStatusColor = cvcData ? getCVCStatusColor(cvcData.cvcScore) : null
  const hasIncompleteTime = hasTimeLoggedButIncomplete(task)

  return (
    <Card
      className={`mb-3 cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 ${
        cvcData && cvcData.isNegative 
          ? "border-l-red-500 bg-red-50/50" 
          : "border-l-transparent hover:border-l-blue-500"
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onTaskClick(task)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title and Priority */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm leading-tight flex-1">{task.title}</h3>
            <div className="flex items-center gap-1">
              <Badge className={`text-xs ${getPriorityBadge(task.priority)}`}>
              {task.priority === "high" && <AlertTriangle className="w-3 h-3 mr-1" />}
              {task.priority.toUpperCase()}
            </Badge>
              {cvcData && cvcData.isNegative && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Negative CVC
                </Badge>
              )}
            </div>
          </div>

          {/* Project Name */}
          {showProject && task.projectName && (
            <Badge variant="outline" className="text-xs font-normal">
              <FolderKanban className="w-3 h-3 mr-1.5" />
              {task.projectName}
            </Badge>
          )}

          {/* CVC Summary (if available) */}
          {cvcData && (
            <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-green-600" />
                  <span className="text-green-700">{formatCurrency(cvcData.estimatedContributionValue)}</span>
                </div>
                <span className="text-gray-400">|</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-gray-600" />
                  <span className={cvcStatusColor?.color}>{formatCurrency(cvcData.cvcScore)}</span>
                </div>
              </div>
              {cvcData.hoursLogged && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span className="text-blue-700">{cvcData.hoursLogged}h</span>
                  {task.completed && <CheckCircle className="w-3 h-3 text-green-600 ml-1" />}
                </div>
              )}
            </div>
          )}

          {/* Time Alert */}
          {hasIncompleteTime && (
            <div className="flex items-center gap-1 text-xs text-orange-700 bg-orange-50 p-1 rounded">
              <AlertTriangle className="w-3 h-3" />
              <span>Time logged but incomplete</span>
            </div>
          )}

          {/* Description */}
          {task.description && <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer with metadata */}
          <div className="flex items-center justify-between text-xs pt-2 border-t mt-2">
            <div className="flex items-center gap-2">
              {task.isRecurring && (
                <Badge variant="outline" className="text-xs">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {task.recurringType}
                </Badge>
              )}

              {urgency && (
                <Badge className={`text-xs ${urgency.color}`}>
                  <Clock className="w-3 h-3 mr-1" />
                  {urgency.label}
                </Badge>
              )}
            </div>

            {task.assignee && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{task.assignee}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
