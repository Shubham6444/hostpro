"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { toast, Toaster } from "react-hot-toast"
import {
  Folder,
  FolderOpen,
  File,
  Save,
  Upload,
  Download,
  Trash2,
  Edit,
  Copy,
  Move,
  RefreshCw,
  Search,
  Plus,
  Loader2,
  FileText,
  ImageIcon,
  Code,
  Database,
  Music,
  Video,
  Archive,
  Settings,
  User,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  
} from "lucide-react"

const GATEWAY_URL = "http://localhost:3002" // Replace with your actual gateway URL
const GATEWAY = "http://localhost:3000" // Replace with your actual gateway URL

// Enhanced file type icons
const fileIcons = {
  js: Code,
  jsx: Code,
  ts: Code,
  tsx: Code,
  html: Code,
  htm: Code,
  css: Code,
  scss: Code,
  sass: Code,
  json: FileText,
  xml: FileText,
  yaml: FileText,
  yml: FileText,
  md: FileText,
  txt: FileText,
  doc: FileText,
  docx: FileText,
  png: ImageIcon,
  jpg: ImageIcon,
  jpeg: ImageIcon,
  gif: ImageIcon,
  svg: ImageIcon,
  ico: ImageIcon,
  pdf: FileText,
  zip: Archive,
  rar: Archive,
  tar: Archive,
  gz: Archive,
  mp3: Music,
  wav: Music,
  flac: Music,
  mp4: Video,
  avi: Video,
  mov: Video,
  py: Code,
  php: Code,
  java: Code,
  cpp: Code,
  c: Code,
  sql: Database,
  db: Database,
  sqlite: Database,
  env: Settings,
  config: Settings,
  ini: Settings,
  default: File,


  
}

const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(";").shift()
}

const EditorPage = () => {
  const [user, setUser] = useState({ username: "Guest", role: "user" })
  const [fileTree, setFileTree] = useState([])
  const [currentFile, setCurrentFile] = useState(null)
  const [currentFolder, setCurrentFolder] = useState("")
  const [selectedItem, setSelectedItem] = useState(null)
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [isModified, setIsModified] = useState(false)
  const [editorContent, setEditorContent] = useState("")
  const [statusText, setStatusText] = useState("Ready")
  const [cursorPosition, setCursorPosition] = useState("Line 1, Column 1")
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 })
  const [createModal, setCreateModal] = useState({ visible: false, type: "file" })
  const [renameModal, setRenameModal] = useState({ visible: false })
  const [copyMoveModal, setCopyMoveModal] = useState({ visible: false, type: "copy" })
  const [createName, setCreateName] = useState("")
  const [createLocation, setCreateLocation] = useState("")
  const [fileType, setFileType] = useState("txt")
  const [renameInput, setRenameInput] = useState("")
  const [destinationPath, setDestinationPath] = useState("")
  const [destinationSelect, setDestinationSelect] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Loading states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [copying, setCopying] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const editorRef = useRef(null)
  const searchInputRef = useRef(null)
  const fileUploadRef = useRef(null)

  const saveFile = useCallback(async () => {
    if (!currentFile) return
    try {
      setSaving(true)
      setStatusText("Saving file...")
      const token = getCookie("token")
      const response = await fetch(`${GATEWAY_URL}/editor/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ path: currentFile, content: editorContent }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save file")
      }
      setIsModified(false)
      toast.success("File saved successfully")
      setStatusText("File saved")
    } catch (error) {
      toast.error("Failed to save file: " + error.message)
      setStatusText("Error saving file")
    } finally {
      setSaving(false)
    }
  }, [currentFile, editorContent])

  const deleteSelected = useCallback(async () => {
    if (!selectedItem) return
    if (!confirm(`Are you sure you want to delete this ${selectedItem.type}: "${selectedItem.path.split("/").pop()}"?`))
      return
    try {
      setDeleting(true)
      const token = getCookie("token")
      const response = await fetch(`${GATEWAY_URL}/editor/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ path: selectedItem.path }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to delete ${selectedItem.type}`)
      }
      if (currentFile === selectedItem.path) {
        setCurrentFile(null)
        setEditorContent("")
        setIsModified(false)
      }
      setSelectedItem(null)
      await loadFileTree()
      toast.success(`${selectedItem.type} deleted successfully`)
    } catch (error) {
      toast.error(`Failed to delete ${selectedItem.type}: ` + error.message)
    } finally {
      setDeleting(false)
    }
  }, [selectedItem, currentFile])

  useEffect(() => {
    fetchUserInfo()
    loadFileTree()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault()
            saveFile()
            break
          case "n":
            e.preventDefault()
            setCreateModal({ visible: true, type: "file" })
            break
          case "f":
            e.preventDefault()
            searchInputRef.current?.focus()
            break
        }
      }
      if (e.key === "Delete" && selectedItem) deleteSelected()
      if (e.key === "F2" && selectedItem) setRenameModal({ visible: true })
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedItem, saveFile, deleteSelected])

  const fetchUserInfo = async () => {
    try {
      const token = getCookie("token")
      const res = await fetch(`${GATEWAY}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const userData = await res.json()
        setUser(userData)
      } else {
        toast.error("Session expired. Please login again.")
      }
    } catch (err) {
      console.error("Failed to fetch user:", err)
    }
  }

  const getFileIcon = (filename, isFolder = false, isExpanded = false) => {
    if (isFolder) return isExpanded ? FolderOpen : Folder
    if (!filename) return File
    const ext = filename.split(".").pop()?.toLowerCase()
    return fileIcons[ext] || fileIcons.default
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const loadFileTree = async () => {
    try {
      setRefreshing(true)
      setStatusText("Loading file tree...")
      const token = getCookie("token")
      const response = await fetch(`${GATEWAY_URL}/editor/list`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to load file tree")
      const data = await response.json()
      setFileTree(data)
      setStatusText("Ready")
    } catch (error) {
      toast.error("Failed to load file tree: " + error.message)
      setStatusText("Error loading files")
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  const loadFile = async (path) => {
    try {
      setStatusText("Loading file...")
      const token = getCookie("token")
      const response = await fetch(`${GATEWAY_URL}/editor/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ path }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to load file")
      }
      const data = await response.json()
      setCurrentFile(path)
      setEditorContent(data.content || "")
      setIsModified(false)
      setStatusText("File loaded")
    } catch (error) {
      toast.error("Failed to load file: " + error.message)
      setStatusText("Error loading file")
    }
  }

  const handleEditorChange = (e) => {
    setEditorContent(e.target.value)
    setIsModified(true)
    updateCursorPosition()
  }

  const updateCursorPosition = () => {
    const editor = editorRef.current
    if (!editor) return
    const text = editor.value
    const cursorPos = editor.selectionStart
    const lines = text.substring(0, cursorPos).split("\n")
    const line = lines.length
    const column = lines[lines.length - 1].length + 1
    setCursorPosition(`Line ${line}, Column ${column}`)
  }

  const toggleFolder = (path) => {
    const newExpandedFolders = new Set(expandedFolders)
    if (newExpandedFolders.has(path)) {
      newExpandedFolders.delete(path)
    } else {
      newExpandedFolders.add(path)
    }
    setExpandedFolders(newExpandedFolders)
  }

  const filterNodes = (nodes, searchTerm) => {
    if (!searchTerm) return nodes
    return nodes
      .filter((node) => {
        if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return true
        }
        if (node.children) {
          const filteredChildren = filterNodes(node.children, searchTerm)
          return filteredChildren.length > 0
        }
        return false
      })
      .map((node) => ({
        ...node,
        children: node.children ? filterNodes(node.children, searchTerm) : undefined,
      }))
  }

  const renderTreeNodes = (nodes, level = 0, parentPath = "") => {
    const filteredNodes = filterNodes(nodes, searchTerm)

    return filteredNodes.map((node) => {
      const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name
      const isExpanded = expandedFolders.has(fullPath)
      const IconComponent = getFileIcon(node.name, node.type === "folder", isExpanded)
      const isSelected = selectedItem?.path === fullPath

      return (
        <div key={fullPath}>
          <div
            className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-all duration-200 rounded-lg mx-2 ${
              isSelected
                ? "bg-purple-500/30 border border-purple-400/50 text-white"
                : "hover:bg-white/10 text-gray-300 hover:text-white"
            }`}
            style={{ paddingLeft: 12 + level * 20 + "px" }}
            onClick={() => {
              setSelectedItem({ path: fullPath, type: node.type })
              if (node.type === "file") loadFile(fullPath)
              else toggleFolder(fullPath)
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setSelectedItem({ path: fullPath, type: node.type })
              setContextMenu({ visible: true, x: e.clientX, y: e.clientY })
            }}
          >
            {node.type === "folder" && node.children?.length > 0 && (
              <button
                className="p-1 hover:bg-white/20 rounded"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFolder(fullPath)
                }}
              >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            )}
            <IconComponent className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 truncate text-sm">{node.name}</span>
            {node.type === "file" && node.size && (
              <span className="text-xs text-gray-400">{formatFileSize(node.size)}</span>
            )}
          </div>
          {isExpanded && node.children && (
            <div className="ml-2">{renderTreeNodes(node.children, level + 1, fullPath)}</div>
          )}
        </div>
      )
    })
  }

  const confirmCreate = async () => {
    if (!createName) {
      toast.error("Please enter a name")
      return
    }
    let fullPath = createLocation ? `${createLocation}/${createName}` : createName
    if (createModal.type === "file" && !createName.includes(".")) {
      fullPath += `.${fileType}`
    }
    try {
      setCreating(true)
      setStatusText(`Creating ${createModal.type}...`)
      const endpoint = createModal.type === "folder" ? "/editor/mkdir" : "/editor/save"
      const body = createModal.type === "folder" ? { path: fullPath } : { path: fullPath, content: "" }
      const token = getCookie("token")
      const response = await fetch(`${GATEWAY_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to create ${createModal.type}`)
      }
      setCreateModal({ visible: false, type: "file" })
      setCreateName("")
      setCreateLocation("")
      await loadFileTree()
      toast.success(`${createModal.type} created successfully`)
      if (createModal.type === "file") loadFile(fullPath)
    } catch (error) {
      toast.error(`Failed to create ${createModal.type}: ` + error.message)
    } finally {
      setCreating(false)
    }
  }

  const confirmRename = async () => {
    if (!renameInput || !selectedItem) return
    try {
      setRenaming(true)
      const pathParts = selectedItem.path.split("/")
      pathParts[pathParts.length - 1] = renameInput
      const newPath = pathParts.join("/")
      const token = getCookie("token")
      const response = await fetch(`${GATEWAY_URL}/editor/rename`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPath: selectedItem.path, newPath }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to rename item")
      }
      if (currentFile === selectedItem.path) setCurrentFile(newPath)
      setRenameModal({ visible: false })
      setRenameInput("")
      await loadFileTree()
      toast.success("Item renamed successfully")
    } catch (error) {
      toast.error("Failed to rename item: " + error.message)
    } finally {
      setRenaming(false)
    }
  }

  const confirmCopyMove = async () => {
    if (!selectedItem) return
    let dest = destinationPath
    if (!dest && destinationSelect) {
      const itemName = selectedItem.path.split("/").pop()
      dest = destinationSelect ? `${destinationSelect}/${itemName}` : itemName
    }
    if (!dest) {
      toast.error("Please enter a destination path")
      return
    }
    try {
      setCopying(true)
      const endpoint = copyMoveModal.type === "copy" ? "/editor/copy" : "/editor/move"
      const token = getCookie("token")
      const response = await fetch(`${GATEWAY_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sourcePath: selectedItem.path, destPath: dest }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${copyMoveModal.type} item`)
      }
      if (copyMoveModal.type === "move" && currentFile === selectedItem.path) setCurrentFile(dest)
      setCopyMoveModal({ visible: false, type: "copy" })
      setDestinationPath("")
      setDestinationSelect("")
      await loadFileTree()
      toast.success(`Item ${copyMoveModal.type}d successfully`)
    } catch (error) {
      toast.error(`Failed to ${copyMoveModal.type} item: ` + error.message)
    } finally {
      setCopying(false)
    }
  }

  const handleFileUpload = async (e) => {
    const files = e.target.files
    if (files.length === 0) return
    setUploading(true)
    setStatusText("Uploading files...")
    let successCount = 0
    let errorCount = 0
    for (const file of files) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("target", currentFolder)
      try {
        const token = getCookie("token")
        const response = await fetch(`${GATEWAY_URL}/editor/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        if (response.ok) successCount++
        else errorCount++
      } catch (error) {
        errorCount++
      }
    }
    await loadFileTree()
    if (successCount > 0) toast.success(`${successCount} file(s) uploaded successfully`)
    if (errorCount > 0) toast.error(`${errorCount} file(s) failed to upload`)
    setStatusText("Upload completed")
    setUploading(false)
    fileUploadRef.current.value = ""
  }

  const downloadSelected = () => {
    if (!selectedItem || selectedItem.type !== "file") return
    const url = `${GATEWAY_URL}/editor/download?path=${encodeURIComponent(selectedItem.path)}`
    const link = document.createElement("a")
    link.href = url
    link.download = selectedItem.path.split("/").pop()
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Download started")
  }

  const contextAction = (action) => {
    setContextMenu({ visible: false })
    switch (action) {
      case "open":
        if (selectedItem?.type === "file") loadFile(selectedItem.path)
        break
      case "rename":
        setRenameInput(selectedItem.path.split("/").pop())
        setRenameModal({ visible: true })
        break
      case "copy":
        setCopyMoveModal({ visible: true, type: "copy" })
        break
      case "move":
        setCopyMoveModal({ visible: true, type: "move" })
        break
      case "download":
        downloadSelected()
        break
      case "delete":
        deleteSelected()
        break
    }
  }

  const renderFolderOptions = (nodes, prefix = "") => {
    let options = []
    nodes.forEach((node) => {
      if (node.type === "folder") {
        const path = prefix ? `${prefix}/${node.name}` : node.name
        options.push(
          <option key={path} value={path}>
            📁 {path}
          </option>,
        )
        if (node.children) {
          options = options.concat(renderFolderOptions(node.children, path))
        }
      }
    })
    return options
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
            <span className="text-white text-lg">Loading File Editor...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      <Toaster position="top-right" />

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="fixed z-50 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg shadow-2xl py-2 min-w-[150px] "
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={() => setContextMenu({ visible: false })}
        >
          <button
            className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
            onClick={() => contextAction("open")}
          >
            <File className="w-4 h-4" /> Open
          </button>
          <button
            className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
            onClick={() => contextAction("rename")}
          >
            <Edit className="w-4 h-4" /> Rename
          </button>
          <button
            className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
            onClick={() => contextAction("copy")}
          >
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button
            className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
            onClick={() => contextAction("move")}
          >
            <Move className="w-4 h-4" /> Move
          </button>
          <button
            className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
            onClick={() => contextAction("download")}
          >
            <Download className="w-4 h-4" /> Download
          </button>
          <div className="border-t border-white/20 my-1"></div>
          <button
            className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 flex items-center gap-2"
            onClick={() => contextAction("delete")}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}

      {/* Create Modal */}
      {createModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Create New {createModal.type}</h3>
              <button
                onClick={() => setCreateModal({ visible: false, type: "file" })}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name:</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={`Enter ${createModal.type} name`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location:</label>
                <select
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={createLocation}
                  onChange={(e) => setCreateLocation(e.target.value)}
                >
                  <option value="">Root Directory</option>
                  {renderFolderOptions(fileTree)}
                </select>
              </div>
              {createModal.type === "file" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">File Type:</label>
                  <select
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                  >
                    <option value="txt">Text File (.txt)</option>
                    <option value="js">JavaScript (.js)</option>
                    <option value="html">HTML (.html)</option>
                    <option value="css">CSS (.css)</option>
                    <option value="json">JSON (.json)</option>
                    <option value="md">Markdown (.md)</option>
                    <option value="py">Python (.py)</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                onClick={() => setCreateModal({ visible: false, type: "file" })}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                onClick={confirmCreate}
                disabled={creating}
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Rename Item</h3>
              <button onClick={() => setRenameModal({ visible: false })} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Name:</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  placeholder="Enter new name"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                onClick={() => setRenameModal({ visible: false })}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                onClick={confirmRename}
                disabled={renaming}
              >
                {renaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy/Move Modal */}
      {copyMoveModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{copyMoveModal.type === "copy" ? "Copy" : "Move"} Item</h3>
              <button
                onClick={() => setCopyMoveModal({ visible: false, type: "copy" })}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Destination Path:</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={destinationPath}
                  onChange={(e) => setDestinationPath(e.target.value)}
                  placeholder="Enter destination path"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Or Select Location:</label>
                <select
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={destinationSelect}
                  onChange={(e) => setDestinationSelect(e.target.value)}
                >
                  <option value="">Root Directory</option>
                  {renderFolderOptions(fileTree)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                onClick={() => setCopyMoveModal({ visible: false, type: "copy" })}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                onClick={confirmCopyMove}
                disabled={copying}
              >
                {copying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {copyMoveModal.type === "copy" ? "Copy" : "Move"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-80 backdrop-blur-xl bg-white/10 border-r border-white/20 flex flex-col">
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <Folder className="w-6 h-6 text-purple-400" />
            <h2 className="text-lg font-bold text-white">File Manager</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <User className="w-4 h-4" />
            <span>
              {user.username} ({user.role})
            </span>
          </div>
        </div>

        <div className="p-4 border-b border-white/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {fileTree.length > 0 ? (
            renderTreeNodes(fileTree)
          ) : (
            <div className="text-center text-gray-400 py-8">
              <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No files found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="backdrop-blur-xl bg-white/10 border-b border-white/20 p-4">
          <div className="flex flex-wrap gap-2">
            <input type="file" ref={fileUploadRef} onChange={handleFileUpload} multiple className="hidden" />
            <button
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              onClick={() => fileUploadRef.current.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload
            </button>
            <button
              className="px-3 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-emerald-100 hover:bg-emerald-600/30 transition-colors flex items-center gap-2"
              onClick={() => setCreateModal({ visible: true, type: "file" })}
            >
              <Plus className="w-4 h-4" />
              New File
            </button>
            <button
              className="px-3 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-emerald-100 hover:bg-emerald-600/30 transition-colors flex items-center gap-2"
              onClick={() => setCreateModal({ visible: true, type: "folder" })}
            >
              <Plus className="w-4 h-4" />
              New Folder
            </button>
            <button
              className="px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-100 hover:bg-blue-600/30 transition-colors flex items-center gap-2 disabled:opacity-50"
              onClick={saveFile}
              disabled={!currentFile || !isModified || saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save {isModified && "*"}
            </button>
            <button
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              onClick={() => {
                setRenameInput(selectedItem?.path.split("/").pop() || "")
                setRenameModal({ visible: true })
              }}
              disabled={!selectedItem}
            >
              <Edit className="w-4 h-4" />
              Rename
            </button>
            <button
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              onClick={() => setCopyMoveModal({ visible: true, type: "copy" })}
              disabled={!selectedItem}
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <button
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              onClick={() => setCopyMoveModal({ visible: true, type: "move" })}
              disabled={!selectedItem}
            >
              <Move className="w-4 h-4" />
              Move
            </button>
            <button
              className="px-3 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-100 hover:bg-red-600/30 transition-colors flex items-center gap-2 disabled:opacity-50"
              onClick={deleteSelected}
              disabled={!selectedItem || deleting}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
            <button
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              onClick={loadFileTree}
              disabled={refreshing}
            >
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>
            <button
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              onClick={downloadSelected}
              disabled={!selectedItem || selectedItem?.type !== "file"}
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="backdrop-blur-xl bg-white/5 border-b border-white/20 px-4 py-2">
            <div className="text-sm text-gray-300">{currentFile || "No file selected"}</div>
          </div>
          <div className="flex-1 p-4">
            <textarea
              ref={editorRef}
              className="w-full h-full bg-white/5 border border-white/20 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm resize-none backdrop-blur-sm"
              value={editorContent}
              onChange={handleEditorChange}
              onClick={updateCursorPosition}
              onKeyUp={updateCursorPosition}
              placeholder="Select a file to edit or create a new one..."
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="backdrop-blur-xl bg-white/10 border-t border-white/20 px-4 py-2 flex justify-between items-center text-sm text-gray-300">
          <div className="flex items-center gap-2">
            {(saving || creating || deleting || renaming || copying || uploading || refreshing) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            <span>{statusText}</span>
          </div>
          <div>{cursorPosition}</div>
        </div>
      </div>
    </div>
  )
}

export default EditorPage
