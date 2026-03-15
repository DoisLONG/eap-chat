import axios from "axios";
import { ElMessage } from "element-plus";
import { $t } from "@/languages/index.js";
const dashboardApi = axios.create({
  baseURL: "/dashboardapi",
  timeout: 600000,
});
// 请求拦截器，添加token
dashboardApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器 - 处理token过期等情况
dashboardApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      ElMessage.error({ message: $t("header.loginValidate") });
      // 如果有路由实例，可以跳转到登录页
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
    return Promise.reject(error);
  },
);

// 顶部统计总览接口
export function getOverview() {
  return dashboardApi.get(`/api/dashboard/overview`);
}

// 热力图接口
export function getHeatmap(params) {
  return dashboardApi.get(`/api/dashboard/heatmap`, { params });
}
// 各部门考试完成率接口
export function getDepartmentExam(params) {
  return dashboardApi.get(`/api/dashboard/department-exam`, { params });
}

// 获取sop列表接口
export function getSopList(params) {
  return dashboardApi.get(`/api/dashboard/sops`, { params });
}
// 成绩排行接口
export function getRank(params) {
  return dashboardApi.post(`/api/dashboard/ranking`, { ...params });
}

// 公告接口
export function getAnnouncements(params) {
  return dashboardApi.get(`/api/dashboard/announcements`, { params });
}

// 学习任务看板接口
export function getTaskBoard(params) {
  return dashboardApi.get(`/api/dashboard/task-board`, { params });
}

//资源总览接口
export function getResourceSummary(params) {
  return dashboardApi.get(`/api/dashboard/resource-summary`, { params });
}
