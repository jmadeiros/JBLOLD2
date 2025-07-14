"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, SortAsc } from "lucide-react"
import type { Task } from "../types/task"

interface PageHeaderProps {
  tasks: Task[]
  onAddTask: () => void
}

export function PageHeader({ tasks, onAddTask }: PageHeaderProps) {
  const activeTasks = tasks.filter((task) => !task.completed)
  const highPriorityTasks = activeTasks.filter((task) => task.priority === "high")
  const overdueTasks = activeTasks.filter((task) => {
    if (!task.dueDate) return false
    return task.dueDate < new Date()
  })

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-semibold">Task Board</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{activeTasks.length} active tasks</span>
              {highPriorityTasks.length > 0 && (
                <>
                  <Separator orientation="vertical" className="h-3" />
                  <Badge variant="destructive" className="text-xs">
                    {highPriorityTasks.length} high priority
                  </Badge>
                </>
              )}
              {overdueTasks.length > 0 && (
                <>
                  <Separator orientation="vertical" className="h-3" />
                  <Badge variant="outline" className="text-xs border-red-200 text-red-700">
                    {overdueTasks.length} overdue
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search tasks..." className="w-[300px] pl-8" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline" size="sm">
          <SortAsc className="h-4 w-4 mr-2" />
          Sort
        </Button>
        <Button size="sm" onClick={onAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
    </header>
  )
}
