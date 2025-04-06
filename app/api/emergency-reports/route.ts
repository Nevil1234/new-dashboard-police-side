import { NextRequest, NextResponse } from "next/server";


// Initialize Supabase client (replace with your actual Supabase URL and anon key)
import { supabase } from "@/supabase/supabaseClient";

export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const officerId = searchParams.get("officerId");

//   if (!officerId) {
//     return NextResponse.json({ error: "Officer ID is required" }, { status: 400 });
//   }

  try {
    const { data, error } = await supabase
      .from("crime_reports")
      .select("*")
      .eq("priority", "EMERGENCY")
      .is("assigned_officer", null);

    if (error) throw error;

    return NextResponse.json(data || [], { status: 200 });
  } catch (err) {
    console.error("Supabase error:", err);
    return NextResponse.json({ error: "Failed to fetch emergency reports" }, { status: 500 });
  }
}