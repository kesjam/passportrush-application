#!/usr/bin/env node
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { processImage } from "./lib/image-processor"

const prisma = new PrismaClient()

const POLL_INTERVAL = 5000 // 5 seconds
const MAX_RETRIES = 3

async function processNextJob() {
  const job = await prisma.job.findFirst({
    where: {
      status: "QUEUED",
    },
    include: {
      upload: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  if (!job) {
    return false
  }

  console.log(`Processing job ${job.id}...`)

  try {
    // Update status to PROCESSING
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "PROCESSING" },
    })

    // Process the image
    const result = await processImage(job.upload.s3Key, {
      mode: job.mode,
      backgroundMode: job.backgroundMode,
    })

    if (!result.success) {
      // Mark as failed
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          failReason: result.metadata.errors.join("; "),
          metadata: result.metadata as any,
        },
      })
      console.error(`Job ${job.id} failed:`, result.metadata.errors)
      return true
    }

    // Create processed assets
    const assets = []

    if (result.outputs.proofWatermarked) {
      assets.push({
        jobId: job.id,
        assetType: "PROOF_WATERMARKED" as const,
        s3Key: result.outputs.proofWatermarked,
        s3Bucket: process.env.S3_BUCKET || "passportrush-storage",
        mimeType: "image/jpeg",
        fileSize: 0, // TODO: get actual file size
      })
    }

    if (result.outputs.final2x2) {
      assets.push({
        jobId: job.id,
        assetType: "FINAL_2X2" as const,
        s3Key: result.outputs.final2x2,
        s3Bucket: process.env.S3_BUCKET || "passportrush-storage",
        mimeType: "image/jpeg",
        fileSize: 0,
      })
    }

    if (result.outputs.final4up) {
      assets.push({
        jobId: job.id,
        assetType: "FINAL_4UP" as const,
        s3Key: result.outputs.final4up,
        s3Bucket: process.env.S3_BUCKET || "passportrush-storage",
        mimeType: "image/jpeg",
        fileSize: 0,
      })
    }

    if (result.outputs.finalOnline) {
      assets.push({
        jobId: job.id,
        assetType: "FINAL_ONLINE" as const,
        s3Key: result.outputs.finalOnline,
        s3Bucket: process.env.S3_BUCKET || "passportrush-storage",
        mimeType: "image/jpeg",
        fileSize: 0,
      })
    }

    // Save assets and update job
    await prisma.$transaction([
      ...assets.map((asset) => prisma.processedAsset.create({ data: asset })),
      prisma.job.update({
        where: { id: job.id },
        data: {
          status: "DONE",
          processedAt: new Date(),
          metadata: result.metadata as any,
        },
      }),
    ])

    console.log(`Job ${job.id} completed successfully`)
    return true
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error)

    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        failReason: `Unexpected error: ${error}`,
      },
    })

    return true
  }
}

async function worker() {
  console.log("Worker started, polling for jobs...")

  while (true) {
    try {
      const processed = await processNextJob()

      if (!processed) {
        // No jobs found, wait before polling again
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))
      }
      // If job was processed, immediately check for next one
    } catch (error) {
      console.error("Worker error:", error)
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))
    }
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Worker shutting down...")
  await prisma.$disconnect()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  console.log("Worker shutting down...")
  await prisma.$disconnect()
  process.exit(0)
})

// Start worker
worker().catch((error) => {
  console.error("Fatal worker error:", error)
  process.exit(1)
})
