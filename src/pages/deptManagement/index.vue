<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :init-param="initParam"
      :data-callback="dataCallback"
      rowKey="department_id"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button
          v-auth="'add'"
          type="primary"
          :icon="CirclePlus"
          @click="openDrawer('create')"
          >{{ $t("deptManagement.add") }}</el-button
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
      <template #role="scope">
        <span>{{ scope.row.role.name }}</span>
      </template>
      <template #department="scope">
        <span>{{ scope.row.department?.department_name || "--" }}</span>
      </template>
      <template #position="scope">
        <span>{{ scope.row.position?.position_name || "--" }}</span>
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button
          type="primary"
          link
          :icon="View"
          @click="openDrawer('check', scope.row)"
          >{{ $t("common.check") }}</el-button
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
      :rowInfo="userInfo"
      :type="drawerType"
      @refresh="refreshTable"
      @close="operateDrawerVisible = false"
      ref="drawerRef"
    />
  </div>
</template>

<script setup lang="tsx" name="useProTable">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import OperateDrawer from "./components/operateDrawer.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import { getDeptPageList, deleteDept } from "@/services/company.service";
import { useHandleData } from "@/hooks/useHandleData";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const proTable = ref<ProTableInstance>();

const initParam = reactive({});
const dataCallback = (data: any) => {
  return {
    list: data.results.records || [],
    total: data?.results?.total || 0,
  };
};

const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  return getDeptPageList(newParams);
};

// 表格配置项
const columns = reactive<ColumnProps[]>([
  { type: "selection", fixed: "left", width: 70 },
  {
    prop: "company_name",
    label: "公司名称",
    i18nKey: "companyManagement.company",
    minWidth: 150,
  },
  {
    prop: "department_name",
    label: "部门名称",
    i18nKey: "deptManagement.dept_name",
    minWidth: 120,
    search: {
      el: "input",
      props: {
        clearable: true,
        // placeholder: "deptManagement.dept_namePlaceholder",
      },
    },
  },
  {
    prop: "manager",
    label: "部门负责人",
    i18nKey: "deptManagement.leader",
    minWidth: 150,
  },
  {
    prop: "manager_phone",
    label: "负责人电话",
    i18nKey: "deptManagement.manager_phone",
    minWidth: 150,
  },
  {
    prop: "remark",
    label: "备注",
    i18nKey: "deptManagement.remark",
    width: 120,
  },
  {
    prop: "operation",
    label: "操作",
    i18nKey: "common.operate",
    fixed: "right",
    width: 280,
  },
]);

// 删除部门信息
const deleteAccount = async (params) => {
  await useHandleData(
    deleteDept,
    { department_id: params.department_id },
    t("deptManagement.deleteTip", { name: params.department_name }),
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
      await Promise.all(ids.map((id) => deleteDept({ department_id: id })));
      ElMessage.success(t("common.batchDeleteSuccess"));
      proTable.value?.clearSelection();
      proTable.value?.getTableList();
    })
    .catch(() => {});
};

// 打开 drawer(新增、查看、编辑)
const operateDrawerVisible = ref(false);
const userInfo = ref<any>({});
const drawerType = ref<string>("check");
const openDrawer = (type: string, row?: any) => {
  if (row) {
    userInfo.value = row;
  } else {
    userInfo.value = {};
  }
  drawerType.value = type;
  operateDrawerVisible.value = true;
};
const refreshTable = () => {
  proTable.value?.getTableList();
};
</script>
