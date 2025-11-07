<template>
  <el-watermark id="watermark" content="">
    <component :is="LayoutComponents[layout]" />
  </el-watermark>
</template>

<script setup name="layout">
import LayoutVertical from "./LayoutVertical/index.vue";

const LayoutComponents = {
  vertical: LayoutVertical,
};
const layout = "vertical";
</script>

<style scoped lang="scss">
.layout {
  min-width: 600px;
}
</style>
