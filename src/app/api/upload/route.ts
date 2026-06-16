import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"

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

    // Validate type is an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // 3. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 4. Ensure public bucket "daily-pics" exists
    const { data: buckets, error: getBucketsError } = await supabaseAdmin.storage.listBuckets()
    if (getBucketsError) {
      throw getBucketsError
    }

    const bucketExists = buckets?.some((b) => b.name === "daily-pics")
    if (!bucketExists) {
      const { error: createBucketError } = await supabaseAdmin.storage.createBucket("daily-pics", {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit
        allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      })
      if (createBucketError) {
        throw createBucketError
      }
    }

    // 5. Upload File
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileExt = file.name.split(".").pop() || "png"
    // Use user ID and date to keep it organized and unique
    const fileName = `${user.id}/${date}_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from("daily-pics")
      .upload(fileName, buffer, {
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
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
