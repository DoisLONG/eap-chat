import { createRouter, createWebHistory } from "vue-router";
import NProgress from "@/config/nprogress";
import { useUserStore } from "@/stores/modules/user";
const AppLayout = () => import("../layouts/index.vue");
// const Chat = () => import('../pages/Chat.vue')

const routes = [
  // 公开页（不进侧边栏）
  {
    path: "/login",
    name: "Login",
    component: () => import("@/pages/Login.vue"),
    meta: { public: true },
  },
  {
    path: "/chat/sop",
    name: "SopPicker",
    component: () => import("@/pages/SopPicker.vue"),
  },
  {
    path: "/chat/exam",
    name: "ChatExam",
    component: () => import("@/pages/ChatExam.vue"),
  },
  {
    path: "/h5Preview",
    name: "h5Preview",
    component: () => import("@/pages/h5Preview/index.vue"),
  },
  // 带侧边栏的主框架
  {
    path: "/",
    component: AppLayout,
    redirect: "/dashboard",
    children: [
      {
        path: "",
        redirect: "/dashboard",
      },
      {
        path: "/dashboard",
        name: "Dashboard",
        component: () => import("@/pages/dashboard/index.vue"),
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
        redirect: "/knowledge/materialLibrary",
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
            component: () =>
              import("@/pages/knowledgeManagement/materialLibrary/index.vue"),
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
        redirect: "/trainingCenter/studyManagement",
        meta: {
          icon: "Management",
          i18nKey: "menu.trainingCenter",
          title: "培训中心",
          isLink: "",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: true,
        },
        children: [
          {
            path: "/trainingCenter/studyManagement",
            name: "StudyManagement",
            component: () => import("@/pages/courseManagement/index.vue"),
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
            component: () => import("@/pages/LicenseAdmin.vue"),
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
      //   path: "testCenter",
      //   name: "TestCenter",
      //   component: () => import("@/pages/testCenter/index.vue"),
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
        redirect: "/system/modelSetting",
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
            redirect: "/system/permissionManagement/user",
            meta: {
              icon: "Menu",
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
                component: () => import("@/pages/userManagement/index.vue"),
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
                component: () => import("@/pages/companyManagement/index.vue"),
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
                component: () => import("@/pages/deptManagement/index.vue"),
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
                component: () => import("@/pages/positionManagement/index.vue"),
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
          {
            path: "/system/modelSetting",
            name: "ModelSetting",
            component: () => import("@/pages/modelSetting/index.vue"),
            meta: {
              title: "模型配置",
              i18nKey: "menu.modelManagement",
              isLink: "",
              isHide: false,
              isFull: false,
              isAffix: false,
              isKeepAlive: false,
            },
            children: [
              {
                path: "/system/modelSetting/operate",
                name: "modelSettingDetail",
                component: () =>
                  import("@/pages/modelSetting/detail/index.vue"),
                meta: {
                  title: "模型详情",
                  i18nKey: "menu.modelManagement",
                  activeMenu: "/system/modelSetting",
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
  },
  // 兜底
  { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 登录守卫：公开页直接放行，其余需要 token 和权限
router.beforeEach((to, from, next) => {
  // 1.NProgress 开始
  NProgress.start();
  if (to.meta?.public) return next();
  const token = localStorage.getItem("token");
  if (!token) return next({ path: "/login", query: { redirect: to.fullPath } });

  // 检查模型配置页面的权限，只有 superadmin 可以访问
  const userStore = useUserStore();
  const isSuperAdmin = userStore.userInfo.name === "superadmin";
  const isModelSettingRoute = to.path.includes("/system/modelSetting");

  if (isModelSettingRoute && !isSuperAdmin) {
    return next({ path: "/dashboard" });
  }

  next();
});
/**
 * @description 路由跳转错误
 * */
router.onError((error) => {
  NProgress.done();
  console.warn("路由错误", error.message);
});

/**
 * @description 路由跳转结束
 * */
router.afterEach(() => {
  NProgress.done();
});

export default router;
