import { NextResponse } from "next/server";

import { supabase } from "@/supabase/supabaseClient";


export async function GET() {
  const { data: stations, error } = await supabase
    .from("police_stations")
    .select("id, name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(stations, { status: 200 });
}
