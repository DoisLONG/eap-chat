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
    <div v-loading="loading" class="practice-grid">
      <el-empty v-if="!loading && !filteredPractices.length" :description="t('SopPicker.noData')" :image-size="64" />
      <article v-for="row in filteredPractices" :key="practiceId(row)" class="practice-card" :class="{ selected: isSelected(row), disabled: !isCompatible(row) || disabled }" @click="toggle(row)">
        <el-checkbox :model-value="isSelected(row)" :disabled="!isCompatible(row) || disabled" @click.stop @change="toggle(row)" />
        <div class="practice-content">
          <el-tooltip :content="row.title || row.name || '-'" placement="top"><strong class="ellipsis">{{ row.title || row.name || '-' }}</strong></el-tooltip>
          <p class="practice-meta">{{ categoryText(row) }} · {{ row.sop_version || row.version || '-' }} · {{ row.filename || '-' }}</p>
          <p class="practice-count">{{ t('examForm.sourceQuestionBank', { summary: questionSummary(row) }) }}</p>
        </div>
      </article>
    </div>
    <el-alert v-if="error" type="error" :title="error" :closable="false" show-icon />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getSopCategoryTree, getSops } from "@/services/exam.api";

const props = defineProps({ modelValue: { type: Array, default: () => [] }, disabled: Boolean, examType: { type: String, default: "product" } });
const emit = defineEmits(["update:modelValue"]);
const { t } = useI18n();
const practices = ref([]), categories = ref([]), loading = ref(false), error = ref("");
const keyword = ref(""), primaryCategoryId = ref(""), categoryId = ref("");
const secondaryCategories = computed(() => categories.value.find(item => String(item.id) === String(primaryCategoryId.value))?.children || []);
const selectedIds = computed(() => new Set(props.modelValue.map(practiceId)));
const filteredPractices = computed(() => practices.value.filter(item => {
  const text = `${item.title || ""} ${item.filename || ""}`.toLowerCase();
  return (!keyword.value || text.includes(keyword.value.toLowerCase()))
    && (!primaryCategoryId.value || String(item.primary_category_id) === String(primaryCategoryId.value))
    && (!categoryId.value || String(item.category_id) === String(categoryId.value));
}));

function practiceId(item) { return Number(item.id ?? item.practice_id ?? item.sop_id ?? item.source_ref_id); }
function categoryText(row) { return [row.primary_category_name, row.category_name].filter(Boolean).join(" / ") || "-"; }
function questionSummary(row) { return row.question_count == null ? t("examForm.noQuestionData") : `${row.question_count} ${t("exam.questionCount")}`; }
function categoryType(row) { const name = row.primary_category_name || ""; if (name.includes("技术")) return "technical"; if (name.includes("运营")) return "operation"; return "product"; }
function isCompatible(row) { return props.examType === "mixed" || categoryType(row) === props.examType; }
function isSelected(row) { return selectedIds.value.has(practiceId(row)); }
function toggle(row) {
  if (props.disabled || !isCompatible(row)) return;
  const ids = new Set(selectedIds.value);
  const id = practiceId(row);
  ids.has(id) ? ids.delete(id) : ids.add(id);
  emit("update:modelValue", practices.value.filter(item => ids.has(practiceId(item))));
}
function resolveSelection() {
  const ids = selectedIds.value;
  if (ids.size) emit("update:modelValue", practices.value.filter(item => ids.has(practiceId(item))));
}
async function load() {
  loading.value = true; error.value = "";
  try {
    const [categoryResult, practiceResult] = await Promise.allSettled([getSopCategoryTree(), getSops({ pageNum: 1, pageSize: 100 })]);
    if (categoryResult.status === "fulfilled" && categoryResult.value.data?.status === 200) categories.value = categoryResult.value.data.results || [];
    if (practiceResult.status !== "fulfilled" || practiceResult.value.data?.status !== 200) throw new Error(t("exam.loadPracticeFailed"));
    practices.value = practiceResult.value.data.results?.records || [];
    if (!categories.value.length) error.value = t("exam.categoryUnavailable");
    resolveSelection();
  } catch (e) { error.value = e.message || t("exam.loadPracticeFailed"); }
  finally { loading.value = false; }
}
onMounted(load);
</script>

<style scoped>
.selector { display: grid; gap: 12px; }.filters { display: grid; grid-template-columns: minmax(200px, 1fr) 160px 160px; gap: 10px; }.practice-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; max-height: 360px; overflow: auto; padding-right: 2px; }.practice-card { display: grid; grid-template-columns: 20px minmax(0, 1fr); gap: 10px; min-height: 92px; padding: 12px; border: 1px solid var(--el-border-color); border-radius: 8px; background: var(--el-bg-color); cursor: pointer; transition: border-color .2s, background .2s; }.practice-card:hover:not(.disabled), .practice-card.selected { border-color: var(--el-color-primary-light-5); background: var(--el-color-primary-light-9); }.practice-card.disabled { cursor: not-allowed; opacity: .55; }.practice-content { min-width: 0; }.ellipsis { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.practice-meta, .practice-count { margin: 6px 0 0; color: var(--el-text-color-secondary); font-size: 12px; line-height: 1.45; }.practice-count { color: var(--el-color-primary); } @media (max-width: 760px) { .filters, .practice-grid { grid-template-columns: 1fr; } }
</style>
