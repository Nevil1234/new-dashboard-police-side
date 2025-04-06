import type { Metadata } from "next";
import type React from "react";

import CustomSessionProvider from "@/components/providers/session-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { OfficerDashboard } from "@/components/officer-dashboard";

export const metadata: Metadata = {
  title: "Police Officer Dashboard",
  description: "Dashboard for Police Officers",
};

export default function PoliceOfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <CustomSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <SidebarProvider>
              <OfficerDashboard>{children}</OfficerDashboard>
              <Toaster />
            </SidebarProvider>
          </ThemeProvider>
        </CustomSessionProvider>
  );
}