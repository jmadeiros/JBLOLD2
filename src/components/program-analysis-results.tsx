"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Calendar,
  FolderKanban,
  AlertTriangle,
  FileText,
  Building,
  Target,
  TrendingUp,
  Download,
  Upload,
  Eye,
  UserCheck
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import type { ProgramAnalysisResult, TradeTaskBreakdown, ProgrammeAdminItem } from "../../types/task"
import { cn } from "@/lib/utils"

interface ProgramAnalysisResultsProps {
  analysisResult: ProgramAnalysisResult
  onImportTasks: (tasks: TradeTaskBreakdown[]) => void
  onImportAdminItems: (items: ProgrammeAdminItem[]) => void
  onClose: () => void
  isImporting?: boolean
}

export function ProgramAnalysisResults({ 
  analysisResult, 
  onImportTasks, 
  onImportAdminItems, 
  onClose,
  isImporting = false
}: ProgramAnalysisResultsProps) {
  // Auto-select all tasks and admin items by default
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(
    new Set(analysisResult.tradeTasks.map((_, index) => index))
  )
  const [selectedAdminItems, setSelectedAdminItems] = useState<Set<number>>(
    new Set(analysisResult.adminItems.map((_, index) => index))
  )
  const [activeTab, setActiveTab] = useState("overview")

  const toggleTaskSelection = (index: number) => {
    const newSelection = new Set(selectedTasks)
    if (newSelection.has(index)) {
      newSelection.delete(index)
    } else {
      newSelection.add(index)
    }
    setSelectedTasks(newSelection)
  }

  const toggleAdminItemSelection = (index: number) => {
    const newSelection = new Set(selectedAdminItems)
    if (newSelection.has(index)) {
      newSelection.delete(index)
    } else {
      newSelection.add(index)
    }
    setSelectedAdminItems(newSelection)
  }

  const selectAllTasks = () => {
    setSelectedTasks(new Set(analysisResult.tradeTasks.map((_, index) => index)))
  }

  const selectAllAdminItems = () => {
    setSelectedAdminItems(new Set(analysisResult.adminItems.map((_, index) => index)))
  }

  const clearTaskSelection = () => setSelectedTasks(new Set())
  const clearAdminSelection = () => setSelectedAdminItems(new Set())

  const handleImportTasks = () => {
    const tasksToImport = Array.from(selectedTasks).map(index => analysisResult.tradeTasks[index])
    onImportTasks(tasksToImport)
  }

  const handleImportAdminItems = () => {
    const itemsToImport = Array.from(selectedAdminItems).map(index => analysisResult.adminItems[index])
    onImportAdminItems(itemsToImport)
  }

  const getTradeColor = (trade: string) => {
    const colors: Record<string, string> = {
      "Electrician": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Plumber": "bg-blue-100 text-blue-800 border-blue-200",
      "Structural Engineer": "bg-red-100 text-red-800 border-red-200",
      "Demolition Specialist": "bg-orange-100 text-orange-800 border-orange-200",
      "Asbestos Specialist": "bg-purple-100 text-purple-800 border-purple-200",
      "Crane Operator": "bg-green-100 text-green-800 border-green-200",
      "Scaffolder": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "General Construction": "bg-gray-100 text-gray-800 border-gray-200"
    }
    return colors[trade] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatHours = (hours: number) => {
    if (hours >= 40) {
      const weeks = Math.floor(hours / 40)
      const remainingHours = hours % 40
      return remainingHours > 0 ? `${weeks}w ${remainingHours}h` : `${weeks}w`
    }
    return `${hours}h`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Program Analysis Results</h2>
          <p className="text-muted-foreground">{analysisResult.programName}</p>
          <p className="text-sm text-muted-foreground">
            Analyzed on {format(analysisResult.analysisDate, "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Eye className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trade-tasks">
            <Building className="h-4 w-4 mr-2" />
            Trade Tasks ({analysisResult.tradeTasks.length})
          </TabsTrigger>
          <TabsTrigger value="admin-items">
            <FileText className="h-4 w-4 mr-2" />
            Admin Items ({analysisResult.adminItems.length})
          </TabsTrigger>
          <TabsTrigger value="import">
            <Download className="h-4 w-4 mr-2" />
            Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResult.summary.totalTasks}
                    </div>
                    <div className="text-sm text-gray-600">Trade Tasks</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {analysisResult.summary.totalAdminItems}
                    </div>
                    <div className="text-sm text-gray-600">Admin Items</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {analysisResult.summary.timeline.durationWeeks}
                    </div>
                    <div className="text-sm text-gray-600">Weeks</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {Object.keys(analysisResult.summary.tradeBreakdown).length}
                    </div>
                    <div className="text-sm text-gray-600">Trades</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Project Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">Start:</span> {format(analysisResult.summary.timeline.startDate, "MMM d, yyyy")}
                  </div>
                  <div>
                    <span className="font-medium">End:</span> {format(analysisResult.summary.timeline.endDate, "MMM d, yyyy")}
                  </div>
                </div>
                <Progress 
                  value={75} 
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground">
                  {differenceInDays(analysisResult.summary.timeline.endDate, analysisResult.summary.timeline.startDate)} days total duration
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Trade Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trade Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(analysisResult.summary.tradeBreakdown).map(([trade, count]) => (
                  <div key={trade} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{trade}</p>
                      <Badge className={cn("text-xs", getTradeColor(trade))}>
                        {count} tasks
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Critical Path */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Critical Path Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysisResult.summary.criticalPath.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trade-tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Trade Tasks</h3>
              <p className="text-muted-foreground">Tasks suitable for assignment to specific trade teams</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllTasks}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearTaskSelection}>
                Clear Selection
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {analysisResult.tradeTasks.map((task, index) => (
              <Card key={index} className={cn(
                "transition-all duration-200",
                selectedTasks.has(index) && "ring-2 ring-blue-500 bg-blue-50"
              )}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedTasks.has(index)}
                      onCheckedChange={() => toggleTaskSelection(index)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{task.description}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={cn("text-xs", getTradeColor(task.trade))}>
                              {task.trade}
                            </Badge>
                            <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                              {task.priority}
                            </Badge>
                            {task.weekNumber && (
                              <Badge variant="outline" className="text-xs">
                                Week {task.weekNumber}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          {task.estimatedValue && (
                            <div className="font-medium text-green-600">
                              {formatCurrency(task.estimatedValue)}
                            </div>
                          )}
                          {task.estimatedHours && (
                            <div className="text-muted-foreground">
                              {formatHours(task.estimatedHours)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(task.startDate, "MMM d")} - {format(task.endDate, "MMM d")}</span>
                        </div>
                        {task.floorCoreUnit && (
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span>{task.floorCoreUnit}</span>
                          </div>
                        )}
                      </div>

                      {task.dependencies && task.dependencies.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground mb-1">Dependencies:</div>
                          <div className="flex flex-wrap gap-1">
                            {task.dependencies.map((dep, depIndex) => (
                              <Badge key={depIndex} variant="outline" className="text-xs">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="admin-items" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Programme Admin Items</h3>
              <p className="text-muted-foreground">Non-trade activities for calendar and milestone tracking</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllAdminItems}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearAdminSelection}>
                Clear Selection
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {analysisResult.adminItems.map((item, index) => (
              <Card key={index} className={cn(
                "transition-all duration-200",
                selectedAdminItems.has(index) && "ring-2 ring-blue-500 bg-blue-50"
              )}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedAdminItems.has(index)}
                      onCheckedChange={() => toggleAdminItemSelection(index)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {item.type.replace('_', ' ')}
                            </Badge>
                            <Badge className={cn("text-xs", getPriorityColor(item.priority))}>
                              {item.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(item.date, "MMM d, yyyy")}</span>
                        </div>
                        {item.time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{item.time}</span>
                          </div>
                        )}
                        {item.assignee && (
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-4 w-4" />
                            <span>{item.assignee}</span>
                          </div>
                        )}
                      </div>

                      {item.notes && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          {/* Combined Import Option */}
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Target className="h-5 w-5" />
                Import Complete Project
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedTasks.size}</div>
                  <div className="text-sm text-muted-foreground">Trade Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedAdminItems.size}</div>
                  <div className="text-sm text-muted-foreground">Admin Items</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Import both trade tasks and admin data to create a complete project
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Creates new project: "{analysisResult.programName}"</li>
                  <li>• Imports all selected tasks and admin items</li>
                  <li>• Sets up Gantt timeline and calendar events</li>
                  <li>• Preserves dependencies and scheduling</li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={async () => {
                    if (selectedTasks.size > 0) {
                      await handleImportTasks()
                    }
                    if (selectedAdminItems.size > 0) {
                      await handleImportAdminItems()
                    }
                  }}
                  disabled={(selectedTasks.size === 0 && selectedAdminItems.size === 0) || isImporting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isImporting ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Import Both ({selectedTasks.size + selectedAdminItems.size} items)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Import Trade Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Import Trade Tasks Only
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Selected {selectedTasks.size} of {analysisResult.tradeTasks.length} trade tasks
                </div>
                <Progress 
                  value={(selectedTasks.size / analysisResult.tradeTasks.length) * 100} 
                  className="h-2"
                />
                <div className="space-y-2">
                  <p className="text-sm">
                    Import only the trade tasks to create a <strong>project timeline</strong>.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Creates new project: "{analysisResult.programName}"</li>
                    <li>• Tasks inherit trade category and priority</li>
                    <li>• Dependencies preserved for proper sequencing</li>
                    <li>• Estimated values added to CVC tracking</li>
                  </ul>
                </div>
                <Button 
                  onClick={handleImportTasks}
                  disabled={selectedTasks.size === 0 || isImporting}
                  className="w-full"
                  variant="outline"
                >
                  {isImporting ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Creating Project...
                    </>
                  ) : (
                    <>
                      <Building className="h-4 w-4 mr-2" />
                      Import {selectedTasks.size} Tasks Only
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Import Admin Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Import Admin Data Only
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Selected {selectedAdminItems.size} of {analysisResult.adminItems.length} admin items
                </div>
                <Progress 
                  value={(selectedAdminItems.size / analysisResult.adminItems.length) * 100} 
                  className="h-2"
                />
                <div className="space-y-2">
                  <p className="text-sm">
                    Import only admin data to the <strong>project calendar</strong>.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Associated with project: "{analysisResult.programName}"</li>
                    <li>• Events categorized by type (approvals, surveys, etc.)</li>
                    <li>• Reminders set for high-priority items</li>
                    <li>• Timeline milestones tracked</li>
                  </ul>
                </div>
                <Button 
                  onClick={handleImportAdminItems}
                  disabled={selectedAdminItems.size === 0 || isImporting}
                  className="w-full"
                  variant="outline"
                >
                  {isImporting ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Adding to Calendar...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Import {selectedAdminItems.size} Admin Items Only
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 