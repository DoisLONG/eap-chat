<template>
  <WebPageContainer>
    <div class="web-page-placeholder">{{ t("web.page.practiceDeveloping") }}</div>
  </WebPageContainer>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import WebPageContainer from "@/layouts/webUser/components/WebPageContainer.vue";

const { t } = useI18n();
</script>

<style scoped lang="scss">
.web-page-placeholder {
  padding: 28px;
  border: 1px solid var(--web-line);
  border-radius: 12px;
  background: var(--web-surface);
  box-shadow: 0 4px 14px rgba(31, 61, 96, 0.06);
  color: var(--web-text-secondary);
}
</style>
