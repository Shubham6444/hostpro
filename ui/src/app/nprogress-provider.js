"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import "@/styles/nprogress.css" // 👈 Import the custom style

export default function NProgressProvider() {
  const pathname = usePathname()

  useEffect(() => {
    NProgress.start()

    const timeout = setTimeout(() => {
      NProgress.done()
    }, 500) // Adjust timing as needed

    return () => clearTimeout(timeout)
  }, [pathname])

  return null
}
