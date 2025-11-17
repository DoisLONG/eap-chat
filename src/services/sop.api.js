// src/services/sop.api.js
import axios from "axios";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

const router = useRouter();

const api = axios.create({
  baseURL: "/sop-api",
  timeout: 60000,
});

// 请求拦截器，添加token
api.interceptors.request.use(
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
api.interceptors.response.use(
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
// 生成 QA（支持多文件上传）
export async function generateQa(files, file_type, position_id) {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  form.append("file_type", file_type);
  form.append("position_id", position_id);

  return axios.post("/sop-api/v1/dataprep/generate_qa", form);
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
        const status = typeof data === "string" ? data : data?.status ?? data;
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

// 拉取某个文件的 QA 列表（如果需要接入复核弹窗）
export const getQaList = (params) => {
  return api.post("/v1/dataprep/qa/list", params);
};
// 保存 QA（复核完成后）
export async function saveQaList(fileName, records) {
  return api.post("/v1/dataprep/qa/save", {
    file_name: fileName,
    records,
  });
}

// 删除某个 SOP 文件
export async function deleteSop(fileName) {
  const res = await api.post("/v1/dataprep/delete_sop", {
    file_name: fileName,
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
