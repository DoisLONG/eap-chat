<template>
  <el-dialog
    v-model="drawerVisible"
    class="user-dialog"
    :destroy-on-close="true"
    width="560px"
    align-center
    :title="title"
    @close="emits('close')"
  >
    <el-form
      ref="ruleFormRef"
      :label-width="language === 'zh' ? '100px' : '160px'"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="userInfo"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item :label="$t('userManagement.name')" prop="name">
        <el-input
          v-model="userInfo!.name"
          :disabled="type !== 'create'"
          :placeholder="$t('userManagement.namePlaceholder')"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('userManagement.email')" prop="email">
        <el-input
          v-model="userInfo!.email"
          :disabled="type !== 'create'"
          :placeholder="$t('userManagement.emailPlaceholder')"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('userManagement.phone')" prop="telephone">
        <el-input
          v-model="userInfo!.telephone"
          :placeholder="$t('userManagement.phonePlaceholder')"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('userManagement.role')" prop="role_id">
        <el-select
          v-model="userInfo!.role_id"
          :placeholder="$t('userManagement.rolePlaceholder')"
        >
          <el-option
            v-for="oitem in roleList"
            :key="oitem.value"
            :label="oitem.label"
            :value="oitem.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="type === 'create'"
        :label="$t('userManagement.password')"
        prop="password"
      >
        <el-input
          v-model="userInfo!.password"
          :placeholder="$t('userManagement.passwordPlaceholder')"
          clearable
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item
        v-if="type === 'create'"
        :label="$t('userManagement.confirmpassword')"
        prop="confirmpassword"
      >
        <el-input
          v-model="userInfo!.confirmpassword"
          :placeholder="$t('userManagement.confirmpasswordPlaceholder')"
          clearable
          type="password"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emits('close')">{{ $t("common.cancel") }}</el-button>
      <el-button
        v-show="!drawerProps.isView"
        type="primary"
        @click="handleSubmit"
        >{{ $t("common.confirm") }}</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="UserDrawer">
import { ref, reactive, toRefs, computed } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { getRoleList } from "@/services/user.service";
import { updateUser, createUser } from "@/services/user.service";
import { useI18n } from "vue-i18n";
import { useGlobalStore } from "@/stores/modules/global";

const globalStore = useGlobalStore();
const language = computed(() => globalStore.language);
const { t } = useI18n();

const emits = defineEmits(["close", "refresh"]);

const rules = reactive({
  name: [{ required: true, message: t("userManagement.namePlaceholder") }],
  telephone: [
    { required: false, message: t("userManagement.phonePlaceholder") },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: t("userManagement.phonePlaceholder"),
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: t("userManagement.emailPlaceholder") },
    {
      pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
      message: t("userManagement.emailcorrect"),
      trigger: "blur",
    },
  ],
  role_id: [{ required: true, message: t("userManagement.rolePlaceholder") }],
  password: [
    {
      required: true,
      message: t("userManagement.pwd"),
      min: 8,
      trigger: "blur",
    },
  ],
  confirmpassword: [
    {
      required: true,
      message: t("userManagement.confirmpasswordPlaceholder"),
      trigger: "blur",
    },
  ],
});

interface DrawerProps {
  isView: boolean;
}
const props = defineProps<{
  rowInfo: any;
  type: string;
}>();

const { rowInfo, type } = toRefs(props);

const title = computed(() => {
  if (type.value === "create") return t("userManagement.add");
  if (type.value === "update") return t("common.edit");
  return t("common.check");
});

const userInfo = ref<any>({ ...rowInfo.value });
const drawerVisible = ref(true);
const drawerProps = ref<DrawerProps>({
  isView: type.value === "check",
});

// 角色
const roleList = ref<{ label: string; value: string }[]>([]);

const queryRole = () => {
  getRoleList({}).then((res) => {
    const data = res.data.data || [];
    roleList.value = data.map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  });
};
queryRole();

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();

const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return;
    if (userInfo.value.password !== userInfo.value.confirmpassword) {
      ElMessage.error({ message: t("userManagement.pwdError") });
      return;
    }
    try {
      const api =
        type.value === "create"
          ? createUser
          : type.value === "update"
            ? updateUser
            : undefined;
      // 公司/部门/岗位已从表单移除，接口仍可能接收这些字段，提交时补默认占位
      const payload = {
        ...userInfo.value,
        company_id: userInfo.value.company_id || "",
        department_id: userInfo.value.department_id || "",
        position_id: userInfo.value.position_id || "",
      };
      const res = await api!(payload);
      if (res.data.status !== 200) {
        ElMessage.error({
          message: res.data.message || t("common.operateError"),
        });
        return;
      }
      emits("close");
      emits("refresh");
      ElMessage.success({
        message:
          type.value === "create"
            ? t("userManagement.operateSuccess")
            : t("userManagement.editSuccess"),
      });
    } catch (error) {
      console.log(error);
    }
  });
};
</script>

<style scoped lang="scss">
// 新增/编辑/查看用户弹窗：水平垂直居中，与浏览器四周保留间距，内容超高时仅 body 滚动
:global(.user-dialog) {
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 18px 48px rgb(0 0 0 / 18%);
}

:global(.user-dialog .el-dialog__header) {
  flex-shrink: 0;
  padding: 18px 24px 16px;
  margin-right: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:global(.user-dialog .el-dialog__body) {
  flex: 1;
  padding: 24px 24px 8px;
  overflow-y: auto;
}

:global(.user-dialog .el-dialog__footer) {
  flex-shrink: 0;
  padding: 16px 24px 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
