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
          >{{ $t("licenseAdmin.importSop") }}</el-button
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
          v-if="row.percent >= 100"
          type="primary"
          :loading="review.loading"
          :disabled="review.loading"
          @click="openReview(row)"
        >
          {{ row.examLinkText }}
        </el-link>
        <el-progress v-else :percentage="row.percent" />
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <!-- <el-button
          type="primary"
          link
          :icon="View"
          @click="openDrawer('复核', scope.row)"
          >{{ $t("licenseAdmin.examLinkText") }}</el-button
        > -->
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
      @refresh="handleUpate"
    />

    <!-- 导入 SOP 弹窗 -->
    <el-dialog
      v-model="importDlg.visible"
      :title="$t('licenseAdmin.importSop')"
      width="60%"
      :close-on-click-modal="false"
      @close="resetImportDlg"
    >
      <div class="import-body">
        <el-form label-width="110px" :rules="rules" :model="importDlg">
          <el-form-item :label="$t('licenseAdmin.uploadType')" prop="file_type">
            <el-select
              v-model="importDlg!.file_type"
              :placeholder="$t('licenseAdmin.uploadTypePlaceholder')"
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
                <span
                  v-html="
                    $t('licenseAdmin.importTip', {
                      importFileType: importFileType,
                    })
                  "
                ></span>
              </div>
            </el-upload>
          </el-form-item>
          <el-form-item :label="$t('licenseAdmin.company')" prop="company_id">
            <el-select
              v-model="importDlg!.company_id"
              :placeholder="$t('licenseAdmin.companyPlaceholder')"
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
          <el-form-item
            :label="$t('licenseAdmin.deptment')"
            prop="department_id"
          >
            <el-select
              v-model="importDlg!.department_id"
              :placeholder="$t('licenseAdmin.deptmentPlaceholder')"
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
          <el-form-item :label="$t('licenseAdmin.position')" prop="position_id">
            <el-select
              v-model="importDlg!.position_id"
              :placeholder="$t('licenseAdmin.positionPlaceholder')"
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
          >{{ $t("common.cancel") }}</el-button
        >
        <el-button
          type="primary"
          @click="startImport"
          :loading="importDlg.running"
          :disabled="!importDlg.files.length"
        >
          {{
            importDlg.running
              ? $t("licenseAdmin.importing")
              : $t("licenseAdmin.beginImport")
          }}
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
  saveQaList,
  pollTaskStatus,
} from "@/services/sop.api";
import {
  getCompanyList,
  getPostList,
  getDeptList,
} from "@/services/company.service";
import { useUserStore } from "@/stores/modules/user";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);

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
      examLinkText: t("licenseAdmin.testTitle", { title: title }),
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
  newParams.user_id = String(userInfo.value.id);
  return getSops(newParams);
};
// 表格配置项
const columns = computed<ColumnProps[]>(() => {
  return [
    { type: "selection", fixed: "left", width: 70 },
    {
      prop: "keyword",
      label: "规程名称",
      i18nKey: "licenseAdmin.keyword",
      minWidth: 250,
      search: {
        el: "input",
      },
    },
    {
      prop: "company_name",
      label: "公司",
      i18nKey: "licenseAdmin.company",
      width: 120,
    },
    {
      prop: "department_name",
      label: "部门",
      i18nKey: "licenseAdmin.deptment",
      width: 120,
    },
    {
      prop: "position_name",
      label: "岗位",

      i18nKey: "licenseAdmin.position",
      width: 120,
    },
    {
      prop: "version",
      label: "版本号",
      i18nKey: "licenseAdmin.version",
      width: 100,
    },
    {
      prop: "examLinkText",
      label: "复核题目",
      i18nKey: "licenseAdmin.examLinkText",
      minWidth: 250,
    },
    {
      prop: "operation",
      label: "操作",
      i18nKey: "common.operate",
      fixed: "right",
      width: 200,
    },
  ];
});

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
  review.data.id = row.id;
  review.data.items = [];

  try {
    const taskId = row.task_id || "";
    if (!taskId) throw new Error(t("licenseAdmin.examLinkTip"));

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
      ElMessage.warning(
        t("licenseAdmin.taskStatusTip", { normalized: normalized })
      );
      return;
    }

    review.visible = true; // ✅ 弹窗提前展示

    // ✅ 成功才继续加载题目列表
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
    // console.log("QA 列表", review.data.items);
    ElMessage.success(t("licenseAdmin.loadSuccess", { num: items.length }));
  } catch (e) {
    console.error("[复核失败]", e);
    ElMessage.warning(e.message || t("licenseAdmin.loadFail"));
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
      user_id: String(userInfo.value.id),
    };
    await saveQaList(body);
    ElMessage.success(
      payload?.sync ? t("licenseAdmin.saveSuccess") : t("common.saveSuccess")
    );
    review.visible = false;
    await load();
  } catch (e) {
    console.error("[保存失败]", e);
    ElMessage.error(t("common.saveError"));
  }
}
function handleRename(newTitle) {
  if (review.currentRow) review.currentRow.title = newTitle;
  ElMessage.success(t("licenseAdmin.nameSuccess"));
}
function handleRegen() {
  ElMessage.success(t("licenseAdmin.relaodSuccess"));
}
function handleAddDoc() {
  ElMessage.success(t("licenseAdmin.addDoc"));
}

async function onDelete(row) {
  try {
    await ElMessageBox.confirm(
      t("common.confirmDelete", { title: row.title }),
      t("header.tip"),
      {
        type: "warning",
        confirmButtonText: t("common.confirm"),
        cancelButtonText: t("common.cancel"),
      }
    );

    const res = await deleteSop(row.id);

    // ✅ 判断后端自定义状态
    if (res?.data?.status !== 200) {
      throw new Error(res?.data?.message || t("common.deleteError"));
    }

    ElMessage.success(t("common.deleteSuccess"));
    proTable.value?.getTableList();
  } catch (e) {
    // ❗注意：catch 现在用于处理逻辑异常或 throw 抛出的错误
    console.error("[删除失败]", e);
    // ElMessage.error(e.message || "删除失败");
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
    }
  )
    .then(async () => {
      await Promise.all(id.map((x) => deleteSop(x)));
      ElMessage.success(t("common.batchDeleteSuccess"));
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
  file_type: [{ required: true, message: t("licenseAdmin.uploadPlaceholder") }],
  company_id: [
    { required: true, message: t("licenseAdmin.companyPlaceholder") },
  ],
  department_id: [
    { required: true, message: t("licenseAdmin.deptmentPlaceholder") },
  ],
  position_id: [
    { required: true, message: t("licenseAdmin.positionPlaceholder") },
  ],
});

// sop文件（excel、pdf），操作规程（word、pdf）、应急演练（word、pdf），风险识别卡（excel）
const uploadTypeList = [
  { label: t("licenseAdmin.sopFile"), value: "sop" },
  { label: t("licenseAdmin.operation"), value: "operation" },
  { label: t("licenseAdmin.emergency"), value: "emergency_drill" },
  { label: t("licenseAdmin.risk"), value: "risk" },
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
      value: Number(item.position_id) || item.position_id,
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
const importTip = ref("");
const changeFileType = (val) => {
  console.log("changeFileType", val);
  importDlg.files = [];
  if (val === "sop") {
    importFileType.value = ".xlsx,.xls,.pdf";
    ALLOW_RE.value = /\.(xlsx|xls|pdf)$/i;
    importTip.value = t("licenseAdmin.importFileType1");
  } else if (val === "operation" || val === "emergency_drill") {
    importFileType.value = ".doc,.docx,.pdf";
    ALLOW_RE.value = /\.(doc|docx|pdf)$/i;
    importTip.value = t("licenseAdmin.importFileType2", {
      type:
        val === "operation"
          ? t("licenseAdmin.operation")
          : t("licenseAdmin.emergency"),
    });
  } else {
    importFileType.value = ".xlsx,.xls";
    ALLOW_RE.value = /\.(xlsx|xls)$/i;
    importTip.value = t("licenseAdmin.importFileType3");
  }
};
function onUploadChange(file, fileList) {
  // sop文件（excel、pdf），操作规程（word、pdf）、应急演练（word、pdf），风险识别卡（excel）
  const valid = fileList.filter((f) => ALLOW_RE.value.test(f.name));
  if (valid.length !== fileList.length) {
    ElMessage.error(importTip.value);
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
  if (!importDlg.files.length)
    return ElMessage.warning(t("licenseAdmin.selectFirst"));
  // const realFiles = importDlg.files.map((f) => f.raw).filter(Boolean);
  // if (!realFiles.length) return ElMessage.warning(t("licenseAdmin.fileError"));
  if (importDlg.files.some((f) => !ALLOW_RE.value.test(f.name))) {
    return ElMessage.error(importTip.value);
  }
  const realFiles = importDlg.files.map((f) => f.raw).filter(Boolean);
  if (!realFiles.length) return ElMessage.warning(t("licenseAdmin.fileError"));

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
      throw new Error(res?.data.message || t("licenseAdmin.importError"));
    }

    ElMessage.success(t("licenseAdmin.importSuccess"));
    importDlg.visible = false;
    proTable.value?.getTableList();
  } catch (e) {
    console.error("[导入失败]", e);
    ElMessage.error(
      t("licenseAdmin.importFail", { msg: e.message || t("common.vailderror") })
    );
  } finally {
    importDlg.running = false;
  }
}
// 5s轮询接口
const listTimer = ref();
onMounted(() => {
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
