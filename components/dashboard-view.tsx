"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Clock,
  FileText,
  Filter,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Upload,
  User2,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CaseTimeline } from "../components/case-timeline";
import { EvidenceGallery } from "../components/evidence-gallery";
import CrimeMap from "../components/crime-map";
import { PoliceCommunicationHub } from "../components/PoliceCommunicationHub";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/components/ui/use-toast";
import Heatmap from '../components/heatmap';
// Define the Officer type
interface Officer {
  id: string;
  badge_number: string;
  current_location: any;
  active_cases: number;
  max_cases: number;
  is_available: boolean;
  user_id: string;
  station_id: string;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    email: string;
    role: string;
    phone: string;
    created_at: string;
    updated_at: string;
  };
}

// Define the Report type based on the crime_reports table schema
interface Report {
  id: string;
  crime_type: string;
  description: string;
  priority: "HIGH" | "NORMAL" | "EMERGENCY";
  status: string;
  complainant_id: string;
  officer_id: string;
  station_id: string;
  created_at: string;
  updated_at: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  media: string[];
  assigned_officer: string | null;
  current_status: string;
  latitude: number;
  longitude: number;
}

export function DashboardView() {
  const [activeTab, setActiveTab] = useState("overview");
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [reports, setReports] = useState<Report[]>([]); // All assigned reports
  const [emergencyReports, setEmergencyReports] = useState<Report[]>([]); // Emergency reports
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [reportsLoading, setReportsLoading] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [assigningCase, setAssigningCase] = useState<string | null>(null);
  const [recentlyAssigned, setRecentlyAssigned] = useState<string[]>([]);

  // Fetch officer details using the API
  useEffect(() => {
    async function fetchOfficer() {
      if (status !== "authenticated" || !session?.user?.id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/officer");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch officer details");
        }

        setOfficer(data);
      } catch (err) {
        console.error("Error fetching officer details:", err);
        setError("An error occurred while fetching officer details");
      } finally {
        setLoading(false);
      }
    }

    fetchOfficer();
  }, [session, status]);

  // Fetch crime reports for the officer (all assigned reports)
  useEffect(() => {
    async function fetchReports() {
      if (!officer?.id) return;

      setReportsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/reports/${officer.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch crime reports");
        }

        const reportsData = Array.isArray(data) ? data : [];
        setReports(reportsData);
      } catch (err) {
        console.error("Error fetching crime reports:", err);
        setError("An error occurred while fetching crime reports");
        setReports([]); // Reset to empty array on error
      } finally {
        setReportsLoading(false);
      }
    }

    fetchReports();
  }, [officer]);

  // Fetch emergency reports (unassigned emergencies)
  const fetchEmergencyReports = async () => {
    if (!officer?.id) return;

    setReportsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/emergency-reports`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Emergency reports data:", data); // Debug log
      const emergencyData = Array.isArray(data) ? data : [];
      setEmergencyReports(emergencyData);
    } catch (err) {
      console.error("Error fetching emergency reports:", err);
      setError(`An error occurred while fetching emergency reports:`);
      setEmergencyReports([]); // Reset to empty array on error
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyReports();
  }, [officer]); // Only depend on officer for initial fetch

  // In your DashboardView component
  const assignCase = async (reportId: string) => {
    if (!officer?.id) return;

    setAssigningCase(reportId); // Mark this case as being assigned (for UI feedback)

    try {
      const response = await fetch(`/api/assign-case`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, officerId: officer.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to assign case");
      }

      // Add to recently assigned list
      setRecentlyAssigned(prev => [...prev, reportId]);
      
      // Remove from recently assigned after 5 seconds
      setTimeout(() => {
        setRecentlyAssigned(prev => prev.filter(id => id !== reportId));
      }, 5000);

      // Show success notification
      toast({
        title: "Case assigned successfully",
        description: "The case has been added to your active cases.",
      });

      // Switch to overview tab to show the new assignment
      setActiveTab("overview");

      // Refresh both lists
      await Promise.all([
        fetchReports(),
        fetchEmergencyReports()
      ]);

    } catch (err) {
      console.error("Error assigning case:", err);
      setError(err.message || "An error occurred while assigning the case");

      // Show error notification
      toast({
        variant: "destructive",
        title: "Assignment failed",
        description: err.message || "Could not assign the case. Please try again.",
      });
    } finally {
      setAssigningCase(null); // Clear assignment loading state
    }
  };

  // Update fetchReports to include assigned cases
  const fetchReports = async () => {
    if (!officer?.id) return;

    setReportsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${officer.id}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to fetch crime reports");

      setReports(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Error fetching crime reports:", err);
      setError("An error occurred while fetching crime reports");
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-16 md:pb-0">
      {/* Emergency Reports at the Top */}

      {emergencyReports.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-md mb-4">
          <h2 className="text-lg font-semibold mb-2">Urgent Emergency Reports</h2>
          <ScrollArea className="h-[200px] pr-4">
            {emergencyReports.map((report) => (
              <Card key={report.id} className="mb-2 bg-white shadow-sm">
                <CardHeader className="p-2">
                  <CardTitle className="text-sm">{report.crime_type}</CardTitle>
                </CardHeader>
                <CardContent className="p-2 text-sm">
                  <p>{report.description}</p>
                  <p>Location: {report.latitude}, {report.longitude}</p>
                  <p>Reported: {new Date(report.created_at).toLocaleString()}</p>
                </CardContent>
                <CardFooter className="p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={assigningCase === report.id}
                    onClick={() => assignCase(report.id)}
                  >
                    {assigningCase === report.id ? "Assigning..." : "Assign to Me"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </ScrollArea>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Officer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, Officer {officer?.users?.email || "Unknown"}. You have{" "}
            <span className="font-medium text-red-500">{reports.length || 0} active cases</span>
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full md:w-auto flex overflow-x-auto md:inline-flex p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <TabsTrigger value="overview" className="flex-1 md:flex-none rounded-md">
            Overview
          </TabsTrigger>
          <TabsTrigger value="cases" className="flex-1 md:flex-none rounded-md">
            Cases
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex-1 md:flex-none rounded-md">
            Communications
          </TabsTrigger>
          <TabsTrigger value="map" className="flex-1 md:flex-none rounded-md">
            Map
          </TabsTrigger>
          <TabsTrigger value="Heatmap" className="flex-1 md:flex-none rounded-md">
            Heatmap
          </TabsTrigger>

        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reports.length || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgent Cases</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reports.length > 0
                    ? reports.filter((report) => report.priority === "HIGH" || report.priority === "EMERGENCY").length
                    : 0}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4 bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Active Cases</CardTitle>
                  <CardDescription>Your currently assigned cases</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="md:hidden">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div>Loading cases...</div>
                ) : !Array.isArray(reports) || reports.length === 0 ? (
                  <div>No active cases found.</div>
                ) : (
                  <ScrollArea className={`${isMobile ? "h-[300px]" : "h-[400px]"} pr-4`}>
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <CaseCard
                          key={report.id}
                          id={report.id}
                          title={report.crime_type}
                          description={report.description}
                          priority={report.priority}
                          location={
                            report.latitude && report.longitude
                              ? `${report.latitude}, ${report.longitude}`
                              : "Unknown location"
                          }
                          time={new Date(report.created_at).toLocaleString()}
                          officer={officer?.users?.email || "Unknown"}
                          isNewlyAssigned={recentlyAssigned.includes(report.id)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Cases
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cases">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Case Management</CardTitle>
                  <CardDescription>View and manage your assigned cases</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button className="shadow-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Case
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active">
                <TabsList className="mb-4 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                  <TabsTrigger value="active" className="rounded-md">
                    Active ({reports.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="rounded-md">
                    Pending (3)
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="rounded-md">
                    Closed (24)
                    </TabsTrigger>
                  </TabsList>
                <TabsContent value="active">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="hidden md:flex">
                          <Filter className="mr-2 h-4 w-4" />
                          Filter
                        </Button>
                        <Button variant="outline" size="sm" className="md:hidden">
                          <Filter className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="hidden md:flex">
                          Sort by: Recent
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Showing {reports.length || 0} of {reports.length || 0} cases
                      </div>
                    </div>

                    <div className="space-y-4">
                      {reportsLoading ? (
                        <div>Loading cases...</div>
                      ) : !Array.isArray(reports) || reports.length === 0 ? (
                        <div>No active cases found.</div>
                      ) : (
                        reports.map((report) => (
                          <CaseCard
                            key={report.id}
                            id={report.id}
                            title={report.crime_type}
                            description={report.description}
                            priority={report.priority}
                            location={
                              report.latitude && report.longitude
                                ? `${report.latitude}, ${report.longitude}`
                                : "Unknown location"
                            }
                            time={new Date(report.created_at).toLocaleString()}
                            officer={officer?.users?.email || "Unknown"}
                            expanded={report.id === reports[0]?.id} // Expand the first report by default
                            isNewlyAssigned={recentlyAssigned.includes(report.id)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <PoliceCommunicationHub />
        </TabsContent>

        <TabsContent value="map">
          <CrimeMap />
        </TabsContent>
        <TabsContent value="Heatmap">
  <Card className="bg-white dark:bg-gray-800 shadow-sm">
    <CardHeader>
      <CardTitle>Crime Heatmap</CardTitle>
      <CardDescription>
        Visual representation of crime density across the city
      </CardDescription>
    </CardHeader>
    <CardContent className="p-0">
      <div className="h-[600px] w-full rounded-md overflow-hidden">
        <Heatmap />
      </div>
    </CardContent>
    <CardFooter className="text-sm text-muted-foreground">
      Real-time heatmap data updated every 5 minutes
    </CardFooter>
  </Card>
</TabsContent>


      </Tabs>
    </div>
  );
}

interface CaseCardProps {
  id: string;
  title: string;
  description: string;
  priority: "HIGH" | "NORMAL" | "EMERGENCY";
  location: string;
  time: string;
  officer: string;
  expanded?: boolean;
  isNewlyAssigned?: boolean;
}


function CaseCard({ id, title, description, priority, location, time, officer, expanded = false, isNewlyAssigned = false }: CaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const isMobile = useIsMobile();

  // Map priority to display values and colors
  const priorityDisplay = {
    EMERGENCY: { label: "Emergency", color: "bg-red-600" },
    HIGH: { label: "High Priority", color: "bg-red-500" },
    NORMAL: { label: "Normal", color: "bg-amber-500" },
  };

  const currentPriority = priorityDisplay[priority] || { label: "Normal", color: "bg-amber-500" };

  return (
    <Card className={`overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${
      isNewlyAssigned ? 'ring-2 ring-blue-500 animate-pulse' : ''
    }`}>
      <div className="flex">
        <div className={`w-1.5 ${currentPriority.color}`} />
        <div className="flex-1">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base">{title}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    #{id}
                  </Badge>
                  <Badge className={`text-xs ${currentPriority.color}`}>
                    {currentPriority.label}
                  </Badge>
                </div>
                <CardDescription className="mt-1">{description}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Message</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Add Evidence</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <X className="mr-2 h-4 w-4" />
                    <span>Close Case</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex flex-wrap gap-y-2 text-sm">
              <div className="flex items-center mr-4">
                <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{location}</span>
              </div>
              <div className="flex items-center mr-4">
                <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{time}</span>
              </div>
              <div className="flex items-center">
                <User2 className="mr-1 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{officer}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            <div className="flex items-center space-x-2">
              {priority === "EMERGENCY" ? (
                <Button variant="destructive" size="sm" className="px-3">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Urgent Response
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="px-3">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="px-3">
                    <Upload className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </CardFooter>

          {isExpanded && (
            <div className="px-6 pb-6">
              <Separator className="my-4" />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium mb-2">Case Timeline</h4>
                  <CaseTimeline caseId={id} />
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Evidence Gallery</h4>
                  <EvidenceGallery caseId={id} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

interface AlertCardProps {
  title: string;
  description: string;
  time: string;
  type: "urgent" | "evidence" | "update" | "message" | "notification" | "system";
}

function AlertCard({ title, description, time, type }: AlertCardProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${type === "urgent"
                  ? "bg-red-500"
                  : type === "evidence"
                    ? "bg-blue-500"
                    : type === "update"
                      ? "bg-amber-500"
                      : type === "message"
                        ? "bg-green-500"
                        : type === "notification"
                          ? "bg-purple-500"
                          : "bg-gray-500"
                }`}
            />
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-2">{time}</p>
      </CardContent>
    </Card>
  );
}

export default DashboardView;