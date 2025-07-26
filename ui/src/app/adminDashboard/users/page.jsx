"use client"

import { useState, useEffect, useCallback, forwardRef } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import {
  Shield,
  LayoutDashboard,
  Users,
  Crown,
  ChevronDown,
  User,
  Settings,
  LogOut,
  UserCog,
  UserCheck,
  LineChart,
  Plus,
  RefreshCw,
  Download,
  Edit,
  Key,
  Trash2,
  CreditCard,
  MessageCircle,
  Mail,
  MessageSquare,
  CloudUpload,
  Bell,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import React from "react"

// --- API Configuration ---
const API_BASE_URL = "http://localhost:3000/api/admin" // Assuming Next.js API routes at /api/admin

const getAuthHeaders = () => {
  const token = Cookies.get("token")
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  }
}

// --- Custom UI Components (Inline Definitions) ---

// Button Component
const Button = forwardRef(({ className, variant = "default", size = "default", onClick, children, ...props }, ref) => {
  const baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  }
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
})
Button.displayName = "Button"

// Input Component
const Input = forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

// Select Components (Refactored for correct HTML structure)
const SelectContext = React.createContext(null)

const Select = ({ value, onValueChange, children, name, ...props }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [displayValue, setDisplayValue] = useState("")
  const selectRef = React.useRef(null)

  const handleSelect = useCallback(
    (newValue, newDisplay) => {
      onValueChange(newValue)
      setDisplayValue(newDisplay)
      setIsOpen(false)
    },
    [onValueChange],
  )

  // Find the initial display value based on the provided value and children
  useEffect(() => {
    React.Children.forEach(children, (child) => {
      if (child.type === SelectContent) {
        React.Children.forEach(child.props.children, (item) => {
          if (item.props.value === value) {
            setDisplayValue(item.props.children)
          }
        })
      }
    })
  }, [value, children])

  const contextValue = {
    value,
    displayValue,
    isOpen,
    setIsOpen,
    handleSelect,
  }

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative" {...props}>
        {/* Hidden native select for form submission and accessibility */}
        <select
          ref={selectRef}
          value={value}
          onChange={(e) => {
            const selectedOption = Array.from(e.target.options).find((opt) => opt.value === e.target.value)
            handleSelect(e.target.value, selectedOption ? selectedOption.textContent : e.target.value)
          }}
          className="sr-only" // Visually hide the native select
          aria-hidden="true" // Hide from accessibility tree if custom UI is fully accessible
          tabIndex={-1} // Prevent tabbing to it
          name={name} // Pass the name prop to the native select
        >
          {React.Children.map(children, (child) => {
            if (child.type === SelectContent) {
              return React.Children.map(child.props.children, (item) => (
                <option value={item.props.value}>{item.props.children}</option>
              ))
            }
            return null
          })}
        </select>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = forwardRef(({ className, children, ...props }, ref) => {
  const { displayValue, setIsOpen, isOpen } = React.useContext(SelectContext)
  return (
    <div
      ref={ref}
      className={`flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 ${className}`}
      onClick={() => setIsOpen((prev) => !prev)}
      tabIndex={0} // Make it focusable
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      {...props}
    >
      <span>{displayValue || children}</span>
      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </div>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ children }) => {
  const { displayValue } = React.useContext(SelectContext)
  return displayValue || children
}
SelectValue.displayName = "SelectValue"

const SelectContent = forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen } = React.useContext(SelectContext)
  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${className}`}
      role="listbox"
      {...props}
    >
      {children}
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = forwardRef(({ value, children, className, ...props }, ref) => {
  const { handleSelect } = React.useContext(SelectContext)
  return (
    <div
      ref={ref}
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
      onClick={() => handleSelect(value, children)}
      role="option"
      aria-selected={value === React.useContext(SelectContext).value}
      tabIndex={0} // Make it focusable
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

// Table Components
const Table = ({ className, children, ...props }) => (
  <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
    {children}
  </table>
)
const TableHeader = ({ className, children, ...props }) => (
  <thead className={`[&_tr]:border-b ${className}`} {...props}>
    {children}
  </thead>
)
const TableBody = ({ className, children, ...props }) => (
  <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props}>
    {children}
  </tbody>
)
const TableRow = ({ className, children, ...props }) => (
  <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`} {...props}>
    {children}
  </tr>
)
const TableHead = ({ className, children, ...props }) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </th>
)
const TableCell = ({ className, children, ...props }) => (
  <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>
    {children}
  </td>
)

// Card Components
const Card = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={`rounded-xl border bg-card text-card-foreground shadow ${className}`} {...props}>
    {children}
  </div>
))
Card.displayName = "Card"

const CardHeader = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
))
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={`font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h3>
))
CardTitle.displayName = "CardTitle"

const CardContent = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
))
CardContent.displayName = "CardContent"

// Dialog Components (simplified for inline)
const Dialog = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    open && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        onClick={() => onOpenChange(false)}
      >
        <div className="relative z-50" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    )
  )
}
const DialogContent = ({ className, children }) => (
  <div className={`relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg ${className}`}>
    {children}
  </div>
)
const DialogHeader = ({ className, children }) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}>{children}</div>
)
const DialogTitle = ({ className, children }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
)
const DialogFooter = ({ className, children }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}>{children}</div>
)

// Label Component
const Label = forwardRef(({ className, children, ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  >
    {children}
  </label>
))
Label.displayName = "Label"

// Checkbox Component
const Checkbox = forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => (
  <input
    type="checkbox"
    ref={ref}
    className={`peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground ${className}`}
    checked={checked}
    onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
    {...props}
  />
))
Checkbox.displayName = "Checkbox"

// DropdownMenu Components (simplified for inline)
const DropdownMenu = ({ open, onOpenChange, children }) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen)
    }
  }, [isOpen, onOpenChange])

  useEffect(() => {
    if (typeof open === "boolean") {
      setIsOpen(open)
    }
  }, [open])

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <div className="relative">
      {children.map((child, index) => {
        if (child.type === DropdownMenuTrigger) {
          return (
            <div key={index} onClick={handleToggle}>
              {child.props.asChild ? child.props.children : <button>{child.props.children}</button>}
            </div>
          )
        }
        if (child.type === DropdownMenuContent && isOpen) {
          return (
            <div
              key={index}
              className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${child.props.className}`}
            >
              {child.props.children.map((item, itemIndex) => {
                if (item.type === DropdownMenuItem) {
                  return (
                    <div key={itemIndex} onClick={handleClose}>
                      {item}
                    </div>
                  )
                }
                return item
              })}
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

const DropdownMenuTrigger = ({ asChild, children }) => {
  return asChild ? children : <button>{children}</button>
}

const DropdownMenuContent = ({ className, children }) => {
  return <div className={className}>{children}</div>
}

const DropdownMenuItem = ({ className, onClick, children }) => (
  <div
    className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
)

// Separator Component
const Separator = forwardRef(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    role="none"
    className={`shrink-0 bg-border ${orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"} ${className}`}
    {...props}
  />
))
Separator.displayName = "Separator"

// --- Main AdminDashboard Component ---

export default function AdminDashboard() {
  const router = useRouter()

  const [currentPage, setCurrentPage] = useState("overview")
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    activeUsers: 0,
    totalApiCalls: 0,
    regularUsers: 0,
    paidUsers: 0,
    recentUsers: 0,
    revenue: 0,
  })
  const [filterSearchTerm, setFilterSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSubscription, setFilterSubscription] = useState("all")
  const [currentPageNum, setCurrentPageNum] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [usersPerPage, setUsersPerPage] = useState(10) // Default limit

  const availableServices = [
    { id: "payment-gateway", name: "Payment Gateway", icon: CreditCard },
    { id: "whatsapp-api", name: "WhatsApp API", icon: MessageCircle },
    { id: "otp-service", name: "OTP Service", icon: Shield },
    { id: "email-api", name: "Email API", icon: Mail },
    { id: "sms-gateway", name: "SMS Gateway", icon: MessageSquare },
    { id: "file-storage", name: "File Storage", icon: CloudUpload },
    { id: "analytics", name: "Analytics API", icon: LineChart },
    { id: "notifications", name: "Push Notifications", icon: Bell },
  ]

  // Authentication Check
  useEffect(() => {
    const token = Cookies.get("token") // Assuming 'token' is the cookie name
    if (!token) {
      router.push("/login") // Redirect to login page if no token
    }
  }, [router])

  // Initial data load
  useEffect(() => {
    loadUsers(currentPageNum, usersPerPage)
    loadStats()
  }, [currentPageNum, usersPerPage]) // Depend on page and limit for re-fetch

  const navigateToPage = useCallback((page) => {
    setCurrentPage(page)
  }, [])

  const toggleUserDropdown = useCallback(() => {
    setShowUserDropdown((prev) => !prev)
  }, [])

  const openModal = useCallback((modalType, user = null) => {
    if (modalType === "addUser") {
      setShowAddUserModal(true)
    } else if (modalType === "editUser") {
      setSelectedUser(user)
      setShowEditUserModal(true)
    } else if (modalType === "changePassword") {
      setSelectedUser(user)
      setShowChangePasswordModal(true)
    }
  }, [])

  const closeModal = useCallback((modalType) => {
    if (modalType === "addUser") {
      setShowAddUserModal(false)
    } else if (modalType === "editUser") {
      setShowEditUserModal(false)
      setSelectedUser(null)
    } else if (modalType === "changePassword") {
      setShowChangePasswordModal(false)
      setSelectedUser(null)
    }
  }, [])

  const showAlert = useCallback((type, message) => {
    alert(`${type.toUpperCase()}: ${message}`)
  }, [])

  const loadUsers = useCallback(
    async (page, limit) => {
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        })
        if (filterSearchTerm) queryParams.append("search", filterSearchTerm)
        if (filterRole !== "all") queryParams.append("role", filterRole)
        if (filterStatus !== "all") queryParams.append("status", filterStatus)
        if (filterSubscription !== "all") queryParams.append("subscription", filterSubscription)

        const response = await fetch(`${API_BASE_URL}/users?${queryParams.toString()}`, {
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch users")
        }

        const data = await response.json()
        setUsers(data.users)
        setTotalPages(data.totalPages)
        setCurrentPageNum(data.currentPage)
        showAlert("success", "Users loaded successfully!")
      } catch (error) {
        showAlert("error", "Failed to load users: " + error.message)
      }
    },
    [showAlert, filterSearchTerm, filterRole, filterStatus, filterSubscription],
  )

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch statistics")
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }, [])

  useEffect(() => {
    loadUsers(1, usersPerPage) // Reset to first page on filter change
  }, [filterSearchTerm, filterRole, filterStatus, filterSubscription, usersPerPage])

  const handleAddUser = useCallback(
    async (e) => {
      e.preventDefault()
      const formData = new FormData(e.target)
      const newUserData = {
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
        status: formData.get("status"),
        subscription: formData.get("subscription"),
        services: formData.getAll("services"),
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(newUserData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create user")
        }

        await response.json() // Consume response
        loadUsers(currentPageNum, usersPerPage) // Refresh users
        loadStats() // Refresh stats
        showAlert("success", "User created successfully!")
        closeModal("addUser")
        e.target.reset()
      } catch (error) {
        showAlert("error", "Failed to create user: " + error.message)
      }
    },
    [showAlert, closeModal, loadUsers, loadStats, currentPageNum, usersPerPage],
  )

  const handleEditUser = useCallback(
    async (e) => {
      e.preventDefault()
      const formData = new FormData(e.target)
      const userId = formData.get("userId")
      const updatedUserData = {
        username: formData.get("username"),
        email: formData.get("email"),
        role: formData.get("role"),
        status: formData.get("status"),
        subscription: formData.get("subscription"),
        services: formData.getAll("services"),
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(updatedUserData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to update user")
        }

        await response.json() // Consume response
        loadUsers(currentPageNum, usersPerPage) // Refresh users
        loadStats() // Refresh stats
        showAlert("success", "User updated successfully!")
        closeModal("editUser")
      } catch (error) {
        showAlert("error", "Failed to update user: " + error.message)
      }
    },
    [showAlert, closeModal, loadUsers, loadStats, currentPageNum, usersPerPage],
  )

  const handleChangePassword = useCallback(
    async (e) => {
      e.preventDefault()
      const formData = new FormData(e.target)
      const userId = formData.get("userId")
      const newPassword = formData.get("password")

      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ password: newPassword }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to change password")
        }

        await response.json() // Consume response
        showAlert("success", "Password changed successfully!")
        closeModal("changePassword")
        e.target.reset()
      } catch (error) {
        showAlert("error", "Failed to change password: " + error.message)
      }
    },
    [showAlert, closeModal],
  )

  const deleteUser = useCallback(
    async (userId) => {
      if (!confirm("Are you sure you want to delete this user?")) return

      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to delete user")
        }

        await response.json() // Consume response
        loadUsers(currentPageNum, usersPerPage) // Refresh users
        loadStats() // Refresh stats
        showAlert("success", "User deleted successfully!")
      } catch (error) {
        showAlert("error", "Failed to delete user: " + error.message)
      }
    },
    [showAlert, loadUsers, loadStats, currentPageNum, usersPerPage],
  )

  const exportUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/export/users`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to export users")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `users_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.click()
      showAlert("success", "Users exported successfully!")
    } catch (error) {
      showAlert("error", "Failed to export users: " + error.message)
    }
  }, [showAlert])

  const handleLogout = useCallback(() => {
    if (confirm("Are you sure you want to logout?")) {
      Cookies.remove("token") // Remove the authentication cookie
      router.push("/login")
    }
  }, [router])

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <nav className="fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 p-4 flex flex-col">
        <div className="mb-6 flex items-center justify-center py-4">
          <Shield className="mr-2 h-8 w-8 text-purple-400" />
          <span className="text-2xl font-bold text-white">Admin Panel</span>
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <div className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Dashboard</div>
            <Button
              variant="ghost"
              className={`flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-700 ${
                currentPage === "overview" ? "bg-gray-700 text-white" : "text-gray-300"
              }`}
              onClick={() => navigateToPage("overview")}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Overview</span>
            </Button>
            <Button
              variant="ghost"
              className={`flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-700 ${
                currentPage === "users" ? "bg-gray-700 text-white" : "text-gray-300"
              }`}
              onClick={() => navigateToPage("users")}
            >
              <Users className="h-5 w-5" />
              <span>User Management</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 transition-all duration-300 ease-in-out ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-700 bg-gray-800 px-4 shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-gray-400">
              <span>Admin Panel</span>
              <span className="mx-2">/</span>
              <span className="font-semibold capitalize text-white">{currentPage}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white">
              <Crown className="h-4 w-4" />
              Admin
            </div>
            <DropdownMenu open={showUserDropdown} onOpenChange={setShowUserDropdown}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 rounded-full px-3 py-1 text-gray-300 hover:bg-gray-700"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-sm font-bold text-white">
                    A
                  </div>
                  <span className="hidden md:inline">Admin</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-gray-800 text-gray-200">
                <DropdownMenuItem className="flex items-center gap-2 hover:bg-gray-700">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 hover:bg-gray-700">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <Separator className="my-1 bg-gray-700" />
                <DropdownMenuItem className="flex items-center gap-2 hover:bg-gray-700" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Overview Page */}
          {currentPage === "overview" && (
            <div id="overviewPage" className="space-y-6">
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400">Monitor and manage your platform users and services.</p>

              {/* Stats Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="backdrop-blur-2xl border-white/10 bg-white/5 shadow-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
                    <Users className="h-5 w-5 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                  </CardContent>
                </Card>
                <Card className="backdrop-blur-2xl border-white/10 bg-white/5 shadow-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Admin Users</CardTitle>
                    <UserCog className="h-5 w-5 text-red-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.adminUsers}</div>
                  </CardContent>
                </Card>
                <Card className="backdrop-blur-2xl border-white/10 bg-white/5 shadow-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Active Users</CardTitle>
                    <UserCheck className="h-5 w-5 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.activeUsers}</div>
                  </CardContent>
                </Card>
                <Card className="backdrop-blur-2xl border-white/10 bg-white/5 shadow-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">API Calls</CardTitle>
                    <LineChart className="h-5 w-5 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.totalApiCalls.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Users Page */}
          {currentPage === "users" && (
            <div id="usersPage" className="space-y-6">
              <h1 className="text-3xl font-bold text-white">User Management</h1>
              <p className="text-gray-400">Manage users, their services, and subscription status.</p>

              {/* Search and Filter Bar */}
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 shadow-inner">
                <Input
                  type="text"
                  placeholder="Search users by username or email..."
                  className="flex-1 min-w-[200px] bg-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  value={filterSearchTerm}
                  onChange={(e) => setFilterSearchTerm(e.target.value)}
                />
                <Select name="roleFilter" value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[180px] bg-gray-700 text-white">
                    <SelectValue>{filterRole === "all" ? "All Roles" : filterRole}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                <Select name="statusFilter" value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px] bg-gray-700 text-white">
                    <SelectValue>{filterStatus === "all" ? "All Status" : filterStatus}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select name="subscriptionFilter" value={filterSubscription} onValueChange={setFilterSubscription}>
                  <SelectTrigger className="w-[180px] bg-gray-700 text-white">
                    <SelectValue>{filterSubscription === "all" ? "All Subscriptions" : filterSubscription}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white">
                    <SelectItem value="all">All Subscriptions</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => openModal("addUser")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>

              {/* Users Table */}
              <Card className="backdrop-blur-2xl border-white/10 bg-white/5 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-white">All Users</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => loadUsers(currentPageNum, usersPerPage)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700" onClick={exportUsers}>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">User</TableHead>
                          <TableHead className="text-gray-300">Role</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Subscription</TableHead>
                          <TableHead className="text-gray-300">Services</TableHead>
                          <TableHead className="text-gray-300">API Calls</TableHead>
                          <TableHead className="text-gray-300">Last IP</TableHead>
                          <TableHead className="text-gray-300">Created</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.length > 0 ? (
                          users.map((user) => (
                            <TableRow key={user._id} className="border-gray-700 hover:bg-white/5">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-sm font-bold text-white">
                                    {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-white">{user.username}</div>
                                    <div className="text-xs text-gray-400">{user.email || "No email"}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                                    user.role === "admin"
                                      ? "bg-red-500/20 text-red-300"
                                      : "bg-blue-500/20 text-blue-300"
                                  }`}
                                >
                                  {user.role}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                                    user.status === "active"
                                      ? "bg-green-500/20 text-green-300"
                                      : "bg-gray-500/20 text-gray-300"
                                  }`}
                                >
                                  {user.status || "active"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                                    user.subscription === "paid"
                                      ? "bg-yellow-500/20 text-yellow-300"
                                      : "bg-gray-500/20 text-gray-300"
                                  }`}
                                >
                                  {user.subscription || "unpaid"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {(user.services || []).length > 0 ? (
                                    user.services.map((serviceId) => {
                                      const service = availableServices.find((s) => s.id === serviceId)
                                      return (
                                        <span
                                          key={serviceId}
                                          className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-300"
                                        >
                                          {service ? service.name : serviceId}
                                        </span>
                                      )
                                    })
                                  ) : (
                                    <span className="rounded-full bg-gray-500/20 px-2 py-1 text-xs text-gray-300">
                                      None
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-white">{(user.apiCalls || 0).toLocaleString()}</TableCell>
                              <TableCell>
                                <code className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300">
                                  {user.lastIP || "0.0.0.0"}
                                </code>
                              </TableCell>
                              <TableCell>
                                <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                                <div className="text-xs text-gray-400">
                                  {new Date(user.createdAt).toLocaleTimeString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 bg-transparent"
                                    onClick={() => openModal("editUser", user)}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 bg-transparent"
                                    onClick={() => openModal("changePassword", user)}
                                  >
                                    <Key className="h-4 w-4" />
                                    <span className="sr-only">Change Password</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-red-500/50 text-red-400 hover:bg-red-500/20 bg-transparent"
                                    onClick={() => deleteUser(user._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center text-gray-400 py-4">
                              No users found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Pagination */}
                  <div className="flex items-center justify-between py-4">
                    <Button
                      variant="secondary"
                      onClick={() => loadUsers(currentPageNum - 1, usersPerPage)}
                      disabled={currentPageNum <= 1}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-300">
                      Page {currentPageNum} of {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      onClick={() => loadUsers(currentPageNum + 1, usersPerPage)}
                      disabled={currentPageNum >= totalPages}
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Add User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={() => closeModal("addUser")}>
        <DialogContent className="backdrop-blur-2xl border-white/10 bg-white/5 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add New User</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-gray-400 hover:bg-gray-700"
              onClick={() => closeModal("addUser")}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="add-username">Username</Label>
                <Input id="add-username" name="username" required className="bg-gray-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-email">Email</Label>
                <Input id="add-email" name="email" type="email" required className="bg-gray-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-password">Password</Label>
                <Input id="add-password" name="password" type="password" required className="bg-gray-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-role">Role</Label>
                <Select name="role" defaultValue="user" onValueChange={(val) => {}}>
                  <SelectTrigger id="add-role" className="bg-gray-700 text-white">
                    <SelectValue>User</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white">
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-status">Status</Label>
                <Select name="status" defaultValue="active" onValueChange={(val) => {}}>
                  <SelectTrigger id="add-status" className="bg-gray-700 text-white">
                    <SelectValue>Active</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-subscription">Subscription</Label>
                <Select name="subscription" defaultValue="unpaid" onValueChange={(val) => {}}>
                  <SelectTrigger id="add-subscription" className="bg-gray-700 text-white">
                    <SelectValue>Unpaid</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white">
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Available Services</Label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3" id="servicesCheckboxes">
                {availableServices.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox id={`add_${service.id}`} name="services" value={service.id} />
                    <Label htmlFor={`add_${service.id}`} className="flex items-center gap-2 text-sm">
                      <service.icon className="h-4 w-4 text-gray-400" />
                      {service.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => closeModal("addUser")}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditUserModal} onOpenChange={() => closeModal("editUser")}>
        <DialogContent className="backdrop-blur-2xl border-white/10 bg-white/5 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit User</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-gray-400 hover:bg-gray-700"
              onClick={() => closeModal("editUser")}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleEditUser} className="space-y-4">
              <Input type="hidden" name="userId" value={selectedUser._id} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    name="username"
                    defaultValue={selectedUser.username}
                    required
                    className="bg-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    defaultValue={selectedUser.email}
                    required
                    className="bg-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select name="role" defaultValue={selectedUser.role} onValueChange={(val) => {}}>
                    <SelectTrigger id="edit-role" className="bg-gray-700 text-white">
                      <SelectValue>{selectedUser.role}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white">
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select name="status" defaultValue={selectedUser.status || "active"} onValueChange={(val) => {}}>
                    <SelectTrigger id="edit-status" className="bg-gray-700 text-white">
                      <SelectValue>{selectedUser.status || "active"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-subscription">Subscription</Label>
                  <Select
                    name="subscription"
                    defaultValue={selectedUser.subscription || "unpaid"}
                    onValueChange={(val) => {}}
                  >
                    <SelectTrigger id="edit-subscription" className="bg-gray-700 text-white">
                      <SelectValue>{selectedUser.subscription || "unpaid"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white">
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Available Services</Label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3" id="editServicesCheckboxes">
                  {availableServices.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit_${service.id}`}
                        name="services"
                        value={service.id}
                        defaultChecked={(selectedUser.services || []).includes(service.id)}
                      />
                      <Label htmlFor={`edit_${service.id}`} className="flex items-center gap-2 text-sm">
                        <service.icon className="h-4 w-4 text-gray-400" />
                        {service.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => closeModal("editUser")}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  <Edit className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={showChangePasswordModal} onOpenChange={() => closeModal("changePassword")}>
        <DialogContent className="backdrop-blur-2xl border-white/10 bg-white/5 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Change Password</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-gray-400 hover:bg-gray-700"
              onClick={() => closeModal("changePassword")}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input type="hidden" name="userId" value={selectedUser._id} />
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" name="password" type="password" required className="bg-gray-700 text-white" />
              </div>
              <DialogFooter className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => closeModal("changePassword")}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
