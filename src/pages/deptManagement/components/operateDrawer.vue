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
      :model="operateInfo"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item :label="$t('companyManagement.company')" prop="company_id">
        <el-select
          :disabled="type !== 'create'"
          v-model="operateInfo!.company_id"
          :placeholder="$t('companyManagement.companyPlaceholder')"
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
        :label="$t('deptManagement.dept_name')"
        prop="department_name"
      >
        <el-input
          v-model="operateInfo!.department_name"
          :disabled="type !== 'create'"
          :placeholder="$t('deptManagement.dept_namePlaceholder')"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('deptManagement.leader')" prop="manager">
        <el-input
          v-model="operateInfo!.manager"
          :placeholder="$t('deptManagement.leaderPlaceholder')"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item
        :label="$t('deptManagement.manager_phone')"
        prop="manager_phone"
      >
        <el-input
          v-model="operateInfo!.manager_phone"
          :placeholder="$t('deptManagement.manager_phone')"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('deptManagement.remark')" prop="remark">
        <el-input
          v-model="operateInfo!.remark"
          :placeholder="$t('deptManagement.remarkPlaceholder')"
          type="textarea"
          clearable
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
import { updateDept, addDept } from "@/services/company.service";
import { getCompanyList } from "@/services/company.service";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const emits = defineEmits(["close", "refresh"]);
const rules = reactive({
  company_id: [
    { required: true, message: t("companyManagement.companyPlaceholder") },
  ],
  department_name: [
    { required: true, message: t("deptManagement.dept_namePlaceholder") },
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
  if (type.value === "create") return t("deptManagement.add");
  if (type.value === "update") return t("common.edit");
  return t("common.check");
});

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
        ElMessage.error({ message: res.data.msg || t("common.operateError") });
        return;
      }
      emits("close");
      emits("refresh");
      ElMessage.success({
        message: t(
          type.value === "create"
            ? "deptManagement.operateSuccess"
            : "deptManagement.editSuccess"
        ),
      });
    } catch (error) {
      console.log(error);
    }
  });
};
</script>
