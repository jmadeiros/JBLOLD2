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

  // Generate mock clock in/out times for the last week
  const getWeeklyClockTimes = (tradespersonId: string): Array<{day: string, clockIn: string, clockOut: string, absent?: boolean}> => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const baseClockIn = 8; // 8 AM base
    const baseClockOut = 17; // 5 PM base
    
    // Use tradesperson ID to create consistent times for each person
    const seed = parseInt(tradespersonId) || 1;
    
    return days.map((day, index) => {
      // Some variation in times based on person and day
      const variation = (seed + index) % 3;
      const clockInHour = baseClockIn + (variation === 0 ? 0 : variation === 1 ? -15/60 : 15/60); // ±15 min variation
      const clockOutHour = baseClockOut + (variation === 0 ? 0 : variation === 1 ? 30/60 : -30/60); // ±30 min variation
      
      // Occasionally someone might be absent (5% chance)
      const isAbsent = (seed + index) % 20 === 0;
      
      if (isAbsent) {
        return { day, clockIn: '--', clockOut: '--', absent: true };
      }
      
      const clockIn = Math.floor(clockInHour).toString().padStart(2, '0') + ':' + 
                     Math.round((clockInHour % 1) * 60).toString().padStart(2, '0');
      const clockOut = Math.floor(clockOutHour).toString().padStart(2, '0') + ':' + 
                      Math.round((clockOutHour % 1) * 60).toString().padStart(2, '0');
      
      return { day, clockIn, clockOut };
    });
  };

  // Calculate rankings based on assessment score + clock time attendance
  const rankedTradespeople = tradespeople
    .map(person => {
      const latestAssessment = getLatestAssessment(person.id);
      const weeklyTimes = getWeeklyClockTimes(person.id);
      const assessmentScore = latestAssessment?.overallScore || 0;
      
      // Calculate attendance score based on days present
      const daysPresent = weeklyTimes.filter(day => !day.absent).length;
      const attendanceScore = (daysPresent / 5) * 100; // Out of 5 working days
      
      // Combined performance: 70% assessment score, 30% attendance
      const combinedScore = (assessmentScore * 0.7) + (attendanceScore / 10 * 0.3);
      
      return {
        ...person,
        latestAssessment,
        weeklyTimes,
        attendanceScore,
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
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-sm">{person.name}</h3>
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 border-blue-200">
                      {person.trade}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {assessment ? (
                        <span>Assessed: {new Date(assessment.weekEndingDate).toLocaleDateString()}</span>
                      ) : (
                        <span>No assessment</span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-2 w-full max-w-xs">
                      {person.weeklyTimes.map((day, idx) => (
                        <div key={idx} className={`
                          flex-1 text-center px-3 py-2 rounded-lg text-xs
                          ${day.absent 
                            ? 'bg-red-50 border border-red-200 text-red-600' 
                            : 'bg-green-50 border border-green-200 text-green-700'
                          }
                        `}>
                          <div className="font-semibold text-[10px] mb-1 uppercase tracking-wide">{day.day}</div>
                          <div className="space-y-1">
                            <div className="text-[11px] font-mono font-medium">
                              {day.absent ? '--:--' : day.clockIn}
                            </div>
                            <div className="text-[11px] font-mono opacity-80">
                              {day.absent ? '--:--' : day.clockOut}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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