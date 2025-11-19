<template>
  <el-drawer
    v-model="drawerVisible"
    :destroy-on-close="true"
    size="450px"
    :title="`${title}公司`"
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
      <el-form-item label="公司名称" prop="company_name">
        <el-input
          v-model="operateInfo!.company_name"
          :disabled="type !== 'create'"
          placeholder="请填写公司名称"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="成立时间" prop="stablish_time">
        <el-date-picker
          v-model="operateInfo!.stablish_time"
          placeholder="请选择成立时间"
          type="date"
          value-format="yyyy-MM-dd"
          clearable
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="公司地址" prop="address">
        <el-input
          v-model="operateInfo!.address"
          placeholder="请填写公司地址"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="contact_phone">
        <el-input
          v-model="operateInfo!.contact_phone"
          placeholder="请填写联系电话"
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
import { updateCompany, addCompany } from "@/services/company.service";

const emits = defineEmits(["close", "refresh"]);
const rules = reactive({
  company_name: [{ required: true, message: "请填写公司名称" }],
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

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return;
    try {
      const api =
        type.value === "create"
          ? addCompany
          : type.value === "update"
          ? updateCompany
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
