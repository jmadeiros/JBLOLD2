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
import { GanttTimeline } from "../../../components/gantt-timeline"
import { toast } from "sonner"

// Project interface
interface Project {
  id: string
  name: string
  location: string
  description: string
  status: "Pre-construction" | "In Progress" | "On Hold" | "Substantially Complete" | "Completed" | "Delayed"
  priority: "high" | "medium" | "low"
  progress: number
  dueDate: string
  teamMembers: { initials: string; name: string; role: string }[] // Changed from number to array of objects
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
    name: "London Office Tower",
    location: "45 Canary Wharf, London",
    description: "Construction of a 40-story commercial office building with retail space.",
    status: "In Progress",
    priority: "high",
    progress: 45,
    dueDate: "Jun 15, 2026",
    teamMembers: [
      { initials: "DM", name: "David Martinez", role: "Site Supervisor" },
      { initials: "CR", name: "Carlos Rodriguez", role: "Master Electrician" },
      { initials: "MT", name: "Mike Thompson", role: "Lead Plumber" },
      { initials: "TR", name: "Tony Ricci", role: "HVAC Technician" },
      { initials: "BJ", name: "Brad Johnson", role: "Concrete Specialist" },
      { initials: "SW", name: "Steve Wilson", role: "Heavy Equipment Operator" },
      { initials: "JS", name: "Jake Sullivan", role: "Carpenter/Framer" },
      { initials: "MD", name: "Marcus Davis", role: "Safety Inspector" },
      { initials: "RF", name: "Rico Fernandez", role: "Welder/Ironworker" },
      { initials: "DW", name: "Danny Walsh", role: "Drywall Specialist" }
    ],
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
    name: "Manchester Residential Complex",
    location: "78 Victoria Street, Manchester",
    description: "Development of a 150-unit residential complex with community amenities.",
    status: "In Progress",
    priority: "high",
    progress: 65,
    dueDate: "Dec 1, 2025",
    teamMembers: [
      { initials: "SJ", name: "Sarah Johnson", role: "Site Supervisor" },
      { initials: "FE", name: "Fiona Evans", role: "Master Electrician" },
      { initials: "LP", name: "Liam Patterson", role: "Lead Plumber" },
      { initials: "AR", name: "Alice Roberts", role: "HVAC Technician" },
      { initials: "BJ", name: "Brad Johnson", role: "Concrete Specialist" },
      { initials: "SW", name: "Steve Wilson", role: "Heavy Equipment Operator" },
      { initials: "JS", name: "Jake Sullivan", role: "Carpenter/Framer" },
      { initials: "MD", name: "Marcus Davis", role: "Safety Inspector" },
      { initials: "RF", name: "Rico Fernandez", role: "Welder/Ironworker" },
      { initials: "DW", name: "Danny Walsh", role: "Drywall Specialist" }
    ],
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
    name: "Bristol Shopping Centre",
    location: "34 Cabot Circus, Bristol",
    description: "Renovation and expansion of existing retail complex.",
    status: "Pre-construction",
    priority: "medium",
    progress: 15,
    dueDate: "Sep 30, 2025",
    teamMembers: [
      { initials: "MR", name: "Mike Rodriguez", role: "Site Supervisor" },
      { initials: "DE", name: "David Evans", role: "Master Electrician" },
      { initials: "LP", name: "Liam Patterson", role: "Lead Plumber" },
      { initials: "AR", name: "Alice Roberts", role: "HVAC Technician" },
      { initials: "BJ", name: "Brad Johnson", role: "Concrete Specialist" },
      { initials: "SW", name: "Steve Wilson", role: "Heavy Equipment Operator" },
      { initials: "JS", name: "Jake Sullivan", role: "Carpenter/Framer" },
      { initials: "MD", name: "Marcus Davis", role: "Safety Inspector" },
      { initials: "RF", name: "Rico Fernandez", role: "Welder/Ironworker" },
      { initials: "DW", name: "Danny Walsh", role: "Drywall Specialist" }
    ],
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

// Team members data - All male construction specialists
const allTeamMembers: TeamMember[] = [
  { 
    id: "1", 
    name: "David Martinez", 
    role: "Site Supervisor", 
    department: "Management", 
    status: "active", 
    color: "bg-blue-500" 
  },
  { 
    id: "2", 
    name: "Carlos Rodriguez", 
    role: "Master Electrician", 
    department: "Trades", 
    status: "active", 
    color: "bg-yellow-500" 
  },
  { 
    id: "3", 
    name: "Mike Thompson", 
    role: "Lead Plumber", 
    department: "Trades", 
    status: "active", 
    color: "bg-indigo-500" 
  },
  { 
    id: "4", 
    name: "Tony Ricci", 
    role: "HVAC Technician", 
    department: "Trades", 
    status: "busy", 
    color: "bg-purple-500" 
  },
  { 
    id: "5", 
    name: "Brad Johnson", 
    role: "Concrete Specialist", 
    department: "Trades", 
    status: "active", 
    color: "bg-gray-600" 
  },
  { 
    id: "6", 
    name: "Steve Wilson", 
    role: "Heavy Equipment Operator", 
    department: "Site Crew", 
    status: "active", 
    color: "bg-orange-500" 
  },
  { 
    id: "7", 
    name: "Jake Sullivan", 
    role: "Carpenter/Framer", 
    department: "Trades", 
    status: "active", 
    color: "bg-green-600" 
  },
  { 
    id: "8", 
    name: "Marcus Davis", 
    role: "Safety Inspector", 
    department: "Site Crew", 
    status: "active", 
    color: "bg-red-500" 
  },
  { 
    id: "9", 
    name: "Rico Fernandez", 
    role: "Welder/Ironworker", 
    department: "Trades", 
    status: "away", 
    color: "bg-slate-600" 
  },
  { 
    id: "10", 
    name: "Danny Walsh", 
    role: "Drywall Specialist", 
    department: "Trades", 
    status: "active", 
    color: "bg-cyan-500" 
  }
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
    assignee: "Brad Johnson", // Concrete specialist
    tags: ["structural", "concrete"],
    createdAt: new Date(2024, 11, 20),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: "Marcus Davis", // Safety inspector
    tags: ["safety"],
    createdAt: new Date(2024, 11, 20),
    updatedAt: new Date(2025, 0, 6),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: "Steve Wilson", // Equipment operator
    tags: ["equipment", "safety"],
    createdAt: new Date(2024, 11, 20),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: "Mike Thompson", // Lead plumber
    tags: ["plumbing"],
    createdAt: new Date(2024, 11, 18),
    updatedAt: new Date(2025, 0, 7),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: undefined, // Supervisor needs to assign
    tags: ["structural", "rebar"],
    createdAt: new Date(2024, 11, 21),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: "David Martinez", // Supervisor will handle this
    tags: ["procurement", "delivery"],
    createdAt: new Date(2024, 11, 21),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: "Carlos Rodriguez", // Already assigned electrician
    tags: ["electrical", "panels"],
    createdAt: new Date(2024, 11, 21),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: undefined, // Supervisor needs to assign electrician
    tags: ["electrical"],
    createdAt: new Date(2024, 11, 21),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: "Brad Johnson", // Concrete specialist assigned
    tags: ["quality", "testing"],
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: undefined, // Supervisor needs to assign crew
    tags: ["cleanup"],
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: undefined, // Need to assign HVAC tech
    tags: ["hvac"],
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: "Marcus Davis", // Safety inspector assigned
    tags: ["safety", "fire"],
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: "Mike Thompson", // Lead plumber handles inspection
    tags: ["plumbing", "inspection"],
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: undefined, // Need to assign drywall specialist
    tags: ["drywall", "finishing"],
    createdAt: new Date(2024, 11, 23),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: "David Martinez", // Supervisor handles reports
    tags: ["reporting", "management"],
    createdAt: new Date(2024, 11, 23),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: undefined, // Need to assign equipment operator
    tags: ["maintenance", "tools"],
    createdAt: new Date(2024, 11, 23),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: undefined, // Supervisor to assign
    tags: ["inventory", "materials"],
    createdAt: new Date(2024, 11, 23),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: undefined, // Need to assign safety coordinator
    tags: ["safety", "drill"],
    createdAt: new Date(2024, 11, 23),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
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
    assignee: undefined, // Supervisor to assign
    tags: ["security"],
    createdAt: new Date(2024, 11, 23),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
    category: "Site Work"
  }
]

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date(2025, 0, 6), { weekStartsOn: 1 }))
  const [tasks, setTasks] = useState<Task[]>(allTasks)

  // Load imported tasks from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const importedTasks = localStorage.getItem('importedTasks')
        console.log('🔍 Raw imported tasks from localStorage:', importedTasks)
        
        if (importedTasks) {
          const parsed = JSON.parse(importedTasks)
          console.log('📊 Parsed imported tasks:', parsed.length)
          
          const tasksWithDates = parsed.map((task: any) => ({
            ...task,
            startDate: task.startDate ? new Date(task.startDate) : undefined,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt)
          }))
          
          console.log('🎯 Tasks with project IDs:', tasksWithDates.map((t: Task) => ({ id: t.id, projectId: t.projectId, title: t.title })))
          
          // Combine imported tasks with hardcoded tasks (different project IDs)
          setTasks(prev => {
            const hardcodedTasks = allTasks.filter(task => task.projectId === "1" || task.projectId === "2")
            const combinedTasks = [...hardcodedTasks, ...tasksWithDates]
            console.log('🔄 Combined tasks:', {
              hardcoded: hardcodedTasks.length,
              imported: tasksWithDates.length,
              total: combinedTasks.length,
              projectBreakdown: combinedTasks.reduce((acc, task) => {
                acc[task.projectId || 'no-id'] = (acc[task.projectId || 'no-id'] || 0) + 1
                return acc
              }, {} as Record<string, number>)
            })
            return combinedTasks
          })
          
          console.log('✅ Set tasks for project page:', tasksWithDates.length)
        } else {
          // If no imported tasks, use the hardcoded tasks
          console.log('📝 Using hardcoded tasks only')
          setTasks(allTasks)
        }
      } catch (error) {
        console.error('❌ Failed to load imported tasks:', error)
        setTasks(allTasks) // Fallback to hardcoded tasks
      }
    }
  }, [resolvedParams]) // Re-run when project ID changes

  // Also listen for storage changes (when new projects are imported)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'importedTasks' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          const tasksWithDates = parsed.map((task: any) => ({
            ...task,
            startDate: task.startDate ? new Date(task.startDate) : undefined,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt)
          }))
          setTasks(tasksWithDates)
          console.log('Updated tasks from storage change:', tasksWithDates.length)
        } catch (error) {
          console.error('Failed to parse updated tasks:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [taskDialogDate, setTaskDialogDate] = useState<Date | undefined>(undefined) // For daily completion tracking
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [draggedMember, setDraggedMember] = useState<TeamMember | null>(null)
  const [dragOverTask, setDragOverTask] = useState<string | null>(null)
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"schedule" | "gantt">("schedule")
  
  // Task creation form state
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium")
  const [newTaskCategory, setNewTaskCategory] = useState<Task["category"]>("Structural")
  const [newTaskAssignee, setNewTaskAssignee] = useState("")
  const [newTaskStartDate, setNewTaskStartDate] = useState("")
  const [newTaskDueDate, setNewTaskDueDate] = useState("")

  // State for all projects (hardcoded + localStorage)
  const [allProjectsCombined, setAllProjectsCombined] = useState<Project[]>(allProjects)

  // Resolve async params
  useEffect(() => {
    params.then(p => setResolvedParams(p))
  }, [params])

  // Load projects from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedProjects = localStorage.getItem('constructionProjects')
        if (savedProjects) {
          const parsed = JSON.parse(savedProjects)
          // Combine saved projects with hardcoded ones, avoiding duplicates
          setAllProjectsCombined(prev => [
            ...parsed, 
            ...prev.filter(hp => !parsed.find((sp: Project) => sp.id === hp.id))
          ])
        }
      } catch (error) {
        console.error('Failed to load projects from localStorage:', error)
      }
    }
  }, [])

  // Find project in combined list (localStorage + hardcoded)
  const project = resolvedParams ? allProjectsCombined.find(p => p.id === resolvedParams.id) : null

  // Generate week days (Monday to Friday only)
  const weekDays = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => addDays(currentWeek, i))
  }, [currentWeek])

  // Filter tasks for current project and week
  const projectTasks = useMemo(() => {
    if (!project) return []
    
    const filteredTasks = tasks.filter(task => {
      const isProjectTask = task.projectId === project.id
      
      // Check if task overlaps with the current week (not just starts in the week)
      const isInWeek = task.startDate && task.dueDate && (() => {
        const weekStart = currentWeek
        const weekEnd = addDays(currentWeek, 4) // Friday (5 days from Monday)
        
        // Task overlaps if it starts before week ends AND ends after week starts
        const taskOverlapsWeek = task.startDate <= weekEnd && task.dueDate >= weekStart
        
        return taskOverlapsWeek
      })()
      
      return isProjectTask && isInWeek
    })
    
    console.log('🔎 Project task filtering:', {
      projectId: project.id,
      projectName: project.name,
      totalTasks: tasks.length,
      projectTasks: tasks.filter(task => task.projectId === project.id).length,
      currentWeek: currentWeek.toISOString().split('T')[0],
      weekEnd: addDays(currentWeek, 4).toISOString().split('T')[0],
      filteredTasks: filteredTasks.length,
      allProjectTasks: tasks.filter(task => task.projectId === project.id).map(t => ({
        id: t.id,
        title: t.title,
        startDate: t.startDate?.toISOString().split('T')[0],
        dueDate: t.dueDate?.toISOString().split('T')[0],
        projectId: t.projectId,
        overlapsWeek: t.startDate && t.dueDate ? 
          t.startDate <= addDays(currentWeek, 4) && t.dueDate >= currentWeek : false
      })),
      tasksByProject: tasks.reduce((acc, task) => {
        acc[task.projectId || 'no-id'] = (acc[task.projectId || 'no-id'] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    })
    
    return filteredTasks
  }, [tasks, project, currentWeek])

  // Filter team members based on selection
  const filteredMembers = useMemo(() => {
    if (selectedMemberFilter === "all") return allTeamMembers
    return allTeamMembers.filter(member => member.name === selectedMemberFilter)
  }, [selectedMemberFilter])

  const handleTaskClick = (task: Task, specificDate?: Date) => {
    setSelectedTask(task)
    setTaskDialogDate(specificDate)
    setIsTaskDialogOpen(true)
  }

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task))
  }

  // Handle task updates from Gantt timeline drag-and-drop
  const handleGanttTaskUpdate = (updatedTask: Task, reason: string) => {
    console.log('📅 Gantt task moved:', {
      taskId: updatedTask.id,
      taskTitle: updatedTask.title,
      reason,
      newDates: {
        start: updatedTask.startDate?.toISOString().split('T')[0],
        end: updatedTask.dueDate?.toISOString().split('T')[0]
      }
    })
    
    // Update the task in the local state
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task))
    
    // Update localStorage for persistence
    try {
      const importedTasks = localStorage.getItem('importedTasks')
      if (importedTasks) {
        const parsed = JSON.parse(importedTasks)
        const updatedTasks = parsed.map((task: Task) => 
          task.id === updatedTask.id ? updatedTask : task
        )
        localStorage.setItem('importedTasks', JSON.stringify(updatedTasks))
        console.log('💾 Updated task saved to localStorage')
      }
    } catch (error) {
      console.error('❌ Failed to update task in localStorage:', error)
    }
    
    // Show success message
    console.log(`✅ Task "${updatedTask.title}" moved successfully. Reason: ${reason}`)
    
    // Show toast notification
    toast.success(`Task moved successfully`, {
      description: `"${updatedTask.title}" has been rescheduled. Reason: ${reason}`
    })
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

  // Helper function to check if a specific day is completed for a task
  const isDayCompleted = (task: Task, date: Date): boolean => {
    // For multi-day tasks, check daily completions
    if (task.startDate && task.dueDate && 
        task.startDate.toDateString() !== task.dueDate.toDateString() &&
        task.dailyCompletions) {
      const dateKey = date.toISOString().split('T')[0]
      return task.dailyCompletions[dateKey]?.completed || false
    }
    
    // For single-day tasks, use the overall completion status
    return task.completed
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
    setDragOverTask(null) // Clear any previous drag state
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleDragEnd = () => {
    setDraggedMember(null)
    setDragOverTask(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverTask(null) // Clear task hover when dragging over calendar day
  }

  const handleDrop = (e: React.DragEvent, day: Date) => {
    e.preventDefault()
    setDragOverTask(null) // Clear any task hover state
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

  const handleTaskDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault()
    e.stopPropagation() // Prevent the day drag over handler from firing
    e.dataTransfer.dropEffect = "copy" // Different effect for task assignment
    setDragOverTask(taskId)
  }

  const handleTaskDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverTask(null)
  }

  const handleTaskDrop = (e: React.DragEvent, task: Task) => {
    e.preventDefault()
    e.stopPropagation() // Prevent the day drop handler from firing
    setDragOverTask(null)
    
    if (draggedMember) {
      const currentAssignee = task.assignee || ""
      const assigneeNames = currentAssignee.split(',').map(name => name.trim()).filter(Boolean)
      
      // Check if the member is already assigned to avoid duplicates
      if (assigneeNames.includes(draggedMember.name)) {
        console.log(`ℹ️ ${draggedMember.name} is already assigned to "${task.title}"`)
        setDraggedMember(null)
        return
      }

      // Add the new member to the task
      const newAssignee = currentAssignee 
        ? `${currentAssignee}, ${draggedMember.name}`
        : draggedMember.name

      // Create updated task with new assignee
      const updatedTask: Task = {
        ...task,
        assignee: newAssignee,
        updatedAt: new Date()
      }

      // Update the task state properly
      handleUpdateTask(updatedTask)
      
      // Clear drag state
      setDraggedMember(null)
      
      // Show success feedback
      console.log(`✅ Assigned ${draggedMember.name} to task "${task.title}"`)
    }
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
                    <span className="font-semibold">{project.teamMembers.length}</span>
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
              <h2 className="text-xl font-semibold">Project Timeline</h2>
              <div className="flex bg-muted rounded-lg p-1">
                <Button 
                  variant={viewMode === "schedule" ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setViewMode("schedule")}
                  className="text-xs"
                >
                  Weekly Schedule
                </Button>
                <Button 
                  variant={viewMode === "gantt" ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setViewMode("gantt")}
                  className="text-xs"
                >
                  Gantt Timeline
                </Button>
              </div>
              {viewMode === "schedule" && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[200px] text-center">
                  {format(currentWeek, "MMM d")} - {format(addDays(currentWeek, 4), "MMM d, yyyy")} (Mon-Fri)
                </span>
                <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              )}
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

          {/* View Mode Content */}
          {viewMode === "schedule" ? (
            /* Calendar and Team Members Side by Side */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendar Grid - Takes up 3/4 of the width */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-0">
                  {/* Header Row - Days */}
                  <div className="grid grid-cols-5 gap-0 border-b">
                    {weekDays.map((day) => (
                      <div key={day.toString()} className="p-4 border-r text-center bg-muted">
                        <div className="font-medium">{format(day, "EEE")}</div>
                        <div className="text-sm text-muted-foreground">{format(day, "MMM d")}</div>
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days Grid */}
                  <div className="grid grid-cols-5 gap-0">
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
                          className="p-3 border-r border-b min-h-[300px] bg-gray-50/30 hover:bg-gray-100/50 transition-colors"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, day)}
                        >
                          <div className="space-y-2">
                            {filteredDayTasks.map(task => {
                              const assignedMember = allTeamMembers.find(m => m.name === task.assignee)
                              
                              // Calculate task position and duration within the week
                              const taskStart = task.startDate!
                              const taskEnd = task.dueDate!
                              const isTaskStartDay = day.toDateString() === taskStart.toDateString()
                              const isTaskEndDay = day.toDateString() === taskEnd.toDateString()
                              const isMultiDay = taskStart.toDateString() !== taskEnd.toDateString()
                              const isDayComplete = isDayCompleted(task, day)
                              
                              return (
                                <div
                                  key={task.id}
                                  className={`p-3 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow relative ${
                                    dragOverTask === task.id ? 'border-blue-500 bg-blue-50 border-2' : 'hover:bg-blue-50'
                                  } ${isDayComplete ? 'bg-gray-100 opacity-75' : 'bg-white'}`}
                                  onClick={() => handleTaskClick(task, day)}
                                  onDragOver={(e) => handleTaskDragOver(e, task.id)}
                                  onDragLeave={handleTaskDragLeave}
                                  onDrop={(e) => handleTaskDrop(e, task)}
                                >
                                  {/* Header with Title and Priority */}
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className={`font-semibold text-sm leading-tight ${isDayComplete ? 'line-through text-gray-500' : ''}`}>
                                      {isDayComplete && <span className="text-green-600 mr-1">✓</span>}
                                      {task.title}
                                      {isMultiDay && (
                                        <div className={`text-xs font-normal mt-1 ${isDayComplete ? 'text-gray-400' : 'text-blue-600'}`}>
                                          {format(taskStart, 'MMM d')} - {format(taskEnd, 'MMM d')}
                                          {isTaskStartDay && " (START)"}
                                          {isTaskEndDay && " (END)"}
                                          {!isTaskStartDay && !isTaskEndDay && " (ONGOING)"}
                                        </div>
                                      )}
                                    </h4>
                                    <Badge className={`text-xs px-2 py-0.5 ml-2 flex-shrink-0 ${
                                      task.priority === "high" ? "bg-red-100 text-red-800" :
                                      task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                                      "bg-green-100 text-green-800"
                                    } ${isDayComplete ? 'opacity-60' : ''}`}>
                                      {task.priority.toUpperCase()}
                                    </Badge>
                                  </div>

                                  {/* Description */}
                                  {task.description && (
                                    <p className={`text-xs mb-2 line-clamp-2 ${isDayComplete ? 'text-gray-400 line-through' : 'text-muted-foreground'}`}>
                                      {task.description}
                                    </p>
                                  )}

                                  {/* Tags */}
                                  {task.tags && task.tags.length > 0 && (
                                    <div className="flex gap-1 mb-2 flex-wrap">
                                      {task.tags.slice(0, 3).map(tag => (
                                        <Badge key={tag} variant="outline" className={`text-xs px-1 py-0 ${isDayComplete ? 'opacity-50' : ''}`}>
                                          {tag}
                                        </Badge>
                                      ))}
                                      {task.tags.length > 3 && (
                                        <span className={`text-xs ${isDayComplete ? 'text-gray-400' : 'text-muted-foreground'}`}>+{task.tags.length - 3}</span>
                                      )}
                                    </div>
                                  )}

                                  {/* Bottom Row: Assignee only */}
                                  <div className="flex items-center gap-1">
                                    <Users className={`h-3 w-3 ${isDayComplete ? 'text-gray-400' : 'text-muted-foreground'}`} />
                                    <span className={`text-xs truncate ${isDayComplete ? 'text-gray-400' : 'text-muted-foreground'}`}>
                                      {task.assignee || "Unassigned"}
                                    </span>
                                  </div>

                                  {/* Drag overlay indicator */}
                                  {dragOverTask === task.id && draggedMember && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-blue-100/90 rounded-lg border-2 border-blue-400">
                                      <div className="text-xs font-medium text-blue-800 text-center px-2">
                                        {task.assignee && task.assignee.split(',').map(name => name.trim()).includes(draggedMember.name) 
                                          ? `${draggedMember.name} already assigned`
                                          : `Add ${draggedMember.name} to task`
                                        }
                                      </div>
                                    </div>
                                  )}
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
            </div>

            {/* Team Members Sidebar - Takes up 1/4 of the width */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Construction Crew
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Drag team members onto calendar days to assign tasks.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {allTeamMembers.map(member => (
                                              <div
                          key={member.id}
                          className="flex items-start gap-2 p-2 border rounded-lg cursor-grab hover:bg-muted/50 bg-white shadow-sm transition-all hover:shadow-md"
                          draggable
                          onDragStart={(e) => handleDragStart(e, member)}
                          onDragEnd={handleDragEnd}
                        >
                        <div className={`w-3 h-3 rounded-full ${member.color} mt-1 flex-shrink-0`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs font-semibold text-gray-900 truncate">{member.name}</span>
                            <Badge 
                              className={`text-xs px-1 py-0 ${
                                member.status === "active" ? "bg-green-100 text-green-800" :
                                member.status === "busy" ? "bg-red-100 text-red-800" :
                                "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {member.status === "active" ? "A" : member.status === "busy" ? "B" : "O"}
                            </Badge>
                          </div>
                          <div className="text-xs font-medium text-blue-700 mb-1 truncate">{member.role}</div>
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {member.department}
                          </Badge>
                        </div>
                        <GripVertical className="h-3 w-3 text-muted-foreground mt-1 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Compact Legend */}
                  <div className="mt-3 pt-2 border-t">
                    <h4 className="text-xs font-medium mb-1">Status</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>A - Active</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>B - Busy</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>O - Off-site</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          ) : (
            /* Gantt Timeline View */
            <div className="bg-white rounded-lg border">
              <GanttTimeline 
                tasks={(() => {
                  const ganttTasks = tasks.filter(task => task.projectId === project?.id)
                  console.log('📊 Gantt timeline tasks:', {
                    projectId: project?.id,
                    projectName: project?.name,
                    totalTasks: tasks.length,
                    ganttTasks: ganttTasks.length,
                    taskDetails: ganttTasks.map(t => ({
                      id: t.id,
                      title: t.title,
                      startDate: t.startDate?.toISOString().split('T')[0],
                      dueDate: t.dueDate?.toISOString().split('T')[0],
                      assignee: t.assignee,
                      projectId: t.projectId
                    })),
                    allProjectTasks: tasks.reduce((acc, task) => {
                      acc[task.projectId || 'no-id'] = (acc[task.projectId || 'no-id'] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  })
                  return ganttTasks
                })()} 
                viewStartDate={new Date(2020, 8, 1)} // September 2020
                viewEndDate={new Date(2026, 11, 31)} // December 2026
                onTaskUpdate={handleGanttTaskUpdate}
              />
            </div>
          )}
        </div>
      </div>

             {/* Task Dialog */}
      <TaskDialog
         task={selectedTask}
         isOpen={isTaskDialogOpen}
         mode="view"
         specificDate={taskDialogDate}
         onClose={() => {
           setIsTaskDialogOpen(false)
           setSelectedTask(null)
           setTaskDialogDate(undefined)
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
