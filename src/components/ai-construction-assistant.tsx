"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Zap } from "lucide-react"
import { useState } from "react"

export function AIConstructionAssistant() {
  const [query, setQuery] = useState("")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 bg-orange-100 rounded-lg">
            <Zap className="h-5 w-5 text-orange-600" />
          </div>
          AI Construction Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Ask about project delays, resource allocation, or safety concerns...
        </p>
        
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ask a question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 text-base" // Taller input with larger font
            />
            <Button size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8">
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 