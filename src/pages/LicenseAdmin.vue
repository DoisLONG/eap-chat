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
              {{ row.fileName || "-" }}
            </div>
          </div>
        </div>
      </template>
      <template #taskStatus="{ row }">
        <el-link
          v-if="isTaskReady(row)"
          type="primary"
          :loading="reviewLoading"
          :disabled="reviewLoading"
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
    <!-- 生成练习弹窗 -->
    <el-dialog
      v-model="importDlg.visible"
      class="practice-import-dialog"
      title="生成练习"
      width="800px"
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
              @change="changeImportCategory"
            >
              <el-option
                v-for="category in importSecondaryCategories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="练习描述">
            <el-input
              v-model="importDlg.description"
              type="textarea"
              :rows="3"
              placeholder="请输入练习描述"
            />
          </el-form-item>
          <el-form-item label="选择资料" prop="material_id" class="material-picker">
            <div class="material-panel">
              <div class="material-panel-head">
                <el-input v-model="importDlg.materialKeyword" clearable placeholder="搜索当前分类下的资料名称" :disabled="!importDlg.category_id" @input="loadMaterials" />
                <span>共 {{ importDlg.materialTotal }} 个资料</span>
              </div>
              <div v-loading="importDlg.materialLoading" class="material-list">
                <div v-if="!importDlg.primary_category_id" class="material-state">请先选择所属类别和细分方向</div>
                <div v-else-if="!importDlg.category_id" class="material-state">请选择细分方向</div>
                <div v-else-if="importDlg.materialError" class="material-state material-error">资料加载失败，请稍后重试</div>
                <div v-else-if="!importDlg.materials.length" class="material-state">{{ importDlg.materialKeyword ? "未找到匹配的资料" : "当前分类下暂无可用资料" }}</div>
                <label v-for="material in importDlg.materials" :key="material.material_id" class="material-card" :class="{ selected: material.material_id === importDlg.material_id }" @click="selectMaterial(material)">
                  <el-radio v-model="importDlg.material_id" :value="material.material_id" @change="selectMaterial(material)" />
                  <div class="material-content">
                    <div class="material-title-row"><strong>{{ material.title || material.filename || "未命名资料" }}</strong><el-tag size="small" effect="plain">{{ material.file_type?.toUpperCase() || "FILE" }}</el-tag></div>
                    <p>{{ material.description || "暂无描述" }}</p>
                    <small>大小：{{ formatMaterialSize(material.size) }}　 更新时间：{{ formatDateTime(material.updated_at) }}</small>
                  </div>
                </label>
              </div>
              <div class="material-selected">已选择：{{ importDlg.selectedMaterial?.title || importDlg.selectedMaterial?.filename || "未选择资料" }}</div>
            </div>
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
          :disabled="!canGenerate"
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
import { useRouter } from "vue-router";
import searchForm from "./components/licenseAdmin/searchForm.vue";
// import editDialog from "./components/licenseAdmin/editDialog.vue";
import editDrawer from "./components/licenseAdmin/editDrawer.vue";
import { ElMessage, ElMessageBox, ElProgress, ElTag } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen } from "@element-plus/icons-vue";
import {
  getSops,
  generateQaFromMaterial,
  deleteSop,
  getTaskStatus,
  getSopCategoryTree,
} from "@/services/sop.api";
import { getMaterialList } from "@/services/mobile.service";
import { useUserStore } from "@/stores/modules/user";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const reviewLoading = ref(false);

const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);

const ruleFormRef = ref<FormInstance>();

const proTable = ref<ProTableInstance>();
const initParam = reactive({});
const categoryTree = ref<any[]>([]);

const handleSearch = (params: any) => {
  proTable.value?.handleAlignsearch(params);
};

const dataCallback = (data: any) => {
  const arr = Array.isArray(data?.results?.records) ? data.results.records : [];
  const list = arr.map((item) => {
    const rawFileName = item.filename || "";
    // 去掉内部存储前缀 material-<uuid>--，只展示原始文件名（DB 值不可改，下载依赖它定位存储路径）
    const fileName = rawFileName.replace(/^material-[a-f0-9]+--/, "") || rawFileName;
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
      align: "center",
      headerAlign: "center",
    },
    {
      prop: "version",
      label: "版本号",
      i18nKey: "licenseAdmin.version",
      width: 220,
      render: (scope) => {
        const row = scope.row;
        // 生成中：版本号位置显示进度条（无百分比时用流动动画），生成完成/失败才显示版本号
        if (taskState(row) === "PENDING") {
          return (
            <div class="version-progress">
              <ElProgress
                percentage={taskPercent(row)}
                indeterminate={!hasTaskPercent(row)}
                showText={hasTaskPercent(row)}
              />
            </div>
          );
        }
        if (taskState(row) === "FAILURE") {
          return <ElTag type={taskTagType(row)} effect="plain">{taskLabel(row)}</ElTag>;
        }
        return <span>{row.version || "-"}</span>;
      },
    },
    {
      prop: "created_at",
      label: "创建时间",
      minWidth: 130,
    },
    {
      prop: "updated_at",
      label: "更新时间",
      minWidth: 130,
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

const editDlg = reactive({
  visible: false,
  record_id: null,
  title: "",
  loading: false,
});

async function openReview(row) {
  reviewLoading.value = true;
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

    router.push({ name: "PracticeQuestionReview", params: { sopId: row.id } });
  } catch (e) {
    console.error("[复核失败]", e);
    ElMessage.warning((e as any)?.message || t("licenseAdmin.loadFail"));
  } finally {
    reviewLoading.value = false;
  }
}

const taskState = (row) => String(row.task_status || "").toUpperCase();
const isTaskReady = (row) =>
  taskState(row) === "SUCCESS" || parseIntPercent(row) >= 100;
const hasTaskPercent = (row) =>
  row.percent !== null &&
  row.percent !== undefined &&
  row.percent !== "" &&
  Number.isFinite(parseIntPercent(row));
const taskPercent = (row) =>
  Math.min(100, Math.max(0, parseIntPercent(row)));
// 后端 percent 列为 varchar（如 '45%'），统一解析为数字
const parseIntPercent = (row) => {
  const n = parseInt(String(row.percent || ""), 10);
  return Number.isFinite(n) ? n : 0;
};
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

const importDlg = reactive<any>({
  visible: false,
  primary_category_id: "",
  category_id: "",
  description: "",
  running: false,
  materialKeyword: "",
  materialLoading: false,
  materialError: false,
  materials: [],
  materialTotal: 0,
  material_id: "",
  selectedMaterial: null,
});

const rules = reactive({
  primary_category_id: [{ required: true, message: "请选择所属类别" }],
  category_id: [{ required: true, message: "请选择细分方向" }],
  material_id: [{ required: true, message: "请选择资料" }],
});

const importSecondaryCategories = computed(() => {
  const primary = categoryTree.value.find(
    (category) => String(category.id) === String(importDlg.primary_category_id),
  );
  return primary?.children || [];
});
const changeImportPrimaryCategory = () => {
  importDlg.category_id = "";
  resetMaterials();
};
const canGenerate = computed(() => Boolean(
  importDlg.primary_category_id && importDlg.category_id && importDlg.material_id && !importDlg.running,
));
const formatMaterialSize = (size) => {
  const value = Number(size);
  if (!Number.isFinite(value) || value < 0) return "-";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};
function resetMaterials() {
  importDlg.materialKeyword = "";
  importDlg.materialLoading = false;
  importDlg.materialError = false;
  importDlg.materials = [];
  importDlg.materialTotal = 0;
  importDlg.material_id = "";
  importDlg.selectedMaterial = null;
}
async function loadMaterials() {
  if (!importDlg.category_id) return resetMaterials();
  importDlg.materialLoading = true;
  importDlg.materialError = false;
  importDlg.material_id = "";
  importDlg.selectedMaterial = null;
  try {
    const response = await getMaterialList({
      pageNum: 1,
      pageSize: 100,
      category_id: importDlg.category_id,
      title: importDlg.materialKeyword.trim(),
    });
    const payload = response.data?.data || response.data?.results || response.data;
    if (!Array.isArray(payload?.items)) throw new Error("invalid material list response");
    importDlg.materials = payload.items;
    importDlg.materialTotal = Number(payload.total) || 0;
  } catch (error) {
    console.error("[资料加载失败]", error);
    importDlg.materials = [];
    importDlg.materialTotal = 0;
    importDlg.materialError = true;
  } finally {
    importDlg.materialLoading = false;
  }
}
function changeImportCategory() {
  resetMaterials();
  loadMaterials();
}
function selectMaterial(material) {
  importDlg.material_id = material.material_id;
  importDlg.selectedMaterial = material;
}
function resetImportDlg() {
  importDlg.primary_category_id = "";
  importDlg.category_id = "";
  importDlg.description = "";
  resetMaterials();
  ruleFormRef.value?.resetFields();
}

function onImport() {
  resetImportDlg();
  importDlg.visible = true;
}

async function startImport() {
  if (!importDlg.material_id)
    return ElMessage.warning(t("licenseAdmin.selectFirst"));

  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return;
    importDlg.running = true;
    try {
      const res = await generateQaFromMaterial({
        material_id: importDlg.material_id,
        category_id: importDlg.category_id,
        description: importDlg.description,
      });

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
.version-progress {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 2px;
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
.import-form :deep(.el-select) {
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
.material-picker :deep(.el-form-item__content) { display: block; }
.material-panel { width: 100%; border: 1px solid #e4e7ed; border-radius: 8px; overflow: hidden; }
.material-panel-head { display: flex; gap: 12px; align-items: center; padding: 10px 12px; border-bottom: 1px solid #ebeef5; color: #909399; font-size: 13px; }
.material-panel-head :deep(.el-input) { flex: 1; }
.material-panel-head span { white-space: nowrap; }
.material-list { max-height: 310px; overflow-y: auto; background: #fff; }
.material-card { display: flex; gap: 10px; padding: 12px; border-bottom: 1px solid #f0f2f5; cursor: pointer; transition: .2s ease; }
.material-card:hover { border-color: #b3d8ff; box-shadow: 0 2px 8px rgba(64, 158, 255, .12); }
.material-card.selected { background: #ecf5ff; box-shadow: inset 0 0 0 1px #409eff; }
.material-card :deep(.el-radio) { margin-top: 2px; }
.material-content { min-width: 0; flex: 1; }
.material-title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: #303133; }
.material-title-row strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.material-title-row :deep(.el-tag) { color: #409eff; background: #ecf5ff; border-color: #d9ecff; }
.material-content p { margin: 5px 0; color: #606266; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.material-content small { color: #909399; }
.material-state { padding: 40px 12px; text-align: center; color: #909399; }
.material-error { color: #f56c6c; }
.material-selected { padding: 10px 12px; color: #606266; background: #fafafa; border-top: 1px solid #ebeef5; }
:deep(.practice-import-dialog) {
  max-width: calc(100vw - 32px);
}
.category-cell {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
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
