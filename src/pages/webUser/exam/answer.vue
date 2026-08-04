<template>
  <WebPageContainer>
    <section v-loading="loading" class="web-exam-answer">
      <header class="web-exam-answer__header">
        <div>
          <el-button text :disabled="submitting" @click="goBack">← {{ t("web.exam.backToList") }}</el-button>
          <h1>{{ attemptData.exam?.title || t("web.exam.answering") }}</h1>
          <p>{{ t("web.exam.answered") }} {{ answeredCount }}/{{ questions.length }}</p>
        </div>
        <div class="web-exam-answer__timer" :class="{ 'is-expired': isExpired }">
          <span>{{ t("web.exam.remainingTime") }}</span><strong>{{ formattedRemaining }}</strong>
        </div>
      </header>

      <el-result v-if="loadError" icon="error" :title="loadError.message">
        <template #extra><el-button type="primary" @click="loadAttempt">{{ t("web.common.retry") }}</el-button></template>
      </el-result>
      <el-empty v-else-if="!loading && !questions.length" :description="t('web.exam.noActiveAttempt')">
        <el-button type="primary" @click="goBack">{{ t("web.exam.backToList") }}</el-button>
      </el-empty>

      <template v-else-if="currentQuestion">
        <aside class="web-exam-answer__nav">
          <el-button v-for="(question, index) in questions" :key="question.examQuestionId" circle :type="index === currentIndex ? 'primary' : ''" :plain="index !== currentIndex" :disabled="submitting" @click="switchQuestion(index)">
            {{ index + 1 }}
          </el-button>
        </aside>
        <article class="web-exam-answer__question">
          <p class="web-exam-answer__type">{{ questionTypeLabel(currentQuestion.questionType) }}</p>
          <h2>{{ currentIndex + 1 }}. {{ currentQuestion.questionText }}</h2>
          <el-radio-group v-if="isSingle(currentQuestion)" v-model="draftAnswer" :disabled="isLocked" @change="scheduleSave">
            <el-radio v-for="option in currentQuestion.options || []" :key="optionValue(option)" :value="optionValue(option)">{{ optionLabel(option) }}</el-radio>
          </el-radio-group>
          <el-checkbox-group v-else-if="isMultiple(currentQuestion)" v-model="draftAnswer" :disabled="isLocked" @change="scheduleSave">
            <el-checkbox v-for="option in currentQuestion.options || []" :key="optionValue(option)" :value="optionValue(option)">{{ optionLabel(option) }}</el-checkbox>
          </el-checkbox-group>
          <el-radio-group v-else-if="isTrueFalse(currentQuestion)" v-model="draftAnswer" :disabled="isLocked" @change="scheduleSave">
            <el-radio :value="true">{{ t("web.exam.true") }}</el-radio><el-radio :value="false">{{ t("web.exam.false") }}</el-radio>
          </el-radio-group>
          <el-input v-else-if="isText(currentQuestion)" v-model="draftAnswer" :type="isShortAnswer(currentQuestion) ? 'textarea' : 'text'" :rows="isShortAnswer(currentQuestion) ? 6 : 1" :disabled="isLocked" :placeholder="t('web.exam.enterAnswer')" @blur="saveCurrent" @input="scheduleSave" />
          <el-alert v-else type="error" :closable="false" :title="t('web.exam.unknownQuestionType')" />
          <p class="web-exam-answer__save" :class="saveState">{{ saveText }}</p>
          <div class="web-exam-answer__actions">
            <el-button :disabled="currentIndex === 0 || submitting" @click="switchQuestion(currentIndex - 1)">{{ t("web.exam.previousQuestion") }}</el-button>
            <div>
              <el-button type="primary" :loading="submitting" :disabled="submitting" @click="confirmSubmit">{{ t("web.exam.submit") }}</el-button>
              <el-button :disabled="currentIndex === questions.length - 1 || submitting" @click="switchQuestion(currentIndex + 1)">{{ t("web.exam.nextQuestion") }}</el-button>
            </div>
          </div>
        </article>
      </template>
      <el-alert v-if="isExpired" type="warning" :closable="false" :title="t('web.exam.timeEnded')" :description="autoSubmitError ? t('web.exam.autoSubmitUnconfirmed') : t('web.exam.autoSubmitting')" />
      <el-alert v-if="autoSubmitError" type="error" :closable="false" :title="autoSubmitError.message">
        <template #default><el-button text type="primary" :loading="submitting" @click="submitExam(true)">{{ t("web.exam.resubmit") }}</el-button></template>
      </el-alert>
    </section>
  </WebPageContainer>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import WebPageContainer from "@/layouts/webUser/components/WebPageContainer.vue";
import { getCurrentExamAttempt, saveUserExamAnswer, submitUserExam } from "@/services/webUser/exam.service";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute(); const router = useRouter();
const loading = ref(true); const loadError = ref(null); const attemptData = ref({ exam: null, attempt: null });
const questions = ref([]); const currentIndex = ref(0); const draftAnswer = ref(""); const saveState = ref("idle");
const remainingSeconds = ref(0); const submitting = ref(false); const autoSubmitError = ref(null);
let saveTimer; let countdownTimer; let savePromise = null; let autoSubmitStarted = false;
const currentQuestion = computed(() => questions.value[currentIndex.value]);
const answeredCount = computed(() => questions.value.filter((q) => q.userAnswer !== "" && q.userAnswer !== null && (!Array.isArray(q.userAnswer) || q.userAnswer.length)).length);
const isExpired = computed(() => remainingSeconds.value <= 0 || attemptData.value.attempt?.effectiveStatus === "expired");
const isLocked = computed(() => isExpired.value || submitting.value);
const formattedRemaining = computed(() => `${String(Math.floor(remainingSeconds.value / 60)).padStart(2, "0")}:${String(remainingSeconds.value % 60).padStart(2, "0")}`);
const type = (q) => ({ 单选题: "single_choice", 多选题: "multiple_choice", 判断题: "true_false", 填空题: "fill_blank", 问答题: "short_answer" }[q?.questionType] || q?.questionType);
const isSingle = (q) => type(q) === "single_choice"; const isMultiple = (q) => type(q) === "multiple_choice"; const isTrueFalse = (q) => type(q) === "true_false";
const isShortAnswer = (q) => type(q) === "short_answer"; const isText = (q) => ["fill_blank", "short_answer"].includes(type(q));
const optionValue = (option) => typeof option === "object" ? String(option.value ?? option.id ?? option.key ?? option.label) : String(option);
const optionLabel = (option) => typeof option === "object" ? String(option.label ?? option.text ?? option.value ?? option.id) : String(option);
const questionTypeLabel = (value) => t({ single_choice: "web.exam.singleChoice", multiple_choice: "web.exam.multipleChoice", true_false: "web.exam.trueFalse", fill_blank: "web.exam.fillBlankCount", short_answer: "web.exam.qaCount", 单选题: "web.exam.singleChoice", 多选题: "web.exam.multipleChoice", 判断题: "web.exam.trueFalse", 填空题: "web.exam.fillBlankCount", 问答题: "web.exam.qaCount" }[value] || "web.exam.unknownQuestionType");
const saveText = computed(() => saveState.value === "saving" ? t("web.exam.saving") : saveState.value === "saved" ? t("web.exam.saved") : saveState.value === "failed" ? t("web.exam.saveFailed") : "");
const cloneAnswer = (value) => Array.isArray(value) ? [...value] : value;
const syncDraft = () => { draftAnswer.value = currentQuestion.value?.userAnswer ?? (isMultiple(currentQuestion.value) ? [] : ""); };
const beginCountdown = () => { clearInterval(countdownTimer); const expiresAt = Date.parse(attemptData.value.attempt.expiresAt); const offset = Date.now() - Date.parse(attemptData.value.attempt.serverNow); const refresh = () => { const before = remainingSeconds.value; remainingSeconds.value = Math.max(0, Math.floor((expiresAt - (Date.now() - offset)) / 1000)); if (before > 0 && remainingSeconds.value === 0) submitExam(true); }; refresh(); countdownTimer = setInterval(refresh, 1000); };
const loadAttempt = async () => { loading.value = true; loadError.value = null; try { const data = await getCurrentExamAttempt(route.params.examId); attemptData.value = data; questions.value = data.questions.sort((a, b) => a.sortOrder - b.sortOrder); currentIndex.value = Math.max(0, questions.value.findIndex((q) => q.userAnswer === "" || q.userAnswer === null || (Array.isArray(q.userAnswer) && !q.userAnswer.length))); if (currentIndex.value < 0) currentIndex.value = 0; syncDraft(); beginCountdown(); if (data.attempt.effectiveStatus === "expired") submitExam(true); } catch (error) { loadError.value = error; } finally { loading.value = false; } };
const saveCurrent = async (force = false) => { clearTimeout(saveTimer); if (!currentQuestion.value || (!force && isLocked.value) || !["single_choice", "multiple_choice", "true_false", "fill_blank", "short_answer"].includes(type(currentQuestion.value))) return true; if (savePromise) { await savePromise; return saveCurrent(force); } const question = currentQuestion.value; const answer = cloneAnswer(draftAnswer.value); saveState.value = "saving"; savePromise = saveUserExamAnswer(route.params.examId, question.examQuestionId, answer).then((result) => { question.userAnswer = cloneAnswer(answer); question.answeredAt = result.answered_at; attemptData.value.attempt.answeredCount = result.answered_count; remainingSeconds.value = result.remaining_seconds; saveState.value = "saved"; return true; }).catch((error) => { saveState.value = "failed"; ElMessage.error(error?.message || t("web.exam.saveFailed")); return false; }).finally(() => { savePromise = null; }); return savePromise; };
const scheduleSave = () => { clearTimeout(saveTimer); if (!isLocked.value) saveTimer = setTimeout(saveCurrent, 700); };
const switchQuestion = async (index) => { if (index === currentIndex.value || submitting.value) return; const saved = await saveCurrent(); if (!saved) return; currentIndex.value = index; saveState.value = "idle"; syncDraft(); };
const submitExam = async (automatic = false) => { if (submitting.value || (automatic && autoSubmitStarted)) return; if (automatic) autoSubmitStarted = true; clearTimeout(saveTimer); submitting.value = true; autoSubmitError.value = null; try { if (!automatic) { const saved = await saveCurrent(true); if (!saved) throw new Error(t("web.exam.answerNotSaved")); } else if (savePromise) { await savePromise; } const result = await submitUserExam(route.params.examId); ElMessage.success(t("web.exam.submitSuccess")); await router.replace({ name: "WebUserExamResult", params: { examId: route.params.examId } }); return result; } catch (error) { if (automatic) { autoSubmitError.value = error; autoSubmitStarted = false; } else ElMessage.error(error?.message || t("web.exam.submitFailed")); return null; } finally { submitting.value = false; } };
const confirmSubmit = async () => { if (submitting.value) return; try { await ElMessageBox.confirm(`${t("web.exam.answered")}: ${answeredCount.value}\n${t("web.exam.unanswered")}: ${questions.value.length - answeredCount.value}\n${t("web.exam.remainingTime")}: ${formattedRemaining.value}\n${t("web.exam.submitIrreversible")}`, t("web.exam.submit"), { confirmButtonText: t("web.exam.submit"), cancelButtonText: t("common.cancel") }); await submitExam(false); } catch (error) { if (error !== "cancel" && error !== "close") ElMessage.error(error?.message || t("web.exam.submitFailed")); } };
const goBack = () => router.push({ name: "WebUserExam" });
onMounted(loadAttempt); onBeforeUnmount(() => { clearTimeout(saveTimer); clearInterval(countdownTimer); });
</script>

<style scoped lang="scss">
.web-exam-answer{display:grid;gap:16px}.web-exam-answer__header,.web-exam-answer__question{padding:20px;border:1px solid var(--web-line);border-radius:12px;background:var(--web-surface)}.web-exam-answer__header{display:flex;justify-content:space-between;gap:20px}.web-exam-answer__header h1{margin:8px 0}.web-exam-answer__timer{font-size:14px}.web-exam-answer__timer strong{display:block;font-size:26px}.is-expired{color:var(--el-color-danger)}.web-exam-answer__nav{display:flex;flex-wrap:wrap;gap:8px}.web-exam-answer__question h2{line-height:1.7}.web-exam-answer__type,.web-exam-answer__save{color:var(--web-text-secondary)}.web-exam-answer__question :deep(.el-radio-group),.web-exam-answer__question :deep(.el-checkbox-group){display:grid;gap:12px}.web-exam-answer__actions{display:flex;justify-content:space-between;gap:12px;margin-top:24px}.saving{color:var(--el-color-primary)}.saved{color:var(--el-color-success)}.failed{color:var(--el-color-danger)}
</style>
