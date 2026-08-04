import { sopApi } from "@/services/sop.api";

const toCount = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const toQuestionTypeCounts = (counts = {}) => ({
  singleChoice: toCount(counts.single_choice),
  multipleChoice: toCount(counts.multiple_choice),
  trueFalse: toCount(counts.true_false),
  fillBlank: toCount(counts.fill_blank),
  shortAnswer: toCount(counts.short_answer),
  unknown: toCount(counts.unknown),
});

const questionMetrics = (counts) => {
  const choices = counts.singleChoice + counts.multipleChoice + counts.trueFalse;
  const candidates = [
    { label: "fillBlank", count: counts.fillBlank },
    { label: "choice", count: choices },
    { label: "shortAnswer", count: counts.shortAnswer },
    { label: "unknown", count: counts.unknown },
  ].filter((metric) => metric.count > 0);
  return [
    candidates[0] ?? { label: "fillBlank", count: 0 },
    candidates[1] ?? { label: "shortAnswer", count: 0 },
  ];
};

const toStatusKey = (value) =>
  value === "in_progress" ? "inProgress" : value === "completed" ? "completed" : "pending";

const toExamViewModel = (record) => {
  const questionTypeCounts = toQuestionTypeCounts(record.question_type_counts);
  const [firstMetric, secondMetric] = questionMetrics(questionTypeCounts);
  return {
    id: record.id,
    examCode: record.exam_code,
    title: record.title,
    description: record.description,
    examType: record.exam_type,
    statusKey: toStatusKey(record.display_status),
    examStatus: record.exam_status,
    primaryCategoryId: record.primary_category?.id ?? null,
    primaryCategoryName: record.primary_category?.name ?? null,
    primaryCategoryCode: record.primary_category?.code ?? null,
    secondaryCategoryId: record.secondary_category?.id ?? null,
    secondaryCategoryName: record.secondary_category?.name ?? null,
    secondaryCategoryCode: record.secondary_category?.code ?? null,
    questionTypeCounts,
    firstQuestionMetricLabel: firstMetric.label,
    firstQuestionMetricCount: firstMetric.count,
    secondQuestionMetricLabel: secondMetric.label,
    secondQuestionMetricCount: secondMetric.count,
    totalQuestionCount: toCount(record.total_question_count),
    durationMinutes: toCount(record.duration_minutes),
    totalScore: toCount(record.total_score),
    startTime: record.start_time,
    endTime: record.end_time,
    attemptCount: toCount(record.attempt_count),
    latestAttemptStatus: record.latest_attempt_status ?? null,
    currentAttemptId: record.current_attempt_id ?? null,
    allowRetake: Boolean(record.allow_retake),
    maxAttempts: record.max_attempts ?? null,
    remainingAttempts: record.remaining_attempts ?? null,
    disabledReason: record.disabled_reason ?? null,
    canStart: false,
    canContinue: false,
    canViewResult: false,
  };
};

const request = async (config) => {
  try {
    const response = await sopApi.request({ baseURL: "/exam-api", ...config });
    if (response.data?.code !== 0) {
      throw Object.assign(new Error(response.data?.message || "考试服务返回失败"), { response });
    }
    return response.data.data;
  } catch (error) {
    const body = error.response?.data;
    throw Object.assign(new Error(body?.detail || body?.message || error.message || "考试服务请求失败"), {
      status: error.response?.status,
      code: error.code,
    });
  }
};

const listParams = ({ page = 1, pageSize = 10, keyword, primaryCategoryId, secondaryCategoryId, status } = {}) => {
  const params = { page, page_size: pageSize };
  const normalizedKeyword = typeof keyword === "string" ? keyword.trim() : "";
  if (normalizedKeyword) params.keyword = normalizedKeyword;
  if (primaryCategoryId !== null && primaryCategoryId !== undefined && primaryCategoryId !== "") {
    params.primary_category_id = primaryCategoryId;
  }
  if (secondaryCategoryId !== null && secondaryCategoryId !== undefined && secondaryCategoryId !== "") {
    params.secondary_category_id = secondaryCategoryId;
  }
  if (status) params.status = status;
  return params;
};

export async function getUserExamList(options = {}) {
  const result = await request({ url: "/api/v1/user/exams", method: "get", params: listParams(options) });
  return {
    records: Array.isArray(result?.records) ? result.records.map(toExamViewModel) : [],
    total: toCount(result?.total),
    page: toCount(result?.page),
    pageSize: toCount(result?.page_size),
    totalPages: toCount(result?.total_pages),
  };
}

export async function getUserExamCounts(options = {}) {
  const params = listParams(options);
  delete params.page;
  delete params.page_size;
  delete params.status;
  const result = await request({ url: "/api/v1/user/exams/counts", method: "get", params });
  return {
    pending: toCount(result?.pending),
    inProgress: toCount(result?.in_progress),
    completed: toCount(result?.completed),
    total: toCount(result?.total),
  };
}

export async function getUserExamDetail(examId) {
  const result = await request({ url: `/api/v1/user/exams/${examId}`, method: "get" });
  return toExamViewModel(result);
}
