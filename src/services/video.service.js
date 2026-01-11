import axios from "axios";
import { ElMessage } from "element-plus";
import { $t } from "@/languages/index.js";
const videoApi = axios.create({
  baseURL: "/videoapi",
  timeout: 600000,
});
// 请求拦截器，添加token
videoApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理token过期等情况
videoApi.interceptors.response.use(
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
  }
);

/**
 * 创建解析任务（上传视频）
 */
export function createAsrJobs(formData, onUploadProgress) {
  return videoApi.post("/api/v1/asr/jobs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    // 上传进度回调
    onUploadProgress:
      onUploadProgress ||
      ((progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`上传进度: ${percentCompleted}%`);
      }),
  });
}

// 查询任务状态
// •queued：已创建，等待执行
// •running：处理中
// •succeeded：成功
// •failed：失败
export function getJobStatus(jobId) {
  return videoApi.get(`/api/v1/asr/jobs/${jobId}/status`);
}

// 删除资料
export function getJobResult(jobId) {
  return videoApi.get(`/api/v1/asr/jobs/${jobId}/result`);
}
