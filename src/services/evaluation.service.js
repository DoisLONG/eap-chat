import axios from "axios";

const evaluationApi = axios.create({
  baseURL: "/question-bank-evaluate-api",
  timeout: 15000,
});

evaluationApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function unwrap(response) {
  const payload = response.data;
  if (payload?.status !== 200) throw new Error(payload?.message || "评价数据读取失败");
  return payload.results;
}

export async function getEvaluationCategories() {
  return unwrap(await evaluationApi.get("/v1/evaluations/categories"));
}

export async function getEvaluationExams({ primaryCategory = "", secondaryCategory = "" } = {}) {
  return unwrap(
    await evaluationApi.get("/v1/evaluations/exams", {
      params: {
        primary_category_id: primaryCategory || undefined,
        secondary_category_id: secondaryCategory || undefined,
      },
    }),
  );
}

export async function getEvaluationList({ filters = {}, page = 1, pageSize = 8 } = {}) {
  return unwrap(
    await evaluationApi.get("/v1/evaluations", {
      params: {
        page,
        page_size: pageSize,
        employee_name: filters.employeeName?.trim() || undefined,
        primary_category_id: filters.primaryCategory || undefined,
        secondary_category_id: filters.secondaryCategory || undefined,
        exam_id: filters.examId || undefined,
        status: filters.status || undefined,
      },
    }),
  );
}

export async function getEvaluationDetail(id) {
  return unwrap(await evaluationApi.get(`/v1/evaluations/${id}`));
}

export async function deleteEvaluationItems(ids) {
  return unwrap(await evaluationApi.patch("/v1/evaluations/batch-delete", { ids }));
}
