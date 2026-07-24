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
          <el-tag v-if="row.primary_category_name" effect="plain">
            {{ row.primary_category_name }}
          </el-tag>
          <el-tag type="info" effect="plain">
            {{ row.category_name || "未分类" }}
          </el-tag>
        </div>
        <span v-else class="uncategorized">未分类</span>
      </template>
      <template #created_at="{ row }">
        {{ formatDateTime(row.created_at) }}
      </template>
      <template #updated_at="{ row }">
        {{ formatDateTime(row.updated_at) }}
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button
          type="primary"
          link
          @click="openReview(scope.row)"
          >复核题目</el-button
        >
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
      @refresh="handleUpate"
    />

    <!-- 导入 SOP 弹窗 -->
    <el-dialog
      v-model="importDlg.visible"
      title="生成练习"
      width="60%"
      :close-on-click-modal="false"
      @close="resetImportDlg"
    >
      <div class="import-body">
        <el-form
          ref="ruleFormRef"
          label-width="110px"
          :rules="rules"
          :model="importDlg"
        >
          <el-form-item
            style="width: 50%"
            :label="$t('licenseAdmin.uploadType')"
            :label-width="language === 'th' ? '160px' : '110px'"
            prop="file_type"
          >
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
          <el-form-item style="width: 50%" label="所属类别" prop="primary_category_id">
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
          <el-form-item style="width: 50%" label="细分方向" prop="category_id">
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
            style="width: 50%"
            :label="$t('licenseAdmin.analysisMode')"
            :label-width="language === 'zh' ? '110px' : '160px'"
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
            style="width: 100%"
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
          <el-form-item
            style="width: 50%"
            :label="$t('licenseAdmin.company')"
            prop="company_id"
          >
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
            style="width: 50%"
            :label="$t('licenseAdmin.deptment')"
            prop="department_id"
            :label-width="language === 'en' ? '160px' : '110px'"
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
          <el-form-item
            style="width: 50%"
            :label="$t('licenseAdmin.position')"
            prop="position_id"
          >
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
          <el-form-item
            style="width: 50%"
            :label="$t('common.publishTime')"
            prop="start_time"
            :label-width="language === 'en' ? '160px' : '110px'"
          >
            <el-date-picker
              style="width: 100%"
              v-model="importDlg!.start_time"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :placeholder="$t('common.publishTimePlaceholder')"
            />
          </el-form-item>
          <el-form-item
            style="width: 50%"
            :label="$t('common.endTime')"
            prop="end_time"
          >
            <el-date-picker
              style="width: 100%"
              v-model="importDlg!.end_time"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :placeholder="$t('common.endTimePlaceholder')"
            />
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
import {
  getCompanyList,
  getPostList,
  getDeptList,
} from "@/services/company.service";
import { useUserStore } from "@/stores/modules/user";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useGlobalStore } from "@/stores/modules/global";

const globalStore = useGlobalStore();
const language = computed(() => globalStore.language);

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
      title,
      fileName,
      task_id: item.task_id,
      version: item.sop_version || "v1",
      ...item,
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

const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.user_id = String(userInfo.value.id);
  return getSops(newParams);
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
  position_id: "",
  company_id: "",
  department_id: "",
  primary_category_id: "",
  category_id: "",
  running: false,
  strategy: "all",
  start_time: "",
  end_time: "",
});

const rules = reactive({
  file_type: [{ required: true, message: t("licenseAdmin.uploadPlaceholder") }],
  strategy: [
    { required: true, message: t("licenseAdmin.strategyPlaceholder") },
  ],
  company_id: [
    { required: true, message: t("licenseAdmin.companyPlaceholder") },
  ],
  department_id: [
    { required: true, message: t("licenseAdmin.deptmentPlaceholder") },
  ],
  position_id: [
    { required: true, message: t("licenseAdmin.positionPlaceholder") },
  ],
  primary_category_id: [{ required: true, message: "请选择所属类别" }],
  category_id: [{ required: true, message: "请选择细分方向" }],
  start_time: [
    { required: true, message: t("common.publishTimePlaceholder") },
    {
      validator: (rule, value, callback) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(value);
        if (startDate < today) {
          callback(new Error(t("common.publishTimeError")));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  end_time: [
    { required: true, message: t("common.endTimePlaceholder") },
    {
      validator: (rule, value, callback) => {
        if (importDlg.start_time) {
          const startDate = new Date(importDlg.start_time);
          const endDate = new Date(value);
          if (endDate < startDate) {
            callback(new Error(t("common.endTimeError")));
          } else {
            callback();
          }
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
});

// sop文件（excel、pdf），操作规程（word、pdf）、应急演练（word、pdf），风险识别卡（excel）
const uploadTypeList = computed(() => {
  return [
    { label: t("licenseAdmin.sopFile"), value: "sop" },
    { label: t("licenseAdmin.operation"), value: "operation" },
    { label: t("licenseAdmin.emergency"), value: "emergency_drill" },
    { label: t("licenseAdmin.risk"), value: "risk" },
  ];
});
const importSecondaryCategories = computed(() => {
  const primary = categoryTree.value.find(
    (category) => category.id === importDlg.primary_category_id,
  );
  return primary?.children || [];
});
const changeImportPrimaryCategory = () => {
  importDlg.category_id = "";
};
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
  importDlg.primary_category_id = "";
  importDlg.category_id = "";
  importDlg.start_time = "";
  importDlg.end_time = "";
  ruleFormRef.value?.resetFields();
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

  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return;
    importDlg.running = true;
    try {
      console.log("importDlg", importDlg);
      const res = await generateQa(
        realFiles,
        importDlg.file_type,
        importDlg.position_id,
        importDlg.strategy,
        importDlg.start_time,
        importDlg.end_time,
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
.import-body :deep(.el-form) {
  display: flex;
  flex-wrap: wrap;
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
.category-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.uncategorized {
  color: #98a2b3;
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
