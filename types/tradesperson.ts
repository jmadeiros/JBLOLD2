export interface Tradesperson {
  id: string;
  name: string;
  trade: "Electrical" | "Plumbing" | "Framing" | "Concrete" | "Drywall" | "HVAC";
  avatarUrl?: string;
  supervisorId: string;
  projectId: string;
}

export interface WeeklyAssessment {
  id: string;
  tradespersonId: string;
  assessedBy: string; // Supervisor's ID
  weekEndingDate: string; // e.g., the Friday of the assessment week
  scores: {
    punctuality: number;            // 1-10
    taskCompletion: number;         // 1-10
    workQuality: number;            // 1-10
    safety: number;                 // 1-10
    communication: number;          // 1-10
    problemSolving: number;         // 1-10
    workplaceOrganisation: number;  // 1-10
    toolUsage: number;              // 1-10
    teamwork: number;               // 1-10
    workErrors: number;             // 1-10
  };
  overallScore: number; // An average or weighted score
  notes?: string;
  createdAt: string;
}

export interface TimesheetEntry {
  id: string;
  tradespersonId: string;
  projectId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // "08:00"
  endTime: string;   // "17:00"
  breakMinutes: number; // e.g., 60
  hoursWorked: number; // Calculated from the above
  overtimeHours?: number;
  notes?: string;
  approvedBy?: string; // Supervisor's ID
  status: "draft" | "submitted" | "approved" | "rejected";
}

export interface WeeklyTimesheet {
  tradespersonId: string;
  weekEndingDate: string;
  entries: TimesheetEntry[];
  totalHours: number;
  totalOvertimeHours: number;
  status: "incomplete" | "submitted" | "approved";
}

export interface DailyTask {
  id: string;
  tradespersonId: string;
  projectId: string;
  taskName: string;
  isCompleted: boolean;
  date: string; // ISO date string (YYYY-MM-DD)
  assignedBy: string; // Supervisor's ID
  notes?: string;
  createdAt: string;
}

export interface TradesPersonPerformance {
  tradesperson: Tradesperson;
  latestAssessment?: WeeklyAssessment;
  averageScore: number;
  weeklyHours: number;
  completionRate: number;
  rank: number;
} 