import { defineStore } from "pinia";
import { DEFAULT_PRIMARY } from "@/config";
import piniaPersistConfig from "@/stores/helper/persist";

export const useGlobalStore = defineStore("sopai-global", {
  state: () => ({
    layout: "vertical",
    currentPlatform: "admin",
    language: null,
    assemblySize: "default",
    maximize: false,
    primary: DEFAULT_PRIMARY,
    isCollapse: false,
    accordion: false,
    breadcrumb: true,
    breadcrumbIcon: true,
    tabs: false,
    tabsIcon: true,
    footer: false,
  }),
  getters: {},
  actions: {
    setPlatform(platform) {
      this.currentPlatform = platform;
    },
    setGlobalState(...args) {
      this.$patch({ [args[0]]: args[1] });
    },
  },
  persist: piniaPersistConfig("sopai-global"),
});
