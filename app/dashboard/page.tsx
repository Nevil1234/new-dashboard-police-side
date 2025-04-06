"use client";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/login");
    return null; // Ensure no further code is executed
  }

  // Redirect based on user role
  switch (session.user?.role) {
    case "OFFICER":
      redirect("/dashboard/police-officer");
      break;
    case "POLICE_STATION":
      redirect("/dashboard/police-station");
      break;
    default:
      redirect("/auth/login"); // Fallback for unknown roles
  }

  return null; // Ensure no further rendering happens
}
