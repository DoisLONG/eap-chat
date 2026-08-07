<template>
  <el-drawer
    v-model="drawerVisible"
    :destroy-on-close="true"
    size="450px"
    :title="$t('header.changePassword')"
    @close="emits('close')"
  >
    <el-form
      ref="ruleFormRef"
      :label-width="language === 'zh' ? '120px' : '170px'"
      label-suffix=" :"
      :rules="rules"
      :model="userInfo"
    >
      <el-form-item :label="$t('updatePwd.oldPassword')" prop="old_password">
        <el-input
          v-model="userInfo!.old_password"
          :placeholder="$t('updatePwd.oldPasswordPlaceholder')"
          clearable
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('updatePwd.newPassword')" prop="new_password">
        <el-input
          v-model="userInfo!.new_password"
          :placeholder="$t('updatePwd.newPasswordPlaceholder')"
          clearable
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item
        :label="$t('updatePwd.confirmPassword')"
        prop="confirmpassword"
      >
        <el-input
          v-model="userInfo!.confirmpassword"
          :placeholder="$t('updatePwd.confirmPasswordPlaceholder')"
          clearable
          type="password"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emits('close')">{{ $t("common.cancel") }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{
        $t("common.confirm")
      }}</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="UserDrawer">
import { ref, reactive, computed } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { $t } from "@/languages";
import { useGlobalStore } from "@/stores/modules/global";
import { changePwd } from "@/services/user.service";

const globalStore = useGlobalStore();
const language = computed(() => globalStore.language);
const emits = defineEmits(["close", "refresh"]);
const rules = reactive({
  old_password: [
    {
      required: true,
      message: $t("userManagement.pwd"),
      min: 8,
      trigger: "blur",
    },
  ],
  new_password: [
    {
      required: true,
      message: $t("userManagement.pwd"),
      min: 8,
      trigger: "blur",
    },
  ],
  confirmpassword: [
    {
      required: true,
      message: $t("userManagement.pwd"),
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
      ElMessage.error({ message: $t("userManagement.pwdError") });
      return;
    }
    try {
      const res = await changePwd!(userInfo.value);
      if (res.data.status !== 200) {
        ElMessage.error({ message: res.data.message || $t("updatePwd.fail") });
        return;
      }
      emits("close");
      ElMessage.success({ message: $t("updatePwd.success") });
    } catch (error) {
      console.log(error);
    }
  });
};
</script>
