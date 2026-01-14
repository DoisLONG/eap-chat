<template>
  <el-drawer
    v-model="drawerVisible"
    :destroy-on-close="true"
    size="450px"
    :title="title"
    @close="emits('close')"
  >
    <el-form
      ref="ruleFormRef"
      label-width="100px"
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
      <el-form-item :label="$t('companyManagement.company')" prop="company_id">
        <el-select
          v-model="userInfo!.company_id"
          :placeholder="$t('companyManagement.companyPlaceholder')"
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
      <el-form-item
        :label="$t('companyManagement.deptment')"
        prop="department_id"
      >
        <el-select
          v-model="userInfo!.department_id"
          :placeholder="$t('companyManagement.deptmentPlaceholder')"
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
      <el-form-item
        :label="$t('companyManagement.position')"
        prop="position_id"
      >
        <el-select
          v-model="userInfo!.position_id"
          :placeholder="$t('companyManagement.positionPlaceholder')"
        >
          <el-option
            v-for="oitem in postList"
            :key="oitem.value"
            :label="oitem.label"
            :value="oitem.value"
          />
        </el-select>
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
  </el-drawer>
</template>

<script setup lang="ts" name="UserDrawer">
import { ref, reactive, toRefs, computed } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import {
  getCompanyList,
  getPostList,
  getDeptList,
} from "@/services/company.service";
import { getRoleList } from "@/services/user.service";
import { updateUser, createUser } from "@/services/user.service";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const emits = defineEmits(["close", "refresh"]);

const rules = reactive({
  name: [{ required: true, message: t("userManagement.namePlaceholder") }],
  company_id: [
    { required: true, message: t("companyManagement.companyPlaceholder") },
  ],
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
  department_id: [
    { required: true, message: t("companyManagement.deptmentPlaceholder") },
  ],
  position_id: [
    { required: true, message: t("companyManagement.positionPlaceholder") },
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

// 公司部门岗位
const companyList = ref<{ label: string; value: string }[]>([]);
const deptList = ref<{ label: string; value: string }[]>([]);
const postList = ref<{ label: string; value: string }[]>([]);
const roleList = ref<{ label: string; value: string }[]>([]);

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
  if (userInfo.value?.company_id) {
    params.company_id = userInfo.value.company_id;
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
  if (userInfo.value?.company_id) {
    params.company_id = userInfo.value.company_id;
  }
  if (userInfo.value?.department_id) {
    params.department_id = userInfo.value.department_id;
  }
  getPostList(params).then((res) => {
    const data = res.data.results || [];
    postList.value = data.map((item: any) => ({
      label: item.position_name,
      value: Number(item.position_id) || item.position_id,
    }));
  });
};
queryPost();

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

const changeCompany = () => {
  queryDept();
  postList.value = [];
  userInfo.value.department_id = "";
  userInfo.value.position_id = "";
};

const changeDept = () => {
  queryPost();
  userInfo.value.position_id = "";
};

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
      const res = await api!(userInfo.value);
      if (res.data.http_status_code !== 200) {
        ElMessage.error({
          message: res.data.msg || t("common.operateError"),
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
