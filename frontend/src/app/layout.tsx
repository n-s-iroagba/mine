import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import ReactQueryProvider from "@/components/ReactQueryProvider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Satoshi Vertex - Enterprise Bitcoin Mining",
  description:
    "Join thousands of miners earning passive income through our enterprise-grade mining infrastructure. Start mining Bitcoin today with flexible contracts and guaranteed returns.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      
      <body className={`font-sans antialiased`}>
      <ReactQueryProvider>

        <AuthProvider>
        {children}
        <Analytics />
            </AuthProvider>
      </ReactQueryProvider>

      </body>
    </html>
  )
}
