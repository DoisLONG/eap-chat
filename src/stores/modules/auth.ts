import { defineStore } from "pinia";
import {
  getFlatMenuList,
  getShowMenuList,
  getAllBreadcrumbList,
} from "@/utils";

export const useAuthStore = defineStore("sopai-auth", {
  state: () => ({
    // 菜单权限列表
    authMenuList: [
      {
        path: "/list",
        name: "List",
        meta: {
          icon: "Menu",
          title: "sop管理",
          isLink: "",
          isHide: false,
          isFull: false,
          isAffix: true,
          isKeepAlive: true,
        },
      },
      {
        path: "/user",
        name: "User",
        meta: {
          icon: "UserFilled",
          title: "用户管理",
          isLink: "",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: true,
        },
      },
    ],
  }),
  getters: {
    // 菜单权限列表 ==> 这里的菜单没有经过任何处理
    authMenuListGet: (state) => state.authMenuList,
    // 菜单权限列表 ==> 左侧菜单栏渲染，需要剔除 isHide == true
    showMenuListGet: (state) => getShowMenuList(state.authMenuList),
    // 菜单权限列表 ==> 扁平化之后的一维数组菜单，主要用来添加动态路由
    flatMenuListGet: (state) => getFlatMenuList(state.authMenuList),
    // 递归处理后的所有面包屑导航列表
    breadcrumbListGet: (state) => getAllBreadcrumbList(state.authMenuList),
  },
  actions: {},
});
