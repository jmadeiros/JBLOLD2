"use client"

import React from "react"
import type { Task } from "../types/task"
import { useMemo } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  differenceInDays,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  endOfWeek,
  isWithinInterval,
  startOfDay,
} from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"

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
    hash = hash & hash
  }
  const index = Math.abs(hash % colors.length)
  return colors[index]
}

const TASK_COLORS = [
  "bg-cyan-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-sky-500",
  "bg-blue-600",
  "bg-indigo-600",
  "bg-purple-600",
]

const DAY_WIDTH_PX = 36
const ROW_HEIGHT_PX = 40
const SIDE_PANEL_WIDTH_PX = 300

interface GanttTimelineProps {
  tasks: Task[]
  viewStartDate: Date
  viewEndDate: Date
}

export function GanttTimeline({ tasks, viewStartDate, viewEndDate }: GanttTimelineProps) {
  const projectsWithTasks = useMemo(() => {
    const projectMap = new Map<string, { id: string; name: string; tasks: Task[] }>()
    tasks.forEach((task) => {
      if (task.projectId && task.projectName) {
        if (!projectMap.has(task.projectId)) {
          projectMap.set(task.projectId, {
            id: task.projectId,
            name: task.projectName,
            tasks: [],
          })
        }
        projectMap.get(task.projectId)!.tasks.push(task)
      }
    })
    return Array.from(projectMap.values())
  }, [tasks])

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

  return (
    <div className="relative border rounded-lg overflow-auto bg-card text-card-foreground shadow-sm">
      <div
        className="grid"
        style={{ gridTemplateColumns: `${SIDE_PANEL_WIDTH_PX}px minmax(${timelineWidth}px, auto)` }}
      >
        {/* HEADER */}
        <div className="sticky top-0 left-0 z-30 bg-card border-b border-r">
          <div className="h-[65px]" />
        </div>
        <div className="sticky top-0 z-20 bg-card border-b">
          <div className="flex">
            {weeks.map((week, index) => {
              const daysInWeek = eachDayOfInterval({ start: week.start, end: week.end }).filter(
                (d) => d >= viewStartDate && d <= viewEndDate,
              ).length
              if (daysInWeek === 0) return null
              return (
                <div
                  key={index}
                  className="text-center text-sm font-semibold py-2 border-r"
                  style={{ width: `${daysInWeek * DAY_WIDTH_PX}px` }}
                >
                  {format(week.start, "MMM d")} - {format(week.end, "d")}
                </div>
              )
            })}
          </div>
          <div className="flex">
            {days.map((day, index) => (
              <div
                key={index}
                className="text-center text-xs text-muted-foreground py-1 border-r"
                style={{ width: `${DAY_WIDTH_PX}px` }}
              >
                {format(day, "E")[0]}
              </div>
            ))}
          </div>
        </div>

        {/* BODY */}
        {projectsWithTasks.map((project) => (
          <React.Fragment key={project.id}>
            {/* Project Header Row */}
            <div className="contents">
              <div
                className="sticky left-0 col-start-1 col-span-1 bg-card border-b border-t border-r p-2 z-10"
                style={{ height: `${ROW_HEIGHT_PX}px` }}
              >
                <h3 className="font-semibold text-sm truncate flex items-center h-full">{project.name}</h3>
              </div>
              <div
                className="col-start-2 col-span-1 bg-muted/30 border-b border-t p-2 relative"
                style={{ height: `${ROW_HEIGHT_PX}px` }}
              />
            </div>

            {project.tasks.map((task, taskIndex) => {
              const startDayIndex = task.startDate ? differenceInDays(task.startDate, viewStartDate) : -1
              const endDayIndex = task.dueDate ? differenceInDays(task.dueDate, viewStartDate) : -1
              const duration = startDayIndex >= 0 && endDayIndex >= 0 ? endDayIndex - startDayIndex + 1 : 0

              return (
                <div className="contents group" key={task.id}>
                  <div
                    className="sticky left-0 flex items-center justify-between text-sm p-2 border-b border-r truncate bg-card group-hover:bg-muted/50 z-10 transition-colors"
                    style={{ height: `${ROW_HEIGHT_PX}px` }}
                  >
                    <span className="text-muted-foreground truncate">{task.title}</span>
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className={cn("text-xs font-bold", nameToColor(task.assignee || ""))}>
                        {getInitials(task.assignee)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div
                    className="relative border-b group-hover:bg-muted/50 transition-colors"
                    style={{ height: `${ROW_HEIGHT_PX}px` }}
                  >
                    {duration > 0 && startDayIndex < totalDays && startDayIndex >= 0 && (
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "absolute h-7 my-auto rounded-sm flex items-center px-2 text-white text-xs cursor-pointer shadow-sm hover:shadow-md transition-all",
                                TASK_COLORS[taskIndex % TASK_COLORS.length],
                              )}
                              style={{
                                top: `calc((${ROW_HEIGHT_PX}px - 28px) / 2)`,
                                left: `${startDayIndex * DAY_WIDTH_PX + 2}px`,
                                width: `${duration * DAY_WIDTH_PX - 4}px`,
                              }}
                            >
                              <span className="truncate">{task.title}</span>
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
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              )
            })}
          </React.Fragment>
        ))}

        {/* Today Marker */}
        {todayPosition >= 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500/70 z-20 pointer-events-none"
            style={{ left: `${SIDE_PANEL_WIDTH_PX + todayPosition + DAY_WIDTH_PX / 2}px` }}
          >
            <div className="sticky top-0">
              <div className="absolute -top-5 -translate-x-1/2 text-xs text-red-500 font-semibold bg-card px-1 rounded shadow-sm">
                Today
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
