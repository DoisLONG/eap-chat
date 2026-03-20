<template>
  <el-dialog
    v-model="dialogVisible"
    title=""
    :width="step === 0 ? '800px' : '932px'"
    class="guide-dialog"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="guide-container">
      <startGuide
        v-if="step === 0"
        @close="$emit('close')"
        @startLearning="startLearning"
      />
      <guideStep1 v-else-if="step === 1" @nextStep="nextStep" />
      <guideStep2 v-else-if="step === 2" @nextStep="nextStep" />
      <guideStep3 v-else-if="step === 3" @nextStep="nextStep" />
      <guideStep4 v-else-if="step === 4" @complete="handleComplete" />
    </div>
  </el-dialog>
</template>

<script setup>
import { ref } from "vue";
import startGuide from "./components/start-guide.vue";
import guideStep1 from "./components/guide-step1.vue";
import guideStep2 from "./components/guide-step2.vue";
import guideStep3 from "./components/guide-step3.vue";
import guideStep4 from "./components/guide-step4.vue";

const emit = defineEmits(["close"]);
const step = ref(0);
const dialogVisible = true;
const startLearning = () => {
  step.value = 1;
};
const nextStep = () => {
  step.value++;
};
const handleComplete = () => {
  emit("close");
};
</script>

<style lang="scss">
.guide-dialog.el-dialog {
  border-radius: 20px !important;
  transition: all 0.3s ease-in-out !important;
  overflow: hidden !important;
}
.guide-dialog.el-dialog .el-dialog__header {
  display: none;
}
.guide-dialog.el-dialog .el-dialog__body {
  padding: 0 !important;
}
</style>
<style scoped lang="scss">
.guide-container {
  display: flex;
}
</style>
