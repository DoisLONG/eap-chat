<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :init-param="initParam"
      :data-callback="dataCallback"
      rowKey="company_id"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button
          v-auth="'add'"
          type="primary"
          :icon="CirclePlus"
          @click="openDrawer('create')"
          >{{ $t("companyManagement.add") }}</el-button
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
import { getCompanyPageList, deleteCompany } from "@/services/company.service";
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
  return getCompanyPageList(newParams);
};

// 表格配置项
const columns = reactive<ColumnProps[]>([
  { type: "selection", fixed: "left", width: 70 },
  {
    prop: "company_name",
    label: "公司名称",
    i18nKey: "companyManagement.company",
    minWidth: 120,
    search: {
      el: "input",
      props: {
        clearable: true,
        // placeholder: "companyManagement.companyPlaceholder",
      },
    },
  },
  {
    prop: "establish_time",
    label: "成立时间",
    i18nKey: "companyManagement.establish_time",
    minWidth: 200,
  },
  {
    prop: "address",
    label: "公司地址",
    i18nKey: "companyManagement.address",
    minWidth: 200,
  },
  {
    prop: "contact_phone",
    label: "联系电话",
    i18nKey: "companyManagement.contact_phone",
    minWidth: 120,
  },
  {
    prop: "remark",
    label: "备注",
    i18nKey: "companyManagement.remark",
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

// 删除公司信息
const deleteAccount = async (params) => {
  await useHandleData(
    deleteCompany,
    { company_id: params.company_id },
    t("companyManagement.deleteTip", { name: params.company_name }),
    t
  );

  proTable.value?.getTableList();
};

// 批量删除公司信息
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
      await Promise.all(ids.map((id) => deleteCompany({ company_id: id })));
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
