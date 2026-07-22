import Swal from "sweetalert2"

// Custom styles for popup confirm dialogs (destructive: delete)
const ConfirmSwal = Swal.mixin({
  buttonsStyling: false,
})

// Custom styles for standard error/info dialogs
const ErrorSwal = Swal.mixin({
  buttonsStyling: false,
})

// Custom styles for toast notifications
const ToastSwal = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  backdrop: false,
  heightAuto: false,
})

export async function confirmDestructive(title: string, text: string): Promise<boolean> {
  const result = await ConfirmSwal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    iconColor: "#ef4444",
  })
  return result.isConfirmed
}

export async function showError(title: string, text: string): Promise<void> {
  await ErrorSwal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "Close",
    iconColor: "#ef4444",
  })
}

export function showSuccessToast(title: string): void {
  ToastSwal.fire({
    title,
    icon: "success",
    iconColor: "#10b981",
  })
}

export function showErrorToast(title: string): void {
  ToastSwal.fire({
    title,
    icon: "error",
    iconColor: "#ef4444",
  })
}
