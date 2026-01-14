<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :init-param="initParam"
      :data-callback="dataCallback"
      rowKey="course_id"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button
          v-auth="'add'"
          type="primary"
          :icon="CirclePlus"
          @click="openDrawer('create')"
          >{{ $t("course.add") }}</el-button
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
      <template #status="scope">
        <el-tag v-if="scope.row.status === 'published'" type="success"
          >已发布</el-tag
        >
        <el-tag v-else-if="scope.row.status === 'draft'" type="info"
          >草稿</el-tag
        >
        <el-tag v-else-if="scope.row.status === 'archived'" type="warning"
          >已归档</el-tag
        >
        <span v-else>{{ scope.row.status }}</span>
      </template>
      <template #tags="scope">
        <span v-if="scope.row.tags">
          <el-tag
            style="margin-right: 5px"
            v-for="item in scope.row.tags"
            type="info"
            >{{ item }}</el-tag
          >
        </span>

        <span v-else>{{ "--" }}</span>
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
import { getCourseList, deleteCourse } from "@/services/mobile.service";
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
  return getCourseList(newParams);
};

// 表格配置项
const columns = reactive<ColumnProps[]>([
  { type: "selection", fixed: "left", width: 70 },
  {
    prop: "title",
    label: "课程名称",
    i18nKey: "course.name",
    minWidth: 200,
    search: {
      el: "input",
      props: {
        clearable: true,
        placeholder: t("course.searchKeyword"),
      },
    },
  },
  {
    prop: "category",
    label: "所属类别",
    i18nKey: "materialLibrary.category",
    minWidth: 120,
    search: {
      el: "select",
      props: {
        clearable: true,
        placeholder: t("course.searchCategory"),
      },
    },
    enum: [
      { label: t("course.safetyTraining"), value: "安全培训" },
      { label: t("course.skillImprovement"), value: "技能提升" },
      { label: t("course.onboardingTraining"), value: "入职培训" },
      { label: t("course.productTraining"), value: "产品培训" },
    ],
    fieldNames: { label: "label", value: "value" },
  },
  // {
  //   prop: "department_name",
  //   label: "公司",
  //   i18nKey: "companyManagement.company",
  //   minWidth: 150,
  // },
  // {
  //   prop: "department_name",
  //   label: "部门",
  //   i18nKey: "companyManagement.deptment",
  //   minWidth: 150,
  // },
  {
    prop: "position_name",
    label: "岗位",
    i18nKey: "companyManagement.position",
    minWidth: 120,
  },
  {
    prop: "version_code",
    label: "版本",
    i18nKey: "licenseAdmin.version",
    width: 100,
  },
  {
    prop: "tags",
    label: "TAB标签",
    i18nKey: "course.TABTag",
    minWidth: 200,
  },
  // draft 草稿/published 已发布/archived 已归档）
  {
    prop: "status",
    label: "状态",
    i18nKey: "course.status",
    width: 150,
    search: {
      el: "select",
      props: {
        clearable: true,
        placeholder: t("course.searchStatus"),
      },
    },
    enum: [
      { label: t("course.draft"), value: "draft" },
      { label: t("course.published"), value: "published" },
      { label: t("course.archived"), value: "archived" },
    ],
    fieldNames: { label: "label", value: "value" },
  },
  // {
  //   prop: "created_at",
  //   label: "上传时间",
  //   minWidth: 200,
  //   render: (scope) => {
  //     return scope.row.created_at ? formatDateTime(scope.row.created_at) : "-";
  //   },
  // },
  {
    prop: "operation",
    label: "操作",
    i18nKey: "common.operate",
    fixed: "right",
    width: 280,
  },
]);

// 删除岗位信息
const deleteAccount = async (params) => {
  await useHandleData(
    deleteCourse,
    { id: params.course_id },
    t("course.deleteTip", { name: params.title }),
    t
  );

  proTable.value?.getTableList();
};

// 批量删除岗位信息
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
      await Promise.all(ids.map((id) => deleteCourse({ id })));
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
