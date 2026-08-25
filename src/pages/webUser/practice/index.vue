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
              <dd>{{ t("web.practice.questionCount", { count: "15~30" }) }}</dd>
            </div>
            <div>
              <dt>{{ t("web.practice.answerCount") }}</dt>
              <dd>{{ t("web.practice.questionCount", { count: "5~15" }) }}</dd>
            </div>
            <div>
              <dt>{{ t("web.practice.estimatedMinutes") }}</dt>
              <dd>{{ t("web.practice.estimatedMinutesValue", { count: "20~30" }) }}</dd>
            </div>
          </dl>
        </div>
        <el-button type="primary" @click="openComprehensiveDialog">
          {{ t("web.practice.comprehensive.start") }}
        </el-button>
      </section>

      <el-dialog
        v-model="comprehensiveDialogVisible"
        class="web-comprehensive-dialog"
        :title="t('web.practice.comprehensive.dialogTitle')"
        width="min(760px, calc(100vw - 32px))"
        align-center
        :close-on-click-modal="false"
        destroy-on-close
        @closed="resetComprehensiveDialog"
      >
        <div class="web-comprehensive-dialog__body">
          <p class="web-comprehensive-dialog__description">
            {{ t("web.practice.comprehensive.dialogDescription") }}
          </p>

          <ul class="web-comprehensive-dialog__rules">
            <li>{{ t("web.practice.comprehensive.rulePerMaterial") }}</li>
            <li>{{ t("web.practice.comprehensive.ruleTotal") }}</li>
            <li>{{ t("web.practice.comprehensive.ruleMinimum") }}</li>
          </ul>

          <div class="web-comprehensive-dialog__filters">
            <label>
              <span>{{ t("web.practice.comprehensive.primaryCategory") }}</span>
              <el-select
                v-model="comprehensivePrimaryCategory"
                @change="selectComprehensivePrimaryCategory"
              >
                <el-option
                  v-for="category in primaryCategories"
                  :key="category.key"
                  :label="t(category.labelKey)"
                  :value="category.key"
                />
              </el-select>
            </label>

            <label>
              <span>{{ t("web.practice.comprehensive.secondaryCategory") }}</span>
              <el-select
                v-model="comprehensiveSecondaryCategoryId"
                :disabled="!comprehensiveSecondaryCategories.length"
                @change="selectComprehensiveSecondaryCategory"
              >
                <el-option :label="t('web.practice.category.all')" :value="null" />
                <el-option
                  v-for="category in comprehensiveSecondaryCategories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </label>
          </div>

          <section v-loading="comprehensivePracticesLoading" class="web-comprehensive-dialog__materials">
            <h3>{{ t("web.practice.comprehensive.materials") }}</h3>

            <el-result
              v-if="comprehensivePracticesError"
              icon="error"
              :title="t(comprehensivePracticeErrorTitleKey)"
            >
              <template #extra>
                <el-button type="primary" :loading="comprehensivePracticesLoading" @click="loadComprehensivePractices">
                  {{ t("web.common.retry") }}
                </el-button>
              </template>
            </el-result>

            <el-skeleton
              v-else-if="comprehensivePracticesLoading && !comprehensivePractices.length"
              :rows="4"
              animated
            />

            <div v-else-if="comprehensivePractices.length" class="web-comprehensive-dialog__material-list">
              <article
                v-for="practice in comprehensivePractices"
                :key="practiceKey(practice)"
                class="web-comprehensive-dialog__material"
                :class="{
                  'is-selected': isComprehensivePracticeSelected(practice),
                  'is-disabled': isComprehensivePracticeDisabled(practice),
                }"
              >
                <el-checkbox
                  :model-value="isComprehensivePracticeSelected(practice)"
                  :disabled="isComprehensivePracticeDisabled(practice)"
                  @change="toggleComprehensivePractice(practice, $event)"
                />
                <div class="web-comprehensive-dialog__material-main">
                  <strong>{{ practice.title || practice.sopName || '-' }}</strong>
                  <span>
                    {{ [practice.primaryCategory?.name, practice.secondaryCategory?.name, practice.version].filter(Boolean).join(' · ') || '-' }}
                  </span>
                  <small>
                    {{ t("web.practice.comprehensive.materialBank", { fillBlank: practice.fillBlankCount, answer: practice.answerCount }) }}
                  </small>
                  <small>
                    {{ t("web.practice.comprehensive.materialContribution", comprehensiveContribution(practice)) }}
                  </small>
                </div>
                <span v-if="isComprehensivePracticeDisabled(practice)" class="web-comprehensive-dialog__limit-hint">
                  {{ t("web.practice.comprehensive.limitReached") }}
                </span>
              </article>
            </div>

            <el-pagination
              v-if="!comprehensivePracticesLoading && !comprehensivePracticesError && comprehensiveTotalPages > 1"
              v-model:current-page="comprehensivePage"
              class="web-comprehensive-dialog__pagination"
              :total="comprehensiveTotal"
              :page-size="comprehensivePageSize"
              layout="total, prev, pager, next"
              @current-change="loadComprehensivePractices"
            />

        </section>

          <p class="web-comprehensive-dialog__summary" role="status">
            {{ t("web.practice.comprehensive.selectionSummary", comprehensiveTotals) }}
          </p>
        </div>

        <template #footer>
          <div class="web-comprehensive-dialog__footer">
            <el-button @click="comprehensiveDialogVisible = false">{{ t("common.cancel") }}</el-button>
            <el-button
              type="primary"
              :loading="comprehensiveStartLoading"
              :disabled="!canStartComprehensivePractice || comprehensiveStartLoading"
              @click="startComprehensivePractice"
            >
              {{ t("web.practice.comprehensive.start") }}
            </el-button>
          </div>
        </template>
      </el-dialog>

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
import { startComprehensiveExamSession } from "@/services/chat.service";
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

const comprehensiveDialogVisible = ref(false);
const comprehensivePrimaryCategory = ref("all");
const comprehensiveSecondaryCategoryId = ref(null);
const comprehensivePractices = ref([]);
const comprehensivePage = ref(1);
const comprehensivePageSize = 100;
const comprehensiveTotal = ref(0);
const comprehensiveTotalPages = ref(0);
const comprehensivePracticesLoading = ref(false);
const comprehensivePracticesError = ref(null);
const comprehensiveStartLoading = ref(false);
const selectedComprehensivePracticeRecords = ref([]);
let comprehensivePracticeRequestSequence = 0;

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

const comprehensivePrimaryCategoryData = computed(() =>
  primaryCategories.value.find((category) => category.key === comprehensivePrimaryCategory.value),
);

const comprehensivePrimaryCategoryId = computed(
  () => comprehensivePrimaryCategoryData.value?.id ?? null,
);

const comprehensiveSecondaryCategories = computed(
  () => comprehensivePrimaryCategoryData.value?.children || [],
);

const selectedComprehensivePracticeKeys = computed(
  () => new Set(selectedComprehensivePracticeRecords.value.map(practiceKey)),
);

const comprehensiveTotals = computed(() => {
  const totals = selectedComprehensivePracticeRecords.value.reduce(
    (result, practice) => {
      const contribution = comprehensiveContribution(practice);
      result.fillBlank += contribution.fillBlank;
      result.answer += contribution.answer;
      return result;
    },
    { count: selectedComprehensivePracticeRecords.value.length, fillBlank: 0, answer: 0 },
  );

  return totals;
});

const selectedPractices = computed(() =>
  selectedComprehensivePracticeRecords.value.map((practice) => ({
    sopId: practice.sopId,
    effectiveFillBlank: comprehensiveContribution(practice).fillBlank,
    effectiveAnswer: comprehensiveContribution(practice).answer,
  })),
);

const canStartComprehensivePractice = computed(
  () =>
    selectedPractices.value.length > 0 &&
    comprehensiveTotals.value.fillBlank >= 15 &&
    comprehensiveTotals.value.fillBlank <= 30 &&
    comprehensiveTotals.value.answer >= 5 &&
    comprehensiveTotals.value.answer <= 15,
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

const comprehensivePracticeErrorTitleKey = computed(() => {
  const status = Number(
    comprehensivePracticesError.value?.response?.status || comprehensivePracticesError.value?.status,
  );
  if (status === 403) return "web.practice.forbidden";
  if (status === 401) return "web.practice.loginRequired";
  return "web.practice.comprehensive.loadFailed";
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

const practiceKey = (practice) => String(practice?.sopId || practice?.id || "");

const comprehensiveContribution = (practice) => ({
  fillBlank: Math.min(Math.max(Number(practice?.fillBlankCount) || 0, 0), 10),
  answer: Math.min(Math.max(Number(practice?.answerCount) || 0, 0), 5),
});

const openComprehensiveDialog = () => {
  comprehensiveDialogVisible.value = true;
  loadComprehensivePractices();
};

const selectComprehensivePrimaryCategory = () => {
  comprehensiveSecondaryCategoryId.value = null;
  comprehensivePage.value = 1;
  loadComprehensivePractices();
};

const selectComprehensiveSecondaryCategory = () => {
  comprehensivePage.value = 1;
  loadComprehensivePractices();
};

const loadComprehensivePractices = async () => {
  const requestSequence = ++comprehensivePracticeRequestSequence;
  comprehensivePracticesLoading.value = true;
  comprehensivePracticesError.value = null;
  comprehensivePractices.value = [];
  comprehensiveTotal.value = 0;
  comprehensiveTotalPages.value = 0;

  try {
    const result = await getUserPracticeList({
      page: comprehensivePage.value,
      pageSize: comprehensivePageSize,
      primaryCategoryId: comprehensivePrimaryCategoryId.value,
      secondaryCategoryId: comprehensiveSecondaryCategoryId.value,
    });
    if (requestSequence !== comprehensivePracticeRequestSequence) return;

    comprehensivePractices.value = result.records;
    comprehensivePage.value = result.page;
    comprehensiveTotal.value = result.total;
    comprehensiveTotalPages.value = result.totalPages;
  } catch (error) {
    if (requestSequence !== comprehensivePracticeRequestSequence) return;

    comprehensivePracticesError.value = error;
    comprehensivePractices.value = [];
    console.error("Failed to load comprehensive practice materials", error);
  } finally {
    if (requestSequence === comprehensivePracticeRequestSequence) {
      comprehensivePracticesLoading.value = false;
    }
  }
};

const isComprehensivePracticeSelected = (practice) =>
  selectedComprehensivePracticeKeys.value.has(practiceKey(practice));

const isComprehensivePracticeDisabled = (practice) => {
  if (isComprehensivePracticeSelected(practice)) return false;

  const contribution = comprehensiveContribution(practice);
  return (
    comprehensiveTotals.value.fillBlank + contribution.fillBlank > 30 ||
    comprehensiveTotals.value.answer + contribution.answer > 15
  );
};

const toggleComprehensivePractice = (practice, checked) => {
  const key = practiceKey(practice);
  if (!key) return;

  if (checked) {
    if (isComprehensivePracticeDisabled(practice)) return;
    selectedComprehensivePracticeRecords.value = [
      ...selectedComprehensivePracticeRecords.value,
      practice,
    ];
  } else {
    selectedComprehensivePracticeRecords.value = selectedComprehensivePracticeRecords.value.filter(
      (item) => practiceKey(item) !== key,
    );
  }
};

const resetComprehensiveDialog = () => {
  comprehensivePracticeRequestSequence += 1;
  comprehensivePrimaryCategory.value = "all";
  comprehensiveSecondaryCategoryId.value = null;
  comprehensivePractices.value = [];
  comprehensivePage.value = 1;
  comprehensiveTotal.value = 0;
  comprehensiveTotalPages.value = 0;
  comprehensivePracticesLoading.value = false;
  comprehensivePracticesError.value = null;
  comprehensiveStartLoading.value = false;
  selectedComprehensivePracticeRecords.value = [];
};

const startComprehensivePractice = async () => {
  if (!canStartComprehensivePractice.value) return;

  comprehensiveStartLoading.value = true;
  try {
    const { data } = await startComprehensiveExamSession(
      selectedPractices.value.map((practice) => ({
        sopId: practice.sopId,
        fillBlankCount: practice.effectiveFillBlank,
        answerCount: practice.effectiveAnswer,
      })),
    );
    const result = data?.results;
    if (data?.status !== 200 || !result?.exams_id) {
      throw new Error(data?.message || t("web.practice.comprehensive.startFailed"));
    }

    comprehensiveDialogVisible.value = false;
    router.push({
      name: "ChatExam",
      query: {
        mode: "comprehensive",
        entry: "web-practice",
        examsId: String(result.exams_id),
        totalQuestions: String(Number(result.total_questions) || ""),
      },
    });
  } catch (error) {
    const message = error?.response?.data?.detail || error?.response?.data?.message || error?.message;
    ElMessage.error(message || t("web.practice.comprehensive.startFailed"));
  } finally {
    comprehensiveStartLoading.value = false;
  }
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
      totalQuestions: String(Number(practice?.totalQuestions) || ""),
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

:deep(.web-comprehensive-dialog) {
  max-width: calc(100vw - 32px);

  .el-dialog__body {
    padding-top: 12px;
  }
}

.web-comprehensive-dialog {
  &__body {
    display: grid;
    gap: 18px;
  }

  &__description,
  &__summary {
    margin: 0;
    color: var(--web-text-secondary);
    font-size: 14px;
    line-height: 1.6;
  }

  &__rules {
    display: grid;
    gap: 6px;
    margin: 0;
    padding: 12px 16px 12px 34px;
    border-radius: 8px;
    background: var(--web-page-bg);
    color: var(--web-text-secondary);
    font-size: 13px;
    line-height: 1.5;
  }

  &__filters {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;

    label {
      display: grid;
      gap: 8px;
      color: var(--web-text-primary);
      font-size: 14px;
    }
  }

  &__materials {
    min-height: 160px;

    h3 {
      margin: 0 0 12px;
      color: var(--web-text-primary);
      font-size: 15px;
      font-weight: 600;
    }
  }

  &__material-list {
    display: grid;
    gap: 10px;
    max-height: 320px;
    overflow: auto;
    padding-right: 2px;
  }

  &__pagination {
    justify-content: flex-end;
    margin-top: 14px;
  }

  &__material {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: start;
    gap: 10px;
    padding: 12px;
    border: 1px solid var(--web-line);
    border-radius: 8px;
    background: var(--web-surface);

    &.is-selected {
      border-color: var(--el-color-primary-light-5);
      background: color-mix(in srgb, var(--el-color-primary) 8%, var(--web-surface));
    }

    &.is-disabled {
      opacity: 0.62;
    }
  }

  &__material-main {
    display: grid;
    min-width: 0;
    gap: 4px;

    strong,
    span,
    small {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      color: var(--web-text-primary);
      font-size: 14px;
      line-height: 1.4;
    }

    span,
    small {
      color: var(--web-text-secondary);
      font-size: 12px;
      line-height: 1.45;
    }
  }

  &__limit-hint {
    color: var(--el-color-warning);
    font-size: 12px;
    line-height: 1.45;
    white-space: nowrap;
  }

  &__summary {
    padding: 11px 14px;
    border-radius: 8px;
    background: var(--web-page-bg);
    color: var(--web-text-primary);
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
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

  .web-comprehensive-dialog {
    &__filters {
      grid-template-columns: 1fr;
    }

    &__material {
      grid-template-columns: auto minmax(0, 1fr);
    }

    &__limit-hint {
      grid-column: 2;
    }
  }
}
</style>
