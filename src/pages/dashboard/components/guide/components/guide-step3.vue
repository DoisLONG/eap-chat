<template>
  <siderLeft :step="3" />

  <div v-if="step === 1" class="guide-right">
    <div class="sidebar">
      <div class="step-img-content">
        <img
          class="step-img"
          :src="guideAssets.step31"
          :alt="$t('guide.step3.altStep1')"
        />
        <img
          class="step-img1"
          :src="guideAssets.step311"
          :alt="$t('guide.step3.altStep1Extra')"
        />
      </div>

      <div class="sidebar-title" style="margin-top: 114px">
        {{ $t("guide.step3.aiParseTitle") }}
      </div>

      <div class="sidebar-desc">
        <div class="desc-item">
          {{ $t("guide.step3.aiParseDesc") }}
        </div>
      </div>
    </div>

    <el-button type="primary" size="large" @click="nextStep" class="next-btn">
      {{ $t("guide.action.next") }}
    </el-button>
  </div>

  <div v-if="step === 2" class="guide-right">
    <div class="sidebar">
      <div class="step2-img-content">
        <img
          class="step-img"
          :src="guideAssets.step32"
          :alt="$t('guide.step3.altStep2')"
        />
      </div>

      <img
        class="step1-dot"
        :src="step1Dot"
        :alt="$t('guide.step3.altPointer')"
      />
      <img
        class="step2-dot"
        :src="step2Dot"
        :alt="$t('guide.step3.altPointer')"
      />
      <img
        class="step3-dot"
        :src="step3Dot"
        :alt="$t('guide.step3.altPointer')"
      />

      <div class="sidebar-title">
        {{ $t("guide.step3.questionTitle") }}
        <span>{{ $t("guide.step3.questionTitleSub") }}</span>
      </div>

      <div class="sidebar-desc">
        <div class="desc-item">
          {{ $t("guide.step3.questionDesc") }}
        </div>
      </div>
    </div>

    <el-button type="text" v-if="step > 1" @click="prevStep" class="prev-btn">
      {{ $t("guide.action.prev") }}
    </el-button>

    <el-button type="primary" size="large" @click="nextStep" class="next-btn">
      {{ $t("guide.action.next") }}
    </el-button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import step1Dot from "@/assets/images/guide/step1-dot.png";
import step2Dot from "@/assets/images/guide/step2-dot.png";
import step3Dot from "@/assets/images/guide/step3-dot.png";
import siderLeft from "./siderLeft.vue";
import { useGuideAssets } from "../useGuideAssets";

const emit = defineEmits(["nextStep"]);

const step = ref(1);
const { guideAssets } = useGuideAssets();

const nextStep = () => {
  if (step.value < 2) {
    step.value++;
  } else {
    emit("nextStep");
  }
};

const prevStep = () => {
  if (step.value > 1) {
    step.value--;
  }
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
    // 第二步
    .step2-img-content {
      width: 598px;
      height: 277px;
      margin-top: 24px;
      margin-left: 24px;
      overflow: hidden;
      position: relative;
      img {
        width: 100%;
        height: 100%;
        border-radius: 8px;
        object-fit: contain;
      }
    }
    .step1-dot {
      position: absolute;
      top: 100px;
      left: 140px;
      width: 40px;
      height: 40px;
    }
    .step2-dot {
      position: absolute;
      top: 155px;
      left: 200px;
      width: 40px;
      height: 40px;
    }
    .step3-dot {
      position: absolute;
      top: -16px;
      right: 72px;
      width: 40px;
      height: 40px;
    }
    .step2-text {
      position: absolute;
      top: -99px;
      left: 121px;
      font-size: 18px;
      color: #01021d;
      font-weight: 400;
      height: 40px;
      line-height: 40px;
      border: 2px solid #1677ff;
      border-radius: 20px;
      padding: 0 12px;
      box-sizing: border-box;
      span {
        font-weight: 600;
      }
    }
    .sidebar-title {
      line-height: 1.35;
      font-size: 22px;
      color: #01021d;
      font-weight: 600;
      margin-top: 29px;
      padding-left: 24px;
      height: auto;
      word-break: break-word;

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
        height: auto;
        min-height: 20px;
        line-height: 1.55;
        font-size: 14px;
        color: #4d4d60;
        margin-bottom: 6px;
        word-break: break-word;
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
  .prev-btn {
    position: absolute;
    bottom: 24px;
    left: 24px;
    width: 120px;
    height: 48px;
    line-height: 48px;
    border-radius: 12px;
    color: #989fb0;
  }
  .prev-btn:hover {
    background-color: #f0f2f5;
    color: #1677ff;
  }
}
</style>
