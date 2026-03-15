<template>
  <template v-for="subItem in menuList" :key="subItem.path">
    <el-sub-menu v-if="subItem.children?.length" :index="subItem.path">
      <template #title>
        <el-icon v-if="subItem.meta.icon">
          <component :is="subItem.meta.icon"></component>
        </el-icon>
        <span class="sle">{{
          subItem.meta.i18nKey ? $t(subItem.meta.i18nKey) : subItem.meta.title
        }}</span>
      </template>
      <SubMenu :menu-list="subItem.children" />
    </el-sub-menu>
    <el-menu-item
      v-else
      :index="subItem.path"
      @click="handleClickMenu(subItem)"
    >
      <el-icon v-if="subItem.meta.icon">
        <component :is="subItem.meta.icon"></component>
      </el-icon>
      <template #title>
        <span class="sle">{{
          subItem.meta.i18nKey ? $t(subItem.meta.i18nKey) : subItem.meta.title
        }}</span>
      </template>
    </el-menu-item>
  </template>
</template>

<script setup>
import { useRouter } from "vue-router";

defineProps({
  menuList: {
    type: Array,
    default: () => [],
  },
});

const router = useRouter();
const handleClickMenu = (subItem) => {
  if (subItem.meta.isLink) return window.open(subItem.meta.isLink, "_blank");
  router.push(subItem.path);
};
</script>

<style lang="scss">
.el-sub-menu .el-sub-menu__title:hover {
  color: var(--el-menu-hover-text-color) !important;
  background-color: transparent !important;
}
.el-menu--collapse {
  .is-active {
    .el-sub-menu__title {
      color: #ffffff !important;
      background-color: var(--el-color-primary) !important;
    }
  }
  .el-menu-item .el-menu-tooltip__trigger,
  .el-sub-menu .el-sub-menu__title {
    padding: 0 8px 8px 10px !important;
    font-weight: 400 !important;
  }
  // .el-menu-item .el-menu-tooltip__trigger:nth-last-of-type(1),
  // .el-sub-menu .el-sub-menu__title:nth-last-of-type(1) {
  //   margin-bottom: 0 !important;
  // }
}
.el-menu-item,
.el-sub-menu {
  margin: 0 8px 8px 8px !important;
  font-weight: 400 !important;
}
.el-menu-item:nth-last-of-type(1),
.el-sub-menu:nth-last-of-type(1) {
  margin-bottom: 0 !important;
}

.el-menu-item {
  &:hover {
    border-radius: 4px;
    color: var(--el-menu-hover-text-color);
  }
  &.is-active {
    color: var(--el-menu-active-color) !important;
    background-color: var(--el-menu-active-bg-color) !important;
    border-radius: 4px;
    border-right: 4px solid var(--el-color-primary);
    // &::before {
    //   position: absolute;
    //   top: 0;
    //   bottom: 0;
    //   width: 4px;
    //   content: "";
    //   background-color: var(--el-color-primary);
    // }
  }
}
.vertical,
.classic,
.transverse {
  .el-menu-item {
    &.is-active {
      &::before {
        left: 0;
      }
    }
  }
}
.columns {
  .el-menu-item {
    &.is-active {
      &::before {
        right: 0;
      }
    }
  }
}
.el-menu--vertical:not(.el-menu--collapse):not(.el-menu--popup-container)
  .el-menu-item,
.el-menu--vertical:not(.el-menu--collapse):not(.el-menu--popup-container)
  .el-menu-item-group__title,
.el-menu--vertical:not(.el-menu--collapse):not(.el-menu--popup-container)
  .el-sub-menu__title {
  margin-bottom: 8px !important;
}
</style>
