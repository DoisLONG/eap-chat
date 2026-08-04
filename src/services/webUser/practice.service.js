import { sopApi } from "@/services/sop.api";

const toCount = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const toCategory = (category) =>
  category === null ? null : { id: category.id, name: category.name };

const toPracticeViewModel = (record) => ({
  id: record.id,
  sopId: record.sop_id,
  sopName: record.sop_name,
  title: record.title,
  description: record.description,
  version: record.version,
  primaryCategory: toCategory(record.primary_category),
  secondaryCategory: toCategory(record.secondary_category),
  fillBlankCount: toCount(record.fill_blank_count),
  answerCount: toCount(record.answer_count),
  totalQuestions: toCount(record.total_questions),
  estimatedMinutes: record.estimated_minutes,
  progressPercent: record.progress_percent,
});

export async function getUserPracticeList({
  page = 1,
  pageSize = 20,
  keyword,
  primaryCategoryId,
  secondaryCategoryId,
} = {}) {
  const params = {
    page,
    page_size: pageSize,
  };
  const normalizedKeyword = typeof keyword === "string" ? keyword.trim() : "";

  if (normalizedKeyword) params.keyword = normalizedKeyword;
  if (primaryCategoryId !== null && primaryCategoryId !== undefined && primaryCategoryId !== "") {
    params.primary_category_id = primaryCategoryId;
  }
  if (secondaryCategoryId !== null && secondaryCategoryId !== undefined && secondaryCategoryId !== "") {
    params.secondary_category_id = secondaryCategoryId;
  }

  const { data } = await sopApi.get("/v1/dataprep/user/practices", { params });
  if (data?.status !== 200) {
    const error = new Error(data?.message || "User practice list request failed");
    error.status = data?.status;
    throw error;
  }

  const result = data.results || {};
  return {
    records: Array.isArray(result.records) ? result.records.map(toPracticeViewModel) : [],
    total: toCount(result.total),
    page: toCount(result.page),
    pageSize: toCount(result.page_size),
    totalPages: toCount(result.total_pages),
  };
}
