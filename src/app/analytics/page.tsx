"use client"

import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WeeklyCVCOverview } from "@/components/weekly-cvc-overview"
import { CVCBreakdown } from "@/components/cvc-breakdown"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download,
  Calculator,
  DollarSign,
  Target,
  User,
  Filter,
  PieChart,
  Activity
} from "lucide-react"
import { formatCurrency, formatPercentage, getCVCStatusColor } from "@/lib/cvc-utils"
import type { Task } from "../../../types/task"

// Sample CVC data - In a real app, this would come from your data source
const sampleCVCTasks: Task[] = [
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
    projectName: "Downtown Office Tower",
    cvc: {
      estimatedContributionValue: 8500,
      costs: {
        labourCost: 1760,
        materialsCost: 2500,
        equipmentCost: 800,
        travelAccommodation: 150,
        subcontractorFees: 1200,
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
    projectName: "Greenwood Residential Complex",
    cvc: {
      estimatedContributionValue: 4500,
      costs: {
        labourCost: 1320,
        materialsCost: 1800,
        equipmentCost: 200,
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
    title: "Install HVAC units on Roof",
    description: "Crane lift scheduled for 8 AM. All units to be installed by EOD.",
    completed: false,
    priority: "high",
    status: "review",
    dueDate: new Date(2024, 11, 30),
    assignee: "Frank Miller",
    tags: ["HVAC", "MEP", "urgent"],
    createdAt: new Date(2024, 11, 28),
    updatedAt: new Date(2024, 11, 29),
    projectId: "1",
    projectName: "Downtown Office Tower",
    cvc: {
      estimatedContributionValue: 12000,
      costs: {
        labourCost: 1540,
        materialsCost: 8500,
        equipmentCost: 2500,
        travelAccommodation: 200,
        subcontractorFees: 1800,
        bonusesAdjustments: 500
      },
      totalCost: 15040,
      cvcScore: -3040,
      cvcPercentage: -25.3,
      isNegative: true,
      hoursLogged: 42.0,
      hourlyRate: 22
    }
  }
]

export default function AnalyticsPage() {
  const productivityData = {
    tasksCompleted: 156,
    tasksCompletedChange: 12,
    averageCompletionTime: "2.3 days",
    completionTimeChange: -8,
    teamEfficiency: 87,
    efficiencyChange: 5,
    overdueRate: 8,
    overdueRateChange: -3,
  }

  const weeklyData = [
    { day: "Mon", completed: 12, created: 8 },
    { day: "Tue", completed: 15, created: 12 },
    { day: "Wed", completed: 18, created: 10 },
    { day: "Thu", completed: 14, created: 16 },
    { day: "Fri", completed: 20, created: 14 },
    { day: "Sat", completed: 8, created: 5 },
    { day: "Sun", completed: 6, created: 3 },
  ]

  const projectProgress = [
    { name: "Website Redesign", progress: 75, status: "on-track", dueDate: "Jan 15" },
    { name: "Mobile App", progress: 45, status: "at-risk", dueDate: "Mar 1" },
    { name: "API Documentation", progress: 90, status: "ahead", dueDate: "Jan 8" },
    { name: "Database Migration", progress: 100, status: "completed", dueDate: "Dec 20" },
  ]

  const teamPerformance = [
    { name: "John Doe", completed: 24, efficiency: 92, department: "Engineering" },
    { name: "Jane Smith", completed: 31, efficiency: 88, department: "Product" },
    { name: "Mike Johnson", completed: 18, efficiency: 85, department: "Design" },
    { name: "Sarah Wilson", completed: 22, efficiency: 90, department: "Engineering" },
    { name: "Alex Chen", completed: 16, efficiency: 82, department: "Analytics" },
  ]

  // CVC Analytics calculations
  const tasksWithCVC = sampleCVCTasks.filter(task => task.cvc)
  const totalCVCValue = tasksWithCVC.reduce((sum, task) => sum + (task.cvc?.cvcScore || 0), 0)
  const totalContribution = tasksWithCVC.reduce((sum, task) => sum + (task.cvc?.estimatedContributionValue || 0), 0)
  const totalCost = tasksWithCVC.reduce((sum, task) => sum + (task.cvc?.totalCost || 0), 0)
  const averageCVCPercentage = tasksWithCVC.length > 0 
    ? tasksWithCVC.reduce((sum, task) => sum + (task.cvc?.cvcPercentage || 0), 0) / tasksWithCVC.length 
    : 0

  const positiveCVCTasks = tasksWithCVC.filter(task => !task.cvc?.isNegative)
  const negativeCVCTasks = tasksWithCVC.filter(task => task.cvc?.isNegative)
  const completedCVCTasks = tasksWithCVC.filter(task => task.completed)

  // CVC by project
  const cvcByProject = tasksWithCVC.reduce((acc, task) => {
    const projectName = task.projectName || "Unknown Project"
    if (!acc[projectName]) {
      acc[projectName] = { totalCVC: 0, taskCount: 0 }
    }
    acc[projectName].totalCVC += task.cvc?.cvcScore || 0
    acc[projectName].taskCount += 1
    return acc
  }, {} as Record<string, { totalCVC: number, taskCount: number }>)

  // CVC by worker
  const cvcByWorker = tasksWithCVC
    .filter((task): task is Task & { assignee: string } => !!task.assignee) // Type guard
    .reduce((acc, task) => {
      const assignee = task.assignee
      if (!acc[assignee]) {
        acc[assignee] = { totalCVC: 0, taskCount: 0, totalHours: 0 }
      }
      acc[assignee].totalCVC += task.cvc?.cvcScore || 0
      acc[assignee].taskCount += 1
      acc[assignee].totalHours += task.cvc?.hoursLogged || 0
      return acc
    }, {} as Record<string, { totalCVC: number, taskCount: number, totalHours: number }>)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-green-100 text-green-800 border-green-200"
      case "at-risk":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "ahead":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return null
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-gray-600"
  }

  const handleViewWorkerDetails = (workerId: string) => {
    console.log("View worker details:", workerId)
  }

  const handleExportCVCData = () => {
    console.log("Export CVC data")
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div>
            <h1 className="font-semibold">Analytics</h1>
            <p className="text-sm text-muted-foreground">Performance insights and metrics</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productivityData.tasksCompleted}</div>
              <div className="flex items-center text-xs">
                {getTrendIcon(productivityData.tasksCompletedChange)}
                <span className={`ml-1 ${getTrendColor(productivityData.tasksCompletedChange)}`}>
                  {productivityData.tasksCompletedChange > 0 ? "+" : ""}
                  {productivityData.tasksCompletedChange}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productivityData.averageCompletionTime}</div>
              <div className="flex items-center text-xs">
                {getTrendIcon(productivityData.completionTimeChange)}
                <span className={`ml-1 ${getTrendColor(productivityData.completionTimeChange)}`}>
                  {productivityData.completionTimeChange > 0 ? "+" : ""}
                  {productivityData.completionTimeChange}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Efficiency</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productivityData.teamEfficiency}%</div>
              <div className="flex items-center text-xs">
                {getTrendIcon(productivityData.efficiencyChange)}
                <span className={`ml-1 ${getTrendColor(productivityData.efficiencyChange)}`}>
                  {productivityData.efficiencyChange > 0 ? "+" : ""}
                  {productivityData.efficiencyChange}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productivityData.overdueRate}%</div>
              <div className="flex items-center text-xs">
                {getTrendIcon(-productivityData.overdueRateChange)}
                <span className={`ml-1 ${getTrendColor(-productivityData.overdueRateChange)}`}>
                  {productivityData.overdueRateChange > 0 ? "-" : "+"}
                  {Math.abs(productivityData.overdueRateChange)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
            <TabsTrigger value="cvc">CVC Analytics</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weeklyData.map((day) => (
                      <div key={day.day} className="flex items-center gap-4">
                        <div className="w-12 text-sm font-medium">{day.day}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Completed: {day.completed}</span>
                            <span>Created: {day.created}</span>
                          </div>
                          <div className="flex gap-1">
                            <div className="flex-1 bg-green-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${(day.completed / 25) * 100}%` }}
                              />
                            </div>
                            <div className="flex-1 bg-blue-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(day.created / 25) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Task Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">High Priority</span>
                      <span className="text-sm font-medium">32%</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Medium Priority</span>
                      <span className="text-sm font-medium">48%</span>
                    </div>
                    <Progress value={48} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Low Priority</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectProgress.map((project) => (
                    <div key={project.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{project.name}</span>
                          <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                            {project.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">Due {project.dueDate}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} className="flex-1" />
                        <span className="text-sm font-medium w-12">{project.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamPerformance.map((member) => (
                    <div key={member.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.department}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{member.completed}</div>
                          <div className="text-xs text-muted-foreground">Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{member.efficiency}%</div>
                          <div className="text-xs text-muted-foreground">Efficiency</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cvc" className="space-y-6">
            {/* CVC Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total CVC Value</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalCVCValue)}</div>
                  <div className="flex items-center text-xs">
                    {totalCVCValue >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`ml-1 ${totalCVCValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalCVCValue >= 0 ? 'Positive' : 'Negative'} CVC
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg CVC %</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(averageCVCPercentage)}</div>
                  <div className="flex items-center text-xs">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="ml-1 text-blue-600">
                      {tasksWithCVC.length} tasks tracked
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Positive CVC Tasks</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{positiveCVCTasks.length}</div>
                  <div className="flex items-center text-xs">
                    <span className="text-green-600">
                      {((positiveCVCTasks.length / tasksWithCVC.length) * 100).toFixed(1)}% of tracked tasks
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Negative CVC Tasks</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{negativeCVCTasks.length}</div>
                  <div className="flex items-center text-xs">
                    <span className="text-red-600">
                      {((negativeCVCTasks.length / tasksWithCVC.length) * 100).toFixed(1)}% of tracked tasks
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CVC Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CVC by Project */}
              <Card>
                <CardHeader>
                  <CardTitle>CVC by Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(cvcByProject).map(([projectName, data]) => {
                      const statusColor = getCVCStatusColor(data.totalCVC)
                      return (
                        <div key={projectName} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{projectName}</span>
                              <Badge variant="outline">{data.taskCount} tasks</Badge>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${statusColor.color}`}>
                                {formatCurrency(data.totalCVC)}
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${data.totalCVC >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ 
                                width: `${Math.min(100, Math.abs(data.totalCVC) / 5000 * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* CVC by Worker */}
              <Card>
                <CardHeader>
                  <CardTitle>CVC by Worker</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(cvcByWorker).map(([workerName, data]) => {
                      const statusColor = getCVCStatusColor(data.totalCVC)
                      return (
                        <div key={workerName} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{workerName}</span>
                              <Badge variant="outline">{data.taskCount} tasks</Badge>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${statusColor.color}`}>
                                {formatCurrency(data.totalCVC)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {data.totalHours}h logged
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${data.totalCVC >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ 
                                width: `${Math.min(100, Math.abs(data.totalCVC) / 3000 * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost vs Contribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cost vs Contribution Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Contribution</span>
                      <span className="text-lg font-bold text-green-600">{formatCurrency(totalContribution)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Cost</span>
                      <span className="text-lg font-bold text-red-600">{formatCurrency(totalCost)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Net CVC</span>
                      <span className={`text-xl font-bold ${totalCVCValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(totalCVCValue)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <h4 className="font-medium mb-2">CVC Distribution</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Positive CVC</span>
                          <span className="text-sm font-medium text-green-600">
                            {((positiveCVCTasks.length / tasksWithCVC.length) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={(positiveCVCTasks.length / tasksWithCVC.length) * 100} className="h-2" />
                        
                        <div className="flex justify-between">
                          <span className="text-sm">Negative CVC</span>
                          <span className="text-sm font-medium text-red-600">
                            {((negativeCVCTasks.length / tasksWithCVC.length) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={(negativeCVCTasks.length / tasksWithCVC.length) * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly CVC Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly CVC Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <WeeklyCVCOverview 
                  tasks={sampleCVCTasks}
                  onViewWorkerDetails={handleViewWorkerDetails}
                  onExportData={handleExportCVCData}
                />
              </CardContent>
            </Card>

            {/* Individual Task CVC Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Individual Task CVC Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleCVCTasks.map((task) => {
                    const statusColor = task.cvc ? getCVCStatusColor(task.cvc.cvcScore) : null
                    
                    return (
                      <div key={task.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{task.projectName}</Badge>
                              <Badge variant={task.completed ? "default" : "secondary"} className="text-xs">
                                {task.completed ? "Completed" : "In Progress"}
                              </Badge>
                              {task.cvc && (
                                <Badge variant={task.cvc.isNegative ? "destructive" : "default"} className="text-xs">
                                  {formatCurrency(task.cvc.cvcScore)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Assigned to</p>
                            <p className="font-medium">{task.assignee}</p>
                          </div>
                        </div>
                        
                        {task.cvc && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Contribution</p>
                              <p className="font-medium text-green-600">{formatCurrency(task.cvc.estimatedContributionValue)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Cost</p>
                              <p className="font-medium text-red-600">{formatCurrency(task.cvc.totalCost)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Hours Logged</p>
                              <p className="font-medium text-blue-600">{task.cvc.hoursLogged || 0}h</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">CVC %</p>
                              <p className={`font-medium ${task.cvc.isNegative ? 'text-red-600' : 'text-green-600'}`}>
                                {formatPercentage(task.cvc.cvcPercentage)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Productivity Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Productivity chart visualization would go here</p>
                      <p className="text-xs">Integration with charting library needed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Completion rate chart would go here</p>
                      <p className="text-xs">Integration with charting library needed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
