<template>
  <div class="talent-page">
    <div class="filter-card">
      <div class="filter-left">
        <el-input
          v-model="query.keyword"
          clearable
          placeholder="请输入岗位名称"
          class="search-input"
          @keyup.enter="getList"
        />
        <el-select
          v-model="query.status"
          clearable
          placeholder="全部状态"
          class="status-select"
          @change="handleStatusChange"
          @clear="handleStatusChange"
        >
          <el-option label="招聘中" value="recruiting" />
          <el-option label="暂停收简历" value="paused" />
          <el-option label="已关闭" value="closed" />
        </el-select>
      </div>

      <div class="filter-actions">
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="openDialog()">
          新增岗位
        </el-button>
      </div>
    </div>

    <div class="table-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        row-key="positionId"
        class="position-table"
      >
        <el-table-column label="岗位名称" min-width="170">
          <template #default="scope">
            <div class="position-name">{{ scope.row.positionName || '--' }}</div>
            <div class="position-sub">
              {{ scope.row.employmentType || '实习' }} / {{ scope.row.workLocation || '--' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="departmentName" label="部门" min-width="120">
          <template #default="scope">
            {{ scope.row.departmentName || '--' }}
          </template>
        </el-table-column>

        <el-table-column prop="headcount" label="招聘人数" width="100">
          <template #default="scope">
            {{ scope.row.headcount ?? '--' }}
          </template>
        </el-table-column>

        <el-table-column label="必备技能" min-width="260">
          <template #default="scope">
            <div class="skill-tags" v-if="scope.row.requiredSkills?.length">
              <el-tag
                v-for="skill in scope.row.requiredSkills"
                :key="skill"
                class="skill-tag"
                type="info"
              >
                {{ skill }}
              </el-tag>
            </div>
            <span v-else class="empty-text">--</span>
          </template>
        </el-table-column>

        <el-table-column label="评分维度" min-width="260">
          <template #default="scope">
            <div v-if="scope.row.scoreDimensions?.length" class="dimension-text">
              <span
                v-for="(item, index) in scope.row.scoreDimensions"
                :key="index"
              >
                {{ item.name }}{{ item.weight }}%
                <i v-if="index < scope.row.scoreDimensions.length - 1"> / </i>
              </span>
            </div>
            <span v-else class="empty-text">--</span>
          </template>
        </el-table-column>

        <el-table-column label="候选人" width="100">
          <template #default="scope">
            <span class="candidate-count">{{ scope.row.candidateCount || 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="130">
          <template #default="scope">
            <el-tag
              :type="statusMap[scope.row.status]?.type || 'info'"
              class="status-tag"
            >
              {{ statusMap[scope.row.status]?.label || scope.row.status || '--' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="action-links">
              <el-button type="primary" link @click="openDialog(scope.row)">
                编辑
              </el-button>
              <el-button type="primary" link @click="goResume(scope.row)">
                查看候选人
              </el-button>
            </div>
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

    <el-dialog
      v-model="dialogVisible"
      :title="form.positionId ? '编辑岗位' : '新增岗位'"
      width="720px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-row :gutter="14">
          <el-col :span="12">
            <el-form-item label="岗位名称" prop="positionName">
              <el-input v-model="form.positionName" placeholder="请输入岗位名称" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="所属部门">
              <el-input v-model="form.departmentName" placeholder="请输入所属部门" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="招聘人数" prop="headcount">
              <el-input-number v-model="form.headcount" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="工作地点">
              <el-input v-model="form.workLocation" placeholder="例如：上海 / 武汉" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="必备技能">
          <el-select
            v-model="form.requiredSkills"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入后回车添加技能"
          >
            <el-option
              v-for="item in skillOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="岗位职责">
          <el-input
            v-model="form.duty"
            type="textarea"
            :rows="3"
            placeholder="填写岗位职责"
          />
        </el-form-item>

        <el-form-item label="任职要求 / 必备技能">
          <el-input
            v-model="form.requirement"
            type="textarea"
            :rows="3"
            placeholder="填写任职要求"
          />
        </el-form-item>

        <el-form-item label="评分维度">
          <div class="dimension-list">
            <div
              class="dimension-row"
              v-for="(item, index) in form.scoreDimensions"
              :key="index"
            >
              <el-input v-model="item.name" placeholder="维度名称" />
              <el-input-number v-model="item.weight" :min="0" :max="100" />
              <el-button text type="danger" @click="removeDimension(index)">
                删除
              </el-button>
            </div>
            <el-button @click="addDimension">添加评分维度</el-button>
          </div>
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio-button label="recruiting">招聘中</el-radio-button>
            <el-radio-button label="paused">暂停收简历</el-radio-button>
            <el-radio-button label="closed">已关闭</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="savePosition">
          保存岗位
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import {
  addTalentPosition,
  getTalentPositionDetail,
  getTalentPositionList,
  updateTalentPosition,
} from "@/services/talent.service";

const router = useRouter();
const loading = ref(false);
const saving = ref(false);
const tableData = ref([]);
const total = ref(0);
const dialogVisible = ref(false);
const formRef = ref();

const query = reactive({ keyword: "", status: "", page: 1, pageSize: 10 });
const statusMap = {
  recruiting: { label: "招聘中", type: "success" },
  paused: { label: "暂停收简历", type: "warning" },
  closed: { label: "已关闭", type: "info" },
};
const skillOptions = ["Python", "Java", "Spring Boot", "MySQL", "RAG", "Agent", "Vue3", "可视化"];
const form = reactive(getEmptyForm());
const rules = {
  positionName: [{ required: true, message: "请输入岗位名称", trigger: "blur" }],
  headcount: [{ required: true, message: "请输入招聘人数", trigger: "change" }],
};

function getEmptyForm() {
  return {
    positionId: null,
    positionName: "",
    departmentName: "",
    employmentType: "实习",
    workLocation: "",
    headcount: 1,
    requiredSkills: [],
    duty: "",
    requirement: "",
    scoreDimensions: [
      { name: "专业能力", weight: 30 },
      { name: "项目经验", weight: 30 },
      { name: "表达能力", weight: 20 },
    ],
    status: "recruiting",
  };
}

function handleRefresh() {
  query.keyword = "";
  query.status = "";
  query.page = 1;
  getList();
}

function resetForm(data = {}) {
  Object.assign(form, getEmptyForm(), data);
}

function formatDimensions(list = []) {
  return list.map((item) => `${item.name}${item.weight}%`).join(" / ");
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

    if (query.status) {
      params.status = query.status;
    }

    const res = await getTalentPositionList(params);

    if (res.data?.is_success) {
      tableData.value = res.data.data?.list || [];
      total.value = res.data.data?.total || 0;
    } else {
      ElMessage.error(res.data?.msg || "岗位列表加载失败");
    }
  } catch (error) {
    ElMessage.error("岗位列表加载失败");
  } finally {
    loading.value = false;
  }
}

function handleStatusChange() {
  query.page = 1;
  getList();
}

async function openDialog(row) {
  if (!row) {
    resetForm();
    dialogVisible.value = true;
    return;
  }
  try {
    const res = await getTalentPositionDetail(row.positionId);
    const detail = res.data?.data || row;
    resetForm(detail);
    dialogVisible.value = true;
  } catch (error) {
    resetForm(row);
    dialogVisible.value = true;
  }
}

function addDimension() {
  form.scoreDimensions.push({ name: "", weight: 10 });
}

function removeDimension(index) {
  form.scoreDimensions.splice(index, 1);
}

async function savePosition() {
  await formRef.value?.validate();
  saving.value = true;
  try {
    const params = { ...form };
    const res = form.positionId
      ? await updateTalentPosition(form.positionId, params)
      : await addTalentPosition(params);
    if (res.data?.is_success) {
      ElMessage.success("保存成功");
      dialogVisible.value = false;
      getList();
    } else {
      ElMessage.error(res.data?.msg || "保存失败");
    }
  } catch (error) {
    ElMessage.error("保存失败");
  } finally {
    saving.value = false;
  }
}

function goResume(row) {
  router.push({ path: "/talent/resume", query: { positionId: row.positionId } });
}

onMounted(getList);
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
  width: 300px;
}

.status-select {
  width: 180px;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-actions :deep(.el-button) {
  min-width: 88px;
  height: 40px;
  border-radius: 4px;
  font-weight: 500;
}

.table-card {
  padding: 24px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.position-table {
  width: 100%;
  border: 1px solid #ebeef5;
  border-bottom: none;
}

:deep(.position-table .el-table__header th) {
  background: #f5f7fa !important;
  color: #303133;
  font-size: 15px;
  font-weight: 600;
  height: 56px;
}

:deep(.position-table .el-table__cell) {
  border-color: #ebeef5 !important;
}

:deep(.position-table .el-table__row) {
  height: 92px;
}

.position-name {
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.position-sub {
  margin-top: 6px;
  color: #909399;
  font-size: 13px;
  line-height: 20px;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  margin: 0;
  height: 28px;
  padding: 0 10px;
  border-radius: 4px;
  color: #606266;
  background: #f4f4f5;
  border-color: #e9e9eb;
  font-size: 13px;
}

.dimension-text {
  max-width: 300px;
  color: #303133;
  font-size: 14px;
  line-height: 24px;
}

.dimension-text i {
  color: #909399;
  font-style: normal;
}

.candidate-count {
  color: #303133;
  font-weight: 500;
}

.status-tag {
  border-radius: 4px;
  padding: 0 10px;
}

.action-links {
  display: flex;
  align-items: center;
  gap: 14px;
}

.action-links :deep(.el-button) {
  padding: 0;
  font-size: 14px;
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

.dimension-list {
  width: 100%;
}

.dimension-row {
  display: grid;
  grid-template-columns: 1fr 160px 60px;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}
</style>
