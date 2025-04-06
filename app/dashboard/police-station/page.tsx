"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CrimeMap } from "@/components/crime-map";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/supabase/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Station {
  id: string;
  name: string;
  contact_number: string;
  address: string;
  location: any;
}

interface Report {
  id: string;
  crime_type: string;
  description: string;
  priority: "HIGH" | "NORMAL" | "EMERGENCY";
  latitude: number;
  longitude: number;
  created_at: string;
  station_id?: string;
  assigned_officer?: string;
  current_status: string;
}

interface Incident {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  priority?: "HIGH" | "NORMAL" | "EMERGENCY";
}

interface Officer {
  id: string;
  badge_number: string;
  is_available: boolean;
  station_id: string;
}

export default function StationDashboard() {
  const [station, setStation] = useState<Station | null>(null);
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [availableOfficers, setAvailableOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { data: session, status } = useSession();

  useEffect(() => {
    async function fetchStation() {
      if (status !== "authenticated" || !session?.user?.id) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("police_stations")
          .select("id, name, contact_number, address, location")
          .eq("user_id", session.user.id)
          .single();

        if (error) throw new Error(error.message);
        setStation(data);
      } catch (err) {
        console.error("Error fetching station:", err);
        setError("Failed to load station details");
      } finally {
        setLoading(false);
      }
    }

    fetchStation();
  }, [session, status]);

  useEffect(() => {
    async function fetchPendingReports() {
      if (status !== "authenticated") return;

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("crime_reports")
          .select("id, crime_type, description, priority, latitude, longitude, created_at, station_id, assigned_officer, current_status")
          .is("assigned_officer", null)
          .eq("current_status", "active");

        if (error) throw new Error(error.message);
        setPendingReports(data || []);
        console.log("Fetched Pending Reports (Raw):", data);
      } catch (err) {
        console.error("Error fetching pending reports:", err);
        setError("Failed to load pending reports");
      } finally {
        setLoading(false);
      }
    }

    fetchPendingReports();
  }, [status]);

  useEffect(() => {
    async function fetchAvailableOfficers() {
      if (!station?.id) return;

      try {
        const { data, error } = await supabase
          .from("police_officers")
          .select("id, badge_number, is_available, station_id")
          .eq("station_id", station.id)
          .eq("is_available", true);

        if (error) throw error;
        setAvailableOfficers(data || []);
        console.log("Fetched Available Officers:", data);
      } catch (err) {
        console.error("Error fetching available officers:", err);
        setError("Failed to load available officers");
      }
    }

    fetchAvailableOfficers();
  }, [station]);

  const assignOfficer = async (reportId: string, officerId: string) => {
    if (!station?.id) return;

    try {
      const { error: updateError } = await supabase
        .from("crime_reports")
        .update({ assigned_officer: officerId, current_status: "in_progress" })
        .eq("id", reportId);

      if (updateError) throw updateError;

      // Update the local state
      setPendingReports(pendingReports.map(report =>
        report.id === reportId ? { ...report, assigned_officer: officerId, current_status: "in_progress" } : report
      ));
      alert(`Officer assigned to case ${reportId}`);
    } catch (err) {
      console.error("Error assigning officer:", err);
      setError("Failed to assign officer");
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Please sign in to access the station dashboard.</div>;
  }

  if (loading) {
    return <div>Loading station dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const incidents = pendingReports
    .map((report) => ({
      id: report.id,
      latitude: report.latitude || 0,
      longitude: report.longitude || 0,
      title: report.crime_type,
      priority: report.priority,
    }))
    .filter((incident) => incident.latitude && incident.longitude);

  return (
    <div className="flex flex-col w-full h-screen bg-gray-100 dark:bg-gray-900">
      <header className="w-full bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Police Station Dashboard</h1>
            <p className="text-muted-foreground">
              Station: {station?.name || "Unknown"} | Address: {station?.address || "Not available"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search cases..."
              className="p-2 border rounded-md"
            />
            <span className="text-green-500">Online</span>
            <div className="relative">
              <span className="w-3 h-3 bg-gray-300 rounded-full inline-block"></span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full flex-1 p-4">
        <div className="grid gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle>Incident Locations</CardTitle>
              <CardDescription>Map of active incident locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`${isMobile ? "h-[400px]" : "h-[600px]"} w-full`}>
                {incidents.length > 0 ? (
                  <CrimeMap incidents={incidents} />
                ) : (
                  <div className="text-center text-muted-foreground">No incidents to display.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle>Pending Non-Assigned Reports</CardTitle>
              <CardDescription>Reports awaiting officer assignment</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingReports.length === 0 ? (
                <p className="text-muted-foreground">No pending reports available.</p>
              ) : (
                <ScrollArea className={`${isMobile ? "h-[300px]" : "h-[400px]"} pr-4`}>
                  <div className="space-y-4">
                    {pendingReports.map((report) => (
                      <ReportCard
                        key={report.id}
                        report={report}
                        availableOfficers={availableOfficers}
                        onAssign={(officerId) => assignOfficer(report.id, officerId)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface ReportCardProps {
  report: Report;
  availableOfficers: Officer[];
  onAssign: (officerId: string) => void;
}

function ReportCard({ report, availableOfficers, onAssign }: ReportCardProps) {
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(null);

  const priorityDisplay = {
    EMERGENCY: { label: "Emergency", color: "bg-red-600" },
    HIGH: { label: "High Priority", color: "bg-red-500" },
    NORMAL: { label: "Normal", color: "bg-amber-500" },
  };

  const currentPriority = priorityDisplay[report.priority] || { label: "Normal", color: "bg-amber-500" };

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex">
        <div className={`w-1.5 ${currentPriority.color}`} />
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{report.crime_type}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  #{report.id}
                </Badge>
                <Badge className={`text-xs ${currentPriority.color}`}>
                  {currentPriority.label}
                </Badge>
              </div>
              <CardDescription className="mt-1">{report.description}</CardDescription>
            </div>
            <div>
              <Select
                value={selectedOfficerId || undefined}
                onValueChange={setSelectedOfficerId}
                disabled={!!report.assigned_officer || availableOfficers.length === 0}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={availableOfficers.length === 0 ? "No officers available" : "Select Officer"} />
                </SelectTrigger>
                <SelectContent>
                  {availableOfficers.length > 0 ? (
                    availableOfficers.map((officer) => (
                      <SelectItem key={officer.id} value={officer.id}>
                        {officer.badge_number}
                      </SelectItem>
                    ))
                  ) : null}
                </SelectContent>
              </Select>
              <Button
                onClick={() => selectedOfficerId && onAssign(selectedOfficerId)}
                disabled={!selectedOfficerId || !!report.assigned_officer}
                variant="outline"
                className="mt-2 w-full"
              >
                {report.assigned_officer ? "Assigned" : "Assign Officer"}
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Reported: {new Date(report.created_at).toLocaleString()}
          </div>
        </div>
      </div>
    </Card>
  );
}