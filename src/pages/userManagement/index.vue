<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :init-param="initParam"
      :data-callback="dataCallback"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button
          v-auth="'add'"
          type="primary"
          :icon="CirclePlus"
          @click="openDrawer('create')"
          >{{ $t("userManagement.add") }}</el-button
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
    <UserDrawer
      v-if="userDrawerVisible"
      :rowInfo="userInfo"
      :type="drawerType"
      @refresh="refreshTable"
      @close="userDrawerVisible = false"
      ref="drawerRef"
    />
  </div>
</template>

<script setup lang="tsx" name="useProTable">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import UserDrawer from "./components/UserDrawer.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { CirclePlus, Delete, EditPen, View } from "@element-plus/icons-vue";
import { getUserList, deleteUser } from "@/services/user.service";
import { useHandleData } from "@/hooks/useHandleData";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const proTable = ref<ProTableInstance>();

const initParam = reactive({});
const dataCallback = (data: any) => {
  return {
    list: data.data.data,
    total: data.data.total,
  };
};

const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  return getUserList(newParams);
};

// 表格配置项
const columns = reactive<ColumnProps[]>([
  { type: "selection", fixed: "left", width: 70 },
  {
    prop: "name",
    label: "用户名称",
    i18nKey: "userManagement.name",
    minWidth: 120,
    search: {
      el: "input",
      props: {
        clearable: true,
        // placeholder: "userManagement.namePlaceholder",
      },
    },
  },
  {
    prop: "email",
    label: "邮箱",
    i18nKey: "userManagement.email",
    minWidth: 200,
  },
  {
    prop: "telephone",
    label: "手机号",
    i18nKey: "userManagement.phone",
    minWidth: 120,
  },
  {
    prop: "department",
    label: "部门",
    i18nKey: "companyManagement.deptment",
    minWidth: 120,
  },
  { prop: "role", label: "角色", i18nKey: "userManagement.role", width: 120 },
  {
    prop: "position",
    label: "岗位",
    i18nKey: "companyManagement.position",
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

// 删除用户信息
const deleteAccount = async (params) => {
  await useHandleData(
    deleteUser,
    { id: params.id },
    t("userManagement.deleteTip", { name: params.name }),
    t
  );
  proTable.value?.getTableList();
};

// 批量删除用户信息
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
      await Promise.all(ids.map((id) => deleteUser({ id })));
      ElMessage.success(t("common.batchDeleteSuccess"));
      proTable.value?.clearSelection();
      proTable.value?.getTableList();
    })
    .catch(() => {});
};

// 打开 drawer(新增、查看、编辑)
const userDrawerVisible = ref(false);
const userInfo = ref<any>({});
const drawerType = ref<string>("check");
const openDrawer = (type: string, row?: any) => {
  if (row) {
    userInfo.value = row;
  } else {
    userInfo.value = {};
  }
  drawerType.value = type;
  userDrawerVisible.value = true;
};
const refreshTable = () => {
  proTable.value?.getTableList();
};
</script>
