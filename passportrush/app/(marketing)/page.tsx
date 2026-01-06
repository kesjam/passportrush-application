import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Upload, Zap, Shield, Download, AlertCircle, X, Eye, Camera, FileCheck } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            <span className="text-xl font-bold">PassportRush</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
              FAQ
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-20 md:py-32">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                  Get a U.S. Passport Photo in Minutes — From Your Phone
                </h1>
                <p className="text-xl text-muted-foreground text-balance">
                  Upload your photo. We size, center, and check it for U.S. passport requirements. Download instantly — digital + print-ready.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="xl" variant="premium">
                  <Link href="/start">
                    Upload Your Photo Now
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline">
                  <Link href="/passport-photo-requirements">
                    See Requirements
                  </Link>
                </Button>
              </div>

              {/* Trust Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Zap className="h-8 w-8 text-primary" />
                  <p className="text-sm font-medium">Ready in minutes</p>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Shield className="h-8 w-8 text-primary" />
                  <p className="text-sm font-medium">Secure</p>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Download className="h-8 w-8 text-primary" />
                  <p className="text-sm font-medium">Instant download</p>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <FileCheck className="h-8 w-8 text-primary" />
                  <p className="text-sm font-medium">Print-ready</p>
                </div>
              </div>
            </div>

            {/* Product Mockup */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="relative w-full max-w-sm aspect-[9/16] bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl shadow-2xl border-8 border-gray-800 overflow-hidden">
                <div className="absolute inset-0 bg-white m-2 rounded-2xl overflow-hidden">
                  {/* Mock passport photo with watermark */}
                  <div className="flex flex-col h-full p-6">
                    <div className="text-sm font-semibold mb-4">Proof Preview</div>
                    <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="w-48 h-48 bg-white rounded shadow-lg flex items-center justify-center">
                        <Camera className="h-16 w-16 text-gray-300" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-6xl font-bold text-white/30 transform -rotate-45">PREVIEW</span>
                      </div>
                    </div>
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Single face detected</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Head size correct</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Plain background</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Photos Get Rejected */}
        <section className="border-t bg-muted/30 py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Passport Photos Get Rejected</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Avoid common mistakes that lead to delays and rejections
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">Wrong Size</CardTitle>
                  <CardDescription>
                    Head too large or too small in frame
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We automatically crop and size your photo so your head is 50-70% of the image height.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                    <Eye className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">Shadows & Glare</CardTitle>
                  <CardDescription>
                    Poor lighting or background issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We analyze your photo for background uniformity and warn you about potential issues.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">Wrong Format</CardTitle>
                  <CardDescription>
                    Incorrect dimensions or file type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We format your photo to exact specifications: 2×2 for print or optimized for online renewal.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to get your perfect passport photo
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="relative text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload</h3>
                <p className="text-muted-foreground">
                  Take a selfie or upload an existing photo. Works on any device.
                </p>
              </div>

              <div className="relative text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Review</h3>
                <p className="text-muted-foreground">
                  We process your photo and show you a preview with compliance checks.
                </p>
              </div>

              <div className="relative text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Download</h3>
                <p className="text-muted-foreground">
                  Pay $15 and instantly download your digital and print-ready files.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t bg-muted/30 py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, One-Time Pricing</h2>
              <p className="text-lg text-muted-foreground">
                No subscriptions. No hidden fees.
              </p>
            </div>

            <Card className="max-w-lg mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">$15</CardTitle>
                <CardDescription className="text-base">One-time payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Formatted and checked for U.S. requirements</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Digital file for online renewal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>2×2 print-ready photo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>4-up print sheet for CVS/Walgreens</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Instant download + lifetime access</span>
                  </li>
                </ul>

                <Button asChild size="lg" variant="premium" className="w-full">
                  <Link href="/start">
                    Get Started Now
                  </Link>
                </Button>

                <p className="text-xs text-center text-muted-foreground pt-4">
                  Photos are formatted and checked for U.S. passport requirements. PassportRush does not guarantee acceptance by government agencies.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <div className="container max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is this service official?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    PassportRush is not affiliated with the U.S. government. We provide a photo formatting service that checks your photo against published U.S. passport photo requirements. Final acceptance is determined by the processing agency.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What do I get for $15?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You receive digital files formatted for U.S. passport requirements: a 2×2 inch photo, a 4-up print sheet for printing at CVS/Walgreens, and a digital file optimized for online renewal applications. You can re-download these files anytime from your account.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I use this for online passport renewal?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! Choose "Online Renewal" mode when uploading, and we'll create a digital file that meets the upload requirements for online passport renewal.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What is the background replacement option?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    By default, we use "Strict Mode" which only crops and sizes your photo. The optional "Assisted Background" mode may edit the background to make it plain and light. However, some agencies may reject altered photos, so Strict Mode is recommended unless your background is unsuitable.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How do I print my photo?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Download the 4-up print sheet and upload it to your local pharmacy's photo printing service (CVS, Walgreens, etc.). Order a 4×6 print and you'll get four 2×2 passport photos on one sheet.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Camera className="h-6 w-6" />
                <span className="text-lg font-bold">PassportRush</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional passport photos in minutes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/passport-photo-online" className="hover:text-foreground">Passport Photo Online</Link></li>
                <li><Link href="/passport-photo-2x2" className="hover:text-foreground">2×2 Photos</Link></li>
                <li><Link href="/passport-photo-online-renewal" className="hover:text-foreground">Online Renewal</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/passport-photo-requirements" className="hover:text-foreground">Requirements</Link></li>
                <li><Link href="/passport-photo-rejected" className="hover:text-foreground">Why Photos Get Rejected</Link></li>
                <li><Link href="/how-to-print-passport-photo" className="hover:text-foreground">How to Print</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} PassportRush. All rights reserved.</p>
            <p className="mt-2">Not affiliated with the U.S. government or any government agency.</p>
          </div>
        </div>
      </footer>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "PassportRush",
            "applicationCategory": "UtilitiesApplication",
            "offers": {
              "@type": "Offer",
              "price": "15.00",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "127"
            }
          })
        }}
      />
    </div>
  )
}
