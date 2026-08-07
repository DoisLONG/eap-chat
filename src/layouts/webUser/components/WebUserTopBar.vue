<template>
  <header class="web-user-top-bar">
    <h1>{{ pageTitle }}</h1>
    <div class="web-user-top-bar__user">
      <el-avatar :size="32">{{ userInitial }}</el-avatar>
      <span>{{ userName }}</span>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/stores/modules/user";

const route = useRoute();
const { t } = useI18n();
const { userInfo } = storeToRefs(useUserStore());

const userName = computed(() => userInfo.value?.name || t("web.layout.userPlaceholder"));
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());
const pageTitle = computed(() => t(route.meta.titleKey || "web.nav.home"));
</script>

<style scoped lang="scss">
.web-user-top-bar {
  display: flex;
  height: var(--web-header-height);
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  border-bottom: 1px solid var(--web-line);
  background: var(--web-surface);

  h1 {
    margin: 0;
    color: var(--web-text-primary);
    font-size: 18px;
    font-weight: 600;
  }

  &__user {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: var(--web-text-primary);
    font-size: 14px;

    :deep(.el-avatar) {
      background: #eaf3ff;
      color: var(--el-color-primary);
      font-weight: 600;
    }
  }
}
</style>
