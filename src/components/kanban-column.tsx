"use client"

import type React from "react"

import type { Task } from "../types/task"
import { TaskCard } from "./task-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface KanbanColumnProps {
  column: any
  tasks: Task[]
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, status: Task["status"]) => void
  onDragStart: (e: React.DragEvent, task: Task) => void
  onTaskClick: (task: Task) => void
  onAddTask: (status: Task["status"]) => void
  showProject?: boolean
}

export function KanbanColumn({
  column,
  tasks,
  onDragOver,
  onDrop,
  onDragStart,
  onTaskClick,
  onAddTask,
  showProject,
}: KanbanColumnProps) {
  const incompleteTasks = tasks.filter((task) => task.status === column.status && !task.completed)
  const completedTasks = tasks.filter((task) => task.status === column.status && task.completed)

  return (
    <div className="flex-shrink-0 w-80">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              {column.title}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {incompleteTasks.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => onAddTask(column.status)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add task
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="min-h-[200px] space-y-2" onDragOver={onDragOver} onDrop={(e) => onDrop(e, column.status)}>
            {/* Active Tasks */}
            {incompleteTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDragStart={onDragStart}
                onTaskClick={onTaskClick}
                showProject={showProject}
              />
            ))}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Completed ({completedTasks.length})</h4>
                <div className="space-y-2 opacity-60">
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDragStart={onDragStart}
                      onTaskClick={onTaskClick}
                      showProject={showProject}
                    />
                  ))}
                </div>
              </div>
            )}

            {incompleteTasks.length === 0 && completedTasks.length === 0 && (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No tasks yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
