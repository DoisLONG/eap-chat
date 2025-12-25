<template>
  <div class="chat-page">
    <!-- Header -->
    <header class="chat-header">
      <div class="left">
        <img src="/logo1.png" class="logo" />
        <div class="meta">
          <div class="title ell">
            {{
              position_id
                ? $t("SopPicker.mixMode")
                : sopName || $t("ChatExam.noSelectSop")
            }}
          </div>
        </div>
      </div>
      <div class="right">
        <el-switch
          v-if="!isMobile"
          v-model="showHistory"
          :active-text="$t('ChatExam.historyChat')"
        />
        <el-button
          v-if="isMobile"
          size="small"
          @click="showHistory = !showHistory"
        >
          {{
            showHistory
              ? $t("ChatExam.closeHistory")
              : $t("ChatExam.historyChat")
          }}
        </el-button>
        <el-button v-if="!isMobile" size="small" @click="newSession" disabled>{{
          $t("ChatExam.add")
        }}</el-button>
        <el-popconfirm :title="$t('ChatExam.confirmOver')" @confirm="endExam">
          <template #reference>
            <el-button size="small" type="danger">{{
              $t("ChatExam.over")
            }}</el-button>
          </template>
        </el-popconfirm>
      </div>
    </header>

    <!-- Main -->
    <div class="content">
      <aside v-if="showHistory && !isMobile" class="history">
        <div class="hist-head">{{ $t("ChatExam.historyChat") }}</div>
        <div class="hist-list">
          <div
            v-for="s in sessions"
            :key="s.id"
            class="hist-item"
            :class="{ active: s.id === sessionId }"
            @click="
              loadSession(s.id);
              showHistory = false;
            "
          >
            <div class="hist-title ell">{{ s.title }}</div>
            <div class="hist-time">{{ s.time }}</div>
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
            <div class="nick">
              {{ m.role === "user" ? $t("ChatExam.me") : $t("ChatExam.coach") }}
            </div>
            <div class="text">
              <div v-if="m.role === 'user'">{{ m.content }}</div>
              <!-- <MarkdownRenderer v-else :content="m.content" /> -->
              <!-- <MarkdownRenderer v-else :content="m.content" :key="m.id + '-' + (m.content?.length || 0)" /> -->
              <!-- 助手消息：流式时显示 raw，结束后显示 Markdown -->
              <template v-else>
                <div v-if="!m.done" class="streaming-text">{{ m.raw }}</div>
                <MarkdownRenderer v-else :content="m.content" />
              </template>
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
        :placeholder="$t('ChatExam.tip')"
        @keydown.enter.prevent="onEnter"
        @keydown.shift.enter.stop
      />
      <el-button
        type="primary"
        :loading="sending"
        :disabled="!input.trim()"
        @click="send"
      >
        {{ messages.length <= 1 ? $t("ChatExam.begin") : $t("ChatExam.send") }}
      </el-button>
    </footer>

    <el-drawer
      v-if="isMobile"
      v-model="showHistory"
      :title="$t('ChatExam.historyChat')"
      size="80%"
      direction="ltr"
    >
      <div class="hist-list">
        <div
          v-for="s in sessions"
          :key="s.id"
          class="hist-item"
          :class="{ active: s.id === sessionId }"
          @click="
            loadSession(s.id);
            showHistory = false;
          "
        >
          <div class="hist-title ell">{{ s.title }}</div>
          <div class="hist-time">{{ s.time }}</div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { endExamSession } from "@/services/chat.service";
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import { useUserStore } from "@/stores/modules/user";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);

// 路由参数
const route = useRoute();
const router = useRouter();
const sopName = route.query.sopName || "";
const sopId = route.query.sopId || "";
const position_id = route.query.position_id || "";
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

if (!sopId && !position_id) router.replace("/chat/sop");

// 让出主线程并触发一次绘制：nextTick(微任务) → setTimeout(宏任务) → requestAnimationFrame(下一帧)
const flushFrame = async () => {
  await nextTick(); // 刷新 Vue 响应式
  await new Promise((r) => setTimeout(r, 0)); // 让出一次宏任务，给浏览器机会做布局
  await new Promise((r) => requestAnimationFrame(r)); // 等下一帧真正绘制
};

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
    content: t("ChatExam.beginTip"),
  });
  let params = {
    user_id: String(userInfo.value.id),
    sop_id: sopId,
    username: "",
    conversation_id: "",
    // file_name: ensureExcelFileName(sopName),
  };
  if (position_id) {
    params = {
      user_id: String(userInfo.value.id),
      position_id: position_id,
      username: "",
      conversation_id: "",
    };
  }
  fetch("/chatapi/v1/exams/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
    .then((r) => r.json())
    .then((res) => {
      if (res?.results?.exams_id) {
        examId.value = res?.results?.exams_id || "";
        ElMessage.success(t("ChatExam.beginTest"));
        nextTick(() => send());
      } else {
        ElMessage.error(res?.message || t("ChatExam.startError"));
      }
    })
    .catch(() => ElMessage.error(t("ChatExam.startError")));

  persist();
}

function onEnter(e) {
  if (e.shiftKey) input.value += "\n";
  else send();
}

// 让浏览器马上渲染一帧（解决“等全部出来才显示”）
const raf = () =>
  new Promise((resolve) => requestAnimationFrame(() => resolve()));

// 修正 Markdown：###标题 → ### 标题
function normalizeMd(s = "") {
  return s.replace(/^(\#{1,6})([^\s#])/gm, "$1 $2");
}

async function send() {
  const text = input.value.trim();
  if (!text && messages.length > 1) return;
  sending.value = true;

  // 1) 追加用户消息
  messages.push({ id: Date.now() + "", role: "user", content: text });
  input.value = "";
  await nextTick();
  scrollBottom();

  // 2) 追加机器人气泡（先 push，再通过数组拿“代理对象”）
  messages.push({
    id: Date.now() + "bot",
    role: "assistant",
    raw: "",
    content: "",
    done: false,
  });
  // ⬇️ 关键！从 reactive 数组里拿到“代理对象”（不要再用 push 前创建的原始对象）
  const replyMsg = messages[messages.length - 1];

  try {
    const res = await fetch("/chatapi/v1/exams/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        id: examId.value,
        session_id: examId.value,
        source_file_name: ensureExcelFileName(sopName),
        messages: (() => {
          const filtered = [...messages];
          if (filtered[filtered.length - 1].role === "assistant")
            filtered.pop();
          return filtered.map(({ role, content }) => ({ role, content }));
        })(),
        streaming: true,
        stream_options: { include_usage: true },
      }),
    });

    if (!res.body) throw new Error("SSE body missing");

    if (!res.body) throw new Error("SSE body missing");

    // === SSE 解析开始（替换为这一段） ===
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let docs = [];
    let pending = ""; // 临时缓冲，防止频繁重绘

    const flush = async () => {
      if (!pending) return;
      replyMsg.raw += pending.replace(/\\n/g, "\n");
      pending = "";
      await nextTick();
      scrollBottom();
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split(/\r?\n/);

      for (let raw of lines) {
        if (!raw || !raw.startsWith("data:")) continue;
        let line = raw.slice(5).trim(); // 去掉 "data: "

        // 跳过结束/元数据结束标记
        if (!line || line === "[DONE]" || line === "[METADATA DONE]") continue;

        // 只有“对象 JSON”（以 { 开头）才解析，避免 '1' 被 JSON.parse 吞掉
        if (line[0] === "{") {
          try {
            const parsed = JSON.parse(line);

            // 1) 文档元数据
            if (Array.isArray(parsed?.documents) && parsed.documents.length) {
              docs = parsed.documents.filter(
                (d) => d?.metadata?.filename && d.metadata.filename !== "none"
              );
              continue;
            }

            // 2) 兼容常见增量字段
            if (parsed?.choices?.[0]?.delta?.content) {
              pending += parsed.choices[0].delta.content;
              await flush();
              continue;
            }
            if (typeof parsed?.delta === "string") {
              pending += parsed.delta;
              await flush();
              continue;
            }
            if (typeof parsed?.content === "string") {
              pending += parsed.content;
              await flush();
              continue;
            }

            // 3) 其他对象结构忽略（不当作纯文本）
            continue;
          } catch {
            // 形如 "{...}" 但解析失败：当作普通文本
            pending += line;
            await flush();
            continue;
          }
        }

        // 非对象 JSON：一律当作纯文本（包含单个数字、true/false、null、未加引号的中文片段等）
        pending += line;
        await flush();
      }
    }

    // 冲掉尾部缓冲
    if (pending) {
      replyMsg.raw += pending.replace(/\\n/g, "\n");
      pending = "";
    }

    // 结束后：追加来源文档，再一次性转 Markdown
    if (docs.length > 0) {
      replyMsg.raw += `\n\n<details><summary>📄 ${t(
        "ChatExam.fromDoc"
      )}</summary>\n`;
      for (const d of docs) {
        const meta = d.metadata || {};
        const position = meta.position ? `（${meta.position}）` : "";
        replyMsg.raw += `- ${meta.filename}${position}\n`;
      }
      replyMsg.raw += `</details>\n`;
    }

    replyMsg.content = normalizeMd(replyMsg.raw);
    replyMsg.done = true;

    await nextTick();
    scrollBottom();
    persist();
    // === SSE 解析结束 ===
  } catch (err) {
    console.error("SSE error", err);
    replyMsg.content = t("ChatExam.errorTip");
    replyMsg.done = true;
  } finally {
    sending.value = false;
    scrollBottom();
  }
}

function endExam() {
  persist();
  // endExamSession({
  //   user_id: String(userInfo.value.id),
  //   exams_id: examId.value,
  // }).then((res) => {
  //   ElMessage.success(t("ChatExam.testOver"));
  //   router.replace("/chat/sop");
  // });
  ElMessage.success(t("ChatExam.testOver"));
  router.replace("/chat/sop");
}

onMounted(() => {
  loadSessions();
  newSession();
});

// 页面卸载时结束考试会话
onUnmounted(() => {
  if (!examId.value) return;
  endExamSession({
    user_id: String(userInfo.value.id),
    exams_id: examId.value,
  });
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
  position: fixed; /* 改成 fixed */
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* 确保在最上层 */
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
  max-width: 35vw;
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
  margin-top: 56px; /* 给 header 留位置 */
  overflow-y: auto; /* 内容区域可滚动 */
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
.streaming-text {
  white-space: pre-wrap; /* \n 可见 */
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
  /* .history {
    display: none;
  } */
}
.hist-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
}

.hist-item {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 8px 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.hist-item:hover {
  background: #f5f7fa;
}

.hist-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.hist-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.hist-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
</style>
