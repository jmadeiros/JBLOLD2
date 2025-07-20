import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  MapPin, 
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  DollarSign
} from "lucide-react"

interface TeamMember {
  initials: string;
  name: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  status: "Pre-construction" | "In Progress" | "On Hold" | "Substantially Complete" | "Completed" | "Delayed";
  priority: "high" | "medium" | "low";
  progress: number;
  dueDate: string;
  teamMembers: TeamMember[];
  tasksCompleted: number;
  totalTasks: number;
  isStarred: boolean;
  tasksByStatus: {
      todo: number;
      inProgress: number;
      review: number;
      done: number;
  };
  trades: string[];
  siteSupervisor: string;
  criticalPathTasks: number;
  budget: string;
}

interface DetailedProjectCardProps {
  project: Project
}

const getCriticalTasks = (project: Project) => [
  {
    name: "Structural steel delivery",
    due: "18/03/2024",
    priority: "high" as const
  },
  {
    name: "Concrete pouring", 
    due: "22/03/2024",
    priority: "medium" as const
  },
]

export function DetailedProjectCard({ project }: DetailedProjectCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delayed":
        return <Badge variant="destructive" className="bg-yellow-400 text-yellow-900 text-xs"><Clock className="mr-1 h-3 w-3" />delayed</Badge>
      case "In Progress":
        return <Badge className="bg-gray-900 text-white text-xs">In Progress</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>
    }
  }

  const getPriorityColor = (priority: "high" | "medium") => {
    return priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
  }

  const criticalTasks = getCriticalTasks(project)

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">{project.name}</CardTitle>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <MapPin className="mr-1 h-3 w-3" />
              {project.location}
            </div>
          </div>
          {getStatusBadge(project.status)}
        </div>
        
        <p className="text-xs text-muted-foreground">{project.description}</p>
        
        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span>Progress</span>
            <span className="font-semibold">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
        
        {/* Budget & Deadline in one row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Budget</div>
            <div className="text-sm font-semibold">{project.budget}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Deadline</div>
            <div className="flex items-center text-sm font-semibold">
              <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
              {project.dueDate}
            </div>
          </div>
        </div>

        {/* Team - Horizontal layout */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold flex items-center">
            <Users className="mr-1 h-3 w-3 text-muted-foreground"/>
            Team ({project.teamMembers.length})
          </h3>
          <div className="flex items-center gap-2">
            {project.teamMembers.map((member, index) => (
              <div key={index} className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                </Avatar>
                <div className="text-xs">
                  <div className="font-medium">{member.name}</div>
                  <div className="text-muted-foreground">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Critical Tasks - Compact */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold flex items-center">
            <AlertTriangle className="mr-1 h-3 w-3 text-muted-foreground" />
            Critical Tasks
          </h3>
          <div className="space-y-1">
            {criticalTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-1 rounded-md">
                <div className="flex items-center">
                  <span className={`h-2 w-2 rounded-full mr-2 ${getPriorityColor(task.priority)}`}></span>
                  <div className="text-xs">
                    <p className="font-medium">{task.name}</p>
                    <p className="text-muted-foreground">Due: {task.due}</p>
                  </div>
                </div>
                <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs capitalize">{task.priority}</Badge>
              </div>
            ))}
          </div>
        </div>
        
        <Button variant="outline" className="w-full h-8 text-xs">
          View Project Details
        </Button>
      </CardContent>
    </Card>
  )
} 