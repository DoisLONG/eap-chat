import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import { DEFAULT_PRIMARY } from "@/config";
import { useGlobalStore } from "@/stores/modules/global";
import { getLightColor, getDarkColor } from "@/utils/color";
import { menuTheme } from "@/styles/theme/menu";
import { asideTheme } from "@/styles/theme/aside";
import { headerTheme } from "@/styles/theme/header";

/**
 * @description 全局主题 hooks
 * */
export const useTheme = () => {
  const globalStore = useGlobalStore();
  const { primary } = storeToRefs(globalStore);
  const switchDark = () => {
    const html = document.documentElement;
    html.setAttribute("class", "");
    changePrimary(primary.value);
    setAsideTheme();
    setHeaderTheme();
  };

  // 修改主题颜色
  const changePrimary = (val) => {
    if (!val) {
      val = DEFAULT_PRIMARY;
    }
    document.documentElement.style.setProperty("--el-color-primary", val);
    document.documentElement.style.setProperty(
      "--el-color-primary-dark-2",
      `${getDarkColor(val, 0.3)}`
    );
    for (let i = 1; i <= 9; i++) {
      const primaryColor = `${getLightColor(val, i / 10)}`;
      document.documentElement.style.setProperty(
        `--el-color-primary-light-${i}`,
        primaryColor
      );
    }
    globalStore.setGlobalState("primary", val);
  };

  // 设置菜单样式
  const setMenuTheme = () => {
    let type = "light";
    const theme = menuTheme[type!];
    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(key, value);
    }
  };

  // 设置侧边栏样式
  const setAsideTheme = () => {
    let type = "light";
    const theme = asideTheme[type!];
    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(key, value);
    }
    setMenuTheme();
  };

  // 设置头部样式
  const setHeaderTheme = () => {
    let type = "light";
    const theme = headerTheme[type!];
    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(key, value);
    }
    setMenuTheme();
  };

  // init theme
  const initTheme = () => {
    switchDark();
  };

  return {
    initTheme,
    switchDark,
    changePrimary,
    setAsideTheme,
    setHeaderTheme,
  };
};
