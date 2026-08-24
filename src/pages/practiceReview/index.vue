<template>
  <section class="practice-review">
    <header class="topbar">
      <div class="topbar-main">
        <el-button :icon="ArrowLeft" circle @click="goBack" />
        <div class="title-block">
          <h2>复核题目</h2>
          <p>练习：{{ source.title || "-" }} · 文件：{{ source.file_name || "-" }} · 版本：{{ source.version || "-" }}</p>
        </div>
        <el-tag v-if="source.primary_category_name" type="primary" effect="light">{{ source.primary_category_name }}</el-tag>
        <el-tag v-if="source.secondary_category_name" type="info" effect="light">{{ source.secondary_category_name }}</el-tag>
      </div>
      <div class="topbar-actions">
        <el-tag type="success" effect="light">已生成 {{ questions.length }} 题</el-tag>
        <el-button :loading="saving" @click="save">保存草稿</el-button>
        <el-button type="primary" :loading="saving" @click="saveAndBack">保存并返回</el-button>
      </div>
    </header>

    <main class="workspace">
      <section ref="sourcePane" class="pane source-pane">
        <div class="pane-head"><div><strong>原始文件</strong><small>点击右侧题目，可定位到对应原文</small></div><div class="pane-actions"><el-button link :disabled="!source.file_name" @click="downloadSource">下载原文件</el-button><el-button link :disabled="!source.file_name" @click="openSource">新窗口打开</el-button><el-button link @click="toggleFullscreen">全屏</el-button></div></div>
        <div class="source-body" :style="{ fontSize: `${zoom}%` }">
          <el-skeleton v-if="sourceLoading" :rows="8" animated />
          <el-alert v-else-if="sourceError" type="warning" :title="sourceError" :closable="false" />
          <template v-else-if="source.preview_type === 'pdf' && sourceUrl">
            <iframe class="pdf-viewer" :src="sourceUrl" title="原始 PDF 文件" />
            <div v-if="activeQuestion?.content" class="source-fragment">当前题目关联片段：{{ activeQuestion.content }}</div>
          </template>
          <template v-else-if="source.preview_type === 'docx' && sourceData"><VueOfficeDocx :src="sourceData" /><div v-if="activeQuestion?.content" class="source-fragment">当前题目关联片段：{{ activeQuestion.content }}</div></template>
          <template v-else-if="source.preview_type === 'xlsx' && sourceData"><VueOfficeExcel :src="sourceData" /><div v-if="activeQuestion?.content" class="source-fragment">当前题目关联片段：{{ activeQuestion.content }}</div></template>
          <template v-else-if="source.preview_type === 'text'">
            <div class="viewer-tools"><span>文本预览</span><el-button link @click="zoom = Math.max(85, zoom - 10)">－</el-button><span>{{ zoom }}%</span><el-button link @click="zoom = Math.min(130, zoom + 10)">＋</el-button></div>
            <pre class="source-text" v-html="sourceHtml" />
          </template>
          <el-empty v-else description="当前文件格式无法在线预览，可下载原文件查看完整排版。" />
        </div>
      </section>

      <section class="pane review-pane">
        <div class="pane-head"><div><strong>试题复核</strong><small>修改后统一保存，题型值保持后端原值</small></div><el-button type="primary" :icon="Plus" @click="addQuestion">新增题目</el-button></div>
        <div class="review-tools"><el-input v-model="keyword" clearable placeholder="搜索题目、答案或解析" /><el-select v-model="typeFilter" clearable placeholder="全部题型"><el-option v-for="type in typeOptions" :key="type" :label="type" :value="type" /></el-select><el-button @click="resetFilters">重置</el-button></div>
        <div class="summary">共 {{ questions.length }} 题，筛选后 {{ filteredQuestions.length }} 题 <span>{{ dirty ? "有未保存的修改" : "所有修改已保存" }}</span></div>
        <div class="question-list" v-loading="questionsLoading">
          <el-alert v-if="questionsError" type="error" :title="questionsError" :closable="false" />
          <el-empty v-else-if="!questionsLoading && !filteredQuestions.length" description="暂无题目，请新增题目" />
          <article v-for="question in pageQuestions" :key="question._key" class="question-card" :class="{ active: activeQuestion?._key === question._key }" @click="locate(question)">
            <header><div><b>第 {{ questions.indexOf(question) + 1 }} 题</b><el-tag size="small">{{ question.type || "未设置题型" }}</el-tag></div><div><el-button link @click.stop="locate(question)">定位原文</el-button><el-button link type="danger" @click.stop="removeQuestion(question)">删除</el-button></div></header>
            <div class="question-body">
              <label>题型<el-select v-model="question.type" @change="markDirty"><el-option v-for="type in typeOptions" :key="type" :label="type" :value="type" /></el-select></label>
              <label>题目<el-input v-model="question.question" type="textarea" :autosize="{ minRows: 2, maxRows: 5 }" maxlength="200" @input="markDirty" /></label>
              <label>参考答案<el-input v-model="question.answer" type="textarea" :autosize="{ minRows: 2, maxRows: 5 }" maxlength="200" @input="markDirty" /></label>
              <label>解析说明<el-input v-model="question.content" type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" maxlength="1000" @input="markDirty" /></label>
            </div>
            <footer>来源：{{ question.position || question.position_id || "未提供" }} <span>{{ question.difficulty_factor == null ? "" : `难度 ${question.difficulty_factor}` }}</span></footer>
          </article>
        </div>
        <div class="pagination"><span>共 {{ filteredQuestions.length }} 条</span><el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[5, 10, 20]" layout="sizes, prev, pager, next" :total="filteredQuestions.length" @size-change="page = 1" /></div>
      </section>
    </main>
    <footer class="save-status">左侧原文件与右侧题目联动定位；{{ dirty ? "当前修改尚未保存" : "所有修改已保存" }}</footer>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import { ArrowLeft, Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import VueOfficeDocx from "@vue-office/docx";
import VueOfficeExcel from "@vue-office/excel";
import "@vue-office/docx/lib/index.css";
import { getPracticeReviewSource, getPracticeSourceFile, getQaList, saveQaList } from "@/services/sop.api";

const route = useRoute();
const router = useRouter();
const sourcePane = ref();
const sourceLoading = ref(false), sourceError = ref(""), questionsLoading = ref(false), questionsError = ref(""), saving = ref(false);
const questions = ref([]), keyword = ref(""), typeFilter = ref(""), page = ref(1), pageSize = ref(10), dirty = ref(false), zoom = ref(100), sourceUrl = ref(""), sourceData = ref(null), activeQuestion = ref(null);
const source = reactive({ title: "", file_name: "", version: "", primary_category_name: "", secondary_category_name: "", preview_type: "unsupported", source_text: "" });
const typeOptions = computed(() => [...new Set([...questions.value.map(item => item.type).filter(Boolean), "问答题", "填空题"])]);
const filteredQuestions = computed(() => questions.value.filter(item => {
  const keywordMatch = !keyword.value || [item.question, item.answer, item.content].some(value => String(value || "").toLowerCase().includes(keyword.value.trim().toLowerCase()));
  return keywordMatch && (!typeFilter.value || item.type === typeFilter.value);
}));
const pageQuestions = computed(() => filteredQuestions.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value));
const escapeHtml = value => String(value || "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const sourceHtml = computed(() => {
  const text = source.source_text || "";
  const fragment = activeQuestion.value?.content?.trim();
  const index = fragment ? text.indexOf(fragment) : -1;
  if (index < 0) return escapeHtml(text);
  return `${escapeHtml(text.slice(0, index))}<mark class="source-hit">${escapeHtml(text.slice(index, index + fragment.length))}</mark>${escapeHtml(text.slice(index + fragment.length))}`;
});
function clearSourceUrl() { if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value); sourceUrl.value = ""; sourceData.value = null; }
function normalizeQuestion(item, index) { return { ...item, _key: crypto.randomUUID?.() || `${Date.now()}-${index}`, row: item.row ?? null, position: item.position ?? null, position_id: item.position_id ?? null, question: item.question ?? "", answer: String(item.answer ?? ""), content: item.content ?? "", type: item.type ?? "问答题", difficulty_factor: item.difficulty_factor ?? 0 }; }
async function loadReview(sopId) {
  clearSourceUrl(); Object.assign(source, { title: "", file_name: "", version: "", primary_category_name: "", secondary_category_name: "", preview_type: "unsupported", source_text: "" }); questions.value = []; activeQuestion.value = null; dirty.value = false; page.value = 1;
  sourceLoading.value = questionsLoading.value = true; sourceError.value = questionsError.value = "";
  const [sourceResult, questionsResult] = await Promise.allSettled([getPracticeReviewSource(sopId), getQaList({ id: Number(sopId) })]);
  if (sourceResult.status === "fulfilled") {
    Object.assign(source, sourceResult.value.data?.results || {});
    if (["pdf", "docx", "xlsx"].includes(source.preview_type)) try { const response = await getPracticeSourceFile(sopId); if (source.preview_type === "pdf") sourceUrl.value = URL.createObjectURL(response.data); else sourceData.value = await response.data.arrayBuffer(); } catch (error) { sourceError.value = error?.response?.data?.detail || "原始文件加载失败"; }
  } else sourceError.value = sourceResult.reason?.response?.data?.detail || sourceResult.reason?.message || "原文件加载失败";
  if (questionsResult.status === "fulfilled") questions.value = (questionsResult.value.data?.results || []).map(normalizeQuestion);
  else questionsError.value = questionsResult.reason?.response?.data?.detail || questionsResult.reason?.message || "题目加载失败";
  sourceLoading.value = questionsLoading.value = false;
}
function markDirty() { dirty.value = true; }
function resetFilters() { keyword.value = ""; typeFilter.value = ""; page.value = 1; }
function addQuestion() { questions.value.unshift(normalizeQuestion({ type: "问答题", question: "", answer: "", content: "", position_id: questions.value[0]?.position_id ?? null }, questions.value.length)); markDirty(); page.value = 1; }
async function removeQuestion(question) { try { await ElMessageBox.confirm("删除后需保存才会生效，确定删除吗？", "温馨提示", { type: "warning" }); questions.value.splice(questions.value.indexOf(question), 1); if (page.value > Math.max(1, Math.ceil(filteredQuestions.value.length / pageSize.value))) page.value--; markDirty(); } catch {} }
async function locate(question) { activeQuestion.value = question; const fragment = question.content?.trim(); await nextTick(); if (source.preview_type === "text" && fragment && source.source_text.includes(fragment)) document.querySelector(".source-hit")?.scrollIntoView({ behavior: "smooth", block: "center" }); else if (["pdf", "docx", "xlsx"].includes(source.preview_type)) ElMessage.info("当前预览不支持稳定文字高亮，已显示题目关联片段。"); else ElMessage.warning("未找到对应原文片段"); }
function payload() { const missing = questions.value.findIndex(item => !item.type?.trim() || !item.question?.trim() || !item.answer?.trim() || !item.content?.trim()); if (missing >= 0) throw new Error(`请完整填写第 ${missing + 1} 题的题型、题目、答案和解析`); return { sop_info_id: Number(route.params.sopId), file_name: source.file_name, records: questions.value.map(({ id, question_code, row, position, position_id, question, answer, content, type, options, difficulty_factor }) => ({ id, question_code, row, position, position_id, question: question.trim(), answer: String(answer).trim(), content: content.trim(), type, options, difficulty_factor })) }; }
async function save() { if (saving.value) return false; try { saving.value = true; await saveQaList(payload()); dirty.value = false; ElMessage.success("所有修改已保存"); return true; } catch (error) { ElMessage.error(error?.response?.data?.detail || error.message || "保存失败"); return false; } finally { saving.value = false; } }
async function saveAndBack() { if (await save()) router.push({ name: "PracticeManagement" }); }
async function confirmLeave() { if (!dirty.value) return true; try { await ElMessageBox.confirm("当前题目修改尚未保存，确定离开吗？", "温馨提示", { type: "warning" }); return true; } catch { return false; } }
async function goBack() { if (await confirmLeave()) router.back(); }
async function downloadSource() { try { const response = await getPracticeSourceFile(route.params.sopId, true); const url = URL.createObjectURL(response.data), link = document.createElement("a"); link.href = url; link.download = source.file_name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch { ElMessage.error("原文件下载失败"); } }
async function openSource() { try { const response = await getPracticeSourceFile(route.params.sopId); const url = URL.createObjectURL(response.data); window.open(url, "_blank", "noopener"); setTimeout(() => URL.revokeObjectURL(url), 60000); } catch { ElMessage.error("原文件打开失败"); } }
function toggleFullscreen() { sourcePane.value?.requestFullscreen?.(); }
watch(() => route.params.sopId, value => { if (value) loadReview(value); }, { immediate: true });
onBeforeRouteLeave(() => confirmLeave());
onBeforeUnmount(clearSourceUrl);
</script>

<style scoped>
.practice-review { display:flex; flex-direction:column; height:calc(100vh - 112px); min-height:620px; background:#f4f6f9; }.topbar,.pane-head,.topbar-main,.topbar-actions,.pane-actions,.viewer-tools,.summary,.pagination,.question-card header,.question-card footer { display:flex; align-items:center; }.topbar { min-height:64px; justify-content:space-between; gap:12px; padding:10px 16px; background:#fff; border-bottom:1px solid #e5eaf0; }.topbar-main,.topbar-actions { gap:10px; min-width:0; }.title-block h2 { margin:0; font-size:17px; }.title-block p,.pane-head small { display:block; margin:3px 0 0; color:#7f8a99; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }.workspace { display:grid; grid-template-columns:minmax(0,46fr) minmax(0,54fr); gap:14px; flex:1; min-height:0; padding:14px; }.pane { display:flex; flex-direction:column; min-width:0; min-height:0; overflow:hidden; background:#fff; border:1px solid #e5eaf0; border-radius:8px; }.pane-head { min-height:56px; justify-content:space-between; gap:10px; padding:10px 14px; border-bottom:1px solid #e5eaf0; }.pane-actions { gap:8px; white-space:nowrap; }.source-body,.question-list { flex:1; min-height:0; overflow:auto; }.source-body { padding:14px; background:#eef1f5; }.pdf-viewer { width:100%; height:100%; min-height:500px; border:0; background:#fff; }.viewer-tools { gap:8px; min-height:34px; margin-bottom:10px; }.source-text { min-height:100%; margin:0; padding:24px; white-space:pre-wrap; overflow-wrap:anywhere; line-height:1.75; background:#fff; box-shadow:0 2px 10px #d9dee6; }.source-fragment { margin-top:10px; padding:10px; color:#7a5610; background:#fff5cf; border:1px solid #f5d66f; }.review-pane { background:#f8fafc; }.review-tools { display:grid; grid-template-columns:1fr 150px auto; gap:10px; padding:12px 14px; background:#fff; border-bottom:1px solid #e5eaf0; }.summary { justify-content:space-between; padding:9px 14px; color:#506071; background:#f3f8ff; border-bottom:1px solid #dcecff; }.summary span { color:#e6a23c; }.question-list { padding:14px; }.question-card { margin-bottom:12px; overflow:hidden; background:#fff; border:1px solid #e5eaf0; border-radius:8px; cursor:pointer; }.question-card.active { border-color:#72afff; box-shadow:0 0 0 3px rgba(22,119,255,.08); }.question-card header,.question-card footer { justify-content:space-between; gap:8px; padding:10px 14px; background:#fbfcfe; border-bottom:1px solid #edf0f4; }.question-card header > div { display:flex; align-items:center; gap:8px; }.question-card footer { border-top:1px solid #edf0f4; border-bottom:0; color:#8a95a3; font-size:12px; }.question-body { padding:14px; }.question-body label { display:block; margin-bottom:12px; color:#5a6675; font-size:12px; font-weight:600; }.question-body label :deep(.el-select),.question-body label :deep(.el-textarea) { display:block; width:100%; margin-top:6px; }.pagination { min-height:54px; justify-content:space-between; padding:0 14px; background:#fff; border-top:1px solid #e5eaf0; }.save-status { min-height:38px; padding:10px 16px; color:#7b8794; font-size:12px; background:#fff; border-top:1px solid #e5eaf0; } :deep(.source-hit) { padding:1px 2px; background:#fff5cf; outline:2px solid #f5d66f; } @media (max-width:1050px) { .practice-review { height:auto; min-height:0; }.topbar { align-items:flex-start; flex-direction:column; }.workspace { grid-template-columns:1fr; overflow:visible; }.pane { min-height:620px; }.review-tools { grid-template-columns:1fr; } }
</style>

<style scoped>
.practice-review {
  container-type: inline-size;
}

@container (max-width: 1180px) {
  .practice-review {
    height: auto;
    min-height: calc(100vh - 112px);
  }

  .topbar,
  .topbar-main,
  .topbar-actions,
  .pane-head,
  .pagination {
    flex-wrap: wrap;
  }

  .workspace {
    grid-template-columns: minmax(0, 1fr);
    overflow: visible;
  }

  .pane {
    min-height: 560px;
  }

  .source-pane {
    min-height: min(640px, calc(100vh - 170px));
  }
}

@container (max-width: 1760px) {
  .source-pane :deep(.vue-office-docx .docx-wrapper) {
    padding: 8px;
  }

  .source-pane :deep(.vue-office-docx .docx-wrapper > section.docx) {
    box-sizing: border-box;
    width: 100% !important;
    padding: 10px !important;
  }
}

@container (max-width: 820px) {
  .source-body {
    padding: 8px;
  }
}

@container (max-width: 640px) {
  .review-tools {
    grid-template-columns: minmax(0, 1fr);
  }

  .pagination {
    align-items: flex-start;
    flex-direction: column;
    padding: 10px 14px;
  }
}
</style>
