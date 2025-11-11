<template>
  <el-drawer
    v-model="drawerVisible"
    :destroy-on-close="true"
    size="450px"
    title="编辑"
    @close="emits('close')"
  >
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :model="operateInfo"
    >
      <el-form-item label="新标题" prop="title">
        <el-input
          v-model="operateInfo!.title"
          placeholder="请填写新标题"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="公司" prop="company_id">
        <el-select
          v-model="operateInfo!.company_id"
          placeholder="请选择公司"
          @change="changeCompany"
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
          @change="changeDept"
        >
          <el-option
            v-for="oitem in deptList"
            :key="oitem.value"
            :label="oitem.label"
            :value="oitem.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="岗位" prop="position_id">
        <el-select v-model="operateInfo!.position_id" placeholder="请选择岗位">
          <el-option
            v-for="oitem in postList"
            :key="oitem.value"
            :label="oitem.label"
            :value="oitem.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emits('close')">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit"
        >确定</el-button
      >
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="UserDrawer">
import { ref, reactive, toRefs } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import {
  getCompanyList,
  getPostList,
  getDeptList,
} from "@/services/company.service";
import { updateSopTitle } from "@/services/sop.api";

const emits = defineEmits(["close", "refresh"]);
const rules = reactive({
  title: [{ required: true, message: "请填写新标题" }],
  company_id: [{ required: true, message: "请选择公司" }],
  department_id: [{ required: true, message: "请选择部门" }],
  position_id: [{ required: true, message: "请选择岗位" }],
});
const submitLoading = ref(false);

const props = defineProps<{
  rowInfo: any;
}>();

const { rowInfo } = toRefs(props);

const operateInfo = ref<any>({ ...rowInfo.value });
const drawerVisible = ref(true);

// 公司部门岗位
const companyList = ref<{ label: string; value: string }[]>([]);
const deptList = ref<{ label: string; value: string }[]>([]);
const postList = ref<{ label: string; value: string }[]>([]);
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

const queryPost = () => {
  const params: any = {};
  if (operateInfo.value?.company_id) {
    params.company_id = operateInfo.value.company_id;
  }
  if (operateInfo.value?.department_id) {
    params.department_id = operateInfo.value.department_id;
  }
  getPostList(params).then((res) => {
    const data = res.data.results || [];
    postList.value = data.map((item: any) => ({
      label: item.position_name,
      value: item.position_id,
    }));
  });
};
queryPost();

const changeCompany = () => {
  queryDept();
  postList.value = [];
  operateInfo.value.department_id = "";
  operateInfo.value.position_id = "";
};
const changeDept = () => {
  queryPost();
  operateInfo.value.position_id = "";
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return;
    try {
      submitLoading.value = true;
      const params = {
        record_id: operateInfo.value.id,
        title: operateInfo.value.title,
        company_id: operateInfo.value.company_id,
        department_id: operateInfo.value.department_id,
        position_id: operateInfo.value.position_id,
      };
      const res = await updateSopTitle(params);
      submitLoading.value = false;
      if (res.data.status !== 200) {
        ElMessage.error({ message: res.data.message || "操作失败！" });
        return;
      }
      emits("close");
      emits("refresh");
      ElMessage.success({ message: `编辑成功！` });
    } catch (error) {
      console.log(error);
    }
  });
};
</script>
