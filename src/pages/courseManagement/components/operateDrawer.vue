<template>
  <el-drawer
    v-model="drawerVisible"
    :destroy-on-close="true"
    size="100%"
    :title="title"
    @close="emits('close')"
    class="operate-body"
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
      <div class="add-content">
        <div class="add-content-item left-content">
          <div class="left-top">
            <!-- 素材名称 -->
            <el-form-item :label="$t('course.name')" prop="title">
              <el-input
                v-model="operateInfo.title"
                :placeholder="$t('common.pleaseInput') + $t('course.name')"
                clearable
              />
            </el-form-item>

            <!-- 素材分类 -->
            <el-form-item :label="$t('course.category')" prop="category">
              <el-select
                v-model="operateInfo.category"
                :placeholder="$t('common.pleaseSelect') + $t('course.category')"
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

            <!-- 课程描述 -->
            <el-form-item :label="$t('course.description')" prop="description">
              <el-input
                v-model="operateInfo.description"
                type="textarea"
                :rows="3"
                :placeholder="
                  $t('common.pleaseInput') + $t('course.description')
                "
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            <!-- 课程标签 -->
            <el-form-item :label="$t('course.TABTag')" prop="tags">
              <div class="flex gap-2">
                <el-tag
                  v-for="tag in dynamicTags"
                  :key="tag"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(tag)"
                >
                  {{ tag }}
                </el-tag>
                <el-input
                  v-if="inputVisible"
                  ref="InputRef"
                  v-model="inputValue"
                  class="w-20"
                  size="small"
                  @keyup.enter="handleInputConfirm"
                  @blur="handleInputConfirm"
                />
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput"
                >
                  {{ `+${$t("common.add")}` }}
                </el-button>
              </div>
            </el-form-item>

            <!-- 公司选择 -->
            <el-form-item
              :label="$t('companyManagement.company')"
              prop="company_id"
            >
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
            <el-form-item
              :label="$t('licenseAdmin.deptment')"
              prop="department_id"
            >
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
            <el-form-item
              :label="$t('licenseAdmin.position')"
              prop="position_id"
            >
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
          </div>
          <!-- 文件上传 -->
          <div class="left-bottom">
            <el-form-item :label="$t('licenseAdmin.selectFile')" prop="files">
              <div
                v-if="
                  type !== 'create' &&
                  operateInfo.videos &&
                  operateInfo.videos.length > 0 &&
                  !showUploadArea
                "
                class="existing-video-info"
              >
                <div class="video-info-card">
                  <div class="video-info-header">
                    <span class="video-title">{{
                      operateInfo.videos[0].video_title ||
                      operateInfo.videos[0].title
                    }}</span>
                    <div v-if="type === 'update'" class="video-actions">
                      <el-button
                        v-if="!showUploadArea"
                        type="primary"
                        size="small"
                        @click="handleReuploadClick"
                        :icon="Upload"
                      >
                        {{ $t("course.reupload") }}
                      </el-button>
                    </div>
                  </div>
                  <div class="video-info-details"></div>
                  <!-- 视频预览 -->
                  <div v-if="videoPreviewUrl" class="video-preview">
                    <video
                      :src="videoPreviewUrl"
                      controls
                      preload="metadata"
                      class="preview-video"
                      @loadedmetadata="onVideoLoaded"
                    >
                      {{ $t("course.videoNotSupported") }}
                    </video>
                  </div>
                </div>
              </div>

              <!-- 上传 -->
              <div
                v-if="type === 'create' || showUploadArea"
                class="upload-container"
              >
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
                    <el-icon class="upload-icon" :size="50">
                      <upload-filled />
                    </el-icon>
                    <div class="upload-text">
                      <p class="upload-title">
                        {{
                          type === "create"
                            ? $t("course.uploadTxt")
                            : $t("course.reuploadTxt")
                        }}
                      </p>
                      <p class="upload-hint">
                        {{ $t("course.uploadType") }}
                      </p>
                      <p class="upload-size">{{ $t("course.maxSize") }}</p>
                    </div>

                    <!-- 双进度条显示-->
                    <div
                      v-if="isUploading || analysisStatus === 'exception'"
                      class="upload-progress-container"
                    >
                      <!-- OSS上传进度 -->
                      <div v-if="isUploading" class="upload-progress">
                        <div class="progress-header">
                          <span class="progress-label">{{
                            $t("course.uploadToOss")
                          }}</span>
                          <span class="progress-percentage"
                            >{{ ossUploadProgress }}%</span
                          >
                        </div>
                        <el-progress
                          :percentage="ossUploadProgress"
                          :stroke-width="6"
                          :show-text="false"
                          status="success"
                        />
                      </div>

                      <!-- 视频分析进度 -->
                      <div
                        v-if="isUploading || analysisStatus === 'exception'"
                        class="upload-progress"
                      >
                        <div class="progress-header">
                          <span class="progress-label">{{
                            $t("course.aiAnalysis")
                          }}</span>
                          <span v-if="isUploading" class="progress-percentage"
                            >{{ analysisProgress }}%</span
                          >
                          <span
                            v-else-if="analysisStatus === 'exception'"
                            class="progress-percentage error-text"
                            >{{ $t("course.failed") }}</span
                          >
                        </div>
                        <el-progress
                          v-if="isUploading"
                          :percentage="analysisProgress"
                          :stroke-width="6"
                          :show-text="false"
                          :status="analysisStatus"
                        />
                        <el-progress
                          v-else-if="analysisStatus === 'exception'"
                          :percentage="100"
                          :stroke-width="6"
                          :show-text="false"
                          status="exception"
                        />
                        <div
                          v-if="analysisStatus === 'exception'"
                          class="error-message"
                        >
                          <el-icon class="error-icon"><Warning /></el-icon>
                          <span>{{
                            analysisErrorMessage ||
                            $t("course.aiAnalysisFailed")
                          }}</span>
                          <el-button
                            type="text"
                            size="small"
                            class="error-close-btn"
                            @click="clearAnalysisError"
                          >
                            <el-icon><Close /></el-icon>
                          </el-button>
                        </div>
                      </div>
                    </div>

                    <!-- 视频封面预览 -->
                    <div v-if="coverUrl || coverGenerating" class="video-cover">
                      <div v-if="coverGenerating" class="cover-loading">
                        <el-icon class="is-loading"><Loading /></el-icon>
                      </div>
                      <template v-else-if="coverUrl">
                        <img
                          :src="coverUrl"
                          :alt="$t('course.videoCover')"
                          class="cover-image"
                        />
                        <p class="cover-text">{{ $t("course.videoCover") }}</p>
                      </template>
                    </div>
                  </div>
                </el-upload>
              </div>
            </el-form-item>
          </div>
        </div>
        <div class="add-content-item right-content">
          <div class="keywords-header">
            <span>{{ $t("course.keyworsdEdit") }}</span>
            <el-button
              type="primary"
              size="small"
              @click="addKeyword"
              :icon="Plus"
            >
              {{ $t("course.addKeyWord") }}
            </el-button>
          </div>
          <div class="table-content">
            <el-table
              :data="keywordsList"
              style="width: 100%"
              max-height="400"
              v-loading="tableLoading"
              :element-loading-text="$t('course.aiAnalysisLoading')"
              element-loading-spinner="el-icon-loading"
            >
              <el-table-column type="index" width="50" />
              <el-table-column
                prop="keyword"
                :label="$t('course.keywordTitle')"
                min-width="120"
              >
                <template #default="{ row, $index }">
                  <el-input
                    v-if="row.editing"
                    v-model="row.keyword"
                    size="small"
                    @blur="saveKeyword(row, $index)"
                    @keyup.enter="saveKeyword(row, $index)"
                  />
                  <span v-else @dblclick="editKeyword(row)">{{
                    row.keyword
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="start"
                :label="$t('common.startTime')"
                min-width="100"
              >
                <template #default="{ row, $index }">
                  <el-input
                    v-if="row.editing"
                    v-model="row.start"
                    size="small"
                    placeholder="00:00"
                    maxlength="5"
                    @blur="saveKeyword(row, $index)"
                    @keyup.enter="saveKeyword(row, $index)"
                    @input="validateTimeInput($event, row, 'start')"
                  />
                  <span v-else @dblclick="editKeyword(row)">{{
                    row.start
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="end"
                :label="$t('common.endTime')"
                min-width="100"
              >
                <template #default="{ row, $index }">
                  <el-input
                    v-if="row.editing"
                    v-model="row.end"
                    size="small"
                    placeholder="00:00"
                    maxlength="5"
                    @blur="saveKeyword(row, $index)"
                    @keyup.enter="saveKeyword(row, $index)"
                    @input="validateTimeInput($event, row, 'end')"
                  />
                  <span v-else @dblclick="editKeyword(row)">{{ row.end }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('common.operate')" width="100">
                <template #default="{ row, $index }">
                  <el-button
                    v-if="row.editing"
                    type="success"
                    size="small"
                    @click="saveKeyword(row, $index)"
                    :icon="Check"
                  />
                  <el-button
                    v-else
                    type="primary"
                    size="small"
                    @click="editKeyword(row)"
                    :icon="Edit"
                  />
                  <el-button
                    type="danger"
                    size="small"
                    @click="removeKeyword($index)"
                    :icon="Delete"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="emits('close')">{{
        ["create", "update"].includes(type)
          ? $t("common.cancel")
          : $t("common.close")
      }}</el-button>
      <el-button
        v-show="!drawerProps.isView"
        type="primary"
        @click="handleSubmit"
        :loading="submitLoading"
        >{{
          type === "create" ? $t("course.createCourse") : $t("common.confirm")
        }}</el-button
      >
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="UserDrawer">
import { ref, nextTick, toRefs, computed, onMounted } from "vue";
import {
  ElMessage,
  ElMessageBox,
  FormInstance,
  UploadInstance,
  UploadProps,
  UploadRawFile,
} from "element-plus";
import {
  Plus,
  Edit,
  Delete,
  Check,
  Warning,
  Close,
  Loading,
  Upload,
} from "@element-plus/icons-vue";
import {
  getCompanyList,
  getDeptList,
  getPostList,
} from "@/services/company.service";
import {
  uploadOss,
  createCourse,
  getOssSign,
  getCourseInfo,
  updateCourse,
} from "@/services/mobile.service";
import {
  createAsrJobs,
  getJobStatus,
  getJobResult,
} from "@/services/video.service";
import type { InputInstance } from "element-plus";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

const emits = defineEmits(["close", "refresh"]);

// 时间和秒数互转
const secondsToMMSS = (seconds: number): string => {
  if (!seconds || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

const mmssToSeconds = (timeStr: string): number => {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const parts = timeStr.split(":");
  if (parts.length !== 2) return 0;
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  if (isNaN(minutes) || isNaN(seconds)) return 0;
  return minutes * 60 + seconds;
};

const validateTimeFormat = (timeStr: string): boolean => {
  if (!timeStr) return false;
  const timeRegex = /^([0-5]?\d):([0-5]\d)$/;
  return timeRegex.test(timeStr);
};

const rules = computed(() => ({
  title: [
    {
      required: true,
      message: t("course.searchKeyword"),
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
  if (type.value === "create") return t("course.add");
  if (type.value === "update") return t("common.edit");
  return t("common.check");
});

// 表单数据
const operateInfo = ref<any>({
  files: [],
  title: "",
  description: "",
  category: "",
  cover_oss_uri: "", // 添加封面OSS URI字段
  ...rowInfo.value,
});

const drawerVisible = ref(true);
const drawerProps = ref<DrawerProps>({
  isView: type.value === "check",
});

// 上传相关
const uploadRef = ref<UploadInstance>();
const submitLoading = ref(false);

// 上传进度相关
const isUploading = ref(false);
const ossUploadProgress = ref(0);
const analysisProgress = ref(0);
const analysisStatus = ref<"success" | "exception" | "warning" | "">("");
const analysisErrorMessage = ref(""); // 存储分析错误信息
const coverUrl = ref("");
const uploadedFileUrl = ref(""); // 存储上传后的文件URL
const jobId = ref(""); // 存储分析任务ID
const analysisResult = ref<any>({}); // 存储分析结果
const tableLoading = ref(false); // 表格loading状态
const coverGenerating = ref(false); // 封面生成状态
const showUploadArea = ref(false); // 编辑模式下是否显示上传
const videoPreviewUrl = ref(""); // 视频预览URL

// 任务状态查询
let jobStatusTimer: number | null = null;

// 下拉选项数据
const companyList = ref<{ label: string; value: string }[]>([]);
const deptList = ref<{ label: string; value: string }[]>([]);
const postList = ref<{ label: string; value: string }[]>([]);
const keywordsList = ref<any[]>([]);

// 素材分类选项
const categoryOptions = ref([
  { label: t("course.safetyTraining"), value: "安全培训" },
  { label: t("course.skillImprovement"), value: "技能提升" },
  { label: t("course.onboardingTraining"), value: "入职培训" },
  { label: t("course.productTraining"), value: "产品培训" },
]);

const changeCompany = () => {
  queryDept();
  postList.value = [];
  operateInfo.value.department_id = "";
  operateInfo.value.position_id = "";
};

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
const importFileType = ref(".mp4,.mov");

// 文件上传变更处理
const onUploadChange: UploadProps["onChange"] = async (
  uploadFile,
  uploadFiles
) => {
  operateInfo.value.files = uploadFiles;

  // 如果没有填写素材名称，自动使用文件名（在创建时候）
  if (!operateInfo.value.title && uploadFile.name && type.value === "create") {
    const fileName = uploadFile.name.substring(
      0,
      uploadFile.name.lastIndexOf(".")
    );
    operateInfo.value.title = fileName;
  }

  // 文件选择后立即上传
  if (
    uploadFile.raw &&
    (type.value === "create" ||
      (type.value === "update" && showUploadArea.value))
  ) {
    await handleFileUpload(uploadFile.raw);
  }
};

// 文件移除处理
const onUploadRemove: UploadProps["onRemove"] = (uploadFile, uploadFiles) => {
  operateInfo.value.files = uploadFiles;
  // 清空上传相关数据
  uploadedFileUrl.value = "";
  coverUrl.value = "";
  operateInfo.value.cover_oss_uri = ""; // 清空封面OSS URI
  jobId.value = "";
  keywordsList.value = [];
  ossUploadProgress.value = 0;
  analysisProgress.value = 0;
  analysisStatus.value = ""; // 清空状态，这样错误信息也会隐藏
  analysisErrorMessage.value = ""; // 清空错误信息
  isUploading.value = false;
  tableLoading.value = false; // 重置表格loading状态

  if (jobStatusTimer) {
    clearTimeout(jobStatusTimer);
    jobStatusTimer = null;
  }
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
  if (fileSize > 2048) {
    ElMessage.error(t("course.maxSize"));
    return false;
  }
  return true;
};

// 标签相关
const inputValue = ref("");
const dynamicTags = ref<string[]>([]);
const inputVisible = ref(false);
const InputRef = ref<InputInstance>();

const handleClose = (tag: string) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1);
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value!.input!.focus();
  });
};

const handleInputConfirm = () => {
  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = "";
};

// 关键词管理
const addKeyword = () => {
  keywordsList.value.push({
    keyword: "",
    start: "00:00",
    end: "00:00",
    editing: true,
  });
};

const editKeyword = (row: any) => {
  row.editing = true;
};

const saveKeyword = (row: any, index: number) => {
  if (!row.keyword.trim()) {
    ElMessage.warning(t("course.keywordRequired"));
    return;
  }

  // 验证开始时间格式
  if (row.start && !validateTimeFormat(row.start)) {
    ElMessage.warning(t("course.startTimeFormatError"));
    return;
  }

  // 验证结束时间格式
  if (row.end && !validateTimeFormat(row.end)) {
    ElMessage.warning(t("course.endTimeFormatError"));
    return;
  }

  // 验证时间逻辑（结束时间应大于开始时间）
  if (row.start && row.end) {
    const startSeconds = mmssToSeconds(row.start);
    const endSeconds = mmssToSeconds(row.end);
    if (endSeconds <= startSeconds) {
      ElMessage.warning(t("course.endTimeGreaterThanStart"));
      return;
    }
  }

  row.editing = false;
};

const removeKeyword = (index: number) => {
  keywordsList.value.splice(index, 1);
};

// 清除分析错误状态
const clearAnalysisError = () => {
  analysisStatus.value = "";
  analysisErrorMessage.value = "";
};

// 从视频URL生成封面图并上传到OSS
const generateVideoCover = (videoUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    video.crossOrigin = "anonymous"; // 处理跨域问题
    video.currentTime = 1; // 截取第1秒的画面

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };

    video.onseeked = async () => {
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 将canvas转换为Blob
        canvas.toBlob(
          async (blob) => {
            if (blob) {
              try {
                // 创建File对象
                const coverFile = new File([blob], `cover_${Date.now()}.jpg`, {
                  type: "image/jpeg",
                });

                const formData = new FormData();
                formData.append("file", coverFile);

                const ossRes = await uploadOss(formData);

                if (ossRes.data.code === 0) {
                  // 获取上传后的OSS URL用于预览
                  const signRes = await getOssSign({
                    oss_uri: ossRes.data.data,
                  });
                  if (signRes.data.code === 0) {
                    resolve(signRes.data.data);
                    // 同时存储OSS URI用于提交
                    operateInfo.value.cover_oss_uri = ossRes.data.data;
                  } else {
                    reject(new Error("获取封面预览URL失败"));
                  }
                } else {
                  reject(new Error("封面上传失败"));
                }
              } catch (error: any) {
                reject(new Error("封面上传过程中出错: " + error.message));
              }
            } else {
              reject(new Error("无法生成封面图片"));
            }
          },
          "image/jpeg",
          0.8
        );
      } else {
        reject(new Error("无法获取canvas上下文"));
      }
    };

    video.onerror = () => {
      reject(new Error("视频加载失败"));
    };

    video.src = videoUrl;
    video.load();
  });
};

const validateTimeInput = (value: string, row: any, field: string) => {
  // 只允许数字和冒号
  const cleanValue = value.replace(/[^\d:]/g, "");

  if (cleanValue.length === 2 && !cleanValue.includes(":")) {
    row[field] = cleanValue + ":";
  } else if (cleanValue.length <= 5) {
    row[field] = cleanValue;
  }

  // if (cleanValue.length === 5) {
  //   if (!validateTimeFormat(cleanValue)) {
  //   }
  // }
};

// 视频加载完成事件
const onVideoLoaded = (event: Event) => {
  const video = event.target as HTMLVideoElement;
  console.log("视频时长:", video.duration);
};

const getVideoPreviewUrl = async (ossUri: string) => {
  try {
    const res = await getOssSign({ oss_uri: ossUri });
    if (res.data.code === 0) {
      videoPreviewUrl.value = res.data.data;
    }
  } catch (error) {
    console.error("获取视频预览URL失败:", error);
  }
};

// 处理重新上传点击事件
const handleReuploadClick = () => {
  // 如果已有章节数据
  if (keywordsList.value.length > 0) {
    ElMessageBox.confirm(
      t("course.reuploadConfirmMessage"),
      t("course.reuploadConfirmTitle"),
      {
        type: "warning",
        confirmButtonText: t("common.confirm"),
        cancelButtonText: t("common.cancel"),
      }
    )
      .then(() => {
        keywordsList.value = [];
        showUploadArea.value = true;
      })
      .catch(() => {
        // 取消
      });
  } else {
    showUploadArea.value = true;
  }
};

// 处理文件上传
const handleFileUpload = async (file: File) => {
  isUploading.value = true;
  tableLoading.value = true; // 开始时显示表格loading
  ossUploadProgress.value = 0;
  analysisProgress.value = 0;
  analysisStatus.value = "";
  analysisErrorMessage.value = ""; // 清空之前的错误信息

  try {
    // 1. OSS上传
    const ossFormData = new FormData();
    ossFormData.append("file", file);

    const ossRes = await uploadOss(ossFormData, (progressEvent) => {
      ossUploadProgress.value = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
    });

    if (ossRes.data.code !== 0) {
      throw new Error(ossRes.data.message || t("course.ossUploadFailed"));
    }

    // 存储上传后的文件URL
    if (ossRes.data.code == 0 && ossRes.data.data) {
      uploadedFileUrl.value = ossRes.data.data;
      // 解析oss文件地址
      getOssSign({ oss_uri: ossRes.data.data }).then(async (oss) => {
        console.log("oss", oss);

        if (oss.data.code == 0) {
          const canViewurl = oss.data.data;

          // 自动生成视频封面并上传到OSS
          coverGenerating.value = true;
          try {
            const coverPreviewUrl = await generateVideoCover(canViewurl);
            coverUrl.value = coverPreviewUrl;
            console.log("封面OSS URI:", operateInfo.value.cover_oss_uri);
          } catch (error: any) {
            console.error("生成视频封面失败:", error);
            ElMessage.warning("视频封面生成失败: " + error.message);
          } finally {
            coverGenerating.value = false;
          }
        }
      });
    }

    // 2. 创建视频分析任务
    const asrFormData = new FormData();
    asrFormData.append("file", file);

    const asrRes = await createAsrJobs(asrFormData);

    if (asrRes.data.code == 200 && asrRes.data.data.job_id) {
      jobId.value = asrRes.data.data.job_id;
      // 开始轮询任务状态
      analysisProgress.value = 1;
      pollJobStatus(asrRes.data.data.job_id);
    } else {
      throw new Error(t("course.createAnalysisTaskFailed"));
    }

    ElMessage.success(
      type.value === "create"
        ? t("course.uploadSuccessAnalyzing")
        : t("course.reuploadSuccessAnalyzing")
    );
  } catch (error: any) {
    console.error("文件上传失败:", error);
    ElMessage.error(error.message || t("course.uploadFailed"));
    isUploading.value = false;
    ossUploadProgress.value = 0;
    analysisProgress.value = 0;
  }
};

// 任务状态查询
const pollJobStatus = async (jobId: string) => {
  try {
    const res = await getJobStatus(jobId);
    const status = res.data.data.status;

    switch (status) {
      case "queued":
        analysisProgress.value = 1;
        analysisStatus.value = "";
        break;
      case "running":
        analysisProgress.value = res.data.data.progress * 100;
        analysisStatus.value = "";
        break;
      case "succeeded":
        analysisProgress.value = 100;
        analysisStatus.value = "success";
        // 获取分析结果
        await getAnalysisResult(jobId);
        if (jobStatusTimer) {
          clearTimeout(jobStatusTimer);
          jobStatusTimer = null;
        }
        isUploading.value = false;
        tableLoading.value = false;
        ElMessage.success(
          type.value === "create"
            ? t("course.analysisCompleted")
            : t("course.reanalysisCompleted")
        );
        return;
      case "failed":
        analysisProgress.value = 100;
        analysisStatus.value = "exception";
        analysisErrorMessage.value =
          res.data.data.error_message || t("course.analysisFailed");
        if (jobStatusTimer) {
          clearTimeout(jobStatusTimer);
          jobStatusTimer = null;
        }
        isUploading.value = false;
        tableLoading.value = false;
        ElMessage.error(analysisErrorMessage.value);
        return;
    }

    // 继续轮询
    jobStatusTimer = setTimeout(() => pollJobStatus(jobId), 10000);
  } catch (error) {
    console.error("查询任务状态失败:", error);
    if (jobStatusTimer) {
      clearTimeout(jobStatusTimer);
      jobStatusTimer = null;
    }
    analysisProgress.value = 100;
    analysisStatus.value = "exception";
    isUploading.value = false;
    tableLoading.value = false;
    ElMessage.error(t("course.queryStatusFailed"));
  }
};

// 获取分析结果
const getAnalysisResult = async (jobId: string) => {
  try {
    const res = await getJobResult(jobId);
    if (res.data && res.data.code === 200 && res.data.data) {
      analysisResult.value = res.data.data;

      // 处理关键词列表
      if (res.data.data.keywords && Array.isArray(res.data.data.keywords)) {
        const newKeywords = res.data.data.keywords.map((item: any) => ({
          keyword: item.keyword || "",
          desc: item.desc || "",
          start: secondsToMMSS(item.time?.start || 0),
          end: secondsToMMSS(item.time?.end || 0),
          editing: false,
        }));

        keywordsList.value = newKeywords;
      }
    }
  } catch (error) {
    console.error("获取分析结果失败:", error);
  }
};

// 获取课程详情
const getDetail = () => {
  if (!rowInfo.value.course_id) return;
  getCourseInfo(rowInfo.value.course_id).then((res) => {
    // console.log("课程详情", res);
    if (res.data.code == 0) {
      operateInfo.value = {
        ...operateInfo.value,
        ...res.data.data,
      };
      dynamicTags.value = res.data.data?.tags || [];

      // 章节
      const keywords = res.data.data?.keywordslist?.[0]?.keywords;
      if (keywords && Array.isArray(keywords)) {
        keywordsList.value = keywords.map((item: any) => ({
          keyword: item.keyword || "",
          desc: item.desc || "",
          start: secondsToMMSS(item.time?.start || 0),
          end: secondsToMMSS(item.time?.end || 0),
          editing: false,
        }));
      }

      if (res.data.data?.videos && res.data.data.videos.length > 0) {
        const video = res.data.data.videos[0];
        if (video.video_url) {
          getVideoPreviewUrl(video.video_url);
        }
      }
    }
  });
};

// 提交
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return;

    // 检查是否有上传的文件
    if (type.value === "create" && !uploadedFileUrl.value) {
      ElMessage.error(t("course.pleaseUploadVideo"));
      return;
    }

    submitLoading.value = true;

    try {
      if (type.value === "create") {
        const courseData = {
          title: operateInfo.value.title,
          description: operateInfo.value.description,
          category: operateInfo.value.category,
          company_id: operateInfo.value.company_id,
          department_id: operateInfo.value.department_id,
          position_id: operateInfo.value.position_id,
          tags: dynamicTags.value,
          videos: [
            {
              title: operateInfo.value.title,
              video_url: uploadedFileUrl.value,
              // duration: 600,
              // order_index: 1
            },
          ],
          cover_url: operateInfo.value.cover_oss_uri || "", // 使用上传的封面OSS URI
          keywordslist: [
            {
              speaker: analysisResult.value.speaker,
              doc_id: analysisResult.value.doc_id,
              duration_s: analysisResult.value.duration_s,
              title: operateInfo.value.title,
              keywords: keywordsList.value
                .filter((item) => item.keyword.trim())
                .map((item) => {
                  return {
                    keyword: item.keyword,
                    desc: item.desc || "",
                    time: {
                      start: mmssToSeconds(item.start),
                      end: mmssToSeconds(item.end),
                    },
                  };
                }),
            },
          ],
          // job_id: jobId.value,
        };

        console.log("courseData", courseData);
        const res = await createCourse(courseData);
        if (res.data.code === 0) {
          ElMessage.success(t("course.addSuccess"));
          emits("close");
          emits("refresh");
        } else {
          ElMessage.error(res.data.message || t("common.operateError"));
        }
      } else if (type.value === "update") {
        // 编辑逻辑
        const editData = {
          ...operateInfo.value,
          title: operateInfo.value.title,
          description: operateInfo.value.description,
          category: operateInfo.value.category,
          company_id: operateInfo.value.company_id,
          department_id: operateInfo.value.department_id,
          position_id: operateInfo.value.position_id,
          tags: dynamicTags.value,
          cover_url:
            operateInfo.value.cover_oss_uri ||
            operateInfo.value.cover_url ||
            "",
          keywordslist: [
            {
              speaker: analysisResult.value.speaker,
              doc_id: analysisResult.value.doc_id,
              duration_s: analysisResult.value.duration_s,
              title: operateInfo.value.title,
              keywords: keywordsList.value
                .filter((item) => item.keyword.trim())
                .map((item) => {
                  return {
                    keyword: item.keyword,
                    desc: item.desc || "",
                    time: {
                      start: mmssToSeconds(item.start),
                      end: mmssToSeconds(item.end),
                    },
                  };
                }),
            },
          ],
        };
        if (uploadedFileUrl.value) {
          editData.videos = [
            {
              title: operateInfo.value.title,
              video_url: uploadedFileUrl.value,
              // duration: 600,
              // order_index: 1
            },
          ];
        } else {
          editData.videos = operateInfo.value.videos.map((i) => {
            return {
              ...i,
              title: i.video_title,
            };
          });
        }
        const res = await updateCourse(editData);

        if (res.data.code === 0) {
          ElMessage.success(t("common.editSuccess"));
          emits("close");
          emits("refresh");
        } else {
          ElMessage.error(res.data.message || t("common.operateError"));
        }
      }
    } catch (error: any) {
      console.error("提交失败:", error);
      ElMessage.error(error.message || t("common.operateError"));
    } finally {
      submitLoading.value = false;
    }
  });
};

// 组件销毁时清理定时器
onMounted(() => {
  queryCompany();
  queryDept();
  queryPost();
  getDetail();

  // 组件卸载时清理定时器
  return () => {
    if (jobStatusTimer) {
      clearInterval(jobStatusTimer);
      jobStatusTimer = null;
    }
  };
});
</script>

<!-- <style>
/* 抽屉内容区域 */
:deep(.operate-body .el-drawer__body) {
  padding: 0 !important;
}
</style> -->
<style scoped lang="scss">
.upload-container {
  width: 100%;
}

.upload-demo {
  width: 100%;
}

.upload-content {
  padding: 30px 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.upload-content:hover {
  background-color: #f8f9fa;
}

.upload-icon {
  color: #409eff;
  margin-bottom: 12px;
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
  font-size: 15px;
  font-weight: 500;
  margin: 0 0 6px 0;
  color: #303133;
}

.upload-hint {
  font-size: 13px;
  margin: 0 0 3px 0;
  color: #909399;
}

.upload-size {
  font-size: 12px;
  margin: 0;
  color: #c0c4cc;
}

.upload-auto-tip {
  font-size: 12px;
  margin: 3px 0 0 0;
  color: #409eff;
  font-weight: 500;
}

// 双进度条容器
.upload-progress-container {
  margin-top: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.upload-progress {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.progress-percentage {
  font-size: 14px;
  color: #409eff;
  font-weight: 600;

  &.error-text {
    color: #f56c6c;
  }
}

// 错误消息样式
.error-message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 12px;

  .error-icon {
    margin-right: 6px;
    font-size: 14px;
    flex-shrink: 0;
  }

  span {
    flex: 1;
    margin-right: 8px;
  }

  .error-close-btn {
    padding: 0;
    min-height: auto;
    color: #f56c6c;

    &:hover {
      color: #f78989;
    }

    .el-icon {
      font-size: 12px;
    }
  }
}

// 视频封面样式
.video-cover {
  margin-top: 16px;
  text-align: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.cover-image {
  max-width: 200px;
  max-height: 120px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cover-text {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #909399;
}

.cover-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: #909399;

  .el-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }

  p {
    margin: 0;
    font-size: 12px;
  }
}

// 自定义上传区域样式
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

// 文件列表样式优化
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

// 进度条样式
:deep(.el-progress-bar__outer) {
  border-radius: 10px;
  background-color: #e4e7ed;
}

:deep(.el-progress-bar__inner) {
  border-radius: 10px;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
}

// 表单项间距优化
:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}

// 选择器样式优化
:deep(.el-select) {
  width: 100%;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
}

// 按钮样式
:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

// 抽屉标题样式
:deep(.el-drawer__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-drawer__title) {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

// 抽屉底部
:deep(.el-drawer__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  background-color: #fafafa;
}

.add-content {
  width: 100%;
  height: calc(100vh - 120px);
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  flex: 1;
  gap: 30px;
}

.left-content {
  width: 45%;
  display: flex;
  flex-direction: column;
  min-height: 100%;

  .left-top {
    background-color: #f5f5f5;
    padding: 20px;
    border: 1px solid #e5e5e5;
    margin-bottom: 15px;
    border-radius: 15px;
    flex: 1;
  }

  .left-bottom {
    background-color: #f5f5f5;
    padding: 20px;
    border: 1px dashed #e5e5e5;
    border-radius: 15px;
    flex-shrink: 0;
  }
}

.right-content {
  border-radius: 15px;
  width: 55%;
  background-color: #f5f5f5;
  padding: 20px;
  border: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  min-height: 100%;

  .keywords-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    flex-shrink: 0;
  }

  .table-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    :deep(.el-table) {
      flex: 1;
    }
  }
}

// 表格内编辑样式
:deep(.el-table .el-input) {
  --el-input-border-color: transparent;
  --el-input-focus-border-color: #409eff;
}

:deep(.el-table .el-input__wrapper) {
  background-color: transparent;
  box-shadow: none;

  &:hover,
  &.is-focus {
    background-color: #fff;
    box-shadow: 0 0 0 1px #409eff inset;
  }
}

// 操作按钮样式
:deep(.el-table .el-button) {
  margin: 0 2px;
  padding: 4px 8px;
}

// 视频
.existing-video-info {
  width: 100%;
  margin-bottom: 16px;
}

.video-info-card {
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.video-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.video-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.video-actions {
  display: flex;
  gap: 8px;
}

.video-info-details {
  margin-bottom: 16px;

  p {
    margin: 8px 0;
    font-size: 14px;
    color: #606266;
    line-height: 1.5;

    strong {
      color: #303133;
      font-weight: 500;
      margin-right: 8px;
    }
  }
}

.video-preview {
  margin-top: 16px;
  text-align: center;
}

.preview-video {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.upload-actions {
  margin-top: 16px;
  text-align: right;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
