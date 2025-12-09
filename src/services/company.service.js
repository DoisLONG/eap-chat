import axios from "axios";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { $t } from "@/languages/index.js";

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
      ElMessage.error({ message: $t("header.loginValidate") });
      // 如果有路由实例，可以跳转到登录页
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
    return Promise.reject(error);
  }
);

// 新增公司
export function addCompany(params) {
  return companyApi.post("/v1/company/add", { ...params });
}
// 删除公司
export function deleteCompany(params) {
  return companyApi.post("/v1/company/delete", { ...params });
}
// 编辑公司
export function updateCompany(params) {
  return companyApi.post("/v1/company/update", { ...params });
}

// 获取公司列表
export function getCompanyList(parmas) {
  return companyApi.post("/v1/company/query", { ...parmas });
}

// 新增部门
export function addDept(params) {
  return companyApi.post("/v1/department/add", { ...params });
}
// 删除部门
export function deleteDept(params) {
  return companyApi.post("/v1/department/delete", { ...params });
}
// 编辑部门
export function updateDept(params) {
  return companyApi.post("/v1/department/update", { ...params });
}
// 获取部门列表
export function getDeptList(parmas) {
  return companyApi.post("/v1/department/query", { ...parmas });
}
// 新增岗位
export function addPost(params) {
  return companyApi.post("/v1/position/add", { ...params });
}

// 删除岗位
export function deletePost(params) {
  return companyApi.post("/v1/position/delete", { ...params });
}
// 编辑岗位
export function updatePost(params) {
  return companyApi.post("/v1/position/update", { ...params });
}
// 获取岗位列表
export function getPostList(parmas) {
  return companyApi.post("/v1/position/query", { ...parmas });
}

// 获取公司列表
export function getCompanyPageList(parmas) {
  const upParams = {
    ...parmas,
    page: parmas.pageNum,
    page_size: parmas.pageSize,
  };
  delete upParams.pageNum;
  delete upParams.pageSize;
  return companyApi.post("/v1/company/paginated", { ...upParams });
}
// 获取部门列表
export function getDeptPageList(parmas) {
  const upParams = {
    ...parmas,
    page: parmas.pageNum,
    page_size: parmas.pageSize,
  };
  delete upParams.pageNum;
  delete upParams.pageSize;
  return companyApi.post("/v1/department/paginated", { ...upParams });
}
// 获取岗位列表
export function getPostPageList(parmas) {
  const upParams = {
    ...parmas,
    page: parmas.pageNum,
    page_size: parmas.pageSize,
  };
  delete upParams.pageNum;
  delete upParams.pageSize;
  return companyApi.post("/v1/position/paginated", { ...upParams });
}
