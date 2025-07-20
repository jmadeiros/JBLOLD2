import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Worker {
  id: string
  name: string
  role: string
  project: string
  status: "active" | "break" | "inactive"
  avatar?: string
}

const workers: Worker[] = [
  {
    id: "1",
    name: "John Smith",
    role: "Site Supervisor",
    project: "Downtown Complex",
    status: "active"
  },
  {
    id: "2", 
    name: "Maria Garcia",
    role: "Crane Operator",
    project: "Residential Tower",
    status: "active"
  },
  {
    id: "3",
    name: "David Chen", 
    role: "Electrician",
    project: "Shopping Center",
    status: "break"
  },
  {
    id: "4",
    name: "Sarah Johnson",
    role: "Project Manager",
    project: "Downtown Complex", 
    status: "active"
  },
  {
    id: "5",
    name: "Mike Rodriguez",
    role: "Plumber", 
    project: "Residential Tower",
    status: "active"
  },
  {
    id: "6",
    name: "Lisa Wang",
    role: "Safety Inspector",
    project: "Industrial Warehouse",
    status: "inactive"
  }
]

export function WorkersToday() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500"
      case "break": return "bg-yellow-500" 
      case "inactive": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return { variant: "default" as const, text: "active" }
      case "break": return { variant: "secondary" as const, text: "break" }
      case "inactive": return { variant: "outline" as const, text: "break" }
      default: return { variant: "outline" as const, text: "inactive" }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Workers Today</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {workers.map((worker) => {
          const statusBadge = getStatusBadge(worker.status)
          return (
            <div key={worker.id} className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={worker.avatar} />
                  <AvatarFallback>{worker.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(worker.status)}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{worker.name}</p>
                  <Badge variant={statusBadge.variant} className="text-xs">
                    {statusBadge.text}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{worker.role}</p>
                <p className="text-xs text-muted-foreground">{worker.project}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
} 