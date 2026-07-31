<template>
  <div class="exam-management">
    <section class="page-heading"><div><h2>{{ t('exam.title') }}</h2><p>{{ t('exam.subtitle') }}</p></div></section>
    <section class="stat-grid"><el-card v-for="item in statCards" :key="item.type"><div class="stat-name">{{ t(`exam.types.${item.type}`) }}</div><strong>{{ item.total }}</strong><p>{{ t('exam.published') }} {{ item.published }} · {{ t('exam.inProgress') }} {{ item.inProgress }}</p><el-button link type="primary" @click="openDrawer(item.type)">{{ t('exam.createType', { type: t(`exam.types.${item.type}`) }) }}</el-button></el-card></section>
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
        <div class="filter-actions"><el-button type="primary" @click="search">{{ t('exam.search') }}</el-button><el-button @click="resetFilters">{{ t('exam.reset') }}</el-button></div>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <div class="list-toolbar"><div class="toolbar-actions"><el-button type="primary" :icon="Plus" @click="openDrawer()">{{ t('exam.create') }}</el-button><el-button type="danger" plain :disabled="!selectedRows.length" @click="batchRemove">{{ t('common.batchDelete') }}</el-button></div><el-button :icon="Refresh" circle :title="t('tabs.refresh')" @click="loadExams" /></div>
      <el-table ref="tableRef" class="exam-table" border v-loading="loading" :data="rows" row-key="id" :empty-text="t('SopPicker.noData')" @selection-change="selectedRows = $event">
        <el-table-column type="selection" width="52" :selectable="row => row.can_delete" reserve-selection />
        <el-table-column :label="t('exam.name')" min-width="190"><template #default="{ row }"><el-tooltip :content="row.name" placement="top"><strong class="ellipsis">{{ row.name }}</strong></el-tooltip><small>{{ row.version || '-' }} · {{ row.created_at || '-' }}</small></template></el-table-column>
        <el-table-column :label="t('exam.category')" min-width="150" align="center" header-align="center"><template #default="{ row }"><el-tooltip :content="categoryText(row)" placement="top"><div class="category-cell"><el-tag v-if="row.exam_type === 'mixed'" effect="plain" class="category-tag category-primary-tag">{{ t('exam.types.mixed') }}</el-tag><template v-else-if="row.primary_category_name || row.category_name"><el-tag v-if="row.primary_category_name" effect="plain" class="category-tag category-primary-tag">{{ row.primary_category_name }}</el-tag><el-tag v-if="row.category_name && row.category_name !== row.primary_category_name" type="info" effect="plain" class="category-tag category-secondary-tag">{{ row.category_name }}</el-tag></template><el-tag v-else type="info" effect="plain" class="category-tag category-uncategorized">-</el-tag></div></el-tooltip></template></el-table-column>
        <el-table-column :label="t('examForm.questionSource')" min-width="200"><template #default="{ row }"><el-tooltip :content="row.source_names?.join('、') || '-'" placement="top"><span class="ellipsis">{{ sourceText(row) }}</span></el-tooltip></template></el-table-column>
        <el-table-column :label="t('exam.questionComposition')" min-width="190" align="center" header-align="center"><template #default="{ row }"><div v-if="row.question_configs.length" class="question-tags"><el-tag v-for="item in row.question_configs" :key="item.type" size="small" effect="plain" class="question-tag">{{ item.label }} {{ item.count }}</el-tag></div><span v-else>-</span></template></el-table-column>
        <el-table-column :label="t('exam.rules')" min-width="120"><template #default="{ row }">{{ row.duration }} {{ t('exam.minutes') }}<small>{{ t('exam.passScore') }} {{ row.pass_score }} {{ t('exam.points') }}</small></template></el-table-column>
        <el-table-column :label="t('exam.status')" width="105"><template #default="{ row }"><el-tag :type="statusTag(row.status)" effect="light">{{ t(`exam.statuses.${row.status}`) }}</el-tag></template></el-table-column>
        <el-table-column :label="t('common.operate')" fixed="right" width="210" align="center" header-align="center"><template #default="{ row }"><div class="operation-actions"><el-button link type="primary" @click="preview(row)">{{ t('common.preview') }}</el-button><el-tooltip :disabled="row.can_edit" :content="t('examForm.editUnavailable')"><span><el-button link type="primary" :disabled="!row.can_edit" @click="openDrawer(null, row)">{{ t('common.edit') }}</el-button></span></el-tooltip><el-tooltip :disabled="row.can_delete" :content="t('examForm.deleteUnavailable')"><span><el-button link type="danger" :disabled="!row.can_delete" @click="remove(row)">{{ t('common.delete') }}</el-button></span></el-tooltip></div></template></el-table-column>
      </el-table>
      <Pagination v-if="pageable.total" class="pagination" :pageable="pageable" :handle-size-change="handleSizeChange" :handle-current-change="handleCurrentChange" />
    </el-card>
    <ExamFormDrawer v-model="drawerVisible" :exam="editingExam" @saved="loadExams" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { Plus, Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import { batchDeleteExams, deleteExam, getExamList, getSopCategoryTree, publishExam } from "@/services/exam.api";
import Pagination from "@/components/ProTable/components/Pagination.vue";
import ExamFormDrawer from "./components/ExamFormDrawer.vue";

const { t } = useI18n();
const tableRef = ref(), rows = ref([]), stats = ref([]), categories = ref([]), loading = ref(false), examError = ref("");
const drawerVisible = ref(false), editingExam = ref(null), selectedRows = ref([]);
const pageable = reactive({ pageNum: 1, pageSize: 10, total: 0 });
const filters = reactive({ keyword: "", status: "", primaryCategoryId: "", categoryId: "", examType: "" });
const primaryCategories = computed(() => categories.value.filter(item => item.name !== t("exam.types.mixed")));
const statCards = computed(() => ["product", "technical", "operation", "mixed"].map(type => { const data = stats.value.filter(row => examType(row) === type); return { type, total: data.reduce((sum, row) => sum + Number(row.total || 0), 0), published: data.reduce((sum, row) => sum + Number(row.published || 0), 0), inProgress: data.reduce((sum, row) => sum + Number(row.in_progress || 0), 0) }; }));
const questionTypeLabels = { fill_blank: t("exam.types.fillBlank"), short_answer: t("exam.types.qa"), single_choice: t("exam.types.singleChoice"), multiple_choice: t("exam.types.multipleChoice"), true_false: t("exam.types.judgement") };

function categoryInfo(categoryId) { const primary = categories.value.find(item => String(item.id) === String(categoryId) || item.children?.some(child => String(child.id) === String(categoryId))); return { primary, secondary: primary?.children?.find(child => String(child.id) === String(categoryId)) }; }
function examType(row) { if (row.exam_type === "mixed") return "mixed"; const name = row.primary_category_name || categoryInfo(row.category_id).primary?.name || ""; if (name.includes("技术")) return "technical"; if (name.includes("运营")) return "operation"; return "product"; }
function mapExam(row) { return { ...row, type: examType(row), source_names: Array.isArray(row.source_names) ? row.source_names : [], question_configs: (row.question_configs || []).map(item => ({ type: item.question_type, label: questionTypeLabels[item.question_type] || item.question_type, count: item.question_count ?? 0 })) }; }
function sourceText(row) { return row.source_names?.join("、") || "-"; }
function categoryText(row) { if (row.exam_type === "mixed") return t("exam.types.mixed"); return [row.primary_category_name, row.category_name !== row.primary_category_name ? row.category_name : ""].filter(Boolean).join(" / ") || "-"; }
function statusTag(status) { return { draft: "warning", published: "success", ended: "info" }[status] || "info"; }
function search() { pageable.pageNum = 1; loadExams(); }
function selectAllCategories() { filters.primaryCategoryId = ""; filters.categoryId = ""; filters.examType = ""; search(); }
function selectPrimary(id) { filters.primaryCategoryId = id; filters.categoryId = ""; filters.examType = ""; search(); }
function selectMixed() { filters.primaryCategoryId = ""; filters.categoryId = ""; filters.examType = "mixed"; pageable.pageNum = 1; examError.value = "当前考试接口尚未提供混合考试的服务端筛选。"; }
function resetFilters() { Object.assign(filters, { keyword: "", status: "", primaryCategoryId: "", categoryId: "", examType: "" }); search(); }
function handleSizeChange(size) { pageable.pageSize = size; pageable.pageNum = 1; loadExams(); }
function handleCurrentChange(currentPage) { pageable.pageNum = currentPage; loadExams(); }
function openDrawer(type = null, exam = null) { editingExam.value = exam ? structuredClone(exam) : type ? { type } : null; drawerVisible.value = true; }
function preview(row) { openDrawer(null, row); }
async function publish(row) { try { await ElMessageBox.confirm(`确认发布“${row.name}”吗？`, t("header.tip"), { type: "warning" }); await publishExam(row.id); ElMessage.success(t("exam.publishNow")); loadExams(); } catch (e) { if (e !== "cancel" && e !== "close") ElMessage.error(e.message || t("exam.saveFailed")); } }
async function remove(row) { try { await ElMessageBox.confirm(t("common.batchDeleteTip", { num: 1 }), t("header.tip"), { type: "warning" }); await deleteExam(row.id); ElMessage.success(t("common.deleteSuccess")); reloadAfterDelete(1); } catch (e) { if (e !== "cancel" && e !== "close") ElMessage.error(e.message || t("exam.saveFailed")); } }
async function batchRemove() { try { const count = selectedRows.value.length; await ElMessageBox.confirm(t("common.batchDeleteTip", { num: count }), t("header.tip"), { type: "warning" }); await batchDeleteExams(selectedRows.value.map(row => row.id)); ElMessage.success(t("common.deleteSuccess")); selectedRows.value = []; reloadAfterDelete(count); } catch (e) { if (e !== "cancel" && e !== "close") ElMessage.error(e.message || t("exam.saveFailed")); } }
function reloadAfterDelete(count) { if (rows.value.length <= count && pageable.pageNum > 1) pageable.pageNum -= 1; loadExams(); }
async function loadExams() {
  if (filters.examType === "mixed") return;
  loading.value = true; examError.value = "";
  try {
    const result = await getExamList({ page: pageable.pageNum, page_size: pageable.pageSize, keyword: filters.keyword || undefined, status: filters.status || undefined, primary_category_id: filters.primaryCategoryId || undefined });
    rows.value = (result.records || []).map(mapExam); stats.value = result.stats || []; pageable.total = Number(result.total || 0); tableRef.value?.clearSelection(); selectedRows.value = [];
  } catch (e) { rows.value = []; stats.value = []; pageable.total = 0; examError.value = e.message || t("exam.apiUnavailable"); }
  finally { loading.value = false; }
}
async function loadCategories() { try { const response = await getSopCategoryTree(); categories.value = response.data?.results || []; } catch { categories.value = []; } }
onMounted(() => { loadCategories(); loadExams(); });
</script>

<style scoped>
.exam-management { display: grid; gap: 16px; }.page-heading { margin-bottom: -8px; padding: 0; }.page-heading h2 { margin: 0; line-height: 1.3; }.page-heading p, .stat-grid p, small { display: block; margin-top: 3px; color: var(--el-text-color-secondary); }.stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }.stat-name { color: var(--el-text-color-secondary); }.stat-grid strong { display: block; font-size: 28px; margin-top: 8px; }.filter-card :deep(.el-card__body) { padding: 18px; }.list-card :deep(.el-card__body) { padding: 12px; }.quick-filters, .filter-actions, .toolbar-actions { display: flex; flex-wrap: wrap; gap: 8px; }.quick-filters { margin-bottom: 14px; }.filter-form { display: flex; flex-wrap: wrap; gap: 12px; }.filter-form .el-input { width: 240px; }.filter-form .el-select { width: 150px; }.list-toolbar { display: flex; align-items: center; justify-content: space-between; min-height: 32px; margin-bottom: 8px; }.ellipsis { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.table-cell-center, .question-tags, .operation-actions, .category-cell { display: flex; align-items: center; justify-content: center; gap: 6px; }.question-tags { flex-wrap: wrap; }.category-cell { flex-wrap: wrap; }.category-tag { min-width: 52px; height: 23px; padding: 0 9px; border: 0; border-radius: 12px; font-size: 12px; }.category-primary-tag { color: #1677ff; background: #e6f4ff; }.category-secondary-tag { color: #5f6b7a; background: #f4f6f9; }.category-uncategorized { color: #7b8492; background: #f4f6f9; }.operation-actions { flex-wrap: nowrap; white-space: nowrap; }.operation-actions :deep(.el-button + .el-button) { margin-left: 0; }.exam-table { border-radius: 4px; overflow: hidden; }.exam-table :deep(th.el-table__cell) { background: var(--el-fill-color-light); color: var(--el-text-color-primary); font-weight: 600; text-align: center; }.exam-table :deep(td.el-table__cell) { padding: 8px 0; }.exam-table :deep(.el-table__cell) { border-right-color: var(--el-border-color-lighter); }.question-tag { margin: 0; }.pagination { justify-content: flex-end; margin-top: 8px; } @media (max-width: 1024px) { .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } } @media (max-width: 640px) { .stat-grid { grid-template-columns: 1fr; }.list-toolbar { align-items: flex-start; flex-direction: column; } }
</style>
