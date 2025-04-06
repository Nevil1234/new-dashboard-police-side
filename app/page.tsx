"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {DashboardView }from "../components/dashboard-view"; // Import your DashboardView component

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      // Do nothing while loading
      return;
    }

    if (!session) {
      // Redirect to login if not authenticated
      router.push("/auth/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <p>Loading...</p>; // Show a loading state while checking the session
  }

  if (!session) {
    return null; // Prevent rendering anything while redirecting
  }

  // Render the DashboardView component if the user is authenticated
  console.log("Session Details:", session); // Debugging line to check session data
  return <DashboardView />;
}

