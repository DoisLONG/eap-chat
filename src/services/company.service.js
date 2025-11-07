import axios from "axios";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

const router = useRouter();
const companyApi = axios.create({
  baseURL: "/companyapi",
  timeout: 60000,
});

// 请求拦截器，添加token
companyApi.interceptors.request.use(
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
companyApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // 如果有路由实例，可以跳转到登录页
      ElMessage.error({ message: "登录已过期，请重新登录" });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
    return Promise.reject(error);
  }
);

// 获取公司列表
export function getCompanyList(parmas) {
  return companyApi.post("/v1/company/query", { ...parmas });
}
// 获取部门列表
export function getDeptList(parmas) {
  return companyApi.post("/v1/department/query", { ...parmas });
}
// 获取岗位列表
export function getPostList(parmas) {
  return companyApi.post("/v1/position/query", { ...parmas });
}
