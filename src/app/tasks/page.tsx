"use client"

import { useState, useEffect } from "react"
import type { Task } from "../../../types/task"
import { KanbanBoard } from "../../components/kanban-board"
import { PageHeader } from "../../components/page-header"
import { TaskDialog } from "../../components/task-dialog"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Pause,
  RotateCcw,
  HardHat,
  Building,
  Hammer
} from "lucide-react"


const initialTasks: Task[] = [
  {
    id: "1",
    title: "Foundation Pouring - Sector A",
    description: "Pour concrete for the main foundation in Sector A. Weather permitting.",
    completed: false,
    priority: "high",
    status: "in-progress",
    dueDate: new Date(2025, 0, 5),
    assignee: "Carlos Ramirez",
    tags: ["structural", "concrete"],
    createdAt: new Date(2024, 11, 20),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
    cvc: {
      estimatedContributionValue: 8500,
      costs: {
        labourCost: 1760, // 8 days × 22/hour × 10 hours
        materialsCost: 2500, // concrete, reinforcing steel
        equipmentCost: 800, // concrete mixer, pumping equipment
        travelAccommodation: 150, // local travel
        subcontractorFees: 1200, // specialist concrete contractor
        bonusesAdjustments: 0
      },
      totalCost: 6410,
      cvcScore: 2090,
      cvcPercentage: 24.6,
      isNegative: false,
      hoursLogged: 35.5,
      hourlyRate: 22
    }
  },
  {
    id: "2",
    title: "Electrical Rough-in - Floor 3",
    description: "Complete all electrical rough-ins for the third floor units.",
    completed: false,
    priority: "medium",
    status: "todo",
    dueDate: new Date(2025, 0, 8),
    assignee: "Maria Garcia",
    tags: ["electrical", "MEP"],
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 22),
    projectId: "2",
    projectName: "Manchester Residential Complex",
    cvc: {
      estimatedContributionValue: 4500,
      costs: {
        labourCost: 1320, // 6 days × 22/hour × 10 hours
        materialsCost: 1800, // cables, conduits, outlets
        equipmentCost: 200, // electrical tools
        travelAccommodation: 100,
        subcontractorFees: 0,
        bonusesAdjustments: 0
      },
      totalCost: 3420,
      cvcScore: 1080,
      cvcPercentage: 24.0,
      isNegative: false,
      hoursLogged: 28.5,
      hourlyRate: 22
    }
  },
  {
    id: "3",
    title: "Weekly Safety Inspection",
    completed: false,
    priority: "high",
    status: "todo",
    isRecurring: true,
    recurringType: "weekly",
    assignee: "David Chen",
    tags: ["safety", "inspection"],
    createdAt: new Date(2024, 11, 15),
    updatedAt: new Date(2024, 11, 29),
    projectId: "1",
    projectName: "London Office Tower",
    cvc: {
      estimatedContributionValue: 800,
      costs: {
        labourCost: 176, // 8 hours × 22/hour
        materialsCost: 50, // safety materials, tags
        equipmentCost: 100, // safety equipment
        travelAccommodation: 50,
        subcontractorFees: 0,
        bonusesAdjustments: 0
      },
      totalCost: 376,
      cvcScore: 424,
      cvcPercentage: 53.0,
      isNegative: false,
      hoursLogged: 8,
      hourlyRate: 22
    }
  },
  {
    id: "4",
    title: "Install HVAC units on Roof",
    description: "Crane lift scheduled for 8 AM. All units to be installed by EOD.",
    completed: false,
    priority: "high",
    status: "review",
    dueDate: new Date(2024, 11, 30), // Overdue
    assignee: "Frank Miller",
    tags: ["HVAC", "MEP", "urgent"],
    createdAt: new Date(2024, 11, 28),
    updatedAt: new Date(2024, 11, 29),
    projectId: "1",
    projectName: "London Office Tower",
    cvc: {
      estimatedContributionValue: 12000,
      costs: {
        labourCost: 1540, // 7 days × 22/hour × 10 hours
        materialsCost: 8500, // HVAC units, ductwork
        equipmentCost: 2500, // crane hire
        travelAccommodation: 200,
        subcontractorFees: 1800, // HVAC specialist
        bonusesAdjustments: 500 // weekend work bonus
      },
      totalCost: 15040,
      cvcScore: -3040,
      cvcPercentage: -25.3,
      isNegative: true,
      hoursLogged: 42.0,
      hourlyRate: 22
    }
  },
  {
    id: "5",
    title: "Submit Material Order for Drywall",
    description: "Order plasterboard materials for next phase of construction.",
    completed: true,
    priority: "low",
    status: "done",
    dueDate: new Date(2024, 11, 28), // Completed
    assignee: "David Chen",
    tags: ["procurement", "materials"],
    createdAt: new Date(2024, 11, 20),
    updatedAt: new Date(2024, 11, 27),
    projectId: "2",
    projectName: "Manchester Residential Complex",
    cvc: {
      estimatedContributionValue: 2000,
      costs: {
        labourCost: 88, // 4 hours × 22/hour
        materialsCost: 1500, // drywall sheets, fasteners
        equipmentCost: 0,
        travelAccommodation: 50,
        subcontractorFees: 0,
        bonusesAdjustments: 0
      },
      totalCost: 1638,
      cvcScore: 362,
      cvcPercentage: 18.1,
      isNegative: false,
      hoursLogged: 4,
      hourlyRate: 22
    }
  },
  {
    id: "6",
    title: "Electrical Panel Installation",
    description: "Install main electrical panels and distribution boards.",
    completed: false,
    priority: "high",
    status: "todo",
    dueDate: new Date(2025, 0, 10),
    assignee: "Maria Garcia",
    tags: ["electrical", "critical"],
    createdAt: new Date(2024, 11, 25),
    updatedAt: new Date(2024, 11, 25),
    projectId: "2",
    projectName: "Manchester Residential Complex",
    cvc: {
      estimatedContributionValue: 6000,
      costs: {
        labourCost: 880, // 5 days × 22/hour × 8 hours
        materialsCost: 3200, // panels, breakers, wiring
        equipmentCost: 300, // electrical tools
        travelAccommodation: 100,
        subcontractorFees: 500, // electrical inspector
        bonusesAdjustments: 0
      },
      totalCost: 4980,
      cvcScore: 1020,
      cvcPercentage: 17.0,
      isNegative: false,
      hoursLogged: 40,
      hourlyRate: 22
    }
  }
]

export default function Page() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterProject, setFilterProject] = useState("all")
  const [filterAssignee, setFilterAssignee] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "supervisor">("kanban")

  // Debug function to check localStorage
  const debugLocalStorage = () => {
    try {
      const importedTasks = localStorage.getItem('importedTasks')
      const latestProject = localStorage.getItem('latestProjectData')
      console.log('=== DEBUG localStorage ===')
      console.log('importedTasks:', importedTasks)
      console.log('latestProjectData:', latestProject)
      
      if (importedTasks) {
        const parsed = JSON.parse(importedTasks)
        console.log('Parsed imported tasks count:', parsed.length)
        console.log('First task:', parsed[0])
      }
      
      // Force reload
      forceLoadImportedTasks()
    } catch (error) {
      console.error('Debug localStorage error:', error)
    }
  }

  // Force reload imported tasks
  const forceLoadImportedTasks = () => {
    try {
      const importedTasks = JSON.parse(localStorage.getItem('importedTasks') || '[]')
      console.log('Force loading imported tasks:', importedTasks.length)
      
      if (importedTasks.length > 0) {
        const tasksWithDates = importedTasks.map((task: any) => ({
          ...task,
          startDate: task.startDate ? new Date(task.startDate) : undefined,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        }))
        
        // Replace all tasks with imported ones
        setTasks(tasksWithDates)
        console.log('Tasks set to:', tasksWithDates.length, 'imported tasks')
      }
    } catch (error) {
      console.error('Force load error:', error)
    }
  }

  // Load imported tasks from localStorage
  useEffect(() => {
    const loadImportedTasks = () => {
      try {
        const importedTasks = JSON.parse(localStorage.getItem('importedTasks') || '[]')
        if (importedTasks.length > 0) {
          console.log('Loading imported tasks:', importedTasks)
          // Convert date strings back to Date objects
          const tasksWithDates = importedTasks.map((task: any) => ({
            ...task,
            startDate: task.startDate ? new Date(task.startDate) : undefined,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt)
          }))
          
          setTasks(prevTasks => {
            // Avoid duplicates by checking if tasks are already imported
            const existingIds = new Set(prevTasks.map(t => t.id))
            const newTasks = tasksWithDates.filter((task: Task) => !existingIds.has(task.id))
            return [...prevTasks, ...newTasks]
          })
        }
      } catch (error) {
        console.error('Failed to load imported tasks:', error)
      }
    }

    loadImportedTasks()

    // Listen for storage changes (when tasks are imported from another tab/component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'importedTasks') {
        loadImportedTasks()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const handleAddTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTasks([...tasks, newTask])
  }

  const handleOpenAddDialog = () => {
    setSelectedTask(null)
    setIsDialogOpen(true)
  }

  // Get unique values for filters
  const projects = Array.from(new Set(tasks.map(t => t.projectName).filter(Boolean))) as string[]
  const assignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))) as string[]

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (filterProject !== "all" && task.projectName !== filterProject) return false
    if (filterAssignee !== "all" && task.assignee !== filterAssignee) return false
    if (filterStatus !== "all" && task.status !== filterStatus) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-gray-400"
      case "in-progress": return "bg-orange-400"
      case "review": return "bg-blue-400"
      case "done": return "bg-green-400"
      default: return "bg-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo": return <Clock className="h-4 w-4" />
      case "in-progress": return <Hammer className="h-4 w-4" />
      case "review": return <AlertTriangle className="h-4 w-4" />
      case "done": return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <SidebarInset>
      <PageHeader tasks={tasks} onAddTask={handleOpenAddDialog} />
      
      <div className="p-6 space-y-6">
        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Task Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="All Team Members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Team Members</SelectItem>
                  {assignees.map(assignee => (
                    <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={() => {
                  setSearchTerm("")
                  setFilterProject("all")
                  setFilterAssignee("all")
                  setFilterStatus("all")
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
            
            {/* Debug Section */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button 
                  onClick={debugLocalStorage}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  🔍 Debug: Check Import Status
                </Button>
                <span className="text-xs text-muted-foreground">
                  Current tasks: {tasks.length} (Use this if imported tasks don't appear)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="supervisor">Supervisor View</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-6">
            <KanbanBoard tasks={filteredTasks} onUpdateTask={handleUpdateTask} onAddTask={handleAddTask} showProject={true} />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Task List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        setSelectedTask(task)
                        setIsDialogOpen(true)
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{task.title}</h3>
                            {task.isRecurring && (
                              <Badge variant="outline" className="text-xs">
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Recurring
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs capitalize">
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {task.assignee}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {task.projectName || "No Project"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {task.dueDate?.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <Badge variant="outline" className="capitalize">
                          {task.status.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supervisor" className="mt-6">
            <div className="space-y-6">
              {/* Task Completion Control */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Task Completion Review
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Review and mark tasks as complete or incomplete. Click on a task for details.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredTasks
                      .filter(t => t.status === "in-progress" || t.status === "review")
                      .map(task => (
                        <div key={task.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium">{task.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {task.projectName}
                                </Badge>
                                <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"} className="text-xs">
                                  {task.priority}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {task.assignee}
                                </span>
                                {task.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Due: {task.dueDate.toLocaleDateString()}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(task.status)}
                                  {task.status.replace("-", " ")}
                                </span>
                              </div>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updatedTask = { ...task, status: "done" as const, completed: true, updatedAt: new Date() }
                                  handleUpdateTask(updatedTask)
                                }}
                                className="text-green-600 hover:bg-green-50 hover:text-green-700 border-green-300"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Complete
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updatedTask = { ...task, status: "todo" as const, completed: false, updatedAt: new Date() }
                                  handleUpdateTask(updatedTask)
                                }}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-300"
                              >
                                <Pause className="h-4 w-4 mr-2" />
                                Mark Incomplete
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTask(task)
                                  setIsDialogOpen(true)
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {filteredTasks.filter(t => t.status === "in-progress" || t.status === "review").length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No tasks currently in progress or review.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team Workload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HardHat className="h-5 w-5" />
                      Team Workload
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assignees.map(assignee => {
                        const assigneeTasks = filteredTasks.filter(t => t.assignee === assignee)
                        const inProgress = assigneeTasks.filter(t => t.status === "in-progress").length
                        const completed = assigneeTasks.filter(t => t.status === "done").length
                        const total = assigneeTasks.length
                        return (
                          <div key={assignee} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">{assignee}</span>
                              <span className="text-sm text-muted-foreground">
                                {inProgress} active • {completed} done • {total} total
                              </span>
                            </div>
                            <div className="flex gap-1">
                              {assigneeTasks.map(task => (
                                <div 
                                  key={task.id}
                                  className={`w-4 h-4 rounded ${getStatusColor(task.status)}`}
                                  title={`${task.title} - ${task.status}`}
                                />
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Critical Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      High Priority Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredTasks
                        .filter(t => t.priority === "high" && t.status !== "done")
                        .map(task => (
                          <div 
                            key={task.id}
                            className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                            onClick={() => {
                              setSelectedTask(task)
                              setIsDialogOpen(true)
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{task.title}</h4>
                                <p className="text-sm text-muted-foreground">{task.assignee}</p>
                                {task.dueDate && (
                                  <p className="text-xs text-muted-foreground">
                                    Due: {task.dueDate.toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                <Badge variant="destructive" className="text-xs">
                                  {task.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {task.status.replace("-", " ")}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      
                      {filteredTasks.filter(t => t.priority === "high" && t.status !== "done").length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          <p className="text-sm">No high priority tasks pending.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <TaskDialog
        task={selectedTask}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={(taskData) => {
          if (selectedTask) {
            handleUpdateTask({ ...selectedTask, ...taskData, updatedAt: new Date() })
          } else {
          handleAddTask(taskData)
          }
          setIsDialogOpen(false)
        }}
      />
    </SidebarInset>
  )
}
