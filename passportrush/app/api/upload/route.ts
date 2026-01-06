import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateS3Key, uploadToS3 } from "@/lib/storage"
import { z } from "zod"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif"]

const uploadSchema = z.object({
  mode: z.enum(["PRINT_MAIL", "ONLINE_RENEWAL"]),
  backgroundMode: z.enum(["STRICT", "ASSISTED"]).default("STRICT"),
})

export async function POST(req: NextRequest) {
  try {
    // Get session (optional for guests)
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Parse form data
    const formData = await req.formData()
    const file = formData.get("file") as File
    const mode = formData.get("mode") as string
    const backgroundMode = (formData.get("backgroundMode") as string) || "STRICT"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate input
    const validationResult = uploadSchema.safeParse({ mode, backgroundMode })
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validationResult.error },
        { status: 400 }
      )
    }

    // Validate file
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not allowed. Please upload JPEG, PNG, or HEIC.` },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` },
        { status: 400 }
      )
    }

    // Get client IP for rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate S3 key and upload
    const s3Key = generateS3Key("uploads", file.name)
    await uploadToS3({
      key: s3Key,
      body: buffer,
      contentType: file.type,
      metadata: {
        originalFilename: file.name,
        userId: userId || "guest",
      },
    })

    // Create upload record
    const upload = await prisma.upload.create({
      data: {
        userId,
        originalFilename: file.name,
        mimeType: file.type,
        fileSize: file.size,
        s3Key,
        s3Bucket: process.env.S3_BUCKET || "passportrush-storage",
        ipAddress: ip,
      },
    })

    // Create job
    const job = await prisma.job.create({
      data: {
        userId,
        uploadId: upload.id,
        mode: validationResult.data.mode as any,
        backgroundMode: validationResult.data.backgroundMode as any,
        status: "QUEUED",
      },
    })

    return NextResponse.json({
      success: true,
      jobId: job.id,
      uploadId: upload.id,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed", details: String(error) },
      { status: 500 }
    )
  }
}
