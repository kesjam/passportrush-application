import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { jobId } = await params

    // Check entitlement
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId: session.user.id,
        jobId,
      },
      include: {
        order: true,
        job: {
          include: {
            processedAssets: {
              where: {
                assetType: {
                  in: ["FINAL_2X2", "FINAL_4UP", "FINAL_ONLINE"],
                },
              },
            },
          },
        },
      },
    })

    if (!entitlement || entitlement.order.status !== "COMPLETED") {
      return NextResponse.json(
        {
          hasEntitlement: false,
          assets: [],
        },
        { status: 403 }
      )
    }

    return NextResponse.json({
      hasEntitlement: true,
      assets: entitlement.job.processedAssets,
    })
  } catch (error) {
    console.error("Assets fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    )
  }
}
