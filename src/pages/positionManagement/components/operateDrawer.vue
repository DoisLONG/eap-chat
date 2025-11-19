<template>
  <el-drawer
    v-model="drawerVisible"
    :destroy-on-close="true"
    size="450px"
    :title="`${title}岗位`"
    @close="emits('close')"
  >
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="operateInfo"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item v-if="type === 'create'" label="公司" prop="company_id">
        <el-select
          v-model="operateInfo!.company_id"
          @change="changeCompany"
          placeholder="请选择公司"
        >
          <el-option
            v-for="oitem in companyList"
            :key="oitem.value"
            :label="oitem.label"
            :value="oitem.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="部门" prop="department_id">
        <el-select
          v-model="operateInfo!.department_id"
          placeholder="请选择部门"
          :disabled="type !== 'create'"
        >
          <el-option
            v-for="oitem in deptList"
            :key="oitem.value"
            :label="oitem.label"
            :value="oitem.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="岗位名称" prop="position_name">
        <el-input
          v-model="operateInfo!.position_name"
          :disabled="type !== 'create'"
          placeholder="请填写岗位名称"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="岗位职责" prop="duty">
        <el-input
          v-model="operateInfo!.duty"
          placeholder="请填写岗位职责"
          type="textarea"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="任职要求" prop="requirement">
        <el-input
          v-model="operateInfo!.requirement"
          placeholder="请填写任职要求"
          type="textarea"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="operateInfo!.remark"
          placeholder="请填写备注"
          type="textarea"
          clearable
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emits('close')">取消</el-button>
      <el-button
        v-show="!drawerProps.isView"
        type="primary"
        @click="handleSubmit"
        >确定</el-button
      >
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="UserDrawer">
import { ref, reactive, toRefs } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { updatePost, addPost } from "@/services/company.service";
import { getCompanyList, getDeptList } from "@/services/company.service";

const emits = defineEmits(["close", "refresh"]);
const rules = reactive({
  company_id: [{ required: true, message: "请选择公司名称" }],
  department_id: [{ required: true, message: "请选择部门名称" }],
  position_name: [{ required: true, message: "请填写岗位名称" }],
});

interface DrawerProps {
  isView: boolean;
}
const props = defineProps<{
  rowInfo: any;
  type: string;
}>();

const { rowInfo, type } = toRefs(props);
const title = ref(
  type.value === "create" ? "新增" : type.value === "update" ? "编辑" : "查看"
);
const operateInfo = ref<any>({ ...rowInfo.value });
const drawerVisible = ref(true);
const drawerProps = ref<DrawerProps>({
  isView: type.value === "check",
});

const companyList = ref<{ label: string; value: string }[]>([]);
const deptList = ref<{ label: string; value: string }[]>([]);
const changeCompany = () => {
  queryDept();
  operateInfo.value.department_id = "";
};
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
  if (operateInfo.value?.company_id) {
    params.company_id = operateInfo.value.company_id;
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

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return;
    try {
      const api =
        type.value === "create"
          ? addPost
          : type.value === "update"
          ? updatePost
          : undefined;
      const res = await api!(operateInfo.value);
      if (res.data.status !== 200) {
        ElMessage.error({ message: res.data.msg || "操作失败！" });
        return;
      }
      emits("close");
      emits("refresh");
      ElMessage.success({ message: `${title.value}公司成功！` });
    } catch (error) {
      console.log(error);
    }
  });
};
</script>
