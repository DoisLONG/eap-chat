<template>
  <div class="page">
    <!-- 工具条 -->
    <div class="toolbar">
      <div class="left">
        <el-input
          v-model="q.keyword"
          placeholder="搜索规程名称 / 公司 / 部门 / 岗位"
          clearable
          style="width: 320px"
          @clear="
            () => {
              pager.page = 1;
              load();
            }
          "
          @keyup.enter="
            () => {
              pager.page = 1;
              load();
            }
          "
        />
        <el-button class="ml8" @click="load">查询</el-button>
      </div>
      <div class="right">
        <el-button @click="onImport">导入 SOP</el-button>
        <el-button
          type="danger"
          @click="onBatchDelete"
          :disabled="!hasSelection"
          >删除</el-button
        >
      </div>
    </div>

    <!-- 列表 -->
    <el-table
      :data="list"
      v-loading="loading"
      style="width: 100%"
      @selection-change="onSelectionChange"
      row-key="id"
      border
    >
      <el-table-column type="selection" width="50" />
      <el-table-column label="规程名称" min-width="280">
        <template #default="{ row }">
          <div class="doc-cell">
            <div class="thumb"></div>
            <div class="meta">
              <div class="name ellipsis" :title="row.title">
                {{ row.title }}
              </div>
              <div class="sub ellipsis" :title="row.fileName">
                {{ row.fileName }}
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="company" label="公司" width="120" />
      <el-table-column prop="dept" label="部门" width="120" />
      <el-table-column prop="job" label="岗位" width="120" />
      <el-table-column prop="version" label="版本号" width="100" />
      <el-table-column label="复核题目" width="200">
        <template #default="{ row }">
          <el-link
            type="primary"
            :loading="review.loading"
            :disabled="review.loading"
            @click="openReview(row)"
          >
            {{ row.examLinkText }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="onEdit(row)">编辑</el-button>
          <el-button size="small" @click="onDelete(row)" type="danger" plain
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pager">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next"
        :total="pager.total"
        :page-size="pager.pageSize"
        :page-sizes="[5, 10, 20, 50, 100]"
        v-model:current-page="pager.page"
        @current-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </div>

    <!-- 复核弹窗 -->
    <ReviewDialog
      v-model="review.visible"
      :data="review.data"
      @after-save="load"
      @rename="handleRename"
      @regen="handleRegen"
      @add-doc="handleAddDoc"
    />

    <!-- 导入 SOP 弹窗 -->
    <el-dialog
      v-model="importDlg.visible"
      title="导入 SOP"
      width="60%"
      :close-on-click-modal="false"
      @close="resetImportDlg"
    >
      <div class="import-body">
        <el-form label-width="110px">
          <el-form-item label="生成题目数">
            <el-input-number v-model="importDlg.totalQa" :min="1" :max="200" />
          </el-form-item>
          <el-form-item label="选择文件">
            <el-upload
              drag
              multiple
              :auto-upload="false"
              :file-list="importDlg.files"
              :on-change="onUploadChange"
              :on-remove="onUploadRemove"
              accept=".xlsx,.xls"
            >
              <div class="el-upload__text">
                拖拽或 <em>点击选择</em> 上传 .xlsx/.xls 文件
              </div>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button
          @click="importDlg.visible = false"
          :disabled="importDlg.running"
          >取消</el-button
        >
        <el-button
          type="primary"
          @click="startImport"
          :loading="importDlg.running"
          :disabled="!importDlg.files.length"
        >
          {{ importDlg.running ? "导入中…" : "开始导入" }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editDlg.visible"
      width="480px"
      :close-on-click-modal="false"
      :show-close="false"
      class="edit-title-dialog"
    >
      <template #header>
        <div class="dlg-header">
          <el-icon><EditPen /></el-icon>
          <span class="dlg-title">修改 SOP 标题</span>
        </div>
      </template>

      <div class="dlg-body">
        <el-form label-position="top">
          <el-form-item label="新标题" required>
            <el-input
              v-model="editDlg.title"
              placeholder="请输入新的标题"
              clearable
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dlg-footer">
          <el-button @click="editDlg.visible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="editDlg.loading"
            @click="submitEditTitle"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { EditPen } from '@element-plus/icons-vue'
import { ref, reactive, onMounted } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import ReviewDialog from "@/components/exam/ReviewDialog.vue";
import {
  getSops,
  generateQa,
  deleteSop,
  getQaList,
  saveQaList,
  pollTaskStatus,
  updateSopTitle,
} from "@/services/sop.api";

import { computed } from "vue";

const hasSelection = computed(() => selection.value.length > 0);

const q = reactive({ keyword: "" });
const pager = reactive({ page: 1, pageSize: 10, total: 0 });
const loading = ref(false);
const list = ref([]);
const selection = ref([]);
const userId = ref("test_user");

const ALLOW_RE = /\.(xlsx|xls)$/i;

async function load() {
  loading.value = true;
  try {
    const { data } = await getSops({ user_id: userId.value });

    // ✅ 兼容 results 为字符串数组或对象数组
    const arr = Array.isArray(data?.results) ? data.results : [];

    const mapped = arr.map((item, idx) => {
      const fileName = typeof item === "string" ? item : item.filename || "";
      const taskId = typeof item === "object" ? item.task_id : "";
      const title =
        typeof item === "object"
          ? item.title
          : fileName.replace(/\.[^.]+$/, "");
      return {
        id: item.id,
        title,
        fileName,
        task_id: taskId,
        company: "—",
        dept: "—",
        job: "—",
        version: "v1",
        examLinkText: `${title} 试题题目`,
      };
    });

    const keyword = q.keyword.trim();
    const filtered = keyword
      ? mapped.filter((x) =>
          [x.title, x.company, x.dept, x.job].some((f) => f.includes(keyword))
        )
      : mapped;

    pager.total = filtered.length;
    const start = (pager.page - 1) * pager.pageSize;
    list.value = filtered.slice(start, start + pager.pageSize);
  } catch (e) {
    console.error("[load error]", e);
    ElMessage.error("SOP 列表加载失败");
    pager.total = 1;
    list.value = [
      {
        id: 1,
        title: "示例_SOP文件",
        fileName: "示例_SOP文件.xlsx",
        company: "示例公司",
        dept: "示例部门",
        job: "示例岗位",
        version: "v1",
        examLinkText: "示例_SOP文件 试题题目",
        task_id: "",
      },
    ];
  } finally {
    loading.value = false;
  }
}

function resetImportDlg() {
  importDlg.files = [];
  importDlg.totalQa = 10; // 可以顺便重置输入框
}

onMounted(load);

const review = reactive({
  visible: false,
  data: { title: "", items: [] },
  currentRow: null,
  loading: false,
});

function onPageChange(val) {
  pager.page = val;
  load();
}

function onPageSizeChange(size) {
  pager.pageSize = size;
  pager.page = 1;
  load();
}

function onSelectionChange(val) {
  selection.value.splice(0, selection.value.length, ...val);
}

const editDlg = reactive({
  visible: false,
  record_id: null,
  title: "",
  loading: false,
});

async function openReview(row) {
  review.loading = true;
  review.currentRow = row;
  review.data.title = row.title;
  review.data.fileName = row.fileName;
  review.data.items = [];

  try {
    const taskId = row.task_id || "";
    if (!taskId) throw new Error("❌ 当前记录缺少任务 ID，无法进行复核");

    const res = await fetch("/sop-api/v1/dataprep/task_status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: taskId }),
    });

    const json = await res.json();
    const state = json?.results?.state || json?.state || "";
    const normalized = state.toUpperCase();

    // ✅ 如果不是 SUCCESS，提示后不再继续加载题目
    if (normalized !== "SUCCESS") {
      ElMessage.warning(`任务状态为 ${normalized}，请稍后再试`);
      return;
    }

    review.visible = true; // ✅ 弹窗提前展示

    // ✅ 成功才继续加载题目列表
    const { data } = await getQaList(row.fileName);
    const items = Array.isArray(data?.results) ? data.results : [];

    review.data.items = items.map((x, i) => ({
      _key: `${i}-${Date.now()}`,
      position: x.position ?? "",
      question: x.question ?? "",
      answer: x.answer ?? "",
      content: x.content ?? "",
      type: x.type ?? "",
    }));

    ElMessage.success(`✅ 成功加载 ${items.length} 条题目`);
  } catch (e) {
    console.error("[复核失败]", e);
    ElMessage.warning(e.message || "复核失败，请稍后再试");
  } finally {
    review.loading = false;
  }
}

async function handleSaveReview(payload) {
  try {
    const filename = review.data.fileName || review.currentRow?.fileName;
    const items = Array.isArray(payload?.items)
      ? payload.items
      : review.data.items;
    const body = {
      filename,
      results: items.map(({ question, answer, position, content, type }) => ({
        question,
        answer,
        position,
        content,
        type,
      })),
      sync: !!payload?.sync,
      user_id: userId.value,
    };
    await saveQaList(body);
    ElMessage.success(payload?.sync ? "已保存并同步知识库" : "保存成功");
    review.visible = false;
    await load();
  } catch (e) {
    console.error("[保存失败]", e);
    ElMessage.error("保存失败");
  }
}
function handleRename(newTitle) {
  if (review.currentRow) review.currentRow.title = newTitle;
  ElMessage.success("名称已更新");
}
function handleRegen() {
  ElMessage.success("已触发重新生成");
}
function handleAddDoc() {
  ElMessage.success("已添加到文档队列");
}

async function onDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除「${row.title}」？`, "提示", {
      type: "warning",
    });

    const res = await deleteSop(row.fileName);

    // ✅ 判断后端自定义状态
    if (res?.data?.status !== 200) {
      throw new Error(res?.data?.message || "删除失败");
    }

    ElMessage.success("删除成功");
    pager.page = 1;
    await load();
  } catch (e) {
    // ❗注意：catch 现在用于处理逻辑异常或 throw 抛出的错误
    ElMessage.error(e.message || "删除失败");
  }
}

function onBatchDelete() {
  if (!selection.value.length) return;
  ElMessageBox.confirm(
    `已选中 ${selection.value.length} 条，确定删除？`,
    "提示",
    { type: "warning" }
  )
    .then(async () => {
      await Promise.all(selection.value.map((x) => deleteSop(x.fileName)));
      selection.value = [];
      ElMessage.success("批量删除成功");
      pager.page = 1;
      await load();
    })
    .catch(() => {});
}
function onEdit(row) {
  console.log("row", row);
  // ElMessage.info(`编辑：${row.title}（自行实现表单/跳转）`);
  editDlg.record_id = row.id;
  editDlg.title = row.title;
  editDlg.visible = true;
}

async function submitEditTitle() {
  if (!editDlg.title.trim()) {
    ElMessage.warning("标题不能为空");
    return;
  }

  editDlg.loading = true;
  try {
    const { data } = await updateSopTitle(
      editDlg.record_id,
      editDlg.title.trim()
    );

    if (data?.status === 200) {
      ElMessage.success(data.message || "标题更新成功");
      editDlg.visible = false;
      await load(); // 刷新列表
    } else {
      throw new Error(data?.message || "更新失败");
    }
  } catch (e) {
    console.error("[更新标题失败]", e);
    ElMessage.error(e.message || "请求失败");
  } finally {
    editDlg.loading = false;
  }
}

const importDlg = reactive({
  visible: false,
  files: [],
  totalQa: 10,
  running: false,
});
function onImport() {
  importDlg.visible = true;
}
function onUploadChange(file, fileList) {
  // importDlg.files = fileList;
  const valid = fileList.filter((f) => ALLOW_RE.test(f.name));
  if (valid.length !== fileList.length) {
    ElMessage.error("仅支持 .xlsx / .xls 文件");
  }
  importDlg.files = valid;
}
function onUploadRemove(file, fileList) {
  importDlg.files = fileList;
}

async function startImport() {
  if (!importDlg.files.length) return ElMessage.warning("请先选择文件");
  // const realFiles = importDlg.files.map((f) => f.raw).filter(Boolean);
  // if (!realFiles.length) return ElMessage.warning("文件格式异常");
  if (importDlg.files.some((f) => !ALLOW_RE.test(f.name))) {
    return ElMessage.error("仅支持 .xlsx / .xls 文件");
  }
  const realFiles = importDlg.files.map((f) => f.raw).filter(Boolean);
  if (!realFiles.length) return ElMessage.warning("文件格式异常");

  importDlg.running = true;
  try {
    const res = await generateQa(realFiles, importDlg.totalQa);

    console.log("generateQa", res);

    // ✅ 后端返回非200/201时，主动抛错
    if (res?.data.status !== 200 && res?.data.status !== 201) {
      throw new Error(res?.data.message || "上传失败");
    }

    ElMessage.success("上传并生成题目完成");
    importDlg.visible = false;
    pager.page = 1;
    await load();
  } catch (e) {
    console.error("[导入失败]", e);
    ElMessage.error(`导入失败：${e.message || "未知错误"}`);
  } finally {
    importDlg.running = false;
  }
}
</script>

<style scoped>
.page {
  padding: 20px;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}
.left {
  display: flex;
  align-items: center;
}
.right {
  display: flex;
  gap: 8px;
}
.ml8 {
  margin-left: 8px;
}
.doc-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.thumb {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: linear-gradient(135deg, #eff4ff, #e8f0ff);
  border: 1px solid #e8eef9;
}
.meta {
  min-width: 0;
}
.name {
  font-weight: 600;
  color: #2b3a55;
}
.sub {
  font-size: 12px;
  color: #8b98a9;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pager {
  display: flex;
  justify-content: flex-end;
  padding: 14px 0 4px;
}
.import-body {
  padding: 4px 4px 0;
}

/* 编辑弹窗 */
.edit-title-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
}

.dlg-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: bold;
  color: #2b3a55;
}

.dlg-title {
  flex: 1;
}

.dlg-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
