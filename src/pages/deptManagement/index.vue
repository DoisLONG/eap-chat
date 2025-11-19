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
          >新增部门</el-button
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
import { getDeptList, deleteDept } from "@/services/company.service";
import { useHandleData } from "@/hooks/useHandleData";

const proTable = ref<ProTableInstance>();

const initParam = reactive({});
const dataCallback = (data: any) => {
  return {
    list: data.results,
    total: data.results.length,
  };
};

const getTableList = (params: any) => {
  let newParams = JSON.parse(JSON.stringify(params));
  return getDeptList(newParams);
};

// 表格配置项
const columns = reactive<ColumnProps[]>([
  { type: "selection", fixed: "left", width: 70 },
  { prop: "company_name", label: "公司名称", minWidth: 150 },
  {
    prop: "department_name",
    label: "部门名称",
    minWidth: 120,
    search: {
      el: "input",
      props: { clearable: true, placeholder: "部门名称" },
    },
  },
  { prop: "manager", label: "部门负责人", minWidth: 150 },
  { prop: "manager_phone", label: "负责人电话", minWidth: 150 },
  { prop: "remark", label: "备注", width: 120 },
  { prop: "operation", label: "操作", fixed: "right", width: 280 },
]);

// 删除用户信息
const deleteAccount = async (params) => {
  await useHandleData(
    deleteDept,
    { department_id: params.department_id },
    `是否确认删除【${params.department_name}】`
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
      await Promise.all(ids.map((id) => deleteDept({ department_id: id })));
      ElMessage.success("批量删除成功");
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
