"use client"

import "./globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { usePathname } from "next/navigation"
import NProgressProvider from "@/app/nprogress-provider"

export default function RootLayout({ children }) {
  const pathname = usePathname()

  const isDashboard = pathname.startsWith("/dashboard")
  const isEditor = pathname.startsWith("/users/editor")
  const isvps = pathname.startsWith("/vps")
  const adminDashboard = pathname.startsWith("/adminDashboard/vm/")

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
         {/* <Header /> */}
        {!isEditor && <Header />}
        <NProgressProvider />
        <main className="flex-grow">{children}</main>
        {!isvps &&!isDashboard && !isEditor &&!adminDashboard&& <Footer />}
      </body>
    </html>
  )
}
