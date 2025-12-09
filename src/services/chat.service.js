import axios from "axios";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { $t } from "@/languages/index.js";

const router = useRouter();
const chatApi = axios.create({
  baseURL: "/chatapi",
  timeout: 60000,
});

// 请求拦截器，添加token
chatApi.interceptors.request.use(
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
chatApi.interceptors.response.use(
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

// 初始化考试会话
export function startExamSession({ user_id, file_name }) {
  return chatApi.post("/v1/exams/start", { user_id, file_name });
}

// 流式答题接口
export async function streamExamAnswer(body, onChunk) {
  const ctrl = new AbortController();
  window.__chatAbort = ctrl;

  const res = await fetch("/chatapi/v1/exams/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: ctrl.signal,
  });

  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    text.split("\n").forEach((line) => {
      const s = line.replace(/^data:\s*/, "").trim();
      if (!s) return;
      onChunk?.(s);
    });
  }
}
