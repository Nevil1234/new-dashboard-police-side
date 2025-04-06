import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { supabase } from "@/supabase/supabaseClient"; // Adjust the path if needed

// Define the Officer type (you can move this to a shared types file)
interface Officer {
  id: string;
  badge_number: string;
  current_location: any; // Adjust based on your geography type
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

export async function GET(req: NextRequest) {
  // Get the session to ensure the user is authenticated
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch officer details directly using Supabase
  try {
    const { data: officer, error } = await supabase
      .from("police_officers")
      .select(`
        id,
        badge_number,
        current_location,
        active_cases,
        max_cases,
        is_available,
        user_id,
        station_id,
        created_at,
        updated_at,
        users (
          id,
          email,
          role,
          phone,
          created_at,
          updated_at
        )
      `)
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching officer details:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch officer details" },
        { status: 500 }
      );
    }

    if (!officer) {
      return NextResponse.json(
        { error: "Officer details not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(officer);
  } catch (error) {
    console.error("Unexpected error fetching officer details:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}