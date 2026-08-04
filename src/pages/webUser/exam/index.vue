<template>
  <WebPageContainer>
    <section class="web-exam-page" :aria-label="t('web.page.examTitle')">
      <section class="web-exam-surface web-exam-filter" :aria-labelledby="filterTitleId">
        <h1 :id="filterTitleId">{{ t("web.exam.filterTitle") }}</h1>

        <div class="web-exam-filter__categories" role="group" :aria-label="t('web.exam.filterTitle')">
          <el-button
            v-for="category in primaryCategories"
            :key="category.key"
            class="web-exam-filter__category"
            :class="{ 'is-active': selectedPrimaryCategoryKey === category.key }"
            :aria-pressed="selectedPrimaryCategoryKey === category.key"
            :disabled="examLoading"
            @click="selectCategory(category)"
          >
            {{ category.labelKey ? t(category.labelKey) : category.name }}
          </el-button>
        </div>

        <div
          v-if="secondaryCategories.length"
          class="web-exam-filter__secondary"
          role="group"
          :aria-label="selectedPrimaryCategory?.name"
        >
          <el-button
            class="web-exam-filter__secondary-button"
            :class="{ 'is-active': selectedSecondaryCategoryId === null }"
            :aria-pressed="selectedSecondaryCategoryId === null"
            :disabled="examLoading"
            @click="selectSecondaryCategory(null)"
          >
            {{ t("web.exam.category.allIn", { name: selectedPrimaryCategory.name }) }}
          </el-button>
          <el-button
            v-for="category in secondaryCategories"
            :key="category.id"
            class="web-exam-filter__secondary-button"
            :class="{ 'is-active': String(selectedSecondaryCategoryId) === String(category.id) }"
            :aria-pressed="String(selectedSecondaryCategoryId) === String(category.id)"
            :disabled="examLoading"
            @click="selectSecondaryCategory(category.id)"
          >
            {{ category.name }}
          </el-button>
        </div>

        <p v-if="categoryLoadFailed" class="web-exam-filter__category-error" role="status">
          {{ t("web.exam.categoryLoadFailed") }}
        </p>

        <div class="web-exam-filter__search-field">
          <label for="web-exam-keyword">{{ t("web.exam.keyword") }}</label>
          <div class="web-exam-filter__search">
            <el-input
              id="web-exam-keyword"
              v-model="keyword"
              :disabled="examLoading"
              :placeholder="t('web.exam.keywordPlaceholder')"
              @keyup.enter="applySearch"
            />
            <el-button type="primary" :loading="examLoading" @click="applySearch">
              {{ t("web.exam.search") }}
            </el-button>
            <el-button :disabled="examLoading" @click="resetFilters">
              {{ t("web.exam.reset") }}
            </el-button>
          </div>
        </div>
      </section>

      <section class="web-exam-status" role="tablist" :aria-label="t('web.exam.statusTitle')">
        <button
          v-for="status in statusTabs"
          :key="status.key"
          class="web-exam-status__item"
          :class="{ 'is-active': selectedStatusKey === status.key }"
          :aria-selected="selectedStatusKey === status.key"
          role="tab"
          type="button"
          :disabled="examLoading"
          @click="selectStatus(status.key)"
        >
          <span>{{ t(status.labelKey) }}</span>
          <strong>{{ displayStatusCount(status.key) }}</strong>
        </button>
      </section>

      <section v-loading="examLoading" class="web-exam-list" :aria-labelledby="listTitleId">
        <header class="web-exam-list__header">
          <h2 :id="listTitleId">{{ t("web.exam.listTitle") }}</h2>
          <span>{{ t("web.exam.total", { count: total }) }}</span>
        </header>

        <el-skeleton v-if="examLoading && !exams.length" :rows="6" animated />

        <el-result v-else-if="examLoadError" icon="error" :title="t('web.exam.loadFailed')" :sub-title="examLoadError.message">
          <template #extra>
            <el-button type="primary" :loading="examLoading" @click="loadExams">
              {{ t("web.common.retry") }}
            </el-button>
          </template>
        </el-result>

        <div v-else-if="exams.length" class="web-exam-list__grid">
          <ExamCard v-for="exam in exams" :key="exam.id" :exam="exam" />
        </div>

        <el-empty
          v-else
          :description="t(hasAppliedFilter ? 'web.exam.noMatchDescription' : 'web.exam.emptyDescription')"
        >
          <h3>{{ t(hasAppliedFilter ? "web.exam.noMatch" : "web.exam.empty") }}</h3>
        </el-empty>

        <el-pagination
          v-if="!examLoadError && !examLoading && total > 0 && totalPages > 0"
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          class="web-exam-list__pagination"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          :total="total"
          @current-change="loadExams"
          @size-change="handlePageSizeChange"
        />
      </section>
    </section>
  </WebPageContainer>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import WebPageContainer from "@/layouts/webUser/components/WebPageContainer.vue";
import ExamCard from "@/components/webUser/exam/ExamCard.vue";
import { getSopCategoryTree } from "@/services/sop.api";
import { getUserExamCounts, getUserExamList } from "@/services/webUser/exam.service";

const { t } = useI18n();

const filterTitleId = "web-exam-filter-title";
const listTitleId = "web-exam-list-title";

const categoryTree = ref([]);
const categoryLoadFailed = ref(false);
const selectedPrimaryCategoryKey = ref("all");
const selectedPrimaryCategoryId = ref(null);
const selectedSecondaryCategoryId = ref(null);
const selectedStatusKey = ref("pending");
const keyword = ref("");
const appliedKeyword = ref("");
const exams = ref([]);
const total = ref(0);
const totalPages = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const examLoading = ref(false);
const examLoadError = ref(null);
const statusCounts = ref({ pending: 0, inProgress: 0, completed: 0 });
let requestSequence = 0;

const primaryCategoryDefinitions = [
  { key: "product", labelKey: "web.practice.category.product", name: "产品" },
  { key: "operation", labelKey: "web.practice.category.operation", name: "运营" },
  { key: "technology", labelKey: "web.practice.category.technology", name: "技术" },
];

const primaryCategories = computed(() => [
  { key: "all", id: null, name: t("web.exam.category.all"), children: [] },
  ...primaryCategoryDefinitions.map((definition) => {
    const category = categoryTree.value.find((item) => item.name?.includes(definition.name));

    return {
      ...definition,
      id: category?.id ?? null,
      children: Array.isArray(category?.children) ? category.children : [],
    };
  }),
]);

const selectedPrimaryCategory = computed(() =>
  primaryCategories.value.find((category) => category.key === selectedPrimaryCategoryKey.value),
);

const secondaryCategories = computed(() => {
  const children = selectedPrimaryCategory.value?.children;
  return Array.isArray(children) ? children : [];
});

const statusTabs = [
  { key: "pending", labelKey: "web.exam.status.pending" },
  { key: "inProgress", labelKey: "web.exam.status.inProgress" },
  { key: "completed", labelKey: "web.exam.status.completed" },
];

const hasAppliedFilter = computed(
  () =>
    selectedPrimaryCategoryId.value !== null ||
    selectedSecondaryCategoryId.value !== null ||
    Boolean(appliedKeyword.value) ||
    selectedStatusKey.value !== "pending",
);

const displayStatusCount = (key) => {
  const value = Number(statusCounts.value[key]);
  return Number.isFinite(value) && value >= 0 ? value : "--";
};

const loadExams = async () => {
  const currentRequest = ++requestSequence;
  examLoading.value = true;
  examLoadError.value = null;

  try {
    const filters = {
      page: pageNum.value,
      pageSize: pageSize.value,
      keyword: appliedKeyword.value,
      primaryCategoryId: selectedPrimaryCategoryId.value,
      secondaryCategoryId: selectedSecondaryCategoryId.value,
    };
    const [listResult, countsResult] = await Promise.all([
      getUserExamList({
        ...filters,
        status: selectedStatusKey.value === "inProgress" ? "in_progress" : selectedStatusKey.value,
      }),
      getUserExamCounts(filters),
    ]);
    if (currentRequest !== requestSequence) return;
    exams.value = listResult.records;
    total.value = listResult.total;
    totalPages.value = listResult.totalPages;
    statusCounts.value = countsResult;
  } catch (error) {
    if (currentRequest !== requestSequence) return;
    examLoadError.value = error;
    console.error("Failed to load user exam list", { message: error?.message, status: error?.status });
  } finally {
    if (currentRequest === requestSequence) {
      examLoading.value = false;
    }
  }
};

const loadCategoryTree = async () => {
  try {
    const { data } = await getSopCategoryTree();
    if (data?.status && data.status !== 200) throw new Error(data?.message);

    categoryTree.value = Array.isArray(data?.results) ? data.results : [];
    categoryLoadFailed.value = false;
    if (selectedPrimaryCategoryKey.value !== "all") {
      pageNum.value = 1;
      loadExams();
    }
  } catch (error) {
    categoryTree.value = [];
    categoryLoadFailed.value = true;
    console.error("Failed to load exam category tree", error);
  }
};

const selectCategory = (category) => {
  selectedPrimaryCategoryKey.value = category.key;
  selectedPrimaryCategoryId.value = category.id;
  selectedSecondaryCategoryId.value = null;
  pageNum.value = 1;
  loadExams();
};

const selectSecondaryCategory = (categoryId) => {
  selectedSecondaryCategoryId.value = categoryId;
  pageNum.value = 1;
  loadExams();
};

const selectStatus = (statusKey) => {
  selectedStatusKey.value = statusKey;
  pageNum.value = 1;
  loadExams();
};

const applySearch = () => {
  appliedKeyword.value = keyword.value.trim();
  pageNum.value = 1;
  loadExams();
};

const resetFilters = () => {
  selectedPrimaryCategoryKey.value = "all";
  selectedPrimaryCategoryId.value = null;
  selectedSecondaryCategoryId.value = null;
  selectedStatusKey.value = "pending";
  keyword.value = "";
  appliedKeyword.value = "";
  pageNum.value = 1;
  loadExams();
};

const handlePageSizeChange = () => {
  pageNum.value = 1;
  loadExams();
};

onMounted(() => {
  loadCategoryTree();
  loadExams();
});
</script>

<style scoped lang="scss">
.web-exam-page {
  display: grid;
  gap: 18px;
}

.web-exam-surface {
  border: 1px solid var(--web-line);
  border-radius: 12px;
  background: var(--web-surface);
  box-shadow: 0 4px 14px rgba(31, 61, 96, 0.06);
}

.web-exam-filter {
  padding: 22px 24px 24px;

  h1,
  h2 {
    margin: 0;
    color: var(--web-text-primary);
    font-size: 18px;
    font-weight: 600;
    line-height: 1.4;
  }

  &__categories,
  &__secondary,
  &__search {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__categories {
    flex-wrap: wrap;
    margin-top: 16px;
  }

  &__category {
    margin: 0;
    border-color: var(--web-line);
    background: var(--web-surface);
    color: var(--web-text-secondary);

    &:hover:not(:disabled) {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }

    &.is-active {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary);
      color: var(--el-color-white);
    }
  }

  &__secondary {
    width: 100%;
    flex-wrap: wrap;
    margin-top: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    background: #f2f7fd;
  }

  &__secondary-button {
    height: 32px;
    margin: 0;
    padding: 0 14px;
    border-color: transparent;
    border-radius: 999px;
    background: var(--web-surface);
    color: var(--web-text-secondary);
    font-size: 12px;

    &:hover:not(:disabled),
    &.is-active {
      border-color: #bfdbfe;
      background: #eaf3ff;
      color: var(--el-color-primary);
    }
  }

  &__category-error {
    margin: 12px 0 0;
    color: var(--el-color-danger);
    font-size: 13px;
  }

  &__search-field {
    margin-top: 20px;

    label {
      color: var(--web-text-primary);
      font-size: 14px;
      line-height: 1.5;
    }
  }

  &__search {
    width: min(100%, 760px);
    margin-top: 10px;
    min-width: 0;

    :deep(.el-input) {
      min-width: 0;
    }
  }
}

.web-exam-status {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  width: min(100%, 480px);

  &__item {
    display: inline-flex;
    min-height: 40px;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 0 12px;
    border: 1px solid var(--web-line);
    border-radius: 10px;
    background: var(--web-surface);
    color: var(--web-text-secondary);
    cursor: pointer;
    font: inherit;
    transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;

    strong {
      color: var(--web-text-primary);
      font-weight: 600;
    }

    &:hover:not(:disabled),
    &.is-active {
      border-color: #bfdbfe;
      background: #eaf3ff;
      color: var(--el-color-primary);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }
}

.web-exam-list {
  min-height: 236px;
  padding: 4px 0 0;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;

    h2,
    span {
      margin: 0;
    }

    h2 {
      color: var(--web-text-primary);
      font-size: 18px;
      font-weight: 600;
    }

    span {
      color: var(--web-text-secondary);
      font-size: 13px;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  :deep(.el-empty) {
    min-height: 236px;
    border: 1px solid var(--web-line);
    border-radius: 12px;
    background: var(--web-surface);
    box-shadow: 0 4px 14px rgba(31, 61, 96, 0.04);
  }

  &__pagination {
    justify-content: flex-end;
    margin-top: 24px;
  }
}

@media (max-width: 1199px) {
  .web-exam-list__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 720px) {
  .web-exam-filter {
    padding: 20px;
  }

  .web-exam-filter__search-field {
    margin-top: 18px;
  }

  .web-exam-filter__search {
    flex-wrap: wrap;

    :deep(.el-input) {
      width: 100%;
    }
  }

  .web-exam-status {
    width: 100%;
  }
}
</style>
