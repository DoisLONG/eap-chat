<template>
  <section class="section-card preview-summary">
    <div><h3>{{ form.name || '-' }}</h3><p>{{ t('exam.category') }}：{{ typeLabel }}</p><p>{{ t('examForm.sourceSummary') }}：{{ sourceNames }}</p><p>{{ t('exam.duration') }}：{{ form.duration }} {{ t('exam.minutes') }}　{{ t('exam.passScore') }}：{{ form.passScore }} {{ t('exam.points') }}</p></div>
    <div class="score-box"><span>{{ t('examForm.totalPoints') }}</span><strong>{{ totalScore }}</strong><small>{{ t('exam.totalQuestions') }} {{ totalQuestions }}</small></div>
  </section>
  <section class="section-card">
    <div class="section-heading"><div><h3>{{ t('exam.preview') }}</h3><p>{{ status === 'published' ? t('examForm.publishedPreviewHint') : t('examForm.previewHint') }}</p></div></div>
    <el-empty v-if="!displayQuestions.length" :description="status === 'published' ? t('exam.noPreviewQuestions') : t('examForm.previewEmpty')" :image-size="72" />
    <article v-for="(question, index) in displayQuestions" :key="question.id ?? question.question_code ?? index" class="question-card">
      <div class="question-top"><strong>{{ question.sort_order || index + 1 }}. {{ questionText(question) }}</strong><el-tag effect="plain">{{ questionType(questionTypeValue(question)) }} · {{ question.score ?? scoreFor(question) }} {{ t('exam.points') }}</el-tag></div>
      <div v-if="questionOptions(question).length" class="options"><p v-for="(option, optionIndex) in questionOptions(question)" :key="optionIndex">{{ optionText(option, optionIndex) }}</p></div>
      <el-input v-else type="textarea" disabled :placeholder="t('exam.answerPlaceholder')" />
      <template v-if="status === 'published'"><p class="answer"><strong>{{ question.correct_answer }}</strong></p><p v-if="question.answer_analysis" class="analysis">{{ question.answer_analysis }}</p></template>
    </article>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
const props = defineProps({ form: { type: Object, required: true }, questions: { type: Array, default: () => [] }, candidateQuestions: { type: Array, default: () => [] }, totalQuestions: Number, totalScore: Number, status: { type: String, default: "draft" } });
const { t } = useI18n();
const typeLabel = computed(() => t(`exam.types.${props.form.type}`));
const sourceNames = computed(() => props.form.sources.map(item => item.title || item.name || item.filename || item.source_ref_id || item.id).filter(Boolean).join('、') || '-');
const displayQuestions = computed(() => (props.status === "published" ? props.questions : props.candidateQuestions).slice(0, 5).sort((left, right) => Number(left.sort_order || 0) - Number(right.sort_order || 0)));
function questionTypeValue(question) { return question.question_type || question.type; }
function questionText(question) { return question.question_text || question.question || '-'; }
function questionType(value) { return ({ fill_blank: t('exam.types.fillBlank'), short_answer: t('exam.types.qa'), single_choice: t('exam.types.singleChoice'), multiple_choice: t('exam.types.multipleChoice'), true_false: t('exam.types.judgement') }[value] || value || '-'); }
function scoreFor(question) { const config = props.form.questionConfigs.find(item => item.type === questionTypeValue(question)); return config?.score || 0; }
function parseOptions(value) { try { const parsed = typeof value === 'string' ? JSON.parse(value) : value; return Array.isArray(parsed) ? parsed : parsed?.options || []; } catch { return []; } }
function questionOptions(question) { return question.options?.length ? question.options : parseOptions(question.options_json); }
function optionText(option, index) { const text = option?.text || option?.content || option; return `${String.fromCharCode(65 + index)}. ${text}`; }
</script>

<style scoped>
.section-card { margin-bottom: 14px; padding: 18px; border: 1px solid var(--el-border-color); border-radius: 8px; background: var(--el-bg-color); }.preview-summary { display: grid; grid-template-columns: 1fr 126px; gap: 18px; align-items: center; }.preview-summary h3 { margin: 0 0 8px; font-size: 18px; }.preview-summary p, .section-heading p { margin: 4px 0; color: var(--el-text-color-secondary); font-size: 13px; line-height: 1.55; }.score-box { display: grid; gap: 3px; padding: 14px; border-radius: 8px; color: var(--el-color-primary); background: var(--el-color-primary-light-9); text-align: center; }.score-box strong { font-size: 30px; line-height: 1.1; }.score-box small { color: var(--el-color-primary); }.section-heading h3 { margin: 0; font-size: 16px; }.question-card { margin-top: 10px; padding: 14px; border: 1px solid var(--el-border-color); border-radius: 8px; }.question-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; line-height: 1.6; }.options p { margin: 7px 0 0; padding: 8px 10px; border-radius: 5px; color: var(--el-text-color-regular); background: var(--el-fill-color-light); }.answer, .analysis { margin: 10px 0 0; color: var(--el-text-color-regular); font-size: 13px; }.analysis { color: var(--el-text-color-secondary); } @media (max-width: 600px) { .preview-summary { grid-template-columns: 1fr; }.score-box { max-width: 160px; }.question-top { flex-direction: column; } }
</style>
