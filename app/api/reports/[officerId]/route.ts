import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { supabase } from "@/supabase/supabaseClient";

// Define the Report type based on the crime_reports table schema
interface Report {
  id: string;
  crime_type: string;
  description: string;
  priority: "urgent" | "investigation" | "resolved";
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
  assigned_officer: string;
  current_status: string;
  latitude: number;
  longitude: number;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ officerId: string }> } // Use context with params as a Promise
) {
  // Await the params to get the officerId
  const { officerId } = await context.params;

  // Get the session to ensure the user is authenticated
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure the officerId matches the logged-in user's ID (for security)
//   if (officerId !== session.user.id) {
//     return NextResponse.json(
//       { error: "Forbidden: You can only access your own reports" },
//       { status: 403 }
//     );
//   }

  try {
    const { data: reports, error } = await supabase
      .from("crime_reports")
      .select(
        `
        id,
        crime_type,
        description,
        priority,
        status,
        complainant_id,
        officer_id,
        station_id,
        created_at,
        updated_at,
        location,
        media,
        assigned_officer,
        current_status,
        latitude,
        longitude
      `
      )
      .eq("assigned_officer", officerId)
      

    if (error) {
      console.error("Error fetching crime reports:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch crime reports" },
        { status: 500 }
      );
    }

    if (!reports || reports.length === 0) {
      return NextResponse.json(
        { message: "No active reports found for this officer" },
        { status: 200 }
      );
    }

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Unexpected error fetching crime reports:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}