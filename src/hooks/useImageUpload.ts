import { useIsMutating, useMutation, type UseMutationResult } from "@tanstack/react-query"
import { format } from "date-fns"
import { showError } from "@/lib/sweetalert"

const IMAGE_UPLOAD_KEY = ["image-upload"]

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("date", format(new Date(), "yyyy-MM-dd"))

  const res = await fetch("/api/upload", { method: "POST", body: formData })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || "Failed to upload image")
  }
  return data.url
}

export function useImageUploadMutation(): UseMutationResult<string, Error, File> {
  return useMutation<string, Error, File>({
    mutationKey: IMAGE_UPLOAD_KEY,
    mutationFn: uploadImage,
    onError: (err) => {
      showError("Upload Failed", err.message)
    },
  })
}

// Lets a form block submit so it cannot save before the image URL arrives
export function useIsUploadingImage(): boolean {
  return useIsMutating({ mutationKey: IMAGE_UPLOAD_KEY }) > 0
}
