<template>
  <aside class="web-user-terminal-nav" :aria-label="t('web.layout.webTerminal')">
    <el-tooltip :content="t('web.layout.userTerminalUnavailable')" placement="right">
      <button class="web-user-terminal-nav__item" type="button" disabled>
        <el-icon><UserFilled /></el-icon>
        <span>{{ t("web.layout.userTerminal") }}</span>
      </button>
    </el-tooltip>
    <div class="web-user-terminal-nav__item web-user-terminal-nav__item--active">
      <el-icon><Monitor /></el-icon>
      <span>{{ t("web.layout.webTerminal") }}</span>
    </div>
    <button class="web-user-terminal-nav__item" type="button" @click="goToAdmin">
      <el-icon><Setting /></el-icon>
      <span>{{ t("web.layout.adminTerminal") }}</span>
    </button>
  </aside>
</template>

<script setup>
import { Monitor, Setting, UserFilled } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { t } = useI18n();

const goToAdmin = () => router.push("/dashboard");
</script>

<style scoped lang="scss">
.web-user-terminal-nav {
  display: flex;
  width: var(--web-rail-width);
  flex: 0 0 var(--web-rail-width);
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding: 12px 7px;
  border-right: 1px solid var(--web-line);
  background: var(--web-surface);

  &__item {
    display: flex;
    min-height: 64px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--web-text-secondary);
    cursor: pointer;
    font-size: 11px;
    line-height: 1.2;

    .el-icon {
      font-size: 19px;
    }

    &:not(:disabled):hover {
      background: #f0f6ff;
      color: var(--el-color-primary);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.58;
    }

    &--active {
      background: var(--el-color-primary);
      color: #fff;
    }
  }
}
</style>
