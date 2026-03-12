import axios from "axios";
import { ElMessage } from "element-plus";
import { $t } from "@/languages/index.js";
const videoApiV2 = axios.create({
  baseURL: "/videoapiv2",
  timeout: 600000,
});
// 请求拦截器，添加token
videoApiV2.interceptors.request.use(
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
videoApiV2.interceptors.response.use(
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

// 创建通用Excel生成任务
export function createExcelJob(jobId, position_id) {
  return videoApiV2.get(
    `/api/v2/universal/jobs?job_id=${jobId}&position_id=${position_id}`,
  );
}

// 获取处理结果
export function getExcelJobResult(taskId) {
  return videoApiV2.get(`/api/v2/universal/jobs/${taskId}/result`);
}
