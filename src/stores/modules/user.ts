import { defineStore } from "pinia";
import piniaPersistConfig from "@/stores/helper/persist";

export const useUserStore = defineStore("sopai-user", {
  state: () => ({
    token: "",
    userInfo: { name: "admin" },
  }),
  getters: {},
  actions: {
    // Set Token
    setToken(token) {
      this.token = token;
    },
    // Set setUserInfo
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
    },
  },
  persist: piniaPersistConfig("sopai-user"),
});
