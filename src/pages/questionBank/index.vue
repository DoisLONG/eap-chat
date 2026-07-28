<template>
  <div class="question-bank-page">
    <div class="content">
      <section class="panel">
        <h2 class="filter-title">题库筛选</h2>
        <div class="category-tabs">
          <button v-for="item in primaryCategories" :key="item.value" class="category-tab" :class="{ active: filters.primaryCategory === item.value }" @click="selectPrimary(item.value)">{{ item.label }}</button>
        </div>
        <div class="secondary-tabs">
          <button v-for="item in secondaryCategories" :key="item.value" class="category-subtab" :class="{ active: filters.secondaryCategory === item.value }" @click="selectSecondary(item.value)">{{ item.label }}</button>
        </div>
        <div class="filters">
          <input v-model="filters.keyword" placeholder="输入题目关键词" @input="scheduleKeywordSearch" @keyup.enter="search" />
          <select v-model="filters.materialId" @change="search"><option value="">全部资料</option><option v-for="item in availableMaterials" :key="item.id" :value="item.id">{{ item.name }}</option></select>
          <select v-model="filters.type" @change="search"><option value="">全部题型</option><option value="choice">选择题</option><option value="essay">问答题</option></select>
          <button class="btn primary" @click="search">搜索</button>
          <button class="btn" @click="resetFilters">重置</button>
        </div>
      </section>

      <section class="panel">
        <div class="table-head"><h2>题库列表</h2><span class="total">共 {{ total }} 条</span><button class="btn batch-delete" :disabled="!selectedIds.size" @click="deleteDialogVisible = true">批量删除</button></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th style="width: 48px"><input type="checkbox" :checked="allSelected" :indeterminate="partiallySelected" aria-label="全选" @change="toggleAll" /></th><th style="width: 60px">序号</th><th>题目内容</th><th style="width: 90px">所属类别</th><th style="width: 90px">题目类型</th><th style="width: 230px">来源资料</th><th style="width: 88px">操作</th></tr></thead>
            <tbody>
              <tr v-for="(question, index) in questions" :key="question.id"><td><input type="checkbox" :checked="selectedIds.has(question.id)" @change="toggleOne(question.id, $event.target.checked)" /></td><td>{{ (page - 1) * pageSize + index + 1 }}</td><td :title="question.text">{{ question.text }}</td><td><span class="category-tag">{{ categoryText(question) }}</span></td><td><span class="type-tag">{{ typeText(question.type) }}</span></td><td :title="question.materialName">{{ question.materialName }}</td><td><button class="link-btn" @click="openDetail(question.id)">查看详情</button></td></tr>
              <tr v-if="!questions.length"><td colspan="7" class="empty">暂无题目记录</td></tr>
            </tbody>
          </table>
        </div>
        <div class="pagination"><span>第 {{ page }} / {{ pageCount }} 页</span><button class="btn" :disabled="page === 1" @click="changePage(page - 1)">上一页</button><button class="btn" :disabled="page === pageCount" @click="changePage(page + 1)">下一页</button></div>
      </section>
    </div>

    <div class="modal" :class="{ show: detailDialogVisible }" @click.self="closeDetail"><div class="dialog"><div class="dialog-head">题目详情<button class="close" @click="closeDetail">×</button></div><div v-if="currentQuestion" class="dialog-body"><dl class="detail-grid"><dt>题目内容</dt><dd><template v-if="editingField === 'text'"><textarea v-model="editValue" class="detail-input" rows="3"></textarea><span class="field-actions"><button class="link-btn" @click="saveField('text')">保存</button><button class="link-btn secondary-link" @click="cancelFieldEdit">取消</button></span></template><template v-else>{{ currentQuestion.text }}<button class="link-btn edit-field-btn" @click="startFieldEdit('text')">编辑</button></template></dd><dt>所属类别</dt><dd>{{ categoryText(currentQuestion) }}</dd><dt>题目类型</dt><dd>{{ typeText(currentQuestion.type) }}</dd><dt>来源资料</dt><dd>{{ currentQuestion.materialName }}</dd><template v-if="currentQuestion.options.length"><dt>选项</dt><dd class="options"><div v-for="(option, index) in currentQuestion.options" :key="option">{{ optionLabel(index) }}. {{ option }}</div></dd></template><dt>答案</dt><dd class="answer"><template v-if="editingField === 'answer'"><textarea v-model="editValue" class="detail-input" rows="3"></textarea><span class="field-actions"><button class="link-btn" @click="saveField('answer')">保存</button><button class="link-btn secondary-link" @click="cancelFieldEdit">取消</button></span></template><template v-else>{{ currentQuestion.answer }}<button class="link-btn edit-field-btn" @click="startFieldEdit('answer')">编辑</button></template></dd><dt>解析</dt><dd>{{ currentQuestion.analysis }}</dd></dl></div><div class="dialog-foot"><button class="btn" @click="closeDetail">关闭</button></div></div></div>
    <div class="modal" :class="{ show: deleteDialogVisible }" @click.self="deleteDialogVisible = false"><div class="dialog delete-dialog"><div class="dialog-head">删除确认<button class="close" @click="deleteDialogVisible = false">×</button></div><div class="dialog-body"><p>确认删除已选择的 {{ selectedIds.size }} 道题目吗？</p></div><div class="dialog-foot"><button class="btn" @click="deleteDialogVisible = false">取消</button><button class="btn primary" @click="confirmDelete">确认删除</button></div></div></div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { deleteQuestionBankItems, getQuestionBankDetail, getQuestionBankList, getQuestionBankMaterials, updateQuestionBankItem } from "@/services/questionBank.service";

const pageSize = 8;
const questions = ref([]);
const total = ref(0);
const page = ref(1);
const selectedIds = ref(new Set());
const currentQuestion = ref(null);
const detailDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const editingField = ref("");
const editValue = ref("");
const filters = reactive({ keyword: "", primaryCategory: "", secondaryCategory: "", materialId: "", type: "" });
let keywordSearchTimer;

const primaryCategories = [{ value: "", label: "全部" }, { value: "product", label: "产品" }, { value: "operation", label: "运营" }, { value: "technology", label: "技术" }];
const categoryMap = {
  product: { label: "产品", children: [{ value: "", label: "全部产品" }, { value: "aiPortal", label: "AI Portal" }, { value: "aiHub", label: "AI Hub" }, { value: "beat", label: "BEAT" }, { value: "bams", label: "BAMS" }] },
  operation: { label: "运营", children: [{ value: "", label: "全部运营" }, { value: "companyCharter", label: "公司章程" }] },
  technology: { label: "技术", children: [{ value: "", label: "全部技术" }, { value: "k8s", label: "K8s" }] },
};
const secondaryCategories = computed(() => categoryMap[filters.primaryCategory]?.children || []);
const availableMaterials = computed(() => getQuestionBankMaterials(filters));
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));
const allSelected = computed(() => questions.value.length > 0 && questions.value.every((item) => selectedIds.value.has(item.id)));
const partiallySelected = computed(() => !allSelected.value && questions.value.some((item) => selectedIds.value.has(item.id)));
const typeText = (type) => (type === "choice" ? "选择题" : "问答题");
const optionLabel = (index) => String.fromCharCode(65 + index);
const categoryText = (question) => {
  const primary = categoryMap[question.primaryCategory];
  const secondary = primary?.children.find((item) => item.value === question.secondaryCategory);
  return secondary ? `${primary.label} / ${secondary.label}` : primary?.label || "--";
};
const loadQuestions = async () => {
  let result = await getQuestionBankList({ filters, page: page.value, pageSize });
  if (!result.items.length && result.total && page.value > 1) { page.value -= 1; result = await getQuestionBankList({ filters, page: page.value, pageSize }); }
  questions.value = result.items; total.value = result.total; selectedIds.value = new Set();
};
const search = () => { page.value = 1; loadQuestions(); };
const scheduleKeywordSearch = () => { clearTimeout(keywordSearchTimer); keywordSearchTimer = setTimeout(search, 300); };
const selectPrimary = (value) => { filters.primaryCategory = value; filters.secondaryCategory = ""; filters.materialId = ""; search(); };
const selectSecondary = (value) => { filters.secondaryCategory = value; filters.materialId = ""; search(); };
const resetFilters = () => { Object.assign(filters, { keyword: "", primaryCategory: "", secondaryCategory: "", materialId: "", type: "" }); search(); };
const changePage = (value) => { if (value >= 1 && value <= pageCount.value) { page.value = value; loadQuestions(); } };
const toggleAll = (event) => { const next = new Set(selectedIds.value); questions.value.forEach((item) => event.target.checked ? next.add(item.id) : next.delete(item.id)); selectedIds.value = next; };
const toggleOne = (id, checked) => { const next = new Set(selectedIds.value); checked ? next.add(id) : next.delete(id); selectedIds.value = next; };
const openDetail = async (id) => { currentQuestion.value = await getQuestionBankDetail(id); editingField.value = ""; detailDialogVisible.value = Boolean(currentQuestion.value); };
const closeDetail = () => { detailDialogVisible.value = false; editingField.value = ""; };
const startFieldEdit = (field) => { editingField.value = field; editValue.value = currentQuestion.value?.[field] || ""; };
const cancelFieldEdit = () => { editingField.value = ""; editValue.value = ""; };
const saveField = async (field) => {
  if (!currentQuestion.value || !editValue.value.trim()) return;
  currentQuestion.value = await updateQuestionBankItem(currentQuestion.value.id, { [field]: editValue.value });
  cancelFieldEdit();
  await loadQuestions();
};
const confirmDelete = async () => { if (!selectedIds.value.size) return; await deleteQuestionBankItems([...selectedIds.value]); deleteDialogVisible.value = false; await loadQuestions(); };
onMounted(loadQuestions);
onBeforeUnmount(() => clearTimeout(keywordSearchTimer));
</script>

<style scoped>
.question-bank-page { min-width: 0; color: #1f2937; font: 14px "Microsoft YaHei", Arial, sans-serif; }.content { padding: 0; }
.panel { padding: 16px; margin-bottom: 14px; background: #fff; border: 1px solid #edf0f4; border-radius: 6px; box-shadow: 0 2px 8px rgba(16, 24, 40, .04); }
.filter-title { margin: 0 0 12px; font-size: 15px; color: #1f2937; font-weight: 700; }
.category-tabs, .secondary-tabs, .filters { display: flex; flex-wrap: wrap; align-items: center; }.category-tabs, .secondary-tabs { gap: 8px; }.filters { gap: 10px; }.category-tabs { margin-top: 12px; }
.category-tab { height: 36px; padding: 0 17px; border: 1px solid transparent; border-radius: 8px; background: #f1f4f8; color: #475467; cursor: pointer; font: inherit; }
.category-tab:hover { color: #1677ff; background: #eaf3ff; }.category-tab.active { color: #fff; background: #1677ff; }
.secondary-tabs { margin-top: 10px; padding: 10px 12px; border-radius: 8px; background: #f6f8fc; }.category-subtab { height: 32px; padding: 0 14px; border: 1px solid #e0e7f0; border-radius: 999px; background: #fff; color: #475467; cursor: pointer; font: inherit; font-size: 12px; }.category-subtab.active { color: #1677ff; border-color: #91bfff; background: #eaf3ff; }
.filters { margin-top: 16px; } input, select { height: 34px; padding: 0 10px; color: #344054; border: 1px solid #d9e0e8; border-radius: 4px; background: #fff; font: inherit; } input { width: 220px; }
.btn { height: 34px; padding: 0 14px; border: 1px solid #d0d5dd; border-radius: 4px; color: #344054; background: #fff; cursor: pointer; font: inherit; }.btn:disabled { color: #98a2b3; border-color: #e4e7ec; background: #f5f7fa; cursor: not-allowed; }.btn.primary { color: #fff; border-color: #1677ff; background: #1677ff; }
.table-head { display: flex; align-items: center; margin-bottom: 13px; }.table-head h2 { margin: 0; color: #1f2937; font-size: 16px; font-weight: 700; }.total { margin-left: 10px; color: #98a2b3; }.batch-delete { margin-left: 12px; color: #d92d20; border-color: #f2c7c3; }.batch-delete:disabled { color: #98a2b3; border-color: #e4e7ec; background: #f5f7fa; }
.table-wrap { overflow: auto; } table { width: 100%; border-collapse: collapse; table-layout: fixed; } th, td { height: 44px; padding: 0 10px; overflow: hidden; text-align: left; text-overflow: ellipsis; white-space: nowrap; border-bottom: 1px solid #edf0f4; } th { color: #667085; background: #f8fafc; font-weight: 600; } th:first-child, td:first-child { padding: 0; overflow: visible; text-align: center; } input[type="checkbox"] { width: 16px; height: 16px; padding: 0; vertical-align: middle; accent-color: #1677ff; cursor: pointer; }.category-tag, .type-tag { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 12px; }.category-tag, .type-tag { color: #1677ff; background: #eaf3ff; }.link-btn { padding: 0; color: #1677ff; border: 0; background: none; cursor: pointer; font: inherit; }.empty { padding: 42px; color: #98a2b3; text-align: center; }.pagination { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 14px; color: #667085; }
.modal { position: fixed; z-index: 3000; inset: 0; display: none; align-items: center; justify-content: center; background: rgba(15, 23, 42, .36); }.modal.show { display: flex; }.dialog { display: flex; flex-direction: column; width: min(720px, calc(100vw - 80px)); max-height: 80vh; border-radius: 8px; background: #fff; box-shadow: 0 18px 50px rgba(15, 23, 42, .2); }.delete-dialog { width: min(480px, calc(100vw - 80px)); }.dialog-head { display: flex; align-items: center; padding: 16px 18px; border-bottom: 1px solid #e7ebf0; font-weight: 700; }.close { margin-left: auto; border: 0; background: none; font-size: 22px; cursor: pointer; }.dialog-body { padding: 18px; overflow: auto; }.dialog-body p { margin: 0; color: #475467; }.detail-grid { display: grid; grid-template-columns: 110px 1fr; gap: 12px 16px; margin: 0; }.detail-grid dt { color: #667085; }.detail-grid dd { margin: 0; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }.options { padding: 10px 12px; border-radius: 5px; background: #f8fafc; }.answer { color: #16a34a; font-weight: 700; }.edit-field-btn { margin-left: 12px; }.secondary-link { margin-left: 10px; color: #667085; }.field-actions { display: inline-flex; gap: 0; margin-top: 8px; }.detail-input { display: block; width: 100%; min-height: 70px; padding: 8px 10px; color: #344054; border: 1px solid #d9e0e8; border-radius: 4px; font: inherit; line-height: 1.6; resize: vertical; }.dialog-foot { padding: 12px 18px; text-align: right; border-top: 1px solid #e7ebf0; }.dialog-foot .btn.primary { margin-left: 8px; }
</style>
