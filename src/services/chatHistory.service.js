import axios from "axios";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { $t } from "@/languages/index.js";

const router = useRouter();
const chathistoryapi = axios.create({
  baseURL: "/chathistoryapi",
  timeout: 60000,
});

// 请求拦截器，添加token
chathistoryapi.interceptors.request.use(
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
chathistoryapi.interceptors.response.use(
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

// 创建会话
export function createChat(params) {
  return chathistoryapi.post("/v1/chathistory/create", params);
}
// 获取历史会话列表
export function getChatHistory({ user_id }) {
  return chathistoryapi.post("/v1/chathistory/list", { user: user_id });
}
