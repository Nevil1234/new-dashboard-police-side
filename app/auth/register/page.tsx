"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Station {
  id: string;
  name: string;
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "OFFICER",
    phone: "",
    badge_number: "",
    station_id: "",
    name: "",
    contact_number: "",
    address: "",
    latitude: "", // Will be populated for both roles
    longitude: "", // Will be populated for both roles
  });

  const [stations, setStations] = useState<Station[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch available police stations
  useEffect(() => {
    async function fetchStations() {
      try {
        const res = await fetch("/api/stations");
        if (!res.ok) throw new Error("Failed to fetch stations");
        const data: Station[] = await res.json();
        setStations(data);
      } catch (error) {
        console.error("Error fetching stations:", error);
      }
    }
    fetchStations();
  }, []);

  // Fetch live location when role is OFFICER or POLICE_STATION
  useEffect(() => {
    if ((form.role === "OFFICER" || form.role === "POLICE_STATION") && !form.latitude && !form.longitude) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setForm((prev) => ({
              ...prev,
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString(),
            }));
            setLocationError(null);
          },
          (error) => {
            setLocationError("Unable to retrieve live location. Please enter manually.");
            console.error("Geolocation error:", error);
          }
        );
      } else {
        setLocationError("Geolocation is not supported by this browser. Please enter manually.");
      }
    }
  }, [form.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate latitude and longitude for both roles
    const lat = parseFloat(form.latitude);
    const lon = parseFloat(form.longitude);
    if (!form.latitude || !form.longitude || isNaN(lat) || isNaN(lon)) {
      setLocationError("Please provide valid latitude and longitude.");
      return;
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setLocationError("Latitude must be between -90 and 90, longitude between -180 and 180.");
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        router.push("/auth/login");
      } else {
        const errorData = await response.json();
        setLocationError(errorData.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setLocationError("An unexpected error occurred during registration");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4">
      <div>
        <input
          name="email"
          type="email"
          onChange={handleChange}
          value={form.email}
          placeholder="Email"
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <input
          name="password"
          type="password"
          onChange={handleChange}
          value={form.password}
          placeholder="Password"
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <select
          name="role"
          onChange={handleChange}
          value={form.role}
          className="w-full p-2 border rounded"
        >
          <option value="OFFICER">Police Officer</option>
          <option value="POLICE_STATION">Police Station</option>
        </select>
      </div>

      {form.role === "OFFICER" && (
        <>
          <div>
            <input
              name="phone"
              onChange={handleChange}
              value={form.phone}
              placeholder="Phone"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <input
              name="badge_number"
              onChange={handleChange}
              value={form.badge_number}
              placeholder="Badge Number"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <select
              name="station_id"
              onChange={handleChange}
              value={form.station_id}
              required
              className="w-full p-2 border rounded"
            >
              <option value="">Select Police Station</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p>
              Current Location: {form.latitude && form.longitude
                ? `${form.latitude}, ${form.longitude}`
                : "Fetching..."}
            </p>
            {locationError && <p className="text-red-500 text-sm mt-1">{locationError}</p>}
            <button
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setForm((prev) => ({
                        ...prev,
                        latitude: position.coords.latitude.toString(),
                        longitude: position.coords.longitude.toString(),
                      }));
                      setLocationError(null);
                    },
                    (error) => {
                      setLocationError("Unable to retrieve live location. Please enter manually.");
                      console.error("Geolocation error:", error);
                    }
                  );
                } else {
                  setLocationError("Geolocation is not supported by this browser.");
                }
              }}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
            >
              Refresh Live Location
            </button>
          </div>
          <div>
            <input
              name="latitude"
              type="number"
              step="any"
              onChange={handleChange}
              value={form.latitude}
              placeholder="Latitude"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <input
              name="longitude"
              type="number"
              step="any"
              onChange={handleChange}
              value={form.longitude}
              placeholder="Longitude"
              required
              className="w-full p-2 border rounded"
            />
          </div>
        </>
      )}

      {form.role === "POLICE_STATION" && (
        <>
          <div>
            <input
              name="name"
              onChange={handleChange}
              value={form.name}
              placeholder="Station Name"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <input
              name="contact_number"
              onChange={handleChange}
              value={form.contact_number}
              placeholder="Contact Number"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <input
              name="address"
              onChange={handleChange}
              value={form.address}
              placeholder="Address"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <p>
              Current Location: {form.latitude && form.longitude
                ? `${form.latitude}, ${form.longitude}`
                : "Fetching..."}
            </p>
            {locationError && <p className="text-red-500 text-sm mt-1">{locationError}</p>}
            <button
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setForm((prev) => ({
                        ...prev,
                        latitude: position.coords.latitude.toString(),
                        longitude: position.coords.longitude.toString(),
                      }));
                      setLocationError(null);
                    },
                    (error) => {
                      setLocationError("Unable to retrieve live location. Please enter manually.");
                      console.error("Geolocation error:", error);
                    }
                  );
                } else {
                  setLocationError("Geolocation is not supported by this browser.");
                }
              }}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
            >
              Refresh Live Location
            </button>
          </div>
          <div>
            <input
              name="latitude"
              type="number"
              step="any"
              onChange={handleChange}
              value={form.latitude}
              placeholder="Latitude"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <input
              name="longitude"
              type="number"
              step="any"
              onChange={handleChange}
              value={form.longitude}
              placeholder="Longitude"
              required
              className="w-full p-2 border rounded"
            />
          </div>
        </>
      )}
      <button
        type="submit"
        className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Register
      </button>
      {locationError && <p className="text-red-500 text-sm mt-1">{locationError}</p>}
    </form>
  );
}