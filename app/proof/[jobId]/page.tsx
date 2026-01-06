"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Check, AlertCircle, Loader2, X } from "lucide-react"

interface JobData {
  id: string
  status: string
  mode: string
  backgroundMode: string
  metadata?: {
    faceDetected?: boolean
    faceCount?: number
    headHeightRatio?: number
    backgroundScore?: number
    warnings?: string[]
    errors?: string[]
  }
  proofUrl?: string | null
  hasEntitlement?: boolean
}

export default function ProofPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const jobId = params.jobId as string

  const [job, setJob] = useState<JobData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    fetchJobStatus()
    const interval = setInterval(fetchJobStatus, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [jobId])

  const fetchJobStatus = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch job status")
      }

      setJob(data)
      setLoading(false)

      // Stop polling if job is done or failed
      if (data.status === "DONE" || data.status === "FAILED") {
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!session) {
      // Redirect to sign in
      signIn("google", { callbackUrl: `/proof/${jobId}` })
      return
    }

    setCheckoutLoading(true)

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err: any) {
      alert(err.message || "Checkout failed. Please try again.")
      setCheckoutLoading(false)
    }
  }

  if (loading && !job) {
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
              <CardTitle>Error</CardTitle>
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

  // Processing state
  if (job.status === "QUEUED" || job.status === "PROCESSING") {
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
              <CardTitle>Processing Your Photo</CardTitle>
              <CardDescription>
                This usually takes 10-30 seconds. Please wait...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Detecting face...
                </p>
                <p className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Analyzing background...
                </p>
                <p className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Generating outputs...
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // Failed state
  if (job.status === "FAILED") {
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
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900">Processing Failed</CardTitle>
                <CardDescription className="text-red-700">
                  We couldn't process your photo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.metadata?.errors && job.metadata.errors.length > 0 && (
                  <div className="space-y-2">
                    {job.metadata.errors.map((error, i) => (
                      <p key={i} className="flex items-start gap-2 text-sm text-red-800">
                        <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </p>
                    ))}
                  </div>
                )}
                <div className="pt-4">
                  <Button asChild>
                    <Link href="/start">Try Again with Another Photo</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // Success state - show proof
  const checks = job.metadata || {}
  const hasErrors = checks.errors && checks.errors.length > 0
  const hasWarnings = checks.warnings && checks.warnings.length > 0

  return (
    <div className="min-h-screen flex flex-col pb-24">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            <span className="text-xl font-bold">PassportRush</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Proof is Ready</h1>
            <p className="text-muted-foreground">
              Review your photo and compliance checks below
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Preview */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    Watermark will be removed after purchase
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {job.proofUrl ? (
                    <div className="relative aspect-square max-w-lg mx-auto bg-muted rounded-lg overflow-hidden">
                      <img
                        src={job.proofUrl}
                        alt="Passport photo proof"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square max-w-lg mx-auto bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Preview not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Checks Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Compliance Checks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {checks.faceDetected !== false && (
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Single face detected</span>
                    </div>
                  )}
                  {checks.headHeightRatio && (
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Head size within range</span>
                    </div>
                  )}
                  {checks.backgroundScore && checks.backgroundScore > 70 && (
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Plain background detected</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {hasWarnings && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-yellow-900">Warnings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {checks.warnings?.map((warning, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-yellow-800">{warning}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What You'll Get</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {job.mode === "PRINT_MAIL" ? (
                    <>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>2×2 inch passport photo</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>4-up print sheet (4×6)</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Digital file for online renewal</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>No watermark on final files</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Lifetime re-download access</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 py-4">
        <div className="container flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">$15</p>
            <p className="text-sm text-muted-foreground">One-time payment</p>
          </div>
          <Button
            size="lg"
            variant="premium"
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="min-w-48"
          >
            {checkoutLoading ? "Loading..." : "Download My Photo — $15"}
          </Button>
        </div>
      </div>
    </div>
  )
}
