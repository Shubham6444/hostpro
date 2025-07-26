// src/app/dashboard/layout.jsx

"use client"

import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
       
        <Sidebar />
        <main className="ml-64 pt-16">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
