<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :init-param="initParam"
      :data-callback="dataCallback"
    >
      <template #searchForm>
        <searchForm @search="handleSearch" />
      </template>
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button
          v-auth="'add'"
          type="primary"
          :icon="CirclePlus"
          @click="onImport"
          >导入SOP</el-button
        >
        <el-button
          type="danger"
          :icon="Delete"
          plain
          :disabled="!scope.isSelected"
          @click="batchDelete(scope.selectedListIds, scope.selectedList)"
        >
          批量删除
        </el-button>
      </template>
      <template #keyword="{ row }">
        <div class="doc-cell">
          <!-- <div class="thumb"></div> -->
          <div class="meta">
            <div class="name ellipsis" :title="row.title">
              {{ row.title }}
            </div>
            <div class="sub ellipsis" :title="row.fileName">
              {{ row.filename || "-" }}
            </div>
          </div>
        </div>
      </template>
      <template #examLinkText="{ row }">
        <el-link
          type="primary"
          :loading="review.loading"
          :disabled="review.loading"
          @click="openReview(row)"
        >
          {{ row.examLinkText }}
        </el-link>
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <!-- <el-button
          type="primary"
          link
          :icon="View"
          @click="openDrawer('复核', scope.row)"
          >复核</el-button
        > -->
        <el-button
          type="primary"
          link
          :icon="EditPen"
          @click="onEdit(scope.row)"
          >编辑</el-button
        >
        <el-button
          type="danger"
          link
          :icon="Delete"
          @click="onDelete(scope.row)"
          >删除</el-button
        >
      </template>
    </ProTable>
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
        <el-form label-width="110px" :rules="rules" :model="importDlg">
          <el-form-item label="上传类型" prop="file_type">
            <el-select
              v-model="importDlg!.file_type"
              placeholder="请选择上传类型"
              @change="changeFileType"
            >
              <el-option
                v-for="oitem in uploadTypeList"
                :key="oitem.value"
                :label="oitem.label"
                :value="oitem.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="选择文件" class="upload-file">
            <el-upload
              drag
              multiple
              :auto-upload="false"
              :file-list="importDlg.files"
              :on-change="onUploadChange"
              :on-remove="onUploadRemove"
              :accept="importFileType"
            >
              <div class="el-upload__text">
                拖拽或 <em>点击选择</em> 上传 .xlsx/.xls 文件
              </div>
            </el-upload>
          </el-form-item>
          <el-form-item label="公司" prop="company_id">
            <el-select
              v-model="importDlg!.company_id"
              placeholder="请选择公司"
              @change="changeCompany"
            >
              <el-option
                v-for="oitem in companyList"
                :key="oitem.value"
                :label="oitem.label"
                :value="oitem.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="部门" prop="department_id">
            <el-select
              v-model="importDlg!.department_id"
              placeholder="请选择部门"
              @change="changeDept"
            >
              <el-option
                v-for="oitem in deptList"
                :key="oitem.value"
                :label="oitem.label"
                :value="oitem.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="岗位" prop="position_id">
            <el-select
              v-model="importDlg!.position_id"
              placeholder="请选择岗位"
            >
              <el-option
                v-for="oitem in postList"
                :key="oitem.value"
                :label="oitem.label"
                :value="oitem.value"
              />
            </el-select>
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

    <editDrawer
      v-if="editDlg.visible"
      :rowInfo="rowInfo"
      @refresh="handleUpate"
      @close="editDlg.visible = false"
    />
  </div>
</template>

<script setup lang="tsx" name="useProTable">
import { ref, reactive } from "vue";
import searchForm from "./components/licenseAdmin/searchForm.vue";
import ReviewDialog from "@/components/exam/ReviewDialog.vue";
// import editDialog from "./components/licenseAdmin/editDialog.vue";
import editDrawer from "./components/licenseAdmin/editDrawer.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen } from "@element-plus/icons-vue";
import {
  getSops,
  generateQa,
  deleteSop,
  getQaList,
  saveQaList,
  pollTaskStatus,
} from "@/services/sop.api";
import {
  getCompanyList,
  getPostList,
  getDeptList,
} from "@/services/company.service";

const userId = ref("test_user");

const proTable = ref<ProTableInstance>();
const initParam = reactive({});

const handleSearch = (params: any) => {
  proTable.value?.handleAlignsearch(params);
};
const dataCallback = (data: any) => {
  const arr = Array.isArray(data?.results?.records) ? data.results.records : [];
  const list = arr.map((item) => {
    const fileName = item.filename || "";
    const title = item.title || fileName.replace(/\.[^.]+$/, "");
    return {
      title,
      fileName,
      task_id: item.task_id,
      version: item.sop_version || "v1",
      examLinkText: `${title} 试题题目`,
      ...item,
    };
  });
  return {
    list: list,
    total: data?.results?.total || 0,
  };
};

const getTableList = (params: any) => {
  console.warn("getTableList", params);
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.user_id = userId.value;
  return getSops(newParams);
};
// 表格配置项
const columns = reactive<ColumnProps[]>([
  { type: "selection", fixed: "left", width: 70 },
  {
    prop: "keyword",
    label: "规程名称",
    minWidth: 250,
    search: {
      el: "input",
    },
  },
  {
    prop: "company_name",
    label: "公司",
    width: 120,
  },
  {
    prop: "department_name",
    label: "部门",
    width: 120,
  },
  {
    prop: "position_name",
    label: "岗位",
    width: 120,
  },
  { prop: "version", label: "版本号", width: 100 },
  { prop: "examLinkText", label: "复核题目", minWidth: 250 },
  { prop: "operation", label: "操作", fixed: "right", width: 200 },
]);

const review = reactive({
  visible: false,
  data: { title: "", items: [] },
  currentRow: null,
  loading: false,
});

const editDlg = reactive({
  visible: false,
  record_id: null,
  title: "",
  loading: false,
});

async function openReview(row) {
  console.log("openReview", row);
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
    const { data } = await getQaList({ id: row.id });
    const items = Array.isArray(data?.results) ? data.results : [];

    review.data.items = items.map((x, i) => ({
      _key: `${i}-${Date.now()}`,
      position: x.position ?? "",
      question: x.question ?? "",
      answer: x.answer ?? "",
      content: x.content ?? "",
      type: x.type ?? "",
    }));

    ElMessage.success(`成功加载 ${items.length} 条题目`);
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
    proTable.value?.getTableList();
  } catch (e) {
    // ❗注意：catch 现在用于处理逻辑异常或 throw 抛出的错误
    console.error("[删除失败]", e);
    // ElMessage.error(e.message || "删除失败");
  }
}
const batchDelete = async (id: string[], list: any[]) => {
  if (!list.length) return;
  ElMessageBox.confirm(`已选中 ${list.length} 条，确定删除？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      await Promise.all(list.map((x) => deleteSop(x.fileName)));
      ElMessage.success("批量删除成功");
      proTable.value?.clearSelection();
      proTable.value?.getTableList();
    })
    .catch(() => {});
};

const rowInfo = ref<any>({});
function onEdit(row) {
  editDlg.record_id = row.id;
  editDlg.visible = true;
  rowInfo.value = row;
}
// 更新后刷新表格
const handleUpate = () => {
  proTable.value?.getTableList();
};

const importDlg = reactive({
  visible: false,
  files: [],
  file_type: "",
  position_id: "",
  company_id: "",
  department_id: "",
  running: false,
});

const rules = reactive({
  file_type: [{ required: true, message: "请选择文件类型" }],
  position_id: [{ required: true, message: "请选择岗位" }],
});

// sop文件（excel、pdf），操作规程（word、pdf）、应急演练（word、pdf），风险识别卡（excel）
const uploadTypeList = [
  { label: "sop文件", value: "sop" },
  { label: "操作规程", value: "operation" },
  { label: "应急演练", value: "emergency_drill" },
  { label: "风险识别卡", value: "risk" },
];
// 公司部门岗位
const companyList = ref<{ label: string; value: string }[]>([]);
const deptList = ref<{ label: string; value: string }[]>([]);
const postList = ref<{ label: string; value: string }[]>([]);
const queryCompany = () => {
  const params: any = {};
  getCompanyList(params).then((res) => {
    const data = res.data.results || [];
    companyList.value = data.map((item: any) => ({
      label: item.company_name,
      value: item.company_id,
    }));
  });
};
queryCompany();
const queryDept = () => {
  const params: any = {};
  if (importDlg?.company_id) {
    params.company_id = importDlg.company_id;
  }
  getDeptList(params).then((res) => {
    const data = res.data.results || [];
    deptList.value = data.map((item: any) => ({
      label: item.department_name,
      value: item.department_id,
    }));
  });
};
queryDept();

const queryPost = () => {
  const params: any = {};
  if (importDlg?.company_id) {
    params.company_id = importDlg.company_id;
  }
  if (importDlg?.department_id) {
    params.department_id = importDlg.department_id;
  }
  getPostList(params).then((res) => {
    const data = res.data.results || [];
    postList.value = data.map((item: any) => ({
      label: item.position_name,
      value: item.position_id,
    }));
  });
};
queryPost();

const changeCompany = () => {
  queryDept();
  postList.value = [];
  importDlg.department_id = "";
  importDlg.position_id = "";
};
const changeDept = () => {
  queryPost();
  importDlg.position_id = "";
};
function resetImportDlg() {
  importDlg.files = [];
  importDlg.file_type = "";
  importDlg.company_id = "";
  importDlg.department_id = "";
  importDlg.position_id = "";
}

const ALLOW_RE = ref<RegExp>(/\.(xlsx|xls)$/i);
const importFileType = ref(".xlsx,.xls");
const importTip = ref("SOP文件仅支持 .xlsx / .xls / .pdf 文件");
const changeFileType = (val) => {
  importDlg.files = [];
  if (val === "sop") {
    importFileType.value = ".xlsx,.xls,.pdf";
    ALLOW_RE.value = /\.(xlsx|xls|pdf)$/i;
    importTip.value = "SOP文件仅支持 .xlsx / .xls / .pdf 文件";
  } else if (val === "operation" || val === "risk") {
    importFileType.value = ".doc,.docx,.pdf";
    ALLOW_RE.value = /\.(doc|docx|pdf)$/i;
    importTip.value = `${
      val === "operation" ? "操作规程" : "应急演练"
    }仅支持 .doc / .docx / .pdf 文件`;
  } else {
    importFileType.value = ".xlsx,.xls";
    ALLOW_RE.value = /\.(xlsx|xls)$/i;
    importTip.value = "风险识别卡仅支持 .xlsx / .xls 文件";
  }
};
function onUploadChange(file, fileList) {
  // sop文件（excel、pdf），操作规程（word、pdf）、应急演练（word、pdf），风险识别卡（excel）
  const valid = fileList.filter((f) => ALLOW_RE.value.test(f.name));
  if (valid.length !== fileList.length) {
    ElMessage.error(`${importTip.value}`);
  }
  importDlg.files = valid;
}

function onImport() {
  importDlg.visible = true;
}
function onUploadRemove(file, fileList) {
  importDlg.files = fileList;
}

async function startImport() {
  if (!importDlg.files.length) return ElMessage.warning("请先选择文件");
  // const realFiles = importDlg.files.map((f) => f.raw).filter(Boolean);
  // if (!realFiles.length) return ElMessage.warning("文件格式异常");
  if (importDlg.files.some((f) => !ALLOW_RE.value.test(f.name))) {
    return ElMessage.error(`${importTip.value}`);
  }
  const realFiles = importDlg.files.map((f) => f.raw).filter(Boolean);
  if (!realFiles.length) return ElMessage.warning("文件格式异常");

  importDlg.running = true;
  try {
    const res = await generateQa(
      realFiles,
      importDlg.file_type,
      importDlg.position_id
    );

    console.log("generateQa", res);

    // ✅ 后端返回非200/201时，主动抛错
    if (res?.data.status !== 200 && res?.data.status !== 201) {
      throw new Error(res?.data.message || "上传失败");
    }

    ElMessage.success("上传并生成题目完成");
    importDlg.visible = false;
    proTable.value?.getTableList();
  } catch (e) {
    console.error("[导入失败]", e);
    ElMessage.error(`导入失败：${e.message || "未知错误"}`);
  } finally {
    importDlg.running = false;
  }
}
</script>
<style scoped>
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
  text-align: left;
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
.upload-file :deep(.el-form-item__content) div:nth-of-type(1) {
  width: 100%;
}
</style>
