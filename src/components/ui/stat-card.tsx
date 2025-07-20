import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor: string
  trend?: {
    value: string
    isPositive: boolean
  }
}

export function StatCard({ title, value, icon: Icon, iconColor, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 text-sm">
                <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
                  {trend.isPositive ? "+" : ""}{trend.value}
                </span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${iconColor}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 