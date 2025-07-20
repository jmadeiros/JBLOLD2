import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, AlertTriangle, DollarSign } from "lucide-react"

interface InsightItem {
  id: string
  type: "warning" | "optimization"
  title: string
  description: string
  confidence: number
  timeAgo: string
  impact?: string
  action?: string
}

const insights: InsightItem[] = [
  {
    id: "1",
    type: "warning",
    title: "Weather Delay Risk",
    description: "Heavy rainfall predicted for next week may delay outdoor construction activities for Downtown Office Complex.",
    confidence: 85,
    timeAgo: "10:30:00",
    impact: "MEDIUM",
    action: "Reschedule concrete pours"
  },
  {
    id: "2", 
    type: "optimization",
    title: "Cost Optimization",
    description: "Bulk material purchase opportunity identified that could save 12% on remaining materials for Residential Tower A.",
    confidence: 92,
    timeAgo: "09:15:00",
    impact: "HIGH",
    action: "Review procurement"
  }
]

export function AIInsightsPanel() {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "HIGH": return "text-red-600"
      case "MEDIUM": return "text-orange-600"
      default: return "text-gray-600"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="h-5 w-5 text-blue-600" />
          </div>
          AI Insights
          <Button variant="ghost" size="sm" className="ml-auto text-blue-600">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
            <div key={insight.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {insight.type === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                  {insight.type === 'optimization' && <DollarSign className="h-5 w-5 text-green-500" />}
                  <span className="font-semibold text-sm">{insight.title}</span>
                </div>
                <span className={`text-xs font-semibold ${getImpactColor(insight.impact || "")}`}>
                  {insight.impact}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {insight.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Confidence:</span>
                  <span className="text-xs font-semibold">{insight.confidence}%</span>
                </div>
                <span className="text-xs text-muted-foreground">{insight.timeAgo}</span>
              </div>
              
              {insight.action && (
                <Button variant="outline" size="sm" className="w-full text-xs">
                  {insight.action}
                </Button>
              )}
            </div>
          ))}
      </CardContent>
    </Card>
  )
} 