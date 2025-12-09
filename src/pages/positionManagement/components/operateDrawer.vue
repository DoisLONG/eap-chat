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
        v-if="type === 'create'"
        :label="$t('companyManagement.company')"
        prop="company_id"
      >
        <el-select
          v-model="operateInfo!.company_id"
          @change="changeCompany"
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
        prop="department_id"
      >
        <el-select
          v-model="operateInfo!.department_id"
          :placeholder="$t('deptManagement.deptmentPlaceholder')"
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
      <el-form-item
        :label="$t('positionManagement.position')"
        prop="position_name"
      >
        <el-input
          v-model="operateInfo!.position_name"
          :disabled="type !== 'create'"
          :placeholder="$t('positionManagement.positionPlaceholder')"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('positionManagement.duty')" prop="duty">
        <el-input
          v-model="operateInfo!.duty"
          :placeholder="$t('positionManagement.dutyPlaceholder')"
          type="textarea"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item
        :label="$t('positionManagement.requirement')"
        prop="requirement"
      >
        <el-input
          v-model="operateInfo!.requirement"
          :placeholder="$t('positionManagement.requirementPlaceholder')"
          type="textarea"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('positionManagement.remark')" prop="remark">
        <el-input
          v-model="operateInfo!.remark"
          :placeholder="$t('positionManagement.remarkPlaceholder')"
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
import { updatePost, addPost } from "@/services/company.service";
import { getCompanyList, getDeptList } from "@/services/company.service";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const emits = defineEmits(["close", "refresh"]);
const rules = reactive({
  company_id: [
    { required: true, message: t("companyManagement.companyPlaceholder") },
  ],
  department_id: [
    { required: true, message: t("deptManagement.deptmentPlaceholder") },
  ],
  position_name: [
    { required: true, message: t("positionManagement.positionPlaceholder") },
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
  if (type.value === "create") return t("positionManagement.add");
  if (type.value === "update") return t("common.edit");
  return t("common.check");
});

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
        ElMessage.error({ message: res.data.msg || t("common.operateError") });
        return;
      }
      emits("close");
      emits("refresh");
      ElMessage.success({
        message: t(
          type.value === "create"
            ? "positionManagement.operateSuccess"
            : "positionManagement.editSuccess"
        ),
      });
    } catch (error) {
      console.log(error);
    }
  });
};
</script>
