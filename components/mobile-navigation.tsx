"use client"

import { LayoutDashboard, FileText, MessageSquare, Map, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MobileNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function MobileNavigation({ activeTab, setActiveTab }: MobileNavigationProps) {
  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "cases",
      label: "Cases",
      icon: FileText,
      badge: {
        count: 12,
        color: "bg-red-500",
      },
    },
    {
      id: "communications",
      label: "Messages",
      icon: MessageSquare,
      badge: {
        count: 5,
        color: "bg-amber-500",
      },
    },
    {
      id: "map",
      label: "Map",
      icon: Map,
      badge: null,
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around px-2 shadow-lg z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full relative",
            activeTab === tab.id ? "text-primary" : "text-gray-500 dark:text-gray-400",
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          <tab.icon
            className={cn("h-5 w-5 mb-1", activeTab === tab.id ? "text-primary" : "text-gray-500 dark:text-gray-400")}
          />
          <span className="text-[10px] font-medium">{tab.label}</span>

          {tab.badge && (
            <Badge
              className={cn(
                "absolute -top-1 right-1/4 h-4 min-w-4 text-[10px] flex items-center justify-center p-0 px-1",
                tab.badge.color,
              )}
            >
              {tab.badge.count}
            </Badge>
          )}
        </button>
      ))}
    </div>
  )
}

