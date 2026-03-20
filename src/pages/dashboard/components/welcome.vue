<template>
  <div class="welcome-container">
    <div class="welcome-content">
      <div class="welcome-text">
        <div class="title">{{ $t("dashboard.welcome.title") }}</div>
        <div class="title subtitle">{{ $t("dashboard.welcome.subtitle") }}</div>
        <el-button
          type="primary"
          class="guide-button"
          @click="$emit('showGuide')"
          :style="{ width: language === 'en' ? '140px' : '100px' }"
          >{{ $t("dashboard.welcome.guideButton") }}</el-button
        >
      </div>
      <div class="welcome-image">
        <img src="@/assets/images/guide.png" alt="引导图片" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useGlobalStore } from "@/stores/modules/global";
const globalStore = useGlobalStore();
const language = computed(() => globalStore.language);
</script>

<style scoped>
.welcome-container {
  /* background: linear-gradient(
    to right bottom,
    rgba(232, 241, 255, 1) 80%,
    rgba(255, 255, 255, 1)
  ); */
  background: rgba(232, 241, 255, 1);
  height: 136px;
  border-radius: 8px;
}

.welcome-content {
  display: flex;
  padding: 24px 8px 12px 24px;
  justify-content: flex-end;
  align-items: center;
  position: relative;
}

.welcome-text {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 2;
}

.welcome-text title {
  height: 20px;
  font-size: 18px;
  font-weight: 500;
  color: rgba(1, 2, 29, 1);
}

.welcome-text .subtitle {
  /* margin-top: 4px; */
}
.guide-button {
  width: 100px;
  margin-top: 16px;
}
.welcome-image {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 120px;
  height: 120px;
  z-index: 1;
  /* filter: blur(0.5px); */
}

.welcome-image img {
  width: 100%;
  height: 100%;
}
</style>
