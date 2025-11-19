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
        path: "/system",
        name: "system",
        meta: {
          icon: "Tools",
          title: "系统管理",
          isLink: "",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false,
        },
        children: [
          {
            path: "/system/user",
            name: "User",
            meta: {
              icon: "UserFilled",
              title: "用户管理",
              isLink: "",
              isHide: false,
              isFull: false,
              isAffix: false,
              isKeepAlive: false,
            },
          },
          {
            path: "/system/company",
            name: "Company",
            meta: {
              icon: "School",
              title: "公司管理",
              isLink: "",
              isHide: false,
              isFull: false,
              isAffix: false,
              isKeepAlive: false,
            },
          },
          {
            path: "/system/dept",
            name: "Dept",
            meta: {
              icon: "SetUp",
              title: "部门管理",
              isLink: "",
              isHide: false,
              isFull: false,
              isAffix: false,
              isKeepAlive: false,
            },
          },
          {
            path: "/system/position",
            name: "Position",
            meta: {
              icon: "WindPower",
              title: "岗位管理",
              isLink: "",
              isHide: false,
              isFull: false,
              isAffix: false,
              isKeepAlive: false,
            },
          },
        ],
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
