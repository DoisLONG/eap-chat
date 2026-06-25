<!-- 纵向布局 -->
<template>
  <div class="layout-container">
    <!-- 管理端布局 -->
    <el-container class="layout">
      <el-aside>
        <div class="aside-box-duan">
          <div
            class="duan-item"
            :class="{ active: activeDuan === 'user' }"
            @click="changeDuan('user')"
          >
            <div class="logo-content">
              <img
                style="width: 26px; height: 26px"
                :src="
                  activeDuan === 'user' ? '/logo-white.png' : '/logo-blue.png'
                "
                alt="logo"
              />
            </div>
            <div
              class="text"
              :style="{
                fontSize: language === 'zh' ? '14px' : '12px',
              }"
            >
              {{ $t("layout.userEnd") }}
            </div>
          </div>
          <div
            class="duan-item"
            :class="{
              active: activeDuan === 'admin',
              'duan-item-admin': isFirst,
            }"
            @click="changeDuan('admin')"
          >
            <el-popover
              popper-class="duan-popover"
              placement="right"
              :width="330"
              :offset="16"
              :visible="isFirst && activeDuan === 'user'"
            >
              <template #reference>
                <div class="logo-content">
                  <img
                    style="width: 26px; height: 26px"
                    :src="
                      activeDuan === 'admin'
                        ? '/logo-white.png'
                        : '/logo-blue.png'
                    "
                    alt="logo"
                  />
                </div>
              </template>
              <div class="duan-popover-content">
                <div class="header">
                  <span class="title">{{ $t("layout.adminEnd") }}</span>
                  <div class="img" @click="setFirst">
                    <img
                      style="width: 16px; height: 16px"
                      src="@/assets/images/close-icon.png"
                    />
                  </div>
                </div>
                <div class="content">
                  <div>👋 {{ $t("layout.welcomeTip") }}</div>
                  {{ $t("layout.switchTip") }}
                </div>
                <div class="footer">
                  <el-button @click="setFirst">{{
                    $t("layout.iKnow")
                  }}</el-button>
                </div>
              </div>
            </el-popover>
            <div
              class="text"
              :style="{
                fontSize: language === 'zh' ? '14px' : '12px',
              }"
            >
              {{ $t("layout.adminEnd") }}
            </div>
          </div>
          <div class="user-setting">
            <Setting />
          </div>
        </div>
        <div
          v-show="activeDuan === 'admin'"
          class="aside-box"
          :style="{ width: isCollapse ? '65px' : '208px' }"
        >
          <!-- <div class="logo flx-center">
            <img class="logo-img" src="/logo2.png" alt="logo" />
            <span
              v-show="!isCollapse"
              :class="lang === 'en' ? 'logo-text-en' : 'logo-text'"
              >{{ $t("home.title") }}</span
            >
          </div> -->
          <div class="logo-full" v-if="!isCollapse">
            <img style="width: 127px" src="/logo-full.png" alt="logo" />
            <!-- <span
              v-show="!isCollapse"
              :class="lang === 'en' ? 'logo-text-en' : 'logo-text'"
              >{{ $t("home.title") }}</span
            > -->
          </div>
          <div class="logo-full-collapse" v-else>
            <img style="width: 28px" src="/logo-blue.png" alt="logo" />
          </div>
          <el-scrollbar>
            <el-menu
              :router="false"
              :default-active="activeMenu"
              :collapse="isCollapse"
              :unique-opened="accordion"
              :collapse-transition="false"
            >
              <SubMenu :menu-list="menuList" />
            </el-menu>
          </el-scrollbar>
        </div>
      </el-aside>
      <el-container v-show="activeDuan === 'admin'">
        <el-header>
          <ToolBarLeft />
          <ToolBarRight />
        </el-header>
        <Main />
      </el-container>
      <el-container
        v-show="activeDuan === 'user'"
        class="user-iframe-container"
      >
        <div
          v-if="
            userStage === 'portal' ||
            userStage === 'hardwareExpanding'
          "
          class="demo-portal"
          :class="{
            'demo-portal-mode-right':
              userStage === 'hardwareExpanding' || userStage === 'hardware',
          }"
        >
          <section class="demo-card demo-card-mobile">
            <img
              class="demo-phone-img"
              src="@/assets/images/demo-phone.png"
              alt=""
            />
            <div class="demo-card-mask"></div>
            <div class="demo-card-content">
              <div class="demo-title">
                BEAT培训系统
                <span>移动端</span>
              </div>
              <button class="demo-button" type="button" @click="openUserDemo">
                演示一下
                <i></i>
              </button>
            </div>
            <button
              class="mobile-collapse-button"
              type="button"
              @click="exitUserDemo"
            >
              <i></i>
            </button>
          </section>
          <section
            class="demo-card demo-card-hardware voice-card"
            :class="{
              'voice-active': voiceActive,
              'voice-guide-ready': voiceGuideReady,
            }"
          >
            <div class="voice-wave-rings"></div>
            <img
              id="voiceProduct"
              class="demo-voice-product voice-product"
              :src="voiceProductSrc"
              alt=""
            />
            <button
              id="centerHotspot"
              class="center-hotspot"
              type="button"
              @click="toggleVoiceInteraction"
            ></button>
            <div id="voiceGuide" class="voice-guide">
              <svg
                class="voice-guide-line"
                viewBox="0 0 360 180"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polyline points="0,180 118,38 360,38" />
              </svg>
              <button
                id="guideBubble"
                class="voice-callout"
                type="button"
                @click="toggleVoiceInteraction"
              >
                <i></i>
                点击开启语音
              </button>
            </div>
            <div
              id="voiceCaption"
              class="voice-caption"
              :class="{ show: voiceCaptionVisible }"
            >
              {{ voiceCaptionText }}
            </div>
            <div class="demo-card-mask"></div>
            <div class="demo-card-content">
              <div class="demo-title">
                BEAT智能语音系统
                <span>硬件</span>
              </div>
              <button
                class="demo-button"
                type="button"
                @click="openHardwareDemo"
              >
                演示一下
                <i></i>
              </button>
            </div>
          </section>
        </div>
        <div v-else-if="userStage === 'iframe'" class="demo-playground">
          <section class="demo-live-main">
            <div class="demo-live-header">
              <div class="demo-live-title">
                BEAT培训系统
                <span>移动端</span>
              </div>
              <button class="demo-exit-button" type="button" @click="exitUserDemo">
                <i></i>
                退出演示
              </button>
            </div>
            <div class="user-iframe-wrapper">
              <iframe
                v-if="isReset"
                :src="userUrl"
                class="user-iframe"
                :style="{
                  width: h5Size.width + 'px',
                  height: h5Size.height + 'px',
                }"
                frameborder="0"
                title="用户端"
              ></iframe>
            </div>
          </section>
          <section class="demo-live-side">
            <div class="demo-live-side-mask"></div>
            <div class="demo-live-side-title">BEAT智能语音系统</div>
            <button class="demo-side-button" type="button" @click="exitUserDemo">
              <i></i>
            </button>
          </section>
        </div>
        <div v-else class="hardware-playground">
          <section class="hardware-live-side">
            <img
              class="hardware-side-phone"
              src="@/assets/images/demo-phone.png"
              alt=""
            />
            <div class="hardware-side-mask"></div>
            <div class="hardware-side-title">BEAT培训系统</div>
            <button
              class="hardware-side-button"
              type="button"
              @click="openUserDemo"
            >
              <i></i>
            </button>
          </section>
          <section
            class="hardware-live-main voice-card"
            :class="{
              'voice-active': voiceActive,
              'voice-guide-ready': voiceGuideReady,
            }"
          >
            <div class="hardware-live-header">
              <div class="hardware-live-title">
                BEAT智能语音系统
                <span>硬件</span>
              </div>
              <button class="demo-exit-button" type="button" @click="exitUserDemo">
                <i></i>
                退出演示
              </button>
            </div>
            <div class="hardware-stage">
              <div class="voice-wave-rings"></div>
              <img
                id="voiceProduct"
                class="hardware-device voice-product"
                :src="voiceProductSrc"
                alt=""
              />
              <button
                id="centerHotspot"
                class="center-hotspot"
                :class="{ recording: hardwareRecording, loading: hardwareVoiceLoading }"
                type="button"
                @mousedown.prevent="startHardwareVoiceRecord"
                @mouseup.prevent="stopHardwareVoiceRecord"
                @mouseleave.prevent="stopHardwareVoiceRecord"
                @touchstart.prevent="startHardwareVoiceRecord"
                @touchend.prevent="stopHardwareVoiceRecord"
                @touchcancel.prevent="cancelHardwareVoiceRecord"
              ></button>
              <div id="voiceGuide" class="voice-guide">
                <svg
                  class="voice-guide-line"
                  viewBox="0 0 360 180"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <polyline points="0,180 118,38 360,38" />
                </svg>
                <button
                  id="guideBubble"
                  class="voice-callout"
                  type="button"
                  @click="startVoiceInteraction"
                >
                  <i></i>
                  按住中间按钮开始考试
                </button>
              </div>
              <div
                id="voiceCaption"
                class="voice-caption"
                :class="{ show: voiceCaptionVisible }"
              >
                {{ voiceCaptionText }}
              </div>
            </div>
          </section>
        </div>
      </el-container>
    </el-container>
  </div>
</template>

<script setup name="layoutVertical">
import { computed, ref, provide, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/modules/auth";
import { useGlobalStore } from "@/stores/modules/global";
import Main from "@/layouts/components/Main/index.vue";
import Setting from "@/layouts/components/Header/components/Setting.vue";
import { onMounted, onUnmounted, watch } from "vue";
import ToolBarLeft from "@/layouts/components/Header/ToolBarLeft.vue";
import ToolBarRight from "@/layouts/components/Header/ToolBarRight.vue";
import SubMenu from "@/layouts/components/Menu/SubMenu.vue";
import { getConfigs, setConfigs } from "@/services/user.service";
import voice000 from "@/assets/images/sequence_aligned/voice_000.png";
import voice001 from "@/assets/images/sequence_aligned/voice_001.png";
import voice002 from "@/assets/images/sequence_aligned/voice_002.png";
import voice003 from "@/assets/images/sequence_aligned/voice_003.png";
import voice004 from "@/assets/images/sequence_aligned/voice_004.png";
import voice005 from "@/assets/images/sequence_aligned/voice_005.png";
import voice006 from "@/assets/images/sequence_aligned/voice_006.png";
import {
  finishVoiceExam,
  sendVoiceExamText,
} from "@/services/voiceExam.service";
import { transcribeXfyunAsr } from "@/services/xfyunAsr";
import { synthesizeXfyunTts } from "@/services/xfyunTts";

const route = useRoute();
const authStore = useAuthStore();
const globalStore = useGlobalStore();
const accordion = computed(() => globalStore.accordion);
const language = computed(() => globalStore.language);
const isCollapse = computed(() => globalStore.isCollapse);
const lang = computed(() => globalStore.language);
const menuList = computed(() => authStore.showMenuListGet);
const activeMenu = computed(() => {
  return route.meta.activeMenu ? route.meta.activeMenu : route.path;
});

const isFirst = ref(false);
const activeDuan = ref(localStorage.getItem("activeDuan") || "user");
const userStage = ref("portal");
const userUrl = ref("");
const voiceActive = ref(false);
const voiceGuideReady = ref(false);
const voiceCaptionVisible = ref(false);
const voiceCaptionText = ref("");
const fullVoiceCaption =
  "欢迎使用您的专属语音助手，有什么问题尽管问我吧";
const hardwareVoiceSessionId = `hardware-demo-${Date.now()}`;
const hardwareRecording = ref(false);
const hardwareVoiceLoading = ref(false);
let hardwareMediaRecorder = null;
let hardwareMediaStream = null;
let hardwareAudioChunks = [];
let hardwareDiscardRecord = false;
let hardwareStopRequested = false;
let hardwareCurrentAudio = null;
const voiceFrames = [
  voice000,
  voice001,
  voice002,
  voice003,
  voice004,
  voice005,
  voice006,
];
const voiceProductSrc = ref(voiceFrames[0]);
let voiceFrameTimer = null;
let hardwareExpandTimer = null;
let voiceCaptionTimer = null;
const h5Size = ref({
  width: 0,
  height: 0,
});

const getUserConfig = async () => {
  const res = await getConfigs();
  if (res.data.status === 200) {
    isFirst.value = res.data.data.welcome_guide_pending === 0;
  }
};
getUserConfig();
const setFirst = () => {
  isFirst.value = false;
  setConfigs({
    payload: {
      welcome_guide_pending: 1,
    },
  });
};
provide("activeDuan", activeDuan);

const changeDuan = (val) => {
  if (isFirst.value && val === "admin") return;
  activeDuan.value = val;
  localStorage.setItem("activeDuan", val);
  if (val === "user" && userStage.value === "iframe") {
    nextTick(() => {
      calculateH5Size();
    });
  }
};

const openUserDemo = () => {
  clearHardwareExpandTimer();
  resetVoiceProduct();
  voiceActive.value = false;
  voiceGuideReady.value = false;
  resetVoiceCaption();
  userStage.value = "iframe";
  nextTick(() => {
    calculateH5Size();
  });
};

const openHardwareDemo = () => {
  clearHardwareExpandTimer();
  resetVoiceProduct();
  voiceActive.value = false;
  voiceGuideReady.value = false;
  resetVoiceCaption();
  userStage.value = "hardwareExpanding";
  nextTick(() => {
    playVoiceSequence();
  });
  hardwareExpandTimer = setTimeout(() => {
    userStage.value = "hardware";
    voiceActive.value = false;
    resetVoiceCaption();
    voiceGuideReady.value = true;
    nextTick(() => {
      setVoiceProductFrame(voiceFrames.length - 1);
    });
    hardwareExpandTimer = null;
  }, 820);
};

const exitUserDemo = () => {
  clearHardwareExpandTimer();
  stopHardwareAudio();
  cleanupHardwareRecorder();
  finishVoiceExam(hardwareVoiceSessionId).catch(() => {});
  resetVoiceProduct();
  voiceActive.value = false;
  voiceGuideReady.value = false;
  resetVoiceCaption();
  userStage.value = "portal";
};

const startVoiceInteraction = () => {
  voiceActive.value = true;
  setVoiceCaption("按住中间按钮开始语音考试。");
};

const toggleVoiceInteraction = () => {
  if (voiceActive.value) {
    voiceActive.value = false;
    resetVoiceCaption();
  } else {
    voiceActive.value = true;
    typeVoiceCaption();
  }
};

const setVoiceCaption = (text) => {
  if (voiceCaptionTimer) {
    clearInterval(voiceCaptionTimer);
    voiceCaptionTimer = null;
  }
  voiceCaptionText.value = text;
  voiceCaptionVisible.value = true;
};

const resetVoiceCaption = () => {
  if (voiceCaptionTimer) {
    clearInterval(voiceCaptionTimer);
    voiceCaptionTimer = null;
  }
  voiceCaptionVisible.value = false;
  voiceCaptionText.value = "";
};

const typeVoiceCaption = () => {
  resetVoiceCaption();
  let index = 0;
  voiceCaptionVisible.value = true;
  voiceCaptionTimer = setInterval(() => {
    voiceCaptionText.value += fullVoiceCaption[index];
    index += 1;

    if (index >= fullVoiceCaption.length) {
      clearInterval(voiceCaptionTimer);
      voiceCaptionTimer = null;
    }
  }, 60);
};

const stopHardwareAudio = () => {
  if (!hardwareCurrentAudio) return;
  try {
    hardwareCurrentAudio.pause();
    hardwareCurrentAudio.currentTime = 0;
  } catch {}
  hardwareCurrentAudio = null;
};

const bindAndPlayHardwareAudio = async (audio) => {
  stopHardwareAudio();
  hardwareCurrentAudio = audio;
  audio.onended = () => {
    if (hardwareCurrentAudio === audio) hardwareCurrentAudio = null;
  };
  audio.onerror = () => {
    if (hardwareCurrentAudio === audio) hardwareCurrentAudio = null;
    setVoiceCaption("语音播放失败，请再试一次。");
  };
  await audio.play();
};

const playHardwareAudio = async (url) => {
  if (!url) return false;
  await bindAndPlayHardwareAudio(new Audio(url));
  return true;
};

const extractExamField = (text, field) => {
  const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`${escapedField}\\*\\*：(.+?)(?:\\\\n|\\n|$)`, "s"),
    new RegExp(`${escapedField}：(.+?)(?:\\\\n|\\n|$)`, "s"),
  ];

  for (const pattern of patterns) {
    const matched = text.match(pattern);
    if (matched?.[1]) return matched[1].trim();
  }
  return "";
};

const normalizeExamText = (text) => String(text || "").replace(/\\n/g, "\n").trim();

const cleanExamQuestion = (text) =>
  normalizeExamText(text)
    .replace(/【[^】]+】/g, "")
    .replace(/______+/g, "什么")
    .replace(/\*\*/g, "")
    .replace(/^[-*+]\s*/gm, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const HARDWARE_DEMO_TOTAL_QUESTIONS = 10;

const extractQuestionNumber = (rawText) => {
  const raw = normalizeExamText(rawText);
  const match = raw.match(/第\s*([一二三四五六七八九十百千万两0-9]+)\s*题/);
  if (!match?.[1]) return 0;
  const value = match[1];
  if (/^\d+$/.test(value)) return Number(value);
  const cnMap = {
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
  };
  if (value === "十") return 10;
  if (value.startsWith("十")) return 10 + (cnMap[value.slice(1)] || 0);
  if (value.endsWith("十")) return (cnMap[value.slice(0, -1)] || 0) * 10;
  if (value.includes("十")) {
    const [tens, ones] = value.split("十");
    return (cnMap[tens] || 1) * 10 + (cnMap[ones] || 0);
  }
  return cnMap[value] || 0;
};

const extractNextQuestion = (rawText) => {
  const raw = normalizeExamText(rawText);
  if (!raw.includes("下一题")) return "";

  const nextPatterns = [
    /###\s*下一题[\s\S]*?-\s*\*\*题目\*\*：(.+?)(?:\n|$)/,
    /下一题[\s\S]*?题目\*\*：(.+?)(?:\n|$)/,
    /下一题[\s\S]*?题目：(.+?)(?:\n|$)/,
    /下一题[：:\s]*([\s\S]+)$/,
  ];

  for (const pattern of nextPatterns) {
    const matched = raw.match(pattern);
    if (matched?.[1]) return cleanExamQuestion(matched[1]);
  }
  return "";
};

const extractWrongAnalysis = (rawText) => {
  const raw = normalizeExamText(rawText);
  const fields = ["解析", "答案解析", "解析说明", "原因", "说明"];
  for (const field of fields) {
    const value = cleanExamQuestion(extractExamField(raw, field));
    if (value) return value;
  }

  const block = raw.match(/上一题解析[\s\S]*?(?:###\s*下一题|下一题|$)/)?.[0] || "";
  if (!block) return "";

  return cleanExamQuestion(
    block
      .replace(/###\s*上一题解析/g, "")
      .replace(/上一题解析/g, "")
      .replace(/判定结果\*\*：.*?(?:\n|$)/g, "")
      .replace(/判定结果：.*?(?:\n|$)/g, "")
      .replace(/得分\*\*：.*?(?:\n|$)/g, "")
      .replace(/得分：.*?(?:\n|$)/g, "")
      .replace(/标准答案\*\*：.*?(?:\n|$)/g, "")
      .replace(/标准答案：.*?(?:\n|$)/g, "")
      .replace(/###\s*下一题[\s\S]*$/g, "")
      .replace(/下一题[\s\S]*$/g, ""),
  );
};

const extractAnswerScore = (rawText) => {
  const raw = normalizeExamText(rawText);
  const scoreText = extractExamField(raw, "得分") || raw.match(/本题得分\D{0,6}(\d+(?:\.\d+)?)/)?.[1] || "";
  const score = Number(String(scoreText).match(/\d+(?:\.\d+)?/)?.[0] || NaN);
  return Number.isFinite(score) ? score : null;
};

const extractAnswerResult = (rawText) => {
  const raw = normalizeExamText(rawText);
  const explicitResult = extractExamField(raw, "判定结果") || extractExamField(raw, "判断结果") || extractExamField(raw, "作答结果") || extractExamField(raw, "回答结果") || extractExamField(raw, "是否正确") || extractExamField(raw, "结果");
  const source = explicitResult || raw;
  const score = extractAnswerScore(raw);
  const wrong = /回答错误|答错|错误|不正确|未通过|不得分/.test(source) || score === 0;
  const right = (/回答正确|答对|正确|通过|满分/.test(source) || (score !== null && score > 0)) && !wrong;
  return { result: explicitResult, wrong, right, score };
};

const buildAnswerFeedbackText = (text, { includeNextQuestion = true, maxLen = 360 } = {}) => {
  const raw = normalizeExamText(text);
  const { result, wrong, right } = extractAnswerResult(raw);
  const score = extractExamField(raw, "得分").replace(".0", "");
  const standard = cleanExamQuestion(extractExamField(raw, "标准答案"));
  const nextQuestion = includeNextQuestion ? extractNextQuestion(raw) : "";
  const wrongAnalysis = extractWrongAnalysis(raw);
  const parts = [];

  if (wrong) {
    parts.push(standard ? `上一题回答错误，标准答案是${standard}` : "上一题回答错误");
    if (wrongAnalysis) parts.push(`解析：${wrongAnalysis}`);
  } else if (right) {
    parts.push("上一题回答正确");
  } else if (result) {
    parts.push(`上一题判定结果为${result}`);
  }

  if (score) parts.push(`本题得分${score}分`);
  if (nextQuestion) parts.push(`下一题：${nextQuestion}`);

  const clean = parts.join("。").replace(/。+$/g, "") + "。";
  return clean.trim() === "。" ? "" : clean.length > maxLen ? `${clean.slice(0, maxLen)}。` : clean;
};

const buildFinalAnswerFeedbackText = (text, maxLen = 360) => {
  const direct = buildAnswerFeedbackText(text, { includeNextQuestion: false, maxLen });
  if (direct) return direct;

  const raw = normalizeExamText(text);
  const { result, wrong, right, score } = extractAnswerResult(raw);
  const standard = cleanExamQuestion(extractExamField(raw, "标准答案"));
  const analysis = extractWrongAnalysis(raw);
  const parts = [];

  if (wrong) {
    parts.push(standard ? `上一题回答错误，标准答案是${standard}` : "上一题回答错误");
    if (analysis) parts.push(`解析：${analysis}`);
  } else if (right) {
    parts.push("上一题回答正确");
  } else if (result) {
    parts.push(`上一题判定结果为${result}`);
  }

  if (score !== null) parts.push(`本题得分${score}分`);

  if (!parts.length) {
    const relatedLines = stripWrongListText(raw)
      .split(/[。\n]/)
      .map((item) => item.trim())
      .filter((item) => item && /判定|判断|作答结果|回答结果|是否正确|得分|解析|答案|正确|错误|不正确/.test(item))
      .filter((item) => !/错题|错误题|wrong|题目|您的回答|你的回答|下一题/i.test(item))
      .slice(0, 3);
    parts.push(...relatedLines);
  }

  const clean = parts.join("。").replace(/。+$/g, "") + "。";
  return clean.trim() === "。" ? "" : clean.length > maxLen ? `${clean.slice(0, maxLen)}。` : clean;
};

const buildHardwareSpeechText = (text, maxLen = 360) => {
  const raw = normalizeExamText(text);
  if (!raw) return "";

  if (raw.includes("上一题解析") || raw.includes("判定结果") || raw.includes("下一题")) {
    const feedback = buildAnswerFeedbackText(raw, { includeNextQuestion: true, maxLen });
    if (feedback) return feedback;
  }

  if (/^第\s*\d+\s*题/.test(raw) || raw.startsWith("第")) {
    const clean = cleanExamQuestion(raw);
    return clean.length > maxLen ? `${clean.slice(0, maxLen)}。` : clean;
  }

  const fallback = cleanExamQuestion(raw).replace(/###/g, "");
  return fallback.length > maxLen ? `${fallback.slice(0, maxLen)}。` : fallback;
};

const findValuesByKey = (obj, keys, results = []) => {
  if (!obj || typeof obj !== "object") return results;

  if (Array.isArray(obj)) {
    obj.forEach((item) => findValuesByKey(item, keys, results));
    return results;
  }

  Object.entries(obj).forEach(([key, value]) => {
    if (keys.some((target) => key.includes(target)) && value !== null && value !== undefined) {
      results.push(value);
    }
    if (typeof value === "object") findValuesByKey(value, keys, results);
  });
  return results;
};

const collectFinishValues = (obj, keys, results = [], parentKey = "") => {
  if (!obj || typeof obj !== "object") return results;

  if (Array.isArray(obj)) {
    obj.forEach((item) => collectFinishValues(item, keys, results, parentKey));
    return results;
  }

  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = `${parentKey}.${key}`;
    const isWrongList = /错题|错误题|wrong/i.test(fullKey);
    if (isWrongList) return;

    if (keys.some((target) => key.includes(target)) && value !== null && value !== undefined) {
      if (typeof value === "string" || typeof value === "number") {
        const text = String(value).trim();
        if (text && !/错题|错误题|wrong/i.test(text)) results.push(text);
      } else if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === "string" || typeof item === "number") {
            const text = String(item).trim();
            if (text && !/错题|错误题|wrong/i.test(text)) results.push(text);
          }
        });
      }
    }

    if (typeof value === "object") collectFinishValues(value, keys, results, fullKey);
  });
  return results;
};

const stripWrongListText = (text) =>
  normalizeExamText(text)
    .split(/\n|。/)
    .map((item) => item.trim())
    .filter((item) => item && !/错题|错误题|wrong/i.test(item))
    .join("。");

const pickScoreFromText = (text) => {
  const raw = normalizeExamText(text);
  const match = raw.match(/(?:总分|总得分|得分|score)\D{0,8}(\d+(?:\.\d+)?\s*(?:分)?)/i);
  return match?.[1] || "";
};

const pickKeyPointsFromText = (text) => {
  const clean = stripWrongListText(text);
  const match = clean.match(/(?:关键知识点|知识点|重点)[:：]?([\s\S]+)/);
  if (!match?.[1]) return [];
  return match[1]
    .split(/[；;、，,。\n]/)
    .map((item) => item.trim())
    .filter((item) => item && !/错题|错误题|wrong/i.test(item))
    .slice(0, 3);
};

const buildFinishSpeechText = (finishResult) => {
  const data = finishResult?.data ?? finishResult?.results ?? finishResult ?? {};
  const rawText = typeof finishResult === "string"
    ? finishResult
    : JSON.stringify(finishResult || {}, null, 2);
  const score = collectFinishValues(data, ["总分", "总得分", "score", "Score", "得分"])
    .find(Boolean) || pickScoreFromText(rawText);
  const summary = collectFinishValues(data, ["总结", "评价", "summary", "Summary", "overall", "Overall"])
    .find(Boolean);
  const keyPoints = collectFinishValues(data, ["关键知识点", "知识点", "重点", "key", "Key"])
    .filter(Boolean)
    .slice(0, 3);
  const textKeyPoints = keyPoints.length ? keyPoints : pickKeyPointsFromText(rawText);

  const parts = ["考试结束"];
  if (score) parts.push(`本次总得分是${score}`);
  if (summary) parts.push(`考试总结：${stripWrongListText(summary)}`);
  if (textKeyPoints.length) parts.push(`关键知识点：${textKeyPoints.join("；")}`);

  return parts.join("。").replace(/。+$/g, "") + "。";
};

const isLastQuestionResult = (text, result) => {
  const raw = normalizeExamText(text);
  if (!raw) return false;
  if (raw.includes("考试结束") || raw.includes("已完成") || raw.includes("本次练习结束")) return true;

  const hasAnswerFeedback = raw.includes("判定结果") || raw.includes("上一题解析") || raw.includes("标准答案") || raw.includes("您的回答") || raw.includes("你的回答");
  if (!hasAnswerFeedback) return false;

  const questionNumber = extractQuestionNumber(raw);
  if (questionNumber >= HARDWARE_DEMO_TOTAL_QUESTIONS) return true;
  if (Number(result?.turn || 0) > HARDWARE_DEMO_TOTAL_QUESTIONS) return true;

  return !raw.includes("下一题") && !extractNextQuestion(raw);
};

const speakHardwareText = async (text) => {
  const finalText = buildHardwareSpeechText(text);
  if (!finalText) return;
  const audio = await synthesizeXfyunTts(finalText);
  await bindAndPlayHardwareAudio(audio);
};

const cleanupHardwareRecorder = () => {
  if (hardwareMediaStream) {
    hardwareMediaStream.getTracks().forEach((track) => track.stop());
    hardwareMediaStream = null;
  }
  hardwareMediaRecorder = null;
  hardwareAudioChunks = [];
  hardwareRecording.value = false;
};

const appendHardwareExamResult = async (result) => {
  const assistantText = String(result?.assistant_text || "").trim();

  if (!assistantText && !result?.finished) {
    setVoiceCaption("未获取到考试回复，请再试一次。");
    return;
  }

  if (result?.finished) {
    setVoiceCaption("正在播放考试总结...");
    await speakHardwareText(buildFinishSpeechText(result?.finish_result));
    setVoiceCaption("考试已结束。");
    return;
  }

  const shouldFinishAfterThisAnswer = isLastQuestionResult(assistantText, result);

  setVoiceCaption("正在播放考试语音...");
  if (shouldFinishAfterThisAnswer) {
    const feedbackText = buildFinalAnswerFeedbackText(assistantText);
    if (feedbackText) {
      await speakHardwareText(feedbackText);
    }

    setVoiceCaption("正在生成考试总结...");
    const finishResult = await finishVoiceExam(hardwareVoiceSessionId);
    const finishSpeech = buildFinishSpeechText(finishResult?.finish_result || finishResult?.assistant_text || finishResult);
    await speakHardwareText(finishSpeech);
    setVoiceCaption("考试已结束。");
    return;
  }

  if (result?.audio_url) {
    await playHardwareAudio(result.audio_url);
  } else {
    await speakHardwareText(assistantText);
  }

  setVoiceCaption("请按住中间按钮继续回答。");
};

const submitHardwareVoiceBlob = async (blob) => {
  hardwareVoiceLoading.value = true;
  setVoiceCaption("正在识别语音...");

  try {
    const userText = String(await transcribeXfyunAsr(blob)).trim();
    if (!userText) {
      setVoiceCaption("没有识别到有效内容，请再说一次。");
      return;
    }

    setVoiceCaption("已收到语音，正在生成考试回复...");
    const result = await sendVoiceExamText(hardwareVoiceSessionId, userText);
    await appendHardwareExamResult(result);
  } catch (err) {
    console.error("[hardware voice exam error]", err);
    setVoiceCaption(err?.message || "语音考试接口调用失败，请检查后端配置。");
  } finally {
    hardwareVoiceLoading.value = false;
  }
};

const startHardwareVoiceRecord = async () => {
  if (hardwareRecording.value || hardwareVoiceLoading.value) return;

  startVoiceInteraction();
  stopHardwareAudio();

  if (!window.isSecureContext) {
    setVoiceCaption("麦克风录音需要 HTTPS 或 localhost 环境。");
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    setVoiceCaption("当前浏览器不支持麦克风录音。");
    return;
  }

  try {
    hardwareMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";

    hardwareMediaRecorder = new MediaRecorder(
      hardwareMediaStream,
      mimeType ? { mimeType } : undefined,
    );
    hardwareAudioChunks = [];
    hardwareDiscardRecord = false;
    hardwareStopRequested = false;

    hardwareMediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) hardwareAudioChunks.push(event.data);
    };

    hardwareMediaRecorder.onstart = () => {
      hardwareRecording.value = true;
      setVoiceCaption("正在聆听，松开后提交...");
      if (hardwareStopRequested) {
        stopHardwareVoiceRecord();
      }
    };

    hardwareMediaRecorder.onstop = () => {
      const blob = new Blob(hardwareAudioChunks, {
        type: mimeType || "audio/webm",
      });
      const shouldDiscard = hardwareDiscardRecord;
      cleanupHardwareRecorder();

      if (shouldDiscard) {
        setVoiceCaption("已取消本次语音。");
        return;
      }

      if (!blob.size) {
        setVoiceCaption("没有录到声音，请再试一次。");
        return;
      }

      submitHardwareVoiceBlob(blob);
    };

    hardwareMediaRecorder.start();
  } catch (err) {
    console.error("[hardware record start error]", err);
    cleanupHardwareRecorder();
    setVoiceCaption(err?.message || "无法启动麦克风。");
  }
};

const stopHardwareVoiceRecord = () => {
  if (!hardwareMediaRecorder) {
    hardwareStopRequested = true;
    return;
  }

  if (!hardwareRecording.value) {
    hardwareStopRequested = true;
    return;
  }

  try {
    hardwareMediaRecorder.stop();
  } catch (err) {
    console.error("[hardware record stop error]", err);
    cleanupHardwareRecorder();
  }
};

const cancelHardwareVoiceRecord = () => {
  hardwareDiscardRecord = true;
  stopHardwareVoiceRecord();
};


const clearHardwareExpandTimer = () => {
  if (hardwareExpandTimer) {
    clearTimeout(hardwareExpandTimer);
    hardwareExpandTimer = null;
  }
};

const setVoiceProductFrame = (index) => {
  const src = voiceFrames[index] || voiceFrames[0];
  voiceProductSrc.value = src;
  const voiceProduct = document.getElementById("voiceProduct");
  if (voiceProduct) {
    voiceProduct.src = src;
  }
};

const resetVoiceProduct = () => {
  if (voiceFrameTimer) {
    clearInterval(voiceFrameTimer);
    voiceFrameTimer = null;
  }
  setVoiceProductFrame(0);
};

const playVoiceSequence = () => {
  if (voiceFrameTimer) {
    clearInterval(voiceFrameTimer);
  }
  let frameIndex = 0;
  setVoiceProductFrame(frameIndex);
  voiceFrameTimer = setInterval(() => {
    frameIndex += 1;
    setVoiceProductFrame(frameIndex);
    if (frameIndex >= voiceFrames.length - 1) {
      clearInterval(voiceFrameTimer);
      voiceFrameTimer = null;
      setVoiceProductFrame(voiceFrames.length - 1);
    }
  }, 110);
};

const calculateH5Size = () => {
  const container = document.querySelector(".user-iframe-wrapper");
  if (!container) return;

  const containerWidth = Math.min(container.clientWidth - 80, 390);
  const containerHeight = container.clientHeight - 42;

  // 常见H5页面宽高比(384/817)
  const aspectRatio = 0.47;

  let width, height;

  // 计算基于容器宽度的高度
  const calculatedHeight = containerWidth / aspectRatio;

  if (calculatedHeight <= containerHeight) {
    // 如果基于宽度计算的高度不超过容器高度，使用宽度作为基准
    width = containerWidth;
    height = calculatedHeight;
  } else {
    // 否则使用高度作为基准
    height = containerHeight;
    width = height * aspectRatio;
  }

  width = Math.max(291, Math.round(width));
  height = Math.max(518, Math.round(height));

  h5Size.value = {
    width,
    height,
  };
};

// 语言变化后链接需要重置
const isReset = ref(true);
watch(
  () => language.value,
  () => {
    isReset.value = false;
    setIframeUrl();
    nextTick(() => {
      isReset.value = true;
    });
  },
);

const setIframeUrl = () => {
  const token = localStorage.getItem("token");
  const isLocalPreview = ["localhost", "127.0.0.1", "::1"].includes(
    window.location.hostname,
  );
  const origin = isLocalPreview
    ? "https://14.103.176.8:5174"
    : window.location.origin;
  userUrl.value = `${origin}/eap/#/?token=${token}&lang=${language.value}`;
  // userUrl.value = `http://localhost:8888/eap/#/?token=${token}&lang=${language.value}`;
  // console.log("userUrl.value", userUrl.value);
};
// 监听窗口大小变化
onMounted(() => {
  setIframeUrl();
  if (userStage.value === "iframe") {
    calculateH5Size();
  }
  window.addEventListener("resize", calculateH5Size);
});

onUnmounted(() => {
  clearHardwareExpandTimer();
  if (voiceFrameTimer) {
    clearInterval(voiceFrameTimer);
    voiceFrameTimer = null;
  }
  stopHardwareAudio();
  cleanupHardwareRecorder();
  finishVoiceExam(hardwareVoiceSessionId).catch(() => {});
  if (voiceCaptionTimer) {
    clearInterval(voiceCaptionTimer);
    voiceCaptionTimer = null;
  }
  window.removeEventListener("resize", calculateH5Size);
});
</script>

<style scoped lang="scss">
.el-container {
  width: 100%;
  height: 100%;
  :deep(.el-aside) {
    display: flex;
    width: auto;
    background-color: #f9fafb;
    .aside-box {
      background-color: var(--el-menu-bg-color);
      border-right: 1px solid var(--el-aside-border-color);
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
      transition: width 0.3s ease;
      border-radius: 24px 0 0 24px !important;
      .el-scrollbar {
        height: calc(100% - 64px);
        margin-top: 8px;
        box-sizing: border-box;
        .el-menu {
          width: 100%;
          overflow-x: hidden;
          border-right: none;
        }
      }
      .logo {
        box-sizing: border-box;
        height: 64px;
        .logo-img {
          width: 28px;
          object-fit: contain;
        }
        .logo-text {
          margin-left: 6px;
          font-size: 17px;
          font-weight: bold;
          color: var(--el-aside-logo-text-color);
          white-space: nowrap;
        }
        .logo-text-en {
          margin-left: 6px;
          font-size: 13px;
          font-weight: bold;
          color: var(--el-aside-logo-text-color);
          white-space: nowrap;
        }
      }
    }
    .aside-box-duan {
      background: #f9fafb;
      width: 80px;
      display: flex;
      flex-direction: column;
      height: 100%;

      padding-top: 32px;
      box-sizing: border-box;
      position: relative;
      .user-setting {
        width: 80px;
        height: 80px;
        position: absolute;
        bottom: 20px;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .duan-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-bottom: 19px;
        transition: all 0.3s ease;
        cursor: pointer;
        .logo-content {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background-color: #fff;
          border-radius: 12px;
          border: 2px solid #fff;
          box-sizing: border-box;
        }
        .text {
          height: 20px;
          line-height: 20px;
          margin-top: 8px;
          font-size: 14px;
          font-weight: 400;
          color: #99a1af;
        }
      }
      .active {
        .logo-content {
          background-color: #1677ff;
        }
        .text {
          color: #1677ff;
        }
      }
      .duan-item:not(.active):hover {
        .logo-content {
          background-color: #1677ff29;
        }
      }
      .duan-item-admin {
        .logo-content {
          border: 2px solid #1677ff;
        }
      }
    }
  }
  .el-header {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 15px;
    background-color: var(--el-header-bg-color);
    border-bottom: 1px solid var(--el-header-border-color);
  }
}
.logo-full {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 24px;
  box-sizing: border-box;
}
.logo-full-collapse {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.layout-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.user-iframe-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-radius: 24px 0 0 24px;
  background:
    linear-gradient(to bottom, #c8e4ff, #d7e9fa, #d9eafa00),
    url("@/assets/images/userbg.png");
  background-repeat: no-repeat;
  background-position: bottom center;
  background-size: contain;

  .demo-portal {
    flex: 1;
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    overflow: hidden;
    transition: grid-template-columns 0.82s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .demo-portal-mode-right {
    grid-template-columns: minmax(220px, 24%) minmax(0, 1fr);
  }

  .demo-card {
    min-width: 0;
    height: 100vh;
    position: relative;
    overflow: hidden;
    background-color: #303841;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    transition:
      filter 0.82s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.82s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .demo-portal-mode-right .demo-card-mobile {
    filter: brightness(0.68);
  }

  .demo-portal-mode-right .demo-card-mobile .demo-card-content {
    opacity: 0;
    pointer-events: none;
  }

  .demo-portal-mode-right .demo-card-mobile .demo-button {
    opacity: 0;
    pointer-events: none;
  }
  
  .demo-card-mobile .demo-phone-img {
  left: auto;
  right: -2%;
  bottom: -8%;
  width: min(165%, 680px);
  max-height: 94vh;
}

  .demo-portal-mode-right .demo-card-mobile .demo-phone-img {
    left: auto;
    right: -28%;
    bottom: -1%;
    width: min(154%, 620px);
    max-height: 94vh;
  }

  .demo-portal-mode-right .demo-card-hardware .demo-button {
    opacity: 0;
    pointer-events: none;
  }

  .demo-portal-mode-right .demo-card-hardware .demo-title {
    transform: translateX(18px);
    color: #05070c;
  }

  .demo-portal-mode-right .demo-voice-product {
    left: 50%;
    top: 50%;
    width: min(58%, 650px);
    transform: translate(-50%, -50%);
  }

  .demo-portal-mode-right .demo-card-hardware {
    background:
      linear-gradient(to bottom, rgba(197, 226, 249, 0.1), rgba(255, 255, 255, 0.04)),
      url("@/assets/images/hardware-demo-bg.jpg");
    background-size: cover;
    background-position: center top;
  }

  .demo-portal-mode-right .demo-card-hardware .demo-card-mask {
    background: transparent;
  }

  .voice-card.voice-guide-ready .voice-callout {
    opacity: 1;
    transform: translateY(0);
  }

  .voice-card.voice-guide-ready .voice-guide {
    opacity: 1;
    pointer-events: auto;
  }

  .voice-card.voice-guide-ready .center-hotspot {
    opacity: 1;
    pointer-events: auto;
  }

  .voice-card.voice-guide-ready .voice-wave-rings {
    opacity: 0.72;
  }

  .demo-portal-mode-right .voice-caption {
    opacity: 0;
    transform: translate(-50%, 10px);
  }

  .voice-card.voice-active .voice-guide {
    opacity: 0;
    pointer-events: none;
    transform: translateX(18px);
  }

  .voice-card.voice-active .voice-caption {
    opacity: 0;
    transform: translate(-50%, 12px);
  }

  .voice-card.voice-active .voice-caption.show {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  .voice-card.voice-active .center-hotspot {
    pointer-events: auto;
    box-shadow:
      0 0 0 3px rgba(29, 248, 194, 0.92),
      0 0 0 7px rgba(25, 122, 255, 0.82),
      0 0 34px rgba(29, 248, 194, 0.72),
      inset 0 0 28px rgba(40, 122, 255, 0.44);
    animation: voiceCenterPulse 1.45s ease-in-out infinite;
  }

  .voice-card.voice-active .voice-wave-rings {
    animation: voiceWavePulse 2.2s ease-out infinite;
    opacity: 0.95;
  }

  .demo-card-mobile {
    background:
      linear-gradient(90deg, rgba(58, 58, 58, 0.94), rgba(82, 82, 82, 0.9)),
      #525252;
  }

  .demo-card-hardware {
    background:
      linear-gradient(90deg, rgba(36, 43, 50, 0.62), rgba(23, 31, 38, 0.46)),
      #5f6b74;
  }

  .demo-voice-product {
    position: absolute;
    left: 42%;
    top: 14%;
    width: min(100%, 1080px);
    z-index: 0;
    object-fit: contain;
    pointer-events: none;
    user-select: none;
    transform: translateX(0);
    transition:
      left 0.82s cubic-bezier(0.22, 1, 0.36, 1),
      top 0.82s cubic-bezier(0.22, 1, 0.36, 1),
      width 0.82s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.82s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .voice-guide {
    position: absolute;
    inset: 0;
    z-index: 3;
    opacity: 0;
    pointer-events: none;
    transition:
      opacity 0.28s ease,
      transform 0.28s ease;
  }

  .voice-guide-line {
    position: absolute;
    left: calc(50.5% + 30px);
    top: calc(49.5% - 134px);
    width: min(24vw, 360px);
    height: 180px;
    overflow: visible;
    filter: drop-shadow(0 0 8px rgba(29, 248, 194, 0.38));
  }

  .voice-guide-line polyline {
    fill: none;
    stroke: #16dff2;
    stroke-width: 5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .voice-callout {
    position: absolute;
    right: 8%;
    top: calc(50% - 120px);
    display: inline-flex;
    align-items: center;
    gap: 10px;
    height: 48px;
    padding: 0 22px;
    border-radius: 24px;
    background: rgba(63, 73, 82, 0.86);
    color: #fff;
    font-size: 18px;
    line-height: 1;
    font-weight: 600;
    border: 0;
    cursor: pointer;
    opacity: 0;
    transform: translateY(-8px);
    transition:
      opacity 0.28s ease 0.45s,
      transform 0.28s ease 0.45s;
  }

  .voice-callout i {
    position: relative;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    flex: 0 0 auto;
  }

  .voice-callout i::before {
    content: "";
    position: absolute;
    left: 7px;
    top: 4px;
    width: 6px;
    height: 10px;
    border-radius: 4px;
    background: #5f6b74;
  }

  .voice-callout i::after {
    content: "";
    position: absolute;
    left: 6px;
    bottom: 4px;
    width: 8px;
    height: 2px;
    border-radius: 1px;
    background: #5f6b74;
  }

  .center-hotspot {
    position: absolute;
    z-index: 4;
    left: 50.5%;
    top: 49.5%;
    width: min(8.4vw, 102px);
    height: min(8.4vw, 102px);
    min-width: 68px;
    min-height: 68px;
    border: 0;
    border-radius: 50%;
    background: rgba(6, 12, 44, 0.32);
    opacity: 0;
    pointer-events: none;
    cursor: pointer;
    touch-action: none;
    transform: translate(-50%, -50%);
    box-shadow:
      0 0 0 3px rgba(29, 248, 194, 0.9),
      0 0 0 6px rgba(25, 122, 255, 0.75),
      0 0 20px rgba(29, 248, 194, 0.48),
      inset 0 0 22px rgba(40, 122, 255, 0.34);
    transition:
      opacity 0.24s ease 0.36s,
      box-shadow 0.24s ease;
  }



  .center-hotspot.recording {
    transform: translate(-50%, -50%) scale(1.12);
    box-shadow:
      0 0 0 4px rgba(255, 255, 255, 0.95),
      0 0 0 9px rgba(255, 75, 75, 0.86),
      0 0 40px rgba(255, 75, 75, 0.55),
      inset 0 0 28px rgba(255, 255, 255, 0.22);
  }

  .center-hotspot.loading {
    cursor: wait;
    opacity: 0.85;
  }

  .voice-wave-rings {
    position: absolute;
    z-index: 0;
    left: 50%;
    top: 50%;
    width: min(64%, 720px);
    aspect-ratio: 1;
    border-radius: 50%;
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -50%);
    background: repeating-radial-gradient(
      circle,
      rgba(37, 150, 255, 0.18) 0 2px,
      transparent 3px 13px
    );
    transition: opacity 0.36s ease 0.28s;
  }

  .voice-caption {
    position: absolute;
    z-index: 3;
    left: 50%;
    bottom: 9%;
    min-height: 52px;
    max-width: min(76%, 620px);
    padding: 0 28px;
    border-radius: 14px;
    background: rgba(34, 34, 34, 0.9);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 18px;
    line-height: 26px;
    font-weight: 500;
    white-space: pre-wrap;
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, 12px);
    transition:
      opacity 0.4s ease,
      transform 0.4s ease;
  }

  .voice-caption.show {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  @keyframes voiceCenterPulse {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.08);
    }
  }

  @keyframes voiceWavePulse {
    0% {
      transform: translate(-50%, -50%) scale(0.9);
      opacity: 0.9;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.16);
      opacity: 0.18;
    }
  }

  .demo-phone-img {
    position: absolute;
    left: 9%;
    bottom: -1%;
    width: min(70%, 700px);
    max-height: 88vh;
    object-fit: contain;
    object-position: left bottom;
    z-index: 0;
    pointer-events: none;
    user-select: none;
    transition:
      left 0.98s cubic-bezier(0.22, 1, 0.36, 1),
      right 0.98s cubic-bezier(0.22, 1, 0.36, 1),
      bottom 0.98s cubic-bezier(0.22, 1, 0.36, 1),
      width 0.98s cubic-bezier(0.22, 1, 0.36, 1),
      max-height 0.98s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .demo-card-mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.18);
  }

  .demo-card-content {
    position: relative;
    z-index: 1;
    height: 100%;
    padding: 32px 36px;
    box-sizing: border-box;
    transition: opacity 0.26s ease;
  }

  .demo-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 24px;
    line-height: 32px;
    font-weight: 600;
    color: #fff;
    transition: transform 0.82s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .mobile-collapse-button {
    position: absolute;
    z-index: 2;
    left: 47%;
    top: 50%;
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    transform: translate(-50%, -50%);
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.24s ease 0.36s;
  }

  .demo-portal-mode-right .mobile-collapse-button {
    opacity: 1;
    pointer-events: auto;
  }

  .mobile-collapse-button i {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    transform: translate(-50%, -50%);
  }

  .mobile-collapse-button i::after {
    content: "";
    position: absolute;
    left: 6px;
    top: 6px;
    width: 7px;
    height: 7px;
    border-top: 2px solid #111;
    border-right: 2px solid #111;
    transform: rotate(45deg);
  }

  .demo-title span {
    height: 26px;
    padding: 0 10px;
    border-radius: 13px;
    background: rgba(255, 255, 255, 0.86);
    color: #20242a;
    font-size: 13px;
    line-height: 26px;
    font-weight: 600;
  }

  .demo-button {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: inline-flex;
    align-items: center;
    gap: 10px;
    height: 50px;
    padding: 0 18px 0 24px;
    border: 0;
    border-radius: 25px;
    background: #000;
    color: #fff;
    font-size: 20px;
    line-height: 1;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition:
      transform 0.2s ease,
      background-color 0.2s ease,
      opacity 0.28s ease;
  }

  .demo-button:hover {
    background: #1677ff;
    transform: translate(-50%, -50%) scale(1.03);
  }

  .demo-button i {
    position: relative;
    display: block;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    flex: 0 0 auto;
  }

  .demo-button i::after {
    content: "";
    position: absolute;
    left: 8px;
    top: 6px;
    width: 7px;
    height: 7px;
    border-top: 2px solid #111;
    border-right: 2px solid #111;
    transform: rotate(45deg);
  }

  .demo-playground,
  .demo-live-main {
    min-width: 0;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }

  .demo-playground {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 19%);
  }

  .demo-live-main {
    padding: 46px 56px 34px;
    box-sizing: border-box;
  }

  .demo-live-header {
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    position: relative;
    z-index: 2;
  }

  .demo-live-title {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #05070c;
    font-size: 32px;
    line-height: 42px;
    font-weight: 600;
  }

  .demo-live-title span {
    height: 38px;
    padding: 0 14px;
    border-radius: 19px;
    background: #05070c;
    color: #fff;
    font-size: 20px;
    line-height: 38px;
    font-weight: 600;
  }

  .demo-exit-button {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    height: 48px;
    padding: 0 18px;
    border: 0;
    border-radius: 24px;
    background: #000;
    color: #fff;
    font-size: 20px;
    line-height: 1;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background-color 0.2s ease;
  }

  .demo-exit-button:hover {
    background: #1677ff;
  }

  .demo-exit-button i {
    position: relative;
    display: block;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    flex: 0 0 auto;
  }

  .demo-exit-button i::before {
    content: "";
    position: absolute;
    left: 8px;
    top: 7px;
    width: 8px;
    height: 8px;
    border-left: 2px solid #111;
    border-bottom: 2px solid #111;
    transform: rotate(45deg);
  }

  .demo-exit-button i::after {
    content: "";
    position: absolute;
    left: 8px;
    top: 11px;
    width: 11px;
    height: 2px;
    border-radius: 1px;
    background: #111;
  }

  .demo-live-side {
    min-width: 0;
    height: 100vh;
    position: relative;
    overflow: hidden;
    background-image: url("@/assets/images/demo-hardware.jpg");
    background-size: cover;
    background-position: 44% center;
  }

  .demo-live-side-mask {
    position: absolute;
    inset: 0;
    background: rgba(20, 29, 38, 0.7);
  }

  .demo-live-side-title {
    position: relative;
    z-index: 1;
    padding: 48px 34px;
    color: #fff;
    font-size: 32px;
    line-height: 42px;
    font-weight: 600;
    white-space: nowrap;
  }

  .demo-side-button {
    position: absolute;
    z-index: 1;
    left: 50%;
    top: 50%;
    width: 62px;
    height: 62px;
    border: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.66);
    transform: translate(-50%, -50%);
    cursor: pointer;
  }

  .demo-side-button i {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #fff;
    transform: translate(-50%, -50%);
  }

  .demo-side-button i::after {
    content: "";
    position: absolute;
    left: 9px;
    top: 8px;
    width: 8px;
    height: 8px;
    border-top: 2px solid #111;
    border-right: 2px solid #111;
    transform: rotate(45deg);
  }

  .hardware-playground {
    flex: 1;
    min-width: 0;
    height: 100vh;
    display: grid;
    grid-template-columns: minmax(220px, 24%) minmax(0, 1fr);
    overflow: hidden;
    background: #edf4fb;
  }

  .hardware-live-side {
    min-width: 0;
    height: 100vh;
    position: relative;
    overflow: hidden;
    background:
      linear-gradient(90deg, rgba(58, 58, 58, 0.94), rgba(82, 82, 82, 0.9)),
      #525252;
  }

  .hardware-side-phone {
    position: absolute;
    right: -28%;
    bottom: -1%;
    width: min(175%, 880px);
    max-height: 94vh;
    object-fit: contain;
    object-position: right bottom;
    pointer-events: none;
    user-select: none;
  }

  .hardware-side-mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.42);
  }

  .hardware-side-title {
    position: relative;
    z-index: 1;
    padding: 34px 28px;
    color: #05070c;
    font-size: 22px;
    line-height: 30px;
    font-weight: 600;
    white-space: nowrap;
  }

  .hardware-side-button {
    position: absolute;
    z-index: 1;
    left: 47%;
    top: 50%;
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    transform: translate(-50%, -50%);
    cursor: pointer;
  }

  .hardware-side-button i {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    transform: translate(-50%, -50%);
  }

  .hardware-side-button i::after {
    content: "";
    position: absolute;
    left: 6px;
    top: 6px;
    width: 7px;
    height: 7px;
    border-top: 2px solid #111;
    border-right: 2px solid #111;
    transform: rotate(45deg);
  }

  .hardware-live-main {
    min-width: 0;
    height: 100vh;
    position: relative;
    overflow: hidden;
    padding: 34px 60px 46px;
    box-sizing: border-box;
    background:
      linear-gradient(to bottom, rgba(197, 226, 249, 0.2), rgba(255, 255, 255, 0.08)),
      url("@/assets/images/hardware-demo-bg.jpg");
    background-size: cover;
    background-position: center top;
  }

  .hardware-live-header {
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    position: relative;
    z-index: 2;
  }

  .hardware-live-title {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #05070c;
    font-size: 28px;
    line-height: 38px;
    font-weight: 600;
  }

  .hardware-live-title span {
    height: 28px;
    padding: 0 12px;
    border-radius: 14px;
    background: #05070c;
    color: #fff;
    font-size: 14px;
    line-height: 28px;
    font-weight: 600;
  }

  .hardware-stage {
    position: relative;
    height: calc(100vh - 122px);
    min-height: 520px;
  }

  .hardware-stage .voice-wave-rings {
    left: 50%;
    top: 46%;
    width: min(58vw, 640px);
  }

  .hardware-stage .center-hotspot {
    left: 50%;
    top: calc(46% - 6px);
    width: min(7.8vw, 108px);
    height: min(7.8vw, 108px);
  }

  .hardware-stage .voice-guide-line {
    left: calc(50% + 48px);
    top: calc(46% - 152px);
    width: min(25vw, 360px);
  }

  .hardware-stage .voice-callout {
    right: 7%;
    top: calc(46% - 120px);
  }

  .hardware-stage .voice-caption {
    bottom: 7%;
    max-width: min(78%, 560px);
  }

  .hardware-device {
    position: absolute;
    left: 50%;
    top: 46%;
    width: min(42vw, 520px);
    aspect-ratio: 1;
    object-fit: contain;
    object-position: center;
    transform: translate(-50%, -50%);
    filter: drop-shadow(0 30px 42px rgba(16, 54, 88, 0.18));
  }

  .user-iframe-wrapper {
    height: calc(100vh - 134px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 22px;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
  }

  .user-iframe {
    border-radius: 24px;
    box-shadow: 0 12px 32px rgba(35, 47, 65, 0.08);
    background-color: #fff;
  }
}

@media (max-width: 900px) {
  .user-iframe-container {
    .demo-portal {
      grid-template-columns: 1fr;
    }

    .demo-card {
      height: 50vh;
      min-height: 320px;
    }

    .demo-title {
      font-size: 20px;
    }
  }
}
.duan-popover-content {
  .header {
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .title {
      height: 20px;
      line-height: 20px;
      font-size: 14px;
      font-weight: 500;
      color: #fff;
    }
    .img {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .img:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
  .content {
    margin-top: 16px;
    font-size: 12px;
    font-weight: 400;
    color: #fff;
    line-height: 18px;
  }
  .footer {
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .footer :deep(.el-button) {
    width: 86px;
    height: 36px;
    line-height: 36px;
    border-radius: 8px;
    color: #1677ff;
  }
}
</style>
<style>
.duan-popover.el-popover {
  background-color: #1677ff;
  border-radius: 12px;
  border: none;
  padding: 16px;
  box-sizing: border-box;
}

.duan-popover.el-popover .el-popper__arrow::before {
  background: #1677ff !important;
}
</style>
