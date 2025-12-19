<template>
  <el-config-provider :locale="locale" :size="assemblySize">
    <router-view></router-view>
  </el-config-provider>
</template>
<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { getBrowserLang } from "@/utils";
import { useTheme } from "@/hooks/useTheme";
import { LanguageType } from "./stores/interface";
import { useGlobalStore } from "@/stores/modules/global";
import th from "element-plus/es/locale/lang/th";
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";

const globalStore = useGlobalStore();

const { initTheme } = useTheme();
initTheme();

const i18n = useI18n();
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  if (token) {
    localStorage.setItem("token", token);
  }
  const language = globalStore.language ?? getBrowserLang();
  i18n.locale.value = language;
  globalStore.setGlobalState("language", language as LanguageType);
});

const locale = computed(() => {
  if (globalStore.language == "zh") return zhCn;
  if (globalStore.language == "en") return en;
  if (globalStore.language == "th") return th;
  return getBrowserLang() == "zh" ? zhCn : getBrowserLang() == "en" ? en : th;
});

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
