"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Calendar, Plus, Check, X, DollarSign } from "lucide-react"
import type { Tradesperson, TimesheetEntry, WeeklyTimesheet } from "../../../types/tradesperson"

interface TimesheetManagerProps {
  tradespeople: Tradesperson[]
  timesheets: TimesheetEntry[]
  onAddEntry: (entry: Omit<TimesheetEntry, "id">) => void
  onUpdateEntry: (entryId: string, updates: Partial<TimesheetEntry>) => void
  onApproveEntry: (entryId: string) => void
}

interface TimesheetFormData {
  startTime: string
  endTime: string
  breakMinutes: number
  taskDescription: string
}

export function TimesheetManager({ 
  tradespeople, 
  timesheets, 
  onAddEntry, 
  onUpdateEntry, 
  onApproveEntry 
}: TimesheetManagerProps) {
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1) // Monday
    return startOfWeek
  })
  const [editingEntry, setEditingEntry] = useState<{
    tradespersonId: string
    date: string
    entry?: TimesheetEntry
  } | null>(null)
  const [formData, setFormData] = useState<TimesheetFormData>({
    startTime: "08:00",
    endTime: "17:00",
    breakMinutes: 60,
    taskDescription: ""
  })

  const getWeekDays = (startDate: Date) => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    return days
  }

  const weekDays = getWeekDays(selectedWeek)

  const getTimesheetEntry = (tradespersonId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return timesheets.find(t => t.tradespersonId === tradespersonId && t.date === dateStr)
  }

  const calculateHours = (startTime: string, endTime: string, breakMinutes: number) => {
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60) - breakMinutes
    return Math.max(0, totalMinutes / 60)
  }

  const handleOpenEntry = (tradespersonId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const entry = getTimesheetEntry(tradespersonId, date)
    
    if (entry) {
      setFormData({
        startTime: entry.startTime,
        endTime: entry.endTime,
        breakMinutes: entry.breakMinutes,
        taskDescription: entry.taskDescription || ""
      })
    } else {
      setFormData({
        startTime: "08:00",
        endTime: "17:00",
        breakMinutes: 60,
        taskDescription: ""
      })
    }
    
    setEditingEntry({ tradespersonId, date: dateStr, entry })
  }

  const handleSaveEntry = () => {
    if (!editingEntry) return

    const hoursWorked = calculateHours(formData.startTime, formData.endTime, formData.breakMinutes)
    const overtimeHours = Math.max(0, hoursWorked - 8)

    if (editingEntry.entry) {
      // Update existing entry
      onUpdateEntry(editingEntry.entry.id, {
        startTime: formData.startTime,
        endTime: formData.endTime,
        breakMinutes: formData.breakMinutes,
        hoursWorked,
        overtimeHours,
        taskDescription: formData.taskDescription
      })
    } else {
      // Create new entry
      onAddEntry({
        tradespersonId: editingEntry.tradespersonId,
        projectId: "current-project", // In real app, get from context
        date: editingEntry.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        breakMinutes: formData.breakMinutes,
        hoursWorked,
        overtimeHours,
        taskDescription: formData.taskDescription,
        approved: false
      })
    }

    setEditingEntry(null)
  }

  const formatHours = (hours: number) => {
    return hours.toFixed(1) + "h"
  }

  const getWeeklyTotal = (tradespersonId: string) => {
    const weekStart = selectedWeek.toISOString().split('T')[0]
    const weekEnd = new Date(selectedWeek)
    weekEnd.setDate(selectedWeek.getDate() + 6)
    const weekEndStr = weekEnd.toISOString().split('T')[0]

    const weekEntries = timesheets.filter(t => 
      t.tradespersonId === tradespersonId && 
      t.date >= weekStart && 
      t.date <= weekEndStr
    )

    const totalHours = weekEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0)
    const overtimeHours = weekEntries.reduce((sum, entry) => sum + entry.overtimeHours, 0)

    return { totalHours, overtimeHours, regularHours: totalHours - overtimeHours }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(selectedWeek)
    newWeek.setDate(selectedWeek.getDate() + (direction === 'next' ? 7 : -7))
    setSelectedWeek(newWeek)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Timesheets
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
              ← Previous
            </Button>
            <div className="text-sm font-medium px-3">
              {selectedWeek.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })} - {weekDays[6].toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
              Next →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium text-sm min-w-[150px]">Team Member</th>
                {weekDays.map((day, index) => (
                  <th key={index} className="text-center p-2 font-medium text-sm min-w-[100px]">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span>{day.getDate()}</span>
                    </div>
                  </th>
                ))}
                <th className="text-center p-2 font-medium text-sm min-w-[80px]">Weekly Total</th>
              </tr>
            </thead>
            <tbody>
              {tradespeople.map((person) => {
                const weeklyTotal = getWeeklyTotal(person.id)
                
                return (
                  <tr key={person.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={person.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {person.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{person.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {person.trade}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((day, dayIndex) => {
                      const entry = getTimesheetEntry(person.id, day)
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6
                      
                      return (
                        <td key={dayIndex} className={`p-1 text-center ${isWeekend ? 'bg-gray-50' : ''}`}>
                          <Button
                            variant={entry ? "outline" : "ghost"}
                            size="sm"
                            className={`w-full h-12 text-xs ${
                              entry ? (entry.approved ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200') : ''
                            }`}
                            onClick={() => handleOpenEntry(person.id, day)}
                          >
                            {entry ? (
                              <div className="flex flex-col">
                                <span className="font-medium">{formatHours(entry.hoursWorked)}</span>
                                <div className="flex items-center gap-1">
                                  {entry.approved ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Clock className="h-3 w-3 text-yellow-600" />
                                  )}
                                  {entry.overtimeHours > 0 && (
                                    <span className="text-xs text-orange-600">OT</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <Plus className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </td>
                      )
                    })}
                    <td className="p-2 text-center">
                      <div className="text-sm">
                        <div className="font-medium">{formatHours(weeklyTotal.totalHours)}</div>
                        {weeklyTotal.overtimeHours > 0 && (
                          <div className="text-xs text-orange-600">
                            +{formatHours(weeklyTotal.overtimeHours)} OT
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Entry Editor Dialog */}
        <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {editingEntry?.entry ? 'Edit' : 'Add'} Timesheet Entry
              </DialogTitle>
            </DialogHeader>
            
            {editingEntry && (
              <div className="space-y-4">
                {/* Person & Date Info */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {tradespeople.find(p => p.id === editingEntry.tradespersonId)?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(editingEntry.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatHours(calculateHours(formData.startTime, formData.endTime, formData.breakMinutes))}
                      </div>
                      <div className="text-xs text-gray-500">Total Hours</div>
                    </div>
                  </div>
                </div>

                {/* Time Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Break Minutes */}
                <div>
                  <Label htmlFor="breakMinutes">Break Time (minutes)</Label>
                  <Input
                    id="breakMinutes"
                    type="number"
                    min="0"
                    step="15"
                    value={formData.breakMinutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, breakMinutes: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                {/* Task Description */}
                <div>
                  <Label htmlFor="taskDescription">Task Description</Label>
                  <Input
                    id="taskDescription"
                    placeholder="What did they work on today?"
                    value={formData.taskDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, taskDescription: e.target.value }))}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditingEntry(null)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEntry} className="flex-1">
                    {editingEntry.entry ? 'Update' : 'Add'} Entry
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
} 