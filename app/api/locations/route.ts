import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('crime_reports')
      .select('latitude, longitude, crime_type')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) throw error;

    const locations = data.map(report => ({
      lat: report.latitude,
      lng: report.longitude,
      type: report.crime_type
    }));

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}