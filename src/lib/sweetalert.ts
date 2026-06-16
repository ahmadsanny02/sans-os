import Swal from "sweetalert2"
import "sweetalert2/dist/sweetalert2.min.css"

// Custom styles for popup confirm dialogs
const ConfirmSwal = Swal.mixin({
  buttonsStyling: false,
  customClass: {
    popup: "bg-card/95 border border-border/80 rounded-2xl shadow-2xl backdrop-blur-md dark:bg-slate-900/95 max-w-[380px] p-6 select-none",
    title: "text-base font-extrabold tracking-tight text-foreground font-sans block mt-2",
    htmlContainer: "text-xs text-muted-foreground font-medium leading-relaxed mt-2.5",
    confirmButton: "inline-flex h-9 items-center justify-center rounded-lg bg-destructive px-3.5 py-2 text-xs font-bold text-destructive-foreground hover:bg-destructive/90 transition-all active:scale-95 focus:outline-none shrink-0 ml-2",
    cancelButton: "inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95 focus:outline-none shrink-0",
    actions: "flex justify-end mt-5 border-t border-border/40 pt-4 w-full",
  }
})

// Custom styles for standard error dialogs
const ErrorSwal = Swal.mixin({
  buttonsStyling: false,
  customClass: {
    popup: "bg-card/95 border border-border/80 rounded-2xl shadow-2xl backdrop-blur-md dark:bg-slate-900/95 max-w-[380px] p-6 select-none",
    title: "text-base font-extrabold tracking-tight text-foreground font-sans block mt-2",
    htmlContainer: "text-xs text-muted-foreground font-medium leading-relaxed mt-2.5",
    confirmButton: "inline-flex h-9 items-center justify-center rounded-lg bg-secondary px-3.5 py-2 text-xs font-bold text-foreground hover:bg-secondary/80 transition-all active:scale-95 focus:outline-none shrink-0",
    actions: "flex justify-end mt-5 border-t border-border/40 pt-4 w-full",
  }
})

// Custom styles for toast notifications
const ToastSwal = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  customClass: {
    popup: "bg-card border border-border/60 rounded-xl shadow-lg dark:bg-slate-900 p-3 flex items-center gap-2 select-none",
    title: "text-xs font-bold text-foreground font-sans",
  }
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
    iconColor: "#f43f5e",
  })
}

export function showSuccessToast(title: string): void {
  ToastSwal.fire({
    title,
    icon: "success",
    iconColor: "#10b981",
  })
}
