from flask import Flask, jsonify
from supabase import create_client
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get Supabase credentials from environment variables
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

app = Flask(__name__)
CORS(app)  # Enable CORS

@app.route('/locations', methods=['GET'])
def get_locations():
    response = supabase.table("crime_reports").select("latitude, longitude, crime_type").execute()
    data = [
        {
            "lat": row.get('latitude'),
            "lng": row.get('longitude'),
            "type": row.get('crime_type')
        }
        for row in response.data
        if row.get('latitude') and row.get('longitude') and row.get('crime_type')
    ]
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)