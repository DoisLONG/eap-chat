<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :init-param="initParam"
      :data-callback="dataCallback"
      rowKey="material_id"
    >
      <template #searchForm>
        <section class="material-filter-card">
          <h2 class="filter-title">
            {{ $t("materialLibrary.filterTitle") }}
          </h2>

          <div
            class="filter-category-row"
            :class="{ 'has-subcategory': filterSubCategoryOptions.length }"
          >
            <span class="filter-label">
              {{ $t("materialLibrary.filterCategory") }}：
            </span>
            <div class="category-options">
              <el-button
                v-for="item in filterCategoryOptions"
                :key="item.value"
                class="category-button"
                :class="{ 'is-active': filterForm.category === item.value }"
                @click="changeFilterCategory(item.value)"
              >
                {{ item.label }}
              </el-button>
            </div>
          </div>

          <div
            v-if="filterSubCategoryOptions.length"
            class="filter-subcategory-row"
          >
            <el-button
              v-for="item in filterSubCategoryOptions"
              :key="item.value"
              class="subcategory-button"
              :class="{ 'is-active': filterForm.subCategory === item.value }"
              @click="changeFilterSubCategory(item.value)"
            >
              {{ item.label }}
            </el-button>
          </div>

          <div class="filter-search-row">
            <div class="name-filter">
              <label class="filter-label" for="material-name-filter">
                {{ $t("materialLibrary.filterName") }}：
              </label>
              <el-input
                id="material-name-filter"
                v-model="filterForm.title"
                class="name-filter-input"
                :placeholder="$t('materialLibrary.filterPlaceholder')"
                clearable
                @keyup.enter="handleFilterSearch"
                @clear="handleFilterSearch"
              />
            </div>
            <div class="filter-actions">
              <el-button
                type="primary"
                :icon="Search"
                @click="handleFilterSearch"
              >
                {{ $t("common.search") }}
              </el-button>
              <el-button :icon="RefreshLeft" @click="resetFilters">
                {{ $t("common.reset") }}
              </el-button>
            </div>
          </div>
        </section>
      </template>
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button
          v-auth="'add'"
          type="primary"
          :icon="Upload"
          @click="openDrawer('create')"
          >{{ $t("materialLibrary.add") }}</el-button
        >
        <el-button
          type="danger"
          :icon="Delete"
          plain
          :disabled="!scope.isSelected"
          @click="batchDelete(scope.selectedListIds)"
        >
          {{ $t("common.batchDelete") }}
        </el-button>
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button
          type="primary"
          link
          :icon="View"
          @click="checkPreView(scope.row)"
          >{{ $t("common.preview") }}</el-button
        >
        <el-button
          type="primary"
          link
          :icon="EditPen"
          @click="openDrawer('update', scope.row)"
          >{{ $t("common.edit") }}</el-button
        >
        <el-button
          type="danger"
          link
          :icon="Delete"
          @click="deleteAccount(scope.row)"
          >{{ $t("common.delete") }}</el-button
        >
      </template>
    </ProTable>
    <OperateDrawer
      v-if="operateDrawerVisible"
      :rowInfo="rowInfo"
      :type="drawerType"
      @refresh="refreshTable"
      @close="operateDrawerVisible = false"
      ref="drawerRef"
    />
    <OfficeCheck
      v-if="operateOfficeVisible"
      :fileTitle="fileTitle"
      :fileType="fileType"
      :fileSrc="fileSrc"
      @close="operateOfficeVisible = false"
      ref="drawerOfficeRef"
    />
  </div>
</template>

<script setup lang="tsx" name="useProTable">
import { computed, reactive, ref } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import OfficeCheck from "./components/officeCheck.vue";
import OperateDrawer from "./components/operateDrawer.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import {
  Upload,
  Delete,
  EditPen,
  View,
  Search,
  RefreshLeft,
} from "@element-plus/icons-vue";
import {
  getMaterialList,
  deleteMaterial,
  getOssSign,
} from "@/services/mobile.service";

import { useHandleData } from "@/hooks/useHandleData";
import { formatDateTime } from "@/utils/dateFormat";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const proTable = ref<ProTableInstance>();

const initParam = reactive({});
const filterForm = reactive({
  title: "",
  category: "",
  subCategory: "",
});
const filterCategoryOptions = computed(() => [
  { label: t("materialLibrary.filterAll"), value: "" },
  { label: t("materialLibrary.filterProduct"), value: "产品" },
  { label: t("materialLibrary.filterOperations"), value: "运营" },
  { label: t("materialLibrary.filterTechnology"), value: "技术" },
]);
const filterSubCategoryOptions = computed(() => {
  const options = {
    产品: [
      { label: t("materialLibrary.filterAllProducts"), value: "" },
      { label: t("materialLibrary.filterAiPortal"), value: "AI Portal" },
      { label: t("materialLibrary.filterAiHub"), value: "AI Hub" },
      { label: t("materialLibrary.filterBeat"), value: "BEAT" },
      { label: t("materialLibrary.filterBams"), value: "BAMS" },
    ],
    运营: [
      { label: t("materialLibrary.filterAllOperations"), value: "" },
      {
        label: t("materialLibrary.filterCompanyArticles"),
        value: "公司章程",
      },
    ],
    技术: [
      { label: t("materialLibrary.filterAllTechnology"), value: "" },
      { label: t("materialLibrary.filterK8s"), value: "K8s" },
    ],
  };
  return options[filterForm.category] || [];
});

const getFilterParams = () => {
  const params: Record<string, string> = {};
  const title = filterForm.title.trim();
  if (title) params.title = title;
  if (filterForm.category) params.category = filterForm.category;
  return params;
};

const handleFilterSearch = () => {
  proTable.value?.handleAlignsearch(getFilterParams());
};

const changeFilterCategory = (category: string) => {
  if (filterForm.category === category) return;
  filterForm.category = category;
  filterForm.subCategory = "";
};

const changeFilterSubCategory = (subCategory: string) => {
  filterForm.subCategory = subCategory;
};

const resetFilters = () => {
  filterForm.title = "";
  filterForm.category = "";
  filterForm.subCategory = "";
  proTable.value?.handleAlignsearch({});
};

const dataCallback = (data: any) => {
  const res = data.data;
  return {
    list: res.items || [],
    total: res?.total || 0,
  };
};

const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  return getMaterialList(newParams);
};

// 表格配置项
const columns = reactive<ColumnProps[]>([
  { type: "selection", fixed: "left", width: 70 },
  {
    prop: "title",
    label: "素材名称",
    i18nKey: "materialLibrary.name",
    minWidth: 200,
  },
  {
    prop: "file_type",
    label: "素材类型",
    i18nKey: "materialLibrary.type",
    minWidth: 120,
  },
  {
    prop: "category",
    label: "素材分类",
    i18nKey: "materialLibrary.category",
    minWidth: 120,
    render: (scope) => {
      const category = scope.row.category;
      const list = [
        { label: t("course.safetyTraining"), value: "安全培训" },
        { label: t("course.skillImprovement"), value: "技能提升" },
        { label: t("course.onboardingTraining"), value: "入职培训" },
        { label: t("course.productTraining"), value: "产品培训" },
      ];
      const item = list.find((item) => item.value === category);
      return item?.label || "-";
    },
  },
  {
    prop: "size",
    label: "文件大小",
    i18nKey: "materialLibrary.size",
    minWidth: 100,
    render: (scope) => {
      const size = scope.row.size;
      if (!size) return "-";
      if (size < 1024) return size + " B";
      if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
      return (size / (1024 * 1024)).toFixed(1) + " MB";
    },
  },

  {
    prop: "description",
    label: "素材描述",
    i18nKey: "materialLibrary.description",
    minWidth: 150,
  },
  // {
  //   prop: "company_name",
  //   label: "公司名称",
  //   i18nKey: "companyManagement.company",
  //   minWidth: 150,
  // },
  // {
  //   prop: "department_name",
  //   label: "部门名称",
  //   i18nKey: "deptManagement.dept_name",
  //   minWidth: 150,
  // },
  {
    prop: "created_at",
    label: "上传时间",
    i18nKey: "materialLibrary.uploadTime",
    minWidth: 200,
    render: (scope) => {
      return scope.row.created_at ? formatDateTime(scope.row.created_at) : "-";
    },
  },
  {
    prop: "operation",
    label: "操作",
    i18nKey: "common.operate",
    fixed: "right",
    width: 280,
  },
]);

// 删除素材信息
const deleteAccount = async (params) => {
  await useHandleData(
    deleteMaterial,
    { id: params.material_id },
    t("materialLibrary.deleteTip", { name: params.title }),
    t,
  );

  proTable.value?.getTableList();
};

// 批量删除部门信息
const batchDelete = async (ids) => {
  if (!ids.length) return;
  ElMessageBox.confirm(
    t("common.batchDeleteTip", { num: ids.length }),
    t("header.tip"),
    {
      type: "warning",
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
    },
  )
    .then(async () => {
      await Promise.all(ids.map((id) => deleteMaterial({ id })));
      ElMessage.success(t("common.batchDeleteSuccess"));
      proTable.value?.clearSelection();
      proTable.value?.getTableList();
    })
    .catch(() => {});
};

// 预览
const fileType = ref("");
const fileSrc = ref("");
const fileTitle = ref("");
const operateOfficeVisible = ref(false);

const checkPreView = async (row) => {
  if (row.file_url) {
    fileSrc.value = `/mobileapi/${row.file_url}`;
    fileType.value = row.file_type;
    fileTitle.value = row.title;
    operateOfficeVisible.value = true;
  }
};

// 打开 drawer(新增、查看、编辑)
const operateDrawerVisible = ref(false);
const rowInfo = ref<any>({});
const drawerType = ref<string>("check");
const openDrawer = (type: string, row?: any) => {
  if (row) {
    rowInfo.value = row;
  } else {
    rowInfo.value = {};
  }
  drawerType.value = type;
  operateDrawerVisible.value = true;
};
const refreshTable = () => {
  proTable.value?.getTableList();
};
</script>

<style scoped lang="scss">
.material-filter-card {
  box-sizing: border-box;
  width: 100%;
  padding: 20px 24px;
  margin-bottom: 10px;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgb(0 0 0 / 4%);
}

.filter-title {
  margin: 0 0 18px;
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  color: var(--el-text-color-primary);
}

.filter-category-row,
.filter-subcategory-row,
.filter-search-row,
.name-filter,
.category-options,
.filter-actions {
  display: flex;
  align-items: center;
}

.filter-category-row {
  gap: 16px;
  margin-bottom: 20px;

  &.has-subcategory {
    margin-bottom: 12px;
  }
}

.filter-label {
  flex: 0 0 auto;
  font-size: 14px;
  line-height: 32px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.category-options {
  flex-wrap: wrap;
  gap: 10px;
  min-width: 0;
}

.category-button {
  height: 36px;
  padding: 0 20px;
  margin-left: 0;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-light);
  border-color: transparent;
  border-radius: 6px;

  &:hover,
  &:focus-visible {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-7);
  }

  &.is-active {
    color: var(--el-color-white);
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }
}

.filter-subcategory-row {
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 16px;
  margin-bottom: 20px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.subcategory-button {
  height: 32px;
  padding: 0 16px;
  margin-left: 0;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  border-color: var(--el-border-color);
  border-radius: 999px;

  &:hover,
  &:focus-visible,
  &.is-active {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }
}

.filter-search-row {
  justify-content: space-between;
  gap: 20px;
}

.name-filter {
  flex: 1 1 auto;
  gap: 16px;
  min-width: 0;
}

.name-filter-input {
  width: 340px;
  max-width: 100%;
}

.filter-actions {
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 12px;
  margin-left: auto;

  .el-button {
    min-width: 80px;
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .material-filter-card {
    padding: 18px 16px;
  }

  .filter-category-row,
  .filter-search-row {
    align-items: flex-start;
  }

  .filter-category-row {
    gap: 8px 12px;
  }

  .filter-search-row {
    flex-wrap: wrap;
  }

  .name-filter {
    flex: 1 1 100%;
  }

  .name-filter-input {
    flex: 1 1 auto;
    width: auto;
  }

  .filter-actions {
    flex: 1 1 100%;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .filter-category-row,
  .name-filter {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .name-filter-input {
    width: 100%;
  }
}
</style>
