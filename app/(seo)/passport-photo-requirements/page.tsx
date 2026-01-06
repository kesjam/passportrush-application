import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Check, X } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "U.S. Passport Photo Requirements 2026 | Complete Guide",
  description: "Complete guide to U.S. passport photo requirements: size, background, clothing, and technical specifications. Get it right the first time.",
}

export default function PassportPhotoRequirementsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            <span className="text-xl font-bold">PassportRush</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <span className="text-foreground">Passport Photo Requirements</span>
            </nav>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              U.S. Passport Photo Requirements
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Everything you need to know to submit a compliant passport photo that won't be rejected.
            </p>

            <Button asChild size="lg" variant="premium">
              <Link href="/start">Create Compliant Photo Now</Link>
            </Button>
          </div>
        </section>

        {/* Size Requirements */}
        <section className="border-t bg-muted/30 py-20">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-bold mb-8">Size and Dimension Requirements</h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Print Photos (2×2 inches)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>For paper applications submitted by mail:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Exactly 2 inches by 2 inches (51mm x 51mm)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Head must be between 1 inch and 1⅜ inches (25-35mm) from bottom of chin to top of head</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Head should occupy 50-70% of the image</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Digital Photos (Online Renewal)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>For online passport renewal applications:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Square format (1:1 aspect ratio)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Minimum 600 x 600 pixels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>File size between 10KB and 240KB</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>JPEG, JPEG2000, or PNG format</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Background Requirements */}
        <section className="py-20">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-bold mb-8">Background Requirements</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    Acceptable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>Plain white or off-white background</li>
                    <li>Even lighting with no shadows</li>
                    <li>High contrast with your clothing and skin tone</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <X className="h-5 w-5 text-red-600" />
                    Not Acceptable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>Patterns, textures, or busy backgrounds</li>
                    <li>Shadows on face or behind head</li>
                    <li>Other people or objects visible</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t bg-muted/30 py-20">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I smile in my passport photo?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No, you must have a neutral facial expression with your mouth closed. Smiling or showing teeth will cause rejection.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I wear glasses?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Glasses are generally not allowed unless required for medical reasons with a signed statement from your doctor. It's best to remove glasses.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What should I wear?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Wear everyday clothing. Avoid white or very light colors that blend with the background. Uniforms are only allowed for religious clothing worn daily.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How recent must my photo be?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your photo must be taken within the last 6 months to show your current appearance.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Get Your Compliant Passport Photo Now</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Let PassportRush handle the requirements. We'll size, crop, and check your photo automatically.
            </p>
            <Button asChild size="lg" variant="premium">
              <Link href="/start">Create Your Photo — $15</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What are the size requirements for U.S. passport photos?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "U.S. passport photos must be 2 inches by 2 inches (51mm x 51mm) for print, with the head measuring 1 to 1⅜ inches from chin to crown. Digital photos must be at least 600x600 pixels."
                }
              },
              {
                "@type": "Question",
                "name": "Can I smile in my passport photo?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No, you must have a neutral facial expression with your mouth closed. Smiling or showing teeth will cause rejection."
                }
              },
              {
                "@type": "Question",
                "name": "What background color is required for passport photos?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "U.S. passport photos require a plain white or off-white background with even lighting and no shadows."
                }
              }
            ]
          })
        }}
      />
    </div>
  )
}
