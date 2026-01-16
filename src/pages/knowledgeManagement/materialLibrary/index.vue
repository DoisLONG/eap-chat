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
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import OfficeCheck from "./components/officeCheck.vue";
import OperateDrawer from "./components/operateDrawer.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Upload, Delete, EditPen, View } from "@element-plus/icons-vue";
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
    search: {
      el: "input",
      props: {
        clearable: true,
        placeholder: t("materialLibrary.searchKeyword"),
      },
    },
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
    prop: "position_name",
    label: "岗位名称",
    i18nKey: "companyManagement.position",
    minWidth: 120,
  },
  {
    prop: "course_title",
    label: "关联课程",
    i18nKey: "materialLibrary.course",
    minWidth: 200,
  },
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
    t
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
    }
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
  console.log("row", row);
  if (row.file_url) {
    const res = await getOssSign({ oss_uri: row.file_url });
    if (res.data.code === 0) {
      fileSrc.value = res.data.data;
      fileType.value = row.file_type;
      fileTitle.value = row.title;
      operateOfficeVisible.value = true;
    }
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
