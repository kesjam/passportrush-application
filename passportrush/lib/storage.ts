import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { randomUUID } from "crypto"

const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  ...(process.env.S3_ENDPOINT && { endpoint: process.env.S3_ENDPOINT }),
})

const BUCKET = process.env.S3_BUCKET || "passportrush-storage"
const SIGNED_URL_TTL = parseInt(process.env.SIGNED_URL_TTL_SECONDS || "3600")
const DOWNLOAD_TTL = parseInt(process.env.SIGNED_URL_DOWNLOAD_TTL_SECONDS || "86400")

export interface UploadOptions {
  key: string
  body: Buffer
  contentType: string
  metadata?: Record<string, string>
}

export interface GetSignedUrlOptions {
  key: string
  expiresIn?: number
  contentDisposition?: string
}

export async function uploadToS3(options: UploadOptions): Promise<string> {
  const { key, body, contentType, metadata } = options

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    })
  )

  return key
}

export async function getSignedDownloadUrl(options: GetSignedUrlOptions): Promise<string> {
  const { key, expiresIn = SIGNED_URL_TTL, contentDisposition } = options

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ...(contentDisposition && { ResponseContentDisposition: contentDisposition }),
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

export async function getSignedUploadUrl(key: string, contentType: string, expiresIn = 300): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

export async function deleteFromS3(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  )
}

export function generateS3Key(prefix: string, filename: string): string {
  const ext = filename.split(".").pop()
  const uuid = randomUUID()
  return `${prefix}/${uuid}.${ext}`
}

export { BUCKET, SIGNED_URL_TTL, DOWNLOAD_TTL }
