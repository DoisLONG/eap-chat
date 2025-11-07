<template>
  <el-config-provider :locale="zhCn" :size="assemblySize">
    <router-view></router-view>
  </el-config-provider>
</template>
<script setup>
import { computed } from "vue";
import { useTheme } from "@/hooks/useTheme";
import { useGlobalStore } from "@/stores/modules/global";
import zhCn from "element-plus/es/locale/lang/zh-cn";

const { initTheme } = useTheme();
initTheme();

const globalStore = useGlobalStore();
const assemblySize = computed(() => globalStore.assemblySize);
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
