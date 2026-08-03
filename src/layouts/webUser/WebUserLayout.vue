<template>
  <div class="web-user-layout">
    <WebUserTerminalNav />
    <WebUserMenu />
    <section class="web-user-layout__main">
      <WebUserTopBar />
      <main class="web-user-layout__content">
        <router-view />
      </main>
    </section>
  </div>
</template>

<script setup>
import WebUserMenu from "@/layouts/webUser/components/WebUserMenu.vue";
import WebUserTerminalNav from "@/layouts/webUser/components/WebUserTerminalNav.vue";
import WebUserTopBar from "@/layouts/webUser/components/WebUserTopBar.vue";
</script>

<style lang="scss">
@use "@/styles/webUser.scss";
</style>
