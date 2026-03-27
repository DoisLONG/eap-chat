<!-- 纵向布局 -->
<template>
  <div class="layout-container">
    <!-- 管理端布局 -->
    <el-container class="layout">
      <el-aside>
        <div class="aside-box-duan">
          <div
            class="duan-item"
            :class="{ active: activeDuan === 'user' }"
            @click="changeDuan('user')"
          >
            <div class="logo-content">
              <img
                style="width: 26px; height: 26px"
                :src="
                  activeDuan === 'user' ? '/logo-white.png' : '/logo-blue.png'
                "
                alt="logo"
              />
            </div>
            <div
              class="text"
              :style="{
                fontSize: language === 'zh' ? '14px' : '12px',
              }"
            >
              {{ $t("layout.userEnd") }}
            </div>
          </div>
          <div
            class="duan-item"
            :class="{
              active: activeDuan === 'admin',
              'duan-item-admin': isFirst,
            }"
            @click="changeDuan('admin')"
          >
            <el-popover
              popper-class="duan-popover"
              placement="right"
              :width="330"
              :offset="16"
              :visible="isFirst && activeDuan === 'user'"
            >
              <template #reference>
                <div class="logo-content">
                  <img
                    style="width: 26px; height: 26px"
                    :src="
                      activeDuan === 'admin'
                        ? '/logo-white.png'
                        : '/logo-blue.png'
                    "
                    alt="logo"
                  />
                </div>
              </template>
              <div class="duan-popover-content">
                <div class="header">
                  <span class="title">{{ $t("layout.adminEnd") }}</span>
                  <div class="img" @click="setFirst">
                    <img
                      style="width: 16px; height: 16px"
                      src="@/assets/images/close-icon.png"
                    />
                  </div>
                </div>
                <div class="content">
                  <div>👋 {{ $t("layout.welcomeTip") }}</div>
                  {{ $t("layout.switchTip") }}
                </div>
                <div class="footer">
                  <el-button @click="setFirst">{{
                    $t("layout.iKnow")
                  }}</el-button>
                </div>
              </div>
            </el-popover>
            <div
              class="text"
              :style="{
                fontSize: language === 'zh' ? '14px' : '12px',
              }"
            >
              {{ $t("layout.adminEnd") }}
            </div>
          </div>
          <div class="user-setting">
            <Setting />
          </div>
        </div>
        <div
          v-show="activeDuan === 'admin'"
          class="aside-box"
          :style="{ width: isCollapse ? '65px' : '208px' }"
        >
          <!-- <div class="logo flx-center">
            <img class="logo-img" src="/logo2.png" alt="logo" />
            <span
              v-show="!isCollapse"
              :class="lang === 'en' ? 'logo-text-en' : 'logo-text'"
              >{{ $t("home.title") }}</span
            >
          </div> -->
          <div class="logo-full" v-if="!isCollapse">
            <img style="width: 127px" src="/logo-full.png" alt="logo" />
            <!-- <span
              v-show="!isCollapse"
              :class="lang === 'en' ? 'logo-text-en' : 'logo-text'"
              >{{ $t("home.title") }}</span
            > -->
          </div>
          <div class="logo-full-collapse" v-else>
            <img style="width: 28px" src="/logo-blue.png" alt="logo" />
          </div>
          <el-scrollbar>
            <el-menu
              :router="false"
              :default-active="activeMenu"
              :collapse="isCollapse"
              :unique-opened="accordion"
              :collapse-transition="false"
            >
              <SubMenu :menu-list="menuList" />
            </el-menu>
          </el-scrollbar>
        </div>
      </el-aside>
      <el-container v-show="activeDuan === 'admin'">
        <el-header>
          <ToolBarLeft />
          <ToolBarRight />
        </el-header>
        <Main />
      </el-container>
      <el-container
        v-show="activeDuan === 'user'"
        class="user-iframe-container"
      >
        <div class="user-iframe-wrapper">
          <iframe
            v-if="isReset"
            :src="userUrl"
            class="user-iframe"
            :style="{
              width: h5Size.width + 'px',
              height: h5Size.height + 'px',
            }"
            frameborder="0"
            title="用户端"
          ></iframe>
        </div>
      </el-container>
    </el-container>
  </div>
</template>

<script setup name="layoutVertical">
import { computed, ref, provide, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/modules/auth";
import { useGlobalStore } from "@/stores/modules/global";
import Main from "@/layouts/components/Main/index.vue";
import Setting from "@/layouts/components/Header/components/Setting.vue";
import { onMounted, onUnmounted, watch } from "vue";
import ToolBarLeft from "@/layouts/components/Header/ToolBarLeft.vue";
import ToolBarRight from "@/layouts/components/Header/ToolBarRight.vue";
import SubMenu from "@/layouts/components/Menu/SubMenu.vue";
import { getConfigs, setConfigs } from "@/services/user.service";

const route = useRoute();
const authStore = useAuthStore();
const globalStore = useGlobalStore();
const accordion = computed(() => globalStore.accordion);
const language = computed(() => globalStore.language);
const isCollapse = computed(() => globalStore.isCollapse);
const lang = computed(() => globalStore.language);
const menuList = computed(() => authStore.showMenuListGet);
const activeMenu = computed(() => {
  return route.meta.activeMenu ? route.meta.activeMenu : route.path;
});

const isFirst = ref(false);
const activeDuan = ref(localStorage.getItem("activeDuan") || "user");
const userUrl = ref("");
const h5Size = ref({
  width: 0,
  height: 0,
});

const getUserConfig = async () => {
  const res = await getConfigs();
  if (res.data.status === 200) {
    isFirst.value = res.data.data.welcome_guide_pending === 0;
  }
};
getUserConfig();
const setFirst = () => {
  isFirst.value = false;
  setConfigs({
    payload: {
      welcome_guide_pending: 1,
    },
  });
};
provide("activeDuan", activeDuan);

const changeDuan = (val) => {
  if (isFirst.value && val === "admin") return;
  activeDuan.value = val;
  localStorage.setItem("activeDuan", val);
};

const calculateH5Size = () => {
  const container = document.querySelector(".user-iframe-wrapper");
  if (!container) return;

  // 获取容器的实际可用尺寸
  const containerWidth = container.clientWidth - 100;
  const containerHeight = container.clientHeight - 160;

  // 常见H5页面宽高比(384/817)
  const aspectRatio = 0.47;

  let width, height;

  // 计算基于容器宽度的高度
  const calculatedHeight = containerWidth / aspectRatio;

  if (calculatedHeight <= containerHeight) {
    // 如果基于宽度计算的高度不超过容器高度，使用宽度作为基准
    width = containerWidth;
    height = calculatedHeight;
  } else {
    // 否则使用高度作为基准
    height = containerHeight;
    width = height * aspectRatio;
  }

  width = Math.max(291, Math.round(width));
  height = Math.max(518, Math.round(height));

  h5Size.value = {
    width,
    height,
  };
};

// 语言变化后链接需要重置
const isReset = ref(true);
watch(
  () => language.value,
  () => {
    isReset.value = false;
    setIframeUrl();
    nextTick(() => {
      isReset.value = true;
    });
  },
);

const setIframeUrl = () => {
  const token = localStorage.getItem("token");
  const origin =
    window.location.hostname === "localhost"
      ? "http://14.103.176.8:5174"
      : window.location.origin;
  userUrl.value = `${origin}/eap/#/?token=${token}&lang=${language.value}`;
  // userUrl.value = `http://localhost:8888/eap/#/?token=${token}&lang=${language.value}`;
  // console.log("userUrl.value", userUrl.value);
};
// 监听窗口大小变化
onMounted(() => {
  setIframeUrl();
  calculateH5Size();
  window.addEventListener("resize", calculateH5Size);
});

onUnmounted(() => {
  window.removeEventListener("resize", calculateH5Size);
});
</script>

<style scoped lang="scss">
.el-container {
  width: 100%;
  height: 100%;
  :deep(.el-aside) {
    display: flex;
    width: auto;
    background-color: #f9fafb;
    .aside-box {
      background-color: var(--el-menu-bg-color);
      border-right: 1px solid var(--el-aside-border-color);
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
      transition: width 0.3s ease;
      border-radius: 24px 0 0 24px !important;
      .el-scrollbar {
        height: calc(100% - 64px);
        margin-top: 8px;
        box-sizing: border-box;
        .el-menu {
          width: 100%;
          overflow-x: hidden;
          border-right: none;
        }
      }
      .logo {
        box-sizing: border-box;
        height: 64px;
        .logo-img {
          width: 28px;
          object-fit: contain;
        }
        .logo-text {
          margin-left: 6px;
          font-size: 17px;
          font-weight: bold;
          color: var(--el-aside-logo-text-color);
          white-space: nowrap;
        }
        .logo-text-en {
          margin-left: 6px;
          font-size: 13px;
          font-weight: bold;
          color: var(--el-aside-logo-text-color);
          white-space: nowrap;
        }
      }
    }
    .aside-box-duan {
      background: #f9fafb;
      width: 80px;
      display: flex;
      flex-direction: column;
      height: 100%;

      padding-top: 32px;
      box-sizing: border-box;
      position: relative;
      .user-setting {
        width: 80px;
        height: 80px;
        position: absolute;
        bottom: 20px;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .duan-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-bottom: 19px;
        transition: all 0.3s ease;
        cursor: pointer;
        .logo-content {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background-color: #fff;
          border-radius: 12px;
          border: 2px solid #fff;
          box-sizing: border-box;
        }
        .text {
          height: 20px;
          line-height: 20px;
          margin-top: 8px;
          font-size: 14px;
          font-weight: 400;
          color: #99a1af;
        }
      }
      .active {
        .logo-content {
          background-color: #1677ff;
        }
        .text {
          color: #1677ff;
        }
      }
      .duan-item:not(.active):hover {
        .logo-content {
          background-color: #1677ff29;
        }
      }
      .duan-item-admin {
        .logo-content {
          border: 2px solid #1677ff;
        }
      }
    }
  }
  .el-header {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 15px;
    background-color: var(--el-header-bg-color);
    border-bottom: 1px solid var(--el-header-border-color);
  }
}
.logo-full {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 24px;
  box-sizing: border-box;
}
.logo-full-collapse {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.layout-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.user-iframe-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-radius: 24px 0 0 24px;
  background:
    linear-gradient(to bottom, #c8e4ff, #d7e9fa, #d9eafa00),
    url("@/assets/images/userbg.png");
  background-repeat: no-repeat;
  background-position: bottom center;
  background-size: contain;

  .user-iframe-wrapper {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 40px;
    box-sizing: border-box;
    overflow: auto;
    position: relative;
  }

  .user-iframe {
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    background-color: #fff;
  }
}
.duan-popover-content {
  .header {
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .title {
      height: 20px;
      line-height: 20px;
      font-size: 14px;
      font-weight: 500;
      color: #fff;
    }
    .img {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .img:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
  .content {
    margin-top: 16px;
    font-size: 12px;
    font-weight: 400;
    color: #fff;
    line-height: 18px;
  }
  .footer {
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .footer :deep(.el-button) {
    width: 86px;
    height: 36px;
    line-height: 36px;
    border-radius: 8px;
    color: #1677ff;
  }
}
</style>
<style>
.duan-popover.el-popover {
  background-color: #1677ff;
  border-radius: 12px;
  border: none;
  padding: 16px;
  box-sizing: border-box;
}

.duan-popover.el-popover .el-popper__arrow::before {
  background: #1677ff !important;
}
</style>
