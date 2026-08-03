<template>
  <nav class="web-user-menu" :aria-label="t('web.layout.webTerminal')">
    <router-link
      v-for="item in menuItems"
      :key="item.path"
      class="web-user-menu__item"
      :class="{ 'web-user-menu__item--active': activePath === item.path }"
      :to="item.path"
    >
      <el-icon><component :is="item.icon" /></el-icon>
      <span>{{ t(item.labelKey) }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { Collection, DocumentChecked, EditPen, House } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

const route = useRoute();
const { t } = useI18n();

const menuItems = [
  { path: "/web/home", labelKey: "web.nav.home", icon: House },
  { path: "/web/study", labelKey: "web.nav.study", icon: Collection },
  { path: "/web/practice", labelKey: "web.nav.practice", icon: EditPen },
  { path: "/web/exam", labelKey: "web.nav.exam", icon: DocumentChecked },
];

const activePath = computed(() => route.meta.activeMenu || route.path);
</script>

<style scoped lang="scss">
.web-user-menu {
  width: var(--web-menu-width);
  flex: 0 0 var(--web-menu-width);
  padding: 20px 12px;
  border-right: 1px solid var(--web-line);
  background: var(--web-surface);

  &__item {
    display: flex;
    height: 42px;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
    padding: 0 12px;
    border-radius: 7px;
    color: var(--web-text-secondary);
    text-decoration: none;
    transition: background-color 0.2s ease, color 0.2s ease;

    .el-icon {
      font-size: 18px;
    }

    &:hover {
      background: #f0f6ff;
      color: var(--el-color-primary);
    }

    &--active {
      background: #eaf3ff;
      color: var(--el-color-primary);
      font-weight: 600;
    }
  }
}
</style>
