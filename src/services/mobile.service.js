import axios from "axios";
import { ElMessage } from "element-plus";
import { $t } from "@/languages/index.js";
const mobileApi = axios.create({
  baseURL: "/mobileapi",
  timeout: 600000,
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

// 删除课程列表
export function deleteCourse({ id }) {
  return mobileApi.delete(`/api/v1/course/delete/${id}`);
}
// 上传课程
export function createCourse(params) {
  return mobileApi.post(`/api/v1/course/add`, params);
}
// 修改课程
export function updateCourse(params) {
  return mobileApi.post(`/api/v1/course/update`, params);
}

// 获取课程详情
export function getCourseInfo(course_id) {
  return mobileApi.get(`/api/v1/course/info/${course_id}`);
}

/**
 * 上传学习资料文件
 * @param {FormData} formData - 包含文件和其他参数的FormData对象
 * @param {File} formData.file - 文件本身（必填）
 * @param {string} formData.title - 资料名称（必填）
 * @param {string} formData.description - 说明（选填）
 * @param {string} formData.category - 分类（选填）
 * @param {string} formData.course_id - 关联课程ID（选填）
 * @returns {Promise} 返回上传结果
 */
export function uploadMaterial(formData) {
  return mobileApi.post("/api/v1/materials/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    // 上传进度回调
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`上传进度: ${percentCompleted}%`);
    },
  });
}

// 获取资料列表
export function getMaterialList(parmas) {
  console.log("parmas", parmas);
  const upParams = {
    ...parmas,
    page: parmas.pageNum,
    page_size: parmas.pageSize,
  };
  if (upParams.title) {
    upParams.keyword = upParams.title;
    delete upParams.title;
  }
  delete upParams.pageSize;
  delete upParams.pageNum;
  return mobileApi.get("/api/v1/materials/list", { params: upParams });
}

// 编辑资料
export function updateMaterial(params) {
  return mobileApi.post("/api/v1/materials/update", { ...params });
}

// 删除资料
export function deleteMaterial({ id }) {
  return mobileApi.delete(`/api/v1/materials/delete/${id}`);
}

// oss上传文件
export function uploadOss(formData, onUploadProgress) {
  return mobileApi.post("/api/v1/oss/upload", formData, {
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

// 解析oss链接
export function getOssSign(params) {
  return mobileApi.post("/api/v1/oss/sign", { ...params });
}
