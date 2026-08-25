<template>
  <el-dialog v-model="visible" :title="t('exam.preview')" width="min(980px, calc(100vw - 32px))" destroy-on-close @closed="reset">
    <div v-loading="detailLoading" class="exam-preview-dialog">
      <section v-if="detail" class="exam-summary">
        <div><h3>{{ detail.name }}</h3><p>{{ categoryText }} · {{ detail.version || '-' }} · {{ t(`exam.statuses.${detail.status}`) }}</p></div>
        <div>{{ t('exam.totalQuestions') }} {{ detail.total_question_count }} · {{ t('exam.totalScore') }} {{ detail.total_score }} · {{ detail.duration }} {{ t('exam.minutes') }} · {{ t('exam.passScore') }} {{ detail.pass_score }}</div>
        <p>{{ t('examForm.questionSource') }}：{{ sourceNames }}</p>
      </section>
      <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon />
      <el-empty v-else-if="!detailLoading && !questions.total" :description="t('exam.noPreviewQuestions')" />
      <template v-else>
        <article v-for="question in questions.items" :key="question.id" v-loading="questionsLoading" class="question-card">
          <header><strong>{{ question.sort_order }}. {{ question.question_text }}</strong><el-tag effect="plain">{{ questionType(question.question_type) }} · {{ question.score }} {{ t('exam.points') }}</el-tag></header>
          <p v-for="(option, index) in options(question.options_json)" :key="index" class="option">{{ optionText(option, index) }}</p>
          <p><strong>{{ t('licenseAdmin.answer') }}：</strong>{{ question.correct_answer || '-' }}</p>
          <p v-if="question.answer_analysis"><strong>{{ t('licenseAdmin.analysis') }}：</strong>{{ question.answer_analysis }}</p>
          <p v-if="question.source_name"><strong>{{ t('examForm.questionSource') }}：</strong>{{ question.source_name }}</p>
        </article>
        <el-pagination v-model:current-page="questions.page" v-model:page-size="questions.page_size" :total="questions.total" :page-sizes="[5, 10, 20]" layout="total, sizes, prev, pager, next" @current-change="loadQuestions" @size-change="changeSize" />
      </template>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { getExamDetail, getExamQuestions } from "@/services/exam.api";

const props = defineProps({ modelValue: Boolean, exam: { type: Object, default: null } });
const emit = defineEmits(["update:modelValue"]);
const { t } = useI18n();
const visible = computed({ get: () => props.modelValue, set: value => emit("update:modelValue", value) });
const detail = ref(null), detailLoading = ref(false), questionsLoading = ref(false), error = ref("");
const questions = reactive({ items: [], total: 0, page: 1, page_size: 10, is_snapshot: false });
let requestId = 0;
const sourceNames = computed(() => props.exam?.source_names?.join("、") || detail.value?.sources?.map(item => item.source_ref_id).join("、") || "-");
const categoryText = computed(() => props.exam?.exam_type === "mixed" ? t("exam.types.mixed") : [props.exam?.primary_category_name, props.exam?.category_name].filter(Boolean).join(" / ") || "-");

function reset() { requestId++; detail.value = null; error.value = ""; Object.assign(questions, { items: [], total: 0, page: 1, page_size: 10, is_snapshot: false }); }
function questionType(type) { return t(`exam.types.${{ fill_blank: "fillBlank", short_answer: "qa", single_choice: "singleChoice", multiple_choice: "multipleChoice", true_false: "judgement", 填空题: "fillBlank", 问答题: "qa", 单选题: "singleChoice", 多选题: "multipleChoice", 判断题: "judgement" }[type] || "other"}`); }
function options(value) { try { const parsed = typeof value === "string" ? JSON.parse(value) : value; return Array.isArray(parsed) ? parsed : parsed?.options || []; } catch { return []; } }
function optionText(option, index) { return `${option?.key || String.fromCharCode(65 + index)}. ${option?.text || option?.content || option}`; }
async function loadQuestions() {
  if (!props.exam?.id || questionsLoading.value) return;
  const current = ++requestId; questionsLoading.value = true; error.value = "";
  try { const result = await getExamQuestions(props.exam.id, { page: questions.page, page_size: questions.page_size }); if (current === requestId) Object.assign(questions, result); }
  catch (e) { if (current === requestId) error.value = e.message || t("exam.saveFailed"); }
  finally { if (current === requestId) questionsLoading.value = false; }
}
async function open() {
  if (!props.exam?.id) return;
  const current = ++requestId; detailLoading.value = true; error.value = "";
  try { const [exam, questionPage] = await Promise.all([getExamDetail(props.exam.id), getExamQuestions(props.exam.id, { page: 1, page_size: questions.page_size })]); if (current === requestId) { detail.value = exam; Object.assign(questions, questionPage); } }
  catch (e) { if (current === requestId) error.value = e.message || t("exam.saveFailed"); }
  finally { if (current === requestId) detailLoading.value = false; }
}
function changeSize() { questions.page = 1; loadQuestions(); }
watch(() => [props.modelValue, props.exam?.id], ([show]) => { if (show) { reset(); open(); } });
</script>

<style scoped>
.exam-preview-dialog { min-height: 180px; }.exam-summary { display: grid; gap: 6px; margin-bottom: 16px; padding: 16px; border-radius: 8px; background: var(--el-fill-color-light); }.exam-summary h3, .exam-summary p { margin: 0; }.exam-summary p { color: var(--el-text-color-secondary); }.question-card { margin: 12px 0; padding: 16px; border: 1px solid var(--el-border-color); border-radius: 8px; }.question-card header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; line-height: 1.6; }.question-card p { margin: 10px 0 0; line-height: 1.65; }.option { padding: 7px 10px; border-radius: 4px; background: var(--el-fill-color-light); } :deep(.el-pagination) { justify-content: flex-end; margin-top: 16px; } @media (max-width: 600px) { .question-card header { flex-direction: column; } }
</style>
