<template>
  <el-dialog
    v-model="dialogVisible"
    class="practice-edit-dialog"
    title="编辑练习"
    width="720px"
    align-center
    :close-on-click-modal="false"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-form
      ref="ruleFormRef"
      class="edit-form"
      label-width="92px"
      label-suffix="："
      :model="operateInfo"
      :rules="rules"
    >
      <el-form-item label="所属类别" prop="primary_category_id">
        <el-select
          v-model="operateInfo.primary_category_id"
          placeholder="请选择所属类别"
          @change="changePrimaryCategory"
        >
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="细分方向" prop="category_id">
        <el-select
          v-model="operateInfo.category_id"
          placeholder="请选择细分方向"
          :disabled="!operateInfo.primary_category_id"
        >
          <el-option
            v-for="category in secondaryCategories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="练习描述">
        <el-input
          v-model="operateInfo.description"
          type="textarea"
          :rows="4"
          placeholder="请输入练习描述"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button :disabled="submitLoading" @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="PracticeEditDialog">
import { computed, reactive, ref, watch } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { updateSopTitle } from "@/services/sop.api";

type Category = {
  id: number;
  name: string;
  children?: Array<{ id: number; name: string }>;
};

const props = defineProps<{
  rowInfo: any;
  categories: Category[];
}>();
const emits = defineEmits(["close", "refresh"]);
const dialogVisible = ref(true);
const submitLoading = ref(false);
const ruleFormRef = ref<FormInstance>();
const operateInfo = reactive({
  title: props.rowInfo?.title || props.rowInfo?.filename || "",
  description: props.rowInfo?.description || "",
  position_id: props.rowInfo?.position_id,
  primary_category_id: props.rowInfo?.primary_category_id || "",
  category_id: props.rowInfo?.category_id || "",
});
const rules = {
  primary_category_id: [{ required: true, message: "请选择所属类别", trigger: "change" }],
  category_id: [{ required: true, message: "请选择细分方向", trigger: "change" }],
};
const secondaryCategories = computed(() => {
  const primary = props.categories.find(
    (category) => String(category.id) === String(operateInfo.primary_category_id),
  );
  return primary?.children || [];
});
const syncPrimaryCategory = () => {
  if (operateInfo.primary_category_id || !operateInfo.category_id) return;
  const primary = props.categories.find((category) =>
    category.children?.some((child) => String(child.id) === String(operateInfo.category_id)),
  );
  if (primary) operateInfo.primary_category_id = primary.id;
};
watch(() => props.categories, syncPrimaryCategory, { immediate: true });

const changePrimaryCategory = () => {
  operateInfo.category_id = "";
};
const closeDialog = () => {
  dialogVisible.value = false;
};
const handleClosed = () => {
  Object.assign(operateInfo, {
    title: "",
    description: "",
    position_id: undefined,
    primary_category_id: "",
    category_id: "",
  });
  emits("close");
};
const handleSubmit = () => {
  ruleFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    submitLoading.value = true;
    try {
      const response = await updateSopTitle({
        record_id: props.rowInfo.id,
        title: operateInfo.title,
        position_id: operateInfo.position_id,
        category_id: operateInfo.category_id,
        description: operateInfo.description,
      });
      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || "保存失败");
      }
      ElMessage.success("保存成功");
      emits("refresh");
      closeDialog();
    } catch (error) {
      ElMessage.error((error as any)?.response?.data?.message || (error as Error)?.message || "保存失败");
    } finally {
      submitLoading.value = false;
    }
  });
};
</script>

<style scoped>
.edit-form :deep(.el-form-item) {
  margin-bottom: 22px;
  min-width: 0;
}
.edit-form :deep(.el-form-item__label) {
  white-space: nowrap;
}
.edit-form :deep(.el-select),
.edit-form :deep(.el-input) {
  width: 100%;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid #edf0f4;
}
:deep(.practice-edit-dialog) {
  max-width: 720px;
}
:deep(.practice-edit-dialog .el-dialog__body) {
  max-height: calc(100vh - 220px);
  overflow-y: auto;
}
</style>
