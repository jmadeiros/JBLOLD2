"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import { TeamLeaderboard } from "@/components/team-leaderboard";
import { WeeklyAssessmentForm } from "@/components/weekly-assessment-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tradesperson, WeeklyAssessment } from "../../../types/tradesperson";
import { Users, Clock, Calendar, Plus, Mail, MapPin, Award, TrendingUp, ClipboardList } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Link from "next/link";

interface TeamMember extends Tradesperson {
  email: string;
  location: string;
  status: "active" | "busy" | "away";
  activeTasks: number;
  completedTasks: number;
  todayHours: number;
  onTimePercentage: number;
  missedTasks: number;
}

export default function TeamPage() {
  // Mock data - in a real app, this would come from your database/API
  const [tradespeople] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Mike Johnson",
      trade: "Electrical",
      supervisorId: "supervisor-1",
      projectId: "project-1",
      email: "mike.johnson@construction.co",
      location: "Site - Floor 2",
      status: "active",
      activeTasks: 3,
      completedTasks: 87,
      todayHours: 6.5,
      onTimePercentage: 95,
      missedTasks: 0
    },
    {
      id: "2", 
      name: "Sarah Williams",
      trade: "Plumbing",
      supervisorId: "supervisor-1",
      projectId: "project-1",
      email: "sarah.williams@construction.co",
      location: "Site - Basement",
      status: "active",
      activeTasks: 2,
      completedTasks: 93,
      todayHours: 7.0,
      onTimePercentage: 98,
      missedTasks: 0
    },
    {
      id: "3",
      name: "David Rodriguez",
      trade: "Framing",
      supervisorId: "supervisor-1", 
      projectId: "project-1",
      email: "david.rodriguez@construction.co",
      location: "Site - Sector A",
      status: "busy",
      activeTasks: 4,
      completedTasks: 76,
      todayHours: 8.0,
      onTimePercentage: 87,
      missedTasks: 1
    },
    {
      id: "4",
      name: "Emily Chen",
      trade: "Drywall",
      supervisorId: "supervisor-1",
      projectId: "project-1",
      email: "emily.chen@construction.co",
      location: "Site - Floor 3",
      status: "active",
      activeTasks: 2,
      completedTasks: 64,
      todayHours: 6.0,
      onTimePercentage: 92,
      missedTasks: 0
    },
    {
      id: "5",
      name: "James Wilson",
      trade: "HVAC",
      supervisorId: "supervisor-1",
      projectId: "project-1",
      email: "james.wilson@construction.co",
      location: "Off-site",
      status: "away",
      activeTasks: 1,
      completedTasks: 58,
      todayHours: 0,
      onTimePercentage: 83,
      missedTasks: 2
    }
  ]);

  const [assessments, setAssessments] = useState<WeeklyAssessment[]>([
    {
      id: "assessment-1",
      tradespersonId: "1",
      assessedBy: "supervisor-1",
      weekEndingDate: "2024-01-12",
                  scores: {
              punctuality: 9,
              taskCompletion: 8,
              workQuality: 9,
              safety: 10,
              communication: 8,
              problemSolving: 7,
              workplaceOrganisation: 8,
              toolUsage: 9,
              teamwork: 8,
              workErrors: 9
            },
      overallScore: 8.3,
      notes: "Excellent work this week. Shows great leadership potential.",
      createdAt: "2024-01-12T17:00:00Z"
    },
    {
      id: "assessment-2", 
      tradespersonId: "2",
      assessedBy: "supervisor-1",
      weekEndingDate: "2024-01-12",
      scores: {
        punctuality: 10,
        taskCompletion: 9,
        workQuality: 9,
        safety: 9,
        communication: 9,
        problemSolving: 8,
        workplaceOrganisation: 7,
        toolUsage: 8,
        teamwork: 9,
        workErrors: 10
      },
      overallScore: 8.8,
      notes: "Consistently outstanding performance. Very reliable team member.",
      createdAt: "2024-01-12T17:00:00Z"
    }
  ]);

  // State for assessment form
  const [selectedTradesperson, setSelectedTradesperson] = useState<TeamMember | null>(null);
  const [isAssessmentFormOpen, setIsAssessmentFormOpen] = useState(false);

  // Handlers
  const handleOpenAssessmentForm = (tradesperson: Tradesperson) => {
    // Find the full TeamMember data 
    const fullTeamMember = tradespeople.find(t => t.id === tradesperson.id);
    if (fullTeamMember) {
      setSelectedTradesperson(fullTeamMember);
      setIsAssessmentFormOpen(true);
    }
  };

  const handleSaveAssessment = (assessment: WeeklyAssessment) => {
    // Check if this assessment already exists
    const existingIndex = assessments.findIndex(a => 
      a.tradespersonId === assessment.tradespersonId && 
      a.weekEndingDate === assessment.weekEndingDate
    );
    
    if (existingIndex >= 0) {
      // Update existing assessment
      setAssessments(prev => prev.map((a, index) => 
        index === existingIndex ? assessment : a
      ));
    } else {
      // Add new assessment
      setAssessments(prev => [...prev, assessment]);
    }
    
    // Close the dialog
    setIsAssessmentFormOpen(false);
    setSelectedTradesperson(null);
  };

  // Calculate team stats
  const totalTeamMembers = tradespeople.length;
  
  // Get current week ending date (next Friday)
  const getCurrentWeekEndingDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + daysUntilFriday);
    return friday.toISOString().split('T')[0];
  };
  
  const currentWeekEndingDate = getCurrentWeekEndingDate();
  const membersWithAssessments = assessments.filter(a => 
    a.weekEndingDate === currentWeekEndingDate
  ).length;
  const averageScore = assessments.length > 0 
    ? assessments.reduce((sum, a) => sum + a.overallScore, 0) / assessments.length 
    : 0;

  return (
    <div className="space-y-6">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div>
            <h1 className="font-semibold">Team Management</h1>
            <p className="text-sm text-muted-foreground">Manage team assessments, timesheets, and performance tracking</p>
          </div>
        </div>
      </header>

             {/* Team Overview Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
         <Card className="border-gray-200">
           <CardContent className="pt-4 pb-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-lg font-semibold">{totalTeamMembers}</p>
                 <p className="text-xs text-muted-foreground">Team Members</p>
               </div>
               <Users className="h-5 w-5 text-blue-600" />
             </div>
            </CardContent>
          </Card>

         <Card className="border-gray-200">
           <CardContent className="pt-4 pb-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-lg font-semibold text-green-600">{membersWithAssessments}</p>
                 <p className="text-xs text-muted-foreground">Assessed This Week</p>
               </div>
               <Calendar className="h-5 w-5 text-green-600" />
             </div>
            </CardContent>
          </Card>

         <Card className="border-gray-200">
           <CardContent className="pt-4 pb-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-lg font-semibold text-blue-600">{averageScore.toFixed(1)}</p>
                 <p className="text-xs text-muted-foreground">Average Score</p>
               </div>
               <Badge variant="outline" className={`text-xs ${
                 averageScore >= 8 ? "bg-green-100 text-green-800 border-green-200" : 
                 averageScore >= 6 ? "bg-blue-100 text-blue-800 border-blue-200" : 
                 "bg-yellow-100 text-yellow-800 border-yellow-200"
               }`}>
                 {averageScore >= 8 ? "Excellent" : averageScore >= 6 ? "Good" : "Needs Improvement"}
               </Badge>
             </div>
            </CardContent>
          </Card>

         <Card className="border-gray-200">
           <CardContent className="pt-4 pb-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-lg font-semibold text-orange-600">
                   {Math.round((membersWithAssessments / totalTeamMembers) * 100)}%
                 </p>
                 <p className="text-xs text-muted-foreground">Assessment Complete</p>
               </div>
               <Clock className="h-5 w-5 text-orange-600" />
             </div>
            </CardContent>
          </Card>
        </div>

             {/* Team Performance Leaderboard */}
       <TeamLeaderboard 
         tradespeople={tradespeople}
         assessments={assessments}
       />

              {/* All Team Members */}
        <Card>
          <CardHeader>
           <CardTitle className="text-lg">All Team Members</CardTitle>
          </CardHeader>
          <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {tradespeople.map((member, index) => {
               const rank = index + 1;
               const latestAssessment = assessments.find(a => a.tradespersonId === member.id);
               const performanceScore = latestAssessment?.overallScore || 0;
               
               return (
                 <Link href={`/team/${member.id}`} key={member.id}>
                   <Card className="hover:shadow-lg transition-all duration-200 border-gray-200 flex flex-col h-full cursor-pointer">
                     <CardHeader className="pb-3">
                     <div className="flex items-start justify-between">
                       <div className="flex items-center gap-3">
                         <Avatar className="h-12 w-12">
                           <AvatarImage src="/placeholder.svg" />
                           <AvatarFallback className={`text-white ${
                             performanceScore >= 8 ? "bg-green-600" :
                             performanceScore >= 6 ? "bg-blue-600" :
                             performanceScore > 0 ? "bg-orange-600" : "bg-gray-400"
                           }`}>
                             {member.name.split(' ').map(n => n[0]).join('')}
                           </AvatarFallback>
                         </Avatar>
                         <div>
                           <CardTitle className="text-base">{member.name}</CardTitle>
                           <p className="text-sm text-muted-foreground">{member.trade}</p>
                  </div>
                </div>
                       <Badge variant="outline" className="text-xs flex items-center gap-1">
                         <Award className="h-3 w-3" /> #{rank}
                       </Badge>
            </div>
                   </CardHeader>
                   
                   <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                     <div className="space-y-4">
                  <div className="flex items-center gap-2">
                         <Badge variant="outline" className={`text-xs ${
                           member.status === "active" ? "bg-green-100 text-green-800 border-green-200" :
                           member.status === "busy" ? "bg-red-100 text-red-800 border-red-200" :
                           "bg-yellow-100 text-yellow-800 border-yellow-200"
                         }`}>
                           {member.status}
                         </Badge>
                         <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                           {member.trade}
                         </Badge>
                  </div>

                       <div className="space-y-2 text-sm">
                         <div className="flex items-center gap-2 text-muted-foreground">
                           <Mail className="h-3 w-3" />
                           <span className="truncate text-xs">{member.email}</span>
                  </div>
                         <div className="flex items-center gap-2 text-muted-foreground">
                           <MapPin className="h-3 w-3" />
                           <span className="text-xs">{member.location}</span>
                  </div>
                </div>

                                                {performanceScore > 0 && (
                           <div className="pt-2 border-t">
                             <div className="flex justify-between items-center mb-2">
                               <h4 className="text-sm font-medium flex items-center gap-1">
                                 <TrendingUp className="h-3 w-3" /> Performance
                               </h4>
                               <span className="font-bold text-sm">{performanceScore.toFixed(1)}</span>
                             </div>
                             <Progress 
                               value={(performanceScore / 10) * 100} 
                               className={`h-2 ${
                                 performanceScore >= 8 ? "[&>div]:bg-green-600" :
                                 performanceScore >= 6 ? "[&>div]:bg-blue-600" :
                                 "[&>div]:bg-orange-600"
                               }`}
                             />
                           </div>
                         )}
                     </div>

                     <div className="space-y-3 pt-4 border-t">
                       <div className="flex items-center justify-between">
                         <div className="text-center">
                           <div className="text-sm font-semibold">{member.activeTasks}</div>
                           <div className="text-xs text-muted-foreground">Active</div>
                         </div>
                         <div className="text-center">
                           <div className="text-sm font-semibold">{member.completedTasks}</div>
                           <div className="text-xs text-muted-foreground">Completed</div>
                         </div>
                         <div className="text-center">
                           <div className="text-sm font-semibold">{member.onTimePercentage}%</div>
                           <div className="text-xs text-muted-foreground">On-Time</div>
                         </div>
                       </div>
                       
                       <Link href={`/assessments/new?tradesperson=${member.id}`} className="w-full">
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="w-full"
                         >
                           <ClipboardList className="h-4 w-4 mr-2" />
                           Weekly Assessment
                         </Button>
                       </Link>
                     </div>
                   </CardContent>
                 </Card>
               </Link>
               );
             })}
                    </div>
         </CardContent>
       </Card>

      {/* Weekly Assessment Form Modal */}
      <Dialog open={isAssessmentFormOpen} onOpenChange={setIsAssessmentFormOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto p-0">
          {selectedTradesperson && (
            <WeeklyAssessmentForm 
              tradesperson={selectedTradesperson}
              onSave={handleSaveAssessment}
              onCancel={() => {
                setIsAssessmentFormOpen(false);
                setSelectedTradesperson(null);
              }}
              existingAssessment={
                assessments.find(a => 
                  a.tradespersonId === selectedTradesperson.id && 
                  a.weekEndingDate === currentWeekEndingDate
                )
              }
            />
          )}
        </DialogContent>
      </Dialog>
                            </div>
  );
}
