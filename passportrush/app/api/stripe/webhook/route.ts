import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      const { orderId, jobId, userId } = session.metadata || {}

      if (!orderId || !jobId || !userId) {
        console.error("Missing metadata in webhook:", session.metadata)
        return NextResponse.json(
          { error: "Missing metadata" },
          { status: 400 }
        )
      }

      // Update order status
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "COMPLETED",
          stripePaymentIntentId: session.payment_intent as string,
          completedAt: new Date(),
        },
        include: {
          entitlements: true,
        },
      })

      // Check if entitlements already exist
      if (order.entitlements.length > 0) {
        console.log("Entitlements already exist for order:", orderId)
        return NextResponse.json({ received: true })
      }

      // Get all final assets for the job
      const assets = await prisma.processedAsset.findMany({
        where: {
          jobId,
          assetType: {
            in: ["FINAL_2X2", "FINAL_4UP", "FINAL_ONLINE"],
          },
        },
      })

      // Create entitlements for each asset
      const entitlements = assets.map((asset) => ({
        userId,
        jobId,
        orderId,
        assetId: asset.id,
      }))

      // Also create a general entitlement for the job
      entitlements.push({
        userId,
        jobId,
        orderId,
        assetId: null,
      })

      await prisma.entitlement.createMany({
        data: entitlements,
        skipDuplicates: true,
      })

      console.log(`Created ${entitlements.length} entitlements for order ${orderId}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

// Disable body parsing for webhook
export const config = {
  api: {
    bodyParser: false,
  },
}
