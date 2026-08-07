<template>
  <siderLeft :step="4" />

  <div class="guide-right">
    <div class="sidebar">
      <div class="step-img-content">
        <img
          class="step-img"
          :src="guideAssets.step31"
          :alt="$t('guide.step4.altStep1')"
        />
        <img
          class="step-img1"
          :src="guideAssets.step311"
          :alt="$t('guide.step4.altStep1Extra')"
        />
      </div>

      <div class="sidebar-title" style="margin-top: 114px">
        {{ $t("guide.step4.parseTitle") }}
      </div>

      <div class="sidebar-desc">
        <div class="desc-item">
          {{ $t("guide.step4.parseDesc") }}
        </div>
      </div>
    </div>

    <el-button type="primary" size="large" @click="nextStep" class="next-btn">
      {{ $t("guide.action.finish") }}
    </el-button>
  </div>
</template>

<script setup>
import siderLeft from "./siderLeft.vue";
import { setConfigs } from "@/services/user.service";
import { useGuideAssets } from "../useGuideAssets";

const emit = defineEmits(["complete"]);

const { guideAssets } = useGuideAssets();

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
}
</style>
