<template>
  <siderLeft :step="4"></siderLeft>
  <div class="guide-right">
    <div class="sidebar">
      <div class="step-img-content">
        <img class="step-img" :src="step31" alt="上传学习资料" />
        <img class="step-img1" :src="step311" alt="上传学习资料" />
      </div>

      <div class="sidebar-title" style="margin-top: 114px">系统解析资料</div>
      <div class="sidebar-desc">
        <div class="desc-item">AI解析SOP文档,自动生成题库和考试任务</div>
      </div>
    </div>
    <el-button type="primary" size="large" @click="nextStep" class="next-btn">
      完成
    </el-button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import step31 from "@/assets/images/guide/step3-1.png";
import step311 from "@/assets/images/guide/step3-1-1.png";
import step1Dot from "@/assets/images/guide/step1-dot.png";
import step32 from "@/assets/images/guide/step3-2.png";
import step2Dot from "@/assets/images/guide/step2-dot.png";
import step3Dot from "@/assets/images/guide/step3-dot.png";
import siderLeft from "./siderLeft.vue";
import { setConfigs } from "@/services/user.service";

const emit = defineEmits(["complete"]);
const step = ref(1);
const nextStep = () => {
  setConfigs({
    payload: {
      dashboard_welcome_guide_pending: 1,
    },
  });
  emit("complete");
};
</script>

<style scoped lang="scss">
.guide-right {
  flex: 1;
  position: relative;
  background: #fafbfc;
  border-radius: 8px 0 0 8px;
  transition: all 0.3s ease-in-out;
  .sidebar {
    position: relative;
    .step-img-content {
      width: 518px;
      height: 147px;
      margin-top: 88px;
      margin-left: 64px;
      overflow: hidden;
      position: relative;
      .step-img {
        width: 518px;
        height: 123px;
        border-radius: 8px;
        object-fit: contain;
      }
      .step-img1 {
        width: 511px;
        height: 24px;
        border-radius: 8px;
        object-fit: contain;
        margin-top: -45px;
      }
    }
    .sidebar-title {
      height: 31px;
      line-height: 31px;
      font-size: 22px;
      color: #01021d;
      font-weight: 600;
      margin-top: 29px;
      padding-left: 24px;
      span {
        font-size: 18px;
        color: #01021d;
        font-weight: 400;
      }
    }
    .sidebar-desc {
      width: 603px;
      box-sizing: border-box;
      padding-left: 24px;
      margin-top: 12px;
      .desc-item {
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        color: #4d4d60;
        margin-bottom: 4px;
      }
    }
  }
  .next-btn {
    position: absolute;
    bottom: 24px;
    right: 32px;
    width: 120px;
    height: 48px;
    border-radius: 12px;
    line-height: 48px;
  }
}
</style>
