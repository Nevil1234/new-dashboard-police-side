"use client"

import { Card } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile"

interface CaseTimelineProps {
  caseId: string
}

export function CaseTimeline({ caseId }: CaseTimelineProps) {
  const isMobile = useIsMobile()

  // This would normally fetch data based on the caseId
  const timelineEvents = [
    {
      id: 1,
      title: "Case Created",
      description: "Case was created and assigned",
      time: "2025-04-06 05:35 AM",
      user: "Dispatch",
    },
    {
      id: 2,
      title: "Officer Assigned",
      description: "Officer J. Smith assigned to case",
      time: "2025-04-06 05:50 AM",
      user: "System",
    },
    {
      id: 3,
      title: "Initial Report Filed",
      description: "Initial report details documented",
      time: "2025-04-06 06:05 AM",
      user: "Officer J. Smith",
    },
    {
      id: 4,
      title: "Evidence Collected",
      description: "Photos and statements collected at scene",
      time: "2025-04-06 6:15 AM",
      user: "Officer J. Smith",
    },
    {
      id: 5,
      title: "Witness Statement Added",
      description: "Statement from Jane Doe added to case",
      time: "2025-04-06 6:26 AM",
      user: "Officer J. Smith",
    },
  ]

  return (
    <Card className={`p-4 ${isMobile ? "h-[200px]" : "h-[300px]"} overflow-y-auto bg-white dark:bg-gray-800 shadow-sm`}>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-4">
          {timelineEvents.map((event) => (
            <div key={event.id} className="relative pl-8">
              <div className="absolute left-2 top-1 h-4 w-4 rounded-full bg-primary border-2 border-white dark:border-gray-900" />
              <div>
                <h4 className="text-sm font-medium">{event.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">{event.time}</p>
                  <p className="text-xs text-muted-foreground">•</p>
                  <p className="text-xs text-muted-foreground">{event.user}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

