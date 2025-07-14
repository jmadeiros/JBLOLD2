"use client"

import { useState, useMemo, useEffect } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  Plus, 
  MapPin, 
  Users, 
  Calendar, 
  Building, 
  HardHat,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Edit,
  Hammer,
  UserPlus,
  GripVertical,
  Trash2
} from "lucide-react"
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameWeek } from "date-fns"
import Link from "next/link"
import type { Task } from "../../../../types/task"
import { TaskDialog } from "../../../components/task-dialog"

// Project interface
interface Project {
  id: string
  name: string
  location: string
  description: string
  status: "Pre-construction" | "In Progress" | "On Hold" | "Substantially Complete" | "Completed"
  priority: "high" | "medium" | "low"
  progress: number
  dueDate: string
  teamMembers: number
  tasksCompleted: number
  totalTasks: number
  tasksByStatus: {
    todo: number
    inProgress: number
    review: number
    done: number
  }
  trades: string[]
  siteSupervisor: string
  criticalPathTasks: number
}

// Team member interface for drag and drop
interface TeamMember {
  id: string
  name: string
  role: string
  department: "Management" | "Site Crew" | "Engineering" | "Trades"
  status: "active" | "away" | "busy"
  color: string
  avatar?: string
}

// Mock project data
const allProjects: Project[] = [
  {
    id: "1",
    name: "Downtown Office Tower",
    location: "123 Main St, Metropolis",
    description: "Construction of a 40-story commercial office building with retail space.",
    status: "In Progress",
    priority: "high",
    progress: 45,
    dueDate: "Jun 15, 2026",
    teamMembers: 25,
    tasksCompleted: 88,
    totalTasks: 210,
    tasksByStatus: {
      todo: 45,
      inProgress: 77,
      review: 15,
      done: 73
    },
    trades: ["Structural", "Electrical", "Plumbing", "HVAC", "Finishes"],
    siteSupervisor: "David Chen",
    criticalPathTasks: 12
  },
  {
    id: "2",
    name: "Greenwood Residential Complex",
    location: "456 Oak Ave, Suburbia",
    description: "Development of a 150-unit residential complex with community amenities.",
    status: "In Progress",
    priority: "high", 
    progress: 65,
    dueDate: "Dec 1, 2025",
    teamMembers: 18,
    tasksCompleted: 112,
    totalTasks: 180,
    tasksByStatus: {
      todo: 25,
      inProgress: 43,
      review: 12,
      done: 100
    },
    trades: ["Framing", "Electrical", "Plumbing", "Drywall", "Flooring"],
    siteSupervisor: "Sarah Johnson",
    criticalPathTasks: 8
  },
  {
    id: "3",
    name: "Harbor View Shopping Center",
    location: "789 Coastal Blvd, Seaside",
    description: "Renovation and expansion of existing retail complex.",
    status: "Pre-construction",
    priority: "medium",
    progress: 15,
    dueDate: "Sep 30, 2025",
    teamMembers: 12,
    tasksCompleted: 18,
    totalTasks: 95,
    tasksByStatus: {
      todo: 65,
      inProgress: 12,
      review: 8,
      done: 10
    },
    trades: ["Demolition", "Structural", "Electrical", "HVAC"],
    siteSupervisor: "Mike Rodriguez",
    criticalPathTasks: 5
  }
]

// Team members data
const allTeamMembers: TeamMember[] = [
  { id: "1", name: "David Chen", role: "Project Manager", department: "Management", status: "active", color: "bg-blue-500" },
  { id: "2", name: "Carlos Ramirez", role: "Site Supervisor", department: "Site Crew", status: "active", color: "bg-green-500" },
  { id: "3", name: "Maria Garcia", role: "Lead Electrician", department: "Trades", status: "active", color: "bg-yellow-500" },
  { id: "4", name: "Frank Miller", role: "HVAC Specialist", department: "Trades", status: "busy", color: "bg-purple-500" },
  { id: "5", name: "Sarah Jenkins", role: "Structural Engineer", department: "Engineering", status: "active", color: "bg-red-500" },
  { id: "6", name: "Mike Johnson", role: "Plumbing Foreman", department: "Trades", status: "active", color: "bg-indigo-500" },
  { id: "7", name: "Lisa Wong", role: "Safety Coordinator", department: "Site Crew", status: "active", color: "bg-pink-500" },
  { id: "8", name: "Tom Wilson", role: "Equipment Operator", department: "Site Crew", status: "away", color: "bg-gray-500" }
]

// Mock tasks for project
const allTasks: Task[] = [
  {
    id: "1",
    title: "Foundation Pouring - Sector A",
    description: "Pour concrete for the main foundation in Sector A. Weather permitting.",
    completed: false,
    priority: "high",
    status: "in-progress",
    startDate: new Date(2025, 0, 6), // Monday
    dueDate: new Date(2025, 0, 8), // Wednesday
    assignee: "Carlos Ramirez",
    tags: ["structural", "concrete"],
    createdAt: new Date(2024, 11, 20),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Structural"
  },
  {
    id: "2",
    title: "Morning Safety Briefing",
    description: "Daily safety briefing for all crew members",
    completed: true,
    priority: "high",
    status: "done",
    startDate: new Date(2025, 0, 6), // Monday
    dueDate: new Date(2025, 0, 6), // Monday
    assignee: "Lisa Wong",
    tags: ["safety"],
    createdAt: new Date(2024, 11, 20),
    updatedAt: new Date(2025, 0, 6),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Safety"
  },
  {
    id: "3",
    title: "Equipment Inspection",
    description: "Weekly inspection of all construction equipment",
    completed: false,
    priority: "medium",
    status: "in-progress",
    startDate: new Date(2025, 0, 6), // Monday
    dueDate: new Date(2025, 0, 6), // Monday
    assignee: "Tom Wilson",
    tags: ["equipment", "safety"],
    createdAt: new Date(2024, 11, 20),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Site Work"
  },
  {
    id: "4",
    title: "Plumbing Rough-in - Basement",
    description: "Install plumbing rough-in for basement level.",
    completed: true,
    priority: "high",
    status: "done",
    startDate: new Date(2025, 0, 6), // Monday
    dueDate: new Date(2025, 0, 7), // Tuesday
    assignee: "Mike Johnson",
    tags: ["plumbing"],
    createdAt: new Date(2024, 11, 18),
    updatedAt: new Date(2025, 0, 7),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Plumbing"
  },
  {
    id: "5",
    title: "Rebar Installation - Floor 2",
    description: "Install reinforcement bars for second floor concrete pour",
    completed: false,
    priority: "high",
    status: "todo",
    startDate: new Date(2025, 0, 7), // Tuesday
    dueDate: new Date(2025, 0, 8), // Wednesday
    assignee: "Carlos Ramirez",
    tags: ["structural", "rebar"],
    createdAt: new Date(2024, 11, 21),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Structural"
  },
  {
    id: "6",
    title: "Window Frame Delivery",
    description: "Receive and inspect window frame delivery",
    completed: false,
    priority: "medium",
    status: "todo",
    startDate: new Date(2025, 0, 7), // Tuesday
    dueDate: new Date(2025, 0, 7), // Tuesday
    assignee: "David Chen",
    tags: ["procurement", "delivery"],
    createdAt: new Date(2024, 11, 21),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Procurement"
  },
  {
    id: "7",
    title: "Electrical Panel Installation",
    description: "Install main electrical panels in utility room",
    completed: false,
    priority: "high",
    status: "in-progress",
    startDate: new Date(2025, 0, 7), // Tuesday
    dueDate: new Date(2025, 0, 9), // Thursday
    assignee: "Maria Garcia",
    tags: ["electrical", "panels"],
    createdAt: new Date(2024, 11, 21),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Electrical"
  },
  {
    id: "8",
    title: "Electrical Rough-in - Floor 3",
    description: "Complete all electrical rough-ins for the third floor units.",
    completed: false,
    priority: "medium",
    status: "todo",
    startDate: new Date(2025, 0, 8), // Wednesday
    dueDate: new Date(2025, 0, 10), // Friday
    assignee: "Maria Garcia",
    tags: ["electrical"],
    createdAt: new Date(2024, 11, 21),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Electrical"
  },
  {
    id: "9",
    title: "Concrete Quality Testing",
    description: "Test concrete samples from foundation pour",
    completed: false,
    priority: "high",
    status: "review",
    startDate: new Date(2025, 0, 8), // Wednesday
    dueDate: new Date(2025, 0, 8), // Wednesday
    assignee: "Sarah Jenkins",
    tags: ["quality", "testing"],
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Structural"
  },
  {
    id: "10",
    title: "Site Cleanup - Zone A",
    description: "Clean up construction debris from completed foundation work",
    completed: false,
    priority: "low",
    status: "todo",
    startDate: new Date(2025, 0, 8), // Wednesday
    dueDate: new Date(2025, 0, 8), // Wednesday
    assignee: "Tom Wilson",
    tags: ["cleanup"],
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Site Work"
  },
  {
    id: "11",
    title: "HVAC Installation - Zone B",
    description: "Install HVAC units and ductwork for Zone B area.",
    completed: false,
    priority: "medium",
    status: "todo",
    startDate: new Date(2025, 0, 9), // Thursday
    dueDate: new Date(2025, 0, 11), // Saturday
    assignee: "Frank Miller",
    tags: ["hvac"],
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "HVAC"
  },
  {
    id: "12",
    title: "Fire Safety Inspection",
    description: "Monthly fire safety and equipment inspection",
    completed: false,
    priority: "high",
    status: "todo",
    startDate: new Date(2025, 0, 9), // Thursday
    dueDate: new Date(2025, 0, 9), // Thursday
    assignee: "Lisa Wong",
    tags: ["safety", "fire"],
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Safety"
  },
  {
    id: "13",
    title: "Plumbing Inspection - Floor 1",
    description: "City inspection of first floor plumbing work",
    completed: false,
    priority: "high",
    status: "review",
    startDate: new Date(2025, 0, 9), // Thursday
    dueDate: new Date(2025, 0, 9), // Thursday
    assignee: "Mike Johnson",
    tags: ["plumbing", "inspection"],
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Plumbing"
  },
  {
    id: "14",
    title: "Drywall Installation - Floor 2",
    description: "Begin drywall installation on second floor",
    completed: false,
    priority: "medium",
    status: "todo",
    startDate: new Date(2025, 0, 10), // Friday
    dueDate: new Date(2025, 0, 12), // Sunday
    assignee: "Carlos Ramirez",
    tags: ["drywall", "finishing"],
    createdAt: new Date(2024, 11, 23),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Finishes"
  },
  {
    id: "15",
    title: "Weekly Progress Report",
    description: "Compile and submit weekly progress report to client",
    completed: false,
    priority: "medium",
    status: "in-progress",
    startDate: new Date(2025, 0, 10), // Friday
    dueDate: new Date(2025, 0, 10), // Friday
    assignee: "David Chen",
    tags: ["reporting", "management"],
    createdAt: new Date(2024, 11, 23),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Site Work"
  },
  {
    id: "16",
    title: "Tool Maintenance",
    description: "Weekly maintenance of power tools and equipment",
    completed: false,
    priority: "low",
    status: "todo",
    startDate: new Date(2025, 0, 10), // Friday
    dueDate: new Date(2025, 0, 10), // Friday
    assignee: "Tom Wilson",
    tags: ["maintenance", "tools"],
    createdAt: new Date(2024, 11, 23),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Site Work"
  },
  {
    id: "17",
    title: "Material Inventory Check",
    description: "Count and verify all construction materials on site",
    completed: false,
    priority: "low",
    status: "todo",
    startDate: new Date(2025, 0, 11), // Saturday
    dueDate: new Date(2025, 0, 11), // Saturday
    assignee: "David Chen",
    tags: ["inventory", "materials"],
    createdAt: new Date(2024, 11, 23),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Procurement"
  },
  {
    id: "18",
    title: "Emergency Drill",
    description: "Conduct monthly emergency evacuation drill",
    completed: false,
    priority: "medium",
    status: "todo",
    startDate: new Date(2025, 0, 11), // Saturday
    dueDate: new Date(2025, 0, 11), // Saturday
    assignee: "Lisa Wong",
    tags: ["safety", "drill"],
    createdAt: new Date(2024, 11, 23),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Safety"
  },
  {
    id: "19",
    title: "Weekend Security Check",
    description: "Ensure site security and equipment safety over weekend",
    completed: false,
    priority: "medium",
    status: "todo",
    startDate: new Date(2025, 0, 12), // Sunday
    dueDate: new Date(2025, 0, 12), // Sunday
    assignee: "David Chen",
    tags: ["security"],
    createdAt: new Date(2024, 11, 23),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "Downtown Office Tower",
    category: "Site Work"
  }
]

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date(2025, 0, 6), { weekStartsOn: 1 }))
  const [tasks, setTasks] = useState<Task[]>(allTasks)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [draggedMember, setDraggedMember] = useState<TeamMember | null>(null)
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>("all")
  
  // Task creation form state
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium")
  const [newTaskCategory, setNewTaskCategory] = useState<Task["category"]>("Structural")
  const [newTaskAssignee, setNewTaskAssignee] = useState("")
  const [newTaskStartDate, setNewTaskStartDate] = useState("")
  const [newTaskDueDate, setNewTaskDueDate] = useState("")

  // Resolve async params
  useEffect(() => {
    params.then(p => setResolvedParams(p))
  }, [params])

  const project = resolvedParams ? allProjects.find(p => p.id === resolvedParams.id) : null

  // Generate week days (Monday to Sunday)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))
  }, [currentWeek])

  // Filter tasks for current project and week
  const projectTasks = useMemo(() => {
    if (!project) return []
    return tasks.filter(task => {
      const isProjectTask = task.projectId === project.id
      const isInWeek = task.startDate && isSameWeek(task.startDate, currentWeek, { weekStartsOn: 1 })
      return isProjectTask && isInWeek
    })
  }, [tasks, project, currentWeek])

  // Filter team members based on selection
  const filteredMembers = useMemo(() => {
    if (selectedMemberFilter === "all") return allTeamMembers
    return allTeamMembers.filter(member => member.name === selectedMemberFilter)
  }, [selectedMemberFilter])

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task))
  }

  const handleCreateTask = () => {
    if (!newTaskTitle || !project) return

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDescription,
      completed: false,
      priority: newTaskPriority,
      status: "todo",
      startDate: newTaskStartDate ? new Date(newTaskStartDate) : undefined,
      dueDate: newTaskDueDate ? new Date(newTaskDueDate) : undefined,
      assignee: newTaskAssignee,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: project.id,
      projectName: project.name,
      category: newTaskCategory
    }

    setTasks(prev => [...prev, newTask])
    
    // Reset form
    setNewTaskTitle("")
    setNewTaskDescription("")
    setNewTaskPriority("medium")
    setNewTaskCategory("Structural")
    setNewTaskAssignee("")
    setNewTaskStartDate("")
    setNewTaskDueDate("")
    setIsCreateTaskOpen(false)
  }

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek(prev => direction === "next" ? addWeeks(prev, 1) : subWeeks(prev, 1))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-gray-100 text-gray-800"
      case "in-progress": return "bg-blue-100 text-blue-800"
      case "review": return "bg-yellow-100 text-yellow-800"
      case "done": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleDragStart = (e: React.DragEvent, member: TeamMember) => {
    setDraggedMember(member)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, day: Date) => {
    e.preventDefault()
    if (draggedMember && project) {
      // Create a new task assigned to the dropped member for this day
      setNewTaskTitle(`New Task for ${draggedMember.name}`)
      setNewTaskAssignee(draggedMember.name)
      setNewTaskStartDate(format(day, "yyyy-MM-dd"))
      setNewTaskDueDate(format(day, "yyyy-MM-dd"))
      setIsCreateTaskOpen(true)
    }
    setDraggedMember(null)
  }

  if (!resolvedParams) {
    return (
      <SidebarInset>
        <div className="flex-1 p-6">
          <div className="animate-pulse">Loading...</div>
        </div>
      </SidebarInset>
    )
  }

  if (!project) {
    return (
      <SidebarInset>
        <div className="flex-1 p-6 text-center">
          <h1 className="text-2xl font-bold">Project not found</h1>
          <Link href="/projects">
            <Button variant="link">Go back to projects</Button>
          </Link>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Building className="h-5 w-5" />
            <h1 className="text-lg font-semibold">{project.name}</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* Project Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{project.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{project.location}</span>
                    </div>
                    <p className="mt-2 text-muted-foreground">{project.description}</p>
                  </div>
                  <Badge className={`${
                    project.priority === "high" ? "bg-red-100 text-red-800" :
                    project.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {project.priority} priority
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{project.tasksByStatus.inProgress}</div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{project.tasksByStatus.review}</div>
                    <div className="text-xs text-muted-foreground">In Review</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{project.tasksByStatus.done}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{project.criticalPathTasks}</div>
                    <div className="text-xs text-muted-foreground">Critical Path</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Team Members</span>
                    <span className="font-semibold">{project.teamMembers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Site Supervisor</span>
                    <span className="font-semibold">{project.siteSupervisor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Due Date</span>
                    <span className="font-semibold">{project.dueDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trades Involved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.trades.map((trade) => (
                    <Badge key={trade} variant="outline">{trade}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Calendar and Task Management */}
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">Weekly Schedule</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[200px] text-center">
                  {format(currentWeek, "MMM d")} - {format(addDays(currentWeek, 6), "MMM d, yyyy")}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedMemberFilter} onValueChange={setSelectedMemberFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Team Members</SelectItem>
                  {allTeamMembers.map(member => (
                    <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setIsCreateTaskOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>

                     {/* Calendar Grid */}
           <Card>
             <CardContent className="p-0">
               {/* Header Row - Days */}
               <div className="grid grid-cols-7 gap-0 border-b">
                 {weekDays.map((day) => (
                   <div key={day.toString()} className="p-4 border-r text-center bg-muted">
                     <div className="font-medium">{format(day, "EEE")}</div>
                     <div className="text-sm text-muted-foreground">{format(day, "MMM d")}</div>
                   </div>
                 ))}
               </div>

               {/* Calendar Days Grid */}
               <div className="grid grid-cols-7 gap-0">
                 {weekDays.map((day, dayIndex) => {
                   // Get all tasks for this day (from all team members)
                   const dayTasks = projectTasks.filter(task => {
                     return task.startDate && task.dueDate && 
                            day >= task.startDate && day <= task.dueDate
                   })

                   // Filter by selected member if not "all"
                   const filteredDayTasks = selectedMemberFilter === "all" 
                     ? dayTasks 
                     : dayTasks.filter(task => task.assignee === selectedMemberFilter)

                   return (
                     <div 
                       key={dayIndex} 
                       className="p-3 border-r border-b min-h-[200px] bg-gray-50/30 hover:bg-gray-100/50 transition-colors"
                       onDragOver={handleDragOver}
                       onDrop={(e) => handleDrop(e, day)}
                     >
                       <div className="space-y-2">
                         {filteredDayTasks.map(task => {
                           const assignedMember = allTeamMembers.find(m => m.name === task.assignee)
                           
                           return (
                             <div
                               key={task.id}
                               className="p-2 rounded-lg text-xs bg-white border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                               onClick={() => handleTaskClick(task)}
                             >
                               <div className="font-medium truncate mb-1">{task.title}</div>
                               
                               {/* Assignee Info */}
                               {assignedMember && (
                                 <div className="flex items-center gap-1 mb-1">
                                   <div className={`w-2 h-2 rounded-full ${assignedMember.color}`}></div>
                                   <span className="text-xs text-muted-foreground truncate">
                                     {assignedMember.name}
                                   </span>
                                 </div>
                               )}

                               {/* Status and Priority Badges */}
                               <div className="flex items-center gap-1 flex-wrap">
                                 <Badge className={`text-xs px-1 py-0 ${getStatusColor(task.status)}`}>
                                   {task.status}
                                 </Badge>
                                 <Badge className={`text-xs px-1 py-0 ${getPriorityColor(task.priority)}`}>
                                   {task.priority}
                                 </Badge>
                                 {task.category && (
                                   <Badge variant="outline" className="text-xs px-1 py-0">
                                     {task.category}
                                   </Badge>
                                 )}
                               </div>
                             </div>
                           )
                         })}
                         
                         {/* Drop Zone Message */}
                         {filteredDayTasks.length === 0 && (
                           <div className="text-xs text-muted-foreground text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                             <div className="mb-1">Drop team member here</div>
                             <div>to create task</div>
                           </div>
                         )}
                         
                         {/* Show additional tasks count if there are many */}
                         {filteredDayTasks.length > 4 && (
                           <div className="text-xs text-muted-foreground text-center py-1">
                             +{filteredDayTasks.length - 4} more tasks
                           </div>
                         )}
                       </div>
                     </div>
                   )
                 })}
               </div>
             </CardContent>
           </Card>

          {/* Available Team Members for Drag */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Available Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allTeamMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 p-2 border rounded-lg cursor-grab hover:bg-muted/50 bg-white"
                    draggable
                    onDragStart={(e) => handleDragStart(e, member)}
                  >
                    <div className={`w-3 h-3 rounded-full ${member.color}`}></div>
                    <span className="text-sm font-medium">{member.name}</span>
                    <Badge 
                      className={`text-xs ${
                        member.status === "active" ? "bg-green-100 text-green-800" :
                        member.status === "busy" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {member.status}
                    </Badge>
                                         <GripVertical className="h-3 w-3 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

             {/* Task Dialog */}
       <TaskDialog
         task={selectedTask}
         isOpen={isTaskDialogOpen}
         onClose={() => {
           setIsTaskDialogOpen(false)
           setSelectedTask(null)
         }}
         onSave={(taskData) => {
           if (selectedTask) {
             handleUpdateTask({
               ...selectedTask,
               ...taskData,
               updatedAt: new Date(),
             })
           }
         }}
       />

      {/* Create Task Dialog */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Title *</label>
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={newTaskCategory} onValueChange={(value: any) => setNewTaskCategory(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Structural">Structural</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Procurement">Procurement</SelectItem>
                    <SelectItem value="Finishes">Finishes</SelectItem>
                    <SelectItem value="Site Work">Site Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={newTaskPriority} onValueChange={(value: any) => setNewTaskPriority(value)}>
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
                <label className="text-sm font-medium">Assign To</label>
                <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTeamMembers.map(member => (
                      <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={newTaskStartDate}
                  onChange={(e) => setNewTaskStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  )
}
