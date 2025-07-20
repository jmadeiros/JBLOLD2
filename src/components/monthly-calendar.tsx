"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Clock,
  Star,
  FileText,
  Users,
  Building
} from "lucide-react"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  isSameMonth,
  startOfWeek,
  endOfWeek
} from "date-fns"
import type { ProgrammeAdminItem } from "../../types/task"

interface MonthlyCalendarProps {
  onItemClick?: (item: ProgrammeAdminItem) => void
}

export function MonthlyCalendar({ onItemClick }: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [adminItems, setAdminItems] = useState<ProgrammeAdminItem[]>([])

  // Load programme admin items from localStorage
  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem('importedAdminItems') || '[]')
      if (items.length > 0) {
        // Convert date strings back to Date objects
        const itemsWithDates = items.map((item: any) => ({
          ...item,
          date: new Date(item.date)
        }))
        setAdminItems(itemsWithDates)
      }
    } catch (error) {
      console.error('Failed to load admin items:', error)
    }
  }, [])

  // Navigate months
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1))
  }

  // Get calendar days (including padding days from previous/next month)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd
    })
  }, [currentDate])

  // Filter and categorize admin items by type
  const categorizedItems = useMemo(() => {
    const milestones = adminItems.filter(item => item.type === 'milestone')
    const approvals = adminItems.filter(item => item.type === 'client_approval')
    const surveys = adminItems.filter(item => item.type === 'survey')
    const design = adminItems.filter(item => item.type === 'design')
    const procurement = adminItems.filter(item => item.type === 'procurement')
    const handovers = adminItems.filter(item => item.type === 'handover')
    const meetings = adminItems.filter(item => item.type === 'meeting')
    
    return { 
      milestones,
      approvals,
      surveys,
      design,
      procurement,
      handovers,
      meetings,
      totalItems: adminItems.length
    }
  }, [adminItems])

  // Get admin items for a specific day
  const getItemsForDay = (day: Date) => {
    return adminItems.filter(item => {
      if (!item.date) return false
      return isSameDay(item.date, day)
    })
  }

  // Get item type styling
  const getItemStyling = (type: string) => {
    switch (type) {
      case "milestone":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "client_approval":
        return "bg-green-100 text-green-800 border-green-200"
      case "survey":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "design":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "procurement":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "handover":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "meeting":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Get item icon
  const getItemIcon = (type: string) => {
    switch (type) {
      case "milestone":
        return <Flag className="h-3 w-3" />
      case "client_approval":
        return <CheckCircle className="h-3 w-3" />
      case "survey":
        return <Building className="h-3 w-3" />
      case "design":
        return <FileText className="h-3 w-3" />
      case "procurement":
        return <Star className="h-3 w-3" />
      case "handover":
        return <Calendar className="h-3 w-3" />
      case "meeting":
        return <Users className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  // Get readable type name
  const getTypeName = (type: string) => {
    switch (type) {
      case "client_approval":
        return "Client Approval"
      case "survey":
        return "Survey"
      case "design":
        return "Design"
      case "procurement":
        return "Procurement"
      case "handover":
        return "Handover"
      case "milestone":
        return "Milestone"
      case "meeting":
        return "Meeting"
      default:
        return "Admin"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Programme Admin Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[150px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs pt-3">
          <div className="flex items-center gap-1.5">
            <Flag className="h-3 w-3 text-purple-600" />
            <span>Milestones</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span>Approvals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building className="h-3 w-3 text-blue-600" />
            <span>Surveys</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-3 w-3 text-orange-600" />
            <span>Design</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="h-3 w-3 text-yellow-600" />
            <span>Procurement</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {adminItems.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Programme Admin Items</h3>
            <p className="text-sm text-muted-foreground">
              Upload a construction programme to see admin items, milestones, and key dates.
            </p>
          </div>
        ) : (
          <>
            {/* Calendar Grid */}
            <div className="space-y-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, dayIdx) => {
                  const dayItems = getItemsForDay(day)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isTodayDate = isToday(day)
                  
                  return (
                    <div
                      key={dayIdx}
                      className={`
                        min-h-[100px] p-1 border border-border rounded-lg
                        ${isCurrentMonth ? "bg-background" : "bg-muted/20"}
                        ${isTodayDate ? "ring-2 ring-blue-500 bg-blue-50/50" : ""}
                      `}
                    >
                      {/* Day Number */}
                      <div className={`
                        text-xs font-medium mb-1 text-center
                        ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"}
                        ${isTodayDate ? "text-blue-600 font-bold" : ""}
                      `}>
                        {format(day, "d")}
                      </div>
                      
                      {/* Admin items for this day */}
                      <div className="space-y-1">
                        {dayItems.slice(0, 3).map((item, itemIdx) => {
                          const styling = getItemStyling(item.type)
                          
                          return (
                            <div
                              key={itemIdx}
                              onClick={() => onItemClick?.(item)}
                              className={`
                                text-xs p-1 rounded border cursor-pointer hover:opacity-80 transition-opacity
                                ${styling}
                              `}
                              title={`${item.title} - ${getTypeName(item.type)}`}
                            >
                              <div className="flex items-center gap-1 truncate">
                                {getItemIcon(item.type)}
                                <span className="truncate">{item.title}</span>
                              </div>
                            </div>
                          )
                        })}
                        
                        {/* Show count if more items */}
                        {dayItems.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center py-1">
                            +{dayItems.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Summary Statistics */}
            <div className="mt-6 grid grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {categorizedItems.milestones.length}
                </div>
                <div className="text-xs text-muted-foreground">Milestones</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {categorizedItems.approvals.length}
                </div>
                <div className="text-xs text-muted-foreground">Approvals</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {categorizedItems.surveys.length + categorizedItems.design.length}
                </div>
                <div className="text-xs text-muted-foreground">Surveys & Design</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {categorizedItems.totalItems}
                </div>
                <div className="text-xs text-muted-foreground">Total Items</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}