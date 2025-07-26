"use client"

import { useEffect, useState } from "react"
import {
  Server,
  Play,
  Square,
  RotateCcw,
  Trash2,
  Key,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Monitor,
  MoreVertical,
} from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

// Mock services for demonstration. In a real app, these would be actual API calls.
const fetchUserInfo = async () => {
  // Simulate API call
  return new Promise((resolve) => setTimeout(() => resolve({ username: "testuser" }), 500))
}

export default function VMDashboard() {
  const router = useRouter()

  // 🔒 Redirect if user is not logged in (or login page logic — flip as needed)
  useEffect(() => {
    const checkLogin = async () => {
      const token = Cookies.get("token")
      if (token) {
        try {
          const user = await fetchUserInfo()
          if (!user?.username) {
            router.replace("/login")
          }
        } catch (err) {
          router.replace("/login") // fallback if error in token validation
        }
      } else {
        router.replace("/login")
      }
    }
    checkLogin()
  }, [router])

  const [loading, setLoading] = useState(true)
  const [vm, setVM] = useState(null)
  const [error, setError] = useState(null) // Keeping this for general fetch errors
  const [newPassword, setNewPassword] = useState("")
  const [vmPassword, setVmPassword] = useState("")
  const [creating, setCreating] = useState(false)
  const [actionLoading, setActionLoading] = useState("")
  const [passwordUpdating, setPasswordUpdating] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [subdomain, setSubdomain] = useState("")
  const [selectedPlan, setSelectedPlan] = useState("free")
  const [usageStats, setUsageStats] = useState(null)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false) // State for the three-dot dropdown

  // Auto-clear messages
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("")
        setErrorMessage("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, errorMessage])

  // Fetch VM status
  const fetchVM = async () => {
    try {
      setError(null)
      const res = await fetch("http://localhost:3002/api/vm-status", { credentials: "include" })
      const data = await res.json()
      if (data.hasVM) setVM(data.vm)
      else setVM(null)
    } catch (err) {
      setError("Failed to load VM")
      setErrorMessage("Failed to connect to VM service")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsage = async () => {
    try {
      const res = await fetch("http://localhost:3002/api/stats/container-usage", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      const data = await res.json()
      if (Array.isArray(data) && data.length) {
        setUsageStats(data[0]) // Only one container per user
      }
    } catch (err) {
      console.error("Failed to load container usage", err)
    }
  }

  useEffect(() => {
    fetchVM()
    fetchUsage()
  }, [])

  // VM Action Handler
  const performAction = async (action) => {
    setActionLoading(action)
    setErrorMessage("")
    setSuccessMessage("")
    try {
      const res = await fetch("http://localhost:3002/api/vm-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (data.success) {
        setVM(data.vm || null)
        setSuccessMessage(`VM ${action} successful`)
      } else {
        setErrorMessage(data.error || `Failed to ${action} VM`)
      }
    } catch (err) {
      setErrorMessage(`Failed to ${action} VM`)
    } finally {
      setActionLoading("")
      setShowRemoveConfirm(false) // Close dialog after action
      setShowDropdown(false) // Close dropdown after action
    }
  }

  // Create VM
  const createVM = async () => {
    if (!vmPassword.trim()) {
      setErrorMessage("Please enter a password")
      return
    }
    if (!subdomain.trim()) {
      setErrorMessage("Please enter a subdomain")
      return
    }
    setCreating(true)
    setErrorMessage("")
    setSuccessMessage("")
    try {
      const res = await fetch("http://localhost:3002/api/create-vm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vmPassword,
          customDomain: subdomain.trim().toLowerCase(),
          plan: selectedPlan,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setVM(data.vm)
        setSuccessMessage(data.message || "VM created successfully")
        setVmPassword("")
        setSubdomain("")
      } else {
        setErrorMessage(data.error || "Failed to create VM")
      }
    } catch (err) {
      setErrorMessage("Failed to create VM")
    } finally {
      setCreating(false)
    }
  }

  // Update Password
  const updatePassword = async () => {
    if (!newPassword.trim()) {
      setErrorMessage("Please enter a new password")
      return
    }
    setPasswordUpdating(true)
    setErrorMessage("")
    setSuccessMessage("")
    try {
      const res = await fetch("http://localhost:3002/api/fix-vm-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword }),
      })
      const data = await res.json()
      if (data.success || data.message) {
        setSuccessMessage(data.message || "Password updated successfully")
        setNewPassword("")
        setShowPasswordChangeModal(false) // Close modal on success
      } else {
        setErrorMessage(data.error || "Failed to update password")
      }
    } catch (err) {
      setErrorMessage("Failed to update password")
    } finally {
      setPasswordUpdating(false)
    }
  }

  const StatusBadge = ({ status, health }) => {
    let statusColorClass = "bg-gray-700 text-gray-300"
    if (status === "running") statusColorClass = "bg-emerald-700/30 text-emerald-300 border border-emerald-500/30"
    else if (status === "stopped") statusColorClass = "bg-red-700/30 text-red-300 border border-red-500/30"
    else if (status === "paused") statusColorClass = "bg-yellow-700/30 text-yellow-300 border border-yellow-500/30"

    let healthColorClass = "bg-gray-700 text-gray-300"
    if (health === "healthy") healthColorClass = "bg-emerald-700/30 text-emerald-300 border border-emerald-500/30"
    else if (health === "unhealthy") healthColorClass = "bg-red-700/30 text-red-300 border border-red-500/30"

    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusColorClass}`}>
          {status.toUpperCase()}
        </span>
        {health && (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${healthColorClass}`}>
            {health.toUpperCase()}
          </span>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-200">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out p-8">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <span className="text-white text-xl font-semibold">Loading VM Dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 text-gray-200">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out p-8 mb-8 mt-10">
          <div className="flex items-center gap-4 mb-3">
            <Monitor className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">VM Dashboard</h1>
          </div>
          <p className="text-gray-300 text-lg">Manage your virtual machine instances with ease.</p>
        </div>

        {/* Status Messages */}
        {successMessage && (
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out bg-emerald-500/10 border-emerald-500/30 p-5 mb-6 shadow-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <span className="text-emerald-100 text-lg font-medium">{successMessage}</span>
            </div>
          </div>
        )}
        {errorMessage && (
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out bg-red-500/10 border-red-500/30 p-5 mb-6 shadow-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <span className="text-red-100 text-lg font-medium">{errorMessage}</span>
            </div>
          </div>
        )}

        {!vm ? (
          /* Create VM Section */
          <div className="space-y-8">
            {/* Plan Selection */}
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out p-8">
              <div className="text-center mb-8">
                <Server className="w-20 h-20 text-purple-400 mx-auto mb-5" />
                <h2 className="text-3xl font-bold text-white mb-3">Choose Your Plan</h2>
                <p className="text-gray-300 text-lg">Select a plan that fits your needs</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Free Plan */}
                <div
                  className={`backdrop-blur-sm border-2 rounded-2xl p-8 cursor-pointer transition-all duration-300 ${
                    selectedPlan === "free"
                      ? "bg-emerald-500/20 border-emerald-500/50 shadow-lg"
                      : "bg-white/5 border-white/20 hover:border-white/30 hover:shadow-md"
                  }`}
                  onClick={() => setSelectedPlan("free")}
                >
                  <div className="text-center">
                    <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Server className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Free Plan</h3>
                    <div className="text-4xl font-bold text-emerald-400 mb-5">
                      $0<span className="text-base text-gray-400">/month</span>
                    </div>
                    <ul className="space-y-3 text-base text-gray-300">
                      <li className="flex items-center justify-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />1 CPU Core
                      </li>
                      <li className="flex items-center justify-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        512MB RAM
                      </li>
                      <li className="flex items-center justify-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        5GB Storage
                      </li>
                      <li className="flex items-center justify-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        Basic Support
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Paid Plan */}
                <div
                  className={`backdrop-blur-sm border-2 rounded-2xl p-8 cursor-pointer transition-all duration-300 relative ${
                    selectedPlan === "paid"
                      ? "bg-purple-500/20 border-purple-500/50 shadow-lg"
                      : "bg-white/5 border-white/20 hover:border-white/30 hover:shadow-md"
                  }`}
                  onClick={() => setSelectedPlan("paid")}
                >
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                      POPULAR
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Server className="w-7 h-7 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
                    <div className="text-4xl font-bold text-purple-400 mb-5">
                      $19<span className="text-base text-gray-400">/month</span>
                    </div>
                    <ul className="space-y-3 text-base text-gray-300">
                      <li className="flex items-center justify-center gap-3">
                        <CheckCircle className="w-5 h-5 text-purple-400" />4 CPU Cores
                      </li>
                      <li className="flex items-center justify-center gap-3">
                        <CheckCircle className="w-5 h-5 text-purple-400" />
                        4GB RAM
                      </li>
                      <li className="flex items-center justify-center gap-3">
                        <CheckCircle className="w-5 h-5 text-purple-400" />
                        50GB Storage
                      </li>
                      <li className="flex items-center justify-center gap-3">
                        <CheckCircle className="w-5 h-5 text-purple-400" />
                        Priority Support
                      </li>
                      <li className="flex items-center justify-center gap-3">
                        <CheckCircle className="w-5 h-5 text-purple-400" />
                        SSL Certificate
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* VM Configuration */}
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out p-8">
              <h3 className="text-2xl font-bold text-white mb-5">VM Configuration</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">Subdomain</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="myapp"
                      className="flex-1 bg-white/10 border border-white/20 rounded-l-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-inner"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
                    />
                    <span className="px-4 py-3 bg-white/5 border border-l-0 border-white/20 rounded-r-xl text-gray-300 text-sm">
                      .vmhost.com
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Only letters, numbers, and hyphens allowed</p>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">Root Password</label>
                  <input
                    type="password"
                    placeholder="Enter a secure password"
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-inner w-full"
                    value={vmPassword}
                    onChange={(e) => setVmPassword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && createVM()}
                  />
                </div>
                <button
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl shadow-lg transition-all duration-300 ease-in-out text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl active:scale-[0.98] active:shadow-inner w-full"
                  onClick={createVM}
                  disabled={!vmPassword || !subdomain || creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating VM...
                    </>
                  ) : (
                    <>
                      <Server className="w-5 h-5" />
                      Create VM - {selectedPlan === "free" ? "Free" : "$19/month"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* VM Details Section */
          <div className="space-y-8">
            {/* VM Action Row */}
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">VM Actions</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-100 font-semibold py-2 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  onClick={() => performAction("start")}
                  disabled={actionLoading === "start" || vm.status === "running"}
                >
                  {actionLoading === "start" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Start
                </button>
                <button
                  className="bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 text-yellow-100 font-semibold py-2 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  onClick={() => performAction("stop")}
                  disabled={actionLoading === "stop" || vm.status === "stopped"}
                >
                  {actionLoading === "stop" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  Stop
                </button>
                <button
                  className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-100 font-semibold py-2 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  onClick={() => performAction("restart")}
                  disabled={actionLoading === "restart"}
                >
                  {actionLoading === "restart" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  Restart
                </button>

                <button
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl shadow-lg transition-all duration-300 ease-in-out text-gray-200 bg-white/10 border border-white/20 hover:bg-white/20 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl active:scale-[0.98] active:shadow-inner py-2 px-4 text-sm"
                  onClick={() => setShowPasswordChangeModal(true)}
                >
                  <Key className="w-4 h-4" />
                  Change Password
                </button>

                <div className="relative ">
                  <button
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl shadow-lg transition-all duration-300 ease-in-out text-gray-200 bg-white/10 border border-white/20 hover:bg-white/20 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl active:scale-[0.98] active:shadow-inner py-2 px-3 text-sm"
                    onClick={() => setShowDropdown(!showDropdown)}
                    aria-expanded={showDropdown}
                    aria-haspopup="true"
                  >
                    <MoreVertical className="w-5 h-5" />
                    <span className="sr-only ">More actions</span>
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/15 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl z-10 p-2">
                      <div
                        className=" flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-md cursor-pointer transition-colors duration-150 text-red-300 hover:bg-red-500/20"
                        onClick={() => setShowRemoveConfirm(true)}
                      >
                        <Trash2 className="w-4 h-4 " />
                        Remove VM
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* VM Info Card */}
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Server className="w-8 h-8 text-purple-400" />
                  {vm.containerName}
                </h2>
                <StatusBadge status={vm.status} health={vm.health} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-lg text-gray-200">
                <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out bg-white/5 p-5 border-white/10">
                  <label className="text-sm text-gray-400 block mb-2">Domain</label>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-mono break-all">{vm.domain}</span>
                    <a
                      href={`http://${vm.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
                <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out bg-white/5 p-5 border-white/10">
                  <label className="text-sm text-gray-400 block mb-2">SSH Command</label>
                  <span className="text-white font-mono text-sm break-all">
                    ssh -p {vm.sshPort} root@{vm.network?.ipAddress || "localhost"}
                  </span>
                </div>
                <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out bg-white/5 p-5 border-white/10">
                  <label className="text-sm text-gray-400 block mb-2">HTTP Port</label>
                  <span className="text-white font-mono">{vm.httpPort}</span>
                </div>
                <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out bg-white/5 p-5 border-white/10">
                  <label className="text-sm text-gray-400 block mb-2">Created At</label>
                  <span className="text-white">{new Date(vm.createdAt).toLocaleString()}</span>
                </div>
                {vm.network && (
                  <>
                    <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out bg-white/5 p-5 border-white/10">
                      <label className="text-sm text-gray-400 block mb-2">Network Name</label>
                      <span className="text-white">{vm.network.name}</span>
                    </div>
                    <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out bg-white/5 p-5 border-white/10">
                      <label className="text-sm text-gray-400 block mb-2">IP Address</label>
                      <span className="text-white">{vm.network.ipAddress}</span>
                    </div>
                    <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out bg-white/5 p-5 border-white/10">
                      <label className="text-sm text-gray-400 block mb-2">Subnet</label>
                      <span className="text-white">{vm.network.subnet}</span>
                    </div>
                  </>
                )}
                {usageStats && (
                  <>
                    <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out bg-white/5 p-5 border-white/10">
                      <label className="text-sm text-gray-400 block mb-2">Root FS Size</label>
                      <span className="text-white">{usageStats.sizeRootFs}</span>
                    </div>
                    <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out bg-white/5 p-5 border-white/10">
                      <label className="text-sm text-gray-400 block mb-2">Writable Layer</label>
                      <span className="text-white">{usageStats.sizeRw}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Remove VM Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out bg-white/15 border-white/20 p-10 rounded-3xl shadow-3xl max-w-md w-full text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Are you absolutely sure?</h3>
            <p className="text-lg text-gray-200 mb-8">
              This action cannot be undone. This will permanently delete your virtual machine and all its data.
            </p>
            <div className="flex justify-center space-x-5">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl shadow-lg transition-all duration-300 ease-in-out text-gray-200 bg-white/10 border border-white/20 hover:bg-white/20 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl active:scale-[0.98] active:shadow-inner px-8 py-3"
              >
                Cancel
              </button>
              <button
                onClick={() => performAction("remove")}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl shadow-lg transition-all duration-300 ease-in-out text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl active:scale-[0.98] active:shadow-inner px-8 py-3"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out bg-white/15 border-white/20 p-10 rounded-3xl shadow-3xl max-w-md w-full text-center">
            <h3 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Key className="w-8 h-8 text-purple-400" />
              Update SSH Password
            </h3>
            <p className="text-lg text-gray-200 mb-8">Enter a new root password for your virtual machine.</p>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-100 p-3 rounded-lg mb-6 text-sm">
                {errorMessage}
              </div>
            )}

            <div className="space-y-6 mb-8">
              <input
                type="password"
                placeholder="New secure password"
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-inner w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && updatePassword()}
              />
            </div>
            <div className="flex justify-center space-x-5">
              <button
                onClick={() => {
                  setShowPasswordChangeModal(false)
                  setNewPassword("") // Clear password on close
                  setErrorMessage("") // Clear error message on close
                }}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl shadow-lg transition-all duration-300 ease-in-out text-gray-200 bg-white/10 border border-white/20 hover:bg-white/20 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl active:scale-[0.98] active:shadow-inner px-8 py-3"
              >
                Cancel
              </button>
              <button
                onClick={updatePassword}
                disabled={!newPassword || passwordUpdating}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl shadow-lg transition-all duration-300 ease-in-out text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl active:scale-[0.98] active:shadow-inner px-8 py-3"
              >
                {passwordUpdating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
