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
      <el-form-item
        :label="$t('companyManagement.company')"
        prop="company_name"
      >
        <el-input
          v-model="operateInfo!.company_name"
          :disabled="type !== 'create'"
          :placeholder="$t('companyManagement.companyPlaceholder')"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item
        :label="$t('companyManagement.establish_time')"
        prop="establish_time"
      >
        <el-date-picker
          style="width: 100%"
          v-model="operateInfo!.establish_time"
          :placeholder="$t('companyManagement.establish_timePlaceholder')"
          type="date"
          value-format="YYYY-MM-DD"
          clearable
        ></el-date-picker>
      </el-form-item>
      <el-form-item :label="$t('companyManagement.address')" prop="address">
        <el-input
          v-model="operateInfo!.address"
          :placeholder="$t('companyManagement.addressPlaceholder')"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item
        :label="$t('companyManagement.contact_phone')"
        prop="contact_phone"
      >
        <el-input
          v-model="operateInfo!.contact_phone"
          :placeholder="$t('companyManagement.contact_phonePlaceholder')"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('companyManagement.remark')" prop="remark">
        <el-input
          v-model="operateInfo!.remark"
          :placeholder="$t('companyManagement.remarkPlaceholder')"
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
import { updateCompany, addCompany } from "@/services/company.service";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const emits = defineEmits(["close", "refresh"]);
const rules = reactive({
  company_name: [
    { required: true, message: t("companyManagement.companyPlaceholder") },
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
  if (type.value === "create") return t("companyManagement.add");
  if (type.value === "update") return t("common.edit");
  return t("common.check");
});

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
        ElMessage.error({ message: res.data.msg || t("common.operateError") });
        return;
      }
      emits("close");
      emits("refresh");
      ElMessage.success({
        message: t(
          type.value === "create"
            ? "companyManagement.operateSuccess"
            : "companyManagement.editSuccess"
        ),
      });
    } catch (error) {
      console.log(error);
    }
  });
};
</script>
