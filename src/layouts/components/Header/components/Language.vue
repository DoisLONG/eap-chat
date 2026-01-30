<template>
  <el-link  type="primary" href="http://14.103.144.187:30101/chat/sop" target="_blank" class="color: #000;">模拟训练</el-link>
  <el-dropdown trigger="hover" @command="changeLanguage">
    <div>
      <img :src="globalIcon" alt="language" style="width: 23px; height: 23px" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in languageList"
          :key="item.value"
          :command="item.value"
          :disabled="language === item.value"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { useGlobalStore } from "@/stores/modules/global";
import { LanguageType } from "@/stores/interface";
import globalIcon from "@/assets/images/global.png";

const i18n = useI18n();
const globalStore = useGlobalStore();
const language = computed(() => globalStore.language);

const languageList = [
  { label: "简体中文", value: "zh" },
  { label: "English", value: "en" },
  { label: "ภาษาไทย", value: "th" },
];

const changeLanguage = (lang: string) => {
  i18n.locale.value = lang;
  globalStore.setGlobalState("language", lang as LanguageType);
};
</script>
