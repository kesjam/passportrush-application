"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Download, Calendar, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Photo {
  id: string
  mode: string
  createdAt: string
  proofUrl?: string
}

export default function PhotosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    } else if (status === "authenticated") {
      fetchPhotos()
    }
  }, [status])

  const fetchPhotos = async () => {
    try {
      const response = await fetch("/api/account/photos")
      const data = await response.json()

      if (response.ok) {
        setPhotos(data.photos || [])
      }
    } catch (error) {
      console.error("Failed to fetch photos:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-background">
          <div className="container flex h-16 items-center">
            <Link href="/" className="flex items-center gap-2">
              <Camera className="h-6 w-6" />
              <span className="text-xl font-bold">PassportRush</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            <span className="text-xl font-bold">PassportRush</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session?.user?.email}
            </span>
            <Button asChild variant="outline" size="sm">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Photos</h1>
              <p className="text-muted-foreground">
                All your purchased passport photos in one place
              </p>
            </div>
            <Button asChild variant="premium">
              <Link href="/start">Create New Photo</Link>
            </Button>
          </div>

          {photos.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No photos yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first passport photo to get started
                </p>
                <Button asChild variant="premium">
                  <Link href="/start">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {photo.proofUrl ? (
                      <img
                        src={photo.proofUrl}
                        alt="Passport photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {photo.mode === "PRINT_MAIL" ? "Print & Mail" : "Online Renewal"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(photo.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full" variant="outline">
                      <Link href={`/download/${photo.id}`}>
                        <Download className="h-4 w-4" />
                        Download
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
