"use client"

import { Suspense, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, AlertCircle, Check, X } from "lucide-react"

function UploadContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") as "PRINT_MAIL" | "ONLINE_RENEWAL" || "ONLINE_RENEWAL"

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backgroundMode, setBackgroundMode] = useState<"STRICT" | "ASSISTED">("STRICT")

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      processFile(droppedFile)
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }

  const processFile = (selectedFile: File) => {
    setError(null)

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif"]
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a JPEG, PNG, or HEIC image file.")
      return
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.")
      return
    }

    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("mode", mode)
      formData.append("backgroundMode", backgroundMode)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      // Redirect to proof page
      router.push(`/proof/${data.jobId}`)
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.")
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <Link href="/start" className="hover:text-foreground">Choose Mode</Link>
              <span>/</span>
              <span className="text-foreground">Upload Photo</span>
            </div>

            <h1 className="text-3xl font-bold mb-2">Upload Your Photo</h1>
            <p className="text-muted-foreground">
              Mode: {mode === "ONLINE_RENEWAL" ? "Online Renewal" : "Print & Mail (2×2)"}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload Area */}
            <div className="lg:col-span-2 space-y-6">
              {!preview ? (
                <Card>
                  <CardContent className="pt-6">
                    <div
                      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-muted-foreground/50"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">
                        Drag & drop your photo here
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        or click to browse files
                      </p>
                      <input
                        type="file"
                        id="file-input"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"
                        onChange={handleFileInput}
                      />
                      <Button
                        onClick={() => document.getElementById("file-input")?.click()}
                        variant="outline"
                      >
                        Select Photo
                      </Button>
                    </div>

                    {error && (
                      <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Preview</CardTitle>
                      <CardDescription>
                        Review your photo before processing
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative aspect-square max-w-md mx-auto bg-muted rounded-lg overflow-hidden">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setFile(null)
                            setPreview(null)
                            setError(null)
                          }}
                          disabled={uploading}
                        >
                          Choose Different Photo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Background Mode Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Background Processing</CardTitle>
                      <CardDescription>
                        Choose how to handle the photo background
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          backgroundMode === "STRICT"
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-muted-foreground/50"
                        }`}
                        onClick={() => setBackgroundMode("STRICT")}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full border-2 flex items-center justify-center">
                              {backgroundMode === "STRICT" && (
                                <div className="h-3 w-3 rounded-full bg-primary" />
                              )}
                            </div>
                            <span className="font-semibold">Strict Mode</span>
                          </div>
                          <div className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            Recommended
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground ml-7">
                          Only crop, center, and adjust exposure. No background editing.
                        </p>
                      </div>

                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          backgroundMode === "ASSISTED"
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-muted-foreground/50"
                        }`}
                        onClick={() => setBackgroundMode("ASSISTED")}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <div className="h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5">
                            {backgroundMode === "ASSISTED" && (
                              <div className="h-3 w-3 rounded-full bg-primary" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold">Assisted Background</span>
                            <p className="text-sm text-muted-foreground mt-1">
                              May edit background to make it plain and light. Some agencies may reject altered photos.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        variant="premium"
                        onClick={handleUpload}
                        disabled={uploading}
                      >
                        {uploading ? "Processing..." : "Process Photo"}
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Tips Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Photo Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Face forward with a neutral expression</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Use plain, light-colored background</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Good, even lighting with no shadows</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Remove glasses if possible</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What to Avoid</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-start gap-2">
                    <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Hats or head coverings (except religious)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Smiling or unusual expressions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Shadows on face or background</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Filters or heavy editing</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Supported formats:</strong> JPEG, PNG, HEIC
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Max file size:</strong> 10 MB
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <UploadContent />
    </Suspense>
  )
}
