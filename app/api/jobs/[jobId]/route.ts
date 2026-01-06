import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSignedDownloadUrl } from "@/lib/storage"

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        upload: true,
        processedAssets: true,
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Get proof asset if available
    const proofAsset = job.processedAssets.find(
      (a) => a.assetType === "PROOF_WATERMARKED"
    )

    let proofUrl = null
    if (proofAsset) {
      // Generate signed URL for proof (short-lived, 1 hour)
      proofUrl = await getSignedDownloadUrl({
        key: proofAsset.s3Key,
        expiresIn: 3600,
      })
    }

    return NextResponse.json({
      id: job.id,
      status: job.status,
      mode: job.mode,
      backgroundMode: job.backgroundMode,
      metadata: job.metadata,
      failReason: job.failReason,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      processedAt: job.processedAt,
      proofUrl,
      hasEntitlement: false, // Will be updated after payment
    })
  } catch (error) {
    console.error("Job status error:", error)
    return NextResponse.json(
      { error: "Failed to fetch job status" },
      { status: 500 }
    )
  }
}
