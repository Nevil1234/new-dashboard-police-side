"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Bell,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Map,
  BarChart3,
  Settings,
  LogOut,
  User,
  Search,
  AlertTriangle,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileNavigation } from "@/components/mobile-navigation"

export function OfficerDashboard({ children }: { children: React.ReactNode }) {
  const [emergencyMode, setEmergencyMode] = useState(false)
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState("dashboard")

  const toggleEmergencyMode = () => {
    setEmergencyMode(!emergencyMode)

    if (!emergencyMode) {
      toast({
        variant: "destructive",
        title: "Emergency Mode Activated",
        description: "Dispatch has been notified of your status.",
      })
    } else {
      toast({
        title: "Emergency Mode Deactivated",
        description: "Your status has been updated.",
      })
    }
  }

  // Update active tab based on URL path
  useEffect(() => {
    const path = window.location.pathname
    if (path.includes("cases")) setActiveTab("cases")
    else if (path.includes("communications")) setActiveTab("communications")
    else if (path.includes("map")) setActiveTab("map")
    else if (path.includes("analytics")) setActiveTab("analytics")
    else if (path.includes("settings")) setActiveTab("settings")
    else setActiveTab("dashboard")
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {!isMobile && (
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader className="flex flex-col items-center justify-center p-4">
            <div className="flex items-center justify-center w-full">
              <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                <AvatarImage src="/placeholder.svg?height=56&width=56" alt="Officer" />
                <AvatarFallback>PD</AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm font-medium text-white">Officer J. Smith</p>
              <p className="text-xs text-white/70">Badge #4872</p>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {/* <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton  tooltip="Dashboard"
                  isActive={activeTab === "overview"}
                  onClick={() => setActiveTab("overview")}>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Cases"
                  isActive={activeTab === "cases"}
                  onClick={() => setActiveTab("cases")}>
                  <FileText />
                  <span>Cases</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem >
                <SidebarMenuButton tooltip="Communications"
                  isActive={activeTab === "communications"}
                  onClick={() => setActiveTab("communications")}>
                  <MessageSquare />
                  <span>Communications</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Map" isActive={activeTab === "map"} onClick={() => setActiveTab("map")}>
                  <Map />
                  <span>Map</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu> */}
          </SidebarContent>
          <SidebarFooter className="p-4">
           
          </SidebarFooter>
        </Sidebar>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-16 border-b bg-white dark:bg-gray-800 flex items-center justify-between px-4 md:px-6 shadow-sm">
          <div className="flex items-center">
            {!isMobile ? (
              <SidebarTrigger className="mr-4" />
            ) : (
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="relative w-64 hidden md:block">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases..."
                className="pl-8 h-9 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></div>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>

            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center shadow-sm">
                    8
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  <NotificationItem
                    title="New Case Assigned"
                    description="Theft report #2023-0456 has been assigned to you"
                    time="2 min ago"
                    priority="urgent"
                  />
                  <NotificationItem
                    title="Evidence Uploaded"
                    description="New evidence for case #2023-0442 has been uploaded"
                    time="15 min ago"
                    priority="normal"
                  />
                  <NotificationItem
                    title="Message from Dispatch"
                    description="Please call back to station when available"
                    time="1 hour ago"
                    priority="normal"
                  />
                  <NotificationItem
                    title="Case Update"
                    description="Witness statement added to case #2023-0438"
                    time="3 hours ago"
                    priority="normal"
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu> */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Officer" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">{children}</main>

        {isMobile && <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}
      </div>
    </div>
  )
}

interface NotificationItemProps {
  title: string
  description: string
  time: string
  priority: "urgent" | "normal"
}

function NotificationItem({ title, description, time, priority }: NotificationItemProps) {
  return (
    <DropdownMenuItem className="flex flex-col items-start p-3 focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer">
      <div className="flex items-start w-full">
        <div className={`h-2 w-2 rounded-full mt-1.5 mr-2 ${priority === "urgent" ? "bg-red-500" : "bg-blue-500"}`} />
        <div className="flex-1">
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
          <p className="text-xs text-muted-foreground mt-1">{time}</p>
        </div>
      </div>
    </DropdownMenuItem>
  )
}

