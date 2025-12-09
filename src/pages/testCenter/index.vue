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
import searchForm from "./components/searchForm.vue";
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
    minWidth: 120,
    search: {
      el: "input",
      props: { clearable: true, placeholder: "请输入用户名称" },
    },
  },
  { prop: "email", label: "考试名称", minWidth: 200 },
  { prop: "company_name", label: "公司", minWidth: 120 },
  { prop: "department_name", label: "部门", width: 120 },
  { prop: "position_name", label: "岗位", minWidth: 120 },
  { prop: "position", label: "开始时间", width: 120 },
  { prop: "position", label: "结束时间", width: 120 },
  { prop: "position", label: "完成题数", width: 120 },
  { prop: "position", label: "总题数", width: 120 },
  { prop: "position", label: "分数", width: 120 },
  { prop: "position", label: "总分", width: 120 },
]);

const handleSearch = (params: any) => {
  proTable.value?.handleAlignsearch(params);
};
// 删除用户信息
const deleteAccount = async (params) => {
  await useHandleData(
    deleteUser,
    { id: params.id },
    `是否确认删除【${params.name}】用户`,
    t
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
