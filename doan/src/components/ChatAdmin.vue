<template>
  <div class="wrap">
    <div class="left">
      <div class="panel-head">
        <strong>Hỗ trợ khách hàng</strong>
        <button class="btn" @click="fetchConvs">Làm mới</button>
      </div>

      <ul class="list">
        <li v-if="loading" class="item">Đang tải...</li>
        <li v-else-if="filteredConvs.length === 0" class="item">Hiện chưa có khách nào đang chat</li>

        <li v-for="c in filteredConvs" :key="c.id">
          <button class="item" @click="selectConv(c.id)">
            <div class="id">
              {{ shortId(c.id) }}
              <span v-if="c.onlineCount > 0" title="đang online">•</span>
            </div>
            <div class="last" :title="c.lastText">{{ c.lastText || "—" }}</div>
          </button>
        </li>
      </ul>
    </div>

    <div class="right">
      <div class="room-head">
        <strong>Phòng:</strong>
        <span class="room-id">{{ activeConv || "—" }}</span>
      </div>

      <div ref="scrollEl" class="room-body">
        <div
          v-for="m in messages"
          :key="m.id"
          class="row"
          :class="m.from === 'admin' ? 'me' : 'peer'"
        >
          <div class="bubble">
            <div class="text">{{ m.text }}</div>
            <div class="time">{{ new Date(m.ts).toLocaleTimeString() }}</div>
          </div>
        </div>
      </div>

      <form v-if="activeConv" class="room-input" @submit.prevent="send">
        <input v-model="draft" type="text" placeholder="Trả lời khách..." />
        <button :disabled="!draft.trim()">Gửi</button>
      </form>
    </div>
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
const scrollEl = ref(null)

const filteredConvs = computed(() =>
  conversations.value.filter((c) => c.hasCustomer)
)

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
