<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('materialLibrary.selectCourse')"
    width="900px"
    top="6vh"
    :destroy-on-close="true"
    @close="handleClose"
    class="course-select-dialog"
  >
    <!-- 筛选表单 -->
    <div class="search-section">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item :label="$t('materialLibrary.courseName')">
          <el-input
            v-model="searchForm.course_name"
            :placeholder="
              $t('common.pleaseInput') + $t('materialLibrary.courseName')
            "
            clearable
            @keyup.enter="handleSearch"
            style="width: 240px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">
            {{ $t("common.search") }}
          </el-button>
          <el-button @click="handleReset" :icon="RefreshLeft">
            {{ $t("common.reset") }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 课程列表表格 -->
    <div class="table-section">
      <el-table
        :data="courseList"
        v-loading="loading"
        @row-click="handleRowClick"
        :row-class-name="getRowClassName"
        style="width: 100%"
        height="450"
        class="course-table"
      >
        <el-table-column width="55" align="center">
          <template #default="{ row }">
            <el-radio
              :model-value="selectedCourseId || ''"
              :label="row.course_id"
              @change="handleRadioChange(row)"
            >
              <span></span>
            </el-radio>
          </template>
        </el-table-column>
        <el-table-column
          type="index"
          width="60"
          :label="$t('common.index')"
          align="center"
        />
        <el-table-column
          prop="title"
          :label="$t('materialLibrary.courseName')"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div class="course-name">
              <el-icon class="course-icon"><Document /></el-icon>
              <span>{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="category"
          :label="$t('materialLibrary.category')"
          min-width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag v-if="row.category" type="info" size="small">
              {{ row.category }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="position_name"
          :label="$t('companyManagement.position')"
          min-width="120"
          align="center"
        >
          <template #default="{ row }">
            {{ row.position_name || "-" }}
          </template>
        </el-table-column>
        <el-table-column
          prop="version_code"
          :label="$t('licenseAdmin.version')"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag v-if="row.version_code" type="success" size="small">
              {{ row.version_code }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.page_size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        background
      />
    </div>

    <template #footer>
      <el-button @click="handleClose" size="large">
        {{ $t("common.cancel") }}
      </el-button>
      <el-button
        type="primary"
        @click="handleConfirm"
        :disabled="!selectedCourse"
        size="large"
      >
        {{ $t("common.confirm") }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { getCourseList } from "@/services/mobile.service";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { Search, RefreshLeft, Document } from "@element-plus/icons-vue";

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
  currentCourseId?: string | number;
}>();

const emits = defineEmits(["update:modelValue", "confirm"]);

const dialogVisible = ref(props.modelValue);
const loading = ref(false);
const courseList = ref<any[]>([]);
const selectedCourse = ref<any>(null);
const selectedCourseId = ref<string | number | null>(null);

// 搜索表单
const searchForm = reactive({
  course_name: "",
});

// 分页
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0,
});

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      // 打开对话框时重置并加载数据
      initDialog();
    }
  }
);

// 监听当前课程ID变化
watch(
  () => props.currentCourseId,
  (val) => {
    if (val) {
      selectedCourseId.value = val;
    }
  },
  { immediate: true }
);

// 监听 dialogVisible 变化
watch(dialogVisible, (val) => {
  emits("update:modelValue", val);
});

// 初始化对话框
const initDialog = () => {
  searchForm.course_name = "";
  pagination.page = 1;
  // 保持已选中的课程ID
  if (props.currentCourseId) {
    selectedCourseId.value = props.currentCourseId;
  }
  loadCourseList();
};

// 加载课程列表
const loadCourseList = async () => {
  loading.value = true;
  try {
    const params: any = {
      pageNum: pagination.page,
      pageSize: pagination.page_size,
    };

    if (searchForm.course_name) {
      params.title = searchForm.course_name;
    }

    const res = await getCourseList(params);
    console.log("kkkkkk", res);
    if (res.data.code === 0) {
      courseList.value = res.data.data.items || [];
      pagination.total = res.data.data.total || 0;

      // 如果有选中的课程ID，找到对应的课程对象
      if (selectedCourseId.value) {
        const found = courseList.value.find(
          (item) => item.course_id === selectedCourseId.value
        );
        if (found) {
          selectedCourse.value = found;
        }
      }
    } else {
      ElMessage.error(res.data.message || t("common.operateError"));
    }
  } catch (error) {
    console.error("获取课程列表失败:", error);
    ElMessage.error(t("common.operateError"));
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  loadCourseList();
};

// 重置
const handleReset = () => {
  searchForm.course_name = "";
  pagination.page = 1;
  loadCourseList();
};

// 单选框变化
const handleRadioChange = (row: any) => {
  selectedCourse.value = row;
  selectedCourseId.value = row.course_id;
};

// 表格行点击
const handleRowClick = (row: any) => {
  selectedCourse.value = row;
  selectedCourseId.value = row.course_id;
};

// 获取行类名（高亮选中行）
const getRowClassName = ({ row }: { row: any }) => {
  return row.course_id === selectedCourseId.value ? "selected-row" : "";
};

// 分页大小变化
const handleSizeChange = () => {
  pagination.page = 1;
  loadCourseList();
};

// 页码变化
const handlePageChange = () => {
  loadCourseList();
};

// 确认选择
const handleConfirm = () => {
  if (!selectedCourse.value) {
    ElMessage.warning(t("materialLibrary.pleaseSelectCourse"));
    return;
  }
  emits("confirm", selectedCourse.value);
  handleClose();
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
.course-select-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #e4e7ed;
  /* padding: 20px 24px; */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.course-select-dialog :deep(.el-dialog__title) {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}

.course-select-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #ffffff;
  font-size: 20px;
}

.course-select-dialog :deep(.el-dialog__body) {
  padding: 20px 24px;
  background-color: #f8f9fa;
}

/* 搜索区域 */
.search-section {
  background: #ffffff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.search-form {
  margin: 0;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.search-form :deep(.el-input__wrapper) {
  border-radius: 6px;
  transition: all 0.3s;
}

.search-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #667eea inset;
}

/* 表格区域 */
.table-section {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.course-table {
  border-radius: 8px;
  overflow: hidden;
}

.course-table :deep(.el-table__header) {
  background-color: #f5f7fa;
}

.course-table :deep(.el-table__header th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.course-table :deep(.el-table__row) {
  cursor: pointer;
  transition: all 0.2s;
}

.course-table :deep(.el-table__row:hover) {
  background-color: #f0f8ff !important;
}

.course-table :deep(.selected-row) {
  background-color: #ecf5ff !important;
}

.course-table :deep(.selected-row:hover) {
  background-color: #e6f3ff !important;
}

.course-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.course-icon {
  color: #667eea;
  font-size: 16px;
}

.course-table :deep(.el-radio) {
  margin: 0;
}

.course-table :deep(.el-radio__label) {
  display: none;
}

.course-table :deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: #667eea;
  border-color: #667eea;
}

.course-table :deep(.el-radio__inner:hover) {
  border-color: #667eea;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  padding: 0 16px;
}

.pagination-container
  :deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #667eea;
}

.pagination-container :deep(.el-pagination.is-background .el-pager li:hover) {
  color: #667eea;
}

:deep(.el-tag) {
  border-radius: 4px;
  font-weight: 500;
}

:deep(.el-loading-mask) {
  border-radius: 8px;
}
</style>
