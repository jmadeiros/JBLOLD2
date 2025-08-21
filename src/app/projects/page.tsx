"use client"

import { useState, useEffect } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import { DetailedProjectCard } from "@/components/detailed-project-card"
import { AIInsightsPanel } from "@/components/ai-insights-panel"
import { ProjectUpload } from "@/components/project-upload"
import { toast } from "sonner"
import type { Task, TradeTaskBreakdown, ProgrammeAdminItem, CalendarEvent } from "../../../types/task"
import { projectService, taskService, type Project as SupabaseProject } from "@/lib/supabase"
import {
  FolderKanban,
  Plus,
  DollarSign,
  Users,
  TrendingUp,
  Bell
} from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  name: string
  location: string
  description: string
  status: "Pre-construction" | "In Progress" | "On Hold" | "Substantially Complete" | "Completed" | "Delayed"
  priority: "high" | "medium" | "low"
  progress: number
  dueDate: string
  teamMembers: { initials: string; name: string; role: string }[]
  tasksCompleted: number
  totalTasks: number
  isStarred: boolean
  tasksByStatus: {
    todo: number
    inProgress: number
    review: number
    done: number
  }
  trades: string[]
  siteSupervisor: string
  criticalPathTasks: number
  budget: string
}

// Helper function to convert Supabase project to UI project
const convertSupabaseProject = async (dbProject: SupabaseProject): Promise<Project> => {
  // Get tasks for this project to calculate stats
  const tasks = await taskService.getByProject(dbProject.id)
  
  const completedTasks = tasks.filter(t => t.completed).length
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.completed).length
  }
  
  const trades = [...new Set(tasks.map(t => t.trade).filter(Boolean) as string[])]
  const criticalPathTasks = tasks.filter(t => t.priority === 'high').length
  
  return {
    id: dbProject.id,
    name: dbProject.name,
    location: dbProject.location || "TBD",
    description: dbProject.description || "",
    status: dbProject.status as any || "Pre-construction",
    priority: "medium", // Default for now
    progress: dbProject.progress,
    dueDate: dbProject.end_date ? new Date(dbProject.end_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }) : "TBD",
    teamMembers: [
      { initials: "PM", name: "Project Manager", role: "Manager" },
      { initials: "SE", name: "Site Engineer", role: "Engineer" },
    ],
    tasksCompleted: completedTasks,
    totalTasks: tasks.length,
    isStarred: false,
    tasksByStatus,
    trades,
    siteSupervisor: "TBD",
    criticalPathTasks,
    budget: dbProject.budget ? `$${dbProject.budget.toLocaleString()}` : "$0"
  }
}

// Initial hardcoded projects
const INITIAL_PROJECTS: Project[] = [
    {
      id: "1",
      name: "London Office Tower",
      location: "45 Canary Wharf, London",
      description: "Construction of a 40-story commercial office building with retail space.",
      status: "In Progress",
      priority: "high",
      progress: 45,
      dueDate: "20/12/2024",
      teamMembers: [
        { initials: "SJ", name: "Sarah Johnson", role: "Project Manager" },
        { initials: "MC", name: "Mike Chen", role: "Site Engineer" },
        { initials: "JW", name: "James Wilson", role: "Architect" },
        { initials: "ED", name: "Emily Davis", role: "Safety Officer" }
      ],
      tasksCompleted: 88,
      totalTasks: 210,
      isStarred: true,
      tasksByStatus: {
        todo: 45,
        inProgress: 77,
        review: 15,
        done: 73
      },
      trades: ["Structural", "Electrical", "Plumbing", "HVAC", "Finishes"],
      siteSupervisor: "David Chen",
      criticalPathTasks: 12,
      budget: "$12,500,000"
    },
    {
      id: "2",
      name: "Manchester Residential Complex",
      location: "78 Victoria Street, Manchester",
      description: "Development of a 150-unit residential complex with community amenities.",
      status: "Delayed",
      priority: "high",
      progress: 65,
      dueDate: "01/12/2025",
      teamMembers: [
        { initials: "ED", name: "Emily Davis", role: "Project Manager" },
        { initials: "RB", name: "Robert Brown", role: "Site Engineer" },
      ],
      tasksCompleted: 112,
      totalTasks: 180,
      isStarred: false,
      tasksByStatus: {
        todo: 25,
        inProgress: 43,
        review: 12,
        done: 100
      },
      trades: ["Framing", "Electrical", "Plumbing", "Drywall", "Flooring"],
      siteSupervisor: "Sarah Johnson",
      criticalPathTasks: 8,
      budget: "$8,200,000"
    },
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [loading, setLoading] = useState(true)

  // Load projects from Supabase on page mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        console.log('🔄 Loading projects from Supabase...')
        const dbProjects = await projectService.getAll()
        console.log('📊 Loaded projects from database:', dbProjects.length)
        
        // Convert Supabase projects to UI projects (including task stats)
        const convertedProjects = await Promise.all(
          dbProjects.map(async (dbProject) => await convertSupabaseProject(dbProject))
        )
        
        // Combine with initial hardcoded projects (avoid duplicates)
        const allProjects = [
          ...convertedProjects,
          ...INITIAL_PROJECTS.filter(ip => !convertedProjects.find(cp => cp.id === ip.id))
        ]
        
        setProjects(allProjects)
        console.log('✅ Projects loaded and converted:', allProjects.length)
      } catch (error) {
        console.error('❌ Failed to load projects from Supabase:', error)
        // Fallback to hardcoded projects
        setProjects(INITIAL_PROJECTS)
      } finally {
        setLoading(false)
      }
    }
    
    loadProjects()
  }, [])

  const handleFilesUploaded = (files: File[]) => {
    const totalSize = files.reduce((acc, file) => acc + file.size, 0)
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2)
    const fileTypes = [...new Set(files.map(f => f.name.split('.').pop()?.toUpperCase()))]
    toast.success(
      `Project files ready for processing`, 
      {
        description: `${files.length} files (${totalSizeMB}MB) • Types: ${fileTypes.join(', ')}`
      }
    )
  }

  const handleTasksImported = async (tasks: TradeTaskBreakdown[], programName?: string) => {
    console.log('🏗️ Creating new project:', { programName, tasksCount: tasks.length })
    
    try {
      const extractedProjectName = programName || tasks[0]?.description?.split(' ')[0] || "Imported Project"
      
      // Create project in Supabase
      const newSupabaseProject = await projectService.create({
        name: extractedProjectName,
        location: "TBD",
        description: `Project created from imported construction program with ${tasks.length} trade tasks.`,
        status: "Pre-construction",
        progress: 0,
        start_date: tasks.length > 0 ? tasks[0].startDate.toISOString().split('T')[0] : undefined,
        end_date: tasks.length > 0 ? tasks[tasks.length - 1].endDate.toISOString().split('T')[0] : undefined,
        budget: 0,
        programme_filename: programName,
        analysis_date: new Date().toISOString(),
        trade_count: tasks.length,
        admin_items_count: 0
      })

      if (!newSupabaseProject) {
        throw new Error('Failed to create project in database')
      }

      console.log('✅ New project created in Supabase:', newSupabaseProject)
      
      // Convert TradeTaskBreakdown objects to Supabase Task objects
      const supabaseTasks = tasks.map((tradeTask) => ({
        project_id: newSupabaseProject.id,
        title: tradeTask.description,
        description: `${tradeTask.trade} work: ${tradeTask.description}`,
        completed: false,
        priority: tradeTask.priority,
        start_date: tradeTask.startDate.toISOString().split('T')[0],
        due_date: tradeTask.endDate.toISOString().split('T')[0],
        status: "todo",
        assignee: tradeTask.trade, // Use trade as assignee for Gantt grouping
        tags: tradeTask.floorCoreUnit ? [tradeTask.floorCoreUnit] : [],
        category: tradeTask.trade.includes('Electric') ? 'Electrical' : 
                  tradeTask.trade.includes('Plumb') ? 'Plumbing' :
                  tradeTask.trade.includes('Structural') ? 'Structural' :
                  'Site Work',
        // Programme-specific fields
        trade: tradeTask.trade,
        floor_core_unit: tradeTask.floorCoreUnit,
        week_number: tradeTask.weekNumber,
        estimated_hours: tradeTask.estimatedHours,
        estimated_value: 0,
        is_programme_generated: true
      }))
      
      // Create tasks in Supabase
      const createdTasks = await taskService.createMany(supabaseTasks)
      console.log('📋 Tasks saved to Supabase:', createdTasks.length)
      
      // Convert the new project to UI format and add to projects list
      const newUIProject = await convertSupabaseProject(newSupabaseProject)
      setProjects(prev => [newUIProject, ...prev])
      
      toast.success(`Created new project: ${extractedProjectName}`, {
        description: `${tasks.length} trade tasks imported. Project saved to database!`
      })
    } catch (error) {
      console.error('❌ Failed to create project in Supabase:', error)
      toast.error("Failed to create project", {
        description: "Please try again or check your connection."
      })
    }
  }

  const handleAdminItemsImported = (items: ProgrammeAdminItem[], programName?: string) => {
    // Store admin items in localStorage for the calendar
    const existingItems = JSON.parse(localStorage.getItem('importedAdminItems') || '[]')
    const updatedItems = [...existingItems, ...items.map(item => ({
      ...item,
      projectName: programName
    }))]
    localStorage.setItem('importedAdminItems', JSON.stringify(updatedItems))
    
    toast.success(`Added ${items.length} admin items to ${programName}`, {
      description: "Items added to project calendar. Check the Calendar page!"
    })
  }
  
  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectService.delete(projectId);
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      toast.success("Project deleted successfully.");
    } catch (error) {
      console.error('❌ Failed to delete project:', error);
      toast.error("Failed to delete project", {
        description: "Please try again or check your connection."
      });
    }
  };

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div>
            <h1 className="font-semibold">Construction Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back! Here's what's happening with your projects today.</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Projects"
            value="2"
            icon={FolderKanban}
            iconColor="bg-blue-500"
            trend={{ value: "+12%", isPositive: true }}
          />
          <StatCard
            title="Total Budget"
            value="$12.0M"
            icon={DollarSign}
            iconColor="bg-green-500"
            trend={{ value: "+8%", isPositive: true }}
          />
          <StatCard
            title="Team Members"
            value="43"
            icon={Users}
            iconColor="bg-purple-500"
            trend={{ value: "+3%", isPositive: true }}
          />
          <StatCard
            title="Completion Rate"
            value="55%"
            icon={TrendingUp}
            iconColor="bg-orange-500"
            trend={{ value: "+5%", isPositive: true }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Projects */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Projects</h2>
              <Button variant="outline" size="sm">
                All Projects
              </Button>
            </div>
            <ProjectUpload 
              onFilesUploaded={handleFilesUploaded}
              onTasksImported={handleTasksImported}
              onAdminItemsImported={handleAdminItemsImported}
            />
            {projects.map((project) => (
              <Link href={`/projects/${project.id}`} key={project.id}>
                <DetailedProjectCard project={project} onDelete={handleDeleteProject} />
              </Link>
            ))}
          </div>

          {/* Right Column - AI Insights */}
          <div className="space-y-6">
            <AIInsightsPanel />
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
