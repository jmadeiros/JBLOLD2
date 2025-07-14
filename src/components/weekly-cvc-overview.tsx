"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  User, 
  DollarSign,
  Target,
  Download,
  Filter,
  Eye
} from "lucide-react"
import type { Task, WorkerCVCSummary } from "../../types/task"
import {
  calculateWeeklyCVCSummary,
  formatCurrency,
  formatPercentage,
  getCVCStatusColor,
  calculateCompletionEfficiency,
  getCurrentWeekDates
} from "@/lib/cvc-utils"

interface WeeklyCVCOverviewProps {
  tasks: Task[]
  weekStartDate?: Date
  weekEndDate?: Date
  onViewWorkerDetails?: (workerId: string) => void
  onExportData?: () => void
}

export function WeeklyCVCOverview({ 
  tasks, 
  weekStartDate, 
  weekEndDate, 
  onViewWorkerDetails,
  onExportData 
}: WeeklyCVCOverviewProps) {
  const [filter, setFilter] = useState<"all" | "high-value" | "low-value" | "negative">("all")
  
  // Use current week if no dates provided
  const { start, end } = getCurrentWeekDates()
  const startDate = weekStartDate || start
  const endDate = weekEndDate || end

  // Get unique workers from tasks
  const workers = Array.from(new Set(tasks.map(task => task.assignee).filter(Boolean))) as string[]
  
  // Calculate CVC summary for each worker
  const workerSummaries: WorkerCVCSummary[] = workers.map(worker => {
    const workerId = worker.toLowerCase().replace(/\s+/g, '-')
    return calculateWeeklyCVCSummary(workerId, worker, tasks, startDate, endDate)
  })

  // Filter workers based on selected filter
  const filteredSummaries = workerSummaries.filter(summary => {
    if (filter === "all") return true
    return summary.status === filter
  })

  // Sort by net CVC (highest first)
  const sortedSummaries = filteredSummaries.sort((a, b) => b.netCVC - a.netCVC)

  const getStatusBadge = (status: WorkerCVCSummary["status"]) => {
    switch (status) {
      case "high-value":
        return <Badge variant="default" className="bg-green-100 text-green-800">High Value</Badge>
      case "on-target":
        return <Badge variant="outline" className="border-blue-300 text-blue-800">On Target</Badge>
      case "low-value":
        return <Badge variant="outline" className="border-yellow-300 text-yellow-800">Low Value</Badge>
      case "negative":
        return <Badge variant="destructive">Negative</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const totalTeamCVC = sortedSummaries.reduce((sum, summary) => sum + summary.netCVC, 0)
  const totalTeamHours = sortedSummaries.reduce((sum, summary) => sum + summary.totalHoursLogged, 0)
  const totalTeamTasks = sortedSummaries.reduce((sum, summary) => sum + summary.totalTasksCompleted, 0)

  return (
    <div className="space-y-6">
      {/* Header with filters and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Weekly CVC Overview</h2>
          <p className="text-sm text-muted-foreground">
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4 text-gray-500" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Workers</option>
              <option value="high-value">High Value</option>
              <option value="on-target">On Target</option>
              <option value="low-value">Low Value</option>
              <option value="negative">Negative</option>
            </select>
          </div>
          
          {onExportData && (
            <Button variant="outline" size="sm" onClick={onExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Team CVC</p>
                <p className="text-2xl font-bold">{formatCurrency(totalTeamCVC)}</p>
              </div>
              <div className={`p-2 rounded-full ${totalTeamCVC >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {totalTeamCVC >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{totalTeamHours}h</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                <p className="text-2xl font-bold">{totalTeamTasks}</p>
              </div>
              <div className="p-2 rounded-full bg-purple-100">
                <CheckCircle className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Worker Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Worker</th>
                  <th className="text-right py-3 px-2">Hours</th>
                  <th className="text-right py-3 px-2">Tasks</th>
                  <th className="text-right py-3 px-2">Cost</th>
                  <th className="text-right py-3 px-2">Contribution</th>
                  <th className="text-right py-3 px-2">Net CVC</th>
                  <th className="text-center py-3 px-2">Status</th>
                  <th className="text-center py-3 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedSummaries.map((summary, index) => {
                  const efficiency = calculateCompletionEfficiency(summary)
                  const statusColor = getCVCStatusColor(summary.netCVC)
                  
                  return (
                    <tr key={summary.workerId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{summary.workerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {efficiency.rating} efficiency
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-2 text-right">
                        <div>
                          <p className="font-medium">{summary.totalHoursLogged}h</p>
                          {summary.totalHoursLogged === 0 && (
                            <p className="text-xs text-gray-500">No time logged</p>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-3 px-2 text-right">
                        <div>
                          <p className="font-medium">
                            {summary.totalTasksCompleted}/{summary.totalTasksAssigned}
                          </p>
                          {summary.totalTasksAssigned > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                              <div 
                                className="bg-blue-500 h-1 rounded-full" 
                                style={{ 
                                  width: `${(summary.totalTasksCompleted / summary.totalTasksAssigned) * 100}%` 
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-3 px-2 text-right">
                        <p className="font-medium">{formatCurrency(summary.totalCost)}</p>
                      </td>
                      
                      <td className="py-3 px-2 text-right">
                        <p className="font-medium">{formatCurrency(summary.totalContribution)}</p>
                      </td>
                      
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className={`font-bold ${statusColor.color}`}>
                            {formatCurrency(summary.netCVC)}
                          </span>
                          <span className={`text-xs ${statusColor.color}`}>
                            {formatPercentage(summary.cvcPercentage)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="py-3 px-2 text-center">
                        {getStatusBadge(summary.status)}
                      </td>
                      
                      <td className="py-3 px-2 text-center">
                        {onViewWorkerDetails && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onViewWorkerDetails(summary.workerId)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {sortedSummaries.length === 0 && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No workers found</p>
              <p className="text-sm text-gray-400">
                {filter !== "all" ? `Try changing the filter to see more workers.` : "Assign tasks to workers to see their performance here."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 