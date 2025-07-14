export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: "high" | "medium" | "low"
  startDate?: Date // Add startDate
  dueDate?: Date
  // Recurring Task Fields
  isRecurring?: boolean
  recurringType?: "daily" | "weekly" | "monthly"
  recurringPattern?: {
    frequency: number // Every X days/weeks/months
    weekdays?: number[] // For weekly: [1,3,5] = Mon,Wed,Fri (0=Sun, 1=Mon, etc.)
    monthlyType?: "day" | "week" // Monthly by day (15th) or week (2nd Tuesday)
    monthlyDay?: number // Day of month (1-31)
    monthlyWeek?: number // Week of month (1-4)
    monthlyWeekday?: number // Weekday (0-6, 0=Sunday)
  }
  recurringEndDate?: Date
  recurringEndCount?: number // End after X occurrences
  recurringParentId?: string // For instances, reference to parent recurring task
  recurringInstanceDate?: Date // For instances, the specific date this instance is for
  recurringSkipped?: boolean // For instances, if this occurrence was skipped
  status: "todo" | "in-progress" | "review" | "done"
  assignee?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
  projectId?: string
  projectName?: string
  category?: "Structural" | "Electrical" | "Plumbing" | "HVAC" | "Safety" | "Procurement" | "Finishes" | "Site Work" // Add category
  
  // CVC (Cost vs Contribution) Fields
  cvc?: {
    estimatedContributionValue: number // £4,000 - what the task is worth to the business
    costs: {
      labourCost: number // Hours × Rate, fetched from QuickBooks Time
      materialsCost: number // plasterboard, pipe - can be pre-set per task type or manually entered
      equipmentCost: number // scaffolding hire - shared or specific to task
      travelAccommodation: number // van mileage, hotels, etc.
      subcontractorFees: number // manual entry
      bonusesAdjustments: number // weekend bonus, lateness penalty
    }
    totalCost: number // Auto-calculated: sum of all cost items above
    cvcScore: number // Auto-calculated: Contribution Value - Total Cost
    cvcPercentage: number // Auto-calculated: (CVC Score / Contribution Value) * 100
    isNegative: boolean // Auto-calculated: if CVC is negative, flag in red with warning icon
    
    // QuickBooks Time Integration
    hoursLogged?: number // Hours logged from QuickBooks
    hourlyRate?: number // £22 per hour
    timeEntries?: {
      date: Date
      hours: number
      description?: string
    }[]
  }
  
  // Audit and History
  changeHistory?: {
    id: string
    changedBy: string
    changedAt: Date
    field: string
    oldValue: any
    newValue: any
    notes?: string
  }[]
  
  supervisorApproval?: {
    approvedBy: string
    approvedAt: Date
    notes?: string
  }

  // Supervisor Assessment
  supervisorAssessment?: {
    assessedBy: string
    assessedAt: Date
    assessedWorker: string // The team member being assessed
    questions: {
      onTimeAndReady: boolean | null // Were they on time and ready to work?
      completedTasks: boolean | null // Did they complete all assigned tasks?
      majorSnags: boolean | null // Were there any major snags or errors in their work?
      safetyProtocols: boolean | null // Did they follow all safety protocols?
      communication: boolean | null // Did they communicate effectively with the team or supervisor?
      initiative: boolean | null // Did they show initiative in solving problems?
      workAreaClean: boolean | null // Was their work area kept clean and organised?
      toolsProper: boolean | null // Did they use tools and equipment properly?
      collaboration: boolean | null // Did they collaborate well with other team members?
      qualityStandards: boolean | null // Did their work meet project specifications and quality standards?
    }
    overallRating: "excellent" | "good" | "satisfactory" | "needs-improvement" | null
    additionalNotes?: string
  }
  
  // Mobile Checklist
  checklist?: {
    id: string
    step: string
    completed: boolean
    completedBy?: string
    completedAt?: Date
    notes?: string
    photoEvidence?: string[]
  }[]
}

// Weekly Goal/Target interface
export interface WeeklyGoal {
  id: string
  workerId: string
  workerName: string
  weekStartDate: Date
  weekEndDate: Date
  description: string // "Complete flat 5 drylining"
  estimatedValue: number // £4,000
  assignedTasks: string[] // Task IDs
  status: "planned" | "in-progress" | "completed" | "missed"
  actualValue?: number
  actualCost?: number
  netContribution?: number
  hoursLogged?: number
  createdAt: Date
  updatedAt: Date
}

// Worker CVC Summary interface
export interface WorkerCVCSummary {
  workerId: string
  workerName: string
  weekStartDate: Date
  weekEndDate: Date
  totalHoursLogged: number
  totalTasksAssigned: number
  totalTasksCompleted: number
  totalCost: number
  totalContribution: number
  netCVC: number
  cvcPercentage: number
  status: "high-value" | "on-target" | "low-value" | "negative"
  tasks: Task[]
}

export interface KanbanColumn {
  id: string
  title: string
  status: Task["status"]
  color: string
}
