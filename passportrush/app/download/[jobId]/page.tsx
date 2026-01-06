"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Download, Check, Loader2, FileImage } from "lucide-react"

interface Asset {
  id: string
  assetType: string
  mimeType: string
}

interface JobData {
  id: string
  mode: string
  assets: Asset[]
  hasEntitlement: boolean
}

export default function DownloadPage() {
  const params = useParams()
  const { data: session, status } = useSession()
  const jobId = params.jobId as string

  const [job, setJob] = useState<JobData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingAssets, setDownloadingAssets] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === "authenticated") {
      fetchJobData()
    } else if (status === "unauthenticated") {
      setError("Please sign in to download your photos")
      setLoading(false)
    }
  }, [status, jobId])

  const fetchJobData = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch job data")
      }

      // Fetch entitlement and assets
      const assetsResponse = await fetch(`/api/jobs/${jobId}/assets`)
      const assetsData = await assetsResponse.json()

      if (assetsResponse.ok) {
        setJob({
          id: data.id,
          mode: data.mode,
          assets: assetsData.assets || [],
          hasEntitlement: assetsData.hasEntitlement || false,
        })
      } else {
        setJob({
          id: data.id,
          mode: data.mode,
          assets: [],
          hasEntitlement: false,
        })
      }

      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleDownload = async (assetId: string, assetType: string) => {
    setDownloadingAssets((prev) => new Set(prev).add(assetId))

    try {
      const response = await fetch(`/api/assets/${assetId}/download`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Download failed")
      }

      // Create a temporary link and trigger download
      const link = document.createElement("a")
      link.href = data.url
      link.download = data.filename
      link.click()
    } catch (err: any) {
      alert(err.message || "Download failed")
    } finally {
      setDownloadingAssets((prev) => {
        const next = new Set(prev)
        next.delete(assetId)
        return next
      })
    }
  }

  const getAssetTitle = (assetType: string) => {
    switch (assetType) {
      case "FINAL_2X2":
        return "2×2 Passport Photo"
      case "FINAL_4UP":
        return "4-up Print Sheet"
      case "FINAL_ONLINE":
        return "Digital Upload File"
      default:
        return assetType
    }
  }

  const getAssetDescription = (assetType: string) => {
    switch (assetType) {
      case "FINAL_2X2":
        return "Standard 2×2 inch passport photo"
      case "FINAL_4UP":
        return "Four photos on a 4×6 sheet for printing"
      case "FINAL_ONLINE":
        return "Optimized for online passport renewal"
      default:
        return ""
    }
  }

  if (loading) {
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

  if (error || !job) {
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
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Unable to Load Downloads</CardTitle>
              <CardDescription>{error || "Job not found"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!job.hasEntitlement) {
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
        <main className="flex-1 container py-12">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Payment Required</CardTitle>
                <CardDescription>
                  You need to complete payment before downloading these files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  It looks like you haven't completed the purchase for this photo yet.
                </p>
                <Button asChild>
                  <Link href={`/proof/${jobId}`}>Complete Purchase</Link>
                </Button>
              </CardContent>
            </Card>
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
          <Button asChild variant="outline">
            <Link href="/account/photos">My Photos</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="mb-12 text-center space-y-4 animate-slide-up">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold">Your Photos Are Ready!</h1>
            <p className="text-lg text-muted-foreground">
              Download your passport photos below. You can re-download them anytime from your account.
            </p>
          </div>

          {/* Download Cards */}
          <div className="space-y-4">
            {job.assets.map((asset) => (
              <Card key={asset.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileImage className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {getAssetTitle(asset.assetType)}
                        </CardTitle>
                        <CardDescription>
                          {getAssetDescription(asset.assetType)}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(asset.id, asset.assetType)}
                      disabled={downloadingAssets.has(asset.id)}
                      variant="premium"
                    >
                      {downloadingAssets.has(asset.id) ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Next Steps */}
          <Card className="mt-8 bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {job.mode === "PRINT_MAIL" ? (
                <>
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      1
                    </div>
                    <span>Download the 4-up print sheet</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      2
                    </div>
                    <span>Upload to CVS, Walgreens, or any photo printing service</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      3
                    </div>
                    <span>Order a 4×6 print to get four 2×2 passport photos</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      1
                    </div>
                    <span>Download your digital passport photo</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      2
                    </div>
                    <span>Upload to the online passport renewal system</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      3
                    </div>
                    <span>Complete your passport renewal application</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/account/photos">View All My Photos</Link>
            </Button>
            <Button asChild size="lg" variant="premium">
              <Link href="/start">Create Another Photo</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
