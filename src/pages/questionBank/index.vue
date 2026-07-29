<template>
  <div class="question-bank-page">
    <div class="content">
      <section class="panel">
        <h2 class="filter-title">题库筛选</h2>
        <div class="category-tabs">
          <button v-for="item in primaryCategories" :key="item.value" class="category-tab"
            :class="{ active: filters.primaryCategory === item.value }" @click="selectPrimary(item.value)">{{ item.label }}</button>
        </div>
        <div v-if="secondaryCategories.length" class="secondary-tabs">
          <button v-for="item in secondaryCategories" :key="item.value" class="category-subtab"
            :class="{ active: filters.secondaryCategory === item.value }" @click="selectSecondary(item.value)">{{ item.label }}</button>
        </div>
        <div class="filters">
          <input v-model="filters.keyword" placeholder="输入题目关键词" @input="scheduleKeywordSearch" @keyup.enter="search" />
          <select v-model="filters.materialId" @change="search"><option value="">全部资料</option><option v-for="item in materials" :key="item.id" :value="item.id">{{ item.name }}</option></select>
          <select v-model="filters.type" @change="search"><option value="">全部题型</option><option value="choice">选择题</option><option value="essay">问答题</option></select>
          <button class="btn primary" @click="search">搜索</button><button class="btn" @click="resetFilters">重置</button>
        </div>
      </section>

      <section class="panel">
        <div class="table-head"><h2>题库列表</h2><span class="total">共 {{ total }} 条</span><button class="btn batch-delete" :disabled="!selectedIds.size || loading" @click="deleteDialogVisible = true">批量删除</button></div>
        <p v-if="loadError" class="load-error">{{ loadError }}</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th style="width: 48px"><input type="checkbox" :checked="allSelected" :indeterminate="partiallySelected" aria-label="全选" @change="toggleAll" /></th><th style="width: 60px">序号</th><th>题目内容</th><th style="width: 150px">所属类别</th><th style="width: 90px">题目类型</th><th style="width: 230px">来源资料</th><th style="width: 88px">操作</th></tr></thead>
            <tbody>
              <tr v-for="(question, index) in questions" :key="question.id">
                <td><input type="checkbox" :checked="selectedIds.has(question.id)" @change="toggleOne(question.id, $event.target.checked)" /></td>
                <td>{{ (page - 1) * pageSize + index + 1 }}</td><td :title="question.text">{{ question.text }}</td><td><span class="category-tag">{{ categoryText(question) }}</span></td><td><span class="type-tag">{{ typeText(question.type) }}</span></td><td :title="question.materialName">{{ question.materialName }}</td><td><button class="link-btn" @click="openDetail(question.id)">查看详情</button></td>
              </tr>
              <tr v-if="!loading && !questions.length"><td colspan="7" class="empty">暂无题目记录</td></tr>
              <tr v-if="loading"><td colspan="7" class="empty">正在读取题库数据…</td></tr>
            </tbody>
          </table>
        </div>
        <div class="pagination"><span>第 {{ page }} / {{ pageCount }} 页</span><button class="btn" :disabled="page === 1 || loading" @click="changePage(page - 1)">上一页</button><button class="btn" :disabled="page === pageCount || loading" @click="changePage(page + 1)">下一页</button></div>
      </section>
    </div>

    <div class="modal" :class="{ show: detailDialogVisible }" @click.self="closeDetail"><div class="dialog"><div class="dialog-head">题目详情<button class="close" @click="closeDetail">×</button></div><div v-if="currentQuestion" class="dialog-body"><dl class="detail-grid"><dt>题目内容</dt><dd><template v-if="editingField === 'text'"><textarea v-model="editValue" class="detail-input" rows="3"></textarea><span class="field-actions"><button class="link-btn" :disabled="saving" @click="saveField('text')">保存</button><button class="link-btn secondary-link" :disabled="saving" @click="cancelFieldEdit">取消</button></span></template><template v-else>{{ currentQuestion.text }}<button class="link-btn edit-field-btn" @click="startFieldEdit('text')">编辑</button></template></dd><dt>所属类别</dt><dd>{{ categoryText(currentQuestion) }}</dd><dt>题目类型</dt><dd>{{ typeText(currentQuestion.type) }}</dd><dt>来源资料</dt><dd>{{ currentQuestion.materialName }}</dd><template v-if="currentQuestion.options.length"><dt>选项</dt><dd class="options"><div v-for="(option, index) in currentQuestion.options" :key="index">{{ optionLabel(index) }}. {{ option }}</div></dd></template><dt>答案</dt><dd class="answer"><template v-if="editingField === 'answer'"><textarea v-model="editValue" class="detail-input" rows="3"></textarea><span class="field-actions"><button class="link-btn" :disabled="saving" @click="saveField('answer')">保存</button><button class="link-btn secondary-link" :disabled="saving" @click="cancelFieldEdit">取消</button></span></template><template v-else>{{ currentQuestion.answer }}<button class="link-btn edit-field-btn" @click="startFieldEdit('answer')">编辑</button></template></dd><dt>解析</dt><dd>{{ currentQuestion.analysis }}</dd></dl></div><div class="dialog-foot"><button class="btn" @click="closeDetail">关闭</button></div></div></div>
    <div class="modal" :class="{ show: deleteDialogVisible }" @click.self="deleteDialogVisible = false"><div class="dialog delete-dialog"><div class="dialog-head">删除确认<button class="close" @click="deleteDialogVisible = false">×</button></div><div class="dialog-body"><p>确认删除已选择的 {{ selectedIds.size }} 道题目吗？删除后不会在题库列表展示。</p></div><div class="dialog-foot"><button class="btn" :disabled="saving" @click="deleteDialogVisible = false">取消</button><button class="btn primary" :disabled="saving" @click="confirmDelete">确认删除</button></div></div></div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { deleteQuestionBankItems, getQuestionBankCategories, getQuestionBankDetail, getQuestionBankList, getQuestionBankMaterials, updateQuestionBankItem } from "@/services/questionBank.service";

const pageSize = 8;
const page = ref(1); const total = ref(0); const questions = ref([]); const materials = ref([]); const categoryTree = ref([]);
const selectedIds = ref(new Set()); const currentQuestion = ref(null); const detailDialogVisible = ref(false); const deleteDialogVisible = ref(false);
const editingField = ref(""); const editValue = ref(""); const loading = ref(false); const saving = ref(false); const loadError = ref("");
const filters = reactive({ keyword: "", primaryCategory: "", secondaryCategory: "", materialId: "", type: "" });
let keywordSearchTimer;

const primaryCategories = computed(() => [{ value: "", label: "全部" }, ...categoryTree.value]);
const selectedPrimary = computed(() => categoryTree.value.find((item) => item.value === filters.primaryCategory));
const secondaryCategories = computed(() => selectedPrimary.value?.children || []);
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));
const allSelected = computed(() => questions.value.length > 0 && questions.value.every((item) => selectedIds.value.has(item.id)));
const partiallySelected = computed(() => !allSelected.value && questions.value.some((item) => selectedIds.value.has(item.id)));
const typeText = (type) => ({ choice: "选择题", essay: "问答题" }[type] || type || "--");
const optionLabel = (index) => String.fromCharCode(65 + index);
const categoryText = (question) => question.secondaryCategoryName ? `${question.primaryCategoryName} / ${question.secondaryCategoryName}` : question.primaryCategoryName || "--";

const showError = (error, fallback) => { loadError.value = error.response?.data?.detail || error.message || fallback; };
const loadMaterials = async () => { materials.value = await getQuestionBankMaterials(filters); };
const loadQuestions = async () => {
  loading.value = true; loadError.value = "";
  try {
    let result = await getQuestionBankList({ filters, page: page.value, pageSize });
    if (!result.items.length && result.total && page.value > 1) { page.value -= 1; result = await getQuestionBankList({ filters, page: page.value, pageSize }); }
    questions.value = result.items; total.value = result.total; selectedIds.value = new Set();
  } catch (error) { questions.value = []; total.value = 0; showError(error, "题库数据读取失败"); } finally { loading.value = false; }
};
const search = async () => { page.value = 1; try { await loadMaterials(); } catch (error) { materials.value = []; showError(error, "资料筛选读取失败"); } await loadQuestions(); };
const scheduleKeywordSearch = () => { clearTimeout(keywordSearchTimer); keywordSearchTimer = setTimeout(search, 300); };
const selectPrimary = (value) => { filters.primaryCategory = value; filters.secondaryCategory = ""; filters.materialId = ""; search(); };
const selectSecondary = (value) => { filters.secondaryCategory = value; filters.materialId = ""; search(); };
const resetFilters = () => { Object.assign(filters, { keyword: "", primaryCategory: "", secondaryCategory: "", materialId: "", type: "" }); search(); };
const changePage = (value) => { if (value >= 1 && value <= pageCount.value) { page.value = value; loadQuestions(); } };
const toggleAll = (event) => { const next = new Set(selectedIds.value); questions.value.forEach((item) => event.target.checked ? next.add(item.id) : next.delete(item.id)); selectedIds.value = next; };
const toggleOne = (id, checked) => { const next = new Set(selectedIds.value); checked ? next.add(id) : next.delete(id); selectedIds.value = next; };
const openDetail = async (id) => { try { currentQuestion.value = await getQuestionBankDetail(id); editingField.value = ""; detailDialogVisible.value = true; } catch (error) { showError(error, "题目详情读取失败"); } };
const closeDetail = () => { detailDialogVisible.value = false; currentQuestion.value = null; editingField.value = ""; };
const startFieldEdit = (field) => { editingField.value = field; editValue.value = currentQuestion.value?.[field] || ""; };
const cancelFieldEdit = () => { editingField.value = ""; editValue.value = ""; };
const saveField = async (field) => { if (!currentQuestion.value || !editValue.value.trim()) return; saving.value = true; try { currentQuestion.value = await updateQuestionBankItem(currentQuestion.value.id, { [field]: editValue.value }); cancelFieldEdit(); await loadQuestions(); } catch (error) { showError(error, "题目编辑失败"); } finally { saving.value = false; } };
const confirmDelete = async () => { if (!selectedIds.value.size) return; saving.value = true; try { await deleteQuestionBankItems([...selectedIds.value]); deleteDialogVisible.value = false; await loadQuestions(); } catch (error) { showError(error, "题目删除失败"); } finally { saving.value = false; } };

onMounted(async () => { try { categoryTree.value = await getQuestionBankCategories(); await loadMaterials(); } catch (error) { showError(error, "题库筛选读取失败"); } await loadQuestions(); });
onBeforeUnmount(() => clearTimeout(keywordSearchTimer));
</script>

<style scoped>
.question-bank-page { min-width: 0; color: #1f2937; font: 14px "Microsoft YaHei", Arial, sans-serif; }.content { padding: 0; }.panel { padding: 16px; margin-bottom: 14px; background: #fff; border: 1px solid #edf0f4; border-radius: 6px; box-shadow: 0 2px 8px rgba(16, 24, 40, .04); }.filter-title { margin: 0 0 12px; font-size: 15px; }.category-tabs, .secondary-tabs, .filters { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }.secondary-tabs { margin-top: 10px; padding: 10px 12px; border-radius: 8px; background: #f6f8fc; }.filters { margin-top: 16px; gap: 10px; }.category-tab, .category-subtab, .btn { cursor: pointer; font: inherit; }.category-tab { height: 36px; padding: 0 17px; border: 1px solid transparent; border-radius: 8px; background: #f1f4f8; color: #475467; }.category-subtab { height: 32px; padding: 0 14px; border: 1px solid #e0e7f0; border-radius: 999px; background: #fff; color: #475467; font-size: 12px; }.category-tab.active, .btn.primary { color: #fff; border-color: #1677ff; background: #1677ff; }.category-subtab.active, .category-tag, .type-tag { color: #1677ff; border-color: #91bfff; background: #eaf3ff; } input, select, .btn { height: 34px; padding: 0 10px; border: 1px solid #d9e0e8; border-radius: 4px; background: #fff; color: #344054; font: inherit; } input { width: 220px; } input[type="checkbox"] { width: 16px; height: 16px; padding: 0; vertical-align: middle; accent-color: #1677ff; cursor: pointer; }.btn:disabled, .link-btn:disabled { color: #98a2b3; background: #f5f7fa; cursor: not-allowed; }.table-head { display: flex; align-items: center; margin-bottom: 13px; }.table-head h2 { margin: 0; font-size: 16px; }.total { margin-left: 10px; color: #98a2b3; }.batch-delete { margin-left: 12px; color: #d92d20; border-color: #f2c7c3; }.load-error { margin: 0 0 10px; color: #d92d20; }.table-wrap { overflow: auto; } table { width: 100%; border-collapse: collapse; table-layout: fixed; } th, td { height: 44px; padding: 0 10px; overflow: hidden; text-align: left; text-overflow: ellipsis; white-space: nowrap; border-bottom: 1px solid #edf0f4; } th { color: #667085; background: #f8fafc; font-weight: 600; } th:first-child, td:first-child { padding: 0; overflow: visible; text-align: center; }.category-tag, .type-tag { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 12px; }.link-btn { padding: 0; color: #1677ff; border: 0; background: none; cursor: pointer; font: inherit; }.empty { padding: 42px; color: #98a2b3; text-align: center; }.pagination { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 14px; color: #667085; }.modal { position: fixed; z-index: 3000; inset: 0; display: none; align-items: center; justify-content: center; background: rgba(15, 23, 42, .36); }.modal.show { display: flex; }.dialog { display: flex; flex-direction: column; width: min(720px, calc(100vw - 80px)); max-height: 80vh; border-radius: 8px; background: #fff; box-shadow: 0 18px 50px rgba(15, 23, 42, .2); }.delete-dialog { width: min(480px, calc(100vw - 80px)); }.dialog-head { display: flex; align-items: center; padding: 16px 18px; border-bottom: 1px solid #e7ebf0; font-weight: 700; }.close { margin-left: auto; border: 0; background: none; font-size: 22px; cursor: pointer; }.dialog-body { padding: 18px; overflow: auto; }.dialog-body p { margin: 0; color: #475467; }.detail-grid { display: grid; grid-template-columns: 110px 1fr; gap: 12px 16px; margin: 0; }.detail-grid dt { color: #667085; }.detail-grid dd { margin: 0; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }.options { padding: 10px 12px; border-radius: 5px; background: #f8fafc; }.answer { color: #16a34a; font-weight: 700; }.edit-field-btn { margin-left: 12px; }.secondary-link { margin-left: 10px; color: #667085; }.field-actions { display: inline-flex; margin-top: 8px; }.detail-input { display: block; width: 100%; min-height: 70px; padding: 8px 10px; color: #344054; border: 1px solid #d9e0e8; border-radius: 4px; font: inherit; line-height: 1.6; resize: vertical; }.dialog-foot { padding: 12px 18px; text-align: right; border-top: 1px solid #e7ebf0; }.dialog-foot .btn.primary { margin-left: 8px; }
</style>
