<template>
  <div>
    <!-- Nút nổi -->
    <button class="chat-fab" @click="toggleOpen">
      💬 Chat
      <span v-if="unreadCount>0 && !isOpen" class="badge">{{ unreadCount }}</span>
    </button>

    <!-- Popup -->
    <div v-show="isOpen" class="chat-popup">
      <div class="chat-header">
        <strong>Hỗ trợ Travalizer</strong>
        <button class="close" @click="toggleOpen">✕</button>
      </div>

      <div ref="scrollEl" class="chat-body">
        <div v-for="m in messages" :key="m.id" class="row" :class="m.from==='me'?'me':'peer'">
          <div class="bubble">
            <div class="text">{{ m.text }}</div>
            <div class="time">{{ formatTime(m.ts) }}</div>
          </div>
        </div>
        <div v-if="typingPeer" class="typing">Đang nhập...</div>
      </div>

      <form class="chat-input" @submit.prevent="send">
        <input
          v-model="draft"
          @input="emitTyping(true)" @blur="emitTyping(false)"
          type="text" placeholder="Nhập tin nhắn..."
        />
        <button :disabled="!draft.trim()">Gửi</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { socket } from '@/services/socket'

function getConversationId() {
  const key = 'travalyzer_conversation_id'
  let id = localStorage.getItem(key)
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id) }
  return id
}
const conversationId = getConversationId()
const nickname = 'Khách'

const isOpen = ref(false)
const unreadCount = ref(0)
const messages = ref([])
const typingPeer = ref(false)
const draft = ref('')
const scrollEl = ref(null)

function connect() {
  if (!socket.connected) socket.connect()
  socket.emit('join', { conversationId, isAdmin: false, nickname })

  socket.on('history', (history) => { messages.value = history; scrollDown() })
  socket.on('message', (msg) => {
    messages.value.push(msg)
    if (!isOpen.value) unreadCount.value += 1
    scrollDown()
  })
  socket.on('typing', ({ from, isTyping }) => {
    if (from !== 'me') typingPeer.value = isTyping
    if (isTyping) setTimeout(()=> typingPeer.value=false, 3000)
  })
}
function disconnect() {
  socket.off('history'); socket.off('message'); socket.off('typing')
  if (socket.connected) socket.disconnect()
}
function toggleOpen(){ isOpen.value = !isOpen.value; if (isOpen.value) unreadCount.value = 0; scrollDown() }
function send(){
  const text = draft.value.trim(); if(!text) return
  const msg = { id: crypto.randomUUID(), from:'me', text, ts: Date.now() }
  messages.value.push(msg)
  socket.emit('message', { text, from:'me' })
  draft.value = ''; emitTyping(false); scrollDown()
}
let typingTimer=null
function emitTyping(state){
  socket.emit('typing', { from:'me', isTyping: !!state })
  clearTimeout(typingTimer)
  if (state) typingTimer=setTimeout(()=>socket.emit('typing',{from:'me',isTyping:false}),2500)
}
function scrollDown(){ requestAnimationFrame(()=>{ const el=scrollEl.value; if(el) el.scrollTop=el.scrollHeight }) }
function formatTime(ts){ return new Date(ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) }

onMounted(connect)
onBeforeUnmount(disconnect)
watch(isOpen,(v)=>{ if(v) unreadCount.value=0 })
</script>

<style scoped>
@import "@/assets/style/ChatPopup.css";
</style>