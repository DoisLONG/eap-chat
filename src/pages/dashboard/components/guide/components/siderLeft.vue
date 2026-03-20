<template>
  <div class="guide-left">
    <div class="welcome-section">
      <div class="welcome-title">欢迎使用👏</div>
      <div class="system-title">BEAT智能陪练系统</div>
      <div class="system-desc">我们一起来快速熟悉核心功能吧～</div>
    </div>

    <div class="steps-section">
      <div
        v-for="(item, index) in stepList"
        :key="item.text"
        class="step-item"
        :class="{ active: index === step - 1 }"
      >
        <div class="step-icon">
          <img :src="item.icon" alt="上传学习资料" />
        </div>
        <div class="step-text">{{ item.text }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import step1Icon from "@/assets/images/guide/step1.png";
import step2Icon from "@/assets/images/guide/step2.png";
import step3Icon from "@/assets/images/guide/step3.png";
import step4Icon from "@/assets/images/guide/step4.png";

const props = defineProps({
  step: {
    type: Number,
    default: 1,
  },
});
const stepList = [
  {
    icon: step1Icon,
    text: "上传学习资料",
  },
  {
    icon: step2Icon,
    text: "生成练习题库",
  },
  {
    icon: step3Icon,
    text: "复核并生成题库",
  },
  {
    icon: step4Icon,
    text: "发布培训任务",
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
  .welcome-title,
  .system-title {
    height: 32px;
    line-height: 32px;
    font-size: 24px;
    font-weight: 600;
    color: #01021d;
  }

  .system-desc {
    margin-top: 8px;
    font-size: 14px;
    color: #4d4d60;
    height: 22px;
    line-height: 22px;
  }
}

.steps-section {
  margin-top: 78px;
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
