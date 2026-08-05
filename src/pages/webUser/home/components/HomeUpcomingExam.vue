<template>
  <section class="home-upcoming home-surface" :aria-labelledby="titleId">
    <header class="home-panel-heading">
      <div>
        <h2 :id="titleId">{{ t("web.home.upcomingExam") }}</h2>
        <p>{{ t("web.home.upcomingExamDescription") }}</p>
      </div>
      <el-button text type="primary" @click="emit('view-exams')">{{ t("web.home.viewAll") }}</el-button>
    </header>

    <div v-if="loading" class="home-data-state">
      <el-skeleton :rows="4" animated />
    </div>
    <div v-else-if="error" class="home-data-state home-data-state--error">
      <p>{{ error }}</p>
      <el-button text type="primary" @click="emit('retry')">{{ t("web.home.retry") }}</el-button>
    </div>
    <el-empty v-else-if="!exam" :description="t('web.home.noExamAvailable')" :image-size="68" />
    <article v-else class="home-upcoming__card">
      <div>
        <span class="home-category-tag">{{ exam.category }}</span>
        <h3>{{ exam.title }}</h3>
        <p>{{ exam.time }}</p>
      </div>
      <dl>
        <div v-for="metric in exam.metrics" :key="metric.label">
          <dt>{{ metric.label }}</dt>
          <dd>{{ metric.value }}</dd>
        </div>
      </dl>
      <div class="home-upcoming__action">
        <span>{{ exam.status }}</span>
        <el-button type="primary" @click="emit('enter-exam')">{{ t("web.home.enterExam") }}</el-button>
      </div>
    </article>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";

defineProps({
  exam: {
    type: Object,
    default: null,
  },
  loading: Boolean,
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["view-exams", "enter-exam", "retry"]);
const { t } = useI18n();
const titleId = "web-home-upcoming-exam-title";
</script>

<style scoped lang="scss">
.home-surface {
  border: 1px solid var(--web-line);
  border-radius: 12px;
  background: var(--web-surface);
  box-shadow: 0 4px 14px rgba(31, 61, 96, 0.06);
}

.home-panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  h2,
  p {
    margin: 0;
  }

  h2 {
    color: var(--web-text-primary);
    font-size: 17px;
    font-weight: 600;
  }

  p {
    margin-top: 3px;
    color: var(--web-text-secondary);
    font-size: 12px;
  }

  :deep(.el-button) {
    height: auto;
    margin: -2px 0 0;
    padding: 2px;
  }
}

.home-category-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  background: #e9f2ff;
  color: #1768d8;
  font-size: 12px;
  font-weight: 600;
}

.home-upcoming {
  padding: 22px;

  &__card {
    display: grid;
    grid-template-columns: minmax(190px, 1.3fr) minmax(220px, 1fr) auto;
    align-items: center;
    gap: 20px;
    margin-top: 15px;
    padding: 17px 18px;
    border: 1px solid #e4ecf5;
    border-radius: 10px;
    background: #fbfdff;

    h3,
    p {
      margin: 0;
    }

    h3 {
      margin-top: 7px;
      color: var(--web-text-primary);
      font-size: 16px;
    }

    p {
      margin-top: 4px;
      color: #687c96;
      font-size: 13px;
    }

    dl {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 9px;
      margin: 0;
    }

    dt,
    dd {
      margin: 0;
    }

    dt {
      color: #78889b;
      font-size: 12px;
    }

    dd {
      margin-top: 2px;
      color: #314e73;
      font-size: 15px;
      font-weight: 600;
    }
  }

  &__action {
    text-align: right;

    > span {
      display: inline-flex;
      align-items: center;
      margin-bottom: 8px;
      padding: 3px 9px;
      border-radius: 999px;
      background: #edf5ff;
      color: #2773d2;
      font-size: 12px;
      font-weight: 600;
    }

    :deep(.el-button) {
      display: block;
      margin-left: auto;
    }
  }
}

.home-data-state {
  min-height: 126px;
  padding: 24px 0 4px;

  &--error {
    display: grid;
    place-items: center;
    color: var(--web-text-secondary);
    text-align: center;

    p {
      margin: 0;
    }
  }
}

@media (max-width: 1199px) {
  .home-upcoming__card {
    grid-template-columns: minmax(0, 1fr);
  }

  .home-upcoming__action {
    text-align: left;

    :deep(.el-button) {
      margin-left: 0;
    }
  }
}
</style>
