"use client"

import type React from "react"

import { useState } from "react"
import type { Task, KanbanColumn } from "../types/task"
import { KanbanColumn as KanbanColumnComponent } from "./kanban-column"
import { TaskDialog } from "./task-dialog"

interface KanbanBoardProps {
  tasks: Task[]
  onUpdateTask: (task: Task) => void
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
  showProject?: boolean
}

const columns: KanbanColumn[] = [
  { id: "todo", title: "To Do", status: "todo", color: "bg-gray-400" },
  { id: "in-progress", title: "In Progress", status: "in-progress", color: "bg-blue-400" },
  { id: "review", title: "Review", status: "review", color: "bg-yellow-400" },
  { id: "done", title: "Done", status: "done", color: "bg-green-400" },
]

export function KanbanBoard({ tasks, onUpdateTask, onAddTask, showProject = false }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTaskStatus, setNewTaskStatus] = useState<Task["status"]>("todo")

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== status) {
      onUpdateTask({
        ...draggedTask,
        status,
        updatedAt: new Date(),
      })
    }
    setDraggedTask(null)
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsDialogOpen(true)
  }

  const handleAddTask = (status: Task["status"]) => {
    setNewTaskStatus(status)
    setSelectedTask(null)
    setIsDialogOpen(true)
  }

  const handleSaveTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    if (selectedTask) {
      // Update existing task
      onUpdateTask({
        ...selectedTask,
        ...taskData,
        updatedAt: new Date(),
      })
    } else {
      // Add new task
      onAddTask({
        ...taskData,
        status: newTaskStatus,
      })
    }
    setIsDialogOpen(false)
    setSelectedTask(null)
  }

  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-6">
        {columns.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            tasks={tasks}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
            showProject={showProject}
          />
        ))}
      </div>

      <TaskDialog
        task={selectedTask}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveTask}
      />
    </>
  )
}
