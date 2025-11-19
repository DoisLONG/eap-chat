<template>
  <el-drawer
    v-model="drawerVisible"
    :destroy-on-close="true"
    size="450px"
    :title="`${title}部门`"
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
      <el-form-item label="公司" prop="company_id">
        <el-select
          :disabled="type !== 'create'"
          v-model="operateInfo!.company_id"
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
      <el-form-item label="部门名称" prop="department_name">
        <el-input
          v-model="operateInfo!.department_name"
          :disabled="type !== 'create'"
          placeholder="请填写部门名称"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="部门负责人" prop="manager">
        <el-input
          v-model="operateInfo!.manager"
          placeholder="请填写部门负责人"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="负责人电话" prop="manager_phone">
        <el-input
          v-model="operateInfo!.manager_phone"
          placeholder="请填写负责人电话"
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
import { updateDept, addDept } from "@/services/company.service";
import { getCompanyList } from "@/services/company.service";

const emits = defineEmits(["close", "refresh"]);
const rules = reactive({
  company_id: [{ required: true, message: "请选择公司名称" }],
  department_name: [{ required: true, message: "请填写部门名称" }],
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

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return;
    try {
      const api =
        type.value === "create"
          ? addDept
          : type.value === "update"
          ? updateDept
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
