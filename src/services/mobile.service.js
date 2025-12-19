import axios from "axios";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { $t } from "@/languages/index.js";

const router = useRouter();
const mobileApi = axios.create({
  baseURL: "/mobileapi",
  timeout: 60000,
});
// 请求拦截器，添加token
mobileApi.interceptors.request.use(
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
mobileApi.interceptors.response.use(
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

// 获取课程列表
export function getCourseList(parmas) {
  const upParams = {
    ...parmas,
    page: parmas.pageNum,
    size: parmas.pageSize,
  };
  delete upParams.pageSize;
  delete upParams.pageNum;
  return mobileApi.get("/api/v1/course/list", upParams);
}
