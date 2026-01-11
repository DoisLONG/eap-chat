<template>
  <el-drawer
    v-model="drawerVisible"
    :destroy-on-close="true"
    size="70%"
    :title="title"
    @close="emits('close')"
  >
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="operateInfo"
      :hide-required-asterisk="drawerProps.isView"
    >
      <!-- 素材名称 -->
      <el-form-item :label="$t('materialLibrary.name')" prop="title">
        <el-input
          v-model="operateInfo.title"
          :placeholder="$t('common.pleaseInput') + $t('materialLibrary.name')"
          clearable
        />
      </el-form-item>

      <!-- 文件上传 -->
      <el-form-item
        :label="$t('licenseAdmin.selectFile')"
        v-if="type == 'create'"
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
              <el-icon class="upload-icon" :size="60">
                <upload-filled />
              </el-icon>
              <div class="upload-text">
                <p class="upload-title">
                  {{ $t("materialLibrary.uploadTxt") }}
                </p>
                <p class="upload-hint">
                  {{ $t("materialLibrary.uploadType") }}：{{
                    importFileType.replace(/\./g, "").toUpperCase()
                  }}
                </p>
                <!-- <p class="upload-size">文件大小不超过 50MB</p> -->
              </div>
            </div>
          </el-upload>

          <!-- 上传进度 -->
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

      <!-- 素材分类 -->
      <el-form-item :label="$t('materialLibrary.category')" prop="category">
        <el-select
          v-model="operateInfo.category"
          :placeholder="
            $t('common.pleaseSelect') + $t('materialLibrary.category')
          "
          clearable
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 素材描述 -->
      <el-form-item
        :label="$t('materialLibrary.description')"
        prop="description"
      >
        <el-input
          v-model="operateInfo.description"
          type="textarea"
          :rows="3"
          :placeholder="
            $t('common.pleaseInput') + $t('materialLibrary.description')
          "
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 关联课程 -->
      <!-- <el-form-item :label="$t('materialLibrary.course')" prop="course_id">
        <el-select
          v-model="operateInfo.course_id"
          :placeholder="
            $t('common.pleaseSelect') + $t('materialLibrary.course')
          "
          clearable
          filterable
        >
          <el-option
            v-for="item in courseList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item> -->

      <!-- 公司选择 -->
      <el-form-item :label="$t('companyManagement.company')" prop="company_id">
        <el-select
          v-model="operateInfo.company_id"
          @change="changeCompany"
          :placeholder="$t('companyManagement.companyPlaceholder')"
          clearable
        >
          <el-option
            v-for="oitem in companyList"
            :key="oitem.value"
            :label="oitem.label"
            :value="oitem.value"
          />
        </el-select>
      </el-form-item>

      <!-- 部门选择 -->
      <el-form-item :label="$t('licenseAdmin.deptment')" prop="department_id">
        <el-select
          v-model="operateInfo.department_id"
          :placeholder="$t('companyManagement.deptmentPlaceholder')"
          @change="changeDept"
          clearable
        >
          <el-option
            v-for="oitem in deptList"
            :key="oitem.value"
            :label="oitem.label"
            :value="oitem.value"
          />
        </el-select>
      </el-form-item>

      <!-- 岗位选择 -->
      <el-form-item :label="$t('licenseAdmin.position')" prop="position_id">
        <el-select
          v-model="operateInfo.position_id"
          :placeholder="$t('companyManagement.positionPlaceholder')"
          clearable
        >
          <el-option
            v-for="oitem in postList"
            :key="oitem.value"
            :label="oitem.label"
            :value="oitem.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emits('close')">{{ $t("common.cancel") }}</el-button>
      <el-button
        v-show="!drawerProps.isView"
        type="primary"
        @click="handleSubmit"
        :loading="submitLoading"
        >{{ $t("common.confirm") }}</el-button
      >
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="UserDrawer">
import { ref, reactive, toRefs, computed, onMounted } from "vue";
import {
  ElMessage,
  FormInstance,
  UploadInstance,
  UploadProps,
  UploadRawFile,
} from "element-plus";
import {
  getCompanyList,
  getDeptList,
  getPostList,
} from "@/services/company.service";
import { uploadMaterial, updateMaterial } from "@/services/mobile.service";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

const emits = defineEmits(["close", "refresh"]);

// 表单验证规则
const rules = computed(() => ({
  title: [
    {
      required: true,
      message: t("common.pleaseInput") + t("materialLibrary.name"),
      trigger: "blur",
    },
  ],
  category: [{ required: true, message: t("materialLibrary.selectCategory") }],
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
  company_id: [
    { required: false, message: t("companyManagement.companyPlaceholder") },
  ],
  department_id: [
    { required: false, message: t("companyManagement.deptmentPlaceholder") },
  ],
  position_id: [
    { required: false, message: t("companyManagement.positionPlaceholder") },
  ],
}));

interface DrawerProps {
  isView: boolean;
}

const props = defineProps<{
  rowInfo: any;
  type: string;
}>();

const { rowInfo, type } = toRefs(props);

const title = computed(() => {
  if (type.value === "create") return t("materialLibrary.addTitle");
  if (type.value === "update") return t("common.edit");
  return t("common.check");
});

// 表单数据
const operateInfo = ref<any>({
  files: [],
  title: "",
  description: "",
  category: "",
  // course_id: "",
  ...rowInfo.value,
});

const drawerVisible = ref(true);
const drawerProps = ref<DrawerProps>({
  isView: type.value === "check",
});

// 上传相关
const uploadRef = ref<UploadInstance>();
const uploadProgress = ref(0);
const submitLoading = ref(false);

// 下拉选项数据
const companyList = ref<{ label: string; value: string }[]>([]);
const deptList = ref<{ label: string; value: string }[]>([]);
const postList = ref<{ label: string; value: string }[]>([]);
const courseList = ref<{ label: string; value: string }[]>([]);

// 素材分类选项
const categoryOptions = ref([
  { label: "安全培训", value: "安全培训" },
  { label: "技能提升", value: "技能提升" },
  { label: "入职培训", value: "入职培训" },
  { label: "产品培训", value: "产品培训" },
]);

// 公司变更处理
const changeCompany = () => {
  queryDept();
  postList.value = [];
  operateInfo.value.department_id = "";
  operateInfo.value.position_id = "";
};

// 部门变更处理
const changeDept = () => {
  queryPost();
  operateInfo.value.position_id = "";
};

// 查询公司列表
const queryCompany = async () => {
  try {
    const params: any = {};
    const res = await getCompanyList(params);
    const data = res.data.results || [];
    companyList.value = data.map((item: any) => ({
      label: item.company_name,
      value: item.company_id,
    }));
  } catch (error) {
    console.error("获取公司列表失败:", error);
  }
};

// 查询部门列表
const queryDept = async () => {
  try {
    const params: any = {};
    if (operateInfo.value?.company_id) {
      params.company_id = operateInfo.value.company_id;
    }
    const res = await getDeptList(params);
    const data = res.data.results || [];
    deptList.value = data.map((item: any) => ({
      label: item.department_name,
      value: item.department_id,
    }));
  } catch (error) {
    console.error("获取部门列表失败:", error);
  }
};

// 查询岗位列表
const queryPost = async () => {
  try {
    const params: any = {};
    if (operateInfo.value?.company_id) {
      params.company_id = operateInfo.value.company_id;
    }
    if (operateInfo.value?.department_id) {
      params.department_id = operateInfo.value.department_id;
    }
    const res = await getPostList(params);
    const data = res.data.results || [];
    postList.value = data.map((item: any) => ({
      label: item.position_name,
      value: item.position_id,
    }));
  } catch (error) {
    console.error("获取岗位列表失败:", error);
  }
};

// 上传文件类型限制
const importFileType = ref(".xlsx,.xls,.pdf,.pptx,.ppt,.doc,.docx");

// 文件上传变更处理
const onUploadChange: UploadProps["onChange"] = (uploadFile, uploadFiles) => {
  operateInfo.value.files = uploadFiles;

  // 如果没有填写素材名称，自动使用文件名
  if (!operateInfo.value.title && uploadFile.name) {
    const fileName = uploadFile.name.substring(
      0,
      uploadFile.name.lastIndexOf(".")
    );
    operateInfo.value.title = fileName;
  }
};

// 文件移除处理
const onUploadRemove: UploadProps["onRemove"] = (uploadFile, uploadFiles) => {
  operateInfo.value.files = uploadFiles;
};

// 文件超出限制处理
const handleExceed: UploadProps["onExceed"] = (files) => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  uploadRef.value!.handleStart(file);
};

// 上传前验证
const beforeUpload = (rawFile: UploadRawFile) => {
  const fileSize = rawFile.size / 1024 / 1024; // MB
  // if (fileSize > 50) {
  //   ElMessage.error("文件大小不能超过 50MB!");
  //   return false;
  // }
  return true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return;

    // 只有新增时才需要检查文件
    if (type.value === "create" && operateInfo.value.files.length === 0) {
      ElMessage.error(t("materialLibrary.selectFiles"));
      return;
    }

    submitLoading.value = true;
    uploadProgress.value = 0;

    try {
      if (type.value === "create") {
        // 新增素材 - 上传文件
        const formData = new FormData();
        const file = operateInfo.value.files[0].raw;
        formData.append("file", file);
        formData.append("title", operateInfo.value.title);

        if (operateInfo.value.description) {
          formData.append("description", operateInfo.value.description);
        }
        if (operateInfo.value.category) {
          formData.append("category", operateInfo.value.category);
        }
        // if (operateInfo.value.course_id) {
        //   formData.append("course_id", operateInfo.value.course_id);
        // }
        // if (operateInfo.value.company_id) {
        //   formData.append("company_id", operateInfo.value.company_id);
        // }
        // if (operateInfo.value.department_id) {
        //   formData.append("department_id", operateInfo.value.department_id);
        // }
        // if (operateInfo.value.position_id) {
        //   formData.append("position_id", operateInfo.value.position_id);
        // }

        const res = await uploadMaterial(formData);
        console.log("res", res);
        if (res.data.code == 0) {
          ElMessage.success(t("materialLibrary.addSuccess"));
          emits("close");
          emits("refresh");
        } else {
          ElMessage.error(res.data.message || t("common.operateError"));
        }
      } else {
        // 编辑素材信息
        const res = await updateMaterial({
          material_id: operateInfo.value.material_id,
          title: operateInfo.value.title,
          description: operateInfo.value.description,
          category: operateInfo.value.category,
          // course_id: operateInfo.value.course_id,
          // company_id: operateInfo.value.company_id,
          // department_id: operateInfo.value.department_id,
          // position_id: operateInfo.value.position_id,
        });
        if (res.data.code != 0) {
          ElMessage.error({
            message: res.data.message || t("common.operateError"),
          });
          return;
        }
        emits("close");
        emits("refresh");
        ElMessage.success({
          message: t("materialLibrary.editSuccess"),
        });
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

// 初始化数据
onMounted(() => {
  queryCompany();
  queryDept();
  queryPost();
});
</script>

<style scoped>
.upload-container {
  width: 100%;
}

.upload-demo {
  width: 100%;
}

.upload-content {
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.upload-content:hover {
  background-color: #f8f9fa;
}

.upload-icon {
  color: #409eff;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.upload-content:hover .upload-icon {
  color: #337ecc;
  transform: scale(1.1);
}

.upload-text {
  color: #606266;
}

.upload-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: #303133;
}

.upload-hint {
  font-size: 14px;
  margin: 0 0 4px 0;
  color: #909399;
}

.upload-size {
  font-size: 12px;
  margin: 0;
  color: #c0c4cc;
}

.upload-progress {
  margin-top: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.progress-text {
  text-align: center;
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #606266;
}

/* 自定义上传区域样式 */
:deep(.el-upload-dragger) {
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  background-color: #fafafa;
  transition: all 0.3s ease;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409eff;
  background-color: #f0f8ff;
}

:deep(.el-upload-dragger.is-dragover) {
  border-color: #409eff;
  background-color: #e6f3ff;
}

/* 文件列表样式优化 */
:deep(.el-upload-list) {
  margin-top: 16px;
}

:deep(.el-upload-list__item) {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

:deep(.el-upload-list__item:hover) {
  background-color: #f0f8ff;
  border-color: #409eff;
}

:deep(.el-upload-list__item-name) {
  color: #303133;
  font-weight: 500;
}

/* 进度条样式 */
:deep(.el-progress-bar__outer) {
  border-radius: 10px;
  background-color: #e4e7ed;
}

:deep(.el-progress-bar__inner) {
  border-radius: 10px;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
}

/* 表单项间距优化 */
:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}

/* 选择器样式优化 */
:deep(.el-select) {
  width: 100%;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
}

/* 按钮样式 */
:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

/* 抽屉标题样式 */
:deep(.el-drawer__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-drawer__title) {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 抽屉内容区域 */
:deep(.el-drawer__body) {
  padding: 24px;
}

/* 抽屉底部 */
:deep(.el-drawer__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  background-color: #fafafa;
}
</style>
