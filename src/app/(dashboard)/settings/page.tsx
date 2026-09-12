import React, { Suspense } from "react"
import { SettingsView } from "@/components/settings/SettingsView"

export default function SettingsPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading settings...</div>}>
      <SettingsView />
    </Suspense>
  )
}
