"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tradesperson, TimesheetEntry, WeeklyTimesheet } from "../../types/tradesperson";
import { Clock, Plus, Edit2, Check, X, Calendar } from "lucide-react";

interface TimesheetManagerProps {
  tradespeople: Tradesperson[];
  timesheetEntries: TimesheetEntry[];
  currentWeekEndingDate: string;
  onSaveEntry: (entry: Partial<TimesheetEntry>) => void;
  onApproveTimesheet: (tradespersonId: string, weekEndingDate: string) => void;
}

export function TimesheetManager({ 
  tradespeople, 
  timesheetEntries, 
  currentWeekEndingDate,
  onSaveEntry,
  onApproveTimesheet 
}: TimesheetManagerProps) {
  const [selectedEntry, setSelectedEntry] = useState<TimesheetEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "", 
    breakMinutes: 60,
    notes: ""
  });

  // Get current week dates (Monday to Friday)
  const getCurrentWeekDates = () => {
    const endDate = new Date(currentWeekEndingDate);
    const dates = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getCurrentWeekDates();

  // Get timesheet entry for a specific person and date
  const getEntry = (tradespersonId: string, date: string): TimesheetEntry | undefined => {
    return timesheetEntries.find(entry => 
      entry.tradespersonId === tradespersonId && entry.date === date
    );
  };

  // Calculate hours worked
  const calculateHours = (startTime: string, endTime: string, breakMinutes: number): number => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60) - breakMinutes;
    
    return Math.max(0, totalMinutes / 60);
  };

  // Get weekly totals for a tradesperson
  const getWeeklyTotals = (tradespersonId: string) => {
    const weekEntries = timesheetEntries.filter(entry => 
      entry.tradespersonId === tradespersonId && 
      weekDates.includes(entry.date)
    );
    
    const totalHours = weekEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0);
    const overtimeHours = Math.max(0, totalHours - 40);
    
    return { totalHours, overtimeHours, entryCount: weekEntries.length };
  };

  const handleCellClick = (tradesperson: Tradesperson, date: string) => {
    const existingEntry = getEntry(tradesperson.id, date);
    
    if (existingEntry) {
      setSelectedEntry(existingEntry);
      setFormData({
        startTime: existingEntry.startTime,
        endTime: existingEntry.endTime,
        breakMinutes: existingEntry.breakMinutes,
        notes: existingEntry.notes || ""
      });
    } else {
      setSelectedEntry({
        id: "",
        tradespersonId: tradesperson.id,
        projectId: tradesperson.projectId,
        date,
        startTime: "08:00",
        endTime: "17:00",
        breakMinutes: 60,
        hoursWorked: 8,
        status: "draft"
      });
      setFormData({
        startTime: "08:00",
        endTime: "17:00",
        breakMinutes: 60,
        notes: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveEntry = () => {
    if (!selectedEntry) return;
    
    const hoursWorked = calculateHours(formData.startTime, formData.endTime, formData.breakMinutes);
    const overtimeHours = Math.max(0, hoursWorked - 8);
    
    onSaveEntry({
      ...selectedEntry,
      startTime: formData.startTime,
      endTime: formData.endTime,
      breakMinutes: formData.breakMinutes,
      hoursWorked,
      overtimeHours,
      notes: formData.notes,
      status: "submitted"
    });
    
    setIsDialogOpen(false);
    setSelectedEntry(null);
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "approved": return "✓ Approved";
      case "submitted": return "→ Submitted";
      case "rejected": return "✗ Rejected";
      default: return "○ Draft";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Timesheet - Week Ending {new Date(currentWeekEndingDate).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b font-medium">Team Member</th>
                  {weekDates.map(date => (
                    <th key={date} className="text-center p-3 border-b font-medium min-w-[120px]">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </th>
                  ))}
                  <th className="text-center p-3 border-b font-medium">Weekly Total</th>
                  <th className="text-center p-3 border-b font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tradespeople.map(person => {
                  const { totalHours, overtimeHours, entryCount } = getWeeklyTotals(person.id);
                  const isComplete = entryCount === 5;
                  
                  return (
                    <tr key={person.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">
                        <div>
                          <div className="font-medium">{person.name}</div>
                          <div className="text-sm text-muted-foreground">{person.trade}</div>
                        </div>
                      </td>
                      {weekDates.map(date => {
                        const entry = getEntry(person.id, date);
                        return (
                          <td key={date} className="p-3 border-b text-center">
                                                         <Button
                               variant={entry ? "outline" : "ghost"}
                               size="sm"
                               className="w-full h-10 flex flex-col items-center justify-center border-gray-200"
                               onClick={() => handleCellClick(person, date)}
                             >
                               {entry ? (
                                 <>
                                   <div className="text-sm font-medium">{entry.hoursWorked.toFixed(1)}h</div>
                                   <div className="text-xs text-muted-foreground">
                                     {getStatusDisplay(entry.status)}
                                   </div>
                                 </>
                               ) : (
                                 <Plus className="h-3 w-3" />
                               )}
                             </Button>
                          </td>
                        );
                      })}
                      <td className="p-3 border-b text-center">
                                                 <div className="font-medium">{totalHours.toFixed(1)}h</div>
                         {overtimeHours > 0 && (
                           <div className="text-xs text-muted-foreground">+{overtimeHours.toFixed(1)}h OT</div>
                         )}
                      </td>
                      <td className="p-3 border-b text-center">
                                               <Button 
                         variant={isComplete ? "default" : "ghost"}
                         size="sm"
                         disabled={!isComplete}
                         onClick={() => onApproveTimesheet(person.id, currentWeekEndingDate)}
                         className="flex items-center gap-1 text-xs px-2 py-1 h-7"
                       >
                         {isComplete ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                         {isComplete ? "Approve" : "Incomplete"}
                       </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEntry?.id ? "Edit" : "Add"} Timesheet Entry
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <div className="text-sm text-muted-foreground">
                  {new Date(selectedEntry.date).toLocaleDateString()}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="breakMinutes">Break (minutes)</Label>
                <Input
                  id="breakMinutes"
                  type="number"
                  value={formData.breakMinutes}
                  onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <Label>Hours Worked</Label>
                <div className="text-2xl font-bold">
                  {calculateHours(formData.startTime, formData.endTime, formData.breakMinutes).toFixed(1)} hours
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this work day..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEntry}>
                  Save Entry
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 