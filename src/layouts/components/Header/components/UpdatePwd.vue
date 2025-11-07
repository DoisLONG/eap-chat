<template>
  <el-drawer
    v-model="drawerVisible"
    :destroy-on-close="true"
    size="450px"
    title="修改密码"
    @close="emits('close')"
  >
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :model="userInfo"
    >
      <el-form-item label="旧密码" prop="old_password">
        <el-input
          v-model="userInfo!.old_password"
          placeholder="请填写旧密码"
          clearable
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="new_password">
        <el-input
          v-model="userInfo!.new_password"
          placeholder="请填写新密码"
          clearable
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmpassword">
        <el-input
          v-model="userInfo!.confirmpassword"
          placeholder="请确认新密码"
          clearable
          type="password"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emits('close')">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="UserDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";

import { changePwd } from "@/services/user.service";

const emits = defineEmits(["close", "refresh"]);
const rules = reactive({
  old_password: [
    {
      required: true,
      message: "请输入至少8位密码",
      min: 8,
      trigger: "blur",
    },
  ],
  new_password: [
    {
      required: true,
      message: "请输入至少8位密码",
      min: 8,
      trigger: "blur",
    },
  ],
  confirmpassword: [
    {
      required: true,
      message: "请输入至少8位密码",
      min: 8,
      trigger: "blur",
    },
  ],
});

const userInfo = ref<any>({
  old_password: "",
  new_password: "",
  confirmpassword: "",
});
const drawerVisible = ref(true);

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return;
    if (userInfo.value.new_password !== userInfo.value.confirmpassword) {
      ElMessage.error({ message: "两次输入的密码不一致！" });
      return;
    }
    try {
      const res = await changePwd!(userInfo.value);
      if (res.data.http_status_code !== 200) {
        ElMessage.error({ message: res.data.msg || "操作失败！" });
        return;
      }
      emits("close");
      ElMessage.success({ message: `重设密码成功！` });
    } catch (error) {
      console.log(error);
    }
  });
};
</script>
