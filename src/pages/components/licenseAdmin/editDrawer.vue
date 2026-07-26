<template>
  <el-dialog
    v-model="dialogVisible"
    class="practice-edit-dialog"
    title="编辑练习"
    width="72vw"
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

      <el-form-item label="上传类型">
        <el-select v-model="operateInfo.file_type" disabled>
          <el-option
            v-for="option in fileTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="版本号">
        <el-input v-model="operateInfo.sop_version" disabled />
      </el-form-item>

      <el-form-item label="选择文件" class="form-span-2">
        <div class="file-summary" :title="operateInfo.filename || '-'">
          <el-icon class="file-icon"><Document /></el-icon>
          <div class="file-summary-text">
            <div class="file-name ellipsis">{{ operateInfo.filename || "-" }}</div>
            <div class="file-meta">
              {{ fileTypeLabel }} · {{ categorySummary }}
            </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="练习描述" class="form-span-2">
        <el-input
          v-model="operateInfo.remark"
          type="textarea"
          :rows="4"
          placeholder="请输入练习描述"
          readonly
        />
        <div class="field-note">当前接口暂不支持修改练习描述。</div>
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
import { Document } from "@element-plus/icons-vue";
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
const fileTypeOptions = [
  { label: "SOP 文件", value: "sop" },
  { label: "操作规程", value: "operation" },
  { label: "应急演练", value: "emergency_drill" },
  { label: "风险识别卡", value: "risk" },
];
const operateInfo = reactive({
  title: props.rowInfo?.title || props.rowInfo?.filename || "",
  filename: props.rowInfo?.filename || props.rowInfo?.fileName || "",
  file_type: props.rowInfo?.file_type || "",
  sop_version: props.rowInfo?.sop_version || props.rowInfo?.version || "-",
  remark: props.rowInfo?.remark || props.rowInfo?.description || "",
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
const selectedPrimaryCategory = computed(() =>
  props.categories.find(
    (category) => String(category.id) === String(operateInfo.primary_category_id),
  ),
);
const fileTypeLabel = computed(
  () => fileTypeOptions.find((option) => option.value === operateInfo.file_type)?.label || operateInfo.file_type || "未知类型",
);
const categorySummary = computed(() => {
  const secondary = secondaryCategories.value.find(
    (category) => String(category.id) === String(operateInfo.category_id),
  );
  return [selectedPrimaryCategory.value?.name, secondary?.name].filter(Boolean).join(" / ") || "未分类";
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
    filename: "",
    file_type: "",
    sop_version: "",
    remark: "",
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
.edit-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 28px;
}
.edit-form :deep(.el-form-item) {
  margin-bottom: 22px;
}
.edit-form :deep(.el-select),
.edit-form :deep(.el-input) {
  width: 100%;
}
.form-span-2 {
  grid-column: 1 / -1;
}
.file-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 96px;
  padding: 18px 22px;
  overflow: hidden;
  border: 1px dashed #91bfff;
  border-radius: 8px;
  background: #f7fbff;
}
.file-icon {
  flex: none;
  margin-right: 14px;
  color: #1677ff;
  font-size: 30px;
}
.file-summary-text {
  min-width: 0;
  max-width: calc(100% - 44px);
}
.file-name {
  color: #263445;
  font-weight: 600;
}
.file-meta,
.field-note {
  margin-top: 5px;
  color: #98a2b3;
  font-size: 12px;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid #edf0f4;
}
:deep(.practice-edit-dialog) {
  max-width: 1200px;
}
:deep(.practice-edit-dialog .el-dialog__body) {
  max-height: calc(100vh - 220px);
  overflow-y: auto;
}
:deep(.practice-edit-dialog .el-textarea__inner[readonly]) {
  color: #606266;
  background: #fafafa;
}
@media (max-width: 768px) {
  .edit-form {
    grid-template-columns: 1fr;
  }
  .form-span-2 {
    grid-column: auto;
  }
}
</style>
