<template>
  <div
    class="office-viewer"
    :class="{
      dragging: isDragging,
      zoomable: zoomLevel > 1,
      'mobile-office-viewer': isMobile,
    }"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
    ref="viewerContainer"
  >
    <!-- PDF预览 -->
    <VueOfficePdf
      v-if="trimmedType === 'pdf'"
      ref="pdfViewer"
      :src="encodedSrc"
      :style="{
        height: height,
        width: width,
        transform: `scale(${zoomLevel}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
        transformOrigin: 'center center',
      }"
      @rendered="onRendered"
      @error="onError"
    />

    <!-- Word文档预览 -->
    <VueOfficeDocx
      v-else-if="trimmedType === 'docx' || trimmedType === 'doc'"
      ref="docxViewer"
      :src="encodedSrc"
      :style="{
        height: height,
        width: width,
        transform: `scale(${zoomLevel}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
        transformOrigin: 'center center',
      }"
      @rendered="onRendered"
      @error="onError"
    />

    <!-- Excel文档预览 -->
    <VueOfficeExcel
      v-else-if="trimmedType === 'xlsx' || trimmedType === 'xls'"
      ref="excelViewer"
      :src="encodedSrc"
      :style="{
        height: height,
        width: width,
        transform: `scale(${zoomLevel}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
        transformOrigin: 'center center',
      }"
      @rendered="onRendered"
      @error="onError"
    />

    <!-- PPT预览 -->
    <VueOfficePptx
      v-else-if="trimmedType === 'ppt' || trimmedType === 'pptx'"
      ref="pptxViewer"
      :src="encodedSrc"
      :options="pptxOptions"
      :style="{
        height: height,
        width: width,
        transform: `scale(${zoomLevel}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
        transformOrigin: 'center center',
      }"
      @rendered="onPptxRendered"
      @error="onPptxError"
    />

    <!-- 不支持的文件类型 -->
    <div v-else class="unsupported-type">
      <div class="error-message">
        <i class="el-icon-warning"></i>
        <p>{{ t("officeViewer.unsupportedFileType") }}: {{ type }}</p>
        <p>{{ t("officeViewer.supportedFormats") }}</p>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="el-icon-loading"></i>
        <p>{{ t("officeViewer.documentLoading") }}</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="error-overlay">
      <div class="error-message">
        <i class="el-icon-warning"></i>
        <p>{{ t("officeViewer.documentLoadFailed") }}</p>
        <p>{{ errorMessage }}</p>
        <button @click="retry" class="retry-btn">
          {{ t("officeViewer.retry") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, readonly, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import VueOfficePdf from "@vue-office/pdf";
import VueOfficeDocx from "@vue-office/docx/lib/v3/index.js";
import "@vue-office/docx/lib/v3/index.css";
import VueOfficeExcel from "@vue-office/excel/lib/v3/index.js";
import "@vue-office/excel/lib/v3/index.css";
import VueOfficePptx from "@vue-office/pptx";

const { t } = useI18n();

const props = defineProps({
  // 文件类型: pdf, docx, doc, xlsx, xls, ppt, pptx
  type: {
    type: String,
    required: true,
    validator: (value) =>
      ["pdf", "docx", "doc", "xlsx", "xls", "ppt", "pptx"].includes(
        value.trim().toLowerCase()
      ),
  },
  src: {
    type: String,
    required: true,
  },
  height: {
    type: String,
    default: "600px",
  },
  width: {
    type: String,
    default: "100%",
  },
});

const emit = defineEmits(["rendered", "error", "loading"]);
const loading = ref(false);
const error = ref(false);
const errorMessage = ref("");
const zoomLevel = ref(1);
const showZoomTip = ref(false);
const viewerContainer = ref(null);
const pdfViewer = ref(null);
const docxViewer = ref(null);
const excelViewer = ref(null);
const pptxViewer = ref(null);
let zoomTipTimer = null;

// 拖拽相关状态
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const dragOffset = ref({ x: 0, y: 0 });
const lastDragOffset = ref({ x: 0, y: 0 });

const isMobile = window.innerWidth < 500;

const supportedTypes = ["pdf", "docx", "doc", "xlsx", "xls", "ppt", "pptx"];

// PPTX配置选项
const pptxOptions = ref({
  // 启用图片渲染
  enableImages: true,
  // 设置渲染模式
  renderMode: "canvas",
  // 缩放比例
  scale: 1,
  // 启用调试模式
  debug: true,
});

// 处理去除空格的文件类型
const trimmedType = computed(() => {
  return props.type.trim().toLowerCase();
});

// 检查文件类型是否支持
const isSupported = computed(() => {
  return supportedTypes.includes(trimmedType.value);
});

// 对src进行URL编码
const encodedSrc = computed(() => {
  return props.src;
});

// 文档渲染完成回调
const onRendered = () => {
  loading.value = false;
  error.value = false;
  emit("rendered");
};

const onError = (err) => {
  loading.value = false;
  error.value = true;
  errorMessage.value = err.message || "文档加载失败";
  emit("error", err);
};

const onPptxRendered = () => {
  console.log("PPTX文档渲染完成");
  console.log("当前src:", encodedSrc.value);
  console.log("文档类型:", trimmedType.value);
  loading.value = false;
  error.value = false;
  emit("rendered");
};

const onPptxError = (err) => {
  console.error("PPTX文档渲染失败:", err);
  console.log("失败时的src:", encodedSrc.value);
  console.log("失败时的文档类型:", trimmedType.value);
  loading.value = false;
  error.value = true;
  errorMessage.value = err.message || "PPTX文档加载失败";
  emit("error", err);
};

const retry = () => {
  error.value = false;
  errorMessage.value = "";
  loading.value = true;
};

const handleWheel = (event) => {
  // 只有按住Ctrl键时才进行缩放
  if (!event.ctrlKey) {
    return;
  }

  event.preventDefault();

  const delta = event.deltaY > 0 ? -0.1 : 0.1;
  const newZoomLevel = Math.max(0.5, Math.min(3, zoomLevel.value + delta));

  zoomLevel.value = newZoomLevel;

  // 显示缩放提示
  showZoomTip.value = true;

  // 清除之前的定时器
  if (zoomTipTimer) {
    clearTimeout(zoomTipTimer);
  }

  // 2秒后隐藏提示
  zoomTipTimer = setTimeout(() => {
    showZoomTip.value = false;
  }, 2000);
};

// 双击重置缩放
const handleDoubleClick = () => {
  zoomLevel.value = 1;
  dragOffset.value = { x: 0, y: 0 };
  lastDragOffset.value = { x: 0, y: 0 };
  showZoomTip.value = true;

  if (zoomTipTimer) {
    clearTimeout(zoomTipTimer);
  }

  zoomTipTimer = setTimeout(() => {
    showZoomTip.value = false;
  }, 1000);
};

// 重置缩放级别
const resetZoom = () => {
  zoomLevel.value = 1;
  // 重置拖拽偏移
  dragOffset.value = { x: 0, y: 0 };
  lastDragOffset.value = { x: 0, y: 0 };
};

// 重置vue-office组件内部滚动位置
const resetOfficeViewerScroll = () => {
  // 使用nextTick确保组件已经渲染
  nextTick(() => {
    // 重置PDF组件滚动位置
    if (pdfViewer.value && pdfViewer.value.$el) {
      const pdfContainer =
        pdfViewer.value.$el.querySelector(".pdf-viewer") || pdfViewer.value.$el;
      if (pdfContainer) {
        pdfContainer.scrollTop = 0;
      }
    }

    // 重置Word组件滚动位置
    if (docxViewer.value && docxViewer.value.$el) {
      const docxContainer =
        docxViewer.value.$el.querySelector(".docx-viewer") ||
        docxViewer.value.$el;
      if (docxContainer) {
        docxContainer.scrollTop = 0;
      }
    }

    // 重置Excel组件滚动位置
    if (excelViewer.value && excelViewer.value.$el) {
      const excelContainer =
        excelViewer.value.$el.querySelector(".excel-viewer") ||
        excelViewer.value.$el;
      if (excelContainer) {
        excelContainer.scrollTop = 0;
      }
    }

    // 重置PPT组件滚动位置
    if (pptxViewer.value && pptxViewer.value.$el) {
      const pptxContainer =
        pptxViewer.value.$el.querySelector(".pptx-viewer") ||
        pptxViewer.value.$el;
      if (pptxContainer) {
        pptxContainer.scrollTop = 0;
      }
    }
  });
};

// 处理鼠标按下事件（开始拖拽）
const handleMouseDown = (event) => {
  if (zoomLevel.value > 1) {
    isDragging.value = true;
    dragStart.value = {
      x: event.clientX - dragOffset.value.x,
      y: event.clientY - dragOffset.value.y,
    };
    event.preventDefault();
  }
};

// 处理鼠标移动事件（拖拽中）
const handleMouseMove = (event) => {
  if (isDragging.value && zoomLevel.value > 1) {
    dragOffset.value = {
      x: event.clientX - dragStart.value.x,
      y: event.clientY - dragStart.value.y,
    };
    event.preventDefault();
  }
};

// 处理鼠标释放事件（结束拖拽）
const handleMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false;
    lastDragOffset.value = { ...dragOffset.value };
  }
};

// 处理鼠标离开事件
const handleMouseLeave = () => {
  if (isDragging.value) {
    isDragging.value = false;
    lastDragOffset.value = { ...dragOffset.value };
  }
};

// 监听src变化，重新加载文档
watch(
  () => props.src,
  (newSrc) => {
    if (newSrc) {
      loading.value = true;
      error.value = false;
      errorMessage.value = "";
      // 重置滚动位置到顶部
      if (viewerContainer.value) {
        viewerContainer.value.scrollTop = 0;
      }
      // 重置vue-office组件内部滚动位置
      resetOfficeViewerScroll();
    }
  },
  { immediate: true }
);

// 监听type变化
watch(
  () => props.type,
  (newType) => {
    if (newType && props.src) {
      loading.value = true;
      error.value = false;
      errorMessage.value = "";
    }
  }
);

onMounted(() => {
  if (props.src && isSupported.value) {
    loading.value = true;
  }

  if (viewerContainer.value) {
    viewerContainer.value.addEventListener("dblclick", handleDoubleClick);
  }
});

defineExpose({
  resetZoom,
  resetOfficeViewerScroll,
  zoomLevel: readonly(zoomLevel),
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleMouseLeave,
  onPptxRendered,
  onPptxError,
  pptxOptions,
});
</script>

<style lang="scss" scoped>
.office-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 4px;
  overflow: auto;
  box-sizing: border-box;
  cursor: grab;
  user-select: none;
  display: flex;
  flex-direction: column;
  &:active {
    cursor: grabbing;
  }

  &.dragging {
    cursor: grabbing;
  }

  &.zoomable {
    cursor: grab;

    &:hover {
      cursor: grab;
    }
  }

  &:not(.zoomable) {
    cursor: default;
  }

  // 确保所有子元素都使用border-box
  * {
    box-sizing: border-box;
  }

  // 缩放提示样式
  .zoom-tip {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1001;
    pointer-events: none;
    transition: opacity 0.3s ease;

    span {
      display: block;
      font-weight: 500;
      margin-bottom: 2px;
    }

    small {
      opacity: 0.8;
      font-size: 10px;
    }
  }

  // 加载状态样式
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    .loading-spinner {
      text-align: center;
      color: #409eff;

      i {
        font-size: 32px;
        margin-bottom: 12px;
        display: block;
        animation: rotate 2s linear infinite;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #666;
      }
    }
  }

  // 错误状态样式
  .error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    .error-message {
      text-align: center;
      color: #f56c6c;

      i {
        font-size: 48px;
        margin-bottom: 16px;
        display: block;
      }

      p {
        margin: 8px 0;
        font-size: 14px;
        color: #666;

        &:first-of-type {
          font-size: 16px;
          font-weight: 500;
          color: #f56c6c;
        }
      }

      .retry-btn {
        margin-top: 16px;
        padding: 8px 16px;
        background: #409eff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.3s;

        &:hover {
          background: #66b1ff;
        }
      }
    }
  }

  // 不支持的文件类型样式
  .unsupported-type {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .error-message {
      text-align: center;
      color: #e6a23c;

      i {
        font-size: 48px;
        margin-bottom: 16px;
        display: block;
      }

      p {
        margin: 8px 0;
        font-size: 14px;
        color: #666;

        &:first-of-type {
          font-size: 16px;
          font-weight: 500;
          color: #e6a23c;
        }
      }
    }
  }
}

// 旋转动画
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 修改vue-office组件内部的灰色背景
:deep(.vue-office-pdf .pdf-viewer) {
  background: white !important;
}

:deep(.vue-office-pdf canvas) {
  background: white !important;
}

:deep(.vue-office-docx .docx-viewer) {
  background: white !important;
}

// :deep(.vue-office-docx .docx-wrapper > section.docx) {
//   // border: 1px solid #eeeeee;
//   box-shadow: none !important;
// }
.mobile-office-viewer :deep(.vue-office-docx .docx-wrapper > section.docx) {
  box-shadow: none !important;
}

:deep(.vue-office-excel .excel-viewer) {
  background: white !important;
}

:deep(.vue-office-docx) {
  width: 100% !important;
  height: 100% !important;
  background: white !important;
}
:deep(.docx-wrapper) {
  background: white !important;
}

// PPTX 组件样式优化
:deep(.pptx-preview-wrapper) {
  height: 100% !important;
}
:deep(.vue-office-pptx) {
  width: 100% !important;
  height: 100% !important;
  background: white !important;
  display: flex !important;
  flex-direction: column !important;
}

:deep(.pptx-wrapper) {
  width: 100% !important;
  height: 100% !important;
  background: white !important;
  display: flex !important;
  flex-direction: column !important;
}

:deep(.pptx-viewer) {
  width: 100% !important;
  height: 100% !important;
  background: white !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: auto !important;
}

// PPTX 幻灯片容器
:deep(.pptx-slide-container) {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

// PPTX 幻灯片
:deep(.pptx-slide) {
  max-width: 100% !important;
  max-height: 100% !important;
  width: auto !important;
  height: auto !important;
  margin: 0 auto !important;
}

// PPTX Canvas 元素
:deep(.pptx-canvas) {
  max-width: 100% !important;
  max-height: 100% !important;
  width: 100% !important;
  height: auto !important;
  object-fit: contain !important;
}
</style>
