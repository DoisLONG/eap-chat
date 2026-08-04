<template>
  <WebPageContainer>
    <section class="web-practice-page" :aria-label="t('web.page.practiceTitle')">
      <section class="web-practice-surface web-practice-filter" :aria-labelledby="filterTitleId">
        <h1 :id="filterTitleId">{{ t("web.practice.filterTitle") }}</h1>

        <div class="web-practice-filter__controls">
          <div class="web-practice-filter__categories" role="group" :aria-label="t('web.practice.filterTitle')">
            <el-button
              v-for="category in primaryCategories"
              :key="category.key"
              class="web-practice-filter__category"
              :class="{ 'is-active': selectedPrimaryCategory === category.key }"
              :aria-pressed="selectedPrimaryCategory === category.key"
              @click="selectPrimaryCategory(category.key)"
            >
              {{ t(category.labelKey) }}
            </el-button>
          </div>

          <div v-if="secondaryCategories.length" class="web-practice-filter__secondary" role="group">
            <el-button
              class="web-practice-filter__secondary-button"
              :class="{ 'is-active': !selectedSecondaryCategoryId }"
              :aria-pressed="!selectedSecondaryCategoryId"
              @click="selectSecondaryCategory(null)"
            >
              {{ t("web.practice.category.all") }}
            </el-button>
            <el-button
              v-for="category in secondaryCategories"
              :key="category.id"
              class="web-practice-filter__secondary-button"
              :class="{ 'is-active': String(selectedSecondaryCategoryId) === String(category.id) }"
              :aria-pressed="String(selectedSecondaryCategoryId) === String(category.id)"
              @click="selectSecondaryCategory(category.id)"
            >
              {{ category.name }}
            </el-button>
          </div>

          <p v-if="categoryLoadFailed" class="web-practice-filter__category-error" role="status">
            {{ t("web.practice.categoryLoadFailed") }}
          </p>

          <div class="web-practice-filter__search-field">
            <label for="web-practice-keyword">{{ t("web.practice.keyword") }}</label>
            <div class="web-practice-filter__search">
              <el-input
                id="web-practice-keyword"
                v-model="keyword"
                :placeholder="t('web.practice.keywordPlaceholder')"
                @keyup.enter="applySearch"
              />
              <el-button type="primary" @click="applySearch">
                {{ t("web.practice.search") }}
              </el-button>
            </div>
          </div>
        </div>
      </section>

      <section class="web-practice-surface web-practice-comprehensive" :aria-labelledby="comprehensiveTitleId">
        <div class="web-practice-comprehensive__main">
          <h2 :id="comprehensiveTitleId">{{ t("web.practice.comprehensive.title") }}</h2>
          <p>{{ t("web.practice.comprehensive.description") }}</p>

          <dl>
            <div>
              <dt>{{ t("web.practice.fillBlankCount") }}</dt>
              <dd>--</dd>
            </div>
            <div>
              <dt>{{ t("web.practice.answerCount") }}</dt>
              <dd>--</dd>
            </div>
            <div>
              <dt>{{ t("web.practice.estimatedMinutes") }}</dt>
              <dd>--</dd>
            </div>
          </dl>
        </div>
        <el-button type="primary" @click="notifyComprehensiveUnavailable">
          {{ t("web.practice.comprehensive.start") }}
        </el-button>
      </section>

      <section
        v-loading="practiceLoading"
        class="web-practice-surface web-practice-list"
        :aria-labelledby="listTitleId"
      >
        <header class="web-practice-list__header">
          <h2 :id="listTitleId">{{ t("web.practice.listTitle") }}</h2>
          <span>{{ t("web.practice.total", { count: total }) }}</span>
        </header>

        <el-skeleton v-if="practiceLoading && !practices.length" class="web-practice-list__loading" :rows="6" animated />

        <el-result
          v-else-if="practiceLoadError"
          class="web-practice-list__result"
          icon="error"
          :title="t(practiceErrorTitleKey)"
        >
          <template #extra>
            <el-button type="primary" :loading="practiceLoading" @click="loadPractices">
              {{ t("web.common.retry") }}
            </el-button>
          </template>
        </el-result>

        <div v-else-if="practices.length" class="web-practice-list__grid">
          <PracticeCard
            v-for="practice in practices"
            :key="practice.id"
            :practice="practice"
            @start="startPractice"
          />
        </div>

        <el-empty
          v-else
          class="web-practice-list__empty"
          :description="t(hasAppliedFilter ? 'web.practice.noMatchDescription' : 'web.practice.emptyDescription')"
        >
          <template #image>
            <div class="web-practice-list__empty-icon" aria-hidden="true">
              <el-icon><Document /></el-icon>
            </div>
          </template>
          <h3>{{ t(hasAppliedFilter ? "web.practice.noMatch" : "web.practice.empty") }}</h3>
        </el-empty>

        <el-pagination
          v-if="!practiceLoadError && !practiceLoading && total > 0 && totalPages > 0"
          v-model:current-page="page"
          v-model:page-size="pageSize"
          class="web-practice-list__pagination"
          :total="total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadPractices"
          @size-change="handlePageSizeChange"
        />
      </section>
    </section>
  </WebPageContainer>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Document } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import WebPageContainer from "@/layouts/webUser/components/WebPageContainer.vue";
import { getSopCategoryTree } from "@/services/sop.api";
import { getUserPracticeList } from "@/services/webUser/practice.service";
import PracticeCard from "./components/PracticeCard.vue";

const { t } = useI18n();
const router = useRouter();
const filterTitleId = "web-practice-filter-title";
const comprehensiveTitleId = "web-practice-comprehensive-title";
const listTitleId = "web-practice-list-title";

const primaryCategoryDefinitions = [
  { key: "product", labelKey: "web.practice.category.product", name: "产品" },
  { key: "operation", labelKey: "web.practice.category.operation", name: "运营" },
  { key: "technology", labelKey: "web.practice.category.technology", name: "技术" },
];

const categoryTree = ref([]);
const categoryLoadFailed = ref(false);
const selectedPrimaryCategory = ref("all");
const selectedSecondaryCategoryId = ref(null);
const keyword = ref("");
const appliedKeyword = ref("");
const practices = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const totalPages = ref(0);
const practiceLoading = ref(false);
const practiceLoadError = ref(null);
let practiceRequestSequence = 0;

const primaryCategories = computed(() => [
  { key: "all", labelKey: "web.practice.category.all", id: null, children: [] },
  ...primaryCategoryDefinitions.map((definition) => {
    const category = categoryTree.value.find((item) => item.name?.includes(definition.name));

    return {
      ...definition,
      id: category?.id ?? null,
      children: Array.isArray(category?.children) ? category.children : [],
    };
  }),
]);

const selectedPrimaryCategoryData = computed(() =>
  primaryCategories.value.find((category) => category.key === selectedPrimaryCategory.value),
);

const selectedPrimaryCategoryId = computed(
  () => selectedPrimaryCategoryData.value?.id ?? null,
);

const secondaryCategories = computed(
  () => selectedPrimaryCategoryData.value?.children || [],
);

const hasAppliedFilter = computed(
  () =>
    selectedPrimaryCategory.value !== "all" ||
    Boolean(selectedSecondaryCategoryId.value) ||
    Boolean(appliedKeyword.value),
);

const practiceErrorTitleKey = computed(() => {
  const status = Number(practiceLoadError.value?.response?.status || practiceLoadError.value?.status);
  if (status === 403) return "web.practice.forbidden";
  if (status === 401) return "web.practice.loginRequired";
  return "web.practice.loadFailed";
});

const loadPractices = async () => {
  const requestSequence = ++practiceRequestSequence;
  practiceLoading.value = true;
  practiceLoadError.value = null;
  practices.value = [];
  total.value = 0;
  totalPages.value = 0;

  try {
    const result = await getUserPracticeList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: appliedKeyword.value,
      primaryCategoryId: selectedPrimaryCategoryId.value,
      secondaryCategoryId: selectedSecondaryCategoryId.value,
    });
    if (requestSequence !== practiceRequestSequence) return;

    practices.value = result.records;
    total.value = result.total;
    page.value = result.page;
    pageSize.value = result.pageSize;
    totalPages.value = result.totalPages;
  } catch (error) {
    if (requestSequence !== practiceRequestSequence) return;

    practiceLoadError.value = error;
    practices.value = [];
    total.value = 0;
    totalPages.value = 0;
    console.error("Failed to load user practice list", error);
  } finally {
    if (requestSequence === practiceRequestSequence) {
      practiceLoading.value = false;
    }
  }
};

const selectPrimaryCategory = (categoryKey) => {
  selectedPrimaryCategory.value = categoryKey;
  selectedSecondaryCategoryId.value = null;
  page.value = 1;
  loadPractices();
};

const selectSecondaryCategory = (categoryId) => {
  selectedSecondaryCategoryId.value = categoryId;
  page.value = 1;
  loadPractices();
};

const applySearch = () => {
  appliedKeyword.value = keyword.value.trim();
  page.value = 1;
  loadPractices();
};

const handlePageSizeChange = () => {
  page.value = 1;
  loadPractices();
};

const notifyComprehensiveUnavailable = () => {
  ElMessage.info(t("web.practice.comprehensive.unavailable"));
};

const startPractice = (practice) => {
  const sopId = String(practice?.sopId || "").trim();
  const sopName = String(practice?.sopName || "").trim();

  if (!sopId || !sopName) {
    ElMessage.warning(t("web.practice.invalidEntry"));
    return;
  }

  router.push({
    name: "ChatExam",
    query: {
      sopId,
      sopName,
      entry: "web-practice",
    },
  });
};

const loadCategoryTree = async () => {
  try {
    const { data } = await getSopCategoryTree();
    if (data?.status && data.status !== 200) throw new Error(data?.message);

    categoryTree.value = Array.isArray(data?.results) ? data.results : [];
    categoryLoadFailed.value = false;
    if (selectedPrimaryCategory.value !== "all") {
      page.value = 1;
      loadPractices();
    }
  } catch {
    categoryTree.value = [];
    categoryLoadFailed.value = true;
  }
};

onMounted(() => {
  loadCategoryTree();
  loadPractices();
});
</script>

<style scoped lang="scss">
.web-practice-page {
  display: grid;
  gap: 20px;
}

.web-practice-surface {
  border: 1px solid var(--web-line);
  border-radius: 12px;
  background: var(--web-surface);
  box-shadow: 0 4px 14px rgba(31, 61, 96, 0.06);
}

.web-practice-filter {
  padding: 24px 28px;

  h1 {
    margin: 0;
    color: var(--web-text-primary);
    font-size: 18px;
    font-weight: 600;
    line-height: 1.4;
  }

  &__controls {
    margin-top: 18px;
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
  }

  &__category {
    margin: 0;
    border-color: var(--web-line);
    background: var(--web-surface);
    color: var(--web-text-secondary);

    &:hover {
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
    flex-wrap: wrap;
    margin-top: 14px;
    padding: 10px 12px;
    border-radius: 8px;
    background: var(--web-page-bg);
  }

  &__secondary-button {
    height: 32px;
    margin: 0;
    padding: 0 14px;
    border-color: var(--web-line);
    border-radius: 999px;
    background: var(--web-surface);
    color: var(--web-text-secondary);
    font-size: 12px;

    &:hover,
    &.is-active {
      border-color: var(--el-color-primary);
      background: color-mix(in srgb, var(--el-color-primary) 10%, var(--web-surface));
      color: var(--el-color-primary);
    }
  }

  &__category-error {
    margin: 12px 0 0;
    color: var(--web-text-secondary);
    font-size: 13px;
    line-height: 1.5;
  }

  &__search-field {
    margin-top: 18px;

    label {
      display: block;
      margin-bottom: 8px;
      color: var(--web-text-primary);
      font-size: 14px;
      line-height: 1.4;
    }
  }

  &__search {
    gap: 14px;

    :deep(.el-input) {
      width: 300px;
    }

    :deep(.el-button) {
      width: 86px;
      margin: 0;
    }
  }
}

.web-practice-comprehensive {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 28px;

  &__main {
    min-width: 0;
  }

  h2,
  p {
    margin: 0;
  }

  h2 {
    color: var(--web-text-primary);
    font-size: 18px;
    font-weight: 600;
    line-height: 1.4;
  }

  p {
    margin-top: 7px;
    color: var(--web-text-secondary);
    font-size: 14px;
    line-height: 1.6;
  }

  dl {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 16px 0 0;
  }

  dl div {
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    background: var(--web-page-bg);
  }

  dt,
  dd {
    margin: 0;
  }

  dt {
    color: var(--web-text-secondary);
    font-size: 12px;
  }

  dd {
    color: var(--web-text-primary);
    font-size: 14px;
    font-weight: 600;
  }

  :deep(.el-button) {
    flex: 0 0 auto;
    min-width: 106px;
    margin: 0;
  }
}

.web-practice-list {
  min-height: 350px;
  padding: 24px 28px 28px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    h2,
    span {
      margin: 0;
    }

    h2 {
      color: var(--web-text-primary);
      font-size: 18px;
      font-weight: 600;
      line-height: 1.4;
    }

    span {
      color: var(--web-text-secondary);
      font-size: 14px;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-top: 20px;
  }

  &__loading,
  &__result {
    min-height: 260px;
    margin-top: 20px;
  }

  &__pagination {
    justify-content: flex-end;
    margin-top: 24px;
  }

  &__empty {
    min-height: 260px;
    padding-top: 40px;

    :deep(.el-empty__description) {
      margin-top: 10px;
      color: var(--web-text-secondary);
      line-height: 1.6;
    }

    h3 {
      margin: 12px 0 0;
      color: var(--web-text-primary);
      font-size: 16px;
      font-weight: 600;
    }
  }

  &__empty-icon {
    display: grid;
    width: 64px;
    height: 64px;
    place-items: center;
    border-radius: 18px;
    background: color-mix(in srgb, var(--el-color-primary) 10%, var(--web-surface));
    color: var(--el-color-primary);
    font-size: 30px;
  }
}

@media (max-width: 1199px) {
  .web-practice-list__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1023px) {
  .web-practice-comprehensive {
    align-items: stretch;
    flex-direction: column;
  }

  .web-practice-filter__search {
    :deep(.el-input) {
      width: min(300px, calc(100vw - 410px));
    }
  }

  .web-practice-comprehensive :deep(.el-button) {
    width: 100%;
  }

  .web-practice-list__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
