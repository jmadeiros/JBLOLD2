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

  // Load saved projects from localStorage on page mount
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('constructionProjects')
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects)
        console.log('🔄 Loading saved projects from localStorage:', parsed.length)
        
        // Validate each project's teamMembers structure
        const validatedProjects = parsed.map((project: any) => {
          if (!Array.isArray(project.teamMembers)) {
            console.warn('⚠️ Invalid teamMembers, fixing:', project.id, project.teamMembers)
            project.teamMembers = [
              { initials: "PM", name: "Project Manager", role: "Manager" },
              { initials: "SE", name: "Site Engineer", role: "Engineer" },
            ]
          }
          // Ensure each team member has the correct structure
          project.teamMembers = project.teamMembers.map((member: any) => {
            if (typeof member !== 'object' || !member.initials || !member.name || !member.role) {
              console.warn('⚠️ Invalid team member structure, fixing:', member)
              return { initials: "TM", name: "Team Member", role: "Member" }
            }
            return member
          })
          return project
        })
        
        setProjects(validatedProjects)
      } else {
        console.log('📝 No saved projects found, using initial projects')
        setProjects(INITIAL_PROJECTS)
      }
    } catch (error) {
      console.error('❌ Failed to load projects from localStorage:', error)
      setProjects(INITIAL_PROJECTS)
    }
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

  const handleTasksImported = (tasks: TradeTaskBreakdown[], programName?: string) => {
    console.log('🏗️ Creating new project:', { programName, tasksCount: tasks.length })
    
    // Create a new project from the imported tasks
    const newProjectId = (projects.length + 1).toString()
    const extractedProjectName = programName || tasks[0]?.description?.split(' ')[0] || "Imported Project"
    
    const newProject: Project = {
      id: newProjectId,
      name: extractedProjectName,
      location: "TBD", 
      description: `Project created from imported construction program with ${tasks.length} trade tasks.`,
      status: "Pre-construction",
      priority: "medium",
      progress: 0,
      dueDate: tasks.length > 0 && tasks[0].endDate ? 
        new Date(tasks[tasks.length - 1].endDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }) : "TBD",
      teamMembers: [
        { initials: "PM", name: "Project Manager", role: "Manager" },
        { initials: "SE", name: "Site Engineer", role: "Engineer" },
      ],
      tasksCompleted: 0,
      totalTasks: tasks.length,
      isStarred: false,
      tasksByStatus: {
        todo: tasks.length,
        inProgress: 0,
        review: 0,
        done: 0
      },
      trades: [...new Set(tasks.map(task => task.trade))], // Unique trades
      siteSupervisor: "TBD",
      criticalPathTasks: tasks.filter(task => task.priority === 'high').length,
      budget: "$0"
    }

    console.log('✅ New project created:', newProject)

    // Add the new project to the projects list
    const updatedProjects = [newProject, ...projects]
    setProjects(updatedProjects)
    
    // SAVE PROJECTS TO LOCALSTORAGE TO PERSIST THEM
    try {
      // Validate project structure before saving
      console.log('🔍 Validating project before save:', {
        teamMembers: newProject.teamMembers,
        teamMembersIsArray: Array.isArray(newProject.teamMembers),
        firstMember: newProject.teamMembers[0]
      })
      
      localStorage.setItem('constructionProjects', JSON.stringify(updatedProjects))
      console.log('💾 Projects saved to localStorage:', updatedProjects.length)
    } catch (error) {
      console.error('❌ Failed to save projects to localStorage:', error)
    }
    
    // Convert TradeTaskBreakdown objects to proper Task objects
    const convertedTasks = tasks.map((tradeTask, index) => ({
      id: `imported-${newProjectId}-${index}`,
      title: tradeTask.description,
      description: `${tradeTask.trade} work: ${tradeTask.description}`,
      completed: false,
      priority: tradeTask.priority,
      startDate: new Date(tradeTask.startDate),
      dueDate: new Date(tradeTask.endDate),
      status: "todo" as const,
      assignee: tradeTask.trade, // Use trade as assignee for Gantt grouping
      tags: tradeTask.floorCoreUnit ? [tradeTask.floorCoreUnit] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: newProjectId, // Assign to the new project
      projectName: extractedProjectName,
      category: tradeTask.trade.includes('Electric') ? 'Electrical' : 
                tradeTask.trade.includes('Plumb') ? 'Plumbing' :
                tradeTask.trade.includes('Structural') ? 'Structural' :
                'Site Work' as any,
      // Programme-specific fields
      trade: tradeTask.trade,
      floorCoreUnit: tradeTask.floorCoreUnit,
      weekNumber: tradeTask.weekNumber,
      estimatedHours: tradeTask.estimatedHours,
      isProgrammeGenerated: true
    }))
    
    // Store converted tasks in localStorage for the tasks page and project details
    localStorage.setItem('importedTasks', JSON.stringify(convertedTasks))
    console.log('📋 Tasks saved to localStorage:', convertedTasks.length)
    
    toast.success(`Created new project: ${extractedProjectName}`, {
      description: `${tasks.length} trade tasks imported. Project saved and ready to view!`
    })
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
                <DetailedProjectCard project={project} />
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
