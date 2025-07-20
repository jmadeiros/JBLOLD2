"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tradesperson, WeeklyAssessment } from "../../types/tradesperson";
import { Trophy, Star, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";

interface TeamLeaderboardProps {
  tradespeople: Tradesperson[];
  assessments: WeeklyAssessment[];
}

export function TeamLeaderboard({ tradespeople, assessments }: TeamLeaderboardProps) {
  // Get the latest assessment for each tradesperson
  const getLatestAssessment = (tradespersonId: string): WeeklyAssessment | undefined => {
    return assessments
      .filter(a => a.tradespersonId === tradespersonId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  };

  // Calculate timesheet compliance (percentage of required entries submitted)
  const getTimesheetCompliance = (tradespersonId: string): number => {
    const weekDays = 5; // Monday to Friday
    const submittedDays = Math.floor(Math.random() * 5) + 1; // Mock data - would come from actual timesheet entries
    return Math.round((submittedDays / weekDays) * 100);
  };

  // Calculate rankings based on assessment score + timesheet compliance
  const rankedTradespeople = tradespeople
    .map(person => {
      const latestAssessment = getLatestAssessment(person.id);
      const timesheetCompliance = getTimesheetCompliance(person.id);
      const assessmentScore = latestAssessment?.overallScore || 0;
      
      // Combined performance: 70% assessment score, 30% timesheet compliance
      const combinedScore = (assessmentScore * 0.7) + (timesheetCompliance / 10 * 0.3);
      
      return {
        ...person,
        latestAssessment,
        timesheetCompliance,
        combinedScore
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 2:
        return <Star className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Star className="h-4 w-4 text-orange-600" />;
      default:
        return <span className="text-xs font-medium text-muted-foreground">#{rank}</span>;
    }
  };



  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Team Performance Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rankedTradespeople.map((person, index) => {
            const rank = index + 1;
            const assessment = person.latestAssessment;
            const assessmentScore = assessment?.overallScore || 0;
            const overallPerformance = person.combinedScore;
            
            return (
              <div key={person.id} className="flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50">
                <div className="flex items-center justify-center w-6 text-xs">
                  {getRankIcon(rank)}
                </div>
                
                <Avatar className="h-8 w-8">
                  <div className={`w-full h-full flex items-center justify-center text-white text-xs font-medium ${
                    rank === 1 ? "bg-yellow-600" :
                    rank === 2 ? "bg-gray-400" :
                    rank === 3 ? "bg-orange-600" :
                    "bg-gray-400"
                  }`}>
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-medium text-sm">{person.name}</h3>
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 border-blue-200">
                      {person.trade}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {assessment ? (
                      <span>Assessed: {new Date(assessment.weekEndingDate).toLocaleDateString()}</span>
                    ) : (
                      <span>No assessment</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-xs">
                  {assessment && (
                    <div className="text-center">
                      <div className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center font-medium text-xs">
                        {assessmentScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">Score</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-sm font-medium">{person.timesheetCompliance}%</div>
                    <div className="text-xs text-muted-foreground">Timesheet</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{overallPerformance.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Overall</div>
                  </div>
                  
                  <Link href={`/assessments/new?tradesperson=${person.id}`}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-xs px-2 py-1 h-7"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Assess
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
          
          {rankedTradespeople.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No team members found. Add team members to see the leaderboard.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 