import { getQaList, getSopCategoryTree, getSops } from "@/services/sop.api";

export { getQaList, getSopCategoryTree, getSops };

export const EXAM_API_UNAVAILABLE = "EXAM_API_UNAVAILABLE";
const unsupported = () =>
  Promise.reject(Object.assign(new Error(EXAM_API_UNAVAILABLE), { code: EXAM_API_UNAVAILABLE }));

// 统一出口：后端契约确认后只在本文件替换实现，页面不伪造持久化结果。
export const getExamList = unsupported;
export const saveExam = unsupported;
export const deleteExam = unsupported;
