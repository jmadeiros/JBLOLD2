"use client"

import { useState, useMemo } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Clock,
  Users,
  FolderKanban,
  CheckCircle,
  FileQuestion,
  CalendarIcon,
  GanttChartSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { format, isSameDay, startOfDay, startOfWeek, addDays } from "date-fns"
import type { Task } from "../../../types/task"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GanttTimeline } from "../../components/gantt-timeline"
import { formatCurrency } from "@/lib/cvc-utils"
import { RotateCcw } from "lucide-react"

// Comprehensive Project and Task Data - In a real app, this would be fetched from an API
const allTasks: Task[] = [
  // LONDON OFFICE TOWER PROJECT
  {
    id: "1",
    title: "Foundation Pouring - Sector A",
    description: "Pour concrete for the main foundation in Sector A. Weather permitting.",
    completed: false,
    priority: "high",
    status: "in-progress",
    startDate: new Date(2025, 0, 6),
    dueDate: new Date(2025, 0, 8),
    assignee: "Brad Johnson",
    createdAt: new Date(2024, 11, 20),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
    category: "Structural",
    tags: ["concrete", "foundation"],
  },
  {
    id: "2",
    title: "Morning Safety Briefing",
    description: "Daily safety briefing for all crew members",
    completed: true,
    priority: "high",
    status: "done",
    startDate: new Date(2025, 0, 6),
    dueDate: new Date(2025, 0, 6),
    assignee: "Marcus Davis",
    createdAt: new Date(2024, 11, 20),
    updatedAt: new Date(2025, 0, 6),
    projectId: "1",
    projectName: "London Office Tower",
    category: "Safety",
    tags: ["safety"],
  },
  {
    id: "3",
    title: "Equipment Inspection",
    description: "Weekly inspection of all construction equipment",
    completed: false,
    priority: "medium",
    status: "in-progress",
    startDate: new Date(2025, 0, 6),
    dueDate: new Date(2025, 0, 6),
    assignee: "Steve Wilson",
    createdAt: new Date(2024, 11, 20),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
    category: "Site Work",
    tags: ["equipment", "safety"],
  },
  {
    id: "4",
    title: "Structural Steel Installation - Floor 2",
    description: "Install steel framework for second floor",
    completed: false,
    priority: "high",
    status: "todo",
    startDate: new Date(2025, 0, 9),
    dueDate: new Date(2025, 0, 15),
    assignee: "Rico Fernandez",
    createdAt: new Date(2024, 11, 21),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
    category: "Structural",
    tags: ["steel", "structural"],
  },
  {
    id: "5",
    title: "Electrical Rough-in - Floor 1",
    description: "Install electrical rough-ins for first floor",
    completed: false,
    priority: "medium",
    status: "todo",
    startDate: new Date(2025, 0, 13),
    dueDate: new Date(2025, 0, 17),
    assignee: "Carlos Rodriguez",
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
    category: "Electrical",
    tags: ["electrical", "MEP"],
  },
  {
    id: "6",
    title: "Plumbing Rough-in - Basement",
    description: "Install plumbing rough-in for basement level",
    completed: true,
    priority: "high",
    status: "done",
    startDate: new Date(2025, 0, 6),
    dueDate: new Date(2025, 0, 7),
    assignee: "Mike Thompson",
    createdAt: new Date(2024, 11, 18),
    updatedAt: new Date(2025, 0, 7),
    projectId: "1",
    projectName: "London Office Tower",
    category: "Plumbing",
    tags: ["plumbing"],
  },
  {
    id: "7",
    title: "HVAC Installation - Zone A",
    description: "Install HVAC units and ductwork for Zone A",
    completed: false,
    priority: "high",
    status: "todo",
    startDate: new Date(2025, 0, 20),
    dueDate: new Date(2025, 0, 25),
    assignee: "Tony Ricci",
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
    category: "HVAC",
    tags: ["hvac", "MEP"],
  },
  {
    id: "8",
    title: "Concrete Pour - Floor 2",
    description: "Concrete pour for second floor slab",
    completed: false,
    priority: "high",
    status: "todo",
    startDate: new Date(2025, 0, 16),
    dueDate: new Date(2025, 0, 18),
    assignee: "Brad Johnson",
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
    category: "Structural",
    tags: ["concrete", "structural"],
  },
  {
    id: "9",
    title: "Fire Safety System Installation",
    description: "Install fire suppression and alarm systems",
    completed: false,
    priority: "high",
    status: "todo",
    startDate: new Date(2025, 0, 27),
    dueDate: new Date(2025, 1, 5),
    assignee: "Marcus Davis",
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "1",
    projectName: "London Office Tower",
    category: "Safety",
    tags: ["fire", "safety"],
  },

  // MANCHESTER RESIDENTIAL COMPLEX PROJECT
  {
    id: "10",
    title: "Site Preparation and Excavation",
    description: "Prepare building site and excavate for foundations",
    completed: true,
    priority: "high",
    status: "done",
    startDate: new Date(2024, 11, 15),
    dueDate: new Date(2024, 11, 22),
    assignee: "Steve Wilson",
    createdAt: new Date(2024, 11, 10),
    updatedAt: new Date(2024, 11, 22),
    projectId: "2",
    projectName: "Manchester Residential Complex",
    category: "Site Work",
    tags: ["excavation", "preparation"],
  },
  {
    id: "11",
    title: "Foundation Installation - Building A",
    description: "Install foundation systems for residential building A",
    completed: false,
    priority: "high",
    status: "in-progress",
    startDate: new Date(2024, 11, 25),
    dueDate: new Date(2025, 0, 5),
    assignee: "Brad Johnson",
    createdAt: new Date(2024, 11, 20),
    updatedAt: new Date(2024, 11, 27),
    projectId: "2",
    projectName: "Manchester Residential Complex",
    category: "Structural",
    tags: ["foundation", "concrete"],
  },
  {
    id: "12",
    title: "Framing - Building A Units 1-10",
    description: "Complete framing for first 10 residential units",
    completed: false,
    priority: "high",
    status: "todo",
    startDate: new Date(2025, 0, 8),
    dueDate: new Date(2025, 0, 20),
    assignee: "Jake Sullivan",
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "2",
    projectName: "Manchester Residential Complex",
    category: "Structural",
    tags: ["framing", "carpentry"],
  },
  {
    id: "13",
    title: "Electrical Rough-in - Building A",
    description: "Complete electrical rough-ins for all units in Building A",
    completed: false,
    priority: "medium",
    status: "todo",
    startDate: new Date(2025, 0, 15),
    dueDate: new Date(2025, 0, 28),
    assignee: "Carlos Rodriguez",
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 22),
    projectId: "2",
    projectName: "Manchester Residential Complex",
    category: "Electrical",
    tags: ["electrical", "MEP"],
  },
  {
    id: "14",
    title: "Plumbing Installation - Building A",
    description: "Install plumbing systems for all units",
    completed: false,
    priority: "medium",
    status: "todo",
    startDate: new Date(2025, 0, 22),
    dueDate: new Date(2025, 1, 8),
    assignee: "Mike Thompson",
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "2",
    projectName: "Manchester Residential Complex",
    category: "Plumbing",
    tags: ["plumbing", "MEP"],
  },
  {
    id: "15",
    title: "Drywall Installation - Building A",
    description: "Install drywall throughout Building A units",
    completed: false,
    priority: "medium",
    status: "todo",
    startDate: new Date(2025, 1, 3),
    dueDate: new Date(2025, 1, 15),
    assignee: "Danny Walsh",
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "2",
    projectName: "Manchester Residential Complex",
    category: "Finishes",
    tags: ["drywall", "finishing"],
  },
  {
    id: "16",
    title: "Flooring Installation - Building A",
    description: "Install flooring systems in all units",
    completed: false,
    priority: "medium",
    status: "todo",
    startDate: new Date(2025, 1, 10),
    dueDate: new Date(2025, 1, 25),
    assignee: "Jake Sullivan",
    createdAt: new Date(2024, 11, 22),
    updatedAt: new Date(2024, 11, 25),
    projectId: "2",
    projectName: "Manchester Residential Complex",
    category: "Finishes",
    tags: ["flooring", "finishing"],
  },

  // M25 MOTORWAY BRIDGE PROJECT
  {
    id: "17",
    title: "Traffic Management Setup",
    description: "Establish traffic control and safety barriers",
    completed: false,
    priority: "high",
    status: "todo",
    startDate: new Date(2025, 2, 1),
    dueDate: new Date(2025, 2, 5),
    assignee: "Marcus Davis",
    createdAt: new Date(2024, 11, 25),
    updatedAt: new Date(2024, 11, 25),
    projectId: "3",
    projectName: "M25 Motorway Bridge",
    category: "Safety",
    tags: ["traffic", "safety"],
  },
  {
    id: "18",
    title: "Bridge Inspection and Assessment",
    description: "Detailed structural assessment of existing bridge",
    completed: false,
    priority: "high",
    status: "todo",
    startDate: new Date(2025, 2, 8),
    dueDate: new Date(2025, 2, 15),
    assignee: "David Martinez",
    createdAt: new Date(2024, 11, 25),
    updatedAt: new Date(2024, 11, 25),
    projectId: "3",
    projectName: "M25 Motorway Bridge",
    category: "Structural",
    tags: ["inspection", "assessment"],
  },
  {
    id: "19",
    title: "Temporary Support Installation",
    description: "Install temporary support structures during renovation",
    completed: false,
    priority: "high",
    status: "todo",
    startDate: new Date(2025, 2, 18),
    dueDate: new Date(2025, 3, 5),
    assignee: "Rico Fernandez",
    createdAt: new Date(2024, 11, 25),
    updatedAt: new Date(2024, 11, 25),
    projectId: "3",
    projectName: "M25 Motorway Bridge",
    category: "Structural",
    tags: ["steel", "support"],
  },
  {
    id: "20",
    title: "Concrete Strengthening Works",
    description: "Reinforce existing concrete structure",
    completed: false,
    priority: "high",
    status: "todo",
    startDate: new Date(2025, 3, 8),
    dueDate: new Date(2025, 4, 15),
    assignee: "Brad Johnson",
    createdAt: new Date(2024, 11, 25),
    updatedAt: new Date(2024, 11, 25),
    projectId: "3",
    projectName: "M25 Motorway Bridge",
    category: "Structural",
    tags: ["concrete", "strengthening"],
  },

  // BIRMINGHAM GENERAL HOSPITAL WING (COMPLETED PROJECT)
  {
    id: "21",
    title: "Hospital Wing - Final Inspection",
    description: "Final inspection and handover documentation",
    completed: true,
    priority: "high",
    status: "done",
    startDate: new Date(2024, 10, 18),
    dueDate: new Date(2024, 10, 20),
    assignee: "David Martinez",
    createdAt: new Date(2024, 10, 15),
    updatedAt: new Date(2024, 10, 20),
    projectId: "4",
    projectName: "Birmingham General Hospital Wing",
    category: "Safety",
    tags: ["inspection", "completion"],
  },
  {
    id: "22",
    title: "Medical Equipment Installation",
    description: "Install specialized medical equipment in surgical suites",
    completed: true,
    priority: "high",
    status: "done",
    startDate: new Date(2024, 10, 1),
    dueDate: new Date(2024, 10, 15),
    assignee: "Carlos Rodriguez",
    createdAt: new Date(2024, 9, 25),
    updatedAt: new Date(2024, 10, 15),
    projectId: "4",
    projectName: "Birmingham General Hospital Wing",
    category: "Electrical",
    tags: ["medical", "equipment"],
  },

  // LIVERPOOL WAREHOUSE FACILITY (ON HOLD)
  {
    id: "23",
    title: "Site Survey and Planning",
    description: "Complete site survey and detailed planning phase",
    completed: true,
    priority: "medium",
    status: "done",
    startDate: new Date(2024, 11, 1),
    dueDate: new Date(2024, 11, 10),
    assignee: "David Martinez",
    createdAt: new Date(2024, 10, 25),
    updatedAt: new Date(2024, 11, 10),
    projectId: "5",
    projectName: "Liverpool Warehouse Facility",
    category: "Site Work",
    tags: ["survey", "planning"],
  },
  {
    id: "24",
    title: "Environmental Impact Assessment",
    description: "Complete environmental assessment - PROJECT ON HOLD",
    completed: false,
    priority: "low",
    status: "todo",
    startDate: new Date(2025, 3, 1),
    dueDate: new Date(2025, 3, 30),
    assignee: undefined,
    createdAt: new Date(2024, 11, 1),
    updatedAt: new Date(2024, 11, 15),
    projectId: "5",
    projectName: "Liverpool Warehouse Facility",
    category: "Site Work",
    tags: ["environmental", "assessment"],
  },

  // BRISTOL SHOPPING CENTRE (PRE-CONSTRUCTION)
  {
    id: "25",
    title: "Demolition Planning",
    description: "Plan selective demolition of existing structures",
    completed: false,
    priority: "medium",
    status: "todo",
    startDate: new Date(2025, 1, 15),
    dueDate: new Date(2025, 2, 1),
    assignee: "Steve Wilson",
    createdAt: new Date(2024, 11, 25),
    updatedAt: new Date(2024, 11, 25),
    projectId: "6",
    projectName: "Bristol Shopping Centre",
    category: "Site Work",
    tags: ["demolition", "planning"],
  },
  {
    id: "26",
    title: "Structural Engineering Review",
    description: "Review existing structure and plan reinforcements",
    completed: false,
    priority: "high",
    status: "todo",
    startDate: new Date(2025, 1, 1),
    dueDate: new Date(2025, 1, 20),
    assignee: "David Martinez",
    createdAt: new Date(2024, 11, 25),
    updatedAt: new Date(2024, 11, 25),
    projectId: "6",
    projectName: "Bristol Shopping Centre",
    category: "Structural",
    tags: ["engineering", "review"],
  },

  // RECURRING TASKS
  {
    id: "27",
    title: "Weekly Safety Inspection",
    description: "Weekly safety inspection across all active sites",
    completed: false,
    priority: "high",
    status: "todo",
    isRecurring: true,
    recurringType: "weekly",
    startDate: new Date(2025, 0, 6),
    dueDate: new Date(2025, 0, 6),
    assignee: "Marcus Davis",
    createdAt: new Date(2024, 11, 15),
    updatedAt: new Date(2024, 11, 29),
    projectId: "1",
    projectName: "London Office Tower",
    category: "Safety",
    tags: ["safety", "inspection"],
  },
  {
    id: "28",
    title: "Equipment Maintenance Check",
    description: "Weekly maintenance check of all construction equipment",
    completed: false,
    priority: "medium",
    status: "todo",
    isRecurring: true,
    recurringType: "weekly",
    startDate: new Date(2025, 0, 5),
    dueDate: new Date(2025, 0, 5),
    assignee: "Steve Wilson",
    createdAt: new Date(2024, 11, 15),
    updatedAt: new Date(2024, 11, 29),
    projectId: "1",
    projectName: "London Office Tower",
    category: "Site Work",
    tags: ["equipment", "maintenance"],
  },
]

interface CalendarEvent {
  id: string
  title: string
  date: Date
  time?: string
  type: "meeting" | "inspection" | "delivery" | "event"
  priority: "high" | "medium" | "low"
  projectId?: string
  projectName?: string
}

const calendarEvents: CalendarEvent[] = [
  // LONDON OFFICE TOWER EVENTS
  {
    id: "ev1",
    title: "Client Progress Review",
    date: new Date(2025, 0, 10),
    time: "2:00 PM",
    type: "meeting",
    priority: "high",
    projectId: "1",
    projectName: "London Office Tower",
  },
  {
    id: "ev2",
    title: "Structural Steel Delivery",
    date: new Date(2025, 0, 8),
    time: "8:00 AM",
    type: "delivery",
    priority: "high",
    projectId: "1",
    projectName: "London Office Tower",
  },
  {
    id: "ev3",
    title: "Building Control Inspection",
    date: new Date(2025, 0, 12),
    time: "10:00 AM",
    type: "inspection",
    priority: "high",
    projectId: "1",
    projectName: "London Office Tower",
  },
  {
    id: "ev4",
    title: "HVAC Equipment Delivery",
    date: new Date(2025, 0, 19),
    time: "9:00 AM",
    type: "delivery",
    priority: "high",
    projectId: "1",
    projectName: "London Office Tower",
  },

  // MANCHESTER RESIDENTIAL COMPLEX EVENTS
  {
    id: "ev5",
    title: "Planning Committee Meeting",
    date: new Date(2025, 0, 15),
    time: "3:00 PM",
    type: "meeting",
    priority: "medium",
    projectId: "2",
    projectName: "Manchester Residential Complex",
  },
  {
    id: "ev6",
    title: "Electrical Materials Delivery",
    date: new Date(2025, 0, 14),
    time: "10:00 AM",
    type: "delivery",
    priority: "medium",
    projectId: "2",
    projectName: "Manchester Residential Complex",
  },
  {
    id: "ev7",
    title: "Plumbing Inspection - Building A",
    date: new Date(2025, 1, 1),
    time: "11:00 AM",
    type: "inspection",
    priority: "high",
    projectId: "2",
    projectName: "Manchester Residential Complex",
  },

  // M25 MOTORWAY BRIDGE EVENTS
  {
    id: "ev8",
    title: "Highways Agency Coordination Meeting",
    date: new Date(2025, 2, 3),
    time: "9:00 AM",
    type: "meeting",
    priority: "high",
    projectId: "3",
    projectName: "M25 Motorway Bridge",
  },
  {
    id: "ev9",
    title: "Traffic Management Equipment Delivery",
    date: new Date(2025, 1, 28),
    time: "7:00 AM",
    type: "delivery",
    priority: "high",
    projectId: "3",
    projectName: "M25 Motorway Bridge",
  },
  {
    id: "ev10",
    title: "Bridge Engineering Inspection",
    date: new Date(2025, 2, 12),
    time: "8:00 AM",
    type: "inspection",
    priority: "high",
    projectId: "3",
    projectName: "M25 Motorway Bridge",
  },

  // BRISTOL SHOPPING CENTRE EVENTS
  {
    id: "ev11",
    title: "Tenant Coordination Meeting",
    date: new Date(2025, 1, 10),
    time: "2:00 PM",
    type: "meeting",
    priority: "medium",
    projectId: "6",
    projectName: "Bristol Shopping Centre",
  },
  {
    id: "ev12",
    title: "Local Authority Planning Review",
    date: new Date(2025, 1, 25),
    time: "10:00 AM",
    type: "meeting",
    priority: "high",
    projectId: "6",
    projectName: "Bristol Shopping Centre",
  },

  // GENERAL PROJECT EVENTS
  {
    id: "ev13",
    title: "Monthly Safety Review Meeting",
    date: new Date(2025, 0, 30),
    time: "9:00 AM",
    type: "meeting",
    priority: "high",
    projectId: undefined,
    projectName: "All Projects",
  },
  {
    id: "ev14",
    title: "Project Managers Coordination Meeting",
    date: new Date(2025, 0, 20),
    time: "1:00 PM",
    type: "meeting",
    priority: "medium",
    projectId: undefined,
    projectName: "All Projects",
  },
  {
    id: "ev15",
    title: "Quarterly Business Review",
    date: new Date(2025, 2, 31),
    time: "10:00 AM",
    type: "meeting",
    priority: "high",
    projectId: undefined,
    projectName: "All Projects",
  },
]

type ScheduleItem = ({ itemType: "task"; data: Task } | { itemType: "event"; data: CalendarEvent }) & { date: Date }

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 0, 6)) // January 6, 2025 - start of active projects
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2025, 0, 1)) // January 2025
  const [timeframe, setTimeframe] = useState(12) // in weeks - show 3 months for better project overview
  const [viewDate, setViewDate] = useState(new Date(2025, 0, 1)) // Start of January 2025

  const scheduleItems: ScheduleItem[] = useMemo(() => {
    const tasksAsItems: ScheduleItem[] = allTasks
      .filter((task) => task.dueDate)
      .map((task) => ({ itemType: "task", data: task, date: task.dueDate! }))

    const eventsAsItems: ScheduleItem[] = calendarEvents.map((event) => ({
      itemType: "event",
      data: event,
      date: event.date,
    }))

    return [...tasksAsItems, ...eventsAsItems].sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [])

  const selectedDateItems = scheduleItems.filter((item) => isSameDay(item.date, selectedDate))

  const upcomingItems = scheduleItems.filter((item) => startOfDay(item.date) >= startOfDay(new Date())).slice(0, 5)

  const modifiers = {
    hasTask: scheduleItems.filter((i) => i.itemType === "task").map((i) => i.date),
    hasEvent: scheduleItems.filter((i) => i.itemType === "event").map((i) => i.date),
  }

  const { viewStartDate, viewEndDate, viewTitle } = useMemo(() => {
    const start = startOfWeek(viewDate, { weekStartsOn: 1 })
    const end = addDays(start, timeframe * 7 - 1)
    const startMonth = format(start, "MMMM")
    const endMonth = format(end, "MMMM")
    const startYear = format(start, "yyyy")
    const endYear = format(end, "yyyy")

    let title = `${startMonth}`
    if (startYear !== endYear) {
      title += ` ${startYear}`
    }
    if (startMonth !== endMonth) {
      title += ` - ${endMonth}`
    }
    if (startYear === endYear) {
      title += ` ${endYear}`
    } else {
      title += ` ${endYear}`
    }

    return {
      viewStartDate: start,
      viewEndDate: end,
      viewTitle: title,
    }
  }, [viewDate, timeframe])

  const handlePrev = () => setViewDate((prev) => addDays(prev, -7))
  const handleNext = () => setViewDate((prev) => addDays(prev, 7))
  const handleToday = () => setViewDate(new Date())

  const EventTypeIcon = ({ type }: { type: ScheduleItem["itemType"] | CalendarEvent["type"] }) => {
    const baseClasses = "w-6 h-6 rounded-full flex items-center justify-center text-white"
    switch (type) {
      case "task":
        return (
          <div className={`${baseClasses} bg-blue-500`}>
            <CheckCircle className="h-4 w-4" />
          </div>
        )
      case "meeting":
        return (
          <div className={`${baseClasses} bg-purple-500`}>
            <Users className="h-4 w-4" />
          </div>
        )
      case "inspection":
        return (
          <div className={`${baseClasses} bg-yellow-500`}>
            <FileQuestion className="h-4 w-4" />
          </div>
        )
      case "delivery":
        return (
          <div className={`${baseClasses} bg-green-500`}>
            <FolderKanban className="h-4 w-4" />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div>
            <h1 className="font-semibold">Project Schedule & Timeline</h1>
            <p className="text-sm text-muted-foreground">6 active projects • {allTasks.length} tasks • Complete Gantt timeline view</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6">
        {/* Project Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-gray-600">Active Projects</div>
              <div className="text-xs text-muted-foreground mt-1">
                London • Manchester • M25 • Birmingham • Liverpool • Bristol
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                {allTasks.filter(t => t.completed).length}
              </div>
              <div className="text-sm text-gray-600">Completed Tasks</div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round((allTasks.filter(t => t.completed).length / allTasks.length) * 100)}% completion rate
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-orange-600">
                {allTasks.filter(t => t.status === "in-progress").length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
              <div className="text-xs text-muted-foreground mt-1">
                Across {new Set(allTasks.filter(t => t.status === "in-progress").map(t => t.projectName)).size} projects
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">
                {allTasks.filter(t => t.priority === "high" && !t.completed).length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
              <div className="text-xs text-muted-foreground mt-1">
                Require immediate attention
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="timeline" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="schedule">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <GanttChartSquare className="w-4 h-4 mr-2" />
                Timeline
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Select value={String(timeframe)} onValueChange={(val) => setTimeframe(Number(val))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Time view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 Weeks</SelectItem>
                  <SelectItem value="6">6 Weeks</SelectItem>
                  <SelectItem value="8">8 Weeks</SelectItem>
                  <SelectItem value="12">12 Weeks</SelectItem>
                  <SelectItem value="16">16 Weeks</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent" onClick={handlePrev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium w-32 text-center">{viewTitle}</span>
                <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <TabsContent value="schedule" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-2">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      month={currentMonth}
                      onMonthChange={setCurrentMonth}
                      className="w-full"
                      modifiers={modifiers}
                      modifiersStyles={{
                        hasTask: { backgroundColor: "rgb(59 130 246 / 0.1)", border: "1px solid rgb(59 130 246 / 0.3)" },
                        hasEvent: { backgroundColor: "rgb(168 85 247 / 0.1)", border: "1px solid rgb(168 85 247 / 0.3)" },
                      }}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Agenda for {format(selectedDate, "MMMM d")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedDateItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No items scheduled for this date.</div>
                    ) : (
                      <div className="space-y-4">
                        {selectedDateItems.map((item) => (
                          <div key={item.data.id} className="flex items-start gap-4">
                            <EventTypeIcon type={item.itemType === "event" ? item.data.type : "task"} />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{item.data.title}</p>
                                    {item.itemType === "task" && item.data.isRecurring && (
                                      <Badge variant="outline" className="text-xs">
                                        <RotateCcw className="h-3 w-3 mr-1" />
                                        Recurring
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <FolderKanban className="h-4 w-4" />
                                    {item.data.projectName}
                                  </p>
                                  {item.itemType === "task" && item.data.cvc && (
                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                      <span>CVC: {formatCurrency(item.data.cvc.cvcScore)}</span>
                                      <span>•</span>
                                      <span>{item.data.cvc.cvcPercentage.toFixed(0)}%</span>
                                      {item.data.cvc.hoursLogged && (
                                        <>
                                          <span>•</span>
                                          <span>{item.data.cvc.hoursLogged}h logged</span>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <Badge
                                  variant={item.data.priority === "high" ? "destructive" : "secondary"}
                                  className="capitalize"
                                >
                                  {item.data.priority}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <Clock className="h-4 w-4" />
                                <span>{item.itemType === "event" && item.data.time ? item.data.time : "All Day"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Key Dates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingItems.map((item) => (
                        <div key={item.data.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                          <div className="flex-shrink-0 pt-1">
                            <EventTypeIcon type={item.itemType === "event" ? item.data.type : "task"} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.data.title}</p>
                            <p className="text-xs text-muted-foreground">{format(item.date, "MMM d")}</p>
                            <Badge
                              variant={item.data.priority === "high" ? "destructive" : "secondary"}
                              className="text-xs mt-1 capitalize"
                            >
                              {item.data.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="timeline" className="mt-6">
            <GanttTimeline tasks={allTasks} viewStartDate={viewStartDate} viewEndDate={viewEndDate} />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
