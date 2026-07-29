<template>
  <div class="exam-management">
    <section class="page-heading"><div><h2>{{ t('exam.title') }}</h2><p>{{ t('exam.subtitle') }}</p></div></section>
    <section class="stat-grid"><el-card v-for="item in statCards" :key="item.type"><div class="stat-name">{{ t(`exam.types.${item.type}`) }}</div><strong>{{ item.total }}</strong><p>{{ t('exam.published') }} {{ item.published }} · {{ t('exam.inProgress') }} {{ item.inProgress }}</p><el-button link type="primary" @click="openDrawer(item.type)">{{ t('exam.createType', { type: t(`exam.types.${item.type}`) }) }}</el-button></el-card></section>
    <el-alert v-if="examError" :title="examError" type="warning" :closable="false" show-icon />

    <el-card class="filter-card">
      <div class="filter-title">{{ t('exam.title') }}</div>
      <div class="quick-filters"><el-button :type="!filters.primaryCategoryId ? 'primary' : 'default'" @click="selectPrimary('')">{{ t('common.all') }}</el-button><el-button v-for="item in categories" :key="item.id" :type="String(filters.primaryCategoryId) === String(item.id) ? 'primary' : 'default'" @click="selectPrimary(item.id)">{{ item.name }}</el-button></div>
      <el-form :model="filters" class="filter-form" @submit.prevent="search">
        <el-input v-model="filters.keyword" clearable :placeholder="t('exam.name')" @keyup.enter="search" />
        <el-select v-model="filters.categoryId" clearable :placeholder="t('exam.secondaryCategory')"><el-option v-for="item in secondaryCategories" :key="item.id" :label="item.name" :value="item.id" /></el-select>
        <el-select v-model="filters.status" clearable :placeholder="t('exam.status')"><el-option :label="t('exam.draft')" value="draft" /><el-option :label="t('exam.published')" value="published" /><el-option :label="t('exam.ended')" value="ended" /></el-select>
        <div class="filter-actions"><el-button type="primary" @click="search">{{ t('exam.search') }}</el-button><el-button @click="resetFilters">{{ t('exam.reset') }}</el-button></div>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <div class="list-toolbar"><div><strong>{{ t('exam.title') }}</strong><span class="total">{{ total }}</span></div><div class="toolbar-actions"><el-button type="primary" :icon="Plus" @click="openDrawer()">{{ t('exam.create') }}</el-button><el-button type="danger" plain :disabled="!selectedRows.length" @click="batchRemove">{{ t('common.batchDelete') }}</el-button><el-button :icon="Refresh" circle :title="t('tabs.refresh')" @click="loadExams" /></div></div>
      <el-table ref="tableRef" v-loading="loading" :data="rows" row-key="id" :empty-text="t('SopPicker.noData')" @selection-change="selectedRows = $event">
        <el-table-column type="selection" width="52" :selectable="row => row.can_delete" reserve-selection />
        <el-table-column :label="t('exam.name')" min-width="190"><template #default="{ row }"><el-tooltip :content="row.name" placement="top"><strong class="ellipsis">{{ row.name }}</strong></el-tooltip><small>{{ row.version || '-' }} · {{ row.created_at || '-' }}</small></template></el-table-column>
        <el-table-column :label="t('exam.category')" min-width="110"><template #default="{ row }"><el-tag size="small" effect="plain" :class="categoryClass(row.primary_category_name)">{{ row.primary_category_name || '-' }}</el-tag><small v-if="row.category_name && row.category_name !== row.primary_category_name">{{ row.category_name }}</small></template></el-table-column>
        <el-table-column :label="t('exam.sourcePractice')" min-width="200"><template #default="{ row }"><el-tooltip :content="row.source_names?.join('、') || '-'" placement="top"><span class="ellipsis">{{ sourceText(row) }}</span></el-tooltip><small v-if="row.source_count">{{ row.source_count }} {{ t('exam.practice') }}</small></template></el-table-column>
        <el-table-column :label="t('exam.questionComposition')" min-width="190"><template #default="{ row }"><el-tag v-for="item in row.question_configs" :key="item.type" size="small" effect="plain" class="question-tag">{{ item.label }} {{ item.count }}</el-tag><span v-if="!row.question_configs.length">-</span></template></el-table-column>
        <el-table-column :label="t('exam.rules')" min-width="120"><template #default="{ row }">{{ row.duration }} {{ t('exam.minutes') }}<small>{{ t('exam.passScore') }} {{ row.pass_score }} {{ t('exam.points') }}</small></template></el-table-column>
        <el-table-column :label="t('exam.status')" width="105"><template #default="{ row }"><el-tag :type="statusTag(row.status)" effect="light">{{ t(`exam.statuses.${row.status}`) }}</el-tag></template></el-table-column>
        <el-table-column :label="t('common.operate')" fixed="right" width="170"><template #default="{ row }"><el-button link type="primary" @click="preview(row)">{{ t('common.preview') }}</el-button><el-button v-if="row.can_edit" link type="primary" @click="openDrawer(null, row)">{{ t('common.edit') }}</el-button><el-button v-if="row.can_publish" link type="success" @click="publish(row)">{{ t('exam.publishNow') }}</el-button><el-button v-if="row.can_delete" link type="danger" @click="remove(row)">{{ t('common.delete') }}</el-button></template></el-table-column>
      </el-table>
      <el-pagination v-if="total" v-model:current-page="page" :page-size="pageSize" layout="total, prev, pager, next" :total="total" class="pagination" @current-change="loadExams" />
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
import ExamFormDrawer from "./components/ExamFormDrawer.vue";

const { t } = useI18n();
const tableRef = ref(), rows = ref([]), stats = ref([]), total = ref(0), categories = ref([]), loading = ref(false), examError = ref("");
const drawerVisible = ref(false), editingExam = ref(null), page = ref(1), pageSize = 10, selectedRows = ref([]);
const filters = reactive({ keyword: "", status: "", primaryCategoryId: "", categoryId: "" });
const secondaryCategories = computed(() => categories.value.find(item => String(item.id) === String(filters.primaryCategoryId))?.children || []);
const statCards = computed(() => ["product", "technical", "operation", "mixed"].map(type => { const data = stats.value.filter(row => examType(row) === type); return { type, total: data.reduce((sum, row) => sum + Number(row.total || 0), 0), published: data.reduce((sum, row) => sum + Number(row.published || 0), 0), inProgress: data.reduce((sum, row) => sum + Number(row.in_progress || 0), 0) }; }));
const questionTypeLabels = { fill_blank: t("exam.types.fillBlank"), short_answer: t("exam.types.qa"), single_choice: t("exam.types.singleChoice"), multiple_choice: t("exam.types.multipleChoice"), true_false: t("exam.types.judgement") };
function categoryInfo(categoryId) { const primary = categories.value.find(item => String(item.id) === String(categoryId) || item.children?.some(child => String(child.id) === String(categoryId))); return { primary, secondary: primary?.children?.find(child => String(child.id) === String(categoryId)) }; }
function examType(row) { if (row.exam_type === "mixed") return "mixed"; const name = row.primary_category_name || categoryInfo(row.category_id).primary?.name || ""; if (name.includes("技术")) return "technical"; if (name.includes("运营")) return "operation"; return "product"; }
function mapExam(row) { return { ...row, type: examType(row), source_names: Array.isArray(row.source_names) ? row.source_names : [], question_configs: (row.question_configs || []).map(item => ({ type: item.question_type, label: questionTypeLabels[item.question_type] || item.question_type, count: item.question_count ?? 0 })) }; }
function sourceText(row) { const [first] = row.source_names || []; return !first ? "-" : `${first}${row.source_count > 1 ? ` +${row.source_count - 1}` : ""}`; }
function categoryClass(name) { return { 产品: "category-product", 技术: "category-technical", 运营: "category-operation", 混合: "category-mixed" }[name] || ""; }
function statusTag(status) { return { draft: "warning", published: "success", ended: "info" }[status] || "info"; }
function search() { page.value = 1; loadExams(); }
function selectPrimary(id) { filters.primaryCategoryId = id; filters.categoryId = ""; search(); }
function resetFilters() { Object.assign(filters, { keyword: "", status: "", primaryCategoryId: "", categoryId: "" }); search(); }
function openDrawer(type = null, exam = null) { editingExam.value = exam ? structuredClone(exam) : type ? { type } : null; drawerVisible.value = true; }
function preview(row) { openDrawer(null, row); }
async function remove(row) { try { await ElMessageBox.confirm(t("common.batchDeleteTip", { num: 1 }), t("header.tip"), { type: "warning" }); await deleteExam(row.id); ElMessage.success(t("common.deleteSuccess")); loadExams(); } catch (e) { if (e !== "cancel" && e !== "close") ElMessage.error(e.message || t("exam.saveFailed")); } }
async function batchRemove() { try { await ElMessageBox.confirm(t("common.batchDeleteTip", { num: selectedRows.value.length }), t("header.tip"), { type: "warning" }); await batchDeleteExams(selectedRows.value.map(row => row.id)); ElMessage.success(t("common.deleteSuccess")); selectedRows.value = []; loadExams(); } catch (e) { if (e !== "cancel" && e !== "close") ElMessage.error(e.message || t("exam.saveFailed")); } }
async function loadExams() { loading.value = true; examError.value = ""; try { const result = await getExamList({ page: page.value, page_size: pageSize, keyword: filters.keyword || undefined, status: filters.status || undefined, primary_category_id: filters.primaryCategoryId || undefined, category_id: filters.categoryId || undefined }); rows.value = (result.records || []).map(mapExam); stats.value = result.stats || []; total.value = Number(result.total || 0); tableRef.value?.clearSelection(); selectedRows.value = []; } catch (e) { rows.value = []; stats.value = []; total.value = 0; examError.value = e.message || t("exam.apiUnavailable"); } finally { loading.value = false; } }
async function loadCategories() { try { const response = await getSopCategoryTree(); categories.value = response.data?.results || []; } catch { categories.value = []; } }
onMounted(async () => { await loadCategories(); loadExams(); });
</script>

<style scoped>
.exam-management { display: grid; gap: 16px; }.page-heading h2 { margin: 0; }.page-heading p, .stat-grid p, small { display: block; margin-top: 5px; color: var(--el-text-color-secondary); }.stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }.stat-name { color: var(--el-text-color-secondary); }.stat-grid strong { display: block; font-size: 28px; margin-top: 8px; }.filter-card :deep(.el-card__body), .list-card :deep(.el-card__body) { padding: 18px; }.filter-title { margin-bottom: 12px; font-weight: 600; }.quick-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }.filter-form { display: grid; grid-template-columns: minmax(200px, 2fr) repeat(2, minmax(150px, 1fr)) auto; gap: 12px; }.filter-actions, .toolbar-actions { display: flex; gap: 8px; }.filter-actions { justify-content: flex-end; }.list-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 14px; }.total { margin-left: 10px; color: var(--el-text-color-secondary); font-size: 13px; }.ellipsis { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.question-tag { margin: 0 4px 4px 0; }.category-product { --el-tag-bg-color: #ecf5ff; --el-tag-border-color: #d9ecff; --el-tag-text-color: #409eff; }.category-technical { --el-tag-bg-color: #f0f9eb; --el-tag-border-color: #e1f3d8; --el-tag-text-color: #67c23a; }.category-operation { --el-tag-bg-color: #fdf6ec; --el-tag-border-color: #faecd8; --el-tag-text-color: #e6a23c; }.category-mixed { --el-tag-bg-color: #f4f4f5; --el-tag-border-color: #e9e9eb; --el-tag-text-color: #909399; }.pagination { justify-content: flex-end; margin-top: 16px; } @media (max-width: 1024px) { .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.filter-form { grid-template-columns: repeat(2, minmax(0, 1fr)); }.filter-actions { justify-content: flex-start; } } @media (max-width: 640px) { .stat-grid, .filter-form { grid-template-columns: 1fr; }.list-toolbar { align-items: flex-start; flex-direction: column; }.toolbar-actions { flex-wrap: wrap; } }
</style>
