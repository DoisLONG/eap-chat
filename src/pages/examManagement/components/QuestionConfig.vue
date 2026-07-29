<template>
  <section class="section-card">
    <div class="section-heading"><div><h3>{{ t('exam.questionConfig') }}</h3><p>{{ t('examForm.questionConfigTip') }}</p></div></div>
    <div v-if="!modelValue.length" class="empty-rules"><el-empty :description="t('exam.noQuestions')" :image-size="56" /></div>
    <div v-for="row in modelValue" :key="row.type" class="rule-row">
      <div class="type-cell"><span class="type-icon">{{ (row.label || row.type || '?').slice(0, 1) }}</span><div><strong>{{ row.label || row.type }}</strong><p>{{ gradingText(row) }} · {{ t('exam.availableCount') }} {{ row.available ?? '-' }}</p></div></div>
      <label><span>{{ t('exam.drawCount') }}</span><el-input-number v-model="row.count" :min="0" :max="row.available ?? undefined" :disabled="disabled" controls-position="right" /></label>
      <label><span>{{ t('exam.scorePerQuestion') }}</span><el-input-number v-model="row.score" :min="1" :disabled="disabled" controls-position="right" /></label>
      <label><span>{{ t('exam.grading') }}</span><el-select v-model="row.grading_mode" :disabled="disabled" @change="row.auto = row.grading_mode === 'auto'"><el-option :label="t('exam.autoGrade')" value="auto" /><el-option :label="t('exam.manualGrade')" value="manual" /></el-select></label>
    </div>
    <div class="summary-strip"><span>{{ t('examForm.estimatedQuestions', { count: totalQuestions }) }}</span><span>{{ t('examForm.totalPoints') }} <strong>{{ totalScore }}</strong> {{ t('exam.points') }}</span></div>
  </section>

  <section class="section-card two-columns">
    <el-form-item :label="`${t('exam.duration')}（${t('exam.minutes')}）`" required><el-input-number v-model="durationModel" :min="1" :disabled="disabled" controls-position="right" /></el-form-item>
    <el-form-item :label="t('exam.passScore')" required><el-input-number v-model="passScoreModel" :min="0" :max="totalScore" :disabled="disabled" controls-position="right" /></el-form-item>
  </section>

  <section class="section-card">
    <div class="section-heading"><h3>{{ t('exam.rules') }}</h3></div>
    <div class="switch-list">
      <div v-for="item in ruleItems" :key="item.key" class="switch-row"><div><strong>{{ t(item.title) }}</strong><p>{{ t(item.description) }}</p></div><el-switch :model-value="rules[item.key]" :disabled="disabled" @update:model-value="setRule(item.key, $event)" /></div>
      <div v-if="rules.allowRetake" class="attempt-row"><span>{{ t('examForm.maxAttempts') }}</span><el-input-number :model-value="rules.maxAttempts" :min="1" :disabled="disabled" controls-position="right" @update:model-value="setRule('maxAttempts', $event)" /></div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({ modelValue: { type: Array, required: true }, duration: Number, passScore: Number, totalQuestions: Number, totalScore: Number, rules: { type: Object, required: true }, disabled: Boolean });
const emit = defineEmits(["update:duration", "update:passScore", "update:rules"]);
const { t } = useI18n();
const durationModel = computed({ get: () => props.duration, set: value => emit("update:duration", value) });
const passScoreModel = computed({ get: () => props.passScore, set: value => emit("update:passScore", value) });
const ruleItems = [
  { key: "randomPaper", title: "exam.randomPaper", description: "examForm.randomPaperDesc" },
  { key: "randomOptions", title: "exam.randomOptions", description: "examForm.randomOptionsDesc" },
  { key: "showAnswer", title: "exam.showAnswer", description: "examForm.showAnswerDesc" },
  { key: "allowRetake", title: "exam.allowRetake", description: "examForm.allowRetakeDesc" },
];
const rules = computed(() => props.rules || {});
function setRule(key, value) { emit("update:rules", { ...rules.value, [key]: value }); }
function gradingText(row) { return row.grading_mode === "manual" ? t("exam.manualGrade") : t("exam.autoGrade"); }
</script>

<style scoped>
.section-card { margin-bottom: 14px; padding: 18px; border: 1px solid var(--el-border-color); border-radius: 8px; background: var(--el-bg-color); }.section-heading { margin-bottom: 10px; }.section-heading h3 { margin: 0; font-size: 16px; }.section-heading p, .type-cell p, .switch-row p { margin: 4px 0 0; color: var(--el-text-color-secondary); font-size: 12px; }.rule-row { display: grid; grid-template-columns: minmax(190px, 1.4fr) repeat(3, minmax(130px, 1fr)); gap: 14px; align-items: end; padding: 14px 0; border-bottom: 1px dashed var(--el-border-color-lighter); }.rule-row:last-of-type { border-bottom: 0; }.type-cell { display: flex; gap: 10px; align-items: center; min-width: 0; }.type-icon { display: grid; flex: none; width: 36px; height: 36px; place-items: center; border-radius: 9px; color: var(--el-color-primary); background: var(--el-color-primary-light-9); font-weight: 700; }.rule-row label { display: grid; gap: 6px; color: var(--el-text-color-regular); font-size: 12px; font-weight: 600; }.rule-row :deep(.el-input-number), .rule-row :deep(.el-select), .two-columns :deep(.el-input-number) { width: 100%; }.rule-row :deep(.el-input__wrapper), .two-columns :deep(.el-input__wrapper) { min-height: 38px; }.summary-strip { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; padding: 12px 14px; border: 1px solid var(--el-color-primary-light-7); border-radius: 7px; color: var(--el-color-primary); background: var(--el-color-primary-light-9); }.summary-strip strong { font-size: 21px; }.two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }.two-columns :deep(.el-form-item) { margin-bottom: 0; }.switch-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 13px 0; border-bottom: 1px dashed var(--el-border-color-lighter); }.switch-row:last-child { border-bottom: 0; }.attempt-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 12px; }.attempt-row :deep(.el-input-number) { width: 150px; }.empty-rules { padding: 4px 0; } @media (max-width: 860px) { .rule-row, .two-columns { grid-template-columns: 1fr 1fr; }.type-cell { grid-column: 1 / -1; } } @media (max-width: 600px) { .rule-row, .two-columns { grid-template-columns: 1fr; } }
</style>
