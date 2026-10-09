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
    const rawFiles = formData.getAll("files").concat(formData.getAll("file"))
    const files = rawFiles.filter((item): item is File => item instanceof File && item.size > 0)
    const date = formData.get("date") as string | null

    if (files.length === 0 || !date) {
      return NextResponse.json({ error: "Missing file or date parameter" }, { status: 400 })
    }

    // Validate date format strictly to prevent path traversal
    const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
    if (!DATE_REGEX.test(date)) {
      return NextResponse.json(
        { error: "Parameter tanggal tidak valid. Format harus YYYY-MM-DD." },
        { status: 400 }
      )
    }

    // Validate type and size against strict whitelist for all files
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB Limit
    for (const f of files) {
      const fileExt = ALLOWED_MIME_MAP[f.type]
      if (!fileExt) {
        return NextResponse.json(
          { error: `Format file ${f.name} tidak didukung. Harap unggah format JPEG, PNG, WEBP, atau GIF.` },
          { status: 400 }
        )
      }
      if (f.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File size exceeds 10MB limit: ${f.name}` }, { status: 400 })
      }
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

    // 5. Upload Files
    // Use user ID, sanitized date, timestamp, and index to keep it organized and unique
    const sanitizedDate = date.replace(/[^0-9-]/g, "")
    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const currentFile = files[i]
      const fileExt = ALLOWED_MIME_MAP[currentFile.type]
      const fileName = `${user.id}/${sanitizedDate}_${Date.now()}_${i}.${fileExt}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from("daily-pics")
        .upload(fileName, currentFile, {
          contentType: currentFile.type,
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

      uploadedUrls.push(urlData.publicUrl)
    }

    return NextResponse.json({
      url: uploadedUrls[0],
      urls: uploadedUrls,
    })
  } catch (error) {
    logger.error("[Upload API Error]", error)
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
