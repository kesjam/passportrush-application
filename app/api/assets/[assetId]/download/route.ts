import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getSignedDownloadUrl, DOWNLOAD_TTL } from "@/lib/storage"

export async function GET(
  req: NextRequest,
  { params }: { params: { assetId: string } }
) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { assetId } = params

    // Get asset
    const asset = await prisma.processedAsset.findUnique({
      where: { id: assetId },
      include: {
        job: true,
      },
    })

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Check entitlement
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId: session.user.id,
        jobId: asset.jobId,
        OR: [
          { assetId: asset.id },
          { assetId: null }, // General job entitlement
        ],
      },
      include: {
        order: true,
      },
    })

    if (!entitlement || entitlement.order.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "You do not have access to this asset" },
        { status: 403 }
      )
    }

    // Generate signed download URL
    const filename = `passportrush_${asset.assetType.toLowerCase()}.jpg`
    const signedUrl = await getSignedDownloadUrl({
      key: asset.s3Key,
      expiresIn: DOWNLOAD_TTL,
      contentDisposition: `attachment; filename="${filename}"`,
    })

    // Return signed URL or redirect
    const shouldRedirect = req.nextUrl.searchParams.get("redirect") === "true"

    if (shouldRedirect) {
      return NextResponse.redirect(signedUrl)
    }

    return NextResponse.json({
      url: signedUrl,
      filename,
      assetType: asset.assetType,
      expiresIn: DOWNLOAD_TTL,
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    )
  }
}
