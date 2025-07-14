"use client"

import { SidebarInset } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function CalendarPage() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div>
            <h1 className="font-semibold">Calendar</h1>
            <p className="text-sm text-muted-foreground">
              View your schedule
            </p>
          </div>
        </div>
      </header>
      <div className="flex-1 p-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">Calendar</h2>
          <p className="text-muted-foreground">Calendar functionality coming soon...</p>
        </div>
      </div>
    </SidebarInset>
  )
}
