import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"

let isBucketVerified = false

const ALLOWED_MIME_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 1. Authenticate user
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Parse FormData
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const date = formData.get("date") as string | null

    if (!file || !date) {
      return NextResponse.json({ error: "Missing file or date parameter" }, { status: 400 })
    }

    // Validate type against strict whitelist (prevent SVG XSS)
    const fileExt = ALLOWED_MIME_MAP[file.type]
    if (!fileExt) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Harap unggah format JPEG, PNG, WEBP, atau GIF." },
        { status: 400 }
      )
    }

    // Pre-check file size limit before buffer memory allocation (10MB Limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // 3. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 4. Ensure public bucket "daily-pics" exists (safely catch and continue if already exists)
    if (!isBucketVerified) {
      try {
        const { data: buckets, error: getBucketsError } = await supabaseAdmin.storage.listBuckets()
        const bucketExists = !getBucketsError && buckets?.some((b) => b.name === "daily-pics")
        if (!bucketExists) {
          const { error: createBucketError } = await supabaseAdmin.storage.createBucket("daily-pics", {
            public: true,
            fileSizeLimit: 10485760, // 10MB limit
            allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
          })
          if (createBucketError) {
            const errMsg = createBucketError.message || ""
            const errStatus = (createBucketError as { statusCode?: string | number }).statusCode
            if (!errMsg.toLowerCase().includes("already exist") && errStatus !== "409" && errStatus !== 409) {
              logger.warn("Bucket creation notice:", errMsg)
            }
          }
        }
        isBucketVerified = true
      } catch (bucketErr) {
        logger.warn("Bucket verification notice:", bucketErr)
        isBucketVerified = true
      }
    }

    // 5. Upload File
    // Use user ID and date to keep it organized and unique
    const fileName = `${user.id}/${date}_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from("daily-pics")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      throw uploadError
    }

    // 6. Get Public URL
    const { data: urlData } = supabaseAdmin.storage.from("daily-pics").getPublicUrl(fileName)
    if (!urlData?.publicUrl) {
      throw new Error("Failed to generate public URL")
    }

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    logger.error("[Upload API Error]", error)
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
