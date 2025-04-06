// pages/api/register.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/supabase/supabaseClient";

// Define the request body interface for type safety
interface RegisterRequest {
  email: string;
  password: string;
  role: "OFFICER" | "POLICE_STATION";
  phone?: string;
  badge_number?: string;
  station_id?: string;
  name?: string;
  contact_number?: string;
  address?: string;
  latitude?: number; // For officer/police station location
  longitude?: number; // For officer/police station location
}

export async function POST(req: Request) {
  try {
    const {
      email,
      password,
      role,
      phone,
      badge_number,
      station_id,
      name,
      contact_number,
      address,
      latitude,
      longitude,
    } = await req.json() as RegisterRequest;

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, password, and role are required" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert([{ email, password_hash: hashedPassword, role, phone: contact_number }])
      .select()
      .single();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    if (role === "OFFICER") {
      // Ensure station exists before assigning officer
      const { data: station, error: stationError } = await supabase
        .from("police_stations")
        .select("id")
        .eq("id", station_id)
        .single();

      if (stationError || !station) {
        return NextResponse.json({ error: "Invalid station ID" }, { status: 400 });
      }

      // Validate location data for officer
      if (!latitude || !longitude) {
        return NextResponse.json({ error: "Latitude and longitude are required for officer registration" }, { status: 400 });
      }

      // Create a PostGIS geography point for current_location
      const currentLocation = `SRID=4326;POINT(${longitude} ${latitude})`;

      // Insert into police_officers table with current_location
      const { error: officerError } = await supabase
        .from("police_officers")
        .insert([
          {
            badge_number,
            user_id: user.id,
            station_id,
            current_location: currentLocation,
          },
        ]);

      if (officerError) {
        return NextResponse.json({ error: officerError.message }, { status: 400 });
      }
    } else if (role === "POLICE_STATION") {
      // Validate location data for police station
      if (!latitude || !longitude) {
        return NextResponse.json({ error: "Latitude and longitude are required for police station registration" }, { status: 400 });
      }

      // Create a PostGIS geography point for location
      const location = `SRID=4326;POINT(${longitude} ${latitude})`;

      // Insert into police_stations table with location
      const { error: stationError } = await supabase
        .from("police_stations")
        .insert([
          {
            name,
            contact_number,
            address,
            user_id: user.id,
            location,
          },
        ]);

      if (stationError) {
        return NextResponse.json({ error: stationError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}