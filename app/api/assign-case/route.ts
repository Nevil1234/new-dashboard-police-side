import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabase/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const { reportId, officerId } = await request.json();

    // Validate UUIDs
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!reportId || !uuidRegex.test(reportId)) {
      return NextResponse.json({ error: "Invalid or missing report ID" }, { status: 400 });
    }
    if (!officerId || !uuidRegex.test(officerId)) {
      return NextResponse.json({ error: "Invalid or missing officer ID" }, { status: 400 });
    }

    // Get officer's current capacity
    const { data: officerData, error: officerError } = await supabase
      .from('police_officers')
      .select('active_cases, max_cases')
      .eq('id', officerId)
      .single();

    if (officerError) throw officerError;
    if (!officerData) return NextResponse.json({ error: "Officer not found" }, { status: 404 });

    // Check capacity
    if (officerData.active_cases >= officerData.max_cases) {
      return NextResponse.json({ error: "Officer at maximum case capacity" }, { status: 400 });
    }

    // Begin by updating the crime report
    const { error: updateReportError } = await supabase
      .from('crime_reports')
      .update({ 
        assigned_officer: officerId,
        current_status: 'in_progress' 
      })
      .eq('id', reportId);
      
    if (updateReportError) throw updateReportError;

    // Then update the officer's active cases count
    const { error: updateOfficerError } = await supabase
      .from('police_officers')
      .update({ active_cases: officerData.active_cases + 1 })
      .eq('id', officerId);
      
    if (updateOfficerError) throw updateOfficerError;

    return NextResponse.json({ message: "Case assigned successfully" }, { status: 200 });

  } catch (err) {
    console.error("Error assigning case:", err);
    return NextResponse.json({ error: err.message || "Failed to assign case" }, { status: 500 });
  }
}