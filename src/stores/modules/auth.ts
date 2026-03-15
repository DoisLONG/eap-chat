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
        path: "/dashboard",
        name: "Dashboard",
        meta: {
          icon: "Histogram",
          title: "仪表盘",
          i18nKey: "menu.dashboard",
          isLink: "",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false,
        },
      },
      {
        path: "/knowledge",
        name: "knowledge",
        meta: {
          icon: "Management",
          i18nKey: "menu.knowledge",
          title: "知识库",
          isLink: "",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: true,
        },
        children: [
          {
            path: "/knowledge/materialLibrary",
            name: "MaterialLibrary",
            meta: {
              icon: "Folder",
              title: "素材库",
              i18nKey: "menu.materialLibrary",
              isLink: "",
              isHide: false,
              isFull: false,
              isAffix: false,
              isKeepAlive: true,
            },
          },
        ],
      },
      {
        path: "/trainingCenter",
        name: "trainingCenter",
        meta: {
          icon: "Flag",
          i18nKey: "menu.trainingCenter",
          title: "培训中心",
          isLink: "",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false,
        },
        children: [
          {
            path: "/trainingCenter/studyManagement",
            name: "StudyManagement",
            meta: {
              icon: "List",
              title: "学习管理",
              i18nKey: "menu.studyManagement",
              isLink: "",
              isHide: false,
              isFull: false,
              isAffix: false,
              isKeepAlive: true,
            },
          },
          {
            path: "/trainingCenter/practiceManagement",
            name: "PracticeManagement",
            meta: {
              icon: "Menu",
              title: "练习管理",
              i18nKey: "menu.practiceManagement",
              isLink: "",
              isHide: false,
              isFull: false,
              isAffix: false,
              isKeepAlive: false,
            },
          },
        ],
      },
      // {
      //   path: "/testCenter",
      //   name: "TestCenter",
      //   meta: {
      //     icon: "Histogram",
      //     title: "考试中心",
      //     isLink: "",
      //     isHide: false,
      //     isFull: false,
      //     isAffix: false,
      //     isKeepAlive: false,
      //   },
      // },
      {
        path: "/system",
        name: "system",
        meta: {
          icon: "Tools",
          i18nKey: "menu.system",
          title: "设置中心",
          isLink: "",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false,
        },
        children: [
          {
            path: "/system/permissionManagement",
            name: "PermissionManagement",
            meta: {
              icon: "Grid",
              title: "权限管理",
              isLink: "",
              isHide: false,
              isFull: false,
              isAffix: false,
              isKeepAlive: false,
            },
            children: [
              {
                path: "/system/permissionManagement/user",
                name: "User",
                meta: {
                  icon: "User",
                  title: "用户管理",
                  i18nKey: "menu.userManagement",
                  isLink: "",
                  isHide: false,
                  isFull: false,
                  isAffix: false,
                  isKeepAlive: false,
                },
              },
              {
                path: "/system/permissionManagement/company",
                name: "Company",
                meta: {
                  icon: "School",
                  title: "公司管理",
                  i18nKey: "menu.companyManagement",
                  isLink: "",
                  isHide: false,
                  isFull: false,
                  isAffix: false,
                  isKeepAlive: false,
                },
              },
              {
                path: "/system/permissionManagement/dept",
                name: "Dept",
                meta: {
                  icon: "SetUp",
                  title: "部门管理",
                  i18nKey: "menu.deptment",
                  isLink: "",
                  isHide: false,
                  isFull: false,
                  isAffix: false,
                  isKeepAlive: false,
                },
              },
              {
                path: "/system/permissionManagement/position",
                name: "Position",
                meta: {
                  icon: "WindPower",
                  title: "岗位管理",
                  i18nKey: "menu.position",
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
