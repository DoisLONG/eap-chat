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
          >新增用户</el-button
        >
        <el-button
          type="danger"
          :icon="Delete"
          plain
          :disabled="!scope.isSelected"
          @click="batchDelete(scope.selectedListIds)"
        >
          批量删除
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
          >查看</el-button
        >
        <el-button
          type="primary"
          link
          :icon="EditPen"
          @click="openDrawer('update', scope.row)"
          >编辑</el-button
        >
        <el-button
          type="danger"
          link
          :icon="Delete"
          @click="deleteAccount(scope.row)"
          >删除</el-button
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
    width: 120,
    search: {
      el: "input",
      props: { clearable: true, placeholder: "请输入用户名称" },
    },
  },
  { prop: "email", label: "邮箱", width: 200 },
  { prop: "telephone", label: "手机号", width: 120 },
  { prop: "department", label: "部门", width: 120 },
  { prop: "role", label: "角色", width: 120 },
  { prop: "position", label: "岗位", width: 120 },
  { prop: "operation", label: "操作", fixed: "right", width: 280 },
]);

// 删除用户信息
const deleteAccount = async (params) => {
  await useHandleData(
    deleteUser,
    { id: params.id },
    `删除【${params.name}】用户`
  );
  proTable.value?.getTableList();
};

// 批量删除用户信息
const batchDelete = async (ids) => {
  if (!ids.length) return;
  ElMessageBox.confirm(`已选中 ${ids.length} 条，确定删除？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      await Promise.all(ids.map((id) => deleteUser({ id })));
      ElMessage.success("批量删除成功");
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
