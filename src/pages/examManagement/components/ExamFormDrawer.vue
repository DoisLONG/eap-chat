<template>
  <el-drawer v-model="visible" :title="form.id ? t('exam.edit') : t('exam.create')" size="min(920px, 100%)" :close-on-click-modal="false" :before-close="close">
    <el-steps :active="step - 1" finish-status="success" simple class="steps">
      <el-step :title="t('exam.basicInfo')" /><el-step :title="t('exam.questionConfig')" /><el-step :title="t('exam.preview')" /><el-step :title="t('exam.publishSettings')" />
    </el-steps>
    <el-form ref="formRef" :model="form" :disabled="isReadonly" label-width="110px" class="form">
      <template v-if="step === 1">
        <el-form-item :label="t('exam.type')" required><el-radio-group v-model="form.type"><el-radio-button v-for="type in examTypes" :key="type" :value="type">{{ t(`exam.types.${type}`) }}</el-radio-button></el-radio-group></el-form-item>
        <el-form-item :label="t('exam.name')" required><el-input v-model.trim="form.name" :maxlength="100" show-word-limit /></el-form-item>
        <el-form-item :label="t('exam.version')"><el-input v-model.trim="form.version" /></el-form-item>
        <el-form-item :label="t('exam.description')"><el-input v-model="form.description" type="textarea" /></el-form-item>
        <el-form-item :label="t('exam.sourcePractice')" required><PracticeSelector v-model="form.sources" :disabled="isReadonly" /></el-form-item>
      </template>
      <template v-else-if="step === 2">
        <el-alert :title="t('exam.randomOnly')" type="info" :closable="false" show-icon class="notice" />
        <QuestionConfig v-model="form.questionConfigs" :disabled="isReadonly" />
        <el-form-item :label="t('exam.duration')" required><el-input-number v-model="form.duration" :min="1" /> {{ t('exam.minutes') }}</el-form-item>
        <el-form-item :label="t('exam.passScore')" required><el-input-number v-model="form.passScore" :min="0" :max="totalScore" /></el-form-item>
        <el-form-item :label="t('exam.rules')"><el-checkbox v-model="form.rules.randomPaper">{{ t('exam.randomPaper') }}</el-checkbox><el-checkbox v-model="form.rules.randomOptions">{{ t('exam.randomOptions') }}</el-checkbox><el-checkbox v-model="form.rules.showAnswer">{{ t('exam.showAnswer') }}</el-checkbox><el-checkbox v-model="form.rules.allowRetake">{{ t('exam.allowRetake') }}</el-checkbox></el-form-item>
        <el-alert :title="t('exam.rulesPending')" type="warning" :closable="false" show-icon />
      </template>
      <template v-else-if="step === 3"><ExamPreview :form="form" :questions="previewQuestions" :total-questions="totalQuestions" :total-score="totalScore" :status="status" /></template>
      <template v-else>
        <el-form-item :label="t('exam.publishStatus')" required><el-radio-group v-model="form.publish.status"><el-radio value="draft">{{ t('exam.draft') }}</el-radio><el-radio value="publish">{{ t('exam.publishNow') }}</el-radio><el-radio value="scheduled">{{ t('exam.schedule') }}</el-radio></el-radio-group></el-form-item>
        <el-form-item v-if="form.publish.status !== 'draft'" :label="t('exam.startTime')" required><el-date-picker v-model="form.publish.startAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item>
        <el-form-item v-if="form.publish.status !== 'draft'" :label="t('exam.endTime')" required><el-date-picker v-model="form.publish.endAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item>
        <el-form-item :label="t('exam.audience')" required><el-radio-group v-model="form.publish.audience"><el-radio value="organization">{{ t('exam.byOrg') }}</el-radio><el-radio value="manual">{{ t('exam.manualUsers') }}</el-radio><el-radio value="all">{{ t('exam.allUsers') }}</el-radio></el-radio-group></el-form-item>
        <el-alert :title="t('exam.audiencePending')" type="warning" :closable="false" show-icon />
      </template>
    </el-form>
    <template #footer><el-button v-if="step > 1" @click="step--">{{ t('exam.previous') }}</el-button><el-button @click="close">{{ t('common.cancel') }}</el-button><el-button v-if="!isReadonly" type="primary" :loading="saving" @click="next">{{ step === 4 ? t('exam.save') : t('exam.next') }}</el-button></template>
  </el-drawer>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import { createExam, getExamDetail, publishExam, saveExamRules, saveExamSources, saveExamTargets, updateExam } from "@/services/exam.api";
import PracticeSelector from "./PracticeSelector.vue";
import QuestionConfig from "./QuestionConfig.vue";
import ExamPreview from "./ExamPreview.vue";

const props = defineProps({ modelValue: Boolean, exam: { type: Object, default: null } });
const emit = defineEmits(["update:modelValue", "saved"]);
const { t } = useI18n();
const visible = computed({ get: () => props.modelValue, set: value => emit("update:modelValue", value) });
const step = ref(1), saving = ref(false), formRef = ref(), status = ref("draft");
const examTypes = ["product", "technical", "operation", "mixed"];
const typeLabels = { fill_blank: "fillBlank", short_answer: "qa", single_choice: "singleChoice", multiple_choice: "multipleChoice", true_false: "judgement" };
const form = reactive(emptyForm());
const previewQuestions = ref([]);
const totalQuestions = computed(() => form.questionConfigs.reduce((sum, item) => sum + Number(item.count || 0), 0));
const totalScore = computed(() => form.questionConfigs.reduce((sum, item) => sum + Number(item.count || 0) * Number(item.score || 0), 0));
const isReadonly = computed(() => status.value !== "draft");

function emptyForm() { return { id: null, type: "product", name: "", version: "", description: "", sources: [], questionConfigs: [], duration: 60, passScore: 60, rules: { randomPaper: true, randomOptions: true, showAnswer: false, allowRetake: false }, publish: { status: "draft", startAt: "", endAt: "", audience: "" } }; }
function reset(value = null) { Object.assign(form, emptyForm(), value || {}); form.sources = value?.sources || []; form.questionConfigs = value?.questionConfigs || []; step.value = 1; previewQuestions.value = []; status.value = "draft"; }
watch(() => props.modelValue, value => { if (!value) return; reset(props.exam); if (props.exam?.id) loadDetail(props.exam.id); }, { immediate: true });
function normalizedType(type) { return typeLabels[type] || "other"; }
function isAuto(type) { return type !== "short_answer"; }
function configureQuestions() {
  const previous = new Map(form.questionConfigs.map(item => [item.type, item]));
  form.questionConfigs = ["fill_blank", "short_answer"].map(type => ({ type, label: t(`exam.types.${normalizedType(type)}`), available: null, count: previous.get(type)?.count || 0, score: previous.get(type)?.score || 10, auto: previous.get(type)?.auto ?? isAuto(type), grading_mode: previous.get(type)?.grading_mode || (isAuto(type) ? "auto" : "manual"), difficulty_min: previous.get(type)?.difficulty_min ?? null, difficulty_max: previous.get(type)?.difficulty_max ?? null }));
}
function validateStepOne() {
  if (!form.name || !form.sources.length) throw new Error(!form.name ? t("exam.nameRequired") : t("exam.sourceRequired"));
  const categories = new Set(form.sources.map(item => item.primary_category_id).filter(Boolean));
  if (categories.size !== form.sources.length) throw new Error(t("exam.sameCategoryRequired"));
  if (form.type === "mixed" ? categories.size < 2 : categories.size > 1) throw new Error(form.type === "mixed" ? t("exam.mixedNeedCategories") : t("exam.sameCategoryRequired"));
}
function validateStepTwo() {
  if (!totalQuestions.value || !totalScore.value || form.duration <= 0 || form.passScore > totalScore.value) throw new Error(t("exam.invalidQuestionConfig"));
  if (form.questionConfigs.some(item => item.count < 0 || (item.available != null && item.count > item.available) || item.score <= 0)) throw new Error(t("exam.invalidQuestionConfig"));
}
function validatePublish() {
  const { status, startAt, endAt, audience } = form.publish;
  if (audience !== "all") throw new Error("当前仅支持全员考试范围");
  if (status === "scheduled") throw new Error("当前后端不支持定时发布");
  if (status !== "draft" && startAt && endAt && new Date(endAt) <= new Date(startAt)) throw new Error(t("exam.invalidTime"));
  if (status === "publish" && endAt && new Date(endAt) <= new Date()) throw new Error(t("exam.invalidTime"));
}
function basePayload() { return { name: form.name, version: form.version || null, description: form.description || null, exam_type: form.type === "mixed" ? "mixed" : "normal", category_id: form.sources[0]?.category_id || null, duration: Number(form.duration), pass_score: Number(form.passScore), participant_scope: "all", random_paper: form.rules.randomPaper, randomOptions: form.rules.randomOptions, showAnswer: form.rules.showAnswer, allowRetake: form.rules.allowRetake, startAt: form.publish.startAt || null, endAt: form.publish.endAt || null }; }
async function saveBase() { if (form.id) await updateExam(form.id, basePayload()); else { const detail = await createExam(basePayload()); form.id = detail.id; status.value = detail.status; } }
async function saveSources() { await saveExamSources(form.id, { sources: form.sources.map((source, index) => ({ source_type: "practice", source_ref_id: String(source.id ?? source.practice_id ?? source.sop_id ?? source.source_ref_id), category_id: source.category_id || null, sort_order: index })) }); }
async function saveRules() { await saveExamRules(form.id, { rules: form.questionConfigs.map(item => ({ question_type: item.type, draw_mode: "random", grading_mode: item.grading_mode || (item.auto ? "auto" : "manual"), question_count: Number(item.count), score_per_question: Number(item.score), difficulty_min: item.difficulty_min ?? null, difficulty_max: item.difficulty_max ?? null })) }); }
async function saveTargets() { await saveExamTargets(form.id, { targets: [{ target_type: "all", target_ref_id: "ALL" }] }); }
async function saveDraft() { await saveBase(); await saveSources(); await saveRules(); await saveTargets(); }
function hydrate(detail) { Object.assign(form, { id: detail.id, type: detail.exam_type === "mixed" ? "mixed" : "product", name: detail.name || "", version: detail.version || "", description: detail.description || "", sources: (detail.sources || []).map(source => ({ ...source, id: Number(source.source_ref_id) })), questionConfigs: (detail.question_configs || []).map(item => ({ type: item.question_type, label: t(`exam.types.${normalizedType(item.question_type)}`), available: null, count: Number(item.question_count), score: Number(item.score_per_question), auto: item.grading_mode === "auto", grading_mode: item.grading_mode, difficulty_min: item.difficulty_min == null ? null : Number(item.difficulty_min), difficulty_max: item.difficulty_max == null ? null : Number(item.difficulty_max) })), duration: detail.duration, passScore: Number(detail.pass_score || 0), rules: detail.rules || form.rules, publish: { status: detail.status === "published" ? "publish" : "draft", startAt: detail.start_at || "", endAt: detail.end_at || "", audience: detail.targets?.[0]?.target_type || "all" } }); status.value = detail.status; previewQuestions.value = detail.preview_questions || []; if (status.value !== "draft") step.value = 3; }
async function loadDetail(id) { try { hydrate(await getExamDetail(id)); } catch (error) { ElMessage.error(error.message || "考试详情加载失败"); visible.value = false; } }
async function next() {
  saving.value = true;
  try {
    if (step.value === 1) { validateStepOne(); await saveBase(); await saveSources(); configureQuestions(); }
    if (step.value === 2) { validateStepTwo(); await saveRules(); previewQuestions.value = []; }
    if (step.value < 4) { step.value++; return; }
    validateStepTwo(); validatePublish(); await saveDraft();
    if (form.publish.status === "publish") { await ElMessageBox.confirm("发布后不能继续编辑或删除，确定发布吗？", t("header.tip"), { type: "warning" }); hydrate(await publishExam(form.id)); }
    ElMessage.success(t("common.saveSuccess")); emit("saved"); visible.value = false;
  } catch (e) { if (e !== "cancel" && e !== "close") ElMessage.error(e.message || t("exam.saveFailed")); }
  finally { saving.value = false; }
}
async function close(done) {
  const dirty = form.name || form.sources.length || form.questionConfigs.length;
  if (dirty && visible.value) { try { await ElMessageBox.confirm(t("exam.confirmClose"), t("header.tip"), { type: "warning" }); } catch { return; } }
  done?.(); visible.value = false;
}
</script>

<style scoped>
.steps { margin-bottom: 24px; }.form { padding: 0 12px; }.notice { margin-bottom: 14px; }
</style>
