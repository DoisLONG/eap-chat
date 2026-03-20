<template>
   <!-- 左侧引导内容 -->
      <div class="guide-left">
        <img :src="guide" alt="引导图片" />
        <div class="skip-btn-content">
          <el-button type="plain" @click="skipGuide" class="skip-btn"
            >跳过引导</el-button
          >
        </div>
      </div>

      <!-- 右侧欢迎信息 -->
      <div class="guide-right">
        <div class="close-btn" @click="$emit('close')">
            <img style="width: 21px; height: 21px;" src="@/assets/images/close.png"
        </div>
        <div class="welcome-title">欢迎使用👏👏👏</div>
        <div class="system-title">BlueDot智能陪练系统</div>
        <div class="system-desc">
          这里是您企业规程管理工作台，支持<span>权限设定、文档导入、筛选、编辑及复核试题</span>关联等等全生命周期管理。
接下来我们快速熟悉核心功能吧～
        </div>
        <div class="system-desc">接下来我们快速熟悉核心功能吧～</div>
        <el-button
          type="primary"
          size="large"
          @click="$emit('startLearning')"
          class="start-btn"
        >
          开始学习
        </el-button>
      </div>
    
</template>
<script setup>
import guide from "@/assets/images/guide/guide.png";
import { setConfigs } from "@/services/user.service";

const emit = defineEmits(["close", "startLearning"]);
const skipGuide = () => {
  setConfigs({
    payload: {
      dashboard_welcome_guide_pending: 1,
    },
  });
  emit("close");
};
</script>
<style scoped lang="scss">
.skip-btn {
  background-color: #fafafc;
  border: none;
  color: #989fb0;
  font-size: 12px;
  height: 32px;
  line-height: 32px;
  border-radius: 8px;
}
.skip-btn:hover {
  background-color: #eceff4;
}
.close-btn {
  cursor: pointer;
  height: 30px;
  width: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover {
  background-color: #f5f7fa;
}

.guide-left {
  position: relative;
  width: 466px;
  height: 466px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .skip-btn-content {
    position: absolute;
    top: 24px;
    left: 24px;
  }
}

.guide-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  padding-left: 40px;
  .close-btn {
    position: absolute;
    top: 24px;
    right: 32px;
  }
}

.welcome-title, .system-title {
  height: 38px;
  line-height: 38px;
  font-size: 24px;
  color: #01021D;
  font-weight: 600;
}
.system-title {
  margin-bottom: 24px;
}

.system-desc {
  width: 254px;
  line-height: 22px;
  font-size: 14px;
  font-weight: 400;
  color: #4D4D60;
  span {
    font-weight: 600;
  }
}

.start-btn {
  margin-top: 30px;
  width: 121px;
  border-radius: 8px;
  height: 48px;
  line-height: 48px;
}
</style>