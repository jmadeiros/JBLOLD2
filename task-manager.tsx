"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, AlertTriangle, Plus, Trash2, RotateCcw } from "lucide-react"
import { format } from "date-fns"

interface Task {
  id: string
  title: string
  completed: boolean
  priority: "high" | "medium" | "low"
  dueDate?: Date
  isRecurring?: boolean
  recurringType?: "daily" | "weekly" | "monthly"
}

export default function Component() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete project proposal",
      completed: false,
      priority: "high",
      dueDate: new Date(2025, 0, 2),
    },
    {
      id: "2",
      title: "Review team feedback",
      completed: false,
      priority: "medium",
      dueDate: new Date(2025, 0, 5),
    },
    {
      id: "3",
      title: "Update documentation",
      completed: true,
      priority: "low",
    },
  ])

  const [recurringTasks, setRecurringTasks] = useState<Task[]>([
    {
      id: "r1",
      title: "Daily standup meeting",
      completed: false,
      priority: "medium",
      isRecurring: true,
      recurringType: "daily",
    },
    {
      id: "r2",
      title: "Weekly team review",
      completed: false,
      priority: "high",
      isRecurring: true,
      recurringType: "weekly",
    },
    {
      id: "r3",
      title: "Monthly report",
      completed: true,
      priority: "high",
      isRecurring: true,
      recurringType: "monthly",
    },
  ])

  const [newTask, setNewTask] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium")
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date>()
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringType, setRecurringType] = useState<"daily" | "weekly" | "monthly">("daily")

  const addTask = () => {
    if (newTask.trim() === "") return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false,
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      isRecurring,
      recurringType: isRecurring ? recurringType : undefined,
    }

    if (isRecurring) {
      setRecurringTasks([...recurringTasks, task])
    } else {
      setTasks([...tasks, task])
    }

    setNewTask("")
    setNewTaskDueDate(undefined)
    setIsRecurring(false)
  }

  const toggleTask = (id: string, isRecurringTask = false) => {
    if (isRecurringTask) {
      setRecurringTasks(recurringTasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
    } else {
      setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
    }
  }

  const deleteTask = (id: string, isRecurringTask = false) => {
    if (isRecurringTask) {
      setRecurringTasks(recurringTasks.filter((task) => task.id !== id))
    } else {
      setTasks(tasks.filter((task) => task.id !== id))
    }
  }

  const getPriorityColor = (priority: string) => {
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

  const TaskItem = ({ task, isRecurringTask = false }: { task: Task; isRecurringTask?: boolean }) => {
    const urgency = getTimeUrgency(task.dueDate)

    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${
          task.completed ? "bg-gray-50 opacity-75" : "bg-white"
        }`}
      >
        <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id, isRecurringTask)} />

        <div className="flex-1 min-w-0">
          <div className={`font-medium ${task.completed ? "line-through text-gray-500" : ""}`}>{task.title}</div>

          <div className="flex items-center gap-2 mt-1">
            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority.toUpperCase()}</Badge>

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
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteTask(task.id, isRecurringTask)}
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    // Completed tasks go to bottom
    if (a.completed !== b.completed) return a.completed ? 1 : -1

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    if (priorityDiff !== 0) return priorityDiff

    // Sort by due date
    if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime()
    if (a.dueDate) return -1
    if (b.dueDate) return 1

    return 0
  })

  const sortedRecurringTasks = [...recurringTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
        <p className="text-gray-600 mt-2">Organize your tasks by priority and deadlines</p>
      </div>

      {/* Add Task Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Task
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter task title..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="flex-1"
            />
            <Button onClick={addTask}>Add Task</Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Priority:</label>
              <Select
                value={newTaskPriority}
                onValueChange={(value: "high" | "medium" | "low") => setNewTaskPriority(value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Due Date:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-40 justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTaskDueDate ? format(newTaskDueDate, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={newTaskDueDate} onSelect={setNewTaskDueDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox checked={isRecurring} onCheckedChange={setIsRecurring} />
              <label className="text-sm font-medium">Recurring</label>
              {isRecurring && (
                <Select
                  value={recurringType}
                  onValueChange={(value: "daily" | "weekly" | "monthly") => setRecurringType(value)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Tabs */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Tasks ({tasks.filter((t) => !t.completed).length})
          </TabsTrigger>
          <TabsTrigger value="recurring" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Recurring ({recurringTasks.filter((t) => !t.completed).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-3">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tasks yet. Add your first task above!</div>
          ) : (
            sortedTasks.map((task) => <TaskItem key={task.id} task={task} />)
          )}
        </TabsContent>

        <TabsContent value="recurring" className="space-y-3">
          {sortedRecurringTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No recurring tasks yet. Add a recurring task above!</div>
          ) : (
            sortedRecurringTasks.map((task) => <TaskItem key={task.id} task={task} isRecurringTask />)
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter((t) => !t.completed && t.priority === "high").length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">
              {
                tasks.filter((t) => !t.completed && t.dueDate && getTimeUrgency(t.dueDate)?.label === "Due Today")
                  .length
              }
            </div>
            <div className="text-sm text-gray-600">Due Today</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{tasks.filter((t) => t.completed).length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{recurringTasks.filter((t) => !t.completed).length}</div>
            <div className="text-sm text-gray-600">Recurring Active</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
