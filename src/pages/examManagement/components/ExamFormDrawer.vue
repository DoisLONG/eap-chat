<template>
  <el-drawer v-model="visible" :title="form.id ? t('exam.edit') : t('exam.create')" size="min(920px, 100%)" :close-on-click-modal="false" :before-close="close">
    <el-steps :active="step - 1" finish-status="success" simple class="steps">
      <el-step :title="t('exam.basicInfo')" /><el-step :title="t('exam.questionConfig')" /><el-step :title="t('exam.preview')" /><el-step :title="t('exam.publishSettings')" />
    </el-steps>
    <el-form ref="formRef" :model="form" label-width="110px" class="form">
      <template v-if="step === 1">
        <el-form-item :label="t('exam.type')" required><el-radio-group v-model="form.type"><el-radio-button v-for="type in examTypes" :key="type" :value="type">{{ t(`exam.types.${type}`) }}</el-radio-button></el-radio-group></el-form-item>
        <el-form-item :label="t('exam.name')" required><el-input v-model.trim="form.name" :maxlength="100" show-word-limit /></el-form-item>
        <el-form-item :label="t('exam.version')"><el-input v-model.trim="form.version" /></el-form-item>
        <el-form-item :label="t('exam.description')"><el-input v-model="form.description" type="textarea" /></el-form-item>
        <el-form-item :label="t('exam.sourcePractice')" required><PracticeSelector v-model="form.sources" /></el-form-item>
      </template>
      <template v-else-if="step === 2">
        <el-alert :title="t('exam.randomOnly')" type="info" :closable="false" show-icon class="notice" />
        <QuestionConfig v-model="form.questionConfigs" />
        <el-form-item :label="t('exam.duration')" required><el-input-number v-model="form.duration" :min="1" /> {{ t('exam.minutes') }}</el-form-item>
        <el-form-item :label="t('exam.passScore')" required><el-input-number v-model="form.passScore" :min="0" :max="totalScore" /></el-form-item>
        <el-form-item :label="t('exam.rules')"><el-checkbox v-model="form.rules.randomPaper">{{ t('exam.randomPaper') }}</el-checkbox><el-checkbox v-model="form.rules.randomOptions">{{ t('exam.randomOptions') }}</el-checkbox><el-checkbox v-model="form.rules.showAnswer">{{ t('exam.showAnswer') }}</el-checkbox><el-checkbox v-model="form.rules.allowRetake">{{ t('exam.allowRetake') }}</el-checkbox></el-form-item>
        <el-alert :title="t('exam.rulesPending')" type="warning" :closable="false" show-icon />
      </template>
      <template v-else-if="step === 3"><ExamPreview :form="form" :questions="previewQuestions" :total-questions="totalQuestions" :total-score="totalScore" /></template>
      <template v-else>
        <el-form-item :label="t('exam.publishStatus')" required><el-radio-group v-model="form.publish.status"><el-radio value="draft">{{ t('exam.draft') }}</el-radio><el-radio value="publish">{{ t('exam.publishNow') }}</el-radio><el-radio value="scheduled">{{ t('exam.schedule') }}</el-radio></el-radio-group></el-form-item>
        <el-form-item v-if="form.publish.status !== 'draft'" :label="t('exam.startTime')" required><el-date-picker v-model="form.publish.startAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item>
        <el-form-item v-if="form.publish.status !== 'draft'" :label="t('exam.endTime')" required><el-date-picker v-model="form.publish.endAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item>
        <el-form-item :label="t('exam.audience')" required><el-radio-group v-model="form.publish.audience"><el-radio value="organization">{{ t('exam.byOrg') }}</el-radio><el-radio value="manual">{{ t('exam.manualUsers') }}</el-radio><el-radio value="all">{{ t('exam.allUsers') }}</el-radio></el-radio-group></el-form-item>
        <el-alert :title="t('exam.audiencePending')" type="warning" :closable="false" show-icon />
      </template>
    </el-form>
    <template #footer><el-button v-if="step > 1" @click="step--">{{ t('exam.previous') }}</el-button><el-button @click="close">{{ t('common.cancel') }}</el-button><el-button type="primary" :loading="saving" @click="next">{{ step === 4 ? t('exam.save') : t('exam.next') }}</el-button></template>
  </el-drawer>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import { EXAM_API_UNAVAILABLE, getQaList, saveExam } from "@/services/exam.api";
import PracticeSelector from "./PracticeSelector.vue";
import QuestionConfig from "./QuestionConfig.vue";
import ExamPreview from "./ExamPreview.vue";

const props = defineProps({ modelValue: Boolean, exam: { type: Object, default: null } });
const emit = defineEmits(["update:modelValue", "saved"]);
const { t } = useI18n();
const visible = computed({ get: () => props.modelValue, set: value => emit("update:modelValue", value) });
const step = ref(1), saving = ref(false), formRef = ref();
const examTypes = ["product", "technical", "operation", "mixed"];
const questionCache = new Map();
const typeLabels = { "选择题": "choice", "单选题": "singleChoice", "多选题": "multipleChoice", "判断题": "judgement", "问答题": "qa", "回答题": "qa", "填空题": "fillBlank" };
const form = reactive(emptyForm());
const previewQuestions = ref([]);
const totalQuestions = computed(() => form.questionConfigs.reduce((sum, item) => sum + Number(item.count || 0), 0));
const totalScore = computed(() => form.questionConfigs.reduce((sum, item) => sum + Number(item.count || 0) * Number(item.score || 0), 0));

function emptyForm() { return { id: null, type: "product", name: "", version: "", description: "", sources: [], questionConfigs: [], duration: 60, passScore: 60, rules: { randomPaper: true, randomOptions: true, showAnswer: false, allowRetake: false }, publish: { status: "draft", startAt: "", endAt: "", audience: "" } }; }
function reset(value = null) { Object.assign(form, emptyForm(), value || {}); form.sources = value?.sources || []; form.questionConfigs = value?.questionConfigs || []; step.value = 1; previewQuestions.value = []; }
watch(() => props.modelValue, value => value && reset(props.exam), { immediate: true });
function normalizedType(type) { return typeLabels[type] || "other"; }
function isAuto(type) { return ["选择题", "单选题", "多选题", "判断题"].includes(type); }
async function loadQuestions() {
  const records = await Promise.all(form.sources.map(async source => {
    const id = source.id ?? source.sop_id;
    if (!questionCache.has(id)) {
      const response = await getQaList({ id });
      questionCache.set(id, response.data?.results || []);
    }
    return questionCache.get(id).map(question => ({ ...question, sop_id: id, pk: question.pk ?? question.id }));
  }));
  return records.flat();
}
function configureQuestions(questions) {
  const previous = new Map(form.questionConfigs.map(item => [item.type, item]));
  form.questionConfigs = [...new Set(questions.map(item => item.type || "未知类型"))].map(type => ({ type, label: t(`exam.types.${normalizedType(type)}`) || type, available: questions.filter(item => (item.type || "未知类型") === type).length, count: previous.get(type)?.count || 0, score: previous.get(type)?.score || 1, auto: isAuto(type) }));
}
function validateStepOne() {
  if (!form.name || !form.sources.length) throw new Error(!form.name ? t("exam.nameRequired") : t("exam.sourceRequired"));
  const categories = new Set(form.sources.map(item => item.primary_category_id).filter(Boolean));
  if (categories.size !== form.sources.length) throw new Error(t("exam.sameCategoryRequired"));
  if (form.type === "mixed" ? categories.size < 2 : categories.size > 1) throw new Error(form.type === "mixed" ? t("exam.mixedNeedCategories") : t("exam.sameCategoryRequired"));
}
function validateStepTwo() {
  if (!totalQuestions.value || !totalScore.value || form.duration <= 0 || form.passScore > totalScore.value) throw new Error(t("exam.invalidQuestionConfig"));
  if (form.questionConfigs.some(item => item.count < 0 || item.count > item.available || item.score <= 0)) throw new Error(t("exam.invalidQuestionConfig"));
}
function validatePublish() {
  const { status, startAt, endAt, audience } = form.publish;
  if (!audience) throw new Error(t("exam.audienceRequired"));
  if (status === "scheduled" && (!startAt || !endAt)) throw new Error(t("exam.timeRequired"));
  if (status !== "draft" && startAt && endAt && new Date(endAt) <= new Date(startAt)) throw new Error(t("exam.invalidTime"));
  if (status === "publish" && endAt && new Date(endAt) <= new Date()) throw new Error(t("exam.invalidTime"));
}
// 仅用于未接入抽题预览 API 时的浏览器预览；保存时必须由后端按 pk 重新校验。
function makePreview(questions) {
  const picked = [];
  form.questionConfigs.forEach(config => {
    const pool = questions.filter(item => (item.type || "未知类型") === config.type).slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    picked.push(...pool.slice(0, config.count).map(item => ({ ...item, typeLabel: config.label, score: config.score, options: parseOptions(item.content) })));
  });
  previewQuestions.value = picked;
}
function parseOptions(content) { try { const value = typeof content === "string" ? JSON.parse(content) : content; return Array.isArray(value) ? value : value?.options; } catch { return []; } }
async function next() {
  try {
    if (step.value === 1) { validateStepOne(); configureQuestions(await loadQuestions()); if (!form.questionConfigs.length) throw new Error(t("exam.noQuestions")); }
    if (step.value === 2) { validateStepTwo(); makePreview(await loadQuestions()); }
    if (step.value < 4) { step.value++; return; }
    validatePublish(); saving.value = true; await saveExam({ ...form, source_sop_ids: form.sources.map(item => item.id ?? item.sop_id), preview_question_pks: previewQuestions.value.map(item => item.pk) });
    ElMessage.success(t("common.saveSuccess")); emit("saved"); visible.value = false;
  } catch (e) { ElMessage.error(e.code === EXAM_API_UNAVAILABLE ? t("exam.apiUnavailable") : e.message || t("exam.saveFailed")); }
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
