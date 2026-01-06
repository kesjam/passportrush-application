import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getSignedDownloadUrl } from "@/lib/storage"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get all jobs with completed orders
    const entitlements = await prisma.entitlement.findMany({
      where: {
        userId: session.user.id,
        order: {
          status: "COMPLETED",
        },
      },
      include: {
        job: {
          include: {
            processedAssets: {
              where: {
                assetType: "PROOF_WATERMARKED",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      distinct: ["jobId"],
    })

    // Generate signed URLs for proofs
    const photos = await Promise.all(
      entitlements.map(async (entitlement) => {
        const proofAsset = entitlement.job.processedAssets[0]
        let proofUrl = null

        if (proofAsset) {
          try {
            proofUrl = await getSignedDownloadUrl({
              key: proofAsset.s3Key,
              expiresIn: 3600,
            })
          } catch (error) {
            console.error("Failed to generate signed URL:", error)
          }
        }

        return {
          id: entitlement.job.id,
          mode: entitlement.job.mode,
          createdAt: entitlement.job.createdAt,
          proofUrl,
        }
      })
    )

    return NextResponse.json({ photos })
  } catch (error) {
    console.error("Photos fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    )
  }
}
