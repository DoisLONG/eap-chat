<template>
  <el-dialog
    v-model="dialogVisible"
    class="material-upload-dialog"
    :title="title"
    width="624px"
    align-center
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="resetForm"
    @closed="emits('close')"
  >
    <el-form
      ref="ruleFormRef"
      class="material-form"
      :label-width="language === 'zh' ? '112px' : '150px'"
      label-suffix="："
      :rules="rules"
      :disabled="isView"
      :model="operateInfo"
      :hide-required-asterisk="isView"
    >
      <el-form-item :label="$t('materialLibrary.name')" prop="title">
        <el-input
          v-model="operateInfo.title"
          :placeholder="$t('materialLibrary.filterPlaceholder')"
          clearable
        />
      </el-form-item>

      <el-form-item :label="$t('materialLibrary.category')" prop="category">
        <el-select
          v-model="operateInfo.category"
          :placeholder="$t('materialLibrary.selectCategory')"
          clearable
          @change="handleCategoryChange"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('materialLibrary.subCategory')">
        <el-select
          v-model="operateInfo.sub_category"
          :placeholder="$t('materialLibrary.unselected')"
          :disabled="!operateInfo.category"
          clearable
        >
          <el-option
            v-for="item in subCategoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        :label="$t('materialLibrary.description')"
        prop="description"
      >
        <el-input
          v-model="operateInfo.description"
          type="textarea"
          :rows="4"
          :placeholder="
            $t('common.pleaseInput') + $t('materialLibrary.description')
          "
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item
        v-if="type === 'create'"
        :label="$t('licenseAdmin.selectFile')"
        prop="files"
      >
        <div class="upload-container">
          <el-upload
            ref="uploadRef"
            class="upload-demo"
            drag
            :auto-upload="false"
            :file-list="operateInfo.files"
            :on-change="onUploadChange"
            :on-remove="onUploadRemove"
            :accept="importFileType"
            :limit="1"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
          >
            <div class="upload-content">
              <el-icon class="upload-icon" :size="36">
                <upload-filled />
              </el-icon>
              <p class="upload-title">
                {{ $t("materialLibrary.uploadTxt") }}
              </p>
            </div>
          </el-upload>

          <div
            v-if="uploadProgress > 0 && uploadProgress < 100"
            class="upload-progress"
          >
            <el-progress
              :percentage="uploadProgress"
              :stroke-width="8"
              :show-text="true"
              status="success"
            />
            <p class="progress-text">正在上传... {{ uploadProgress }}%</p>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ $t("common.cancel") }}
      </el-button>
      <el-button
        v-show="!isView"
        type="primary"
        :loading="submitLoading"
        @click="handleSubmit"
      >
        {{ $t("common.confirm") }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="UserDrawer">
import { computed, ref, toRefs } from "vue";
import {
  ElMessage,
  FormInstance,
  UploadInstance,
  UploadProps,
  UploadRawFile,
} from "element-plus";
import { uploadMaterial, updateMaterial } from "@/services/mobile.service";
import { useI18n } from "vue-i18n";
import { useGlobalStore } from "@/stores/modules/global";

interface CategoryOption {
  label: string;
  value: string;
  allLabel: string;
  children: {
    label: string;
    value: string;
  }[];
}

const props = defineProps<{
  rowInfo: any;
  type: string;
  categoryOptions: CategoryOption[];
}>();

const emits = defineEmits(["close", "refresh"]);
const { rowInfo, type } = toRefs(props);
const { t } = useI18n();
const globalStore = useGlobalStore();
const language = computed(() => globalStore.language);
const dialogVisible = ref(true);
const isView = computed(() => type.value === "check");

const title = computed(() => {
  if (type.value === "create") return t("materialLibrary.add");
  if (type.value === "update") return t("common.edit");
  return t("common.check");
});

const createInitialFormData = () => {
  const category = props.categoryOptions.some(
    (item) => item.value === rowInfo.value?.category,
  )
    ? rowInfo.value.category
    : "";

  return {
    ...rowInfo.value,
    files: [],
    title: rowInfo.value?.title || "",
    description: rowInfo.value?.description || "",
    category,
    sub_category:
      rowInfo.value?.sub_category || rowInfo.value?.subCategory || "",
  };
};

const operateInfo = ref<any>(createInitialFormData());
const uploadRef = ref<UploadInstance>();
const uploadProgress = ref(0);
const submitLoading = ref(false);
const ruleFormRef = ref<FormInstance>();
const importFileType = ref(".xlsx,.xls,.pdf,.pptx,.ppt,.doc,.docx");

const categoryOptions = computed(() => props.categoryOptions);
const subCategoryOptions = computed(() => {
  return (
    props.categoryOptions.find(
      (item) => item.value === operateInfo.value.category,
    )?.children || []
  );
});

const rules = computed(() => ({
  title: [
    {
      required: true,
      message: t("materialLibrary.filterPlaceholder"),
      trigger: "blur",
    },
  ],
  category: [
    {
      required: true,
      message: t("materialLibrary.selectCategory"),
      trigger: "change",
    },
  ],
  files:
    type.value === "create"
      ? [
          {
            required: true,
            message: t("materialLibrary.selectFiles"),
            trigger: "change",
          },
        ]
      : [],
}));

const handleCategoryChange = () => {
  operateInfo.value.sub_category = "";
};

const isAllowedFile = (fileName: string) => {
  const extension = `.${fileName.split(".").pop()?.toLowerCase() || ""}`;
  return importFileType.value.split(",").includes(extension);
};

const onUploadChange: UploadProps["onChange"] = (uploadFile, uploadFiles) => {
  if (!isAllowedFile(uploadFile.name)) {
    ElMessage.error(
      `${t("materialLibrary.uploadType")}：${importFileType.value
        .replace(/\./g, "")
        .toUpperCase()}`,
    );
    uploadRef.value?.clearFiles();
    operateInfo.value.files = [];
    return;
  }

  operateInfo.value.files = uploadFiles;
  ruleFormRef.value?.clearValidate("files");

  if (!operateInfo.value.title && uploadFile.name) {
    const lastDotIndex = uploadFile.name.lastIndexOf(".");
    operateInfo.value.title =
      lastDotIndex > 0
        ? uploadFile.name.substring(0, lastDotIndex)
        : uploadFile.name;
  }
};

const onUploadRemove: UploadProps["onRemove"] = (_uploadFile, uploadFiles) => {
  operateInfo.value.files = uploadFiles;
};

const handleExceed: UploadProps["onExceed"] = (files) => {
  uploadRef.value?.clearFiles();
  const file = files[0] as UploadRawFile;
  uploadRef.value?.handleStart(file);
};

const beforeUpload = (rawFile: UploadRawFile) => {
  return isAllowedFile(rawFile.name);
};

const resetForm = () => {
  operateInfo.value = createInitialFormData();
  uploadRef.value?.clearFiles();
  uploadProgress.value = 0;
  submitLoading.value = false;
  ruleFormRef.value?.clearValidate();
};

const closeAfterSuccess = () => {
  emits("refresh");
  dialogVisible.value = false;
};

const handleSubmit = () => {
  ruleFormRef.value?.validate(async (valid) => {
    if (!valid) return;

    if (type.value === "create" && operateInfo.value.files.length === 0) {
      ElMessage.error(t("materialLibrary.selectFiles"));
      return;
    }

    submitLoading.value = true;
    uploadProgress.value = 0;

    try {
      if (type.value === "create") {
        const formData = new FormData();
        formData.append("file", operateInfo.value.files[0].raw);
        formData.append("title", operateInfo.value.title);
        formData.append("category", operateInfo.value.category);

        if (operateInfo.value.sub_category) {
          formData.append("sub_category", operateInfo.value.sub_category);
        }
        if (operateInfo.value.description) {
          formData.append("description", operateInfo.value.description);
        }

        const res = await uploadMaterial(formData);
        if (res.data.code == 0) {
          ElMessage.success(t("materialLibrary.addSuccess"));
          closeAfterSuccess();
        } else {
          ElMessage.error(res.data.message || t("common.operateError"));
        }
      } else {
        const res = await updateMaterial({
          material_id: operateInfo.value.material_id,
          title: operateInfo.value.title,
          description: operateInfo.value.description,
          category: operateInfo.value.category,
          sub_category: operateInfo.value.sub_category,
        });
        if (res.data.code != 0) {
          ElMessage.error({
            message: res.data.message || t("common.operateError"),
          });
          return;
        }
        ElMessage.success({
          message: t("materialLibrary.editSuccess"),
        });
        closeAfterSuccess();
      }
    } catch (error) {
      console.error("提交失败:", error);
      ElMessage.error(t("common.operateError"));
    } finally {
      submitLoading.value = false;
      uploadProgress.value = 0;
    }
  });
};
</script>

<style scoped lang="scss">
:global(.material-upload-dialog) {
  max-width: calc(100vw - 32px);
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 18px 48px rgb(0 0 0 / 18%);
}

:global(.material-upload-dialog .el-dialog__header) {
  padding: 18px 24px 16px;
  margin-right: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:global(.material-upload-dialog .el-dialog__title) {
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  color: var(--el-text-color-primary);
}

:global(.material-upload-dialog .el-dialog__headerbtn) {
  top: 12px;
  right: 14px;
  width: 40px;
  height: 40px;
}

:global(.material-upload-dialog .el-dialog__body) {
  max-height: calc(100vh - 190px);
  padding: 24px 28px 8px;
  overflow-y: auto;
}

:global(.material-upload-dialog .el-dialog__footer) {
  padding: 16px 22px 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.material-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-form-item__label) {
    font-size: 16px;
    font-weight: 400;
    color: var(--el-text-color-primary);
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    min-height: 40px;
    border-radius: 5px;
  }

  :deep(.el-select) {
    width: 100%;
  }

  :deep(.el-textarea__inner) {
    min-height: 104px !important;
    padding: 10px 12px;
    border-radius: 5px;
  }
}

.upload-container,
.upload-demo {
  width: 100%;
}

.upload-content {
  padding: 26px 16px 24px;
  text-align: center;
}

.upload-icon {
  margin-bottom: 10px;
  color: var(--el-color-primary);
}

.upload-title {
  margin: 0;
  font-size: 15px;
  line-height: 22px;
  color: var(--el-text-color-secondary);
}

:deep(.el-upload-dragger) {
  width: 100%;
  padding: 0;
  background: var(--el-fill-color-extra-light);
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
}

:deep(.el-upload-dragger:hover),
:deep(.el-upload-dragger.is-dragover) {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}

:deep(.el-upload-list) {
  margin-top: 10px;
}

.upload-progress {
  padding: 12px;
  margin-top: 12px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}

.progress-text {
  margin: 8px 0 0;
  font-size: 14px;
  text-align: center;
  color: var(--el-text-color-secondary);
}

:global(.material-upload-dialog .el-dialog__footer .el-button) {
  min-width: 68px;
  height: 40px;
  margin-left: 10px;
  border-radius: 5px;
}

@media (max-width: 640px) {
  :global(.material-upload-dialog .el-dialog__body) {
    padding-right: 16px;
    padding-left: 16px;
  }

  .material-form {
    :deep(.el-form-item__label) {
      font-size: 14px;
    }
  }
}
</style>
