<template>
  <div class="chat-page">
    <!-- Header -->
    <header class="chat-header" :class="{ 'chat-header-mobile': isMobile }">
      <div class="left">
        <div class="brand">
          <img src="/logo1.png" class="logo" />
          <div class="meta">
            <div class="title ell">
              {{
                position_id
                  ? $t("SopPicker.mixMode")
                  : sopName || $t("ChatExam.noSelectSop")
              }}
            </div>
            <div class="sub-title">AI Coach Exam Session</div>
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
          class="mobile-history-btn"
          size="small"
          round
          @click="showHistory = !showHistory"
        >
          历史
        </el-button>

        <el-button
          v-if="!isMobile"
          size="small"
          round
          @click="newSession"
          disabled
        >
          {{ $t("ChatExam.add") }}
        </el-button>

        <el-popconfirm :title="$t('ChatExam.confirmOver')" @confirm="endExam">
          <template #reference>
            <el-button size="small" type="danger" round>
              {{ $t("ChatExam.over") }}
            </el-button>
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
        <div class="chat-panel">
          <div
            v-for="m in messages"
            :key="m.id"
            class="msg-row"
            :class="m.role"
          >
            <div class="avatar">
              <img :src="m.role === 'user' ? userAvatar : botAvatar" />
            </div>

            <div class="msg-content">
              <div class="nick">
                {{
                  m.role === "user" ? $t("ChatExam.me") : $t("ChatExam.coach")
                }}
              </div>

              <div class="bubble" :class="m.role">
                <div class="text">
                  <div v-if="m.role === 'user'">{{ m.content }}</div>
                  <template v-else>
                    <div v-if="!m.done" class="streaming-text">{{ m.raw }}</div>
                    <MarkdownRenderer v-else :content="m.content" />
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Footer -->
    <footer class="chat-input">
      <div class="composer-card">
        <!-- 桌面端保持原样 -->
        <template v-if="!isMobile">
          <div class="voice-toolbar">
            <el-button
              size="small"
              round
              :loading="ttsLoading"
              @click="playAssistantAudio"
            >
              <!-- 播放当前题目/回复 -->
              {{ $t("ChatExam.playQuestion") }}
            </el-button>

            <el-button
              size="small"
              round
              :disabled="!audioPlaying"
              @click="stopAudio"
            >
              {{ $t("ChatExam.stopPlay") }}
            </el-button>

            <!-- <el-button
          size="small"
          round
          :type="recording ? 'danger' : 'primary'"
          :loading="asrLoading"
          @click="toggleRecord"
        >
          {{ recording ? "结束录音" : "开始说话" }}
        </el-button> -->
          </div>

          <div v-if="recognizedText" class="voice-result">
            <span class="voice-result-label">识别结果：</span>
            <span class="voice-result-text">{{ recognizedText }}</span>
            <el-button
              size="small"
              link
              type="primary"
              @click="useRecognizedText"
            >
              重新填入
            </el-button>
          </div>

          <div class="input-shell">
            <el-input
              v-model="input"
              class="chat-textarea"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 5 }"
              :placeholder="$t('ChatExam.tip')"
              @keydown.enter.prevent="onEnter"
              @keydown.shift.enter.stop
            />
            <el-button
              class="send-btn"
              type="primary"
              round
              :loading="sending"
              :disabled="!input.trim()"
              @click="send"
            >
              {{
                messages.length <= 1
                  ? $t("ChatExam.begin")
                  : $t("ChatExam.send")
              }}
            </el-button>
          </div>
        </template>

        <!-- 移动端：文本模式 -->
        <template v-else-if="mobileInputMode === 'text'">
          <div class="mobile-tools">
            <el-button
              class="mobile-mini-btn"
              round
              :loading="ttsLoading"
              @click="playAssistantAudio"
            >
              {{ $t("ChatExam.playQuestion") }}
            </el-button>

            <el-button
              class="mobile-mini-btn"
              round
              :disabled="!audioPlaying"
              @click="stopAudio"
            >
              {{ $t("ChatExam.stopPlay") }}
            </el-button>
          </div>

          <div v-if="recognizedText" class="voice-result mobile-voice-result">
            <span class="voice-result-label">识别结果：</span>
            <span class="voice-result-text">{{ recognizedText }}</span>
            <el-button
              size="small"
              link
              type="primary"
              @click="useRecognizedText"
            >
              重新填入
            </el-button>
          </div>

          <div class="mobile-text-entry">
            <el-input
              v-model="input"
              class="mobile-chat-input"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 4 }"
              :placeholder="$t('ChatExam.tip')"
              @keydown.enter.prevent="onEnter"
              @keydown.shift.enter.stop
            />
            <button
              class="mode-icon-btn"
              type="button"
              @click="switchToVoiceMode"
              aria-label="切换为语音输入"
            >
              <svg viewBox="0 0 24 24" class="mode-icon">
                <path
                  fill="currentColor"
                  d="M12 15a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3zm5-3a1 1 0 1 1 2 0a7 7 0 0 1-6 6.92V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-2.08A7 7 0 0 1 5 12a1 1 0 1 1 2 0a5 5 0 0 0 10 0z"
                />
              </svg>
            </button>
          </div>

          <el-button
            class="mobile-send-btn"
            type="primary"
            round
            :loading="sending"
            :disabled="!input.trim()"
            @click="send"
          >
            {{
              messages.length <= 1 ? $t("ChatExam.begin") : $t("ChatExam.send")
            }}
          </el-button>
        </template>

        <!-- 移动端：语音模式 -->
        <template v-else>
          <div class="mobile-voice-hint">
            {{
              voicePressing
                ? voiceCanceled
                  ? "松开取消发送"
                  : "松开发送，上移取消"
                : "点击下方区域并按住说话"
            }}
          </div>

          <div class="mobile-voice-entry">
            <div
              class="hold-to-talk"
              :class="{
                pressing: voicePressing,
                cancel: voiceCanceled,
              }"
              @touchstart.prevent="onHoldStart"
              @touchmove.prevent="onHoldMove"
              @touchend.prevent="onHoldEnd"
              @touchcancel.prevent="onHoldEnd"
            >
              <template v-if="voicePressing">
                <div class="voice-bars">
                  <span v-for="n in 28" :key="n"></span>
                </div>
              </template>
              <template v-else>
                <span class="hold-label">按住说话</span>
              </template>
            </div>

            <button
              class="mode-icon-btn keyboard"
              type="button"
              @click="switchToTextMode"
              aria-label="切换为键盘输入"
            >
              <svg viewBox="0 0 24 24" class="mode-icon">
                <path
                  fill="currentColor"
                  d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 2v10h16V7H4zm2 2h2v2H6V9zm3 0h2v2H9V9zm3 0h2v2h-2V9zm3 0h2v2h-2V9zm-9 3h2v2H6v-2zm3 0h8v2H9v-2z"
                />
              </svg>
            </button>
          </div>
        </template>
      </div>
    </footer>

    <el-drawer
      v-if="isMobile"
      v-model="showHistory"
      :title="$t('ChatExam.historyChat')"
      size="86%"
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
import { ref, reactive, onMounted, nextTick, onUnmounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { endExamSession } from "@/services/chat.service";
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import { useUserStore } from "@/stores/modules/user";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { synthesizeXfyunTts } from "@/services/xfyunTts";
import { transcribeXfyunAsr } from "@/services/xfyunAsr";

const { t, locale } = useI18n();

const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);

// 路由参数
const route = useRoute();
const router = useRouter();
const sopName = route.query.sopName || "";
const sopId = route.query.sopId || "";
const position_id = route.query.position_id || "";

const scrollBox = ref(null);
const input = ref("");
const sending = ref(false);
const isMobile = ref(window.innerWidth <= 900);
const showHistory = ref(!isMobile.value);

const sessionId = ref("");
const examId = ref("");
const messages = reactive([]);
const sessions = ref([]);
const storageKey = `chat_hist_${position_id || sopId || "default"}`;

const userAvatar = "/logo2.png";
const botAvatar = "/logo1.png";

if (!sopId && !position_id) router.replace("/chat/sop");

// ========== 语音状态 ==========
const mobileInputMode = ref("text"); // text | voice
const voicePressing = ref(false);
const voiceCanceled = ref(false);

const recording = ref(false);
const asrLoading = ref(false);
const ttsLoading = ref(false);
const audioPlaying = ref(false);
const recognizedText = ref("");

let pressStartY = 0;
let currentAudio = null;

let mediaRecorder = null;
let mediaStream = null;
let audioChunks = [];
let discardRecord = false;

function releaseAudio(audio) {
  if (audio?.__blobUrl) {
    URL.revokeObjectURL(audio.__blobUrl);
    audio.__blobUrl = "";
  }
}

function destroyAudio(audio) {
  if (!audio) return;

  try {
    audio.pause();
    audio.currentTime = 0;
  } catch {}

  audio.onended = null;
  audio.onerror = null;
  audio.onplay = null;

  releaseAudio(audio);
}

const latestAssistantText = computed(() => {
  const list = [...messages].filter((m) => m.role === "assistant");
  if (!list.length) return "";
  const last = list[list.length - 1];
  return (last.done ? last.content : last.raw) || "";
});

// 滚动到底
function scrollBottom() {
  nextTick(() => {
    const el = scrollBox.value;
    if (el) el.scrollTop = el.scrollHeight + 999;
  });
}

function updateViewport() {
  isMobile.value = window.innerWidth <= 900;
  if (!isMobile.value) {
    mobileInputMode.value = "text";
  }
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
    content: t("ChatExam.beginTip") || "准备开始考试",
  });

  recognizedText.value = "";
  input.value = "";

  let params = {
    user_id: String(userInfo.value.id),
    sop_id: sopId,
    username: "",
    conversation_id: "",
  };

  if (position_id) {
    params = {
      user_id: String(userInfo.value.id),
      position_id,
      username: "",
      conversation_id: "",
    };
  }

  const token = localStorage.getItem("token");
  fetch("/chatapi/v1/exams/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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

function normalizeMd(s = "") {
  return s.replace(/^(\#{1,6})([^\s#])/gm, "$1 $2");
}

function toSpeechText(text = "") {
  return String(text)
    .replace(/<details>/gi, "")
    .replace(/<\/details>/gi, "")
    .replace(/<summary>/gi, "")
    .replace(/<\/summary>/gi, "\n")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/`{1,3}([^`]*)`{1,3}/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ========== 讯飞 ASR ==========
function getAsrLanguage() {
  const lang = locale.value || "zh";
  if (lang === "en") return "en_us";
  return "zh_cn";
}

function cleanupRecorder() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  mediaRecorder = null;
  audioChunks = [];
}

async function startRecord() {
  if (recording.value || asrLoading.value) return;

  if (!window.isSecureContext) {
    ElMessage.warning("麦克风录音需要 HTTPS 或 localhost，当前访问地址不安全");
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    ElMessage.warning("当前浏览器不支持麦克风采集");
    return;
  }

  if (typeof MediaRecorder === "undefined") {
    ElMessage.warning("当前浏览器不支持录音");
    return;
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";

    mediaRecorder = new MediaRecorder(
      mediaStream,
      mimeType ? { mimeType } : undefined,
    );

    audioChunks = [];
    discardRecord = false;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstart = () => {
      recording.value = true;
    };

    mediaRecorder.onstop = async () => {
      recording.value = false;

      const blob = new Blob(audioChunks, {
        type: mimeType || "audio/webm",
      });

      cleanupRecorder();

      if (discardRecord) {
        discardRecord = false;
        voiceCanceled.value = false;
        voicePressing.value = false;
        if (isMobile.value) mobileInputMode.value = "text";
        return;
      }

      asrLoading.value = true;

      try {
        const text = await transcribeXfyunAsr(blob, {
          language: getAsrLanguage(),
          domain: "iat",
          accent: "mandarin",
          onProgress: (partialText) => {
            recognizedText.value = partialText || "";
          },
        });

        const finalText = String(text || "").trim();

        if (finalText) {
          recognizedText.value = finalText;
          input.value = input.value
            ? `${input.value}\n${finalText}`
            : finalText;
          ElMessage.success("识别成功，已填入输入框");
        } else {
          ElMessage.warning("未识别到有效内容");
        }
      } catch (err) {
        console.error("[xfyun asr error]", err);
        ElMessage.error(err?.message || "语音识别失败");
      } finally {
        asrLoading.value = false;
        voiceCanceled.value = false;
        voicePressing.value = false;
        if (isMobile.value) mobileInputMode.value = "text";
      }
    };

    mediaRecorder.start();
  } catch (err) {
    console.error("[startRecord error]", err);
    cleanupRecorder();
    ElMessage.error(err?.message || "无法启动录音");
  }
}

function stopRecord() {
  if (!mediaRecorder || mediaRecorder.state === "inactive") return;

  try {
    mediaRecorder.stop();
  } catch (err) {
    console.error("[stopRecord error]", err);
  }
}

function getPointerY(event) {
  const point = event?.touches?.[0] || event?.changedTouches?.[0] || event;
  return point?.clientY || 0;
}

function switchToVoiceMode() {
  mobileInputMode.value = "voice";
}

function switchToTextMode() {
  mobileInputMode.value = "text";
  voicePressing.value = false;
  voiceCanceled.value = false;

  if (recording.value) {
    discardRecord = true;
    stopRecord();
  }
}

function onHoldStart(event) {
  if (recording.value || asrLoading.value) return;

  pressStartY = getPointerY(event);
  voiceCanceled.value = false;
  discardRecord = false;
  voicePressing.value = true;

  startRecord();
}

function onHoldMove(event) {
  if (!voicePressing.value) return;

  const currentY = getPointerY(event);
  const offsetY = pressStartY - currentY;

  voiceCanceled.value = offsetY > 60;
}

function onHoldEnd() {
  if (!voicePressing.value) return;

  discardRecord = voiceCanceled.value;
  voicePressing.value = false;

  if (recording.value) {
    stopRecord();
  } else {
    voiceCanceled.value = false;
  }
}

function useRecognizedText() {
  if (!recognizedText.value) return;
  input.value = recognizedText.value;
}

// ========== TTS ==========
async function playTts(text) {
  const finalText = toSpeechText(text);

  if (!finalText) {
    ElMessage.warning("没有可播报的内容");
    return;
  }

  ttsLoading.value = true;

  try {
    stopAudio();

    const audio = await synthesizeXfyunTts(finalText);
    currentAudio = audio;

    audio.onplay = () => {
      if (currentAudio === audio) {
        audioPlaying.value = true;
      }
    };

    audio.onended = () => {
      if (currentAudio === audio) {
        audioPlaying.value = false;
        destroyAudio(audio);
        currentAudio = null;
      } else {
        destroyAudio(audio);
      }
    };

    audio.onerror = () => {
      if (currentAudio === audio) {
        audioPlaying.value = false;
        destroyAudio(audio);
        currentAudio = null;
      } else {
        destroyAudio(audio);
      }
      ElMessage.error("音频播放失败");
    };

    await audio.play();

    if (currentAudio === audio) {
      audioPlaying.value = true;
    }
  } catch (err) {
    console.error("[playTts error]", err);

    if (currentAudio) {
      destroyAudio(currentAudio);
      currentAudio = null;
    }

    audioPlaying.value = false;
    ElMessage.error(err?.message || "语音播报失败");
  } finally {
    ttsLoading.value = false;
  }
}

function stopAudio() {
  if (currentAudio) {
    const audio = currentAudio;
    currentAudio = null;
    audioPlaying.value = false;
    destroyAudio(audio);
    return;
  }

  audioPlaying.value = false;
}

function playAssistantAudio() {
  playTts(latestAssistantText.value);
}

// ========== 答题 ==========
async function send() {
  const rawText = input.value.trim();
  const isFirstRound = !rawText && messages.length <= 1;
  const text = rawText || (isFirstRound ? "开始考试" : "");

  if (!text && messages.length > 1) return;
  sending.value = true;

  messages.push({ id: Date.now() + "", role: "user", content: text });
  input.value = "";
  recognizedText.value = "";
  await nextTick();
  scrollBottom();

  messages.push({
    id: Date.now() + "bot",
    role: "assistant",
    raw: "",
    content: "",
    done: false,
  });
  const replyMsg = messages[messages.length - 1];

  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/chatapi/v1/exams/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        input: {
          id: examId.value,
          session_id: examId.value,
          source_file_name: ensureExcelFileName(sopName),
          messages: (() => {
            const filtered = [...messages];
            if (filtered[filtered.length - 1].role === "assistant") {
              filtered.pop();
            }
            return filtered.map(({ role, content }) => ({ role, content }));
          })(),
          streaming: true,
          stream_options: { include_usage: true },
        },
      }),
    });

    if (!res.body) throw new Error("SSE body missing");

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let docs = [];
    let pending = "";

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
        let line = raw.slice(5).trim();

        if (!line || line === "[DONE]" || line === "[METADATA DONE]") continue;

        if (line[0] === "{") {
          try {
            const parsed = JSON.parse(line);

            if (Array.isArray(parsed?.documents) && parsed.documents.length) {
              docs = parsed.documents.filter(
                (d) => d?.metadata?.filename && d.metadata.filename !== "none",
              );
              continue;
            }

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
          } catch {
            pending += line;
            await flush();
          }
        } else {
          pending += line;
          await flush();
        }
      }
    }

    if (pending) {
      replyMsg.raw += pending.replace(/\\n/g, "\n");
    }

    if (docs.length > 0) {
      replyMsg.raw += `\n\n<details><summary>📄 ${t(
        "ChatExam.fromDoc",
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
  ElMessage.success(t("ChatExam.testOver"));
  router.replace("/chat/sop");
}

onMounted(() => {
  updateViewport();
  loadSessions();
  newSession();
  window.addEventListener("resize", updateViewport, { passive: true });
});

onUnmounted(() => {
  stopAudio();

  if (recording.value) {
    discardRecord = true;
    stopRecord();
  }

  cleanupRecorder();
  window.removeEventListener("resize", updateViewport);

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
  background:
    radial-gradient(circle at top left, #eef6ff 0%, transparent 28%),
    radial-gradient(circle at top right, #f5f7ff 0%, transparent 24%),
    linear-gradient(180deg, #f6f8fc 0%, #f3f5f9 100%);
  color: #1f2937;
}

/* Header */
.chat-header {
  position: fixed;
  top: 12px;
  left: 12px;
  right: 12px;
  z-index: 1000;
  height: 64px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(31, 41, 55, 0.08);
}

.left,
.right {
  display: flex;
  align-items: center;
}

.right {
  gap: 5px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.logo {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  flex-shrink: 0;
}

.meta {
  min-width: 0;
}

.meta .title {
  font-size: 18px;
  font-weight: 800;
  max-width: 42vw;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #111827;
}

.sub-title {
  margin-top: 2px;
  font-size: 12px;
  color: #94a3b8;
}
.chat-header-mobile {
  height: 62px !important;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  .title {
    max-width: 80vw !important;
  }
}

/* Layout */
.content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  padding: 88px 16px 12px;
  min-height: 0;
}

.history {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
  backdrop-filter: blur(8px);
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.04);
}

.hist-head {
  padding: 18px 18px 12px;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.hist-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 14px 14px;
}

.hist-item {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hist-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  border-color: #cbd5e1;
}

.hist-item.active {
  border-color: #3b82f6;
  background: linear-gradient(180deg, #eff6ff 0%, #f8fbff 100%);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
}

.hist-title {
  font-size: 14px;
  line-height: 1.45;
  font-weight: 700;
  color: #1e293b;
}

.hist-time {
  margin-top: 8px;
  font-size: 12px;
  color: #94a3b8;
}

/* Chat */
.chat-main {
  min-height: 0;
  overflow-y: auto;
}

.chat-panel {
  min-height: 100%;
  padding: 20px 18px 28px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.05);
}

.msg-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.msg-row.user {
  flex-direction: row-reverse;
}

.avatar img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.msg-content {
  max-width: min(78%, 980px);
  display: flex;
  flex-direction: column;
}

.msg-row.user .msg-content {
  align-items: flex-end;
}

.nick {
  font-size: 12px;
  color: #94a3b8;
  margin: 0 10px 6px;
}

.bubble {
  position: relative;
  padding: 14px 16px;
  border-radius: 22px;
  line-height: 1.75;
  font-size: 15px;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.bubble.assistant {
  background: #ffffff;
  color: #111827;
  border: 1px solid #eef2f7;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
  border-top-left-radius: 10px;
}

.bubble.user {
  background: linear-gradient(135deg, #1677ff 0%, #4ea1ff 100%);
  color: #fff;
  box-shadow: 0 10px 24px rgba(22, 119, 255, 0.22);
  border-top-right-radius: 10px;
}

.text {
  font-size: 15px;
}

.streaming-text {
  white-space: pre-wrap;
}

/* Footer */
.chat-input {
  padding: 8px 16px 16px;
}

.composer-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 24px;
  padding: 14px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.voice-toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.tool-btn {
  min-width: 0;
}

.voice-result {
  margin-bottom: 10px;
  padding: 12px 14px;
  border-radius: 16px;
  background: linear-gradient(180deg, #f8fbff 0%, #f1f7ff 100%);
  border: 1px solid #dbeafe;
  color: #334155;
  font-size: 14px;
  word-break: break-word;
}

.voice-result-label {
  font-weight: 700;
  margin-right: 6px;
  color: #1d4ed8;
}

.voice-result-text {
  margin-right: 8px;
}

.input-shell {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.chat-textarea {
  flex: 1;
}

.chat-textarea :deep(.el-textarea__inner) {
  border-radius: 20px;
  min-height: 52px !important;
  padding: 14px 16px;
  font-size: 15px;
  border: 1px solid #dbe3ef;
  box-shadow: none;
  resize: none;
}

.chat-textarea :deep(.el-textarea__inner:focus) {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.14);
}

.send-btn {
  min-width: 96px;
  height: 46px;
  font-weight: 700;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
}

/* Responsive */
@media (max-width: 900px) {
  .chat-page {
    background: linear-gradient(180deg, #f7f9fc 0%, #f2f5fa 100%);
  }

  .chat-header {
    top: 8px;
    left: 8px;
    right: 8px;
    height: 58px;
    padding: 0 12px;
    border-radius: 16px;
  }

  .right {
    gap: 8px;
  }

  .mobile-history-btn {
    padding: 0 12px;
  }

  .meta .title {
    max-width: 43vw;
    font-size: 16px;
    line-height: 1.2;
  }

  .sub-title {
    display: none;
  }

  .content {
    grid-template-columns: 1fr;
    padding: 76px 8px 8px;
    gap: 8px;
  }

  .chat-panel {
    padding: 12px 10px 16px;
    border-radius: 20px;
  }

  .msg-row {
    gap: 10px;
    margin-bottom: 14px;
  }

  .avatar img {
    width: 34px;
    height: 34px;
  }

  .msg-content {
    max-width: calc(100% - 46px);
  }

  .nick {
    margin: 0 8px 4px;
    font-size: 12px;
  }

  .bubble {
    padding: 12px 14px;
    font-size: 14px;
    line-height: 1.65;
    border-radius: 18px;
  }

  .chat-input {
    padding: 6px calc(8px + env(safe-area-inset-right))
      calc(10px + env(safe-area-inset-bottom))
      calc(8px + env(safe-area-inset-left));
  }

  .composer-card {
    border-radius: 20px;
    padding: 12px;
  }

  /* 手机端：两小一大 */
  .voice-toolbar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 10px;
  }

  .voice-toolbar :deep(.el-button) {
    width: 100%;
    min-width: 0;
    margin: 0;
  }

  .action-play,
  .action-stop {
    height: 38px;
    font-size: 14px;
  }

  .action-speak {
    grid-column: 1 / -1;
    height: 42px;
    font-size: 15px;
    font-weight: 700;
  }

  .voice-result {
    padding: 10px 12px;
    border-radius: 14px;
    font-size: 13px;
  }

  /* 手机端：输入框和发送同一行 */
  .input-shell {
    display: grid;
    grid-template-columns: 1fr 82px;
    gap: 8px;
    align-items: end;
  }

  .chat-textarea :deep(.el-textarea__inner) {
    min-height: 46px !important;
    max-height: 108px;
    padding: 12px 14px;
    border-radius: 16px;
    font-size: 15px;
  }

  .send-btn {
    width: 82px;
    min-width: 82px;
    height: 46px;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 700;
  }
}
/* ===== Mobile voice redesigned ===== */
.mobile-tools {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.mobile-mini-btn {
  height: 38px;
  font-size: 14px;
  border-radius: 999px;
}

.mobile-voice-result {
  margin-bottom: 10px;
}

.mobile-text-entry {
  display: grid;
  grid-template-columns: 1fr 52px;
  gap: 10px;
  align-items: center;
}

.mobile-chat-input :deep(.el-textarea__inner) {
  min-height: 50px !important;
  max-height: 108px;
  border-radius: 18px;
  padding: 13px 14px;
  font-size: 15px;
  border: 1px solid #e2e8f0;
  box-shadow: none;
}

.mobile-chat-input :deep(.el-textarea__inner:focus) {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.14);
}

.mode-icon-btn {
  width: 52px;
  height: 52px;
  border: none;
  outline: none;
  border-radius: 50%;
  background: #000;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.15);
}

.mode-icon-btn.keyboard {
  background: #000;
}

.mode-icon {
  width: 24px;
  height: 24px;
}

.mobile-send-btn {
  width: 100%;
  height: 46px;
  margin-top: 10px;
  font-size: 15px;
  font-weight: 700;
  border-radius: 18px;
}

.mobile-voice-hint {
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 10px;
}

.mobile-voice-entry {
  display: grid;
  grid-template-columns: 1fr 52px;
  gap: 10px;
  align-items: center;
}

.hold-to-talk {
  height: 64px;
  border-radius: 18px;
  background: #f7f7f8;
  border: 1px solid #eceff3;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-user-select: none;
  transition: all 0.2s ease;
}

.hold-to-talk.pressing {
  background: linear-gradient(135deg, #1f80ff 0%, #429bff 100%);
  border-color: transparent;
  box-shadow: 0 12px 28px rgba(31, 128, 255, 0.28);
}

.hold-to-talk.cancel {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
  box-shadow: 0 12px 28px rgba(239, 68, 68, 0.22);
}

.hold-label {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.hold-to-talk.pressing .hold-label,
.hold-to-talk.cancel .hold-label {
  color: #fff;
}

.voice-bars {
  display: flex;
  align-items: center;
  gap: 4px;
}

.voice-bars span {
  display: block;
  width: 3px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  animation: voiceBar 1s ease-in-out infinite;
}

.voice-bars span:nth-child(2n) {
  animation-duration: 0.85s;
  height: 14px;
}

.voice-bars span:nth-child(3n) {
  animation-duration: 1.1s;
  height: 18px;
}

.voice-bars span:nth-child(4n) {
  animation-duration: 0.95s;
  height: 12px;
}

@keyframes voiceBar {
  0%,
  100% {
    transform: scaleY(0.65);
    opacity: 0.75;
  }
  50% {
    transform: scaleY(1.15);
    opacity: 1;
  }
}

@media (max-width: 900px) {
  .chat-header {
    top: 8px;
    left: 8px;
    right: 8px;
    height: 58px;
    padding: 0 12px;
    border-radius: 16px;
  }

  .meta .title {
    max-width: 42vw;
    font-size: 16px;
    line-height: 1.2;
  }

  .sub-title {
    display: none;
  }

  .content {
    grid-template-columns: 1fr;
    padding: 76px 8px 8px;
    gap: 8px;
  }

  .chat-panel {
    padding: 12px 10px 16px;
    border-radius: 20px;
  }

  .msg-row {
    gap: 10px;
    margin-bottom: 14px;
  }

  .avatar img {
    width: 34px;
    height: 34px;
  }

  .msg-content {
    max-width: calc(100% - 46px);
  }

  .nick {
    margin: 0 8px 4px;
    font-size: 12px;
  }

  .bubble {
    padding: 12px 14px;
    font-size: 14px;
    line-height: 1.65;
    border-radius: 18px;
  }

  .chat-input {
    padding: 6px calc(8px + env(safe-area-inset-right))
      calc(10px + env(safe-area-inset-bottom))
      calc(8px + env(safe-area-inset-left));
  }

  .composer-card {
    border-radius: 20px;
    padding: 12px;
  }
}
</style>
