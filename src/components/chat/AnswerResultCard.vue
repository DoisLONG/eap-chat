<template>
  <div class="result-card" :class="`status-${kind}`">
    <!-- 顶部：标题 + 状态 + 得分 -->
    <div class="result-header">
      <div class="result-title-area">
        <div class="result-title">答题结果</div>
        <div class="result-subtitle">本题判定已完成</div>
      </div>
      <div class="result-status">
        <span v-if="kind !== 'partial'" class="status-mark">{{ kind === "correct" ? "✓" : "×" }}</span>
        {{ statusLabel }}
      </div>
      <div class="result-score">
        <span class="score-label">得分：</span>
        <span class="score-value">{{ score }}</span>
        <span class="score-unit">分</span>
      </div>
    </div>

    <div class="result-divider"></div>

    <!-- 详情：标准答案 + 结果解析 -->
    <div class="result-detail">
      <div v-if="answer" class="info-row answer-row">
        <span class="info-icon icon-answer" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 7.5V12h4.5" />
          </svg>
        </span>
        <span class="info-label">标准答案</span>
        <div class="info-content answer-content">{{ answer }}</div>
      </div>

      <div v-if="answer && analysis" class="dashed-divider"></div>

      <div v-if="analysis" class="info-row analysis-row">
        <span class="info-icon icon-analysis" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20.5 20.5-4.4-4.4" />
          </svg>
        </span>
        <span class="info-label">结果解析</span>
        <div class="info-content analysis-content">
          <MarkdownRenderer :content="analysis" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";

/**
 * 答题结果卡片（智能练习/知识问答练习）
 * content: 后端 SSE result 事件的 markdown 内容（格式由 smart_practice build_result_markdown 固定拼装）
 * kind:    判定结果 correct | partial | error —— 由父组件 messageVisualKind 传入，不做任何重新判定
 */
const props = defineProps({
  content: { type: String, default: "" },
  kind: { type: String, default: "error" },
});

const STATUS_LABELS = { error: "回答错误", correct: "回答正确", partial: "部分正确" };
const statusLabel = computed(() => STATUS_LABELS[props.kind] || STATUS_LABELS.error);

// 得分：> **得分：** `0.0 分` → "0.0"（得分：与反引号之间有粗体闭合符 **）
const score = computed(() => {
  const m = String(props.content || "").match(/得分[：:]\s*(?:\*\*)?\s*`([^`]*)`/);
  if (!m) return "";
  return m[1].replace(/\s*分\s*$/, "").trim();
});

// 标准答案：### 📌 标准答案\n\n> **内容**
const answer = computed(() => {
  const m = String(props.content || "").match(/###\s*[^\n]*标准答案[^\n]*\n\s*>\s*\*\*([\s\S]*?)\*\*\s*\n/);
  return m ? m[1].trim() : "";
});

// 结果解析：### 🔍 结果解析\n\n<自由 markdown 文本>
const analysis = computed(() => {
  const m = String(props.content || "").match(/###\s*[^\n]*结果解析[^\n]*\n\s*([\s\S]*)$/);
  return m ? m[1].trim() : "";
});
</script>

<style scoped>
.result-card {
  position: relative;
  box-sizing: border-box;
  padding: 24px 28px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #e5eaf2;
  box-shadow: 0 8px 24px rgba(31, 50, 81, 0.08);
}

/* 左侧竖向状态条（错误红 / 正确绿 / 部分橙） */
.result-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 22px;
  bottom: 22px;
  width: 6px;
  border-radius: 0 3px 3px 0;
  background: #e11d48;
}
.result-card.status-correct::before {
  background: #16a34a;
}
.result-card.status-partial::before {
  background: #ea580c;
}

/* ===== 顶部 ===== */
.result-header {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px 20px;
}

.result-title {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3;
  color: #172033;
}
.result-subtitle {
  margin-top: 3px;
  font-size: 14px;
  color: #8b95a7;
}

.result-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: center;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid #fecdd3;
  background: #fff1f2;
  color: #be123c;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}
.status-mark {
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
}
.result-card.status-correct .result-status {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
}
.result-card.status-partial .result-status {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

.result-score {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-left: auto;
}
.score-label,
.score-unit {
  font-size: 14px;
  color: #64748b;
}
.score-value {
  font-size: 44px;
  font-weight: 700;
  line-height: 1;
  color: #172033;
}

/* ===== 分割线 ===== */
.result-divider {
  margin: 16px 0 18px;
  border-top: 1px solid #e5eaf2;
}

/* ===== 详情行 ===== */
.result-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.info-icon {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-top: 2px;
  border-radius: 50%;
  color: #ffffff;
}
.icon-answer {
  background: #3b82f6;
}
.icon-analysis {
  background: #8b5cf6;
}

.info-label {
  flex: none;
  width: 72px;
  padding-top: 9px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.info-content {
  flex: 1;
  min-width: 0;
  padding: 14px 16px;
  border-radius: 12px;
  line-height: 1.7;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.answer-content {
  background: #eff6ff;
  color: #164e9b;
  font-weight: 500;
}
.analysis-content {
  background: #f6f3fc;
  color: #4c3d7a;
}
.analysis-content :deep(.markdown-body) {
  color: inherit;
}

.dashed-divider {
  border-top: 1px dashed #dbe3ef;
}

/* ===== 响应式 ===== */
@media (max-width: 900px) {
  .result-card {
    padding: 18px 16px;
    border-radius: 16px;
  }
  .result-title {
    font-size: 20px;
  }
  .result-status {
    font-size: 13px;
    padding: 5px 12px;
  }
  .result-score {
    width: 100%;
    margin-left: 0;
  }
  .score-value {
    font-size: 32px;
  }
  .result-divider {
    margin: 14px 0 16px;
  }
  .result-detail {
    gap: 14px;
  }
  .info-row {
    flex-wrap: wrap;
    gap: 8px 12px;
  }
  .info-label {
    width: auto;
    padding-top: 2px;
  }
  .info-content {
    flex-basis: 100%;
  }
}
</style>
