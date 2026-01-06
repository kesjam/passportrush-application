"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Printer, Upload, Check } from "lucide-react"

export default function StartPage() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<"PRINT_MAIL" | "ONLINE_RENEWAL" | null>(null)

  const handleContinue = () => {
    if (selectedMode) {
      router.push(`/upload?mode=${selectedMode}`)
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

      <main className="flex-1 container py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-4 animate-slide-up">
            <h1 className="text-3xl md:text-4xl font-bold">
              Choose Your Photo Type
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the format you need for your passport application
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Online Renewal Card */}
            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedMode === "ONLINE_RENEWAL"
                  ? "ring-2 ring-primary shadow-lg"
                  : ""
              }`}
              onClick={() => setSelectedMode("ONLINE_RENEWAL")}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  {selectedMode === "ONLINE_RENEWAL" && (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <CardTitle>Online Renewal</CardTitle>
                <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  Recommended
                </div>
                <CardDescription className="pt-2">
                  For uploading to the online passport renewal system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Digital file optimized for upload</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Sized and formatted for online requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Shoulders visible guidance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Accepts JPEG, PNG, HEIC formats</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Print & Mail Card */}
            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedMode === "PRINT_MAIL"
                  ? "ring-2 ring-primary shadow-lg"
                  : ""
              }`}
              onClick={() => setSelectedMode("PRINT_MAIL")}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Printer className="h-6 w-6 text-primary" />
                  </div>
                  {selectedMode === "PRINT_MAIL" && (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <CardTitle>Print & Mail (2×2)</CardTitle>
                <CardDescription className="pt-4">
                  For printing and mailing with paper applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Standard 2×2 inch passport photo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>4-up sheet for CVS/Walgreens printing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Proper head size and positioning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Print-ready at 300 DPI</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              variant="premium"
              onClick={handleContinue}
              disabled={!selectedMode}
              className="w-full md:w-auto min-w-64"
            >
              Continue to Upload
            </Button>

            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Info Box */}
          <Card className="mt-12 bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Not sure which to choose?</h3>
              <p className="text-sm text-muted-foreground">
                If you're renewing your passport online through the official U.S. government website, choose <strong>Online Renewal</strong>. If you're mailing a paper application or need physical photos, choose <strong>Print & Mail</strong>. You can also create both formats by processing your photo twice.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PassportRush. Not affiliated with the U.S. government.</p>
        </div>
      </footer>
    </div>
  )
}
