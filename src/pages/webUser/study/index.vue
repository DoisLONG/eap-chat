<template>
  <WebPageContainer>
    <section class="study-filter">
      <h2 class="filter-title">{{ t("web.study.filterTitle") }}</h2>

      <div
        class="filter-category-row"
        :class="{ 'has-subcategory': subCategoryOptions.length }"
      >
        <span class="filter-label">{{ t("web.study.categoryLabel") }}：</span>
        <div class="category-options">
          <el-button
            v-for="item in primaryCategoryOptions"
            :key="item.value"
            class="category-button"
            :class="{ 'is-active': filters.category === item.value }"
            :disabled="loading"
            @click="changeCategory(item.value)"
          >
            {{ item.label }}
          </el-button>
        </div>
      </div>

      <div v-if="subCategoryOptions.length" class="filter-subcategory-row">
        <el-button
          v-for="item in subCategoryOptions"
          :key="item.value"
          class="subcategory-button"
          :class="{ 'is-active': filters.categoryId === item.value }"
          :disabled="loading"
          @click="changeSubCategory(item.value)"
        >
          {{ item.label }}
        </el-button>
      </div>

      <div class="filter-search-row">
        <div class="name-filter">
          <label class="filter-label" for="study-material-name-filter">
            {{ t("web.study.nameLabel") }}：
          </label>
          <el-input
            id="study-material-name-filter"
            v-model="keyword"
            class="name-filter-input"
            :placeholder="t('web.study.searchPlaceholder')"
            clearable
            :disabled="loading"
            @keyup.enter="applySearch"
            @clear="applySearch"
          />
        </div>
        <div class="filter-actions">
          <el-button
            type="primary"
            :icon="Search"
            :loading="loading"
            :disabled="loading"
            @click="applySearch"
          >
            {{ t("common.search") }}
          </el-button>
          <el-button
            :icon="RefreshLeft"
            :disabled="loading"
            @click="resetFilters"
          >
            {{ t("common.reset") }}
          </el-button>
        </div>
      </div>
    </section>

    <section class="study-content" aria-live="polite">
      <header class="study-content__header">
        <h2>{{ t("web.study.resourceList") }}</h2>
        <span>{{ t("web.study.resourceCount", { count: total }) }}</span>
      </header>

      <div v-if="loading" class="study-grid">
        <div v-for="index in pageSize" :key="index" class="study-card study-card--loading">
          <el-skeleton animated :rows="4" />
        </div>
      </div>

      <el-result
        v-else-if="loadFailed"
        icon="error"
        :title="t('web.study.loadFailed')"
        :sub-title="t('web.study.loadFailedHint')"
      >
        <template #extra>
          <el-button
            type="primary"
            :loading="loading"
            :disabled="loading"
            @click="loadMaterials"
          >
            {{ t("web.common.retry") }}
          </el-button>
        </template>
      </el-result>

      <el-empty v-else-if="!materials.length" :description="t('web.study.empty')" />

      <template v-else>
        <div class="study-grid">
          <article v-for="item in materials" :key="item.id" class="study-card">
            <div class="study-card__heading">
              <div class="study-card__icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="study-card__title-wrap">
                <h3>{{ item.title || t("web.study.untitled") }}</h3>
                <el-tag v-if="item.fileType" size="small" effect="plain">
                  {{ item.fileType.toUpperCase() }}
                </el-tag>
              </div>
              <span class="study-card__size">{{ formatFileSize(item.size) }}</span>
            </div>

            <p class="study-card__description">
              {{ item.description || t("web.study.noDescription") }}
            </p>

            <div class="study-card__categories">
              <el-tag
                v-if="item.category"
                size="small"
                effect="light"
                :type="categoryTagType[item.category] || 'info'"
              >
                {{ categoryLabelMap[item.category] || item.category }}
              </el-tag>
              <el-tag v-if="item.subCategoryName" size="small" type="info" effect="plain">
                {{ item.subCategoryName }}
              </el-tag>
              <span v-if="!item.category && !item.subCategoryName">
                {{ t("web.study.uncategorized") }}
              </span>
            </div>

            <footer class="study-card__footer">
              <span>{{ formatDate(item.createdAt) }}</span>
              <el-button
                type="primary"
                link
                :disabled="previewVisible"
                @click="openPreview(item)"
              >
                {{ t("web.study.view") }}
              </el-button>
            </footer>
          </article>
        </div>

        <el-pagination
          v-if="total > pageSize"
          class="study-pagination"
          background
          layout="prev, pager, next"
          :current-page="pageNum"
          :page-size="pageSize"
          :total="total"
          :disabled="loading"
          @current-change="changePage"
        />
      </template>
    </section>

    <OfficeCheck
      v-if="previewVisible"
      :file-title="previewFileTitle"
      :file-type="previewFileType"
      :file-src="previewFileSrc"
      @close="previewVisible = false"
    />
  </WebPageContainer>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { Document, RefreshLeft, Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import WebPageContainer from "@/layouts/webUser/components/WebPageContainer.vue";
import OfficeCheck from "@/pages/knowledgeManagement/materialLibrary/components/officeCheck.vue";
import { joinUrl } from "@/utils";
import { getStudyMaterialList } from "@/services/webUser/study.service";
import { formatDate } from "@/utils/dateFormat";

const { t } = useI18n();

const keyword = ref("");
const filters = reactive({ category: "", categoryId: "" });
const pageNum = ref(1);
const pageSize = 9;
const total = ref(0);
const materials = ref([]);
const loading = ref(false);
const loadFailed = ref(false);
const previewVisible = ref(false);
const previewFileTitle = ref("");
const previewFileType = ref("");
const previewFileSrc = ref("");

const categoryOptions = computed(() => [
  {
    label: t("web.study.product"),
    value: "产品",
    allLabel: t("web.study.allProducts"),
    children: [
      { label: t("web.study.aiPortal"), value: 13 },
      { label: t("web.study.aiHub"), value: 14 },
      { label: t("web.study.beat"), value: 15 },
      { label: t("web.study.bams"), value: 16 },
    ],
  },
  {
    label: t("web.study.operations"),
    value: "运营",
    allLabel: t("web.study.allOperations"),
    children: [{ label: t("web.study.companyArticles"), value: 17 }],
  },
  {
    label: t("web.study.technology"),
    value: "技术",
    allLabel: t("web.study.allTechnology"),
    children: [{ label: t("web.study.k8s"), value: 18 }],
  },
]);

const primaryCategoryOptions = computed(() => [
  { label: t("web.study.allCategories"), value: "" },
  ...categoryOptions.value.map(({ label, value }) => ({ label, value })),
]);

const subCategoryOptions = computed(() => {
  const activeCategory = categoryOptions.value.find(
    (item) => item.value === filters.category,
  );
  if (!activeCategory) return [];
  return [
    { label: activeCategory.allLabel, value: "" },
    ...activeCategory.children,
  ];
});

const categoryLabelMap = computed(() =>
  Object.fromEntries(categoryOptions.value.map((item) => [item.value, item.label])),
);

const categoryTagType = {
  产品: "primary",
  运营: "warning",
  技术: "success",
};

const formatFileSize = (size) => {
  const bytes = Number(size);
  if (!Number.isFinite(bytes) || bytes <= 0) return "-";
  if (bytes < 1024) return `${bytes.toFixed(1)} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
};

const openPreview = (item) => {
  if (previewVisible.value) return;
  if (!item.fileUrl) {
    ElMessage.warning(t("web.study.previewUnavailable"));
    return;
  }
  previewFileTitle.value = item.title || t("web.study.untitled");
  previewFileType.value = item.fileType || "";
  previewFileSrc.value = joinUrl("/mobileapi", item.fileUrl);
  previewVisible.value = true;
};

const loadMaterials = async () => {
  if (loading.value) return;
  loading.value = true;
  loadFailed.value = false;
  try {
    const result = await getStudyMaterialList({
      pageNum: pageNum.value,
      pageSize,
      keyword: keyword.value.trim(),
      category: filters.category,
      categoryId: filters.categoryId,
    });
    materials.value = result.items;
    total.value = result.total;
  } catch {
    materials.value = [];
    total.value = 0;
    loadFailed.value = true;
  } finally {
    loading.value = false;
  }
};

const resetPageAndLoad = () => {
  pageNum.value = 1;
  loadMaterials();
};

const applySearch = () => resetPageAndLoad();

const resetFilters = () => {
  keyword.value = "";
  filters.category = "";
  filters.categoryId = "";
  resetPageAndLoad();
};

const changeCategory = (category) => {
  if (filters.category === category) return;
  filters.category = category;
  filters.categoryId = "";
  resetPageAndLoad();
};

const changeSubCategory = (categoryId) => {
  if (filters.categoryId === categoryId) return;
  filters.categoryId = categoryId;
  resetPageAndLoad();
};

const changePage = (page) => {
  pageNum.value = page;
  loadMaterials();
};

onMounted(loadMaterials);
</script>

<style scoped lang="scss">
.study-content {
  border: 1px solid var(--web-line);
  border-radius: 12px;
  background: var(--web-surface);
  box-shadow: 0 4px 14px rgba(31, 61, 96, 0.06);
}

.study-filter {
  box-sizing: border-box;
  width: 100%;
  padding: 20px 24px;
  overflow: hidden;
  border: 1px solid var(--web-line);
  border-radius: 8px;
  background: var(--web-surface);
  box-shadow: 0 2px 10px rgb(0 0 0 / 4%);
}

.filter-title {
  margin: 0 0 18px;
  color: var(--web-text-primary);
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
}

.filter-category-row,
.filter-subcategory-row,
.filter-search-row,
.name-filter,
.category-options,
.filter-actions {
  display: flex;
  align-items: center;
}

.filter-category-row {
  gap: 16px;
  margin-bottom: 20px;

  &.has-subcategory {
    margin-bottom: 12px;
  }
}

.filter-label {
  flex: 0 0 128px;
  color: var(--web-text-secondary);
  font-size: 14px;
  line-height: 32px;
  white-space: nowrap;
}

.category-options {
  min-width: 0;
  flex-wrap: wrap;
  gap: 10px;
}

.category-button {
  height: 36px;
  padding: 0 20px;
  margin-left: 0;
  border-color: transparent;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  color: var(--web-text-primary);

  &:hover,
  &:focus-visible {
    border-color: var(--el-color-primary-light-7);
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }

  &.is-active {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary);
    color: var(--el-color-white);
  }
}

.filter-subcategory-row {
  min-width: 0;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}

.subcategory-button {
  height: 32px;
  padding: 0 16px;
  margin-left: 0;
  border-color: var(--el-border-color);
  border-radius: 999px;
  background: var(--web-surface);
  color: var(--web-text-primary);

  &:hover,
  &:focus-visible,
  &.is-active {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

.filter-search-row {
  min-width: 0;
  justify-content: space-between;
  gap: 20px;
}

.name-filter {
  flex: 1 1 auto;
  min-width: 0;
  gap: 16px;

  .filter-label {
    flex-basis: auto;
  }
}

.name-filter-input {
  width: 340px;
  max-width: 100%;
}

.filter-actions {
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 12px;
  margin-left: auto;

  .el-button {
    min-width: 80px;
    margin-left: 0;
  }
}

.study-content {
  min-height: 360px;
  padding: 24px;
  margin-top: 20px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: var(--web-text-primary);
      font-size: 18px;
      font-weight: 600;
    }

    span {
      color: var(--web-text-secondary);
      font-size: 13px;
    }
  }
}

.study-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.study-card {
  display: flex;
  min-width: 0;
  min-height: 230px;
  flex-direction: column;
  padding: 20px;
  border: 1px solid var(--web-line);
  border-radius: 12px;
  background: var(--web-surface);
  box-shadow: 0 4px 14px rgba(31, 61, 96, 0.06);

  &--loading {
    min-height: 230px;
  }

  &__heading {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  &__icon {
    display: grid;
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    place-items: center;
    border-radius: 10px;
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);

    .el-icon {
      font-size: 21px;
    }
  }

  &__title-wrap {
    min-width: 0;
    flex: 1;

    h3 {
      margin: 0 0 8px;
      overflow: hidden;
      color: var(--web-text-primary);
      font-size: 16px;
      font-weight: 600;
      line-height: 22px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__size {
    flex: 0 0 auto;
    margin-left: auto;
    color: var(--web-text-secondary);
    font-size: 12px;
    line-height: 20px;
    text-align: right;
    white-space: nowrap;
  }

  &__description {
    display: -webkit-box;
    min-height: 44px;
    margin: 18px 0 16px;
    overflow: hidden;
    color: var(--web-text-secondary);
    font-size: 14px;
    line-height: 22px;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  &__categories {
    display: flex;
    min-height: 24px;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;

    > span:not(.el-tag) {
      color: var(--web-text-secondary);
      font-size: 13px;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-top: 14px;
    margin-top: auto;
    border-top: 1px solid var(--web-line);

    > span:first-child {
      color: var(--web-text-secondary);
      font-size: 13px;
    }
  }
}

.study-pagination {
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 1199px) {
  .study-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .study-filter {
    padding: 18px 16px;
  }

  .filter-category-row,
  .filter-search-row,
  .name-filter {
    align-items: flex-start;
  }

  .filter-category-row {
    gap: 8px 12px;
  }

  .filter-search-row {
    flex-wrap: wrap;
  }

  .name-filter,
  .filter-actions {
    flex: 1 1 100%;
  }

  .name-filter-input {
    flex: 1 1 auto;
    width: auto;
  }

  .study-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

:deep(.el-result__subtitle p) {
  color: var(--web-text-secondary);
}
</style>
