<template>
  <div class="exam-management">
    <section class="page-heading"><div><h2>{{ t('exam.title') }}</h2><p>{{ t('exam.subtitle') }}</p></div><el-button type="primary" :icon="Plus" @click="openDrawer()">{{ t('exam.create') }}</el-button></section>
    <section class="stat-grid"><el-card v-for="item in statCards" :key="item.type"><div class="stat-name">{{ t(`exam.types.${item.type}`) }}</div><strong>{{ item.total }}</strong><p>{{ t('exam.published') }} {{ item.published }} · {{ t('exam.inProgress') }} {{ item.inProgress }}</p><el-button link type="primary" @click="openDrawer(item.type)">{{ t('exam.createType', { type: t(`exam.types.${item.type}`) }) }}</el-button></el-card></section>
    <el-alert v-if="examError" :title="examError" type="warning" :closable="false" show-icon class="api-notice" />
    <el-card class="filters"><el-form :inline="true" :model="filters"><el-form-item :label="t('exam.name')"><el-input v-model="filters.keyword" clearable /></el-form-item><el-form-item :label="t('exam.status')"><el-select v-model="filters.status" clearable><el-option :label="t('exam.draft')" value="draft" /><el-option :label="t('exam.published')" value="published" /><el-option :label="t('exam.ended')" value="ended" /></el-select></el-form-item><el-form-item :label="t('exam.primaryCategory')"><el-select v-model="filters.primaryCategoryId" clearable @change="filters.categoryId = ''"><el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item><el-form-item :label="t('exam.secondaryCategory')"><el-select v-model="filters.categoryId" clearable><el-option v-for="item in secondaryCategories" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item><el-button type="primary" @click="page = 1">{{ t('exam.search') }}</el-button><el-button @click="resetFilters">{{ t('exam.reset') }}</el-button></el-form></el-card>
    <el-card><el-table v-loading="loading" :data="pagedRows"><el-table-column type="selection" width="52" /><el-table-column prop="name" :label="t('exam.name')" min-width="180" /><el-table-column :label="t('exam.versionAndCreated')" min-width="170"><template #default="{ row }">{{ row.version || '-' }}<br><small>{{ row.created_at || '-' }}</small></template></el-table-column><el-table-column :label="t('exam.category')" min-width="140"><template #default="{ row }">{{ row.primary_category_name || '-' }} / {{ row.category_name || '-' }}</template></el-table-column><el-table-column :label="t('exam.sourcePractice')" min-width="180"><template #default="{ row }">{{ row.source_names?.join('、') || '-' }}</template></el-table-column><el-table-column :label="t('exam.questionComposition')" min-width="160"><template #default="{ row }">{{ row.question_configs?.map(item => `${item.label || item.type} ${item.count}`).join('；') || '-' }}</template></el-table-column><el-table-column :label="t('exam.rules')" min-width="140"><template #default="{ row }">{{ row.duration }}{{ t('exam.minutes') }} / {{ row.pass_score }}{{ t('exam.points') }}</template></el-table-column><el-table-column prop="status" :label="t('exam.status')" width="110"><template #default="{ row }"><el-tag>{{ t(`exam.statuses.${row.status}`) }}</el-tag></template></el-table-column><el-table-column :label="t('common.operate')" fixed="right" width="160"><template #default="{ row }"><el-button link type="primary" @click="openDrawer(null, row)">{{ t('common.edit') }}</el-button><el-button link type="primary" @click="preview(row)">{{ t('common.preview') }}</el-button><el-button link type="danger" @click="remove(row)">{{ t('common.delete') }}</el-button></template></el-table-column></el-table><el-pagination v-if="filteredRows.length" v-model:current-page="page" layout="total, prev, pager, next" :total="filteredRows.length" :page-size="pageSize" class="pagination" /></el-card>
    <ExamFormDrawer v-model="drawerVisible" :exam="editingExam" @saved="loadExams" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { EXAM_API_UNAVAILABLE, deleteExam, getExamList, getSopCategoryTree } from "@/services/exam.api";
import ExamFormDrawer from "./components/ExamFormDrawer.vue";

const { t } = useI18n();
const rows = ref([]), categories = ref([]), loading = ref(false), examError = ref(""), drawerVisible = ref(false), editingExam = ref(null), page = ref(1), pageSize = 10;
const filters = reactive({ keyword: "", status: "", primaryCategoryId: "", categoryId: "" });
const secondaryCategories = computed(() => categories.value.find(item => item.id === filters.primaryCategoryId)?.children || []);
const filteredRows = computed(() => rows.value.filter(row => (!filters.keyword || row.name?.includes(filters.keyword)) && (!filters.status || row.status === filters.status) && (!filters.primaryCategoryId || row.primary_category_id === filters.primaryCategoryId) && (!filters.categoryId || row.category_id === filters.categoryId)));
const pagedRows = computed(() => filteredRows.value.slice((page.value - 1) * pageSize, page.value * pageSize));
const statCards = computed(() => ["product", "technical", "operation", "mixed"].map(type => { const data = rows.value.filter(row => row.type === type); return { type, total: data.length, published: data.filter(row => row.status === "published").length, inProgress: data.filter(row => row.status === "in_progress").length }; }));
function resetFilters() { Object.assign(filters, { keyword: "", status: "", primaryCategoryId: "", categoryId: "" }); page.value = 1; }
function openDrawer(type = null, exam = null) { editingExam.value = exam ? structuredClone(exam) : type ? { type } : null; drawerVisible.value = true; }
function preview(row) { openDrawer(null, row); }
async function remove(row) { try { await deleteExam(row.id); await loadExams(); } catch (e) { ElMessage.error(e.code === EXAM_API_UNAVAILABLE ? t("exam.apiUnavailable") : e.message); } }
async function loadExams() { loading.value = true; examError.value = ""; try { const response = await getExamList(); rows.value = response.data?.results?.records || []; } catch (e) { rows.value = []; examError.value = e.code === EXAM_API_UNAVAILABLE ? t("exam.apiUnavailable") : e.message || t("exam.apiUnavailable"); } finally { loading.value = false; } }
async function loadCategories() { try { const response = await getSopCategoryTree(); categories.value = response.data?.results || []; } catch { categories.value = []; } }
onMounted(() => { loadExams(); loadCategories(); });
</script>

<style scoped>
.exam-management { display: grid; gap: 16px; }.page-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; }.page-heading h2 { margin: 0; }.page-heading p, .stat-grid p { margin: 6px 0 0; color: var(--el-text-color-secondary); }.stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }.stat-name { color: var(--el-text-color-secondary); }.stat-grid strong { display: block; font-size: 28px; margin-top: 8px; }.api-notice { margin-bottom: 0; }.pagination { justify-content: flex-end; margin-top: 16px; } @media (max-width: 1024px) { .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } } @media (max-width: 640px) { .stat-grid { grid-template-columns: 1fr; }.page-heading { align-items: flex-start; flex-direction: column; } }
</style>
