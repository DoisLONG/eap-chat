<template>
  <el-drawer
    v-model="drawerVisible"
    :destroy-on-close="true"
    size="100%"
    :title="fileTitle"
    :show-close="true"
    @close="emits('close')"
    class="office-preview-drawer"
  >
    <div class="preview-container">
      <div class="preview-content">
        <OfficeViewer
          ref="officeViewerRef"
          :type="fileType"
          :src="fileSrc"
          height="100%"
          @rendered="onDocRendered"
          @error="onDocError"
        />
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts" name="OfficePreviewDrawer">
import { ref, computed, toRefs } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import OfficeViewer from "@/components/OfficeViewer/index.vue";

const { t } = useI18n();

const emits = defineEmits(["close", "refresh"]);

const props = defineProps<{
  fileTitle: string;
  fileType: string;
  fileSrc: string;
}>();

const { fileType, fileSrc } = toRefs(props);
const drawerVisible = ref(true);

const onDocRendered = () => {
  console.log("文档预览完成");
};

const onDocError = (err: any) => {
  console.error("文档预览失败：", err);
  ElMessage.error(t("course.previewError"));
};
</script>

<style scoped lang="scss">
.office-preview-drawer {
  &.el-drawer {
    :deep(.el-drawer__body) {
      padding: 0 !important;
      height: calc(100vh - 60px) !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
    }

    :deep(.el-drawer__header) {
      margin-bottom: 0 !important;
      color: white !important;

      .el-drawer__title {
        font-size: 16px !important;
        font-weight: 500 !important;
        color: white !important;
      }
    }
  }
}

:global(.office-preview-drawer .el-drawer__body) {
  padding: 0 !important;
  height: calc(100vh - 60px) !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

.preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.preview-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;

  :deep(.office-viewer) {
    width: 100%;
    height: 100%;
  }

  .preview-wrapper {
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 1px solid #e2e8f0;
    background: white;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      z-index: 1;
    }

    :deep(.office-viewer) {
      border-radius: 0 0 12px 12px;
      border: none;
      box-shadow: none;

      .loading-overlay {
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(8px);

        .loading-spinner {
          i {
            color: #667eea;
            font-size: 40px;
            filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3));
          }

          p {
            color: #64748b;
            font-size: 15px;
            margin-top: 16px;
            font-weight: 500;
          }
        }
      }
    }
  }
}

// 平滑过渡动画
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
