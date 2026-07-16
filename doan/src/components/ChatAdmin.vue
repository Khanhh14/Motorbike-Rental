<template>
  <div class="chat-page">
    <header class="hero">
      <div class="hero-left">
        <h1>Hello, Admin <span class="wave">👋</span></h1>
        <p class="sub">Bảng điều khiển hỗ trợ khách hàng</p>
      </div>
      <div class="hero-right">
        <div class="profile">A</div>
      </div>
    </header>

    <main class="card-grid">
      <aside class="panel contacts">
        <div class="contacts-head">
          <input v-model="q" class="search" placeholder="Tìm kiếm khách hoặc tin nhắn..." />
          <button class="icon-btn" @click="fetchConvs" title="Làm mới">⟳</button>
        </div>

        <ul class="contacts-list">
          <li v-if="loading" class="empty">Đang tải...</li>
          <li v-else-if="filteredConvs.length === 0" class="empty">Không có cuộc trò chuyện</li>

          <li v-for="c in filteredConvs" :key="c.id">
            <button class="contact" :class="{ active: activeConv === c.id }" @click="selectConv(c.id)">
              <div class="avatar">{{ (c.customerName||'K').charAt(0).toUpperCase() }}</div>
              <div class="info">
                <div class="top">
                  <div class="name">{{ c.customerName || shortId(c.id) }}</div>
                  <div class="small">{{ c.lastAt ? new Date(c.lastAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '' }}</div>
                </div>
                <div class="preview">{{ c.lastText || 'Chào bạn!' }}</div>
              </div>
              <div class="meta">
                <span class="dot" v-if="c.onlineCount>0" title="Online">●</span>
                <span class="unread" v-if="c.unreadCount">{{ c.unreadCount }}</span>
              </div>
            </button>
          </li>
        </ul>
      </aside>

      <section class="panel chat">
        <div class="chat-head">
          <div class="chat-avatar">{{ (activeConversation && activeConversation.customerName) ? activeConversation.customerName.charAt(0).toUpperCase() : 'K' }}</div>
          <div class="chat-title">
            <div class="name">{{ activeConversation?.customerName || shortId(activeConv) || 'Chọn một khách' }}</div>
            <div class="status">{{ activeConversation ? (activeConversation.onlineCount>0 ? 'Online' : 'Offline') : '—' }}</div>
          </div>
          <div class="chat-actions">
            <button class="icon-btn" @click="fetchConvs">⟳</button>
          </div>
        </div>

        <div ref="scrollEl" class="chat-body">
          <div v-if="!activeConv" class="empty-chat">Chọn một cuộc trò chuyện bên trái để bắt đầu.</div>

          <template v-else>
            <div v-if="messages.length === 0" class="empty-chat">Chưa có tin nhắn — hãy gửi lời chào 👋</div>

            <div v-for="(m, idx) in messages" :key="m.id" class="msg" :class="m.from === 'admin' ? 'out' : 'in'">
              <div class="bubble">
                <div class="text">{{ m.text }}</div>
                <div class="time">{{ fmtTime(m.ts) }}</div>
              </div>
            </div>
          </template>
        </div>

        <form v-if="activeConv" class="chat-input" @submit.prevent="send">
          <button type="button" class="icon-btn">😊</button>
          <input v-model="draft" placeholder="Nhập trả lời..." />
          <button class="send" :disabled="!draft.trim()">➤</button>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
import "@/assets/style/ChatAdmin.css" // chỉ import ở đây; không cần <style>@import</style>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { socket } from "@/services/socket"

const conversations = ref([])
const loading = ref(false)
const activeConv = ref(null)
const messages = ref([])
const draft = ref("")
const q = ref("")
const scrollEl = ref(null)

const filteredConvs = computed(() => {
  const term = (q.value || "").trim().toLowerCase()
  return conversations.value
    .filter((c) => c.hasCustomer)
    .filter((c) => {
      if (!term) return true
      return (
        (c.customerName && c.customerName.toLowerCase().includes(term)) ||
        (c.lastText && c.lastText.toLowerCase().includes(term)) ||
        (c.id && c.id.toLowerCase().includes(term))
      )
    })
})

const activeConversation = computed(() => conversations.value.find((c) => c.id === activeConv.value) || null)

function fmtTime(ts){
  try{
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }catch(e){ return '' }
}

function shortId(id) {
  return id && id.length > 12 ? `${id.slice(0, 8)}…${id.slice(-2)}` : id
}

function connectAsAdmin() {
  if (!socket.connected) socket.connect()
  socket.emit("join", { conversationId: "admin-dashboard", isAdmin: true, nickname: "Admin" })

  socket.on("admin:conversations", (list) => {
    conversations.value = list
    // nếu chưa chọn phòng nào, tự chọn phòng đầu tiên (nếu có)
    if (!activeConv.value && filteredConvs.value.length > 0) {
      selectConv(filteredConvs.value[0].id)
    }
  })

  // debounce để tránh fetch liên tục
  let timer = null
  socket.on("rooms:update", () => {
    clearTimeout(timer)
    timer = setTimeout(fetchConvs, 200)
  })

  socket.on("history", (history) => {
    messages.value = history
    down()
  })

  socket.on("message", (msg) => {
    messages.value.push(msg)
    down()
  })
}

function fetchConvs() {
  loading.value = true
  socket.emit("admin:list-conversations")
  setTimeout(() => {
    loading.value = false
  }, 200)
}

function selectConv(id) {
  activeConv.value = id
  // không cần disconnect; chỉ join sang phòng mới
  socket.emit("join", { conversationId: id, isAdmin: true, nickname: "Admin" })
}

function send() {
  const text = draft.value.trim()
  if (!text) return
  socket.emit("message", { text, from: "admin" })
  draft.value = ""
}

function down() {
  requestAnimationFrame(() => {
    if (scrollEl.value) {
      scrollEl.value.scrollTop = scrollEl.value.scrollHeight
    }
  })
}

onMounted(() => {
  connectAsAdmin()
  fetchConvs()
})

onBeforeUnmount(() => {
  socket.off("admin:conversations")
  socket.off("rooms:update")
  socket.off("history")
  socket.off("message")
})
</script>
