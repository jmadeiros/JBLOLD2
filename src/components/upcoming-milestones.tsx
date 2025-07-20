import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

const upcomingDeadlines = [
  { task: "Structural Steel Delivery", date: "Jan 5, 2025", priority: "high" },
  { task: "Client Walkthrough - Phase 1", date: "Jan 8, 2025", priority: "medium" },
  { task: "City Plumbing Inspection", date: "Jan 10, 2025", priority: "high" },
]

export function UpcomingMilestones() {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return "destructive"
      case "medium": return "default"
      default: return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Milestones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingDeadlines.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-sm">{item.task}</p>
              <p className="text-xs text-muted-foreground">{item.date}</p>
            </div>
            <Badge
              variant={getPriorityBadge(item.priority)}
              className="text-xs"
            >
              {item.priority}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 