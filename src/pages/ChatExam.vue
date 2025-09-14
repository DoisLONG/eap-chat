<template>
  <div class="chat-page">
    <!-- 顶部 -->
    <header class="chat-header">
      <div class="left">
        <img src="/logo2.png" class="logo" />
        <div class="meta">
          <div class="title ell">{{ sopName || '未选择 SOP' }}</div>
          <div class="sub">版本：{{ sopVer || '-' }} · ID：{{ sopId || '-' }}</div>
        </div>
      </div>
      <div class="right">
        <template v-if="isMobile">
          <el-button size="small" @click="drawerVisible = true">历史</el-button>
          <el-button size="small" @click="newSession">新建</el-button>
          <el-popconfirm title="确认结束考试？" confirm-button-text="结束" cancel-button-text="取消" @confirm="endExam">
            <template #reference>
              <el-button size="small" type="danger" plain>结束</el-button>
            </template>
          </el-popconfirm>
        </template>
        <template v-else>
          <el-switch v-model="showHistory" active-text="历史对话" inactive-text="历史对话" />
          <el-button class="ml8" @click="newSession">新建对话</el-button>
          <el-popconfirm title="确认结束考试？" confirm-button-text="结束" cancel-button-text="取消" @confirm="endExam">
            <template #reference>
              <el-button class="ml8" type="danger" plain>结束考试</el-button>
            </template>
          </el-popconfirm>
        </template>
      </div>
    </header>

    <div class="content">
      <aside v-if="showHistory && !isMobile" class="history">
        <div class="hist-head">历史对话</div>
        <div class="hist-list">
          <div
            v-for="s in sessions"
            :key="s.id"
            class="hist-item"
            :class="{active: s.id === sessionId}"
            @click="loadSession(s.id)"
          >
            <div class="line1 ell">{{ s.title }}</div>
            <div class="line2">{{ s.time }}</div>
          </div>
        </div>
      </aside>

      <main class="chat-main" ref="scrollBox">
        <div v-for="m in messages" :key="m.id" class="msg" :class="m.role">
          <div class="avatar"><img :src="m.role==='user'?userAvatar:botAvatar" /></div>
          <div class="bubble">
            <div class="nick">{{ m.role==='user' ? '我' : '教练' }}</div>
            <div class="text" v-html="md(m.content)"></div>
          </div>
        </div>
      </main>
    </div>

    <footer class="chat-input">
      <el-input
        v-model="input"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 6 }"
        placeholder="输入答案或提问…（Enter 发送，Shift+Enter 换行）"
        @keydown.enter.prevent="onEnter"
        @keydown.shift.enter.stop
      />
      <el-button type="primary" :disabled="sending || !input.trim()" @click="send">
        {{ messages.length <= 1 ? '开始' : '发送' }}
      </el-button>
    </footer>

    <el-drawer v-model="drawerVisible" title="历史对话" :with-header="true" size="100%" direction="btt">
      <div class="drawer-list">
        <div
          v-for="s in sessions"
          :key="s.id"
          class="hist-item"
          :class="{active: s.id === sessionId}"
          @click="() => { loadSession(s.id); drawerVisible=false }"
        >
          <div class="line1 ell">{{ s.title }}</div>
          <div class="line2">{{ s.time }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="newSession" type="primary" plain>新建对话</el-button>
        <el-button @click="drawerVisible=false">关闭</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const sopId = route.query.sopId || ''
const sopName = route.query.sopName || ''
const sopVer = route.query.sopVer || ''
const userId = 'test_user' // 可改为登录用户

if (!sopId) router.replace('/chat/sop')

const isMobile = ref(window.matchMedia('(max-width: 900px)').matches)
const media = window.matchMedia('(max-width: 900px)')
const mediaCb = e => { isMobile.value = e.matches }
media.addEventListener?.('change', mediaCb)

const scrollBox = ref(null)
const input = ref('')
const sending = ref(false)
const showHistory = ref(!isMobile.value)
const drawerVisible = ref(false)
const userAvatar = '/logo2.png'
const botAvatar = '/logo2.png'

const sessionId = ref('')
const examId = ref('')
const messages = reactive([])

const sessions = ref([])
const storageKey = `chat_hist_${sopId}`

function scrollBottom() {
  nextTick(() => {
    const el = scrollBox.value
    if (el) el.scrollTop = el.scrollHeight + 999
  })
}
function newId() {
  return String(Date.now() + Math.random())
}
function md(s) {
  return marked.parse(s || '')
}

function persist() {
  const idx = sessions.value.findIndex(s => s.id === sessionId.value)
  const sub = (messages[1]?.content || messages[0]?.content || sopName).replace(/\n/g, ' ').slice(0, 18)
  const pack = {
    id: sessionId.value,
    title: sub || '新对话',
    time: new Date().toLocaleString(),
    messages: JSON.parse(JSON.stringify(messages))
  }
  if (idx >= 0) sessions.value[idx] = pack
  else sessions.value.unshift(pack)
  localStorage.setItem(storageKey, JSON.stringify(sessions.value))
}
function loadSessions() {
  try { sessions.value = JSON.parse(localStorage.getItem(storageKey) || '[]') }
  catch { sessions.value = [] }
}
function loadSession(id) {
  const found = sessions.value.find(s => s.id === id)
  if (!found) return
  sessionId.value = id
  messages.splice(0, messages.length, ...found.messages)
  scrollBottom()
}
async function newSession() {
  sessionId.value = newId()
  messages.splice(0, messages.length,
    { id: newId(), role: 'assistant', content: '你好，我是操作规程陪练。准备好了吗？我们开始练习！' }
  )
  try {
    const res = await fetch('/chatapi/v1/exams/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, file_name: sopName })
    })
    const json = await res.json()
    examId.value = json?.id || ''
    ElMessage.success('已新建考试对话')
  } catch (e) {
    console.error('启动考试失败', e)
    ElMessage.error('启动考试失败')
  }
  scrollBottom()
  persist()
}
function endExam() {
  persist()
  ElMessage.success('考试结束，已保存到历史对话')
  router.replace('/chat/sop')
}
function onEnter(e) {
  if (e.shiftKey) {
    input.value += '\n'
    return
  }
  send()
}

async function send() {
  const text = input.value.trim()
  if (!text || sending.value) return
  sending.value = true
  const userMsg = { id: newId(), role: 'user', content: text }
  messages.push(userMsg)
  input.value = ''
  scrollBottom()

  try {
    const replyMsg = { id: newId(), role: 'assistant', content: '' }
    messages.push(replyMsg)

    const res = await fetch('/chatapi/v1/exams/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: examId.value,
        session_id: sessionId.value,
        source_file_name: sopName,
        messages: messages.map(({ role, content }) => ({ role, content })),
        streaming: true,
        stream_options: { include_usage: true },
        temperature: 0.01,
        top_p: 0.95,
        repetition_penalty: 1.03,
        max_new_tokens: 1024,
        top_k: 10
      })
    })

    if (!res.body) throw new Error('No stream')
    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      replyMsg.content += chunk
      scrollBottom()
    }

    persist()
  } catch (err) {
    console.error(err)
    messages.push({ id: newId(), role: 'assistant', content: '出错了，请稍后再试。' })
  } finally {
    sending.value = false
    scrollBottom()
  }
}

onMounted(() => {
  loadSessions()
  newSession()
})
onBeforeUnmount(() => {
  persist()
  media.removeEventListener?.('change', mediaCb)
})
</script>

<style scoped>
/* 整体网格：顶部 / 内容 / 输入 */
.chat-page {
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background:#f6f7fb;
}

/* 顶部条 */
.chat-header {
  height: 56px;
  background:#fff;
  border-bottom:1px solid #eef0f4;
  display:flex; align-items:center; justify-content:space-between;
  padding:0 10px;
}
.left { display:flex; align-items:center; gap:10px; min-width: 0; }
.logo { width:28px; height:28px; border-radius:6px; }
.meta .title { font-weight:700; color:#1e2a3a; max-width: 46vw; }
.meta .sub { color:#9aa3b2; font-size:12px; }
.right { display:flex; align-items:center; gap:8px; }
.ml8 { margin-left:8px; }

/* 主内容：左历史，右聊天；移动端只留聊天 */
.content {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 12px;
  padding: 10px;
}
.history {
  background:#fff; border:1px solid #eef0f4; border-radius:12px; overflow:hidden;
}
.hist-head{ padding:10px 12px; font-weight:600; border-bottom:1px solid #f0f2f6; }
.hist-list{ max-height: calc(100vh - 200px); overflow:auto; }
.hist-item{ padding:10px 12px; border-bottom:1px dashed #f0f2f6; cursor:pointer; }
.hist-item.active{ background:#eef3ff; }
.hist-item .line1{ font-size:14px; }
.hist-item .line2{ font-size:12px; color:#9aa3b2; }

.chat-main {
  background:#fff; border:1px solid #eef0f4; border-radius:12px;
  padding:12px; overflow:auto;
}

/* 气泡 */
.msg{ display:flex; gap:10px; margin-bottom:12px; }
.msg.user{ flex-direction: row-reverse; }
.avatar img{ width:34px; height:34px; border-radius:8px; background:#eef2ff; }
.bubble{ max-width: 840px; }
.nick{ font-weight:600; color:#6b7380; margin-bottom:4px; }
.text :deep(p){ margin:6px 0; line-height:1.6 }
.text :deep(code){ background:#f4f6fa; padding:1px 4px; border-radius:4px; }

/* 底部输入，适配安全区（iPhone） */
.chat-input{
  background:#fff; border-top:1px solid #eef0f4; padding:10px;
  display:grid; grid-template-columns: 1fr auto; gap:10px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
}

/* 工具类 */
.ell { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* 移动端适配 */
@media (max-width: 900px) {
  .chat-header { height: 52px; }
  .meta .title { max-width: 42vw; }
  .content { grid-template-columns: 1fr; gap: 8px; padding: 8px; }
  .chat-main { border-radius: 10px; padding: 10px; }
  .avatar img { width:30px; height:30px; }
  .bubble { max-width: 100%; }
  .history { display: none; }
  /* Drawer 列表样式复用 */
  .drawer-list { max-height: 64vh; overflow:auto; }
  .drawer-list .hist-item{ padding:12px 14px; border-bottom:1px dashed #eef0f4; }
}
</style>
