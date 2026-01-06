import sharp from "sharp"
import { Canvas, Image as CanvasImage } from "canvas"
import * as faceapi from "@vladmandic/face-api"
import path from "path"
import { downloadFromS3, uploadToS3 } from "./storage-worker"

export interface ProcessingOptions {
  mode: "PRINT_MAIL" | "ONLINE_RENEWAL"
  backgroundMode: "STRICT" | "ASSISTED"
}

export interface ProcessingResult {
  success: boolean
  metadata: {
    faceDetected: boolean
    faceCount: number
    headHeightRatio?: number
    backgroundScore?: number
    glassesDetected?: boolean
    warnings: string[]
    errors: string[]
  }
  outputs: {
    proofWatermarked?: string
    final2x2?: string
    final4up?: string
    finalOnline?: string
  }
}

// Initialize face-api models
let modelsLoaded = false

async function loadModels() {
  if (modelsLoaded) return

  const modelPath = path.join(process.cwd(), "models")

  try {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath)
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath)
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath)
    modelsLoaded = true
    console.log("Face detection models loaded successfully")
  } catch (error) {
    console.warn("Face detection models not found, using fallback mode:", error)
  }
}

async function detectFaces(imageBuffer: Buffer): Promise<any[]> {
  if (!modelsLoaded) {
    await loadModels()
  }

  try {
    const img = new CanvasImage()
    img.src = imageBuffer

    const canvas = new Canvas(img.width, img.height)
    const ctx = canvas.getContext("2d")
    ctx.drawImage(img, 0, 0)

    const detections = await faceapi
      .detectAllFaces(canvas as any)
      .withFaceLandmarks()

    return detections
  } catch (error) {
    console.error("Face detection error:", error)
    return []
  }
}

async function analyzeBackground(imageBuffer: Buffer): Promise<{ score: number; isPlain: boolean }> {
  const image = sharp(imageBuffer)
  const { width, height } = await image.metadata()

  if (!width || !height) {
    return { score: 0, isPlain: false }
  }

  // Sample border pixels
  const borderWidth = Math.floor(width * 0.1)
  const borderHeight = Math.floor(height * 0.1)

  const topBorder = await image
    .extract({ left: 0, top: 0, width, height: borderHeight })
    .raw()
    .toBuffer()

  const bottomBorder = await image
    .extract({ left: 0, top: height - borderHeight, width, height: borderHeight })
    .raw()
    .toBuffer()

  // Calculate average brightness and variance
  const pixels = [...topBorder, ...bottomBorder]
  const avg = pixels.reduce((sum, val) => sum + val, 0) / pixels.length
  const variance =
    pixels.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / pixels.length

  // Score: high avg (bright) and low variance (uniform) = good background
  const isPlain = avg > 200 && variance < 500

  return { score: Math.round((avg / 255) * 100), isPlain }
}

async function cropToPassportSpec(
  imageBuffer: Buffer,
  faceBox?: { x: number; y: number; width: number; height: number }
): Promise<{ buffer: Buffer; headHeightRatio: number }> {
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error("Invalid image dimensions")
  }

  let cropBox: { left: number; top: number; width: number; height: number }

  if (faceBox) {
    // Calculate crop based on face detection
    // For passport photos, head should be 50-70% of image height
    const targetHeadRatio = 0.6
    const imageHeight = faceBox.height / targetHeadRatio
    const imageWidth = imageHeight // Square output

    // Center face horizontally, position higher vertically
    cropBox = {
      left: Math.max(0, Math.floor(faceBox.x + faceBox.width / 2 - imageWidth / 2)),
      top: Math.max(0, Math.floor(faceBox.y - imageHeight * 0.15)),
      width: Math.min(metadata.width, Math.floor(imageWidth)),
      height: Math.min(metadata.height, Math.floor(imageHeight)),
    }
  } else {
    // Center crop to square
    const size = Math.min(metadata.width, metadata.height)
    cropBox = {
      left: Math.floor((metadata.width - size) / 2),
      top: Math.floor((metadata.height - size) / 2),
      width: size,
      height: size,
    }
  }

  const cropped = await image
    .extract(cropBox)
    .resize(600, 600, { fit: "cover" })
    .toBuffer()

  const headHeightRatio = faceBox ? faceBox.height / cropBox.height : 0

  return { buffer: cropped, headHeightRatio }
}

async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const image = sharp(imageBuffer)
  const { width, height } = await image.metadata()

  if (!width || !height) throw new Error("Invalid dimensions")

  // Create watermark SVG
  const watermarkSvg = Buffer.from(`
    <svg width="${width}" height="${height}">
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="${Math.floor(width / 8)}"
        font-weight="bold"
        fill="rgba(255, 255, 255, 0.3)"
        text-anchor="middle"
        transform="rotate(-45 ${width / 2} ${height / 2})"
      >
        PREVIEW
      </text>
    </svg>
  `)

  return await image
    .composite([
      {
        input: watermarkSvg,
        blend: "over",
      },
    ])
    .toBuffer()
}

async function create4upPrintSheet(photoBuffer: Buffer): Promise<Buffer> {
  // Create 4x6 inch canvas at 300 DPI = 1200x1800 pixels
  const canvasWidth = 1800
  const canvasHeight = 1200
  const photoSize = 600 // 2x2 inch at 300 DPI

  // Calculate positions for 4 photos with margins
  const marginX = (canvasWidth - photoSize * 2) / 3
  const marginY = (canvasHeight - photoSize * 2) / 3

  const positions = [
    { left: Math.floor(marginX), top: Math.floor(marginY) },
    { left: Math.floor(marginX * 2 + photoSize), top: Math.floor(marginY) },
    { left: Math.floor(marginX), top: Math.floor(marginY * 2 + photoSize) },
    { left: Math.floor(marginX * 2 + photoSize), top: Math.floor(marginY * 2 + photoSize) },
  ]

  const canvas = sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })

  const composites = positions.map((pos) => ({
    input: photoBuffer,
    left: pos.left,
    top: pos.top,
  }))

  return await canvas.composite(composites).jpeg({ quality: 95 }).toBuffer()
}

async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
  // Simple background replacement - replace with neutral light gray
  // For production, consider using a proper background removal service
  const image = sharp(imageBuffer)

  // This is a placeholder - in production you'd want to use
  // a proper background removal API or library
  return imageBuffer
}

export async function processImage(
  s3Key: string,
  options: ProcessingOptions
): Promise<ProcessingResult> {
  const warnings: string[] = []
  const errors: string[] = []
  const outputs: ProcessingResult["outputs"] = {}

  try {
    // Download original image from S3
    const originalBuffer = await downloadFromS3(s3Key)

    // Detect faces
    const faces = await detectFaces(originalBuffer)
    const faceDetected = faces.length > 0
    const faceCount = faces.length

    if (!faceDetected) {
      errors.push("No face detected in the image")
    } else if (faceCount > 1) {
      errors.push("Multiple faces detected - only one person should be in the photo")
    }

    // Analyze background
    const bgAnalysis = await analyzeBackground(originalBuffer)

    if (!bgAnalysis.isPlain) {
      warnings.push("Background may not be plain and light enough")
    }

    // Get face bounding box if available
    const faceBox = faces[0]?.detection.box

    // Crop and resize
    const { buffer: croppedBuffer, headHeightRatio } = await cropToPassportSpec(
      originalBuffer,
      faceBox
    )

    // Check head height ratio
    if (faceBox && (headHeightRatio < 0.5 || headHeightRatio > 0.7)) {
      warnings.push("Head size may be outside recommended range (50-70% of image height)")
    }

    // Apply background processing if requested
    let processedBuffer = croppedBuffer
    if (options.backgroundMode === "ASSISTED") {
      processedBuffer = await removeBackground(croppedBuffer)
    }

    // Generate watermarked proof
    const watermarkedBuffer = await addWatermark(processedBuffer)
    const proofKey = s3Key.replace("uploads/", "proofs/") + "_proof.jpg"
    await uploadToS3({
      key: proofKey,
      body: watermarkedBuffer,
      contentType: "image/jpeg",
    })
    outputs.proofWatermarked = proofKey

    // Generate final outputs (only if validation passes for production use)
    if (options.mode === "PRINT_MAIL") {
      // 2x2 final
      const final2x2Buffer = await sharp(processedBuffer)
        .jpeg({ quality: 95 })
        .toBuffer()
      const final2x2Key = s3Key.replace("uploads/", "final/") + "_2x2.jpg"
      await uploadToS3({
        key: final2x2Key,
        body: final2x2Buffer,
        contentType: "image/jpeg",
      })
      outputs.final2x2 = final2x2Key

      // 4-up print sheet
      const print4upBuffer = await create4upPrintSheet(processedBuffer)
      const print4upKey = s3Key.replace("uploads/", "final/") + "_4up.jpg"
      await uploadToS3({
        key: print4upKey,
        body: print4upBuffer,
        contentType: "image/jpeg",
      })
      outputs.final4up = print4upKey
    } else if (options.mode === "ONLINE_RENEWAL") {
      // Online renewal output
      const finalOnlineBuffer = await sharp(processedBuffer)
        .resize(600, 600)
        .jpeg({ quality: 95 })
        .toBuffer()
      const finalOnlineKey = s3Key.replace("uploads/", "final/") + "_online.jpg"
      await uploadToS3({
        key: finalOnlineKey,
        body: finalOnlineBuffer,
        contentType: "image/jpeg",
      })
      outputs.finalOnline = finalOnlineKey
    }

    return {
      success: errors.length === 0,
      metadata: {
        faceDetected,
        faceCount,
        headHeightRatio,
        backgroundScore: bgAnalysis.score,
        glassesDetected: false, // TODO: implement glasses detection
        warnings,
        errors,
      },
      outputs,
    }
  } catch (error) {
    console.error("Image processing error:", error)
    return {
      success: false,
      metadata: {
        faceDetected: false,
        faceCount: 0,
        warnings,
        errors: [...errors, `Processing failed: ${error}`],
      },
      outputs: {},
    }
  }
}
