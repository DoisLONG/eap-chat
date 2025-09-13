<template>
  <el-container class="app-layout">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="sidebar">
      <div class="brand">
        <img src="/logo2.png" alt="logo" />
        <span>EAP-Admin</span>
      </div>

      <!-- 用 router 模式，index 直接写路由路径 -->
      <el-menu :default-active="$route.path" class="el-menu-vertical" router>
        <!-- License 菜单 -->
        <el-menu-item index="/license/admin">
          <span>出题管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧主体 -->
    <el-container>
      <el-header class="topbar">
        <div class="left">
          <span class="page-title">{{ pageTitle }}</span>
        </div>
        <div class="right">
          <!-- 独立于系统之外的“注册页”，仍可从这里直达 -->
          <el-button size="small" @click="go('/license/register')">注册页</el-button>
          <el-button size="small" type="danger" @click="logout">退出登录</el-button>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'AppLayout',
  computed: {
    pageTitle() {
      const p = this.$route.path;
      // 简单映射；你也可以把 title 放到路由 meta 里来读
      if (p === '/license/admin') return 'Administer';
      return 'Admin';
    }
  },
  methods: {
    go(path) {
      this.$router.push(path);
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.replace('/login');
    }
  }
};
</script>

<style scoped>
.app-layout {
  height: 100vh;
}

.sidebar {
  background: #1f2430;
  color: #fff;
  display: flex;
  display: none;
  flex-direction: column;
  padding-top: 10px;
}

.brand {
  display: flex;
  align-items: center;
  padding: 14px 12px;
  gap: 8px;
}
.brand img {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #fff;
}
.brand span {
  color: #e7ecf5;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.el-menu-vertical {
  border-right: none;
  background: transparent;
  color: #bfc7d5;
}
.el-menu-vertical :deep(.el-menu-item),
.el-menu-vertical :deep(.el-submenu__title) {
  color: #c9d3e7;
}
.el-menu-vertical :deep(.el-menu-item.is-active) {
  background: #2a3140;
  color: #fff;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}
.topbar .page-title {
  font-size: 16px;
  font-weight: 600;
  color: #2b3a55;
}

.main {
  background: #f5f7fb;
}
</style>
