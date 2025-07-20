"use client"

import { useState, useEffect } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { FolderKanban, Plus, Search, Calendar, Users, MoreHorizontal, Star, MapPin, HardHat, Building, Hammer, AlertTriangle, CheckCircle, Clock, Pause } from "lucide-react"
import Link from "next/link"
import { ProjectUpload } from "@/components/project-upload"
import { toast } from "sonner"
import type { Task, TradeTaskBreakdown, ProgrammeAdminItem, CalendarEvent } from "../../../types/task"

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
      dueDate: "Jun 15, 2026",
      teamMembers: 25,
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
      teamMembers: 18,
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
      criticalPathTasks: 8
    },
    {
      id: "3",
      name: "M25 Motorway Bridge",
      location: "M25 Junction 15, Slough",
      description: "Seismic retrofitting and expansion of the existing motorway bridge.",
      status: "Pre-construction",
      priority: "medium",
      progress: 10,
      dueDate: "Sep 1, 2026",
      teamMembers: 12,
      tasksCompleted: 5,
      totalTasks: 150,
      isStarred: true,
      tasksByStatus: {
        todo: 135,
        inProgress: 10,
        review: 0,
        done: 5
      },
      trades: ["Civil", "Structural", "Concrete", "Steel"],
      siteSupervisor: "Michael Torres",
      criticalPathTasks: 15
    },
    {
      id: "4",
      name: "Birmingham General Hospital Wing",
      location: "152 Broad Street, Birmingham",
      description: "New west wing addition to the main hospital, including surgical suites.",
      status: "Completed",
      priority: "high",
      progress: 100,
      dueDate: "Nov 20, 2024",
      teamMembers: 30,
      tasksCompleted: 250,
      totalTasks: 250,
      isStarred: false,
      tasksByStatus: {
        todo: 0,
        inProgress: 0,
        review: 0,
        done: 250
      },
      trades: ["Medical Equipment", "HVAC", "Electrical", "Fire Safety", "Finishes"],
      siteSupervisor: "Jennifer Lee",
      criticalPathTasks: 0
    },
    {
      id: "5",
      name: "Liverpool Warehouse Facility",
      location: "89 Dock Road, Liverpool",
      description: "Construction of a 500,000 sq. ft. logistics and warehouse facility.",
      status: "On Hold",
      priority: "medium",
      progress: 20,
      dueDate: "Feb 15, 2026",
      teamMembers: 15,
      tasksCompleted: 25,
      totalTasks: 130,
      isStarred: false,
      tasksByStatus: {
        todo: 95,
        inProgress: 10,
        review: 0,
        done: 25
      },
      trades: ["Site Work", "Concrete", "Steel", "Roofing"],
      siteSupervisor: "Carlos Ramirez",
      criticalPathTasks: 6
    }
  ]

export default function ProjectsPage() {
  // Load projects from localStorage or use initial projects
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedProjects = localStorage.getItem('constructionProjects')
        if (savedProjects) {
          const parsed = JSON.parse(savedProjects)
          return [...parsed, ...INITIAL_PROJECTS.filter(ip => !parsed.find((p: Project) => p.id === ip.id))]
        }
      } catch (error) {
        console.error('Failed to load projects from localStorage:', error)
      }
    }
    return INITIAL_PROJECTS
  })

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const projectsToSave = projects.filter(p => !INITIAL_PROJECTS.find(ip => ip.id === p.id))
        localStorage.setItem('constructionProjects', JSON.stringify(projectsToSave))
      } catch (error) {
        console.error('Failed to save projects to localStorage:', error)
      }
    }
  }, [projects])

  // Monitor for new projects created from program uploads
  useEffect(() => {
    const checkForNewProject = () => {
      try {
        const latestProjectData = localStorage.getItem('latestProjectData')
        if (latestProjectData) {
          const projectData = JSON.parse(latestProjectData)
          
          // Check if this project is already in our list
          if (!projects.find(p => p.id === projectData.projectId)) {
            const newProject: Project = {
              id: projectData.projectId,
              name: projectData.projectName,
              location: "TBD - From Program Upload",
              description: `Automatically created from uploaded construction program. Contains ${projectData.taskCount} trade tasks${projectData.adminItemCount ? ` and ${projectData.adminItemCount} admin items` : ''}.`,
              status: "Pre-construction",
              priority: "medium",
              progress: 0,
              dueDate: "TBD",
              teamMembers: 0,
              tasksCompleted: 0,
              totalTasks: projectData.taskCount || 0,
              isStarred: false,
              tasksByStatus: {
                todo: projectData.taskCount || 0,
                inProgress: 0,
                review: 0,
                done: 0
              },
              trades: ["Various"], // Would be populated from actual tasks
              siteSupervisor: "TBD",
              criticalPathTasks: 0
            }
            
            console.log('Adding new project from program upload:', newProject)
            setProjects(prev => [newProject, ...prev])
            
            // Clear the stored project data to prevent re-adding
            localStorage.removeItem('latestProjectData')
            
            toast.success(`New project created: ${projectData.projectName}`, {
              description: "Project added to your portfolio"
            })
          }
        }
      } catch (error) {
        console.error('Failed to check for new project:', error)
      }
    }

    // Check immediately and then set up interval
    checkForNewProject()
    const interval = setInterval(checkForNewProject, 2000) // Check every 2 seconds

    return () => clearInterval(interval)
  }, []) // Remove projects dependency to avoid infinite re-renders

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-green-100 text-green-800 border-green-200"
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Substantially Complete":
        return "bg-sky-100 text-sky-800 border-sky-200"
      case "On Hold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Pre-construction":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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

  const activeProjects = projects.filter((p) => p.status === "In Progress")
  const completedProjects = projects.filter((p) => p.status === "Completed")

  const handleFilesUploaded = (files: File[]) => {
    console.log('Files uploaded:', files)
    
    // Here you would typically:
    // 1. Upload files to your server/cloud storage
    // 2. Create a new project or attach to existing project
    // 3. Update the projects state
    // 4. Show success notification
    
    // Calculate total size
    const totalSize = files.reduce((acc, file) => acc + file.size, 0)
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2)
    
    // Show detailed success message
    const fileTypes = [...new Set(files.map(f => f.name.split('.').pop()?.toUpperCase()))]
    toast.success(
      `Project files ready for processing`, 
      {
        description: `${files.length} files (${totalSizeMB}MB) • Types: ${fileTypes.join(', ')}`
      }
    )
    
    // Log files for development
    files.forEach(file => {
      console.log(`Processed: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
    })
  }

  const handleTasksImported = (tasks: TradeTaskBreakdown[], programName?: string) => {
    console.log('Tasks imported:', tasks)
    
    // Create new project ID
    const newProjectId = `proj-${Date.now()}`
    const projectName = programName || "New Project from Program"
    
    // Convert TradeTaskBreakdown to Task objects
    const newTasks: Task[] = tasks.map((tradeTask, index) => ({
      id: `trade-${Date.now()}-${index}`,
      title: tradeTask.description,
      description: `${tradeTask.trade} - ${tradeTask.description}`,
      completed: false,
      priority: tradeTask.priority,
      status: "todo" as const,
      startDate: tradeTask.startDate,
      dueDate: tradeTask.endDate,
      assignee: undefined, // To be assigned later
      tags: [tradeTask.trade.toLowerCase().replace(/\s+/g, '-')],
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: newProjectId,
      projectName: projectName,
      category: mapTradeToCategory(tradeTask.trade),
      // Enhanced fields from program analysis
      trade: tradeTask.trade,
      floorCoreUnit: tradeTask.floorCoreUnit,
      dependencies: tradeTask.dependencies,
      weekNumber: tradeTask.weekNumber,
      isProgrammeGenerated: true,
      cvc: tradeTask.estimatedValue ? {
        estimatedContributionValue: tradeTask.estimatedValue,
        costs: {
          labourCost: tradeTask.estimatedHours ? tradeTask.estimatedHours * 25 : 0, // £25/hour estimate
          materialsCost: 0,
          equipmentCost: 0,
          travelAccommodation: 0,
          subcontractorFees: 0,
          bonusesAdjustments: 0
        },
        totalCost: tradeTask.estimatedHours ? tradeTask.estimatedHours * 25 : 0,
        cvcScore: tradeTask.estimatedValue ? tradeTask.estimatedValue - (tradeTask.estimatedHours ? tradeTask.estimatedHours * 25 : 0) : 0,
        cvcPercentage: tradeTask.estimatedValue ? ((tradeTask.estimatedValue - (tradeTask.estimatedHours ? tradeTask.estimatedHours * 25 : 0)) / tradeTask.estimatedValue) * 100 : 0,
        isNegative: tradeTask.estimatedValue ? tradeTask.estimatedValue < (tradeTask.estimatedHours ? tradeTask.estimatedHours * 25 : 0) : false,
        hoursLogged: 0,
        hourlyRate: 25
      } : undefined
    }))
    
    // Store both tasks and project data
    const existingTasks = JSON.parse(localStorage.getItem('importedTasks') || '[]')
    const allTasks = [...existingTasks, ...newTasks]
    localStorage.setItem('importedTasks', JSON.stringify(allTasks))
    
    // Store project data for later retrieval
    localStorage.setItem('latestProjectData', JSON.stringify({
      projectId: newProjectId,
      projectName,
      taskCount: newTasks.length,
      createdAt: new Date().toISOString()
    }))
    
    // Debug logging
    console.log('=== IMPORT DEBUG ===')
    console.log('Existing tasks in localStorage:', existingTasks.length)
    console.log('New tasks created:', newTasks.length)
    console.log('Total tasks now in localStorage:', allTasks.length)
    console.log('First new task:', newTasks[0])
    console.log('localStorage size:', localStorage.getItem('importedTasks')?.length || 0, 'characters')
    
    toast.success(`Created new project: ${projectName}`, {
      description: `${newTasks.length} trade tasks imported. Check the Tasks page!`
    })
    
    console.log('Generated tasks for new project:', { projectName, projectId: newProjectId, taskCount: newTasks.length })
  }

  // Helper function to map trade to category
  const mapTradeToCategory = (trade: string): Task['category'] => {
    const tradeMapping: Record<string, Task['category']> = {
      'Electrician': 'Electrical',
      'Plumber': 'Plumbing', 
      'Structural Engineer': 'Structural',
      'Demolition Specialist': 'Site Work',
      'Asbestos Specialist': 'Safety',
      'Crane Operator': 'Site Work',
      'Scaffolder': 'Site Work',
      'General Construction': 'Structural'
    }
    
    return tradeMapping[trade] || 'Structural'
  }

  const handleAdminItemsImported = (items: ProgrammeAdminItem[], programName?: string) => {
    console.log('Admin items imported:', items)
    
    // Get the latest project data to associate admin items with the same project
    const latestProject = JSON.parse(localStorage.getItem('latestProjectData') || '{}')
    const projectId = latestProject.projectId || `proj-${Date.now()}`
    const projectName = programName || latestProject.projectName || "New Project from Program"
    
    // Convert ProgrammeAdminItem to CalendarEvent objects
    const newCalendarEvents: CalendarEvent[] = items.map((adminItem, index) => ({
      id: `admin-${Date.now()}-${index}`,
      title: adminItem.title,
      description: adminItem.description,
      date: adminItem.date,
      time: adminItem.time,
      type: mapAdminTypeToEventType(adminItem.type),
      priority: adminItem.priority,
      projectId: projectId,
      projectName: projectName,
      assignee: adminItem.assignee,
      location: undefined,
      attendees: adminItem.assignee ? [adminItem.assignee] : undefined,
      isRecurring: false,
      notes: adminItem.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
    
    // Store in localStorage for demo (in real app, this would save to database)
    const existingEvents = JSON.parse(localStorage.getItem('importedCalendarEvents') || '[]')
    const allEvents = [...existingEvents, ...newCalendarEvents]
    localStorage.setItem('importedCalendarEvents', JSON.stringify(allEvents))
    
    // Update latest project data with admin items count
    if (latestProject.projectId) {
      localStorage.setItem('latestProjectData', JSON.stringify({
        ...latestProject,
        adminItemCount: items.length
      }))
    }
    
    toast.success(`Added ${items.length} admin items to ${projectName}`, {
      description: "Items added to project calendar. Check the Calendar page!"
    })
    
    console.log('Generated calendar events for project:', { projectName, projectId, eventCount: newCalendarEvents.length })
  }

  // Helper function to map admin type to calendar event type  
  const mapAdminTypeToEventType = (adminType: ProgrammeAdminItem['type']): CalendarEvent['type'] => {
    const typeMapping: Record<ProgrammeAdminItem['type'], CalendarEvent['type']> = {
      'client_approval': 'approval',
      'survey': 'inspection', 
      'design': 'meeting',
      'procurement': 'delivery',
      'handover': 'handover',
      'milestone': 'milestone',
      'meeting': 'meeting'
    }
    
    return typeMapping[adminType] || 'meeting'
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div>
            <h1 className="font-semibold">Construction Sites</h1>
            <p className="text-sm text-muted-foreground">{activeProjects.length} active sites • {projects.reduce((acc, p) => acc + p.criticalPathTasks, 0)} critical tasks</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search projects..." className="w-[300px] pl-8" />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* Construction Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{activeProjects.length}</div>
                  <div className="text-sm text-gray-600">Active Sites</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <HardHat className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {projects.reduce((acc, p) => acc + p.teamMembers, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Crew</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {projects.reduce((acc, p) => acc + p.criticalPathTasks, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Critical Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {projects.reduce((acc, p) => acc + p.tasksByStatus.inProgress, 0)}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

                 {/* Main Content - Two Column Layout */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Projects Grid - Left Side (2/3 width) */}
           <div className="lg:col-span-2">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Card */}
          <ProjectUpload 
            onFilesUploaded={handleFilesUploaded}
            onTasksImported={handleTasksImported}
            onAdminItemsImported={handleAdminItemsImported}
            maxFiles={10}
            maxFileSize={100}
            acceptedTypes={['.pdf', '.dwg', '.xlsx', '.docx', '.png', '.jpg', '.jpeg', '.zip', '.mpp', '.rvt']}
            enableAIAnalysis={true}
          />
          
          {projects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id}>
              <Card className="hover:shadow-md transition-shadow flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5 text-blue-600" />
                      {project.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 pt-2">{project.description}</p>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getStatusColor(project.status)}`}>{project.status}</Badge>
                    <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>{project.priority}</Badge>
                    {project.criticalPathTasks > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {project.criticalPathTasks} Critical
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>

                  {/* Task Status Breakdown */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Task Summary</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>To Do: {project.tasksByStatus.todo}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>In Progress: {project.tasksByStatus.inProgress}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Review: {project.tasksByStatus.review}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Done: {project.tasksByStatus.done}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <HardHat className="h-4 w-4" />
                      <span>Supervisor: {project.siteSupervisor}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Hammer className="h-4 w-4" />
                      <span>Trades: {project.trades.slice(0, 2).join(", ")}{project.trades.length > 2 ? ` +${project.trades.length - 2}` : ""}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{project.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{project.teamMembers} Crew</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
            </div>
          </div>

                    {/* AI Insights Sidebar - Right Side (1/3 width) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <Clock className="h-3 w-3 text-white" />
                  </div>
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {/* Weather Impact */}
                 <div className="p-3 border rounded-lg">
                   <div className="flex items-start gap-3">
                     <span className="text-lg">🌤️</span>
                     <div className="flex-1">
                       <div className="font-semibold text-sm text-gray-900 mb-1">Weather Impact</div>
                       <p className="text-xs text-gray-700 mb-2">
                         Heavy rain Thursday-Friday affecting 3 sites
                       </p>
                       <div className="flex items-center justify-between mb-3">
                         <Badge variant="secondary" className="bg-black text-white text-xs">High Confidence</Badge>
                         <span className="text-xs text-orange-600">4 hours ago</span>
                       </div>
                       <Button variant="outline" size="sm" className="w-full text-xs">
                         Review concrete pours
                       </Button>
                     </div>
                   </div>
                 </div>

                 {/* Top Performer */}
                 <div className="p-3 border rounded-lg">
                   <div className="flex items-start gap-3">
                     <span className="text-lg">✅</span>
                     <div className="flex-1">
                       <div className="font-semibold text-sm text-green-800 mb-1">Top Performer</div>
                       <p className="text-xs text-gray-700 mb-2">
                         David Chen's team 20% ahead at London Office Tower
                       </p>
                       <div className="flex items-center justify-between mb-3">
                         <Badge variant="secondary" className="bg-black text-white text-xs">High Confidence</Badge>
                         <span className="text-xs text-green-600">120% efficiency</span>
                       </div>
                       <Button variant="outline" size="sm" className="w-full text-xs">
                         View details
                       </Button>
                     </div>
                   </div>
                 </div>

                 {/* Behind Schedule */}
                 <div className="p-3 border rounded-lg">
                   <div className="flex items-start gap-3">
                     <span className="text-lg">⚠️</span>
                     <div className="flex-1">
                       <div className="font-semibold text-sm text-red-800 mb-1">Behind Schedule</div>
                       <p className="text-xs text-gray-700 mb-2">
                         Electrical work at Manchester Complex needs attention
                       </p>
                       <div className="flex items-center justify-between mb-3">
                         <Badge variant="secondary" className="bg-black text-white text-xs">High Confidence</Badge>
                         <span className="text-xs text-red-600">4 days delayed</span>
                       </div>
                       <Button variant="outline" size="sm" className="w-full text-xs">
                         Adjust timeline
                       </Button>
                     </div>
                   </div>
                 </div>

                 {/* Material Alert */}
                 <div className="p-3 border rounded-lg">
                   <div className="flex items-start gap-3">
                     <span className="text-lg">🏗️</span>
                     <div className="flex-1">
                       <div className="font-semibold text-sm text-blue-800 mb-1">Material Alert</div>
                       <p className="text-xs text-gray-700 mb-2">
                         Order steel by Tuesday for M25 Bridge project
                       </p>
                       <div className="flex items-center justify-between mb-3">
                         <Badge variant="secondary" className="bg-black text-white text-xs">High Confidence</Badge>
                         <span className="text-xs text-blue-600">Save £18,000</span>
                       </div>
                       <Button variant="outline" size="sm" className="w-full text-xs">
                         Order now
                       </Button>
                     </div>
                   </div>
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
