<template>
  <div class="chat-page">
    <!-- Header -->
    <header class="chat-header">
      <div class="left">
        <img src="/logo2.png" class="logo" />
        <div class="meta">
          <div class="title ell">{{ sopName || "未选择 SOP" }}</div>
        </div>
      </div>
      <div class="right">
        <el-switch
          v-if="!isMobile"
          v-model="showHistory"
          active-text="历史对话"
        />
        <el-button size="small" @click="newSession">新建</el-button>
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
            <div class="text" v-html="md(m.content)" />
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
import { marked } from "marked";
import { ElMessage } from "element-plus";

// 路由参数
const route = useRoute();
const router = useRouter();
const sopName = route.query.sopName || "";
const sopId = route.query.sopId || "";
const userId = "test_user";

if (!sopId) router.replace("/chat/sop");

// 基础变量
const scrollBox = ref(null);
const input = ref("");
const sending = ref(false);
const isMobile = ref(window.innerWidth <= 900);
const showHistory = ref(!isMobile.value);

const userAvatar = "/logo2.png";
const botAvatar = "/logo2.png";

const sessionId = ref("");
const examId = ref("");
const messages = reactive([]);
const sessions = ref([]);
const storageKey = `chat_hist_${sopId}`;

// Markdown 渲染
function md(s) {
  return marked
    .parse(s || "")
    .replaceAll("**", "")
    .replaceAll("\\n", "<br>")
    .replaceAll("### ", "<b>") // 小标题加粗
    .replaceAll("[METADATA DONE]", "");
}

// 滚动到底
function scrollBottom() {
  nextTick(() => {
    const el = scrollBox.value;
    if (el) el.scrollTop = el.scrollHeight + 999;
  });
}

// 存储历史对话
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

// 开启新对话
function newSession() {
  sessionId.value = String(Date.now());
  messages.splice(0, messages.length, {
    id: sessionId.value,
    role: "assistant",
    content: "你好，我是操作规程陪练。准备好了吗？我们开始练习！",
  });

  fetch("/chatapi/v1/exams/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      file_name: sopName.endsWith(".xlsx") ? sopName : `${sopName}.xlsx`,
    }),
  })
    .then((r) => r.json())
    .then((res) => {
      examId.value = res?.result?.exams_id || "";
      ElMessage.success("考试已启动");
    })
    .catch(() => ElMessage.error("启动失败"));

  persist();
}

// 结束考试
function endExam() {
  persist();
  ElMessage.success("考试已结束");
  router.replace("/chat/sop");
}

// 快捷发送
function onEnter(e) {
  if (e.shiftKey) input.value += "\n";
  else send();
}

// 发送答案（流式 + 文档展示）
async function send() {
  const text = input.value.trim();
  if (!text || sending.value) return;
  sending.value = true;

  const userMsg = { id: Date.now() + "", role: "user", content: text };
  messages.push(userMsg);
  input.value = "";
  scrollBottom();

  const replyMsg = { id: Date.now() + "bot", role: "assistant", content: "" };
  messages.push(replyMsg);

  try {
    const res = await fetch("/chatapi/v1/exams/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: examId.value,
        session_id: examId.value,
        source_file_name: sopName,
        messages: (() => {
          const filtered = [...messages];
          // 如果最后一条是 assistant，就移除
          if (
            filtered.length &&
            filtered[filtered.length - 1].role === "assistant"
          ) {
            filtered.pop();
          }
          return filtered.map(({ role, content }) => ({ role, content }));
        })(),
        streaming: true,
        stream_options: { include_usage: true },
      }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let docs = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk
        .split("\n")
        .filter((line) => line.startsWith("data:"));

      for (const line of lines) {
        const clean = line.replace(/^data:\s*/, "").trim();
        if (clean === "[DONE]" || clean === "[METADATA DONE]") continue;

        try {
          const parsed = JSON.parse(clean);
          if (parsed.documents?.length) {
            docs = parsed.documents.filter(
              (d) => d.metadata?.filename && d.metadata?.filename !== "none"
            );
            continue;
          }
        } catch {}

        replyMsg.content += clean + "\n";
      }

      scrollBottom();
    }

    // 追加文档来源
    if (docs.length > 0) {
      replyMsg.content += `\n\n📄 来源文档：`;
      for (const d of docs) {
        const meta = d.metadata;
        const position = meta.position ? `（${meta.position}）` : "";
        replyMsg.content += `\n- ${meta.filename}${position}`;
      }
    }

    persist();
  } catch (err) {
    replyMsg.content = "❌ 出错了，请稍后重试";
    console.error(err);
  } finally {
    sending.value = false;
  }
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
