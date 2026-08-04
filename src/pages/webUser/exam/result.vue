<template>
  <WebPageContainer>
    <section v-loading="loading" class="web-exam-result">
      <el-result v-if="error" icon="error" :title="error.message">
        <template #extra><el-button type="primary" @click="loadResult">{{ t("web.exam.refreshResult") }}</el-button></template>
      </el-result>
      <template v-else-if="result">
        <header class="web-exam-result__header">
          <div><el-button text @click="goBack">← {{ t("web.exam.backToList") }}</el-button><h1>{{ result.examName }}</h1></div>
          <el-button :loading="loading" @click="loadResult">{{ t("web.exam.refreshResult") }}</el-button>
        </header>
        <el-alert v-if="!result.resultReady" type="info" :closable="false" :title="t('web.exam.grading')" :description="t('web.exam.gradingPending')" />
        <template v-else>
          <section class="web-exam-result__summary">
            <div class="web-exam-result__score"><strong>{{ result.earnedScore }}</strong><span>/ {{ result.totalScore }}</span><em :class="result.passStatus">{{ result.passStatus === 'passed' ? t('web.exam.passed') : t('web.exam.failed') }}</em></div>
            <dl>
              <div><dt>{{ t("web.exam.correctCount") }}</dt><dd>{{ result.correctCount }}</dd></div><div><dt>{{ t("web.exam.wrongCount") }}</dt><dd>{{ result.wrongCount }}</dd></div><div><dt>{{ t("web.exam.unanswered") }}</dt><dd>{{ result.unansweredCount }}</dd></div><div><dt>{{ t("web.exam.accuracyRate") }}</dt><dd>{{ result.accuracyRate }}%</dd></div><div><dt>{{ t("web.exam.durationUsed") }}</dt><dd>{{ durationLabel }}</dd></div><div><dt>{{ t("web.exam.submittedAt") }}</dt><dd>{{ result.submittedAt || '--' }}</dd></div>
            </dl>
          </section>
          <section class="web-exam-result__questions"><h2>{{ t("web.exam.questionResult") }}</h2><article v-for="question in result.questions" :key="question.examQuestionId" :class="`is-${question.resultStatus}`"><header><strong>{{ question.sortOrder }}. {{ question.questionText }}</strong><span>{{ statusText(question.resultStatus) }}</span></header><p>{{ t("web.exam.userAnswer") }}: {{ answerLabel(question.userAnswer) }}</p><p>{{ t("web.exam.questionScore") }}: {{ question.earnedScore }} / {{ question.maxScore }}</p><template v-if="result.showAnswer"><p>{{ t("web.exam.correctAnswer") }}: {{ answerLabel(question.correctAnswer) }}</p><p v-if="question.answerAnalysis">{{ t("web.exam.answerAnalysis") }}: {{ question.answerAnalysis }}</p></template><p v-if="question.gradingAnalysis">{{ t("web.exam.gradingFeedback") }}: {{ question.gradingAnalysis }}</p></article></section>
        </template>
      </template>
    </section>
  </WebPageContainer>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import WebPageContainer from "@/layouts/webUser/components/WebPageContainer.vue";
import { getUserExamResult } from "@/services/webUser/exam.service";

const { t } = useI18n(); const route = useRoute(); const router = useRouter();
const loading = ref(true); const error = ref(null); const result = ref(null); let pollTimer; let failures = 0;
const durationLabel = computed(() => { const seconds = result.value?.durationSeconds || 0; return `${Math.floor(seconds / 60)} ${t("web.exam.minuteUnit")} ${seconds % 60}s`; });
const answerLabel = (answer) => Array.isArray(answer) ? answer.join(", ") : answer === true ? t("web.exam.true") : answer === false ? t("web.exam.false") : answer || "--";
const statusText = (status) => t({ correct: "web.exam.correct", wrong: "web.exam.incorrect", unanswered: "web.exam.unanswered", partial: "web.exam.partial", pending: "web.exam.grading" }[status] || "web.exam.grading");
const stopPolling = () => { clearTimeout(pollTimer); pollTimer = null; };
const schedulePolling = () => { stopPolling(); if (!result.value?.resultReady && failures < 3) pollTimer = setTimeout(loadResult, 4000); };
const loadResult = async () => { loading.value = true; error.value = null; try { result.value = await getUserExamResult(route.params.examId); failures = 0; schedulePolling(); } catch (requestError) { failures += 1; error.value = requestError; if (failures < 3) schedulePolling(); } finally { loading.value = false; } };
const goBack = () => router.push({ name: "WebUserExam" });
onMounted(loadResult); onBeforeUnmount(stopPolling);
</script>

<style scoped lang="scss">
.web-exam-result{display:grid;gap:16px}.web-exam-result__header,.web-exam-result__summary,.web-exam-result__questions{padding:20px;border:1px solid var(--web-line);border-radius:12px;background:var(--web-surface)}.web-exam-result__header{display:flex;justify-content:space-between;align-items:center;gap:16px}.web-exam-result__header h1{margin:8px 0 0}.web-exam-result__summary{display:grid;grid-template-columns:minmax(180px,.6fr) 2fr;gap:24px;align-items:center}.web-exam-result__score strong{font-size:42px;color:var(--el-color-primary)}.web-exam-result__score em{display:block;margin-top:8px;font-style:normal}.passed{color:var(--el-color-success)}.failed{color:var(--el-color-danger)}dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}dt,dd{margin:0}dt{color:var(--web-text-secondary);font-size:13px}dd{margin-top:5px;font-weight:600}.web-exam-result__questions{display:grid;gap:12px}.web-exam-result__questions h2{margin:0}.web-exam-result__questions article{padding:14px;border:1px solid var(--web-line);border-radius:10px}.web-exam-result__questions article header{display:flex;justify-content:space-between;gap:12px}.web-exam-result__questions article p{margin:8px 0 0}.is-correct{border-left:4px solid var(--el-color-success)!important}.is-wrong{border-left:4px solid var(--el-color-danger)!important}.is-unanswered,.is-pending{border-left:4px solid var(--el-color-warning)!important}@media(max-width:720px){.web-exam-result__summary{grid-template-columns:1fr}dl{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>
