<template>
  <div class="talent-page">
    <div class="filter-card">
      <div class="filter-left">
        <el-input
          v-model="query.keyword"
          clearable
          placeholder="请输入候选人姓名"
          class="search-input"
          @keyup.enter="handleSearch"
        />
      </div>

      <div class="filter-actions">
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>

        <el-button type="primary" @click="uploadVisible = true">
          <el-icon><UploadFilled /></el-icon>
          上传简历
        </el-button>
      </div>
    </div>

    <div class="table-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        row-key="resumeId"
        class="resume-table"
      >
        <el-table-column label="候选人" min-width="260">
          <template #default="scope">
            <div class="candidate-cell">
              <div class="candidate-avatar" :style="{ background: getAvatarColor(scope.$index) }">
                {{ getNameFirst(scope.row.candidateName) }}
              </div>

              <div class="candidate-info">
                <div class="candidate-name">
                  {{ scope.row.candidateName || '解析中' }}
                </div>
                <div class="candidate-desc">
                  {{ scope.row.skillSummary || scope.row.fileName || '--' }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="适配岗位" min-width="180">
          <template #default="scope">
            <span class="position-text">{{ scope.row.positionName || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="匹配度" width="120">
          <template #default="scope">
            <span
              v-if="scope.row.matchScore !== null && scope.row.matchScore !== undefined"
              class="score"
            >
              {{ scope.row.matchScore }}%
            </span>
            <span v-else class="empty-text">--</span>
          </template>
        </el-table-column>

        <el-table-column label="AI建议" width="160">
          <template #default="scope">
            <el-tag
              class="ai-tag"
              :type="adviceMap[scope.row.aiAdviceLevel]?.type || statusTagType(scope.row)"
            >
              {{ scope.row.aiAdviceLevel ? scope.row.aiAdviceLevel + ' ' : '' }}
              {{ scope.row.aiAdvice || statusText(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="结果" width="190">
          <template #default="scope">
            <el-select
              v-model="scope.row.manualResult"
              class="result-select"
              @change="(val) => saveResult(scope.row, val)"
            >
              <el-option label="待面试" value="pending_interview" />
              <el-option label="留用" value="retain" />
              <el-option label="复试" value="retest" />
              <el-option label="淘汰" value="reject" />
              <el-option label="待定" value="undecided" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              class="start-btn"
              @click="startInterview(scope.row)"
            >
              开始面试
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <span class="total-text">共 {{ total }} 条</span>

        <el-pagination
          background
          layout="sizes, prev, pager, next"
          :total="total"
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          @current-change="getList"
          @size-change="getList"
        />
      </div>
    </div>

    <el-dialog v-model="uploadVisible" title="上传简历" width="520px" destroy-on-close>
      <el-upload
        ref="uploadRef"
        drag
        multiple
        :auto-upload="false"
        :limit="10"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
      >
        <el-icon class="upload-icon"><UploadFilled /></el-icon>
        <div class="upload-text">拖拽简历到这里，或点击上传</div>

        <template #tip>
          <div class="upload-tip">
            支持 PDF / DOCX / JPG / PNG / WEBP，单次最多上传 10 份。
            候选人、适配岗位、匹配度、AI建议由后端自动生成。
          </div>
        </template>
      </el-upload>

      <template #footer>
        <el-button @click="closeUpload">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="submitUpload">
          上传并分析
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Refresh, UploadFilled } from "@element-plus/icons-vue";
import {
  getTalentResumeList,
  getTalentResumeProcessStatus,
  saveTalentInterviewResult,
  uploadTalentResume,
} from "@/services/talent.service";

const router = useRouter();
const loading = ref(false);
const uploading = ref(false);
const uploadVisible = ref(false);
const uploadRef = ref();
const selectedFiles = ref([]);
const tableData = ref([]);
const total = ref(0);
const pollingTimer = ref(null);

const query = reactive({
  keyword: "",
  page: 1,
  pageSize: 10,
});

const adviceMap = {
  A: { type: "success" },
  B: { type: "primary" },
  C: { type: "warning" },
  D: { type: "danger" },
};

function getNameFirst(name) {
  return name ? name.slice(0, 1) : "?";
}

function getAvatarColor(index) {
  const colors = [
    "linear-gradient(135deg, #3b82f6, #60a5fa)",
    "linear-gradient(135deg, #7c3aed, #a78bfa)",
    "linear-gradient(135deg, #f59e0b, #fbbf24)",
    "linear-gradient(135deg, #14b8a6, #2dd4bf)",
    "linear-gradient(135deg, #2563eb, #818cf8)",
  ];

  return colors[index % colors.length];
}

function statusText(row) {
  if (row.parseStatus === "failed" || row.screenStatus === "failed" || row.questionStatus === "failed") return "解析失败";
  if (row.parseStatus === "processing" || row.screenStatus === "processing" || row.questionStatus === "processing") return "分析中";
  if (row.parseStatus === "pending") return "等待分析";
  return "--";
}

function statusTagType(row) {
  if (
    row.parseStatus === "failed" ||
    row.screenStatus === "failed" ||
    row.questionStatus === "failed"
  ) {
    return "danger";
  }

  if (
    row.parseStatus === "processing" ||
    row.screenStatus === "processing" ||
    row.questionStatus === "processing"
  ) {
    return "warning";
  }

  return "info";
}

async function getList() {
  loading.value = true;

  try {
    const params = {
      page: query.page,
      pageSize: query.pageSize,
    };

    if (query.keyword) {
      params.keyword = query.keyword;
    }

    const res = await getTalentResumeList(params);

    if (res.data?.is_success) {
      const pageData = res.data?.data || {};
      const list = pageData.list || pageData.records || pageData.rows || [];

      tableData.value = list;
      total.value = pageData.total ?? list.length;

      console.log("简历列表返回：", pageData);
      console.log("简历表格数据：", tableData.value);

      setupPolling();
    } else {
      ElMessage.error(res.data?.msg || "简历列表加载失败");
    }
  } catch (error) {
    console.error("简历列表加载失败：", error);
    ElMessage.error("简历列表加载失败");
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  query.page = 1;
  getList();
}

function handleRefresh() {
  query.keyword = "";
  query.page = 1;
  getList();
}

function resetQuery() {
  query.keyword = "";
  query.page = 1;
  getList();
}

function closeUpload() {
  uploadVisible.value = false;
  selectedFiles.value = [];
  uploadRef.value?.clearFiles();
}

function handleFileChange(file, fileList) {
  selectedFiles.value = fileList.map((item) => item.raw).filter(Boolean);
}

function handleFileRemove(file, fileList) {
  selectedFiles.value = fileList.map((item) => item.raw).filter(Boolean);
}

async function submitUpload() {
  if (!selectedFiles.value.length) {
    ElMessage.warning("请先选择简历文件");
    return;
  }

  if (selectedFiles.value.length > 10) {
    ElMessage.warning("单次最多上传 10 份简历");
    return;
  }

  uploading.value = true;

  try {
    const formData = new FormData();

    selectedFiles.value.forEach((file) => {
      // 如果后端批量字段名是 files，用这一行
      formData.append("files", file);

      // 如果后端仍然要求字段名叫 file，就把上一行改成：
      // formData.append("file", file);
    });

    const res = await uploadTalentResume(formData);

    if (res.data?.is_success) {
      ElMessage.success("上传成功，正在自动分析");
      uploadVisible.value = false;
      selectedFiles.value = [];
      uploadRef.value?.clearFiles();
      query.page = 1;
      getList();
    } else {
      ElMessage.error(res.data?.msg || "上传失败");
    }
  } catch (error) {
    ElMessage.error("上传失败");
  } finally {
    uploading.value = false;
  }
}

async function saveResult(row, manualResult) {
  try {
    const res = await saveTalentInterviewResult(row.resumeId, { manualResult, remark: "" });
    if (res.data?.is_success) {
      ElMessage.success("结果已保存");
    } else {
      ElMessage.error(res.data?.msg || "结果保存失败");
      getList();
    }
  } catch (error) {
    ElMessage.error("结果保存失败");
    getList();
  }
}

function startInterview(row) {
  console.log("开始面试 row:", row);

  if (!row.resumeId) {
    ElMessage.warning("缺少简历ID，无法开始面试");
    return;
  }

  if (row.questionStatus !== "success") {
    ElMessage.warning("面试题还未生成完成，请稍后再试");
    return;
  }

  router.push({
    name: "TalentInterview",
    params: {
      resumeId: row.resumeId,
    },
  });
}

function setupPolling() {
  const hasProcessing = tableData.value.some((item) => {
    return [item.parseStatus, item.screenStatus, item.questionStatus].some((status) => ["pending", "processing"].includes(status));
  });
  if (!hasProcessing) {
    clearInterval(pollingTimer.value);
    pollingTimer.value = null;
    return;
  }
  if (pollingTimer.value) return;
  pollingTimer.value = setInterval(async () => {
    const processingRows = tableData.value.filter((item) => [item.parseStatus, item.screenStatus, item.questionStatus].some((status) => ["pending", "processing"].includes(status)));
    for (const row of processingRows) {
      try {
        const res = await getTalentResumeProcessStatus(row.resumeId);
        if (res.data?.is_success) {
          Object.assign(row, res.data.data || {});
        }
      } catch (error) {}
    }
    const stillProcessing = tableData.value.some((item) => [item.parseStatus, item.screenStatus, item.questionStatus].some((status) => ["pending", "processing"].includes(status)));
    if (!stillProcessing) {
      clearInterval(pollingTimer.value);
      pollingTimer.value = null;
      getList();
    }
  }, 3000);
}

onMounted(getList);
onUnmounted(() => {
  if (pollingTimer.value) clearInterval(pollingTimer.value);
});
</script>

<style scoped>
.talent-page {
  padding: 24px 28px;
  background: #f5f7fb;
  min-height: calc(100vh - 64px);
  color: #303133;
}

.filter-card,
.table-card {
  max-width: 1360px;
  margin-left: auto;
  margin-right: auto;
}

.filter-card {
  height: 76px;
  padding: 0 24px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 330px;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-actions :deep(.el-button) {
  min-width: 96px;
  height: 40px;
  border-radius: 4px;
  font-weight: 500;
}

.table-card {
  padding: 20px 24px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.resume-table {
  width: 100%;
  border: 1px solid #ebeef5;
  border-bottom: none;
}

:deep(.resume-table .el-table__header th) {
  background: #f5f7fa !important;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  height: 48px;
}

:deep(.resume-table .el-table__cell) {
  border-color: #ebeef5 !important;
}

:deep(.resume-table .el-table__row) {
  height: 76px;
}

.candidate-cell {
  display: flex;
  align-items: center;
  gap: 14px;
}

.candidate-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.candidate-info {
  min-width: 0;
}

.candidate-name {
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.candidate-desc {
  max-width: 240px;
  margin-top: 4px;
  color: #606266;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.position-text {
  color: #303133;
  font-size: 13px;
  font-weight: 500;
}

.score {
  color: #16a34a;
  font-size: 14px;
  font-weight: 700;
}

.ai-tag {
  height: 28px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.result-select {
  width: 118px;
}

.result-select :deep(.el-select__wrapper) {
  min-height: 32px;
  border-radius: 4px;
  font-size: 13px;
}

.result-select :deep(.el-select__placeholder),
.result-select :deep(.el-select__selected-item) {
  font-size: 13px;
}

.start-btn {
  padding: 0;
  font-size: 13px;
  font-weight: 500;
}

.empty-text {
  color: #909399;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  margin-top: 24px;
}

.total-text {
  color: #606266;
  font-size: 14px;
}

.upload-icon {
  font-size: 44px;
  color: #2563eb;
}

.upload-text {
  font-size: 16px;
  color: #303133;
  margin-top: 8px;
}

.upload-tip {
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
}
</style>
