<template>
  <div class="evaluation-management-page">
    <div class="content">
      <section class="panel">
        <h2 class="filter-title">评价筛选</h2>
        <div class="category-tabs"><button v-for="item in primaryCategories" :key="item.value" class="category-tab" :class="{ active: filters.primaryCategory === item.value }" @click="selectPrimary(item.value)">{{ item.label }}</button></div>
        <div class="secondary-tabs"><button v-for="item in secondaryCategories" :key="item.value" class="category-subtab" :class="{ active: filters.secondaryCategory === item.value }" @click="selectSecondary(item.value)">{{ item.label }}</button></div>
        <div class="filters"><input v-model="filters.employeeName" placeholder="员工姓名" @input="scheduleEmployeeSearch" @keyup.enter="search" /><select v-model="filters.examId" @change="search"><option value="">全部考试</option><option v-for="item in availableExams" :key="item.id" :value="item.id">{{ item.name }}</option></select><select v-model="filters.status" @change="search"><option value="">全部状态</option><option value="completed">已完成</option><option value="pending">未完成</option></select><button class="btn primary" @click="search">搜索</button><button class="btn" @click="resetFilters">重置</button></div>
      </section>

      <section class="panel">
        <div class="table-head"><h2>成绩列表</h2><span class="total">共 {{ total }} 条</span><button class="btn batch-delete" :disabled="!selectedIds.size" @click="deleteDialogVisible = true">批量删除</button></div>
        <div class="table-wrap"><table><thead><tr><th style="width: 48px"><input type="checkbox" :checked="allSelected" :indeterminate="partiallySelected" aria-label="全选" @change="toggleAll" /></th><th style="width: 60px">序号</th><th style="width: 120px">员工姓名</th><th>考试名称</th><th style="width: 138px">考试类别</th><th style="width: 70px">得分</th><th style="width: 75px">正确率</th><th style="width: 150px">提交时间</th><th style="width: 80px">用时</th><th style="width: 80px">状态</th><th style="width: 90px">操作</th></tr></thead><tbody><tr v-for="(record, index) in records" :key="record.id"><td><input type="checkbox" :checked="selectedIds.has(record.id)" @change="toggleOne(record.id, $event.target.checked)" /></td><td>{{ (page - 1) * pageSize + index + 1 }}</td><td>{{ record.employeeName }}</td><td :title="record.examName">{{ record.examName }}</td><td><span class="category-tag">{{ categoryText(record) }}</span></td><td>{{ record.score ?? "--" }}</td><td>{{ record.status === "completed" ? `${record.correctRate}%` : "--" }}</td><td>{{ record.submittedAt }}</td><td>{{ record.duration }}</td><td><span class="status-tag" :class="{ pending: record.status === 'pending' }">{{ statusText(record.status) }}</span></td><td><button class="link-btn" @click="openDetail(record.id)">成绩详情</button></td></tr><tr v-if="!records.length"><td colspan="11" class="empty">暂无成绩记录</td></tr></tbody></table></div>
        <div class="pagination"><span>第 {{ page }} / {{ pageCount }} 页</span><button class="btn" :disabled="page === 1" @click="changePage(page - 1)">上一页</button><button class="btn" :disabled="page === pageCount" @click="changePage(page + 1)">下一页</button></div>
      </section>
    </div>

    <div class="modal" :class="{ show: detailDialogVisible }" @click.self="detailDialogVisible = false">
      <div class="dialog">
        <div class="dialog-head">成绩详情报告<button class="close" @click="detailDialogVisible = false">×</button></div>
        <div v-if="currentRecord" class="dialog-body">
          <div class="report">
            <div><span>员工姓名</span><b>{{ currentRecord.employeeName }}</b></div>
            <div><span>考试</span><b>{{ currentRecord.examName }}（{{ categoryText(currentRecord) }}）</b></div>
            <div><span>提交与用时</span><b>{{ currentRecord.submittedAt }} · {{ currentRecord.duration }}</b></div>
            <div><span>得分</span><b>{{ currentRecord.score ?? "--" }}</b></div>
            <div><span>总分</span><b>{{ currentRecord.totalScore }}</b></div>
            <div><span>正确率</span><b>{{ currentRecord.status === "completed" ? `${currentRecord.correctRate}%` : "--" }}</b></div>
            <div class="summary-card">
              <span>答题汇总</span>
              <div class="summary-metrics">
                <div class="summary-metric correct"><small>正确</small><strong>{{ currentRecord.correct }}</strong></div>
                <div class="summary-metric wrong"><small>错误</small><strong>{{ currentRecord.wrong }}</strong></div>
                <div class="summary-metric unanswered"><small>未答</small><strong>{{ currentRecord.unanswered }}</strong></div>
              </div>
            </div>
            <div class="analysis-card">
              <span>分析报告</span>
              <b>{{ currentRecord.summary || "暂无分析报告" }}</b>
            </div>
          </div>
          <template v-if="currentRecord.dimensions.length">
            <h3>评价维度</h3>
            <div v-for="dimension in currentRecord.dimensions" :key="dimension.code || dimension.name" class="question"><b>{{ dimension.name }}：{{ dimension.score ?? "--" }} / {{ dimension.maxScore ?? "--" }}</b><p>{{ dimension.analysis || "暂无维度分析" }}</p><p>改进建议：{{ dimension.suggestion || "暂无" }}</p></div>
          </template>
          <h3>逐题答题详情</h3>
          <template v-if="currentRecord.answers.length"><div v-for="(answer, index) in currentRecord.answers" :key="`${answer.text}-${index}`" class="question"><b>{{ index + 1 }}. {{ answer.text }}</b><p>{{ typeText(answer.type) }} · 员工答案：{{ answer.employeeAnswer || "未作答" }}</p><p>参考答案：{{ answer.answer }}</p><p :class="answer.score === answer.points ? 'ok' : 'bad'">本题 {{ answer.score }} / {{ answer.points }} 分 · {{ answer.analysis }}</p></div></template>
          <div v-else class="question">暂无答题详情。</div>
        </div>
        <div class="dialog-foot"><button class="btn" @click="detailDialogVisible = false">关闭</button></div>
      </div>
    </div>
    <div class="modal" :class="{ show: deleteDialogVisible }" @click.self="deleteDialogVisible = false"><div class="dialog delete-dialog"><div class="dialog-head">删除确认<button class="close" @click="deleteDialogVisible = false">×</button></div><div class="dialog-body"><p>确认删除已选择的 {{ selectedIds.size }} 条成绩记录吗？</p></div><div class="dialog-foot"><button class="btn" @click="deleteDialogVisible = false">取消</button><button class="btn primary" @click="confirmDelete">确认删除</button></div></div></div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  deleteEvaluationItems,
  getEvaluationCategories,
  getEvaluationDetail,
  getEvaluationExams,
  getEvaluationList,
} from "@/services/evaluation.service";

const pageSize = 8;
const records = ref([]);
const total = ref(0);
const page = ref(1);
const selectedIds = ref(new Set());
const currentRecord = ref(null);
const detailDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const categoryOptions = ref([]);
const availableExams = ref([]);
const filters = reactive({ employeeName: "", primaryCategory: "", secondaryCategory: "", examId: "", status: "" });
let employeeSearchTimer;

const primaryCategories = computed(() => [{ value: "", label: "全部" }, ...categoryOptions.value]);
const secondaryCategories = computed(
  () => categoryOptions.value.find((item) => item.value === filters.primaryCategory)?.children || [],
);
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));
const allSelected = computed(() => records.value.length > 0 && records.value.every((item) => selectedIds.value.has(item.id)));
const partiallySelected = computed(() => !allSelected.value && records.value.some((item) => selectedIds.value.has(item.id)));

const typeText = (type) => (type === "choice" ? "选择题" : "问答题");
const statusText = (status) => (status === "completed" ? "已完成" : "未完成");
const categoryText = (record) => [record.primaryCategoryName, record.secondaryCategoryName].filter(Boolean).join(" / ") || "--";

async function loadExams() {
  availableExams.value = await getEvaluationExams({
    primaryCategory: filters.primaryCategory,
    secondaryCategory: filters.secondaryCategory,
  });
}

async function loadRecords() {
  try {
    let result = await getEvaluationList({ filters, page: page.value, pageSize });
    if (!result.items.length && result.total && page.value > 1) {
      page.value -= 1;
      result = await getEvaluationList({ filters, page: page.value, pageSize });
    }
    records.value = result.items;
    total.value = result.total;
    selectedIds.value = new Set();
  } catch (error) {
    records.value = [];
    total.value = 0;
    selectedIds.value = new Set();
    ElMessage.error(error.response?.data?.detail || error.message || "评价数据读取失败");
  }
}

async function search() {
  page.value = 1;
  await loadRecords();
}

function scheduleEmployeeSearch() {
  clearTimeout(employeeSearchTimer);
  employeeSearchTimer = setTimeout(() => void search(), 300);
}

async function selectPrimary(value) {
  filters.primaryCategory = value;
  filters.secondaryCategory = "";
  filters.examId = "";
  try {
    await loadExams();
    await search();
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || error.message || "考试筛选项读取失败");
  }
}

async function selectSecondary(value) {
  filters.secondaryCategory = value;
  filters.examId = "";
  try {
    await loadExams();
    await search();
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || error.message || "考试筛选项读取失败");
  }
}

async function resetFilters() {
  Object.assign(filters, { employeeName: "", primaryCategory: "", secondaryCategory: "", examId: "", status: "" });
  try {
    await loadExams();
    await search();
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || error.message || "评价筛选重置失败");
  }
}

function changePage(value) {
  if (value >= 1 && value <= pageCount.value) {
    page.value = value;
    void loadRecords();
  }
}

function toggleAll(event) {
  const next = new Set(selectedIds.value);
  records.value.forEach((item) => (event.target.checked ? next.add(item.id) : next.delete(item.id)));
  selectedIds.value = next;
}

function toggleOne(id, checked) {
  const next = new Set(selectedIds.value);
  checked ? next.add(id) : next.delete(id);
  selectedIds.value = next;
}

async function openDetail(id) {
  try {
    currentRecord.value = await getEvaluationDetail(id);
    detailDialogVisible.value = Boolean(currentRecord.value);
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || error.message || "评价详情读取失败");
  }
}

async function confirmDelete() {
  if (!selectedIds.value.size) return;
  try {
    await deleteEvaluationItems([...selectedIds.value]);
    deleteDialogVisible.value = false;
    await loadRecords();
    ElMessage.success("评价记录已删除");
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || error.message || "评价记录删除失败");
  }
}

async function initialize() {
  try {
    categoryOptions.value = await getEvaluationCategories();
    await loadExams();
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || error.message || "评价筛选项读取失败");
  }
  await loadRecords();
}

onMounted(() => void initialize());
onBeforeUnmount(() => clearTimeout(employeeSearchTimer));
</script>

<style scoped>
.evaluation-management-page { min-width: 0; color: #1f2937; font: 14px "Microsoft YaHei", Arial, sans-serif; }.content { padding: 0; }.panel { padding: 16px; margin-bottom: 14px; background: #fff; border: 1px solid #edf0f4; border-radius: 6px; box-shadow: 0 2px 8px rgba(16, 24, 40, .04); }.filter-title { margin: 0 0 12px; color: #1f2937; font-size: 15px; font-weight: 700; }.category-tabs, .secondary-tabs, .filters { display: flex; flex-wrap: wrap; align-items: center; }.category-tabs, .secondary-tabs { gap: 8px; }.filters { gap: 10px; }.category-tabs { margin-top: 12px; }.category-tab { height: 36px; padding: 0 17px; color: #475467; border: 1px solid transparent; border-radius: 8px; background: #f1f4f8; cursor: pointer; font: inherit; }.category-tab:hover { color: #1677ff; background: #eaf3ff; }.category-tab.active { color: #fff; background: #1677ff; }.secondary-tabs { margin-top: 10px; padding: 10px 12px; border-radius: 8px; background: #f6f8fc; }.category-subtab { height: 32px; padding: 0 14px; color: #475467; border: 1px solid #e0e7f0; border-radius: 999px; background: #fff; cursor: pointer; font: inherit; font-size: 12px; }.category-subtab.active { color: #1677ff; border-color: #91bfff; background: #eaf3ff; }.filters { margin-top: 16px; } input, select { height: 34px; padding: 0 10px; color: #344054; border: 1px solid #d9e0e8; border-radius: 4px; background: #fff; font: inherit; } input { width: 220px; }.btn { height: 34px; padding: 0 14px; color: #344054; border: 1px solid #d0d5dd; border-radius: 4px; background: #fff; cursor: pointer; font: inherit; }.btn:disabled { color: #98a2b3; border-color: #e4e7ec; background: #f5f7fa; cursor: not-allowed; }.btn.primary { color: #fff; border-color: #1677ff; background: #1677ff; }.table-head { display: flex; align-items: center; margin-bottom: 13px; }.table-head h2 { margin: 0; color: #1f2937; font-size: 16px; font-weight: 700; }.total { margin-left: 10px; color: #98a2b3; }.batch-delete { margin-left: 12px; color: #d92d20; border-color: #f2c7c3; }.batch-delete:disabled { color: #98a2b3; border-color: #e4e7ec; background: #f5f7fa; }.table-wrap { overflow: auto; } table { width: 100%; border-collapse: collapse; table-layout: fixed; } th, td { height: 44px; padding: 0 10px; overflow: hidden; text-align: left; text-overflow: ellipsis; white-space: nowrap; border-bottom: 1px solid #edf0f4; } th { color: #667085; background: #f8fafc; font-weight: 600; } th:first-child, td:first-child { padding: 0; overflow: visible; text-align: center; } input[type="checkbox"] { width: 16px; height: 16px; padding: 0; vertical-align: middle; accent-color: #1677ff; cursor: pointer; }.category-tag, .status-tag { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 12px; }.category-tag { color: #1677ff; background: #eaf3ff; }.status-tag { color: #12a150; background: #e9f8ef; }.status-tag.pending { color: #d97706; background: #fff4e5; }.link-btn { padding: 0; color: #1677ff; border: 0; background: none; cursor: pointer; font: inherit; }.empty { padding: 42px; color: #98a2b3; text-align: center; }.pagination { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 14px; color: #667085; }.modal { position: fixed; z-index: 3000; inset: 0; display: none; align-items: center; justify-content: center; background: rgba(15, 23, 42, .36); }.modal.show { display: flex; }.dialog { display: flex; flex-direction: column; width: min(850px, calc(100vw - 80px)); max-height: 84vh; border-radius: 8px; background: #fff; box-shadow: 0 18px 50px rgba(15, 23, 42, .2); }.delete-dialog { width: min(480px, calc(100vw - 80px)); }.dialog-head { display: flex; align-items: center; padding: 16px 18px; border-bottom: 1px solid #e7ebf0; font-weight: 700; }.close { margin-left: auto; border: 0; background: none; font-size: 22px; cursor: pointer; }.dialog-body { padding: 18px; overflow: auto; }.dialog-body > p { margin: 0; color: #475467; }.report { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 18px; }.report > div { padding: 10px; border-radius: 5px; background: #f8fafc; }.report span { display: block; color: #667085; font-size: 12px; }.report b { display: block; margin-top: 5px; line-height: 1.5; word-break: break-word; }.summary-card { grid-column: span 2; }.summary-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 8px; }.summary-metric { padding: 0 12px; text-align: center; border-left: 1px solid #e1e7ef; }.summary-metric:first-child { padding-left: 0; border-left: 0; }.summary-metric:last-child { padding-right: 0; }.summary-metric small { display: block; color: #667085; font-size: 12px; }.summary-metric strong { display: block; margin-top: 5px; font-size: 18px; line-height: 1.2; }.summary-metric.correct strong { color: #16a34a; }.summary-metric.wrong strong { color: #d97706; }.summary-metric.unanswered strong { color: #667085; }.report-link { display: inline-flex; align-items: center; gap: 6px; padding: 0; margin-top: 8px; color: #1677ff; border: 0; background: transparent; cursor: pointer; font: inherit; }.report-link i { padding: 2px 5px; color: #fff; border-radius: 3px; background: #e5484d; font-size: 10px; font-style: normal; font-weight: 700; line-height: 1; }.report-preview-dialog { width: min(1000px, calc(100vw - 80px)); height: min(82vh, 820px); }.pdf-preview-body { flex: 1; min-height: 0; overflow: hidden; }.pdf-preview { display: block; width: 100%; height: 100%; border: 0; }.dialog-body h3 { margin: 0; color: #1f2937; font-size: 16px; }.question { padding: 12px; margin-top: 10px; line-height: 1.6; border: 1px solid #edf0f4; border-radius: 5px; }.question p { margin: 6px 0 0; }.ok { color: #16a34a; }.bad { color: #dc2626; }.dialog-foot { padding: 12px 18px; text-align: right; border-top: 1px solid #e7ebf0; }.dialog-foot .btn.primary { margin-left: 8px; }
</style>
