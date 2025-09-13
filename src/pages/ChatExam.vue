<template>
  <div class="chat-page">
    <!-- 顶部 -->
    <header class="chat-header">
      <div class="left">
        <img src="/logo2.png" class="logo" />
        <div class="meta">
          <div class="title">{{ sopName || '未选择 SOP' }}</div>
          <div class="sub">版本：{{ sopVer || '-' }} · ID：{{ sopId || '-' }}</div>
        </div>
      </div>
      <div class="right">
        <el-switch v-model="showHistory" active-text="历史对话" inactive-text="历史对话" />
        <el-button @click="newSession" class="ml8">新建对话</el-button>
        <el-popconfirm title="确认结束考试？" confirm-button-text="结束" cancel-button-text="取消" @confirm="endExam">
          <template #reference>
            <el-button type="danger" plain class="ml8">结束考试</el-button>
          </template>
        </el-popconfirm>
      </div>
    </header>

    <div class="content">
      <!-- 历史侧栏 -->
      <aside v-if="showHistory" class="history">
        <div class="hist-head">历史对话</div>
        <div class="hist-list">
          <div
            v-for="s in sessions"
            :key="s.id"
            class="hist-item"
            :class="{active: s.id===sessionId}"
            @click="loadSession(s.id)"
          >
            <div class="line1">{{ s.title }}</div>
            <div class="line2">{{ s.time }}</div>
          </div>
        </div>
      </aside>

      <!-- 对话区 -->
      <main class="chat-main" ref="scrollBox">
        <div v-for="m in messages" :key="m.id" class="msg" :class="m.role">
          <div class="avatar"><img :src="m.role==='user'?userAvatar:botAvatar" /></div>
          <div class="bubble">
            <div class="nick">{{ m.role==='user'?'我':'教练' }}</div>
            <div class="text" v-html="md(m.content)"></div>
          </div>
        </div>
      </main>
    </div>

    <!-- 底部输入 -->
    <footer class="chat-input">
      <el-input
        v-model="input"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 6 }"
        placeholder="输入答案或提问…（Enter 发送，Shift+Enter 换行）"
        @keydown.enter.prevent="onEnter"
        @keydown.shift.enter.stop
      />
      <el-button type="primary" :disabled="sending || !input.trim()" @click="send">开始/发送</el-button>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 接受 SOP 信息（没有就回去选）
const sopId   = route.query.sopId  || ''
const sopName = route.query.sopName|| ''
const sopVer  = route.query.sopVer || ''
if (!sopId) router.replace('/chat/sop')

// UI/状态
const scrollBox = ref(null)
const input = ref('')
const sending = ref(false)
const showHistory = ref(false)
const userAvatar = '/logo2.png'
const botAvatar  = '/logo2.png'

// 当前会话
const sessionId = ref(newId())
const messages = reactive([
  { id: newId(), role: 'assistant', content: '你好，我是操作规程陪练。准备好了吗？我们开始练习！' }
])

// 历史（每个 SOP 单独存）
const storageKey = `chat_hist_${sopId}`
const sessions = ref([]) // [{id,title,time, messages:[]}]
loadSessions()

function loadSessions() {
  try {
    sessions.value = JSON.parse(localStorage.getItem(storageKey) || '[]')
  } catch { sessions.value = [] }
}
function persist() {
  const idx = sessions.value.findIndex(s => s.id === sessionId.value)
  const sub = (messages[1]?.content || messages[0]?.content || sopName).slice(0, 18)
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
function loadSession(id) {
  const found = sessions.value.find(s => s.id === id)
  if (!found) return
  sessionId.value = id
  messages.splice(0, messages.length, ...found.messages)
  nextTick(scrollBottom)
}
function newSession() {
  sessionId.value = newId()
  messages.splice(0, messages.length,
    { id: newId(), role: 'assistant', content: '新的练习开始，请根据 SOP 回答问题或提出疑问。' }
  )
  persist()
  ElMessage.success('已新建对话')
  nextTick(scrollBottom)
}
function endExam() {
  persist()
  ElMessage.success('考试结束，已保存到历史对话')
  router.replace('/chat/sop')
}

function onEnter(e) {
  if (e.shiftKey) { input.value += '\n'; return }
  send()
}
function scrollBottom() {
  const el = scrollBox.value
  if (el) el.scrollTop = el.scrollHeight + 999
}
function newId() { return String(Date.now() + Math.random()) }
function md(s) { return marked.parse(s || '') }

async function send() {
  const text = input.value.trim()
  if (!text) return
  sending.value = true
  messages.push({ id:newId(), role:'user', content:text })
  input.value = ''
  scrollBottom()

  // —— 这里对接你的“问答/考试”后端即可 —— //
  // 先给一个模拟逻辑：随机判断对/错
  await new Promise(r => setTimeout(r, 400))
  const ok = Math.random() > 0.4
  const reply = ok
    ? `回答正确！\n下一题：请根据 **${sopName}** 说明「安全注意事项」中的第一条是什么？`
    : `回答错误！\n**正确答案**：请参考 SOP 中“步骤一”。\n**错误原因**：关键步骤遗漏。\n下一题：更换前是否需要关闭电源？（是/否）`
  messages.push({ id:newId(), role:'assistant', content: reply })
  sending.value = false
  scrollBottom()
  persist()
}

onMounted(() => {
  // 首次也保存一份会话
  persist()
  nextTick(scrollBottom)
})
</script>

<style scoped>
.chat-page { height: 100vh; display: grid; grid-template-rows: auto 1fr auto; background:#f6f7fb; }
.chat-header {
  height: 60px; background:#fff; border-bottom:1px solid #eef0f4;
  display:flex; align-items:center; justify-content:space-between; padding:0 12px;
}
.left { display:flex; align-items:center; gap:10px; }
.logo { width:30px; height:30px; border-radius:6px; }
.meta .title { font-weight:700; color:#1e2a3a; }
.meta .sub { color:#9aa3b2; font-size:12px; }
.right { display:flex; align-items:center; }
.ml8{ margin-left:8px; }

.content { display:grid; grid-template-columns: 260px 1fr; gap: 12px; padding: 12px; }
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
.msg{ display:flex; gap:10px; margin-bottom:12px; }
.msg.user{ flex-direction: row-reverse; }
.avatar img{ width:36px; height:36px; border-radius:8px; background:#eef2ff; }
.bubble{ max-width: 840px; }
.nick{ font-weight:600; color:#6b7380; margin-bottom:4px; }
.text :deep(p){ margin:6px 0; line-height:1.6 }
.text :deep(code){ background:#f4f6fa; padding:1px 4px; border-radius:4px; }

.chat-input{
  background:#fff; border-top:1px solid #eef0f4; padding:10px 12px;
  display:grid; grid-template-columns: 1fr auto; gap:10px;
}

/* 移动端 */
@media (max-width: 900px) {
  .content { grid-template-columns: 1fr; }
  .history { order:2; }
  .chat-main { order:1; }
}
</style>
