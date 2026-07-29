<template>
  <div class="selector">
    <div class="filters">
      <el-input v-model="keyword" clearable :placeholder="t('exam.searchPractice')" />
      <el-select v-model="primaryCategoryId" clearable :placeholder="t('exam.primaryCategory')" @change="categoryId = ''">
        <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select v-model="categoryId" clearable :placeholder="t('exam.secondaryCategory')">
        <el-option v-for="item in secondaryCategories" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </div>
    <el-table ref="tableRef" v-loading="loading" :data="filteredPractices" row-key="id" max-height="300" @selection-change="onSelectionChange">
      <el-table-column type="selection" width="50" :reserve-selection="true" :selectable="() => !disabled" />
      <el-table-column prop="title" :label="t('exam.practice')" min-width="180" />
      <el-table-column prop="sop_version" :label="t('exam.version')" width="110" />
      <el-table-column :label="t('exam.category')" min-width="150">
        <template #default="{ row }">{{ [row.primary_category_name, row.category_name].filter(Boolean).join(' / ') || '-' }}</template>
      </el-table-column>
      <el-table-column prop="filename" :label="t('exam.sourceFile')" min-width="160" show-overflow-tooltip />
      <el-table-column :label="t('exam.questionCount')" width="110"><template #default="{ row }">{{ row.question_count ?? '-' }}</template></el-table-column>
    </el-table>
    <el-alert v-if="error" type="error" :title="error" :closable="false" show-icon />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getSopCategoryTree, getSops } from "@/services/exam.api";

const props = defineProps({ modelValue: { type: Array, default: () => [] }, disabled: Boolean });
const emit = defineEmits(["update:modelValue"]);
const { t } = useI18n();
const tableRef = ref(), practices = ref([]), categories = ref([]), loading = ref(false), error = ref("");
const keyword = ref(""), primaryCategoryId = ref(""), categoryId = ref("");
const secondaryCategories = computed(() => categories.value.find(item => item.id === primaryCategoryId.value)?.children || []);
const filteredPractices = computed(() => practices.value.filter(item => {
  const text = `${item.title || ""} ${item.filename || ""}`.toLowerCase();
  return (!keyword.value || text.includes(keyword.value.toLowerCase()))
    && (!primaryCategoryId.value || item.primary_category_id === primaryCategoryId.value)
    && (!categoryId.value || item.category_id === categoryId.value);
}));

function practiceId(item) { return Number(item.id ?? item.practice_id ?? item.sop_id ?? item.source_ref_id); }
function restoreSelection() { nextTick(() => { const ids = new Set(props.modelValue.map(practiceId)); tableRef.value?.clearSelection(); practices.value.filter(item => ids.has(practiceId(item))).forEach(item => tableRef.value?.toggleRowSelection(item, true)); }); }
function onSelectionChange(rows) { if (!props.disabled) emit("update:modelValue", rows); }
async function load() {
  loading.value = true; error.value = "";
  try {
    const [categoryResult, practiceResult] = await Promise.allSettled([
      getSopCategoryTree(), getSops({ pageNum: 1, pageSize: 100 }),
    ]);
    if (categoryResult.status === "fulfilled" && categoryResult.value.data?.status === 200) categories.value = categoryResult.value.data.results || [];
    if (practiceResult.status !== "fulfilled" || practiceResult.value.data?.status !== 200) throw new Error(t("exam.loadPracticeFailed"));
    practices.value = practiceResult.value.data.results?.records || [];
    if (!categories.value.length) error.value = t("exam.categoryUnavailable");
    restoreSelection();
  } catch (e) { error.value = e.message || t("exam.loadPracticeFailed"); }
  finally { loading.value = false; }
}
onMounted(load);
</script>

<style scoped>
.selector { display: grid; gap: 12px; }
.filters { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
@media (max-width: 768px) { .filters { grid-template-columns: 1fr; } }
</style>
