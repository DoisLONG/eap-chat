<template>
  <el-menu
    :default-active="active"
    class="menu"
    router
    unique-opened
    :collapse="false"
  >
    <template v-for="m in MENUS" :key="m.path">
      <el-sub-menu v-if="m.children && m.children.length" :index="m.path">
        <template #title>
          <el-icon v-if="m.icon"><component :is="m.icon" /></el-icon>
          <span>{{ m.title }}</span>
        </template>
        <el-menu-item v-for="c in m.children" :key="c.path" :index="c.path">
          <span>{{ c.title }}</span>
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else :index="m.path">
        <el-icon v-if="m.icon"><component :is="m.icon" /></el-icon>
        <span>{{ m.title }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { MENUS } from '@/config/menus'

// 如果你在 main.js 里已经全局注册了 Element Plus 图标，这里就不用额外处理。
// 如果没有全局注册，也可以局部引入：
// import * as ElIcons from '@element-plus/icons-vue'
// 然后 <component :is="ElIcons[m.icon]" />，并把上面模板里 :is="m.icon" 改掉。
const route = useRoute()
const active = computed(() => route.path)
</script>

<style scoped>
.menu { border-right: none; }
</style>
