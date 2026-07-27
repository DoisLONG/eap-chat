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
        <searchForm :categories="categoryTree" @search="handleSearch" />
      </template>
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button
          v-auth="'add'"
          type="primary"
          :icon="CirclePlus"
          @click="onImport"
          >生成练习</el-button
        >
        <el-button
          type="danger"
          :icon="Delete"
          plain
          :disabled="!scope.isSelected"
          @click="batchDelete(scope.selectedListIds, scope.selectedList)"
        >
          {{ $t("common.batchDelete") }}
        </el-button>
      </template>
      <template #name="{ row }">
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
      <template #taskStatus="{ row }">
        <el-link
          v-if="isTaskReady(row)"
          type="primary"
          :loading="review.loading"
          :disabled="review.loading"
          @click="openReview(row)"
        >
          复核题目
        </el-link>
        <div v-else class="task-status">
          <el-progress
            v-if="taskState(row) === 'PENDING'"
            :percentage="taskPercent(row)"
            :indeterminate="!hasTaskPercent(row)"
            :show-text="hasTaskPercent(row)"
          />
          <el-tag :type="taskTagType(row)" effect="plain">
            {{ taskLabel(row) }}
          </el-tag>
        </div>
      </template>
      <template #category="{ row }">
        <div v-if="row.category_id" class="category-cell">
          <el-tag
            v-if="row.primary_category_name"
            effect="plain"
            class="category-tag category-primary-tag"
          >
            {{ row.primary_category_name }}
          </el-tag>
          <el-tag type="info" effect="plain" class="category-tag category-secondary-tag">
            {{ row.category_name || "未分类" }}
          </el-tag>
        </div>
        <el-tag v-else type="info" effect="plain" class="category-tag category-uncategorized">
          未分类
        </el-tag>
      </template>
      <template #created_at="{ row }">
        {{ formatDateTime(row.created_at) }}
      </template>
      <template #updated_at="{ row }">
        {{ formatDateTime(row.updated_at) }}
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <div class="table-actions">
          <el-button type="primary" link @click="openReview(scope.row)">
            复核题目
          </el-button>
          <el-button
            type="primary"
            link
            :icon="EditPen"
            @click="onEdit(scope.row)"
            >{{ $t("common.edit") }}</el-button
          >
          <el-button
            type="danger"
            link
            :icon="Delete"
            @click="onDelete(scope.row)"
            >{{ $t("common.delete") }}</el-button
          >
        </div>
      </template>
    </ProTable>
    <!-- 复核弹窗 -->
    <ReviewDialog
      v-model="review.visible"
      :data="review.data"
      @refresh="handleUpate"
    />

    <!-- 生成练习弹窗 -->
    <el-dialog
      v-model="importDlg.visible"
      class="practice-import-dialog"
      title="生成练习"
      width="720px"
      align-center
      :close-on-click-modal="false"
      @close="resetImportDlg"
    >
      <div class="import-body">
        <el-form
          ref="ruleFormRef"
          class="import-form"
          label-width="92px"
          label-suffix="："
          :rules="rules"
          :model="importDlg"
        >
          <el-form-item
            label="上传类型"
            prop="file_type"
          >
            <el-select
              v-model="importDlg.file_type"
              placeholder="请选择上传类型"
              @change="changeFileType"
            >
              <el-option
                v-for="oitem in fileTypeOptions"
                :key="oitem.value"
                :label="oitem.label"
                :value="oitem.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="所属类别" prop="primary_category_id">
            <el-select
              v-model="importDlg.primary_category_id"
              placeholder="请选择所属类别"
              @change="changeImportPrimaryCategory"
            >
              <el-option
                v-for="category in categoryTree"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="细分方向" prop="category_id">
            <el-select
              v-model="importDlg.category_id"
              placeholder="请选择细分方向"
              :disabled="!importDlg.primary_category_id"
            >
              <el-option
                v-for="category in importSecondaryCategories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('licenseAdmin.analysisMode')"
            prop="strategy"
          >
            <el-select
              v-model="importDlg!.strategy"
              :placeholder="$t('licenseAdmin.analysisModePlaceholder')"
              @change="changeFileType"
            >
              <el-option
                v-for="oitem in strategyList"
                :key="oitem.value"
                :label="oitem.label"
                :value="oitem.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('licenseAdmin.selectFile')"
            class="upload-file"
          >
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
                拖拽或点击选择文件
                <div class="el-upload__tip">仅支持 {{ importFileType || "选择上传类型后显示" }}</div>
              </div>
              <template #file="{ file }">
                <el-tooltip :content="file.name" placement="top">
                  <span class="upload-file-name">{{ file.name }}</span>
                </el-tooltip>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button
          @click="importDlg.visible = false"
          :disabled="importDlg.running"
          >{{ $t("common.cancel") }}</el-button
        >
        <el-button
          type="primary"
          @click="startImport"
          :loading="importDlg.running"
          :disabled="!importDlg.files.length"
        >
          生成
        </el-button>
      </template>
    </el-dialog>

    <editDrawer
      v-if="editDlg.visible"
      :rowInfo="rowInfo"
      :categories="categoryTree"
      @refresh="handleUpate"
      @close="editDlg.visible = false"
    />
  </div>
</template>

<script setup lang="tsx" name="useProTable">
import { ref, reactive, onMounted, onUnmounted, computed } from "vue";
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
  getTaskStatus,
  getSopCategoryTree,
} from "@/services/sop.api";
import { useUserStore } from "@/stores/modules/user";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);

const ruleFormRef = ref<FormInstance>();

const proTable = ref<ProTableInstance>();
const initParam = reactive({});
const categoryTree = ref<any[]>([]);

const strategyList = computed(() => [
  { label: t("licenseAdmin.allMode"), value: "all" },
  { label: t("licenseAdmin.stepMode"), value: "step" },
  { label: t("licenseAdmin.errorMode"), value: "error" },
  { label: t("licenseAdmin.dataMode"), value: "data" },
]);
const handleSearch = (params: any) => {
  proTable.value?.handleAlignsearch(params);
};

const dataCallback = (data: any) => {
  const arr = Array.isArray(data?.results?.records) ? data.results.records : [];
  const list = arr.map((item) => {
    const fileName = item.filename || "";
    const title = item.title || fileName.replace(/\.[^.]+$/, "");
    return {
      ...item,
      title,
      fileName,
      task_id: item.task_id,
      version: item.sop_version || "-",
    };
  });
  return {
    list,
    total: data?.results?.total || 0,
  };
};

const formatDateTime = (value: unknown) => {
  if (!value) return "-";
  return String(value).replace("T", " ").replace(/\.\d+(Z)?$/, "");
};

const loadCategoryTree = async () => {
  try {
    const { data } = await getSopCategoryTree();
    if (data?.status !== 200) throw new Error(data?.message || "分类加载失败");
    categoryTree.value = Array.isArray(data?.results) ? data.results : [];
  } catch (error) {
    categoryTree.value = [];
    ElMessage.error((error as any)?.message || "分类加载失败");
  }
};

const getTableList = async (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.user_id = String(userInfo.value.id);
  try {
    return await getSops(newParams);
  } catch (error) {
    ElMessage.error((error as any)?.message || "练习列表加载失败");
    return { data: { results: { records: [], total: 0 } } };
  }
};
// 表格配置项
const columns = computed<ColumnProps[]>(() => {
  return [
    { type: "selection", fixed: "left", width: 70 },
    {
      prop: "name",
      label: "名称",
      minWidth: 250,
    },
    {
      prop: "category",
      label: "所属类别",
      minWidth: 180,
    },
    {
      prop: "version",
      label: "版本号",
      i18nKey: "licenseAdmin.version",
      width: 100,
    },
    {
      prop: "created_at",
      label: "创建时间",
      minWidth: 170,
    },
    {
      prop: "updated_at",
      label: "更新时间",
      minWidth: 170,
    },
    {
      prop: "operation",
      label: "操作",
      i18nKey: "common.operate",
      fixed: "right",
      width: 240,
    },
  ];
});

const review = reactive({
  visible: false,
  data: { id: null, title: "", fileName: "", items: [] },
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
  review.loading = true;
  review.currentRow = row;
  review.data.title = row.title;
  review.data.id = row.id;
  review.data.fileName = row.filename || row.fileName || "";
  review.data.items = [];

  try {
    const taskId = row.task_id || "";
    if (taskId) {
      const { data } = await getTaskStatus(taskId);
      const state = data?.results?.state || data?.state || "";
      if (String(state).toUpperCase() !== "SUCCESS") {
        ElMessage.warning(t("licenseAdmin.taskStatusTip", { normalized: state }));
        return;
      }
    } else if (!isTaskReady(row)) {
      ElMessage.warning(
        "当前练习尚未生成完成，暂不能复核题目。",
      );
      return;
    }

    const { data } = await getQaList({ id: row.id });
    const items = Array.isArray(data?.results) ? data.results : [];

    review.data.items = items.map((x, i) => ({
      ...x,
      _key: `${i}-${Date.now()}`,
      position: x.position ?? "",
      question: x.question ?? "",
      answer: x.answer ?? "",
      content: x.content ?? "",
      type: x.type ?? "",
    }));
    review.visible = true;
    ElMessage.success(t("licenseAdmin.loadSuccess", { num: items.length }));
  } catch (e) {
    console.error("[复核失败]", e);
    ElMessage.warning((e as any)?.message || t("licenseAdmin.loadFail"));
  } finally {
    review.loading = false;
  }
}

const taskState = (row) => String(row.task_status || "").toUpperCase();
const isTaskReady = (row) =>
  taskState(row) === "SUCCESS" || Number(row.percent) >= 100;
const hasTaskPercent = (row) =>
  row.percent !== null &&
  row.percent !== undefined &&
  row.percent !== "" &&
  Number.isFinite(Number(row.percent));
const taskPercent = (row) =>
  Math.min(100, Math.max(0, Number(row.percent) || 0));
const taskLabel = (row) => {
  const state = taskState(row);
  if (state === "PENDING") return "生成中";
  if (state === "FAILURE") return "生成失败";
  return state || "等待生成";
};
const taskTagType = (row) => {
  const state = taskState(row);
  if (state === "FAILURE") return "danger";
  if (state === "PENDING") return "warning";
  return "info";
};

async function onDelete(row) {
  try {
    await ElMessageBox.confirm(
      t("common.confirmDelete", { title: row.title }),
      t("header.tip"),
      {
        type: "warning",
        confirmButtonText: t("common.confirm"),
        cancelButtonText: t("common.cancel"),
      },
    );

    const res = await deleteSop(row.id);

    // ✅ 判断后端自定义状态
    if (res?.data?.status !== 200) {
      throw new Error(res?.data?.message || t("common.deleteError"));
    }

    ElMessage.success(t("common.deleteSuccess"));
    proTable.value?.getTableList();
  } catch (e) {
    if (e !== "cancel" && e !== "close") {
      ElMessage.error((e as any)?.message || t("common.deleteError"));
    }
  }
}
const batchDelete = async (id: string[], list: any[]) => {
  // console.log("batch delete ids:", id, list);
  if (!list.length) return;
  ElMessageBox.confirm(
    t("common.batchDeleteTip", { num: list.length }),
    t("header.tip"),
    {
      type: "warning",
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
    },
  )
    .then(async () => {
      await Promise.all(id.map((x) => deleteSop(x)));
      ElMessage.success(t("common.batchDeleteSuccess"));
      proTable.value?.clearSelection();
      proTable.value?.getTableList();
    })
    .catch((error) => {
      if (error !== "cancel" && error !== "close") {
        ElMessage.error((error as any)?.message || t("common.deleteError"));
      }
    });
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
  primary_category_id: "",
  category_id: "",
  running: false,
  strategy: "all",
});

const rules = reactive({
  file_type: [{ required: true, message: t("licenseAdmin.uploadPlaceholder") }],
  strategy: [
    { required: true, message: t("licenseAdmin.strategyPlaceholder") },
  ],
  primary_category_id: [{ required: true, message: "请选择所属类别" }],
  category_id: [{ required: true, message: "请选择细分方向" }],
});

const fileTypeOptions = [
  { label: "PDF", value: "PDF", parserType: "sop" },
  { label: "DOC", value: "DOC", parserType: "operation" },
  { label: "DOCX", value: "DOCX", parserType: "operation" },
  { label: "XLS", value: "XLS", parserType: "sop" },
  { label: "XLSX", value: "XLSX", parserType: "sop" },
];
const importSecondaryCategories = computed(() => {
  const primary = categoryTree.value.find(
    (category) => String(category.id) === String(importDlg.primary_category_id),
  );
  return primary?.children || [];
});
const changeImportPrimaryCategory = () => {
  importDlg.category_id = "";
};
function resetImportDlg() {
  importDlg.files = [];
  importDlg.file_type = "";
  importDlg.primary_category_id = "";
  importDlg.category_id = "";
  importDlg.strategy = "all";
  ruleFormRef.value?.resetFields();
}

const importFileType = computed(() =>
  importDlg.file_type ? `.${importDlg.file_type.toLowerCase()}` : "",
);
const changeFileType = () => {
  importDlg.files = [];
};
function onUploadChange(file, fileList) {
  const type = file.name.split(".").pop()?.toUpperCase() || "";
  if (!fileTypeOptions.some((option) => option.value === type)) {
    ElMessage.error("仅支持 PDF、DOC、DOCX、XLS、XLSX 文件");
    importDlg.files = fileList.filter((item) => item.uid !== file.uid);
    return;
  }
  if (!importDlg.file_type) importDlg.file_type = type;
  const valid = fileList.filter(
    (item) => item.name.split(".").pop()?.toUpperCase() === importDlg.file_type,
  );
  if (valid.length !== fileList.length) {
    ElMessage.error(`上传类型为 ${importDlg.file_type}，请选择对应后缀的文件`);
  }
  importDlg.files = valid;
}

function onImport() {
  resetImportDlg();
  importDlg.visible = true;
}
function onUploadRemove(file, fileList) {
  importDlg.files = fileList;
}

async function startImport() {
  if (!importDlg.files.length)
    return ElMessage.warning(t("licenseAdmin.selectFirst"));
  // const realFiles = importDlg.files.map((f) => f.raw).filter(Boolean);
  // if (!realFiles.length) return ElMessage.warning(t("licenseAdmin.fileError"));
  const realFiles = importDlg.files.map((f) => f.raw).filter(Boolean);
  if (!realFiles.length) return ElMessage.warning(t("licenseAdmin.fileError"));

  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return;
    importDlg.running = true;
    try {
      console.log("importDlg", importDlg);
      const res = await generateQa(
        realFiles,
        fileTypeOptions.find((option) => option.value === importDlg.file_type)?.parserType,
        importDlg.strategy,
        importDlg.category_id,
      );

      console.log("generateQa", res);

      // ✅ 后端返回非200/201时，主动抛错
      if (res?.data.status !== 200 && res?.data.status !== 201) {
        throw new Error(res?.data.message || t("licenseAdmin.importError"));
      }

      ElMessage.success(t("licenseAdmin.importSuccess"));
      importDlg.visible = false;
      proTable.value?.getTableList();
    } catch (e) {
      console.error("[导入失败]", e);
      ElMessage.error(
        t("licenseAdmin.importFail", {
          msg: (e as any)?.message || t("common.vailderror"),
        }),
      );
    } finally {
      importDlg.running = false;
    }
  });
}
// 5s轮询接口
const listTimer = ref();
onMounted(() => {
  loadCategoryTree();
  listTimer.value = setInterval(() => {
    proTable.value?.getTableList();
  }, 5000);
});
onUnmounted(() => {
  clearInterval(listTimer.value);
});
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
.import-form :deep(.el-form-item__label) {
  white-space: nowrap;
}
.import-form :deep(.el-select),
.import-form :deep(.el-upload),
.import-form :deep(.el-upload-dragger) {
  width: 100%;
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
.upload-file-name {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.practice-import-dialog) {
  max-width: calc(100vw - 32px);
}
.category-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.category-tag {
  min-width: 52px;
  height: 23px;
  padding: 0 9px;
  border: 0;
  border-radius: 12px;
  font-size: 12px;
}
.category-primary-tag {
  color: #1677ff;
  background: #e6f4ff;
}
.category-secondary-tag {
  color: #5f6b7a;
  background: #f4f6f9;
}
.category-uncategorized {
  color: #7b8492;
  background: #f4f6f9;
}
.table-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
  white-space: nowrap;
}
.table-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}
.table-box :deep(.el-table__cell) {
  vertical-align: middle;
}
.task-status {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 118px;
}
.task-status :deep(.el-progress) {
  width: 58px;
}
</style>
