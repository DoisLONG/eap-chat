import axios from "axios";

const questionBankApi = axios.create({
  baseURL: "/questionbankapi",
  timeout: 15000,
});

questionBankApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function unwrap(response) {
  const payload = response.data;
  if (payload?.status !== 200) throw new Error(payload?.message || "题库数据读取失败");
  return payload.results;
}

export async function getQuestionBankCategories() {
  return unwrap(await questionBankApi.get("/v1/question-bank/categories"));
}

export async function getQuestionBankMaterials({ primaryCategory = "", secondaryCategory = "" } = {}) {
  return unwrap(
    await questionBankApi.get("/v1/question-bank/materials", {
      params: {
        primary_category_id: primaryCategory || undefined,
        secondary_category_id: secondaryCategory || undefined,
      },
    }),
  );
}

export async function getQuestionBankList({ filters = {}, page = 1, pageSize = 8 } = {}) {
  return unwrap(
    await questionBankApi.get("/v1/question-bank/questions", {
      params: {
        page,
        page_size: pageSize,
        keyword: filters.keyword?.trim() || undefined,
        primary_category_id: filters.primaryCategory || undefined,
        secondary_category_id: filters.secondaryCategory || undefined,
        material_id: filters.materialId || undefined,
        question_type: filters.type || undefined,
      },
    }),
  );
}

export async function getQuestionBankDetail(id) {
  return unwrap(await questionBankApi.get(`/v1/question-bank/questions/${id}`));
}

export async function updateQuestionBankItem(id, changes) {
  return unwrap(await questionBankApi.patch(`/v1/question-bank/questions/${id}`, changes));
}

export async function deleteQuestionBankItems(ids) {
  return unwrap(await questionBankApi.patch("/v1/question-bank/questions/batch-delete", { ids }));
}
