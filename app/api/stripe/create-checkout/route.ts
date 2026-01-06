import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"
import { z } from "zod"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

const checkoutSchema = z.object({
  jobId: z.string(),
})

const PRICE_AMOUNT = 1500 // $15.00 in cents

export async function POST(req: NextRequest) {
  try {
    // Require authentication for checkout
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validationResult = checkoutSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validationResult.error },
        { status: 400 }
      )
    }

    const { jobId } = validationResult.data

    // Verify job exists and is ready
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { processedAssets: true },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    if (job.status !== "DONE") {
      return NextResponse.json(
        { error: "Job is not ready for purchase" },
        { status: 400 }
      )
    }

    // Check if already purchased
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
        entitlements: {
          some: {
            jobId: job.id,
          },
        },
      },
    })

    if (existingOrder) {
      return NextResponse.json(
        { error: "This photo has already been purchased" },
        { status: 400 }
      )
    }

    // Create pending order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        stripeCheckoutSessionId: "", // Will update after creating session
        amount: PRICE_AMOUNT,
        currency: "usd",
        status: "PENDING",
        metadata: {
          jobId: job.id,
          mode: job.mode,
        },
      },
    })

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Passport Photo",
              description:
                job.mode === "PRINT_MAIL"
                  ? "2×2 passport photo + 4-up print sheet"
                  : "Digital passport photo for online renewal",
              images: [], // TODO: Add product image
            },
            unit_amount: PRICE_AMOUNT,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/download/${jobId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/proof/${jobId}`,
      client_reference_id: session.user.id,
      metadata: {
        orderId: order.id,
        jobId: job.id,
        userId: session.user.id,
      },
    })

    // Update order with session ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripeCheckoutSessionId: checkoutSession.id,
      },
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
