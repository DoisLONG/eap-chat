<template>
  <div class="talent-page">
    <el-card shadow="never" class="profile-card" v-loading="loading">
      <div class="profile-top-row">
        <div class="candidate-block">
          <div class="avatar">
            {{ candidate.candidateName?.slice(0, 1) || "?" }}
          </div>

          <div class="candidate-main">
            <div class="candidate-name-row">
              <span class="candidate-name">{{ candidate.candidateName || "--" }}</span>
              <el-tag size="small" type="info" effect="plain">候选人</el-tag>
            </div>

            <div class="candidate-desc">
              {{ candidate.skillSummary || "暂无候选人技能摘要" }}
            </div>
          </div>
        </div>

        <div class="meta-cards">
          <div class="meta-card">
            <div class="meta-label">适配岗位</div>
            <div class="meta-value">{{ candidate.positionName || "--" }}</div>
          </div>

          <div class="meta-card">
            <div class="meta-label">匹配度</div>
            <div class="meta-value score-value">
              {{ candidate.matchScore ?? "--" }}{{ candidate.matchScore !== null && candidate.matchScore !== undefined ? "%" : "" }}
            </div>
          </div>

          <div class="meta-card">
            <div class="meta-label">AI建议</div>
            <div class="meta-value advice-value">
              {{ candidate.aiAdviceLevel ? candidate.aiAdviceLevel + " " : "" }}{{ candidate.aiAdvice || "--" }}
            </div>
          </div>

          <div class="meta-card result-card">
            <div class="meta-label">结果</div>
            <el-select
              v-model="candidate.manualResult"
              class="result-select"
              size="small"
            >
              <el-option label="待面试" value="pending_interview" />
              <el-option label="留用" value="retain" />
              <el-option label="复试" value="retest" />
              <el-option label="淘汰" value="reject" />
              <el-option label="待定" value="undecided" />
            </el-select>
          </div>
        </div>
      </div>

      <div class="ai-summary" v-if="candidate.aiSummary">
        <div class="summary-title">AI摘要</div>
        <div class="summary-content">
          {{ candidate.aiSummary }}
        </div>
      </div>

      <div class="card-actions">
        <el-button @click="back">返回简历管理</el-button>
      </div>
    </el-card>

    <el-card shadow="never" class="question-card">
      <div class="question-header">
        <div>
          <div class="section-title">面试题</div>
          <div class="section-desc">
            无需复核题目，也不记录回答。按顺序展示，管理员可现场挑选提问。
          </div>
        </div>

        <div class="question-actions">
          <el-select
            v-model="questionType"
            clearable
            placeholder="全部类型"
            class="question-type-select"
          >
            <el-option label="项目经历" value="project" />
            <el-option label="技术基础" value="technical" />
            <el-option label="岗位理解" value="job_understanding" />
            <el-option label="HR" value="hr" />
          </el-select>

          <el-button @click="regenerate" :loading="regenerating">
            重新生成题目
          </el-button>
        </div>
      </div>

      <div v-if="filteredQuestions.length" class="question-list">
        <div
          class="question-item"
          v-for="(item, index) in filteredQuestions"
          :key="item.questionId || index"
        >
          <div class="question-no">
            {{ index + 1 }}
          </div>

          <div class="question-content">
            <div class="question-main-row">
              <el-tag size="small" effect="plain" class="question-type-tag">
                {{ questionTypeMap[item.questionType] || item.questionType || "面试题" }}
              </el-tag>

              <div class="question-text">
                {{ item.questionText || "--" }}
              </div>
            </div>

            <div class="question-note" v-if="item.questionNote">
              <span>参考要点：</span>{{ item.questionNote }}
            </div>
          </div>
        </div>
      </div>

      <el-empty v-else description="暂无面试题" />
    </el-card>

    <div class="bottom-bar">
      <el-button @click="back">取消</el-button>
      <el-button type="primary" :loading="saving" @click="saveResult">
        保存结果
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  getTalentInterviewPackage,
  regenerateTalentQuestions,
  saveTalentInterviewResult,
} from "@/services/talent.service";

const router = useRouter();
const route = useRoute();

const resumeId = route.params.resumeId;

const loading = ref(false);
const saving = ref(false);
const regenerating = ref(false);
const questions = ref([]);
const questionType = ref("");

const candidate = reactive({
  resumeId: "",
  candidateId: "",
  candidateName: "",
  skillSummary: "",
  positionName: "",
  matchScore: null,
  aiAdviceLevel: "",
  aiAdvice: "",
  aiSummary: "",
  manualResult: "pending_interview",
});

const questionTypeMap = {
  project: "项目经历",
  technical: "技术基础",
  job_understanding: "岗位理解",
  hr: "HR",
};

const filteredQuestions = computed(() => {
  if (!questionType.value) {
    return questions.value || [];
  }

  return (questions.value || []).filter((item) => {
    return item.questionType === questionType.value;
  });
});

async function getDetail() {
  if (!resumeId) {
    ElMessage.error("缺少简历ID，无法加载面试题");
    back();
    return;
  }

  loading.value = true;

  try {
    const res = await getTalentInterviewPackage(resumeId);

    if (res.data?.is_success) {
      const detail = res.data.data || {};

      Object.assign(candidate, {
        resumeId: detail.resumeId || "",
        candidateId: detail.candidateId || "",
        candidateName: detail.candidateName || "",
        skillSummary: detail.skillSummary || "",
        positionName: detail.positionName || "",
        matchScore: detail.matchScore ?? null,
        aiAdviceLevel: detail.aiAdviceLevel || "",
        aiAdvice: detail.aiAdvice || "",
        aiSummary: detail.aiSummary || "",
        manualResult: detail.manualResult || "pending_interview",
      });

      questions.value = detail.questions || [];
    } else {
      ElMessage.error(res.data?.msg || "面试信息加载失败");
    }
  } catch (error) {
    console.error("面试信息加载失败：", error);
    ElMessage.error("面试信息加载失败");
  } finally {
    loading.value = false;
  }
}

async function regenerate() {
  if (!resumeId) {
    ElMessage.error("缺少简历ID，无法重新生成题目");
    return;
  }

  regenerating.value = true;

  try {
    const res = await regenerateTalentQuestions(resumeId);

    if (res.data?.is_success) {
      ElMessage.success("已重新生成题目");
      await getDetail();
    } else {
      ElMessage.error(res.data?.msg || "重新生成失败");
    }
  } catch (error) {
    console.error("重新生成失败：", error);
    ElMessage.error("重新生成失败");
  } finally {
    regenerating.value = false;
  }
}

async function saveResult() {
  if (!resumeId) {
    ElMessage.error("缺少简历ID，无法保存结果");
    return;
  }

  saving.value = true;

  try {
    const res = await saveTalentInterviewResult(resumeId, {
      manualResult: candidate.manualResult,
      remark: "",
    });

    if (res.data?.is_success) {
      ElMessage.success("保存成功");
      back();
    } else {
      ElMessage.error(res.data?.msg || "保存失败");
    }
  } catch (error) {
    console.error("保存失败：", error);
    ElMessage.error("保存失败");
  } finally {
    saving.value = false;
  }
}

function back() {
  router.push("/talent/resume");
}

onMounted(getDetail);
</script>

<style scoped>
.talent-page {
  padding: 24px 28px 88px;
  background: #f5f7fb;
  min-height: calc(100vh - 64px);
  color: #303133;
}

.profile-card,
.question-card {
  max-width: 1360px;
  margin-left: auto;
  margin-right: auto;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.profile-card {
  margin-bottom: 16px;
}

.profile-top-row {
  display: grid;
  grid-template-columns: minmax(360px, 1fr) auto;
  gap: 24px;
  align-items: center;
}

.candidate-block {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  flex-shrink: 0;
}

.candidate-main {
  min-width: 0;
}

.candidate-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.candidate-name {
  color: #303133;
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
}

.candidate-desc {
  max-width: 520px;
  color: #606266;
  font-size: 14px;
  line-height: 24px;
}

.meta-cards {
  display: grid;
  grid-template-columns: repeat(4, 150px);
  gap: 12px;
}

.meta-card {
  height: 82px;
  padding: 12px 14px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fafafa;
}

.meta-label {
  margin-bottom: 8px;
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}

.meta-value {
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.score-value {
  color: #16a34a;
  font-size: 22px;
  font-weight: 700;
}

.advice-value {
  color: #303133;
}

.result-card {
  padding-bottom: 10px;
}

.result-select {
  width: 118px;
}

.result-select :deep(.el-select__wrapper) {
  min-height: 32px;
  border-radius: 4px;
  font-size: 13px;
}

.ai-summary {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 18px;
  margin-top: 18px;
  padding: 14px 18px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fafafa;
}

.summary-title {
  color: #2563eb;
  font-size: 14px;
  font-weight: 700;
}

.summary-content {
  color: #606266;
  font-size: 14px;
  line-height: 24px;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.question-card {
  padding: 22px 24px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.section-title {
  color: #303133;
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
}

.section-desc {
  margin-top: 6px;
  color: #606266;
  font-size: 13px;
  line-height: 20px;
}

.question-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.question-type-select {
  width: 160px;
}

.question-actions :deep(.el-button) {
  height: 36px;
  border-radius: 4px;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-item {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fff;
}

.question-no {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #ecf5ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
}

.question-content {
  min-width: 0;
}

.question-main-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.question-type-tag {
  flex-shrink: 0;
  margin-top: 2px;
}

.question-text {
  color: #303133;
  font-size: 15px;
  font-weight: 600;
  line-height: 26px;
}

.question-note {
  margin-top: 12px;
  padding: 10px 12px;
  background: #f7f8fa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  color: #606266;
  font-size: 13px;
  line-height: 22px;
}

.question-note span {
  color: #303133;
  font-weight: 600;
}

.bottom-bar {
  position: fixed;
  left: 320px;
  right: 0;
  bottom: 0;
  height: 68px;
  padding: 0 32px;
  background: rgba(255, 255, 255, 0.94);
  border-top: 1px solid #ebeef5;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  z-index: 20;
}

.bottom-bar :deep(.el-button) {
  min-width: 96px;
  height: 38px;
  border-radius: 4px;
  font-weight: 500;
}
</style>