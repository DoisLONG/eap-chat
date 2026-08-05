<template>
  <div class="next-question-content">
    <span class="question-number">{{ questionNumber }}</span>
    <span class="question-text">{{ questionText }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({ content: { type: String, default: "" } });

const questionParts = computed(() => {
  const text = props.content.trim();
  const separator = text.indexOf("：");
  if (separator < 0) return { number: "题目", text };
  return { number: text.slice(0, separator), text: text.slice(separator + 1).trim() };
});

const questionNumber = computed(() => questionParts.value.number.replace(/第(\d+)题/, "第 $1 题"));
const questionText = computed(() => questionParts.value.text);
</script>

<style scoped>
.next-question-content { display: flex; align-items: flex-start; gap: 12px; line-height: 1.7; }
.question-number { flex: none; padding: 6px 10px; border-radius: 8px; background: #eaf3ff; color: #2368c4; font-size: 13px; font-weight: 700; line-height: 1.2; white-space: nowrap; }
.question-text { min-width: 0; color: #1f2937; font-weight: 600; word-break: break-word; }
</style>
