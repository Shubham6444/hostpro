"use client"

import { useState } from "react"
import { loginUser } from "@/services/gateway/login"
import Cookies from "js-cookie"
import Link from "next/link"
import { useEffect } from "react"

import { useRouter } from "next/navigation"
import { fetchUserInfo } from "@/services/gateway/user"
export default function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

   // ✅ Redirect if user is already logged in
    useEffect(() => {
      const checkLogin = async () => {
        const token = Cookies.get("token")
        if (token) {
          try {
            const user = await fetchUserInfo()
            if (user?.username) {
              router.replace("/dashboard")
            }
          } catch (err) {
            // Token invalid or fetch failed — stay on signup
          }
        }
      }
  
      checkLogin()
    }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const data = await loginUser(formData)

      // ✅ Save token to cookie (expires in 1 hour)
      Cookies.set("token", data.token, { expires: 1 / 24 }) // 1 hour

      // ✅ Redirect
      window.location.href = "/dashboard"
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }


    return (
        <div className="min-h-screen relative overflow-hidden  mt-14">
            {/* Animated Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
                <div className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`}></div>
                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                                    <span className="text-white font-bold">H</span>
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    HostPro
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2">Welcome Back</h2>
                            <p className="text-white/60">Sign in to your hosting dashboard</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-white/80 text-sm font-medium mb-2">username Address</label>
                                    <div className="relative">
                                        <input
                                            type="username"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                                            placeholder="Enter your username"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-white/80 text-sm font-medium mb-2">Password</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                                            placeholder="Enter your password"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                                    {error}
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500" />
                                    <span className="ml-2 text-sm text-white/60">Remember me</span>
                                </label>
                                <Link href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Signing In...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <p className="text-white/60">
                                {"Don't have an account? "}
                                <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-white/40 text-sm">
                            Secure login powered by enterprise-grade encryption
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
