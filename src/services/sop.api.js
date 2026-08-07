// src/services/sop.api.js
import axios from "axios";
import { ElMessage } from "element-plus";
import { $t } from "@/languages/index.js";

export const sopApi = axios.create({
  baseURL: "/sop-api",
  timeout: 60000,
});

// 请求拦截器，添加token
sopApi.interceptors.request.use(
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
sopApi.interceptors.response.use(
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

const api = sopApi;
// 生成 QA（支持多文件上传）
export async function generateQa(
  files,
  category_id,
  description,
) {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  form.append("category_id", category_id);
  if (description?.trim()) form.append("description", description.trim());

  return api.post("/v1/dataprep/generate_qa", form);
}

// 从资料管理中已上传的受控资料生成练习；不传递对象存储 URI 或文件内容。
export function generateQaFromMaterial({ material_id, category_id, description }) {
  return api.post("/v1/dataprep/generate_qa_from_material", {
    material_id,
    category_id,
    description: description?.trim() || undefined,
  });
}

// 轮询任务状态
export async function getTaskStatus(taskId) {
  const res = await api.post("/v1/dataprep/task_status", { task_id: taskId });
  return res;
}

/**
 * 轮询辅助：直到 judge 返回 true 或超时
 * @param {string} taskId
 * @param {{judge:(s:any)=>boolean, intervalMs:number, maxTimes:number}} opt
 */
export function pollTaskStatus(taskId, opt = {}) {
  const {
    judge = (s) => String(s).toUpperCase() !== "PENDING",
    intervalMs = 2000,
    maxTimes = 120,
  } = opt;
  return new Promise((resolve, reject) => {
    let times = 0;
    const timer = setInterval(async () => {
      try {
        times++;
        const { data } = await getTaskStatus(taskId);
        const status = typeof data === "string" ? data : (data?.status ?? data);
        if (judge(status) || times >= maxTimes) {
          clearInterval(timer);
          resolve(status);
        }
      } catch (e) {
        clearInterval(timer);
        reject(e);
      }
    }, intervalMs);
  });
}

// 拉取 SOP 列表（POST /v1/dataprep/sops?user_id=xxx）

// 拉取 SOP 列表（POST /v1/dataprep/sops）
// export async function getSops({
//   user_id = 'test_user',
//   page = 1,
//   pageSize = 10,
//   keyword = ''
// } = {}) {
//   return api.post('/v1/dataprep/sops', {
//     user_id,
//     page,
//     page_size: pageSize,
//     keyword: keyword.trim()
//   });
// }
export async function getSops(parmas) {
  const upParams = {
    ...parmas,
    page: parmas.pageNum,
    page_size: parmas.pageSize,
  };
  delete upParams.pageNum;
  delete upParams.pageSize;
  return api.post("/v1/dataprep/sops", upParams);
}

// SOP 两级分类树（考试管理与练习管理共用）。
export const getSopCategoryTree = () =>
  api.post("/v1/dataprep/sop/categories/tree");

// 拉取某个文件的 QA 列表（如果需要接入复核弹窗）
export const getQaList = (params) => {
  return api.post("/v1/dataprep/qa/list", params);
};
// 保存 QA（复核完成后）
export function saveQaList({ sop_info_id, file_name, records }) {
  return api.post("/v1/dataprep/qa/save", {
    sop_info_id,
    file_name,
    records,
  });
}

export const getPracticeReviewSource = (sopId) =>
  api.get(`/v1/dataprep/sops/${sopId}/source`);

export const getPracticeSourceFile = (sopId, download = false) =>
  api.get(`/v1/dataprep/sops/${sopId}/source-file`, {
    params: { download },
    responseType: "blob",
  });

// 删除某个 SOP 文件
export async function deleteSop(sop_record_id) {
  const res = await api.post("/v1/dataprep/delete_sop", {
    sop_record_id: sop_record_id,
  });
  return res;
}

// 更新 SOP 标题
export async function updateSopTitle(params) {
  return api.post("/v1/dataprep/sops/record/update", params);
}

// 获取有sop的公司部门岗位列表
export function getCascaderList(id) {
  return api.get(`/v1/dataprep/organization/${id}`);
}
