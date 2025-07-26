import { GATEWAY_URL, WHATSAPP_URL } from '@/utils/endpoints';
import { io } from 'socket.io-client';

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

class WhatsAppGlassUI {
  constructor() {
    this.currentChatId = null;
    this.isWhatsAppReady = false;
    this.messagePollingInterval = null;
    this.chatMessages = {};
    this.socket = null;
    this.aiChatHistory = [];
    this.isAiChatOpen = false;

    this.initializeElements();
    this.attachEventListeners();
    this.checkWhatsAppStatus();
    this.initializeFeatures();
  }

  initializeElements() {
    // Main elements
    this.statusOverlay = document.getElementById("statusOverlay")
    this.statusTitle = document.getElementById("statusTitle")
    this.statusMessage = document.getElementById("statusMessage")
    this.qrCodeContainer = document.getElementById("qrCodeContainer")

    // Chat elements
    this.chatsList = document.getElementById("chatsList")
    this.chatHeader = document.getElementById("chatHeader")
    this.chatAvatar = document.getElementById("chatAvatar")
    this.chatName = document.getElementById("chatName")
    this.messagesArea = document.getElementById("messagesArea")
    this.messagesList = document.getElementById("messagesList")
    this.messageInput = document.getElementById("messageInput")
    this.messageText = document.getElementById("messageText")

    // File upload elements
    this.fileUploadArea = document.getElementById("fileUploadArea")
    this.fileInput = document.getElementById("fileInput")
    this.filePreview = document.getElementById("filePreview")
    this.fileCaption = document.getElementById("fileCaption")
    this.fileDropZone = document.getElementById("fileDropZone")

    // Profile elements
    this.profileToggle = document.getElementById("profileToggle")
    this.profilePopup = document.getElementById("profilePopup")
    this.profilePic = document.getElementById("profilePic")
    this.profilePopupPic = document.getElementById("profilePopupPic")
    this.profileName = document.getElementById("profileName")
    this.profileId = document.getElementById("profileId")

    // AI Chat elements
    this.aiToggle = document.getElementById("aiToggle")
    this.aiChatModal = document.getElementById("aiChatModal")
    this.aiChatMessages = document.getElementById("aiChatMessages")
    this.aiMessageInput = document.getElementById("aiMessageInput")

    // Buttons
    this.logoutBtn = document.getElementById("logoutBtn")
    this.refreshChatsBtn = document.getElementById("refreshChats")
    this.sendBtn = document.getElementById("sendBtn")
    this.attachBtn = document.getElementById("attachBtn")
    this.sendFileBtn = document.getElementById("sendFileBtn")
    this.cancelFileBtn = document.getElementById("cancelFileBtn")
    this.searchChats = document.getElementById("searchChats")
    this.colorPicker = document.getElementById("colorPicker")
    this.resetBg = document.getElementById("resetBg")
  }

  attachEventListeners() {
    // Profile toggle
    this.profileToggle?.addEventListener("click", () => this.toggleProfile())
    document.getElementById("closeProfile")?.addEventListener("click", () => this.closeProfile())

    // AI Chat
    this.aiToggle?.addEventListener("click", () => this.toggleAiChat())
    document.getElementById("closeAiChat")?.addEventListener("click", () => this.closeAiChat())
    document.getElementById("sendAiMessage")?.addEventListener("click", () => this.sendAiMessage())
    this.aiMessageInput?.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        this.sendAiMessage()
      }
    })

    // Logout
    this.logoutBtn?.addEventListener("click", () => this.logout())

    // Refresh chats
    this.refreshChatsBtn?.addEventListener("click", () => this.fetchChats())

    // Send message
    this.sendBtn?.addEventListener("click", () => this.sendMessage())
    this.messageText?.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    })

    // File handling
    this.attachBtn?.addEventListener("click", () => this.toggleFileUpload())
    this.fileInput?.addEventListener("change", (e) => this.handleFileSelection(e))
    this.sendFileBtn?.addEventListener("click", () => this.sendFile())
    this.cancelFileBtn?.addEventListener("click", () => this.cancelFileUpload())
    document.getElementById("closeFileUpload")?.addEventListener("click", () => this.cancelFileUpload())

    // File type buttons
    document.querySelectorAll(".file-type-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const accept = e.target.dataset.accept
        this.fileInput.accept = accept
        this.fileInput.click()
      })
    })

    // Drag and drop
    this.setupDragAndDrop()

    // Search chats
    this.searchChats?.addEventListener("input", (e) => this.filterChats(e.target.value))

    // Background customization
    this.colorPicker?.addEventListener("change", () => this.changeBackground())
    this.resetBg?.addEventListener("click", () => this.resetBackground())

    // Click outside to close popups
    document.addEventListener("click", (e) => this.handleOutsideClick(e))

    // Emoji button
    document.getElementById("emojiBtn")?.addEventListener("click", () => this.showEmojiPicker())

    // Voice button
    document.getElementById("voiceBtn")?.addEventListener("click", () => this.toggleVoiceRecording())
  }

  initializeFeatures() {
    this.loadProfileInfo()
    this.setupConnectionStatus()
  }

  async loadProfileInfo() {
    try {
      const token = getCookie('token');
      const res = await fetch(`${GATEWAY_URL}/api/user/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()

      if (data.profilePic) {
        this.profilePic.src = data.profilePic
        this.profilePopupPic.src = data.profilePic
      }

      if (data.name) {
        this.profileName.textContent = data.name
        document.getElementById("userInfo").textContent = data.name
      }

      if (data.id) {
        this.profileId.textContent = `ID: ${data.id}`
      }
    } catch (err) {
      console.error("Failed to load profile info:", err)
    }
  }

  setupConnectionStatus() {
    const statusDiv = document.createElement("div")
    statusDiv.className = "connection-status connecting"
    statusDiv.textContent = "Connecting..."
    document.body.appendChild(statusDiv)
    this.connectionStatus = statusDiv
  }

  updateConnectionStatus(status) {
    if (!this.connectionStatus) return

    this.connectionStatus.className = `connection-status ${status}`
    const messages = {
      connected: "🟢 Connected",
      disconnected: "🔴 Disconnected",
      connecting: "🟡 Connecting...",
    }
    this.connectionStatus.textContent = messages[status] || status
  }

  toggleProfile() {
    this.profilePopup.classList.toggle("show")
  }

  closeProfile() {
    this.profilePopup.classList.remove("show")
  }

  toggleAiChat() {
    this.isAiChatOpen = !this.isAiChatOpen
    if (this.isAiChatOpen) {
      this.aiChatModal.classList.add("show")
    } else {
      this.aiChatModal.classList.remove("show")
    }
  }

  closeAiChat() {
    this.isAiChatOpen = false
    this.aiChatModal.classList.remove("show")
  }async sendAiMessage() {
  const prompt = this.aiMessageInput.value.trim();
  if (!prompt) return;

  // Add user message to chat
  this.addAiMessage(prompt, "user");
  this.aiMessageInput.value = "";

  try {
    // Show temporary typing message
    const typingDiv = this.addAiMessage("Thinking...", "ai", true);

    // Send the prompt to backend
    const token = getCookie('token');
    const res = await fetch(`${GATEWAY_URL}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    // Remove "Thinking..." indicator
    typingDiv.remove();

    // Show Gemini response (as HTML)
    if (data.answer) {
      this.addAiMessage(data.answer, "ai", false, true); // ✅ render as HTML
    } else {
      this.addAiMessage("❌ No answer returned.", "ai");
    }
  } catch (error) {
    console.error("AI chat error:", error);
    this.addAiMessage("❌ Error talking to AI. Try again.", "ai");
  }
}
addAiMessage(message, sender, isTyping = false, isHtml = false) {
  const messageDiv = document.createElement("div");
  messageDiv.className = sender === "user" ? "user-message" : "ai-message";

  let content = "";

  if (sender === "ai") {
    const messageBody = isTyping
      ? '<span class="typing-dots">...</span>'
      : (isHtml ? message : this.escapeHtml(message)); // ✅ Insert HTML or escape text

    content = `
      <div class="ai-avatar-small">🤖</div>
      <div class="message-content">
        <p>${messageBody}</p>
      </div>
    `;
  } else {
    const userMessage = isHtml ? message : this.escapeHtml(message); // in case user sends HTML
    content = `<p>${userMessage}</p>`;
  }

  messageDiv.innerHTML = content;
  this.aiChatMessages.appendChild(messageDiv);
  this.aiChatMessages.scrollTop = this.aiChatMessages.scrollHeight;

  if (isTyping) {
    messageDiv.classList.add("typing");
  }

  return messageDiv; // for removing if it's a typing placeholder
}

  setupDragAndDrop() {
    if (!this.fileDropZone) return
    ;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      this.fileDropZone.addEventListener(eventName, this.preventDefaults, false)
    })
    ;["dragenter", "dragover"].forEach((eventName) => {
      this.fileDropZone.addEventListener(
        eventName,
        () => {
          this.fileDropZone.classList.add("drag-over")
        },
        false,
      )
    })
    ;["dragleave", "drop"].forEach((eventName) => {
      this.fileDropZone.addEventListener(
        eventName,
        () => {
          this.fileDropZone.classList.remove("drag-over")
        },
        false,
      )
    })

    this.fileDropZone.addEventListener(
      "drop",
      (e) => {
        const files = e.dataTransfer.files
        this.handleFiles(files)
      },
      false,
    )

    this.fileDropZone.addEventListener("click", () => {
      this.fileInput.click()
    })
  }

  preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  handleFiles(files) {
    this.fileInput.files = files
    this.handleFileSelection({ target: { files } })
  }

  filterChats(query) {
    const chatItems = document.querySelectorAll(".chat-item")
    chatItems.forEach((item) => {
      const chatName = item.querySelector(".chat-name").textContent.toLowerCase()
      const lastMessage = item.querySelector(".chat-last-message").textContent.toLowerCase()

      if (chatName.includes(query.toLowerCase()) || lastMessage.includes(query.toLowerCase())) {
        item.style.display = "flex"
      } else {
        item.style.display = "none"
      }
    })
  }

  changeBackground() {
    const color = this.colorPicker.value
    this.messagesArea.style.background = color
    localStorage.setItem("whatsapp-bg-color", color)
  }

  resetBackground() {
    this.messagesArea.style.background = ""
    localStorage.removeItem("whatsapp-bg-color")
    this.showToast("Background reset to default", "success")
  }

  handleOutsideClick(e) {
    // Close profile popup
    if (
      this.profilePopup.classList.contains("show") &&
      !this.profilePopup.contains(e.target) &&
      !this.profileToggle.contains(e.target)
    ) {
      this.closeProfile()
    }

    // Close AI chat
    if (
      this.isAiChatOpen &&
      this.aiChatModal.classList.contains("show") &&
      !this.aiChatModal.querySelector(".ai-chat-container").contains(e.target) &&
      !this.aiToggle.contains(e.target)
    ) {
      this.closeAiChat()
    }
  }

  showEmojiPicker() {
    // Simple emoji picker - you can enhance this
    const emojis = ["😀", "😂", "😍", "🤔", "👍", "👎", "❤️", "🔥", "💯", "🎉"]
    const emojiHtml = emojis
      .map(
        (emoji) =>
          `<button class="emoji-btn" onclick="document.getElementById('messageText').value += '${emoji}'">${emoji}</button>`,
      )
      .join("")

    this.showToast(`<div class="emoji-picker">${emojiHtml}</div>`, "info")
  }

  toggleVoiceRecording() {
    // Voice recording functionality - placeholder
    this.showToast("Voice recording feature coming soon!", "info")
  }

  toggleFileUpload() {
    const isVisible = this.fileUploadArea.style.display !== "none"
    this.fileUploadArea.style.display = isVisible ? "none" : "block"
  }

  // Rest of the WhatsApp functionality (keeping existing methods)
  async checkWhatsAppStatus() {
    try {
      this.updateConnectionStatus("connecting")
      const token = getCookie('token');
      const response = await fetch(`${WHATSAPP_URL}/api/qr`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login.html"
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      this.statusTitle.textContent = this.getStatusTitle(data.status)
      this.statusMessage.textContent = data.message
      this.qrCodeContainer.innerHTML = ""

      switch (data.status) {
        case "qr_received":
          if (data.qr) {
            const qrImg = document.createElement("img")
            qrImg.src = data.qr
            qrImg.alt = "WhatsApp QR Code"
            qrImg.style.maxWidth = "250px"
            qrImg.style.height = "auto"
            this.qrCodeContainer.appendChild(qrImg)
          }
          this.showStatusOverlay()
          this.updateConnectionStatus("connecting")
          setTimeout(() => this.checkWhatsAppStatus(), 3000)
          break

        case "ready":
          this.isWhatsAppReady = true
          this.hideStatusOverlay()
          this.fetchChats()
          this.connectSocket()
          this.updateConnectionStatus("connected")
          break

        case "initializing":
        case "disconnected":
        case "auth_failure":
          this.isWhatsAppReady = false
          this.showStatusOverlay()
          this.updateConnectionStatus("disconnected")
          setTimeout(() => this.checkWhatsAppStatus(), 5000)
          break

        default:
          this.showStatusOverlay()
          this.updateConnectionStatus("connecting")
          setTimeout(() => this.checkWhatsAppStatus(), 5000)
      }
    } catch (error) {
      console.error("Error checking WhatsApp status:", error)
      this.statusTitle.textContent = "Connection Error"
      this.statusMessage.textContent = "Failed to connect to WhatsApp service. Please refresh the page."
      this.showStatusOverlay()
      this.updateConnectionStatus("disconnected")
      setTimeout(() => this.checkWhatsAppStatus(), 10000)
    }
  }

  getStatusTitle(status) {
    const titles = {
      initializing: "Initializing WhatsApp...",
      qr_received: "Scan QR Code",
      ready: "WhatsApp Ready",
      disconnected: "Disconnected",
      auth_failure: "Authentication Failed",
    }
    return titles[status] || "Connecting..."
  }

  showStatusOverlay() {
    this.statusOverlay.style.display = "flex"
    this.chatHeader.style.display = "none"
    this.messagesArea.style.display = "none"
    this.messageInput.style.display = "none"
  }

  hideStatusOverlay() {
    this.statusOverlay.style.display = "none"
  }

  async fetchChats() {
    if (!this.isWhatsAppReady) {
      this.showToast("WhatsApp is not ready. Please wait for connection.", "warning")
      return
    }

    try {
      this.chatsList.innerHTML =
        '<div class="glass-loading"><div class="loading-spinner"></div><span>Loading chats...</span></div>'

      const token = getCookie('token');
      const response = await fetch(`${WHATSAPP_URL}/api/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch chats")
      }

      const chats = await response.json()
      this.renderChats(chats)
    } catch (error) {
      console.error("Error fetching chats:", error)
      this.chatsList.innerHTML = `<div class="loading" style="color: var(--error-color);">Error: ${error.message}</div>`
      this.showToast("Failed to load chats: " + error.message, "error")
      setTimeout(() => this.checkWhatsAppStatus(), 5000)
    }
  }

  renderChats(chats) {
    if (chats.length === 0) {
      this.chatsList.innerHTML = '<div class="loading">No chats found. Make sure WhatsApp is active.</div>'
      return
    }

    this.chatsList.innerHTML = ""
    chats.forEach((chat) => {
      const chatElement = this.createChatElement(chat)
      this.chatsList.appendChild(chatElement)
    })

    if (!this.currentChatId && chats.length > 0) {
      this.selectChat(chats[0])
    }
  }

  createChatElement(chat) {
    const chatItem = document.createElement("div")
    chatItem.className = "chat-item"
    chatItem.dataset.chatId = chat.id
    chatItem.innerHTML = `
      <img src="${chat.profilePic}" alt="${chat.name}" class="chat-avatar">
      <div class="chat-info">
        <div class="chat-name">${this.escapeHtml(chat.name)}</div>
        <div class="chat-last-message">${this.escapeHtml(chat.lastMessage.slice(0, 5000))}</div>
      </div>
      <div class="chat-meta">
        <div class="chat-time">${this.formatTime(chat.timestamp)}</div>
        ${chat.unreadCount > 0 ? `<div class="chat-unread">${chat.unreadCount}</div>` : ""}
      </div>
    `

    chatItem.addEventListener("click", () => this.selectChat(chat))
    return chatItem
  }

  async selectChat(chat) {
    const prevActive = this.chatsList.querySelector(".chat-item.active")
    if (prevActive) {
      prevActive.classList.remove("active")
    }

    const currentChatElement = this.chatsList.querySelector(`[data-chat-id="${chat.id}"]`)
    if (currentChatElement) {
      currentChatElement.classList.add("active")
    }

    this.currentChatId = chat.id
    this.chatAvatar.src = chat.profilePic
    this.chatAvatar.alt = chat.name
    this.chatName.textContent = chat.name

    this.chatHeader.style.display = "flex"
    this.messagesArea.style.display = "flex"
    this.messageInput.style.display = "block"

    await this.fetchMessages(chat.id)
  }

  async fetchMessages(chatId, appendOnly = false) {
    try {
      const token = getCookie('token');
      const response = await fetch(`${WHATSAPP_URL}/api/messages/${chatId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch messages")
      }

      const messages = await response.json()

      if (appendOnly) {
        const existingMessages = this.chatMessages[chatId] || []
        const existingIds = new Set(existingMessages.map((m) => m.id))
        const newMessages = messages.filter((m) => !existingIds.has(m.id))

        if (newMessages.length > 0) {
          this.chatMessages[chatId] = [...existingMessages, ...newMessages]
          newMessages.forEach((message) => {
            const messageElement = this.createMessageElement(message)
            this.messagesList.appendChild(messageElement)
          })
          this.messagesArea.scrollTop = this.messagesArea.scrollHeight
        }
      } else {
        this.chatMessages[chatId] = messages
        this.renderMessages(messages)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      this.messagesList.innerHTML = `<div class="loading" style="color: var(--error-color);">Error: ${error.message}</div>`
      this.showToast("Failed to load messages: " + error.message, "error")
    }
  }

  renderMessages(messages) {
    this.messagesList.innerHTML = ""
    if (messages.length === 0) {
      this.messagesList.innerHTML = '<div class="loading">No messages yet.</div>'
      return
    }

    messages.forEach((message) => {
      const messageElement = this.createMessageElement(message)
      this.messagesList.appendChild(messageElement)
    })

    this.messagesArea.scrollTop = this.messagesArea.scrollHeight
  }

  createMessageElement(message) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${message.fromMe ? "sent" : "received"}`

    let content = ""
    if (message.type === "file" && message.fileUrl) {
      content = this.createFileMessageContent(message)
    } else {
      content = `<div class="message-content">${this.escapeHtml(message.body)}</div>`
    }

    content += `<div class="message-time">${this.formatMessageTime(message.timestamp)}</div>`
    messageDiv.innerHTML = content
    return messageDiv
  }

  createFileMessageContent(message) {
    const fileType = message.fileType || ""
    const fileName = message.fileName || "Unknown file"
    const fileSize = message.fileSize ? this.formatFileSize(message.fileSize) : ""

    let preview = ""
    if (fileType.startsWith("image/")) {
      preview = `<img src="${message.fileUrl}" alt="${fileName}" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`
    } else if (fileType.startsWith("video/")) {
      preview = `<video controls style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                   <source src="${message.fileUrl}" type="${fileType}">
                   Your browser does not support the video tag.
                 </video>`
    } else if (fileType.startsWith("audio/")) {
      preview = `<audio controls style="width: 200px;">
                   <source src="${message.fileUrl}" type="${fileType}">
                   Your browser does not support the audio tag.
                 </audio>`
    } else {
      preview = `<div class="file-info">
                   <div class="file-name">${fileName}</div>
                   <div class="file-size">${fileSize}</div>
                   <a href="${message.fileUrl}" download="${fileName}" class="btn btn-primary" style="margin-top: 8px; font-size: 12px; padding: 4px 8px;">Download</a>
                 </div>`
    }

    return `<div class="file-message">${preview}</div>`
  }

  async sendMessage() {
    const messageText = this.messageText.value.trim()
    if (!messageText || !this.currentChatId) {
      return
    }

    try {
      // Add message to UI immediately
      const tempMessage = {
        id: Date.now(),
        body: messageText,
        fromMe: true,
        timestamp: new Date().toISOString(),
        type: "text",
      }

      const messageElement = this.createMessageElement(tempMessage)
      messageElement.classList.add("sending")
      this.messagesList.appendChild(messageElement)
      this.messagesArea.scrollTop = this.messagesArea.scrollHeight

      this.messageText.value = ""

      const token = getCookie('token');
      const response = await fetch(`${WHATSAPP_URL}/api/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chatId: this.currentChatId,
          message: messageText,
        }),
      })

      const result = await response.json()

      if (result.success) {
        messageElement.classList.remove("sending")
        await this.fetchMessages(this.currentChatId)
      } else {
        messageElement.classList.add("failed")
        this.showToast("Failed to send message: " + (result.error || "Unknown error"), "error")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      this.showToast("An error occurred while sending the message.", "error")
    }
  }

  handleFileSelection(event) {
    const files = Array.from(event.target.files)
    if (files.length === 0) {
      this.cancelFileUpload()
      return
    }

    this.fileUploadArea.style.display = "block"
    this.renderFilePreview(files)
  }

  renderFilePreview(files) {
    this.filePreview.innerHTML = ""
    files.forEach((file, index) => {
      const previewItem = document.createElement("div")
      previewItem.className = "file-preview-item"

      if (file.type.startsWith("image/")) {
        const img = document.createElement("img")
        img.src = URL.createObjectURL(file)
        img.alt = file.name
        previewItem.appendChild(img)
      } else {
        const fileInfo = document.createElement("div")
        fileInfo.className = "file-info"
        fileInfo.innerHTML = `
          <div class="file-name">${this.escapeHtml(file.name)}</div>
          <div class="file-size">${this.formatFileSize(file.size)}</div>
        `
        previewItem.appendChild(fileInfo)
      }

      this.filePreview.appendChild(previewItem)
    })
  }

  async sendFile() {
    const files = this.fileInput.files
    if (files.length === 0 || !this.currentChatId) {
      this.showToast("Please select a file and chat.", "warning")
      return
    }

    const file = files[0]
    const caption = this.fileCaption.value.trim()

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("chatId", this.currentChatId)
      if (caption) {
        formData.append("caption", caption)
      }

      this.showToast("Sending file...", "info")

      const token = getCookie('token');
      const response = await fetch(`${WHATSAPP_URL}/api/send-file`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        this.cancelFileUpload()
        this.showToast("File sent successfully!", "success")
        await this.fetchMessages(this.currentChatId)
      } else {
        this.showToast("Failed to send file: " + (result.error || "Unknown error"), "error")
      }
    } catch (error) {
      console.error("Error sending file:", error)
      this.showToast("An error occurred while sending the file.", "error")
    }
  }

  cancelFileUpload() {
    this.fileUploadArea.style.display = "none"
    this.fileInput.value = ""
    this.fileCaption.value = ""
    this.filePreview.innerHTML = ""
  }

  connectSocket() {
    const token = getCookie('token');
    this.socket = io(WHATSAPP_URL, {
        auth: {
            token
        }
    })

    this.socket.on("connect", () => {
      this.updateConnectionStatus("connected")
    })

    this.socket.on("disconnect", () => {
      this.updateConnectionStatus("disconnected")
    })

    this.socket.on("message-sent", async (msg) => {
      if (msg.to === this.currentChatId) {
        await this.fetchMessages(this.currentChatId, true)
      }
    })

    this.socket.on("file-sent", async (fileMsg) => {
      if (fileMsg.to === this.currentChatId) {
        await this.fetchMessages(this.currentChatId, true)
      }
    })

    this.socket.on("message-received", async (msg) => {
      if (msg.from === this.currentChatId) {
        await this.fetchMessages(this.currentChatId, true)
      }
      // Show notification for new messages
      this.showToast(`New message from ${msg.fromName}`, "info")
    })
  }

  async logout() {
    try {
      const token = getCookie('token');
      const response = await fetch(`${GATEWAY_URL}/logout`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.redirected || response.ok) {
        window.location.href = "/login.html"
      } else {
        this.showToast("Logout failed. Please try again.", "error")
      }
    } catch (error) {
      console.error("Error during logout:", error)
      this.showToast("An error occurred during logout.", "error")
    }
  }

  showToast(message, type = "info") {
    if (window.themeManager) {
      window.themeManager.showToast(message, type)
    } else {
      // Fallback toast
      alert(message)
    }
  }

  // Utility functions
  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  formatTime(timestamp) {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  formatMessageTime(timestamp) {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }
}

export default WhatsAppGlassUI;
