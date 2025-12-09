import { defineStore } from "pinia";
import { DEFAULT_PRIMARY } from "@/config";
import piniaPersistConfig from "@/stores/helper/persist";

export const useGlobalStore = defineStore("sopai-global", {
  state: () => ({
    layout: "vertical",
    language: null,
    assemblySize: "default",
    maximize: false,
    primary: DEFAULT_PRIMARY,
    isCollapse: false,
    accordion: true,
    breadcrumb: true,
    breadcrumbIcon: true,
    tabs: true,
    tabsIcon: true,
    footer: false,
  }),
  getters: {},
  actions: {
    setGlobalState(...args) {
      this.$patch({ [args[0]]: args[1] });
    },
  },
  persist: piniaPersistConfig("sopai-global"),
});
