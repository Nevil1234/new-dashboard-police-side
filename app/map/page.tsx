// app/map/page.tsx
'use client'

import { Suspense } from 'react'
import CrimeMap from '@/components/crime-map'
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function MapPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b p-4 flex items-center shadow-sm">
        <Link href="/" className="mr-4">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Crime Map</h1>
      </header>

      {/* Main Map Content */}
      <main className="flex-1 relative">
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        }>
          <div className="h-full w-full">
            <CrimeMap />
          </div>
        </Suspense>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/80 dark:bg-gray-900/80 p-3 rounded-lg shadow-md text-sm">
          <div className="flex items-center mb-2">
            <div className="h-3 w-3 bg-red-500 rounded-full mr-2" />
            <span>Theft</span>
          </div>
          <div className="flex items-center mb-2">
            <div className="h-3 w-3 bg-purple-500 rounded-full mr-2" />
            <span>Assault</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 bg-yellow-500 rounded-full mr-2" />
            <span>Other Incidents</span>
          </div>
        </div>
      </main>
    </div>
  )
}