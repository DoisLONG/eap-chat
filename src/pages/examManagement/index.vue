<template>
  <div class="exam-management">
    <section class="page-heading"><div><h2>{{ t('exam.title') }}</h2><p>{{ t('exam.subtitle') }}</p></div></section>
    <section class="stat-grid"><el-card v-for="item in statCards" :key="item.type"><div class="stat-name">{{ t(`exam.types.${item.type}`) }}</div><strong>{{ item.total }}</strong><p>{{ t('exam.published') }} {{ item.published }} · {{ t('exam.inProgress') }} {{ item.inProgress }} · {{ t('exam.ended') }} {{ item.ended }}</p><el-button link type="primary" @click="openDrawer(item.type)">{{ t('exam.createType', { type: t(`exam.types.${item.type}`) }) }}</el-button></el-card></section>
    <el-alert v-if="examError" :title="examError" type="warning" :closable="false" show-icon />

    <el-card class="filter-card">
      <div class="quick-filters">
        <el-button :type="!filters.primaryCategoryId && !filters.examType ? 'primary' : 'default'" @click="selectAllCategories">{{ t('common.all') }}</el-button>
        <el-button v-for="item in primaryCategories" :key="item.id" :type="String(filters.primaryCategoryId) === String(item.id) ? 'primary' : 'default'" @click="selectPrimary(item.id)">{{ item.name }}</el-button>
        <el-button :type="filters.examType === 'mixed' ? 'primary' : 'default'" @click="selectMixed">{{ t('exam.types.mixed') }}</el-button>
      </div>
      <el-form :model="filters" class="filter-form" @submit.prevent="search">
        <el-input v-model="filters.keyword" clearable :placeholder="t('exam.name')" />
        <el-select v-model="filters.status" clearable :placeholder="t('exam.status')">
          <el-option :label="t('exam.draft')" value="draft" />
          <el-option :label="t('exam.published')" value="published" />
          <el-option :label="t('exam.ended')" value="ended" />
        </el-select>
        <el-select v-model="filters.categoryId" clearable :disabled="!filters.primaryCategoryId" :placeholder="t('exam.secondaryCategory')">
          <el-option v-for="item in secondaryCategories" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <div class="filter-actions"><el-button type="primary" @click="search">{{ t('exam.search') }}</el-button><el-button @click="resetFilters">{{ t('exam.reset') }}</el-button></div>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <div class="list-toolbar"><div class="toolbar-actions"><el-button type="primary" :icon="Plus" @click="openDrawer()">{{ t('exam.create') }}</el-button><el-button type="danger" plain :disabled="!selectedRows.length" @click="batchRemove">{{ t('common.batchDelete') }}</el-button></div><el-button :icon="Refresh" circle :title="t('tabs.refresh')" @click="loadExams" /></div>
      <el-table ref="tableRef" class="exam-table" border v-loading="loading" :data="rows" row-key="id" :empty-text="t('SopPicker.noData')" @selection-change="selectedRows = $event">
        <el-table-column type="selection" width="52" align="center" header-align="center" class-name="selection-column" :selectable="row => row.can_delete" reserve-selection />
        <el-table-column :label="t('exam.name')" min-width="190"><template #default="{ row }"><div class="exam-name-cell"><el-tooltip :content="row.name" placement="top"><strong class="ellipsis">{{ row.name }}</strong></el-tooltip><small>{{ row.version || '-' }} · {{ row.created_at || '-' }}</small></div></template></el-table-column>
        <el-table-column :label="t('exam.category')" min-width="150" align="center" header-align="center"><template #default="{ row }"><el-tooltip :content="categoryText(row)" placement="top"><div class="category-cell"><el-tag v-if="row.exam_type === 'mixed'" effect="plain" class="category-tag category-primary-tag">{{ t('exam.types.mixed') }}</el-tag><template v-else-if="row.primary_category_name || row.category_name"><el-tag v-if="row.primary_category_name" effect="plain" class="category-tag category-primary-tag">{{ row.primary_category_name }}</el-tag><el-tag v-if="row.category_name && row.category_name !== row.primary_category_name" type="info" effect="plain" class="category-tag category-secondary-tag">{{ row.category_name }}</el-tag></template><el-tag v-else type="info" effect="plain" class="category-tag category-uncategorized">-</el-tag></div></el-tooltip></template></el-table-column>
        <el-table-column :label="t('examForm.questionSource')" min-width="200"><template #default="{ row }"><div class="table-cell-left"><el-tooltip :content="row.source_names?.join('、') || '-'" placement="top"><span class="ellipsis">{{ sourceText(row) }}</span></el-tooltip></div></template></el-table-column>
        <el-table-column :label="t('exam.questionComposition')" min-width="190" align="center" header-align="center"><template #default="{ row }"><div v-if="row.question_configs.length" class="question-tags"><el-tag v-for="item in row.question_configs" :key="item.type" size="small" effect="plain" class="question-tag">{{ item.label }} {{ item.count }}</el-tag></div><span v-else>-</span></template></el-table-column>
        <el-table-column :label="t('exam.rules')" min-width="120"><template #default="{ row }"><div class="rules-cell">{{ row.duration }} {{ t('exam.minutes') }}<small>{{ t('exam.passScore') }} {{ row.pass_score }} {{ t('exam.points') }}</small></div></template></el-table-column>
        <el-table-column :label="t('examForm.examTime')" min-width="280" align="center" header-align="center"><template #default="{ row }"><div class="exam-time-cell" :class="{ 'is-empty': !row.start_time && !row.end_time }" :title="formatExamTime(row)">{{ formatExamTime(row) }}</div></template></el-table-column>
        <el-table-column :label="t('exam.status')" width="105"><template #default="{ row }"><div class="table-cell-center"><el-tag :type="statusTag(row.status)" effect="light">{{ t(`exam.statuses.${row.status}`) }}</el-tag></div></template></el-table-column>
        <el-table-column :label="t('common.operate')" fixed="right" width="280" align="center" header-align="center"><template #default="{ row }"><div class="exam-actions"><el-button link type="primary" @click="preview(row)">{{ t('common.preview') }}</el-button><template v-if="isDraft(row)"><el-button link type="primary" @click="openDrawer(null, row)">{{ t('common.edit') }}</el-button><el-button link type="danger" @click="remove(row)">{{ t('common.delete') }}</el-button><el-button link type="primary" :loading="isActionLoading(row, 'publish')" :disabled="isActionLoading(row)" @click="publish(row)">{{ t('examForm.publishAction') }}</el-button></template><template v-else-if="isPublished(row)"><el-button link type="warning" :loading="isActionLoading(row, 'withdraw')" :disabled="isActionLoading(row)" @click="withdraw(row)">{{ t('examForm.withdrawAction') }}</el-button></template><template v-else-if="isEnded(row)"><el-button link type="primary" @click="openDrawer(null, row)">{{ t('common.edit') }}</el-button><el-button link type="danger" @click="remove(row)">{{ t('common.delete') }}</el-button></template></div></template></el-table-column>
      </el-table>
      <Pagination v-if="pageable.total" class="pagination" :pageable="pageable" :handle-size-change="handleSizeChange" :handle-current-change="handleCurrentChange" />
    </el-card>
    <ExamFormDrawer v-model="drawerVisible" :exam="editingExam" @saved="loadExams" />
    <ExamPreviewDialog v-model="previewVisible" :exam="previewExam" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, toRaw } from "vue";
import { Plus, Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import { formatDateTime } from "@/utils/dateFormat";
import { batchDeleteExams, deleteExam, getExamList, getSopCategoryTree, publishExam, withdrawExam } from "@/services/exam.api";
import Pagination from "@/components/ProTable/components/Pagination.vue";
import ExamFormDrawer from "./components/ExamFormDrawer.vue";
import ExamPreviewDialog from "./components/ExamPreviewDialog.vue";

const { t } = useI18n();
const tableRef = ref(), rows = ref([]), stats = ref([]), categories = ref([]), loading = ref(false), examError = ref("");
const drawerVisible = ref(false), editingExam = ref(null), previewVisible = ref(false), previewExam = ref(null), selectedRows = ref([]);
const actionLoadingId = ref(null), actionLoadingType = ref("");
const pageable = reactive({ pageNum: 1, pageSize: 10, total: 0 });
const filters = reactive({ keyword: "", status: "", primaryCategoryId: "", categoryId: "", examType: "" });
const primaryCategories = computed(() => categories.value.filter(item => item.name !== t("exam.types.mixed")));
const secondaryCategories = computed(() => primaryCategories.value.find(item => String(item.id) === String(filters.primaryCategoryId))?.children || []);
const statCards = computed(() => ["product", "technical", "operation", "mixed"].map(type => { const data = stats.value.filter(row => examType(row) === type); return { type, total: data.reduce((sum, row) => sum + Number(row.total || 0), 0), published: data.reduce((sum, row) => sum + Number(row.published || 0), 0), inProgress: data.reduce((sum, row) => sum + Number(row.in_progress || 0), 0), ended: data.reduce((sum, row) => sum + Number(row.ended || 0), 0) }; }));
const questionTypeLabels = { fill_blank: t("exam.types.fillBlank"), short_answer: t("exam.types.qa"), single_choice: t("exam.types.singleChoice"), multiple_choice: t("exam.types.multipleChoice"), true_false: t("exam.types.judgement") };

function categoryInfo(categoryId) { const primary = categories.value.find(item => String(item.id) === String(categoryId) || item.children?.some(child => String(child.id) === String(categoryId))); return { primary, secondary: primary?.children?.find(child => String(child.id) === String(categoryId)) }; }
function normalizeExamStatus(status) { return ({ draft: "draft", "草稿": "draft", published: "published", "已发布": "published", ended: "ended", "已结束": "ended" })[String(status || "").trim().toLowerCase()] || ""; }
function examType(row) { if (row.exam_type === "mixed") return "mixed"; const name = row.primary_category_name || categoryInfo(row.category_id).primary?.name || ""; if (name.includes("技术")) return "technical"; if (name.includes("运营")) return "operation"; return "product"; }
function mapExam(row) { return { ...row, status: normalizeExamStatus(row.status), type: examType(row), source_names: Array.isArray(row.source_names) ? row.source_names : [], question_configs: (row.question_configs || []).map(item => ({ type: item.question_type, label: questionTypeLabels[item.question_type] || item.question_type, count: item.question_count ?? 0 })) }; }
function sourceText(row) { return row.source_names?.join("、") || "-"; }
function formatExamTime(row) { const time = value => value ? formatDateTime(value, "YYYY-MM-DD HH:mm") : t("examForm.unset"); return row.start_time || row.end_time ? `${time(row.start_time)} ～ ${time(row.end_time)}` : "--"; }
function categoryText(row) { if (row.exam_type === "mixed") return t("exam.types.mixed"); return [row.primary_category_name, row.category_name !== row.primary_category_name ? row.category_name : ""].filter(Boolean).join(" / ") || "-"; }
function statusTag(status) { return { draft: "warning", published: "success", ended: "info" }[normalizeExamStatus(status)] || "info"; }
function isDraft(row) { return normalizeExamStatus(row.status) === "draft"; }
function isPublished(row) { return normalizeExamStatus(row.status) === "published"; }
function isEnded(row) { return normalizeExamStatus(row.status) === "ended"; }
function isActionLoading(row, type) { return actionLoadingId.value === row.id && (!type || actionLoadingType.value === type); }
function search() { pageable.pageNum = 1; loadExams(); }
function selectAllCategories() { filters.primaryCategoryId = ""; filters.categoryId = ""; filters.examType = ""; search(); }
function selectPrimary(id) { filters.primaryCategoryId = id; filters.categoryId = ""; filters.examType = ""; search(); }
function selectMixed() { filters.primaryCategoryId = ""; filters.categoryId = ""; filters.examType = "mixed"; search(); }
function resetFilters() { Object.assign(filters, { keyword: "", status: "", primaryCategoryId: "", categoryId: "", examType: "" }); search(); }
function handleSizeChange(size) { pageable.pageSize = size; pageable.pageNum = 1; loadExams(); }
function handleCurrentChange(currentPage) { pageable.pageNum = currentPage; loadExams(); }
function openDrawer(type = null, exam = null) { editingExam.value = exam ? structuredClone(toRaw(exam)) : type ? { type } : null; drawerVisible.value = true; }
function preview(row) { previewExam.value = structuredClone(toRaw(row)); previewVisible.value = true; }
async function runStatusAction(row, type, request, title, message, success) { try { await ElMessageBox.confirm(message, title, { type: "warning" }); actionLoadingId.value = row.id; actionLoadingType.value = type; await request(row.id); ElMessage.success(success); await loadExams(); } catch (e) { if (e !== "cancel" && e !== "close") ElMessage.error(e.message || t("exam.saveFailed")); } finally { actionLoadingId.value = null; actionLoadingType.value = ""; } }
function publish(row) { return runStatusAction(row, "publish", publishExam, t("examForm.publishExam"), t("examForm.publishRowConfirm", { name: row.name }), t("examForm.publishSuccess")); }
function withdraw(row) { return runStatusAction(row, "withdraw", withdrawExam, t("examForm.withdrawExam"), t("examForm.withdrawConfirm", { name: row.name }), t("examForm.withdrawSuccess")); }
async function remove(row) { try { await ElMessageBox.confirm(t("common.batchDeleteTip", { num: 1 }), t("header.tip"), { type: "warning" }); await deleteExam(row.id); ElMessage.success(t("common.deleteSuccess")); reloadAfterDelete(1); } catch (e) { if (e !== "cancel" && e !== "close") ElMessage.error(e.message || t("exam.saveFailed")); } }
async function batchRemove() { try { const count = selectedRows.value.length; await ElMessageBox.confirm(t("common.batchDeleteTip", { num: count }), t("header.tip"), { type: "warning" }); await batchDeleteExams(selectedRows.value.map(row => row.id)); ElMessage.success(t("common.deleteSuccess")); selectedRows.value = []; reloadAfterDelete(count); } catch (e) { if (e !== "cancel" && e !== "close") ElMessage.error(e.message || t("exam.saveFailed")); } }
function reloadAfterDelete(count) { if (rows.value.length <= count && pageable.pageNum > 1) pageable.pageNum -= 1; loadExams(); }
async function loadExams() {
  loading.value = true; examError.value = "";
  try {
    const result = await getExamList({ page: pageable.pageNum, page_size: pageable.pageSize, keyword: filters.keyword || undefined, status: normalizeExamStatus(filters.status) || undefined, primary_category_id: filters.primaryCategoryId || undefined, category_id: filters.categoryId || undefined, exam_type: filters.examType || undefined });
    if (!(result.records || []).length && result.total && pageable.pageNum > 1) { pageable.pageNum--; return loadExams(); }
    rows.value = (result.records || []).map(mapExam); stats.value = result.stats || []; pageable.total = Number(result.total || 0); tableRef.value?.clearSelection(); selectedRows.value = [];
  } catch (e) { rows.value = []; stats.value = []; pageable.total = 0; examError.value = e.message || t("exam.apiUnavailable"); }
  finally { loading.value = false; }
}
async function loadCategories() { try { const response = await getSopCategoryTree(); categories.value = response.data?.results || []; } catch { categories.value = []; } }
onMounted(() => { loadCategories(); loadExams(); });
</script>

<style scoped>
.exam-management { display: grid; gap: 16px; }.page-heading { margin-bottom: -8px; padding: 0; }.page-heading h2 { margin: 0; line-height: 1.3; }.page-heading p, .stat-grid p, small { display: block; margin-top: 3px; color: var(--el-text-color-secondary); }.stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }.stat-grid strong { display: block; font-size: 28px; margin-top: 8px; }.stat-name { color: var(--el-text-color-secondary); }.filter-card :deep(.el-card__body) { padding: 18px; }.list-card :deep(.el-card__body) { padding: 12px; }.quick-filters, .filter-actions, .toolbar-actions { display: flex; flex-wrap: wrap; gap: 8px; }.quick-filters { margin-bottom: 14px; }.filter-form { display: flex; flex-wrap: wrap; gap: 12px; }.filter-form .el-input { width: 240px; }.filter-form .el-select { width: 150px; }.list-toolbar { display: flex; align-items: center; justify-content: space-between; min-height: 32px; margin-bottom: 8px; }.ellipsis { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.exam-name-cell, .table-cell-left, .rules-cell, .table-cell-center, .question-tags, .exam-actions, .category-cell { display: flex; box-sizing: border-box; width: 100%; min-height: 64px; align-items: center; gap: 6px; }.exam-name-cell, .table-cell-left, .rules-cell { justify-content: center; flex-direction: column; align-items: flex-start; }.table-cell-center, .question-tags, .exam-actions, .category-cell { justify-content: center; }.question-tags, .category-cell, .exam-actions { flex-wrap: nowrap; white-space: nowrap; overflow: hidden; }.category-tag { min-width: 52px; height: 23px; padding: 0 9px; border: 0; border-radius: 12px; font-size: 12px; }.category-primary-tag { color: #1677ff; background: #e6f4ff; }.category-secondary-tag { color: #5f6b7a; background: #f4f6f9; }.category-uncategorized { color: #7b8492; background: #f4f6f9; }.exam-actions { gap: 12px; min-height: 32px; }.exam-actions :deep(.el-button) { display: inline-flex; align-items: center; height: 32px; margin: 0; padding: 0; line-height: 1; }.exam-table { border-radius: 4px; overflow: hidden; }.exam-table :deep(th.el-table__cell) { background: var(--el-fill-color-light); color: var(--el-text-color-primary); font-weight: 600; text-align: center; }.exam-table :deep(tr.el-table__row), .exam-table :deep(td.el-table__cell) { height: 64px; }.exam-table :deep(td.el-table__cell) { padding: 0; }.exam-table :deep(.el-table__cell) { border-right-color: var(--el-border-color-lighter); }.exam-table :deep(td.el-table__cell > .cell) { display: flex; min-height: 64px; align-items: center; }.question-tag { flex: none; margin: 0; }.pagination { justify-content: flex-end; margin-top: 8px; } @media (max-width: 1024px) { .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } } @media (max-width: 640px) { .stat-grid { grid-template-columns: 1fr; }.list-toolbar { align-items: flex-start; flex-direction: column; } }
.exam-table :deep(th.el-table__cell:first-child), .exam-table :deep(td.selection-column) { width: 52px; min-width: 52px; padding-right: 0 !important; padding-left: 0 !important; text-align: center; }.exam-table :deep(th.el-table__cell:first-child > .cell), .exam-table :deep(td.selection-column > .cell) { display: flex; align-items: center; justify-content: center; width: 52px; min-width: 52px; height: 100%; padding-right: 0; padding-left: 0; }.exam-table :deep(th.el-table__cell:first-child .el-checkbox), .exam-table :deep(td.selection-column .el-checkbox) { margin: 0; transform: none; }.exam-time-cell { display: flex; align-items: center; justify-content: center; min-height: 40px; overflow: hidden; color: #475467; font-family: Inter, "DIN Alternate", "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif; font-size: 13px; font-weight: 500; font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; letter-spacing: .1px; line-height: 20px; text-overflow: ellipsis; white-space: nowrap; }.exam-time-cell.is-empty { color: #98a2b3; font-weight: 400; }
</style>
