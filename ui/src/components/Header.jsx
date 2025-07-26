"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { fetchUserInfo } from "@/services/gateway/user"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

export default function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const isDashboard = pathname.startsWith("/dashboard")

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchUserInfo()
        setUser(userData)
      } catch (err) {
        setUser(null)
      }
    }
    loadUser()
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <header className="fixed top-0 w-full bg-red/5  border-b border-red/10 z-1200 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold">H</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              HostPro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            {["Home", "Pricing", "Docs", "Support"].map((item) => (
              <Link
                key={item}
                href={item === "Home" ? "/" : `/#${item.toLowerCase()}`}
                className="text-white/80 hover:text-white transition-colors font-medium relative group"
              >
                {item}
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
            ))}

            {/* Console Button (if logged in & not dashboard) */}
            {user && !isDashboard && (
              <Link href="/dashboard" className="relative group text-white/80 hover:text-white font-medium transition-colors">
               
                <span>
                  Go to Console
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></div>
                </span>
              </Link>
            )}
          </nav>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Desktop Auth Links */}
            {user ? (
              <div className="hidden md:block text-white/80 font-medium">👋 Hi, {user.username}</div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/login" className="text-white/80 hover:text-white transition-colors font-medium">
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2 rounded-full transition-all transform hover:scale-105 font-medium"
                >
                  Start Free
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden text-white" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay background */}
          <div className="absolute inset-0 bg-black/60" onClick={toggleSidebar} />

          {/* Sidebar Panel */}
          <div
            className={`
              fixed top-0 right-0 h-full w-64 bg-gray-900 text-white p-6 shadow-lg z-50
              transform transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
            `}
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold">Menu</span>
              <button onClick={toggleSidebar}>
                <X size={24} />
              </button>
            </div>

            {["Home", "Pricing", "Docs", "Support"].map((item) => (
              <Link
                key={item}
                href={item === "Home" ? "/" : `/#${item.toLowerCase()}`}
                className="block py-2 text-white/80 hover:text-white border-b border-white/10"
                onClick={toggleSidebar}
              >
                {item}
              </Link>
            ))}

            {/* Dashboard button */}
            {user && !isDashboard && (
              <Link
                href="/dashboard"
                className="block py-2 mt-4 text-white/80 hover:text-white border-b border-white/10"
                onClick={toggleSidebar}
              >
                Go to Console
              </Link>
            )}

            {/* Auth Links for Mobile */}
            {!user && (
              <>
                <Link
                  href="/login"
                  className="block py-2 text-white/80 hover:text-white"
                  onClick={toggleSidebar}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-center px-4 py-2 rounded"
                  onClick={toggleSidebar}
                >
                  Start Free
                </Link>
              </>
            )}

            {/* Mobile user display */}
            {user && (
              <div className="mt-6 text-sm">👋 Hi, {user.username}</div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
