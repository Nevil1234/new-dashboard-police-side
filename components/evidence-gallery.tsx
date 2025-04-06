"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Image, FileText, Film, Maximize2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useIsMobile } from "@/hooks/use-mobile"

interface EvidenceGalleryProps {
  caseId: string
}

interface Evidence {
  id: number;
  type: "image" | "document" | "video";
  title: string;
  thumbnail: string;
  fullSize: string;
  date: string;
  metadata: Record<string, string>;
}

export function EvidenceGallery({ caseId }: EvidenceGalleryProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)
  const [evidenceItems, setEvidenceItems] = useState<Evidence[]>([
    {
      id: 1,
      type: "image",
      title: "Crime Scene Photo 1",
      thumbnail: "/broken headlight of car image.jpg?height=80&width=80",
      fullSize: "/broken headlight of car image.jpg?height=600&width=800",
      date: "2023-06-15 10:18 AM",
      metadata: {
        location: "Udhana, SUrat",
        device: "Police Camera #4872",
        fileSize: "1.8 MB",
      },
    },
    {
      id: 2,
      type: "document",
      title: "Witness Statement",
      thumbnail: "/thief breaking into house.jpg?height=80&width=80",
      fullSize: "/thief breaking into house.jpg?height=600&width=800",
      date: "2023-06-15 11:45 AM",
      metadata: {
        author: "Jane Doe", 
        pages: "2",
        fileSize: "156 KB",
      },
    },
  ])
  const isMobile = useIsMobile()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handler to trigger file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload-evidence", {
        method: "POST",
        body: formData,
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || "Upload failed")
      }
      // Create a new evidence item with the returned URL
      const newEvidence: Evidence = {
        id: Date.now(),
        type: file.type.startsWith("image") ? "image" : "document",
        title: file.name,
        thumbnail: json.url, // You might use the same file for thumbnail; in a real scenario, generate a thumbnail.
        fullSize: json.url,
        date: new Date().toLocaleString(),
        metadata: {
          fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        },
      }
      setEvidenceItems(prev => [...prev, newEvidence])
    } catch (error: any) {
      console.error("Upload failed", error)
    }
  }

  const handleAddEvidenceClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className={`p-4 ${isMobile ? "h-[200px]" : "h-[300px]"} overflow-y-auto bg-white dark:bg-gray-800 shadow-sm`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-medium">Evidence ({evidenceItems.length})</h4>
        <Button size="sm" variant="outline" className="shadow-sm" onClick={handleAddEvidenceClick}>
          <Upload className="mr-2 h-4 w-4" />
          Add Evidence
        </Button>
        {/* Hidden file input */}
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {evidenceItems.map((item) => (
          <Dialog key={item.id}>
            <DialogTrigger asChild>
              <div
                className="relative group cursor-pointer border rounded-md overflow-hidden shadow-sm"
                onClick={() => setSelectedEvidence(item)}
              >
                <img src={item.thumbnail || "/placeholder.svg"} alt={item.title} className="w-full h-24 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Maximize2 className="h-5 w-5 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                  <div className="flex items-center">
                    {item.type === "image" && <Image className="h-3 w-3 text-white mr-1" />}
                    {item.type === "document" && <FileText className="h-3 w-3 text-white mr-1" />}
                    {item.type === "video" && <Film className="h-3 w-3 text-white mr-1" />}
                    <p className="text-xs text-white truncate">{item.title}</p>
                  </div>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{item.title}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <img src={item.fullSize || "/placeholder.svg"} alt={item.title} className="w-full h-auto rounded-md" />
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{item.date}</span>
                  </div>
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </Card>
  )
}