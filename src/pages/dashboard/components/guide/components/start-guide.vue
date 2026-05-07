<template>
  <!-- 左侧引导内容 -->
  <div class="guide-left">
    <img :src="guideAssets.guide" :alt="$t('guide.start.imageAlt')" />

    <div class="skip-btn-content">
      <el-button type="plain" @click="skipGuide" class="skip-btn">
        {{ $t("guide.start.skip") }}
      </el-button>
    </div>
  </div>

  <!-- 右侧欢迎信息 -->
  <div class="guide-right">
    <div class="close-btn" @click="$emit('close')">
      <img
        style="width: 21px; height: 21px"
        src="@/assets/images/close.png"
        :alt="$t('common.close')"
      />
    </div>

    <div class="welcome-title">
      {{ $t("guide.start.welcome") }}
    </div>

    <div class="system-title">
      {{ $t("guide.start.systemTitle") }}
    </div>

    <div class="system-desc">
      {{ $t("guide.start.quickStart") }}
    </div>

    <el-button
      type="primary"
      size="large"
      @click="$emit('startLearning')"
      class="start-btn"
    >
      {{ $t("guide.start.startLearning") }}
    </el-button>
  </div>
</template>

<script setup>
import { setConfigs } from "@/services/user.service";
import { useGuideAssets } from "../useGuideAssets";

const emit = defineEmits(["close", "startLearning"]);

const { guideAssets } = useGuideAssets();

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

.welcome-title,
.system-title {
  width: 320px;
  font-size: 24px;
  color: #01021d;
  font-weight: 600;
  line-height: 1.3;
  height: auto;
  word-break: break-word;
}

.system-title {
  margin-top: 4px;
  margin-bottom: 16px;
}

.system-desc {
  width: 320px;
  line-height: 1.5;
  font-size: 14px;
  font-weight: 400;
  color: #4d4d60;
  word-break: break-word;

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
