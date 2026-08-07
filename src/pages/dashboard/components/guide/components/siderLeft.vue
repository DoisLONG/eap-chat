<template>
  <div class="guide-left">
    <div class="welcome-section">
      <div class="welcome-title">{{ $t("guide.start.welcome") }}</div>
      <div class="system-title">{{ $t("guide.start.systemTitle") }}</div>
      <div class="system-desc">{{ $t("guide.start.quickStart") }}</div>
    </div>

    <div class="steps-section">
      <div
        v-for="(item, index) in stepList"
        :key="item.textKey"
        class="step-item"
        :class="{ active: index === step - 1 }"
      >
        <div class="step-icon">
          <img :src="item.icon" :alt="$t(item.textKey)" />
        </div>
        <div class="step-text">{{ $t(item.textKey) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import step1Icon from "@/assets/images/guide/step1.png";
import step2Icon from "@/assets/images/guide/step2.png";
import step3Icon from "@/assets/images/guide/step3.png";
import step4Icon from "@/assets/images/guide/step4.png";

defineProps({
  step: {
    type: Number,
    default: 1,
  },
});

const stepList = [
  {
    icon: step1Icon,
    textKey: "guide.sidebar.uploadLearningMaterials",
  },
  {
    icon: step2Icon,
    textKey: "guide.sidebar.generatePracticeBank",
  },
  {
    icon: step3Icon,
    textKey: "guide.sidebar.reviewAndGenerateBank",
  },
  {
    icon: step4Icon,
    textKey: "guide.sidebar.publishTrainingTask",
  },
];
</script>
<style scoped lang="scss">
.guide-left {
  height: 540px;
  width: 286px;
  padding: 80px 0 0 32px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  box-sizing: border-box;
}

.welcome-section {
  width: 230px;

  .welcome-title,
  .system-title {
    font-size: 24px;
    font-weight: 600;
    color: #01021d;
    line-height: 1.25;
    height: auto;
    word-break: break-word;
  }

  .system-title {
    margin-top: 4px;
  }

  .system-desc {
    margin-top: 10px;
    font-size: 14px;
    color: #4d4d60;
    line-height: 1.5;
    height: auto;
    word-break: break-word;
  }
}

.steps-section {
  margin-top: 96px;
  display: flex;
  flex-direction: column;

  .step-item {
    display: flex;
    align-items: center;
    margin-top: 18px;
    transition: all 0.3s ease-in-out;

    .step-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #d9d9d9;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 14px;

      img {
        width: 20px;
        height: 20px;
      }
    }
    &.active {
      .step-text {
        font-weight: 600;
        color: #1677ff;
      }
      .step-icon {
        background: linear-gradient(to right bottom, #1677ff, #76afff);
      }
    }

    .step-text {
      font-size: 14px;
      color: #4d4d60;
    }
  }
}
</style>
