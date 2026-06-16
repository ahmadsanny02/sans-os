import type { Metadata } from "next"
import { Poppins, Geist_Mono } from "next/font/google"
import { Providers } from "@/components/providers/Providers"
import "./globals.css"
import "../../node_modules/tw-animate-css/dist/tw-animate.css"
import "sweetalert2/dist/sweetalert2.min.css"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "SansOS Workspace - Personal Life & Work OS",
  description: "A personalized all-in-one life operating system incorporating habit tracking, language learning logs, daily timetable scheduling, and dynamic project management.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
