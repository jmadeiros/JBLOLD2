"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Trophy, Award, TrendingUp, Clock, Star } from "lucide-react"
import type { TradesPersonPerformance } from "../../../types/tradesperson"
import Link from "next/link"

interface TeamLeaderboardProps {
  performances: TradesPersonPerformance[]
  onViewProfile?: (tradespersonId: string) => void
}

export function TeamLeaderboard({ performances, onViewProfile }: TeamLeaderboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter">("week")

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Award className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return "text-green-600 bg-green-50"
    if (score >= 7.0) return "text-blue-600 bg-blue-50"
    if (score >= 5.5) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getTradeIcon = (trade: string) => {
    const tradeIcons: { [key: string]: string } = {
      "Electrical": "⚡",
      "Plumbing": "🔧",
      "Framing": "🔨",
      "Concrete": "🏗️",
      "Drywall": "🧱",
      "HVAC": "🌡️",
      "Roofing": "🏠",
      "Flooring": "📐",
      "Painting": "🎨",
      "Masonry": "🧱"
    }
    return tradeIcons[trade] || "👷"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Leaderboard
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Click on any team member to view detailed performance and daily timesheets.
            </p>
          </div>
          <div className="flex gap-1">
            {(["week", "month", "quarter"] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="text-xs"
              >
                {period === "week" ? "This Week" : period === "month" ? "This Month" : "This Quarter"}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {performances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Star className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No assessments yet. Complete weekly assessments to see the leaderboard.</p>
            </div>
          ) : (
            performances.map((performance) => (
              <div
                key={performance.tradesperson.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer ${
                  performance.rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-white border-yellow-200" : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => onViewProfile?.(performance.tradesperson.id)}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(performance.rank)}
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={performance.tradesperson.avatarUrl} />
                    <AvatarFallback className="text-xs font-semibold">
                      {performance.tradesperson.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{performance.tradesperson.name}</span>
                      <span className="text-lg">{getTradeIcon(performance.tradesperson.trade)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {performance.tradesperson.trade}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {performance.weeklyHours}h this week
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="flex items-center gap-4">
                  {/* Overall Score */}
                  <div className="text-center">
                    <div className={`text-lg font-bold px-2 py-1 rounded ${getScoreColor(performance.averageScore)}`}>
                      {performance.averageScore.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Score</div>
                  </div>

                  {/* Task Completion Rate */}
                  <div className="text-center min-w-[60px]">
                    <div className="text-sm font-semibold text-gray-900">
                      {Math.round(performance.completionRate)}%
                    </div>
                    <Progress value={performance.completionRate} className="w-12 h-1 mt-1" />
                    <div className="text-xs text-gray-500 mt-1">Tasks</div>
                  </div>

                  {/* Last Assessment */}
                  <div className="text-center">
                    <div className="text-xs text-gray-500">
                      {performance.latestAssessment ? (
                        <>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(performance.latestAssessment.weekEndingDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </>
                      ) : (
                        "No assessment"
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Link href={`/assessments/new?tradesperson=${performance.tradesperson.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Assess
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>

        {performances.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {performances.filter(p => p.averageScore >= 8.5).length}
                </div>
                <div className="text-xs text-gray-500">Top Performers</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {(performances.reduce((sum, p) => sum + p.averageScore, 0) / performances.length).toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Team Average</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {Math.round(performances.reduce((sum, p) => sum + p.completionRate, 0) / performances.length)}%
                </div>
                <div className="text-xs text-gray-500">Completion Rate</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 