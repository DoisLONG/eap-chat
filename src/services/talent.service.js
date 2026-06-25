import axios from "axios";
import { ElMessage } from "element-plus";
import { $t } from "@/languages/index.js";

const talentApi = axios.create({
  baseURL: "/talentapi",
  timeout: 120000,
});

talentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

talentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      ElMessage.error({ message: $t("header.loginValidate") });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
    return Promise.reject(error);
  },
);

// 首页统计
export function getTalentDashboardSummary() {
  return talentApi.get("/v1/talent/dashboard/summary");
}

// 岗位列表
export function getTalentPositionList(params) {
  return talentApi.get("/v1/talent/positions", {
    params: cleanQueryParams(params),
  });
}

// 新增岗位
export function addTalentPosition(params) {
  return talentApi.post("/v1/talent/positions", params);
}

// 岗位详情
export function getTalentPositionDetail(positionId) {
  return talentApi.get(`/v1/talent/positions/${positionId}`);
}

// 编辑岗位
export function updateTalentPosition(positionId, params) {
  return talentApi.put(`/v1/talent/positions/${positionId}`, params);
}

// 修改岗位状态
export function updateTalentPositionStatus(positionId, status) {
  return talentApi.post(`/v1/talent/positions/${positionId}/status`, {
    status,
  });
}

// 上传简历
export function uploadTalentResume(formData) {
  return talentApi.post("/v1/talent/resumes/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// 简历列表
function cleanQueryParams(params = {}) {
  const result = {};

  Object.keys(params).forEach((key) => {
    const value = params[key];

    // 空字符串、null、undefined 都不传给后端
    if (value === "" || value === null || value === undefined) return;

    result[key] = value;
  });

  return result;
}

export function getTalentResumeList(params) {
  return talentApi.get("/v1/talent/resumes", {
    params: cleanQueryParams(params),
  });
}

// 简历详情
export function getTalentResumeDetail(resumeId) {
  return talentApi.get(`/v1/talent/resumes/${resumeId}`);
}

// 查询处理状态
export function getTalentResumeProcessStatus(resumeId) {
  return talentApi.get(`/v1/talent/resumes/${resumeId}/process-status`);
}

// 删除简历
export function deleteTalentResume(resumeId) {
  return talentApi.delete(`/v1/talent/resumes/${resumeId}`);
}

// 重新解析
export function reparseTalentResume(resumeId) {
  return talentApi.post(`/v1/talent/resumes/${resumeId}/reparse`);
}

// 查询面试包
export function getTalentInterviewPackage(resumeId) {
  return talentApi.get(`/v1/talent/interviews/${resumeId}`);
}

// 查询面试题列表
export function getTalentInterviewQuestions(resumeId, params) {
  return talentApi.get(`/v1/talent/interviews/${resumeId}/questions`, {
    params,
  });
}

// 保存面试结果
export function saveTalentInterviewResult(resumeId, params) {
  return talentApi.post(`/v1/talent/interviews/${resumeId}/result`, params);
}

// 重新生成题目
export function regenerateTalentQuestions(resumeId) {
  return talentApi.post(`/v1/talent/interviews/${resumeId}/questions/regenerate`);
}