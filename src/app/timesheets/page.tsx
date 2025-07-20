"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { TimesheetManager } from "@/components/timesheet-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tradesperson, TimesheetEntry } from "../../../types/tradesperson";
import { Clock } from "lucide-react";

export default function TimesheetsPage() {
  // Mock data - in a real app, this would come from your database/API
  const [tradespeople] = useState<Tradesperson[]>([
    {
      id: "1",
      name: "Mike Johnson",
      trade: "Electrical",
      supervisorId: "supervisor-1",
      projectId: "project-1"
    },
    {
      id: "2", 
      name: "Sarah Williams",
      trade: "Plumbing",
      supervisorId: "supervisor-1",
      projectId: "project-1"
    },
    {
      id: "3",
      name: "David Rodriguez",
      trade: "Framing",
      supervisorId: "supervisor-1", 
      projectId: "project-1"
    },
    {
      id: "4",
      name: "Emily Chen",
      trade: "Drywall",
      supervisorId: "supervisor-1",
      projectId: "project-1"
    },
    {
      id: "5",
      name: "James Wilson",
      trade: "HVAC",
      supervisorId: "supervisor-1",
      projectId: "project-1"
    }
  ]);

  const [timesheetEntries, setTimesheetEntries] = useState<TimesheetEntry[]>([
    {
      id: "entry-1",
      tradespersonId: "1",
      projectId: "project-1",
      date: "2024-01-08",
      startTime: "08:00",
      endTime: "17:00",
      breakMinutes: 60,
      hoursWorked: 8,
      status: "approved"
    },
    {
      id: "entry-2",
      tradespersonId: "1", 
      projectId: "project-1",
      date: "2024-01-09",
      startTime: "08:00",
      endTime: "17:00", 
      breakMinutes: 60,
      hoursWorked: 8,
      status: "approved"
    }
  ]);

  // Get current week ending date (Friday)
  const getCurrentWeekEndingDate = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7; // Days until next Friday
    const friday = new Date(now);
    friday.setDate(now.getDate() + daysUntilFriday);
    return friday.toISOString().split('T')[0];
  };

  const currentWeekEndingDate = getCurrentWeekEndingDate();

  const handleSaveTimesheetEntry = (entry: Partial<TimesheetEntry>) => {
    if (entry.id && entry.id !== "") {
      // Update existing entry
      setTimesheetEntries(prev => prev.map(e => 
        e.id === entry.id ? { ...e, ...entry } as TimesheetEntry : e
      ));
    } else {
      // Add new entry
      const newEntry = {
        ...entry,
        id: `entry-${Date.now()}`
      } as TimesheetEntry;
      setTimesheetEntries(prev => [...prev, newEntry]);
    }
  };

  const handleApproveTimesheet = (tradespersonId: string, weekEndingDate: string) => {
    // In a real app, this would make an API call to approve the timesheet
    console.log(`Approving timesheet for ${tradespersonId} for week ending ${weekEndingDate}`);
    
    // Update all entries for this person/week to approved
    setTimesheetEntries(prev => prev.map(entry => {
      if (entry.tradespersonId === tradespersonId) {
        // Check if this entry is in the current week
        const entryDate = new Date(entry.date);
        const weekEnd = new Date(weekEndingDate);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 4); // Monday to Friday
        
        if (entryDate >= weekStart && entryDate <= weekEnd) {
          return { ...entry, status: "approved" as const };
        }
      }
      return entry;
    }));
  };

  return (
    <div className="space-y-6">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div>
            <h1 className="font-semibold">Timesheets</h1>
            <p className="text-sm text-muted-foreground">Track and approve weekly work hours</p>
          </div>
        </div>
      </header>

      {/* Timesheet Management Section */}
      <TimesheetManager 
        tradespeople={tradespeople}
        timesheetEntries={timesheetEntries}
        currentWeekEndingDate={currentWeekEndingDate}
        onSaveEntry={handleSaveTimesheetEntry}
        onApproveTimesheet={handleApproveTimesheet}
      />
    </div>
  );
} 