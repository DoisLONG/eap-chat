<template>
  <el-dialog v-model="visible" :title="mode === 'edit' ? t('exam.edit') : t('exam.create')" class="exam-form-dialog" align-center :close-on-click-modal="false" :before-close="requestClose">
    <nav class="stepper">
        <span class="step-line" /><span class="step-progress" :style="{ width: `${((step - 1) / 3) * 75}%` }" />
        <button v-for="(item, index) in stepItems" :key="item.title" type="button" class="step-button" :class="{ active: step === index + 1, done: completedStep > index + 1 }" :disabled="!canJumpToStep(index + 1)" @click="goToStep(index + 1)"><span class="step-circle"><el-icon v-if="completedStep > index + 1"><CircleCheck /></el-icon><template v-else>{{ index + 1 }}</template></span><span>{{ t(item.title) }}</span></button>
    </nav>
    <div ref="scrollContent" class="dialog-scroll">
      <el-form v-loading="detailLoading" ref="formRef" :model="form" :disabled="isReadonly || detailLoading" label-position="top" class="exam-form">
        <template v-if="step === 1">
          <section class="section-card">
            <div class="section-heading"><div><h3>{{ t('exam.basicInfo') }}</h3><p>{{ t('examForm.basicTip') }}</p></div></div>
            <el-form-item :label="t('exam.type')" required>
              <div class="category-grid"><button v-for="item in examTypes" :key="item.value" type="button" class="category-card" :class="[item.value, { selected: form.type === item.value }]" :disabled="isReadonly" @click="selectType(item.value)"><span class="category-icon"><el-icon><component :is="item.icon" /></el-icon></span><span><strong>{{ t(`exam.types.${item.value}`) }}</strong><small>{{ t(`examForm.categoryDescriptions.${item.value}`) }}</small></span></button></div>
            </el-form-item>
            <div class="form-grid"><el-form-item :label="t('exam.name')" required><el-input v-model.trim="form.name" :maxlength="100" show-word-limit /></el-form-item><el-form-item :label="t('exam.version')"><el-input v-model.trim="form.version" :maxlength="32" /></el-form-item><el-form-item class="full" :label="t('exam.description')"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item></div>
          </section>
          <section class="section-card">
            <div class="section-heading sources-heading"><h3>{{ t('examForm.selectSources') }}</h3><span>{{ t('examForm.selectedPractices', { count: form.sources.length }) }}</span></div>
            <PracticeSelector v-model="form.sources" :exam-type="form.type" :disabled="isReadonly" />
          </section>
        </template>

        <template v-else-if="step === 2">
          <QuestionConfig v-model="form.questionConfigs" :duration="form.duration" :pass-score="form.passScore" :total-questions="totalQuestions" :total-score="totalScore" :rules="form.rules" :disabled="isReadonly" @update:duration="form.duration = $event" @update:pass-score="form.passScore = $event" @update:rules="form.rules = $event" />
        </template>

        <ExamPreview v-else-if="step === 3" :form="form" :questions="previewQuestions" :candidate-questions="candidateQuestions" :total-questions="totalQuestions" :total-score="totalScore" :status="status" />

        <template v-else>
          <section class="section-card">
            <div class="publish-complete"><el-icon><CircleCheck /></el-icon><h3>{{ t('examForm.configurationComplete') }}</h3><p>{{ t('examForm.configurationCompleteDesc') }}</p></div>
            <div class="publish-grid"><el-form-item :label="t('exam.publishStatus')" required><el-radio-group v-model="form.publish.status"><el-radio value="draft">{{ t('examForm.saveDraft') }}</el-radio><el-radio value="publish">{{ t('exam.publishNow') }}</el-radio></el-radio-group></el-form-item><el-form-item :label="t('exam.audience')" required><el-input :model-value="t('exam.allUsers')" disabled /></el-form-item><el-form-item :label="t('exam.startTime')"><el-date-picker v-model="form.publish.startAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item><el-form-item :label="t('examForm.estimatedEndTime')"><el-date-picker :model-value="estimatedEndAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" disabled /></el-form-item></div>
            <p class="publish-time-hint">{{ t('examForm.endTimeCalculated') }}</p>
            <el-alert :title="t('examForm.allAudienceOnly')" type="info" :closable="false" show-icon />
          </section>
        </template>
      </el-form>
    </div>
    <template #footer><div class="dialog-footer"><el-button v-if="step > 1" @click="step--">{{ t('exam.previous') }}</el-button><el-button @click="requestClose()">{{ t('common.cancel') }}</el-button><el-button v-if="!isReadonly" type="primary" :loading="saving" @click="next">{{ actionLabel }}</el-button></div></template>
  </el-dialog>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from "vue";
import { CircleCheck, Collection, Connection, Operation, Setting } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import { createExam, getExamDetail, getSopCategoryTree, publishExam, saveExamRules, saveExamSources, saveExamTargets, updateExam } from "@/services/exam.api";
import { getQaList } from "@/services/sop.api";
import PracticeSelector from "./PracticeSelector.vue";
import QuestionConfig from "./QuestionConfig.vue";
import ExamPreview from "./ExamPreview.vue";

const props = defineProps({ modelValue: Boolean, exam: { type: Object, default: null } });
const emit = defineEmits(["update:modelValue", "saved"]);
const { t } = useI18n();
const visible = computed({ get: () => props.modelValue, set: value => emit("update:modelValue", value) });
const formRef = ref(), scrollContent = ref(), step = ref(1), completedStep = ref(1), saving = ref(false), detailLoading = ref(false), status = ref("draft");
const categories = ref([]), previewQuestions = ref([]), sourceQuestions = ref([]);
const isEditMode = ref(false);
const questionCache = new Map();
const saved = reactive({ base: "", sources: "", rules: "", targets: "" });
const stepItems = [{ title: "exam.basicInfo" }, { title: "exam.questionConfig" }, { title: "exam.preview" }, { title: "exam.publishSettings" }];
const examTypes = [{ value: "product", icon: Collection }, { value: "technical", icon: Setting }, { value: "operation", icon: Operation }, { value: "mixed", icon: Connection }];
const typeLabels = { fill_blank: "fillBlank", short_answer: "qa", single_choice: "singleChoice", multiple_choice: "multipleChoice", true_false: "judgement" };
const form = reactive(emptyForm());
const mode = computed(() => form.id ? "edit" : "create");
const totalQuestions = computed(() => form.questionConfigs.reduce((sum, item) => sum + Number(item.count || 0), 0));
const totalScore = computed(() => form.questionConfigs.reduce((sum, item) => sum + Number(item.count || 0) * Number(item.score || 0), 0));
const estimatedEndAt = computed(() => calculatedEndTime(form.publish.startAt, form.duration));
const isReadonly = computed(() => status.value === "published");
const canEditSteps = computed(() => isEditMode.value && !detailLoading.value && ["draft", "ended"].includes(normalizeExamStatus(status.value)));
const hasUnsavedChanges = computed(() => Boolean(form.id || form.name || form.sources.length || form.questionConfigs.length));
const candidateQuestions = computed(() => {
  const selectedTypes = new Set(form.questionConfigs.filter(item => Number(item.count) > 0).map(item => item.type));
  return sourceQuestions.value.filter(item => selectedTypes.has(item.type || item.question_type)).slice(0, 5);
});
const actionLabel = computed(() => {
  if (step.value < 4) return t("exam.next");
  if (form.publish.status === "publish") return status.value === "ended" ? t("examForm.republishExam") : t("examForm.publishExam");
  return form.id ? t("examForm.saveChanges") : t("examForm.completeCreate");
});

function emptyForm() { return { id: null, type: "product", name: "", version: "", description: "", sources: [], questionConfigs: [], duration: 60, passScore: 60, rules: { randomPaper: true, randomOptions: true, showAnswer: false, allowRetake: false, maxAttempts: 2 }, publish: { status: "draft", startAt: "", endAt: "", audience: "all" } }; }
function reset(value = null) { isEditMode.value = Boolean(value?.id); Object.assign(form, emptyForm(), value || {}); form.sources = value?.sources || []; form.questionConfigs = value?.questionConfigs || []; step.value = 1; completedStep.value = 1; previewQuestions.value = []; sourceQuestions.value = []; questionCache.clear(); Object.assign(saved, { base: "", sources: "", rules: "", targets: "" }); status.value = "draft"; }
let detailRequest = 0;
watch(() => [props.modelValue, props.exam?.id], ([value]) => { if (!value) { detailRequest++; detailLoading.value = false; return; } reset(props.exam); resetScroll(); if (props.exam?.id) loadDetail(props.exam.id); else loadCategories(); }, { immediate: true });
watch(step, resetScroll);

function resetScroll() { nextTick(() => scrollContent.value?.scrollTo({ top: 0 })); }

function normalizedType(type) { return typeLabels[type] || "other"; }
function normalizeExamStatus(value) { return ({ draft: "draft", "草稿": "draft", ended: "ended", "已结束": "ended", published: "published", "已发布": "published" })[String(value || "").trim().toLowerCase()] || ""; }
function parseDateTime(value) { const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/); if (!match) return null; const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]), Number(match[6])); return Number.isNaN(date.getTime()) ? null : date; }
function formatDateTime(date) { const pad = value => String(value).padStart(2, "0"); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`; }
function calculatedEndTime(startAt, duration) { const start = parseDateTime(startAt), minutes = Number(duration); if (!start || !Number.isFinite(minutes) || minutes <= 0) return ""; return formatDateTime(new Date(start.getTime() + minutes * 60 * 1000)); }
function isAuto(type) { return type !== "short_answer"; }
function practiceId(item) { return Number(item.id ?? item.practice_id ?? item.sop_id ?? item.source_ref_id); }
function categoryType(categoryId) { const primary = categories.value.find(item => String(item.id) === String(categoryId) || item.children?.some(child => String(child.id) === String(categoryId))); const name = primary?.name || ""; if (name.includes("技术")) return "technical"; if (name.includes("运营")) return "operation"; return "product"; }
function sourceType(source) { return source.primary_category_name ? (source.primary_category_name.includes("技术") ? "technical" : source.primary_category_name.includes("运营") ? "operation" : "product") : categoryType(source.category_id); }
function selectType(type) { if (isReadonly.value || form.type === type) return; form.type = type; if (type !== "mixed") form.sources = form.sources.filter(source => sourceType(source) === type); }
function canJumpToStep(target) { return isEditMode.value ? canEditSteps.value : target <= completedStep.value; }
async function goToStep(target) { if (target === step.value || !canJumpToStep(target)) return; step.value = target; if (target === 3 && !sourceQuestions.value.length && form.sources.length) { try { await loadSourceQuestions(); } catch (error) { ElMessage.error(error.message || t("exam.loadPracticeFailed")); } } }

function validateStepOne() {
  if (!form.name || !form.sources.length) throw new Error(!form.name ? t("exam.nameRequired") : t("exam.sourceRequired"));
  const types = new Set(form.sources.map(sourceType));
  if (form.type === "mixed" ? types.size < 2 : types.size !== 1 || !types.has(form.type)) throw new Error(form.type === "mixed" ? t("exam.mixedNeedCategories") : t("exam.sameCategoryRequired"));
}
function validateStepTwo() {
  if (!totalQuestions.value || !totalScore.value || form.duration <= 0 || form.passScore > totalScore.value) throw new Error(t("exam.invalidQuestionConfig"));
  if (form.questionConfigs.some(item => item.count < 0 || (item.available != null && item.count > item.available) || item.score <= 0)) throw new Error(t("exam.invalidQuestionConfig"));
}
function validatePublish() {
  const { status: publishStatus, startAt, audience } = form.publish;
  if (audience !== "all") throw new Error(t("examForm.onlyAllAudience"));
  if (publishStatus === "scheduled") throw new Error(t("examForm.scheduledUnavailable"));
  if (publishStatus !== "publish") return;
  const start = parseDateTime(startAt);
  if (!start) throw new Error(t("examForm.startTimeRequired"));
  if (start.getTime() < Date.now() - 60 * 1000) throw new Error(t("examForm.startTimePast"));
  if (!estimatedEndAt.value) throw new Error(t("examForm.durationInvalid"));
}
function basePayload() { return { name: form.name, version: form.version || null, description: form.description || null, exam_type: form.type === "mixed" ? "mixed" : "normal", category_id: form.sources[0]?.category_id || null, duration: Number(form.duration), pass_score: Number(form.passScore), participant_scope: "all", random_paper: form.rules.randomPaper, randomOptions: form.rules.randomOptions, showAnswer: form.rules.showAnswer, allowRetake: form.rules.allowRetake, max_attempts: Number(form.rules.maxAttempts || 1), start_time: form.publish.startAt || null }; }
function sourcesPayload() { return { sources: form.sources.map((source, index) => ({ source_type: "practice", source_ref_id: String(practiceId(source)), category_id: source.category_id || null, sort_order: index })) }; }
function rulesPayload() { return { rules: form.questionConfigs.map(item => ({ question_type: item.type, draw_mode: "random", grading_mode: item.grading_mode || (item.auto ? "auto" : "manual"), question_count: Number(item.count), score_per_question: Number(item.score), difficulty_min: item.difficulty_min ?? null, difficulty_max: item.difficulty_max ?? null })) }; }
async function saveBaseIfChanged() { const payload = basePayload(), fingerprint = JSON.stringify(payload); if (form.id && saved.base === fingerprint) return; if (form.id) await updateExam(form.id, payload); else { const detail = await createExam(payload); form.id = detail.id; status.value = detail.status; } saved.base = fingerprint; }
async function saveSourcesIfChanged() { const payload = sourcesPayload(), fingerprint = JSON.stringify(payload); if (saved.sources === fingerprint) return; await saveExamSources(form.id, payload); saved.sources = fingerprint; }
async function saveRulesIfChanged() { const payload = rulesPayload(), fingerprint = JSON.stringify(payload); if (saved.rules === fingerprint) return; await saveExamRules(form.id, payload); saved.rules = fingerprint; }
async function saveTargetsIfChanged() { const payload = { targets: [{ target_type: "all", target_ref_id: "ALL" }] }, fingerprint = JSON.stringify(payload); if (saved.targets === fingerprint) return; await saveExamTargets(form.id, payload); saved.targets = fingerprint; }
async function saveDraft() { await saveBaseIfChanged(); await saveSourcesIfChanged(); await saveRulesIfChanged(); await saveTargetsIfChanged(); }
async function loadSourceQuestions() {
  const results = await Promise.allSettled(form.sources.map(async source => {
    const id = practiceId(source);
    if (!questionCache.has(id)) {
      const response = await getQaList({ id });
      if (response.data?.status !== 200) throw new Error(t("exam.loadPracticeFailed"));
      questionCache.set(id, response.data.results || []);
    }
    return questionCache.get(id);
  }));
  const questions = results.filter(item => item.status === "fulfilled").flatMap(item => item.value);
  if (!questions.length) throw new Error(t("exam.noQuestions"));
  sourceQuestions.value = questions;
  const previous = new Map(form.questionConfigs.map(item => [item.type, item]));
  const counts = new Map();
  questions.forEach(question => counts.set(question.type, (counts.get(question.type) || 0) + 1));
  form.questionConfigs = [...counts].map(([type, available]) => {
    const current = previous.get(type);
    const auto = current?.auto ?? isAuto(type);
    return { type, label: t(`exam.types.${normalizedType(type)}`), available, count: current?.count || 0, score: current?.score || 10, auto, grading_mode: current?.grading_mode || (auto ? "auto" : "manual"), difficulty_min: current?.difficulty_min ?? null, difficulty_max: current?.difficulty_max ?? null };
  });
}
function hydrate(detail) {
  const sourceRows = (detail.sources || []).map(source => ({ ...source, id: Number(source.source_ref_id) }));
  Object.assign(form, { id: detail.id, type: detail.exam_type === "mixed" ? "mixed" : categoryType(detail.category_id), name: detail.name || "", version: detail.version || "", description: detail.description || "", sources: sourceRows, questionConfigs: (detail.question_configs || []).map(item => ({ type: item.question_type, label: t(`exam.types.${normalizedType(item.question_type)}`), available: null, count: Number(item.question_count), score: Number(item.score_per_question), auto: item.grading_mode === "auto", grading_mode: item.grading_mode, difficulty_min: item.difficulty_min == null ? null : Number(item.difficulty_min), difficulty_max: item.difficulty_max == null ? null : Number(item.difficulty_max) })), duration: detail.duration, passScore: Number(detail.pass_score || 0), rules: { ...emptyForm().rules, ...(detail.rules || {}) }, publish: { status: ["published", "ended"].includes(detail.status) ? "publish" : "draft", startAt: detail.start_time || "", endAt: detail.end_time || "", audience: detail.targets?.[0]?.target_type || "all" } });
  status.value = detail.status; previewQuestions.value = detail.preview_questions || []; if (status.value === "published") { step.value = 3; completedStep.value = 4; }
}
async function loadCategories() { try { const response = await getSopCategoryTree(); categories.value = response.data?.results || []; } catch { categories.value = []; } }
async function loadDetail(id) { const current = ++detailRequest; detailLoading.value = true; try { const [, detail] = await Promise.all([loadCategories(), getExamDetail(id)]); if (current === detailRequest) hydrate(detail); } catch (error) { if (current === detailRequest) { ElMessage.error(error.message || t("examForm.detailLoadFailed")); forceClose(); } } finally { if (current === detailRequest) detailLoading.value = false; } }
async function next() {
  saving.value = true;
  try {
    if (step.value === 1) { validateStepOne(); await saveBaseIfChanged(); await saveSourcesIfChanged(); await loadSourceQuestions(); completedStep.value = Math.max(completedStep.value, 2); step.value = 2; return; }
    if (step.value === 2) { validateStepTwo(); await saveRulesIfChanged(); completedStep.value = Math.max(completedStep.value, 3); step.value = 3; return; }
    if (step.value === 3) { completedStep.value = 4; step.value = 4; return; }
    validateStepOne(); validateStepTwo(); validatePublish(); await saveDraft();
    if (form.publish.status === "publish") { const confirmation = status.value === "ended" ? "examForm.republishConfirm" : "examForm.publishConfirm"; await ElMessageBox.confirm(t(confirmation), t("header.tip"), { type: "warning" }); hydrate(await publishExam(form.id)); }
    ElMessage.success(t("common.saveSuccess")); emit("saved"); forceClose();
  } catch (e) { if (e !== "cancel" && e !== "close") ElMessage.error(e.message || t("exam.saveFailed")); }
  finally { saving.value = false; }
}
function forceClose() { detailRequest++; saving.value = false; detailLoading.value = false; visible.value = false; reset(); }
async function requestClose(done) { if (hasUnsavedChanges.value && visible.value) { try { await ElMessageBox.confirm(t("exam.confirmClose"), t("header.tip"), { type: "warning" }); } catch { return; } } forceClose(); if (typeof done === "function") done(); }
</script>

<style scoped>
.publish-time-hint { max-width: 720px; margin: 0 auto 18px; color: var(--el-text-color-secondary); font-size: 12px; }
:global(.exam-form-dialog) { display: flex; flex-direction: column; width: min(1060px, calc(100vw - 48px)) !important; max-width: calc(100vw - 48px); height: min(720px, calc(100vh - 48px)); max-height: calc(100vh - 48px); margin: auto !important; overflow: hidden; border-radius: 10px; }:global(.exam-form-dialog .el-dialog__header) { flex: 0 0 auto; margin-right: 0; padding: 20px 24px; border-bottom: 1px solid var(--el-border-color-lighter); }:global(.exam-form-dialog .el-dialog__title) { font-size: 18px; font-weight: 700; }:global(.exam-form-dialog .el-dialog__body) { display: flex; flex: 1 1 auto; flex-direction: column; min-height: 0; padding: 0; overflow: hidden; background: var(--el-fill-color-extra-light); }:global(.exam-form-dialog .el-dialog__footer) { flex: 0 0 auto; padding: 14px 24px; border-top: 1px solid var(--el-border-color-lighter); }.dialog-scroll { flex: 1 1 auto; min-height: 0; overflow-x: hidden; overflow-y: auto; padding: 0 26px 28px; }.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; }.stepper { display: grid; flex: 0 0 auto; grid-template-columns: repeat(4, 1fr); position: relative; width: min(100%, 860px); margin: 0 auto; padding: 20px 0 18px; }.step-line, .step-progress { position: absolute; top: 36px; left: 12.5%; height: 2px; }.step-line { right: 12.5%; background: var(--el-border-color); }.step-progress { background: var(--el-color-primary); transition: width .2s; }.step-button { z-index: 1; display: grid; justify-items: center; gap: 7px; border: 0; color: var(--el-text-color-secondary); background: transparent; font-size: 14px; }.step-button:not(:disabled) { cursor: pointer; }.step-circle { display: grid; width: 32px; height: 32px; place-items: center; border: 2px solid var(--el-fill-color); border-radius: 50%; color: var(--el-text-color-secondary); background: var(--el-fill-color); font-weight: 700; }.step-button.active { color: var(--el-color-primary); font-weight: 700; }.step-button.active .step-circle { border-color: var(--el-color-primary); color: #fff; background: var(--el-color-primary); }.step-button.done { color: var(--el-color-success); }.step-button.done .step-circle { border-color: var(--el-color-success-light-5); color: var(--el-color-success); background: var(--el-color-success-light-9); }.section-card { margin-bottom: 14px; padding: 18px; border: 1px solid var(--el-border-color); border-radius: 9px; background: var(--el-bg-color); }.section-heading { display: flex; align-items: baseline; gap: 8px; margin-bottom: 16px; }.section-heading h3 { margin: 0; font-size: 16px; }.section-heading p, .sources-heading span { margin: 4px 0 0; color: var(--el-text-color-secondary); font-size: 13px; }.sources-heading span { margin-left: auto; }.category-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; width: 100%; }.category-card { display: flex; gap: 12px; min-height: 72px; padding: 13px; border: 1px solid var(--el-border-color); border-radius: 8px; background: var(--el-bg-color); color: var(--el-text-color-primary); text-align: left; cursor: pointer; }.category-card.selected { border-color: var(--el-color-primary); background: var(--el-color-primary-light-9); box-shadow: inset 0 0 0 1px var(--el-color-primary-light-8); }.category-card:disabled { cursor: default; }.category-icon { display: grid; flex: none; width: 36px; height: 36px; place-items: center; border-radius: 9px; color: var(--el-color-primary); background: var(--el-color-primary-light-9); }.category-card strong, .category-card small { display: block; }.category-card small { margin-top: 4px; color: var(--el-text-color-secondary); font-size: 12px; line-height: 1.4; }.form-grid, .publish-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }.form-grid .full { grid-column: 1 / -1; }.exam-form :deep(.el-form-item__label) { font-weight: 600; }.exam-form :deep(.el-input__wrapper), .exam-form :deep(.el-textarea__inner), .publish-grid :deep(.el-date-editor) { min-height: 38px; }.publish-complete { max-width: 680px; margin: 0 auto 22px; padding: 8px 0; text-align: center; }.publish-complete .el-icon { width: 64px; height: 64px; margin-bottom: 10px; padding: 14px; border-radius: 50%; color: var(--el-color-success); background: var(--el-color-success-light-9); }.publish-complete h3 { margin: 0 0 8px; font-size: 20px; }.publish-complete p { margin: 0; color: var(--el-text-color-secondary); font-size: 13px; line-height: 1.7; }.publish-grid { max-width: 720px; margin: 0 auto 18px; }.publish-grid :deep(.el-date-editor) { width: 100%; } @media (max-width: 900px) { :global(.exam-form-dialog) { width: min(1060px, calc(100vw - 24px)) !important; max-width: calc(100vw - 24px); height: min(720px, calc(100vh - 24px)); max-height: calc(100vh - 24px); }.category-grid, .form-grid, .publish-grid { grid-template-columns: 1fr; }.dialog-scroll { padding: 0 18px 18px; } } @media (max-width: 620px) { .stepper { font-size: 12px; }.step-button { font-size: 12px; }.section-card { padding: 14px; }.sources-heading { align-items: flex-start; flex-direction: column; }.sources-heading span { margin-left: 0; } }

@supports (height: 100dvh) { :global(.exam-form-dialog) { height: min(720px, calc(100dvh - 48px)); max-height: calc(100dvh - 48px); } @media (max-width: 900px) { :global(.exam-form-dialog) { height: min(720px, calc(100dvh - 24px)); max-height: calc(100dvh - 24px); } } }
</style>
