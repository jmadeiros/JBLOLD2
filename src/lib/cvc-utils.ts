import type { Task, WorkerCVCSummary, WeeklyGoal } from "../../types/task"

/**
 * Calculate CVC metrics for a task
 */
export function calculateCVCMetrics(task: Task): Task["cvc"] {
  if (!task.cvc) return undefined

  const { estimatedContributionValue, costs } = task.cvc
  
  // Calculate total cost
  const totalCost = 
    costs.labourCost +
    costs.materialsCost +
    costs.equipmentCost +
    costs.travelAccommodation +
    costs.subcontractorFees +
    costs.bonusesAdjustments

  // Calculate CVC Score
  const cvcScore = estimatedContributionValue - totalCost
  
  // Calculate CVC Percentage
  const cvcPercentage = estimatedContributionValue > 0 
    ? (cvcScore / estimatedContributionValue) * 100 
    : 0

  // Determine if negative
  const isNegative = cvcScore < 0

  return {
    ...task.cvc,
    totalCost,
    cvcScore,
    cvcPercentage,
    isNegative
  }
}

/**
 * Calculate labour cost based on hours and rate
 */
export function calculateLabourCost(hoursLogged: number, hourlyRate: number): number {
  return hoursLogged * hourlyRate
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format percentage values
 */
export function formatPercentage(percentage: number): string {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`
}

/**
 * Get CVC status color and variant
 */
export function getCVCStatusColor(cvcScore: number): {
  color: string
  bgColor: string
  variant: "default" | "destructive" | "outline" | "secondary"
} {
  if (cvcScore >= 1000) {
    return {
      color: "text-green-700",
      bgColor: "bg-green-50 border-green-200",
      variant: "default"
    }
  } else if (cvcScore >= 0) {
    return {
      color: "text-yellow-700",
      bgColor: "bg-yellow-50 border-yellow-200",
      variant: "outline"
    }
  } else {
    return {
      color: "text-red-700",
      bgColor: "bg-red-50 border-red-200",
      variant: "destructive"
    }
  }
}

/**
 * Get worker performance status
 */
export function getWorkerPerformanceStatus(netCVC: number, cvcPercentage: number): WorkerCVCSummary["status"] {
  if (netCVC < 0) return "negative"
  if (cvcPercentage >= 30) return "high-value"
  if (cvcPercentage >= 10) return "on-target"
  return "low-value"
}

/**
 * Calculate weekly CVC summary for a worker
 */
export function calculateWeeklyCVCSummary(
  workerId: string,
  workerName: string,
  tasks: Task[],
  weekStartDate: Date,
  weekEndDate: Date
): WorkerCVCSummary {
  const weekTasks = tasks.filter(task => {
    if (!task.dueDate) return false
    const taskDate = new Date(task.dueDate)
    return taskDate >= weekStartDate && taskDate <= weekEndDate && task.assignee === workerName
  })

  const totalHoursLogged = weekTasks.reduce((sum, task) => {
    return sum + (task.cvc?.hoursLogged || 0)
  }, 0)

  const totalTasksAssigned = weekTasks.length
  const totalTasksCompleted = weekTasks.filter(task => task.completed).length

  const totalCost = weekTasks.reduce((sum, task) => {
    return sum + (task.cvc?.totalCost || 0)
  }, 0)

  const totalContribution = weekTasks.reduce((sum, task) => {
    return sum + (task.cvc?.estimatedContributionValue || 0)
  }, 0)

  const netCVC = totalContribution - totalCost
  const cvcPercentage = totalContribution > 0 ? (netCVC / totalContribution) * 100 : 0

  const status = getWorkerPerformanceStatus(netCVC, cvcPercentage)

  return {
    workerId,
    workerName,
    weekStartDate,
    weekEndDate,
    totalHoursLogged,
    totalTasksAssigned,
    totalTasksCompleted,
    totalCost,
    totalContribution,
    netCVC,
    cvcPercentage,
    status,
    tasks: weekTasks
  }
}

/**
 * Get time status for a task (over/under/on target)
 */
export function getTimeStatus(task: Task): {
  status: "over" | "under" | "on-target" | "no-data"
  message: string
  color: string
} {
  if (!task.cvc?.hoursLogged) {
    return {
      status: "no-data",
      message: "No hours logged",
      color: "text-gray-500"
    }
  }

  // Estimate expected hours based on contribution value (rough estimate)
  const estimatedHours = (task.cvc.estimatedContributionValue || 0) / (task.cvc.hourlyRate || 25)
  const loggedHours = task.cvc.hoursLogged
  const variance = loggedHours - estimatedHours
  const variancePercent = estimatedHours > 0 ? (variance / estimatedHours) * 100 : 0

  if (variancePercent > 20) {
    return {
      status: "over",
      message: `Over by ${variance.toFixed(1)}h`,
      color: "text-red-600"
    }
  } else if (variancePercent < -20) {
    return {
      status: "under",
      message: `Under by ${Math.abs(variance).toFixed(1)}h`,
      color: "text-orange-600"
    }
  } else {
    return {
      status: "on-target",
      message: "On target",
      color: "text-green-600"
    }
  }
}

/**
 * Check if task has time logged but is not completed
 */
export function hasTimeLoggedButIncomplete(task: Task): boolean {
  return !task.completed && (task.cvc?.hoursLogged || 0) > 0
}

/**
 * Calculate completion efficiency (tasks completed vs time spent)
 */
export function calculateCompletionEfficiency(summary: WorkerCVCSummary): {
  efficiency: number
  rating: "excellent" | "good" | "average" | "poor"
} {
  const efficiency = summary.totalHoursLogged > 0 
    ? (summary.totalTasksCompleted / summary.totalHoursLogged) * 8 // normalize to 8-hour day
    : 0

  let rating: "excellent" | "good" | "average" | "poor" = "poor"
  if (efficiency >= 0.8) rating = "excellent"
  else if (efficiency >= 0.6) rating = "good"
  else if (efficiency >= 0.4) rating = "average"

  return { efficiency, rating }
}

/**
 * Get start and end dates for current week
 */
export function getCurrentWeekDates(): { start: Date; end: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - dayOfWeek + 1) // Monday
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6) // Sunday
  end.setHours(23, 59, 59, 999)

  return { start, end }
} 