<template>
  <div class="tool-bar-ri">
    <div class="header-icon">
      <!-- <AssemblySize id="assemblySize" /> -->
      <el-button
        v-auth="'add'"
        type="primary"
        :icon="CirclePlus"
        class="header-btn"
        @click="checkoutToUser"
      >
        {{ $t("header.checkoutB") }}
      </el-button>
      <Language id="language" />
      <!-- <SearchMenu id="searchMenu" />
      <ThemeSetting id="themeSetting" />
      <Message id="message" />
      <Fullscreen id="fullscreen" /> -->
    </div>
    <Avatar />
  </div>
</template>

<script setup>
// import AssemblySize from "./components/AssemblySize.vue";
import Language from "./components/Language.vue";
// import SearchMenu from "./components/SearchMenu.vue";
// import ThemeSetting from "./components/ThemeSetting.vue";
// import Message from "./components/Message.vue";
// import Fullscreen from "./components/Fullscreen.vue";
import Avatar from "./components/Avatar.vue";
const checkoutToUser = () => {
  window.open(
    "http://14.103.144.187:30101/chat/sop",
    "_blank",
    "noopener,noreferrer"
  );
};
</script>

<style scoped lang="scss">
.tool-bar-ri {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 0px;
  .header-icon {
    display: flex;
    align-items: center;
    margin-right: 15px;
    & > * {
      margin-left: 21px;
      color: var(--el-header-text-color);
    }
  }
  .header-btn {
    color: #fff;
  }
  .username {
    margin: 0 10px;
    font-size: 15px;
    color: var(--el-header-text-color);
  }
}
</style>
