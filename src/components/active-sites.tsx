import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Users, Calendar } from "lucide-react"

interface Project {
  id: string
  name: string
  location: string
  status: "on-track" | "delayed" | "completed"
  progress: number
  workers: number
  deadline: string
  manager: string
}

const projects: Project[] = [
  {
    id: "1",
    name: "Downtown Office Complex",
    location: "Main St, Downtown",
    status: "on-track",
    progress: 75,
    workers: 24,
    deadline: "Dec 15",
    manager: "Sarah Johnson"
  },
  {
    id: "2",
    name: "Residential Tower A",
    location: "Oak Avenue", 
    status: "delayed",
    progress: 45,
    workers: 18,
    deadline: "Jan 30",
    manager: "Mike Wilson"
  },
  {
    id: "3",
    name: "Shopping Center Renovation",
    location: "Commerce Blvd",
    status: "on-track", 
    progress: 90,
    workers: 12,
    deadline: "Nov 28",
    manager: "Lisa Chen"
  },
  {
    id: "4",
    name: "Industrial Warehouse",
    location: "Industrial Park",
    status: "completed",
    progress: 100,
    workers: 0,
    deadline: "Completed",
    manager: "David Rodriguez"
  }
]

export function ActiveSites() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sites</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">{project.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {project.location}
                  </div>
                </div>
                <Badge 
                  variant={
                    project.status === "on-track" ? "default" : 
                    project.status === "delayed" ? "destructive" : "secondary"
                  }
                  className="text-xs"
                >
                  {project.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {project.workers} workers
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {project.deadline}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 