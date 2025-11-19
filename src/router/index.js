import { createRouter, createWebHistory } from "vue-router";
import NProgress from "@/config/nprogress";
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

  // 带侧边栏的主框架
  {
    path: "/",
    component: AppLayout,
    redirect: "/list",
    children: [
      {
        path: "",
        redirect: "/list",
      },
      {
        path: "list",
        name: "List",
        component: () => import("@/pages/LicenseAdmin.vue"),
        meta: {
          icon: "Menu",
          title: "sop管理",
          isLink: "",
          isHide: false,
          isFull: false,
          isAffix: true,
          isKeepAlive: false,
        },
      },
      {
        path: "/system",
        name: "system",
        redirect: "/system/user",
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
            component: () => import("@/pages/userManagement/index.vue"),
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
            component: () => import("@/pages/companyManagement/index.vue"),
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
            component: () => import("@/pages/deptManagement/index.vue"),
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
            component: () => import("@/pages/positionManagement/index.vue"),
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
  },
  // 兜底
  { path: "/:pathMatch(.*)*", redirect: "/list" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 登录守卫：公开页直接放行，其余需要 token
router.beforeEach((to, from, next) => {
  // 1.NProgress 开始
  NProgress.start();
  if (to.meta?.public) return next();
  const token = localStorage.getItem("token");
  if (!token) return next({ path: "/login", query: { redirect: to.fullPath } });
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
