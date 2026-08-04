import { getMaterialList } from "@/services/mobile.service";

const toStudyMaterial = (material) => ({
  id: material.material_id,
  title: material.title,
  description: material.description,
  fileType: material.file_type,
  fileUrl: material.file_url,
  category: material.category,
  subCategoryName: material.sub_category_name,
  size: material.size,
  createdAt: material.created_at,
});

export async function getStudyMaterialList({
  pageNum,
  pageSize,
  keyword,
  category,
  categoryId,
}) {
  const params = { pageNum, pageSize };
  if (keyword) params.title = keyword;
  if (category) params.category = category;
  if (categoryId !== "") params.category_id = categoryId;

  const response = await getMaterialList(params);
  const payload = response.data?.data;
  if (!Array.isArray(payload?.items) || !Number.isFinite(Number(payload.total))) {
    throw new Error("Invalid study material list response");
  }

  return {
    items: payload.items.map(toStudyMaterial),
    total: Number(payload.total),
  };
}
