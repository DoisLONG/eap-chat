<template>
  <div class="talent-page">
    <div class="page-toolbar">
      <div class="breadcrumb-text">
        陪练管理端 / 人才评估 / <span>人才库</span>
      </div>

      <el-button type="primary" class="upload-btn" @click="goToResumeUpload">
        <el-icon><Upload /></el-icon>
        上传简历
      </el-button>
    </div>

    <div class="stat-grid">
      <div
        v-for="item in statCards"
        :key="item.key"
        class="stat-card clickable-card"
        :class="item.cardClass"
        @click="handleCardClick(item)"
      >
        <div class="stat-content">
          <div class="stat-label">{{ item.label }}</div>

          <div class="stat-value">
            {{ item.value }}
          </div>

          <div class="stat-sub">
            {{ item.sub }}
          </div>

          <div class="stat-link">
            点击查看
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <div class="stat-visual">
          <div class="stat-icon" :class="item.iconClass">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="dot-bg"></div>
        </div>
      </div>
    </div>

    <div class="flow-card">
      <div class="flow-header">
        <div class="flow-title">人才库流程</div>
        <div class="flow-desc">
          岗位维护、简历入库、AI 解析匹配、面试评估形成闭环。
        </div>
      </div>

      <div class="flow-list">
        <div class="flow-item clickable-card" @click="goToJob">
          <div class="step-badge">1</div>

          <div class="step-icon icon-blue">
            <el-icon><Briefcase /></el-icon>
          </div>

          <div class="step-content">
            <div class="step-title">维护岗位</div>
            <div class="step-desc">
              创建和管理招聘岗位信息，设置岗位要求与评估标准。
            </div>
          </div>
        </div>

        <div class="flow-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>

        <div class="flow-item clickable-card" @click="goToResumeUpload">
          <div class="step-badge">2</div>

          <div class="step-icon icon-green">
            <el-icon><UploadFilled /></el-icon>
          </div>

          <div class="step-content">
            <div class="step-title">上传简历</div>
            <div class="step-desc">
              上传候选人简历，系统自动解析并进入人才库。
            </div>
          </div>
        </div>

        <div class="flow-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>

        <div class="flow-item clickable-card" @click="goToPendingInterview">
          <div class="step-badge">3</div>

          <div class="step-icon icon-purple">
            <el-icon><ChatDotRound /></el-icon>
          </div>

          <div class="step-content">
            <div class="step-title">开始面试</div>
            <div class="step-desc">
              筛选候选人并安排面试，记录面试评价与最终结果。
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="recent-card">
      <div class="panel-header">
        <div>
          <div class="panel-title">最近简历上传</div>
          <div class="panel-desc">查看最新入库候选人的解析状态和适配岗位。</div>
        </div>

        <el-button type="primary" link @click="goToResume">
          查看全部
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>

      <el-table
        :data="recentResumes"
        v-loading="loading"
        class="recent-table"
        empty-text="暂无简历数据"
      >
        <el-table-column label="候选人" min-width="220">
          <template #default="scope">
            <div class="candidate-cell">
              <div class="candidate-avatar" :style="{ background: getAvatarColor(scope.$index) }">
                {{ getNameFirst(scope.row.candidateName) }}
              </div>

              <div class="candidate-info">
                <div class="candidate-name">
                  {{ scope.row.candidateName || "解析中" }}
                </div>
                <div class="candidate-sub">
                  {{ scope.row.phone || scope.row.fileName || "--" }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="岗位" min-width="180">
          <template #default="scope">
            <div class="position-name">
              {{ scope.row.positionName || "--" }}
            </div>
            <div class="position-sub">
              {{ scope.row.departmentName || "暂无部门" }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="匹配度" width="120">
          <template #default="scope">
            <span
              v-if="scope.row.matchScore !== null && scope.row.matchScore !== undefined"
              class="score-text"
            >
              {{ scope.row.matchScore }}%
            </span>
            <span v-else class="empty-text">--</span>
          </template>
        </el-table-column>

        <el-table-column label="解析状态" width="140">
          <template #default="scope">
            <span class="status-dot" :class="statusClass(scope.row)"></span>
            <span class="status-text">{{ statusText(scope.row) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button type="primary" link @click="goToResumeDetail(scope.row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowRight,
  Briefcase,
  ChatDotRound,
  Document,
  List,
  Upload,
  UploadFilled,
  UserFilled,
} from "@element-plus/icons-vue";
import {
  getTalentDashboardSummary,
  getTalentPositionList,
  getTalentResumeList,
} from "@/services/talent.service";

const router = useRouter();

const loading = ref(false);
const recentResumes = ref([]);

const summary = reactive({
  positionCount: 0,
  resumeCount: 0,
  pendingInterviewCount: 0,
  processedResumeCount: 0,
});

const statCards = computed(() => [
  {
    key: "position",
    label: "岗位数量",
    value: summary.positionCount || 0,
    sub: "招聘岗位",
    icon: Briefcase,
    iconClass: "icon-blue",
    cardClass: "card-blue",
  },
  {
    key: "resume",
    label: "候选人",
    value: summary.resumeCount || 0,
    sub: "已上传简历",
    icon: UserFilled,
    iconClass: "icon-green",
    cardClass: "card-green",
  },
  {
    key: "pendingInterview",
    label: "待面试",
    value: summary.pendingInterviewCount || 0,
    sub: "默认结果",
    icon: List,
    iconClass: "icon-orange",
    cardClass: "card-orange",
  },
  {
    key: "processedResume",
    label: "已处理简历",
    value: summary.processedResumeCount || 0,
    sub: "解析完成",
    icon: Document,
    iconClass: "icon-purple",
    cardClass: "card-purple",
  },
]);

function handleCardClick(item) {
  if (item.key === "position") {
    goToJob();
    return;
  }

  if (item.key === "resume") {
    goToResume();
    return;
  }

  if (item.key === "pendingInterview") {
    goToPendingInterview();
    return;
  }

  if (item.key === "processedResume") {
    router.push({
      path: "/talent/resume",
      query: {
        parseStatus: "success",
      },
    });
  }
}

function goToJob() {
  router.push("/talent/job");
}

function goToResume() {
  router.push("/talent/resume");
}

function goToResumeUpload() {
  router.push({
    path: "/talent/resume",
    query: {
      action: "upload",
    },
  });
}

function goToPendingInterview() {
  router.push({
    path: "/talent/resume",
    query: {
      manualResult: "pending_interview",
    },
  });
}

function goToResumeDetail(row) {
  if (!row?.resumeId) {
    goToResume();
    return;
  }

  router.push({
    path: "/talent/resume",
    query: {
      resumeId: row.resumeId,
    },
  });
}

function getNameFirst(name) {
  return name ? name.slice(0, 1) : "?";
}

function getAvatarColor(index) {
  const colors = [
    "linear-gradient(135deg, #2563eb, #60a5fa)",
    "linear-gradient(135deg, #16a34a, #4ade80)",
    "linear-gradient(135deg, #f59e0b, #fbbf24)",
    "linear-gradient(135deg, #7c3aed, #a78bfa)",
    "linear-gradient(135deg, #14b8a6, #2dd4bf)",
  ];

  return colors[index % colors.length];
}

function statusText(row) {
  if (
    row.parseStatus === "failed" ||
    row.screenStatus === "failed" ||
    row.questionStatus === "failed"
  ) {
    return "解析失败";
  }

  if (
    row.parseStatus === "processing" ||
    row.screenStatus === "processing" ||
    row.questionStatus === "processing"
  ) {
    return "分析中";
  }

  if (
    row.parseStatus === "pending" ||
    row.screenStatus === "pending" ||
    row.questionStatus === "pending"
  ) {
    return "等待分析";
  }

  return "解析完成";
}

function statusClass(row) {
  if (
    row.parseStatus === "failed" ||
    row.screenStatus === "failed" ||
    row.questionStatus === "failed"
  ) {
    return "dot-danger";
  }

  if (
    row.parseStatus === "processing" ||
    row.screenStatus === "processing" ||
    row.questionStatus === "processing"
  ) {
    return "dot-warning";
  }

  if (
    row.parseStatus === "pending" ||
    row.screenStatus === "pending" ||
    row.questionStatus === "pending"
  ) {
    return "dot-info";
  }

  return "dot-success";
}

async function getDashboardData() {
  loading.value = true;

  try {
    const [summaryRes, resumeRes, positionRes] = await Promise.all([
      getTalentDashboardSummary(),
      getTalentResumeList({
        page: 1,
        pageSize: 5,
      }),
      getTalentPositionList({
        page: 1,
        pageSize: 1,
      }),
    ]);

    if (summaryRes.data?.is_success) {
      const data = summaryRes.data.data || {};

      summary.positionCount =
        data.positionCount ??
        data.positionTotal ??
        data.totalPositionCount ??
        0;

      summary.resumeCount =
        data.resumeCount ??
        data.resumeTotal ??
        data.totalResumeCount ??
        0;

      summary.pendingInterviewCount =
        data.pendingInterviewCount ??
        data.pendingCount ??
        data.waitInterviewCount ??
        0;

      summary.processedResumeCount =
        data.processedResumeCount ??
        data.parsedResumeCount ??
        data.successResumeCount ??
        data.resumeProcessedCount ??
        0;
    }

    if (resumeRes.data?.is_success) {
      const pageData = resumeRes.data.data || {};
      const list = pageData.list || pageData.records || pageData.rows || [];

      recentResumes.value = list;

      if (!summary.resumeCount) {
        summary.resumeCount = pageData.total ?? list.length;
      }

      if (!summary.processedResumeCount) {
        summary.processedResumeCount = list.filter((item) => {
          return (
            item.parseStatus === "success" &&
            item.screenStatus === "success" &&
            item.questionStatus === "success"
          );
        }).length;
      }

      if (!summary.pendingInterviewCount) {
        summary.pendingInterviewCount = list.filter((item) => {
          return item.manualResult === "pending_interview";
        }).length;
      }
    }

    if (positionRes.data?.is_success && !summary.positionCount) {
      const pageData = positionRes.data.data || {};
      summary.positionCount = pageData.total ?? 0;
    }
  } catch (error) {
    console.error("人才库首页数据加载失败：", error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  getDashboardData();
});
</script>

<style scoped>
.talent-page {
  padding: 24px 28px;
  background: #f5f7fb;
  min-height: calc(100vh - 64px);
  color: #303133;
}

.page-toolbar,
.stat-grid,
.flow-card,
.recent-card {
  max-width: 1360px;
  margin-left: auto;
  margin-right: auto;
}

.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.breadcrumb-text {
  color: #606266;
  font-size: 14px;
  line-height: 22px;
}

.breadcrumb-text span {
  color: #2563eb;
  font-weight: 600;
}

.upload-btn {
  height: 40px;
  min-width: 118px;
  border-radius: 4px;
  font-weight: 500;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.stat-card {
  position: relative;
  height: 176px;
  padding: 26px 28px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 10px 26px rgba(31, 45, 61, 0.06);
  overflow: hidden;
  display: flex;
  justify-content: space-between;
}

.stat-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 96px;
  height: 3px;
  border-radius: 0 0 4px 0;
}

.card-blue::before {
  background: #2563eb;
}

.card-green::before {
  background: #16a34a;
}

.card-orange::before {
  background: #f59e0b;
}

.card-purple::before {
  background: #7c3aed;
}

.clickable-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-card:hover {
  transform: translateY(-3px);
  border-color: #409eff;
  box-shadow: 0 14px 32px rgba(37, 99, 235, 0.14);
}

.stat-content {
  position: relative;
  z-index: 2;
}

.stat-label {
  color: #303133;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
}

.stat-value {
  margin-top: 18px;
  color: #2563eb;
  font-size: 36px;
  font-weight: 800;
  line-height: 42px;
}

.stat-sub {
  margin-top: 8px;
  color: #606266;
  font-size: 13px;
  line-height: 20px;
}

.stat-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 20px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 500;
}

.stat-visual {
  position: relative;
  width: 120px;
  height: 120px;
  margin-top: 8px;
  flex-shrink: 0;
}

.stat-icon {
  position: absolute;
  right: 8px;
  top: 18px;
  z-index: 2;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon :deep(.el-icon) {
  font-size: 34px;
}

.icon-blue {
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.22);
}

.icon-green {
  background: linear-gradient(135deg, #16a34a, #4ade80);
  box-shadow: 0 10px 24px rgba(22, 163, 74, 0.22);
}

.icon-orange {
  background: linear-gradient(135deg, #f59e0b, #fb923c);
  box-shadow: 0 10px 24px rgba(245, 158, 11, 0.22);
}

.icon-purple {
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  box-shadow: 0 10px 24px rgba(124, 58, 237, 0.22);
}

.dot-bg {
  position: absolute;
  right: -12px;
  bottom: -12px;
  width: 90px;
  height: 90px;
  opacity: 0.22;
  background-image: radial-gradient(#94a3b8 1px, transparent 1px);
  background-size: 9px 9px;
}

.flow-card {
  margin-top: 20px;
  padding: 24px 28px 28px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 10px 26px rgba(31, 45, 61, 0.06);
}

.flow-header {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  margin-bottom: 20px;
}

.flow-title {
  color: #303133;
  font-size: 20px;
  font-weight: 800;
  line-height: 28px;
}

.flow-desc {
  color: #909399;
  font-size: 13px;
  line-height: 20px;
}

.flow-list {
  display: grid;
  grid-template-columns: 1fr 36px 1fr 36px 1fr;
  align-items: center;
  gap: 14px;
}

.flow-item {
  position: relative;
  min-height: 124px;
  padding: 22px 24px 22px 120px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}

.step-badge {
  position: absolute;
  left: 26px;
  top: 20px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}

.step-icon {
  position: absolute;
  left: 36px;
  bottom: 22px;
  width: 58px;
  height: 58px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-icon :deep(.el-icon) {
  font-size: 28px;
}

.step-content {
  min-width: 0;
}

.step-title {
  color: #303133;
  font-size: 17px;
  font-weight: 700;
  line-height: 26px;
}

.step-desc {
  margin-top: 8px;
  color: #606266;
  font-size: 13px;
  line-height: 22px;
}

.flow-arrow {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
}

.recent-card {
  margin-top: 20px;
  padding: 22px 26px 26px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 10px 26px rgba(31, 45, 61, 0.06);
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-title {
  color: #303133;
  font-size: 18px;
  font-weight: 800;
  line-height: 26px;
}

.panel-desc {
  margin-top: 4px;
  color: #909399;
  font-size: 13px;
  line-height: 20px;
}

.recent-table {
  width: 100%;
  border: 1px solid #ebeef5;
  border-bottom: none;
}

:deep(.recent-table .el-table__header th) {
  background: #f5f7fa !important;
  color: #303133;
  font-size: 13px;
  font-weight: 600;
  height: 46px;
}

:deep(.recent-table .el-table__row) {
  height: 72px;
}

.candidate-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.candidate-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.candidate-name,
.position-name {
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.candidate-sub,
.position-sub {
  margin-top: 3px;
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}

.score-text {
  color: #16a34a;
  font-size: 15px;
  font-weight: 700;
}

.status-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 8px;
  border-radius: 50%;
  vertical-align: middle;
}

.dot-success {
  background: #16a34a;
}

.dot-warning {
  background: #f59e0b;
}

.dot-danger {
  background: #ef4444;
}

.dot-info {
  background: #909399;
}

.status-text {
  color: #606266;
  font-size: 13px;
}

.empty-text {
  color: #909399;
}

@media (max-width: 1280px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .flow-list {
    grid-template-columns: 1fr;
  }

  .flow-arrow {
    transform: rotate(90deg);
  }
}
</style>
