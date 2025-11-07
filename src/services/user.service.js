import axios from "axios";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

const router = useRouter();
const userApi = axios.create({
  baseURL: "/userapi",
  timeout: 60000,
});
// 请求拦截器，添加token
userApi.interceptors.request.use(
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
userApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      ElMessage.error({ message: "登录已过期，请重新登录" });
      // 如果有路由实例，可以跳转到登录页
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
    return Promise.reject(error);
  }
);

export function login(parmas) {
  return userApi.post("/v1/auth/login", parmas);
}

// 获取用户列表
export function getUserList(parmas) {
  const upParams = {
    ...parmas,
    page: parmas.pageNum,
    size: parmas.pageSize,
  };
  delete upParams.pageSize;
  delete upParams.pageNum;
  return userApi.post("/v1/users/list", upParams);
}
// 获取角色列表
export function getRoleList(parmas) {
  return userApi.post("/v1/roles/list", parmas);
}
// 获取用户信息
export function getUserInfo(parmas) {
  return userApi.post("/v1/users/get", parmas);
}

// 创建用户
export function createUser(parmas) {
  return userApi.post("/v1/users/create", parmas);
}
// 更新用户
export function updateUser(parmas) {
  return userApi.post("/v1/users/update", parmas);
}

// 删除用户
export function deleteUser(parmas) {
  return userApi.post("/v1/users/delete", parmas);
}
// 修改密码
export function changePwd(parmas) {
  return userApi.post("/v1/users/change_password", parmas);
}
