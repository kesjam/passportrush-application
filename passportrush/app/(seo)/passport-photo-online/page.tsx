import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Camera, Smartphone, Download, Check } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Passport Photo Online - Create U.S. Passport Photos from Home",
  description: "Create professional U.S. passport photos online in minutes. Upload from your phone, get instant results. Digital and print-ready formats. $15 one-time.",
}

export default function PassportPhotoOnlinePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            <span className="text-xl font-bold">PassportRush</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Create Your Passport Photo Online
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Professional U.S. passport photos in minutes—no photographer needed. Upload from any device, download instantly.
            </p>
            <Button asChild size="lg" variant="premium">
              <Link href="/start">Get Started — $15</Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-20">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Smartphone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">1. Upload Your Photo</h3>
                <p className="text-muted-foreground">
                  Take a selfie or upload an existing photo from your phone or computer.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">2. Auto-Format</h3>
                <p className="text-muted-foreground">
                  We automatically crop, size, and check your photo against U.S. requirements.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Download className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">3. Download</h3>
                <p className="text-muted-foreground">
                  Pay $15 and download your digital and print-ready passport photos.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-8">Why Choose PassportRush?</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex gap-4">
                <Check className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Instant Processing</h3>
                  <p className="text-sm text-muted-foreground">Get your passport photo in minutes, not days</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Check className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">No Photographer Needed</h3>
                  <p className="text-sm text-muted-foreground">Create professional photos from home</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Check className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Print & Digital</h3>
                  <p className="text-sm text-muted-foreground">Get both formats for any application method</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Check className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Requirement Checks</h3>
                  <p className="text-sm text-muted-foreground">Automated compliance verification</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Create a Passport Photo Online",
            "step": [
              {
                "@type": "HowToStep",
                "name": "Upload Your Photo",
                "text": "Take a selfie or upload an existing photo from your device"
              },
              {
                "@type": "HowToStep",
                "name": "Auto-Format",
                "text": "Our system automatically crops, sizes, and checks your photo"
              },
              {
                "@type": "HowToStep",
                "name": "Download",
                "text": "Pay $15 and instantly download your passport photos"
              }
            ]
          })
        }}
      />
    </div>
  )
}
