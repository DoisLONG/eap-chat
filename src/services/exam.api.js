import { getSopCategoryTree, getSops, sopApi } from "@/services/sop.api";

export { getSopCategoryTree, getSops };

async function request(config) {
  try {
    const response = await sopApi.request({ baseURL: "/exam-api", ...config });
    if (response.data?.code !== 0) throw Object.assign(new Error(response.data?.message || "考试服务返回失败"), { response });
    return response.data.data;
  } catch (error) {
    const body = error.response?.data;
    throw Object.assign(new Error(body?.detail || body?.message || error.message || "考试服务请求失败"), { status: error.response?.status, code: error.code });
  }
}

export const getExamList = (params) => request({ url: "/api/v1/exams", method: "get", params });
export const getExamDetail = (id) => request({ url: `/api/v1/exams/${id}`, method: "get" });
export const createExam = (data) => request({ url: "/api/v1/exams", method: "post", data });
export const updateExam = (id, data) => request({ url: `/api/v1/exams/${id}`, method: "put", data });
export const saveExamSources = (id, data) => request({ url: `/api/v1/exams/${id}/sources`, method: "put", data });
export const saveExamRules = (id, data) => request({ url: `/api/v1/exams/${id}/rules`, method: "put", data });
export const saveExamTargets = (id, data) => request({ url: `/api/v1/exams/${id}/targets`, method: "put", data });
export const publishExam = (id) => request({ url: `/api/v1/exams/${id}/publish`, method: "post" });
export const deleteExam = (id) => request({ url: `/api/v1/exams/${id}`, method: "delete" });
