"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  User, 
  Wrench, 
  Package, 
  Car, 
  Users,
  Gift,
  Calculator,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react"
import type { Task } from "../../types/task"
import {
  calculateCVCMetrics,
  formatCurrency,
  formatPercentage,
  getCVCStatusColor,
  getTimeStatus,
  hasTimeLoggedButIncomplete
} from "@/lib/cvc-utils"

interface CVCBreakdownProps {
  task: Task
  onEdit?: () => void
  showEditButton?: boolean
}

export function CVCBreakdown({ task, onEdit, showEditButton = false }: CVCBreakdownProps) {
  const cvcData = calculateCVCMetrics(task)
  
  if (!cvcData) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Calculator className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-center">No CVC data available</p>
          <p className="text-sm text-gray-400 text-center mt-1">
            Add cost and contribution estimates to track profitability
          </p>
          {showEditButton && (
            <Button variant="outline" onClick={onEdit} className="mt-4">
              Add CVC Data
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const statusColor = getCVCStatusColor(cvcData.cvcScore)
  const timeStatus = getTimeStatus(task)
  const hasIncompleteTime = hasTimeLoggedButIncomplete(task)

  return (
    <Card className={`${statusColor.bgColor} border-2`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cost vs Contribution Breakdown
          </CardTitle>
          {showEditButton && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit CVC
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Worker & Time Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Assigned To</p>
              <p className="text-lg">{task.assignee || "Unassigned"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Hours Logged</p>
              <p className="text-lg">{cvcData.hoursLogged || 0}h</p>
              {cvcData.hoursLogged && (
                <Badge variant="outline" className={`text-xs ${timeStatus.color}`}>
                  {timeStatus.message}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Hourly Rate</p>
              <p className="text-lg">{formatCurrency(cvcData.hourlyRate || 0)}</p>
            </div>
          </div>
        </div>

        {/* Time Alert */}
        {hasIncompleteTime && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-800">
              Time logged but task not completed
            </span>
          </div>
        )}

        <Separator />

        {/* Cost Breakdown */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Cost Breakdown
          </h4>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center gap-2">
                <Wrench className="h-4 w-4 text-gray-500" />
                Labour Cost
              </span>
              <span className="font-medium">{formatCurrency(cvcData.costs.labourCost)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                Materials
              </span>
              <span className="font-medium">{formatCurrency(cvcData.costs.materialsCost)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center gap-2">
                <Wrench className="h-4 w-4 text-gray-500" />
                Equipment
              </span>
              <span className="font-medium">{formatCurrency(cvcData.costs.equipmentCost)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center gap-2">
                <Car className="h-4 w-4 text-gray-500" />
                Travel & Accommodation
              </span>
              <span className="font-medium">{formatCurrency(cvcData.costs.travelAccommodation)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                Subcontractor Fees
              </span>
              <span className="font-medium">{formatCurrency(cvcData.costs.subcontractorFees)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center gap-2">
                <Gift className="h-4 w-4 text-gray-500" />
                Bonuses & Adjustments
              </span>
              <span className="font-medium">{formatCurrency(cvcData.costs.bonusesAdjustments)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center font-medium">
              <span>Total Cost</span>
              <span className="text-lg">{formatCurrency(cvcData.totalCost)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* CVC Summary */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            CVC Summary
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Estimated Contribution Value</span>
              <span className="font-medium text-lg">{formatCurrency(cvcData.estimatedContributionValue)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Cost</span>
              <span className="font-medium text-lg">-{formatCurrency(cvcData.totalCost)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Net CVC Score</span>
              <div className="flex items-center gap-2">
                <Badge variant={statusColor.variant} className={statusColor.color}>
                  {cvcData.isNegative ? (
                    <XCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  {formatCurrency(cvcData.cvcScore)}
                </Badge>
                <span className={`text-sm ${statusColor.color}`}>
                  {formatPercentage(cvcData.cvcPercentage)}
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Profitability</span>
                <span>{formatPercentage(cvcData.cvcPercentage)}</span>
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, cvcData.cvcPercentage + 50))} 
                className="h-2"
              />
            </div>
          </div>
        </div>

        {/* Task Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {task.completed ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Clock className="h-4 w-4 text-yellow-600" />
            )}
            <span className="text-sm font-medium">
              Task Status: {task.completed ? "Completed" : "In Progress"}
            </span>
          </div>
          
          {cvcData.isNegative && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs text-red-700">Negative CVC</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 