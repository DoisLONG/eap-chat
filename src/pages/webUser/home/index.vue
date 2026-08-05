<template>
  <WebPageContainer>
    <section class="web-home-page" :aria-label="t('web.page.homeTitle')">
      <div class="web-home-page__row web-home-page__row--overview">
        <HomeOverview
          :overview="overview"
          :loading="loading"
          :error="loadError"
          @retry="loadHome"
        />
        <HomeRecentLearning
          :learning="null"
          :loading="loading"
          :error="loadError"
          @continue-learning="goToPractice"
          @retry="loadHome"
        />
      </div>

      <div class="web-home-page__row web-home-page__row--content">
        <HomeRecommendationList
          :courses="practiceCourses"
          :loading="loading"
          :error="loadError"
          @start-learning="goToPractice"
          @retry="loadHome"
        />
        <HomeTodayPlan :plan="null" :loading="loading" :error="loadError" @retry="loadHome" />
      </div>

      <div class="web-home-page__row web-home-page__row--content">
        <HomeUpcomingExam
          :exam="featuredExam"
          :loading="loading"
          :error="loadError"
          @view-exams="goToExam"
          @enter-exam="goToExam"
          @retry="loadHome"
        />
        <HomeLearningData :items="[]" :loading="loading" :error="loadError" @retry="loadHome" />
      </div>
    </section>
  </WebPageContainer>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import WebPageContainer from "@/layouts/webUser/components/WebPageContainer.vue";
import HomeLearningData from "./components/HomeLearningData.vue";
import HomeOverview from "./components/HomeOverview.vue";
import HomeRecommendationList from "./components/HomeRecommendationList.vue";
import HomeRecentLearning from "./components/HomeRecentLearning.vue";
import HomeTodayPlan from "./components/HomeTodayPlan.vue";
import HomeUpcomingExam from "./components/HomeUpcomingExam.vue";
import { getWebUserHome } from "@/services/webUser/home.service";

const { t } = useI18n();
const router = useRouter();

const loading = ref(true);
const loadError = ref("");
const home = ref({ practices: [], featuredExam: null });

const overview = computed(() => ({
  title: t("web.home.welcome"),
  description: t("web.home.welcomeDescription"),
  hasProgress: false,
  progress: 0,
  stats: [],
}));

const practiceCourses = computed(() =>
  (home.value.practices || []).map((practice, index) => ({
    id: practice.id,
    category: practice.category_name || t("web.home.uncategorized"),
    tone: ["product", "technology", "operation"][index % 3],
    icon: ["▣", "⌘", "◫"][index % 3],
    title: practice.title,
    description: practice.description || t("web.home.noDescription"),
    questionCount: t("web.home.questionCountValue", { count: practice.question_count || 0 }),
    version: practice.sop_version ? t("web.home.version", { version: practice.sop_version }) : "",
  })),
);

const featuredExam = computed(() => {
  const exam = home.value.featuredExam;
  if (!exam) return null;
  return {
    category: exam.category_name || t("web.home.uncategorized"),
    title: exam.exam_name,
    time: formatExamTime(exam.start_time, exam.end_time),
    status: t(`web.home.examStatus.${exam.availability || "available"}`),
    metrics: [
      {
        label: t("web.home.questionCount"),
        value: t("web.home.questionCountValue", { count: exam.total_question_count || 0 }),
      },
      {
        label: t("web.home.examDuration"),
        value: t("web.home.examDurationValue", { count: exam.duration_minutes || 0 }),
      },
      {
        label: t("web.home.totalScore"),
        value: t("web.home.totalScoreValue", { score: exam.total_score || 0 }),
      },
    ],
  };
});

function formatExamTime(startTime, endTime) {
  if (!startTime && !endTime) return t("web.home.examTimeUnlimited");
  const format = (value) => (value ? String(value).replace("T", " ").slice(0, 16) : "");
  return endTime
    ? t("web.home.examTimeRange", { start: format(startTime) || t("web.home.examTimeNow"), end: format(endTime) })
    : t("web.home.examTimeStart", { start: format(startTime) });
}

async function loadHome() {
  loading.value = true;
  loadError.value = "";
  try {
    home.value = await getWebUserHome();
  } catch (error) {
    loadError.value = error.message || t("web.home.loadFailed");
    home.value = { practices: [], featuredExam: null };
  } finally {
    loading.value = false;
  }
}

onMounted(loadHome);

const goToPractice = () => router.push({ name: "WebUserPractice" });
const goToExam = () => router.push({ name: "WebUserExam" });
</script>

<style scoped lang="scss">
.web-home-page {
  display: grid;
  gap: 18px;

  &__row {
    display: grid;
    gap: 18px;
  }

  &__row--overview {
    grid-template-columns: minmax(0, 13fr) minmax(300px, 7fr);
  }

  &__row--content {
    grid-template-columns: minmax(0, 7fr) minmax(270px, 3fr);
  }
}

@media (max-width: 1199px) {
  .web-home-page {
    &__row--overview,
    &__row--content {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}
</style>
