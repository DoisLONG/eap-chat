<template>
  <div class="chat-page">
    <!-- Header -->
    <header class="chat-header">
      <div class="left">
        <img src="/logo1.png" class="logo" />
        <div class="meta">
          <div class="title ell">{{ sopName || "未选择 SOP" }}</div>
        </div>
      </div>
      <div class="right">
        <el-switch v-if="!isMobile" v-model="showHistory" active-text="历史对话" />
        <el-button v-if="!isMobile" size="small" @click="newSession" disabled>新建</el-button>
        <el-popconfirm title="确认结束考试？" @confirm="endExam">
          <template #reference>
            <el-button size="small" type="danger">结束</el-button>
          </template>
        </el-popconfirm>
      </div>
    </header>

    <!-- Main -->
    <div class="content">
      <aside v-if="showHistory && !isMobile" class="history">
        <div class="hist-head">历史对话</div>
        <div class="hist-list">
          <div
            v-for="s in sessions"
            :key="s.id"
            class="hist-item"
            :class="{ active: s.id === sessionId }"
            @click="loadSession(s.id)"
          >
            <div class="line1 ell">{{ s.title }}</div>
            <div class="line2">{{ s.time }}</div>
          </div>
        </div>
      </aside>

      <main class="chat-main" ref="scrollBox">
        <div
          v-for="m in messages"
          :key="m.id"
          class="msg-block"
          :class="m.role"
        >
          <div class="avatar">
            <img :src="m.role === 'user' ? userAvatar : botAvatar" />
          </div>
          <div class="bubble">
            <div class="nick">{{ m.role === "user" ? "我" : "教练" }}</div>
            <div class="text">
              <div v-if="m.role === 'user'">{{ m.content }}</div>
              <MarkdownRenderer v-else :content="m.content" />
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Footer -->
    <footer class="chat-input">
      <el-input
        v-model="input"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 6 }"
        placeholder="输入答案或提问..."
        @keydown.enter.prevent="onEnter"
        @keydown.shift.enter.stop
      />
      <el-button
        type="primary"
        :loading="sending"
        :disabled="!input.trim()"
        @click="send"
      >
        {{ messages.length <= 1 ? "开始" : "发送" }}
      </el-button>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';

// 路由参数
const route = useRoute();
const router = useRouter();
const sopName = route.query.sopName || "";
const sopId = route.query.sopId || "";
const userId = "test_user";
const scrollBox = ref(null);
const input = ref("");
const sending = ref(false);
const isMobile = ref(window.innerWidth <= 900);
const showHistory = ref(!isMobile.value);

const sessionId = ref("");
const examId = ref("");
const messages = reactive([]);
const sessions = ref([]);
const storageKey = `chat_hist_${sopId}`;

const userAvatar = "/logo2.png";
const botAvatar = "/logo1.png";

if (!sopId) router.replace("/chat/sop");

// 滚动到底
function scrollBottom() {
  nextTick(() => {
    const el = scrollBox.value;
    if (el) el.scrollTop = el.scrollHeight + 999;
  });
}

// 本地存储
function persist() {
  const idx = sessions.value.findIndex((s) => s.id === sessionId.value);
  const title = (
    messages.find((m) => m.role === "user")?.content || sopName
  ).slice(0, 20);
  const item = {
    id: sessionId.value,
    title,
    time: new Date().toLocaleString(),
    messages: JSON.parse(JSON.stringify(messages)),
  };
  if (idx >= 0) sessions.value[idx] = item;
  else sessions.value.unshift(item);
  localStorage.setItem(storageKey, JSON.stringify(sessions.value));
}

function loadSessions() {
  try {
    sessions.value = JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    sessions.value = [];
  }
}

function loadSession(id) {
  const found = sessions.value.find((s) => s.id === id);
  if (!found) return;
  sessionId.value = id;
  messages.splice(0, messages.length, ...found.messages);
  scrollBottom();
}

function ensureExcelFileName(name) {
  return name.match(/\.(xls|xlsx)$/i) ? name : `${name}.xlsx`;
}

// 新建对话
function newSession() {
  sessionId.value = String(Date.now());
  messages.splice(0, messages.length, {
    id: sessionId.value,
    role: "assistant",
    content: "你好，我是操作规程陪练系统。准备好了吗？我们开始练习！",
  });

  fetch("/chatapi/v1/exams/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      file_name: ensureExcelFileName(sopName),
    }),
  })
    .then((r) => r.json())
    .then((res) => {
      examId.value = res?.result?.exams_id || "";
      ElMessage.success("考试已启动");
      nextTick(() => send());
    })
    .catch(() => ElMessage.error("启动失败"));

  persist();
}

function onEnter(e) {
  if (e.shiftKey) input.value += "\n";
  else send();
}

// 让浏览器马上渲染一帧（解决“等全部出来才显示”）
const raf = () => new Promise(resolve => requestAnimationFrame(() => resolve()));

// 修正 Markdown：###标题 → ### 标题
function normalizeMd(s = "") {
  return s.replace(/^(\#{1,6})([^\s#])/gm, "$1 $2");
}

async function send() {
  const text = input.value.trim();
  if (!text && messages.length > 1) return;
  sending.value = true;

  // 1) 追加用户消息
  const userMsg = { id: Date.now() + "", role: "user", content: text };
  messages.push(userMsg);
  input.value = "";
  scrollBottom();

  // 2) 追加机器人气泡（流式写入）
  const replyMsg = { id: Date.now() + "bot", role: "assistant", content: "", raw: "" };
  messages.push(replyMsg);

  try {
    const res = await fetch("/chatapi/v1/exams/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 告诉后端 & 中间层我们要 SSE
        "Accept": "text/event-stream"
      },
      body: JSON.stringify({
        id: examId.value,
        session_id: examId.value,
        source_file_name: ensureExcelFileName(sopName),
        messages: (() => {
          const filtered = [...messages];
          if (filtered[filtered.length - 1].role === "assistant") filtered.pop();
          return filtered.map(({ role, content }) => ({ role, content }));
        })(),
        streaming: true,
        stream_options: { include_usage: true },
      }),
    });

    const reader = res.body.getReader();
    // 注意：开启 streaming 解码
    const decoder = new TextDecoder("utf-8", { fatal: false });
    let docs = [];
    let buffer = "";

    // 3) 流式读取 + 立刻渲染
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // 处理已完整的行（按 \n 分割，最后一段可能是不完整的，留到下次）
      let parts = buffer.split("\n");
      buffer = parts.pop() || "";

      for (let line of parts) {
        if (!line.startsWith("data:")) continue;

        // 只去掉 `data:` 前缀，保留可能用于 Markdown 的空格
        line = line.replace(/^data:\s?/, "");
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line || line === "[DONE]" || line === "[METADATA DONE]") continue;

        // 可能是 JSON（来源文档等），也可能是纯文本片段
        try {
          const parsed = JSON.parse(line);
          if (parsed.documents?.length) {
            docs = parsed.documents.filter(d => d.metadata?.filename && d.metadata.filename !== "none");
            continue;
          }
        } catch {
          // 纯文本：反转义换行，累加并立即更新
          const textFrag = line.replace(/\\n/g, "\n");
          replyMsg.raw += textFrag;
          replyMsg.content = normalizeMd(replyMsg.raw);

          // 强制让浏览器“先渲染这一帧”
          await raf();
          scrollBottom();
        }
      }
    }

    // 4) 处理最后残留（buffer 里若还剩下一行未处理）
    if (buffer.startsWith("data:")) {
      let tail = buffer.replace(/^data:\s?/, "");
      if (tail && tail !== "[DONE]" && tail !== "[METADATA DONE]") {
        try {
          const parsed = JSON.parse(tail);
          if (parsed.documents?.length) {
            docs = parsed.documents.filter(d => d.metadata?.filename && d.metadata.filename !== "none");
          }
        } catch {
          replyMsg.raw += tail.replace(/\\n/g, "\n");
          replyMsg.content = normalizeMd(replyMsg.raw);
        }
      }
      buffer = "";
    }

    // 5) 结束后再追加来源文档
    if (docs.length > 0) {
      replyMsg.raw += `\n\n<details><summary>📄 来源文档</summary>\n`;
      for (const d of docs) {
        const meta = d.metadata;
        const position = meta.position ? `（${meta.position}）` : "";
        replyMsg.raw += `- ${meta.filename}${position}\n`;
      }
      replyMsg.raw += `</details>\n`;
      replyMsg.content = normalizeMd(replyMsg.raw);
    }

    persist();
  } catch (err) {
    replyMsg.content = "❌ 出错了，请稍后重试";
    console.error(err);
  } finally {
    sending.value = false;
  }
}



function endExam() {
  persist();
  ElMessage.success("考试已结束");
  router.replace("/chat/sop");
}

onMounted(() => {
  loadSessions();
  newSession();
});
</script>

<style scoped>
.chat-page {
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: #f6f7fb;
}
.chat-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 10px;
  height: 56px;
  border-bottom: 1px solid #eee;
}
.left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo {
  width: 30px;
  height: 30px;
}
.meta .title {
  font-weight: bold;
  max-width: 45vw;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.content {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 10px;
  padding: 10px;
}
.history {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
}
.chat-main {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  overflow-y: auto;
}
.msg-block {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}
.msg-block.user {
  flex-direction: row-reverse;
}
.bubble {
  background: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
  max-width: 90vw;
  word-break: break-word;
}
.avatar img {
  width: 30px;
  height: 30px;
  border-radius: 6px;
}
.chat-input {
  background: #fff;
  padding: 10px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  border-top: 1px solid #eee;
}
@media (max-width: 900px) {
  .content {
    grid-template-columns: 1fr;
  }
  .history {
    display: none;
  }
}
</style>
