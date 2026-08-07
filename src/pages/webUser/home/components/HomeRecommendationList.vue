<template>
  <section class="home-recommendations home-surface" :aria-labelledby="titleId">
    <header class="home-panel-heading">
      <div>
        <h2 :id="titleId">{{ t("web.home.recommendations") }}</h2>
        <p>{{ t("web.home.recommendationsDescription") }}</p>
      </div>
    </header>

    <div v-if="loading" class="home-data-state">
      <el-skeleton :rows="4" animated />
    </div>
    <div v-else-if="error" class="home-data-state home-data-state--error">
      <p>{{ error }}</p>
      <el-button text type="primary" @click="emit('retry')">
        {{ t("web.home.retry") }}
      </el-button>
    </div>
    <el-empty v-else-if="!courses.length" :description="t('web.home.noPracticeAvailable')" :image-size="68" />
    <div v-else class="home-recommendations__grid">
      <article v-for="course in courses" :key="course.id" class="home-course-card">
        <div class="home-course-card__top">
          <span class="home-category-tag" :class="`home-category-tag--${course.tone}`">{{ course.category }}</span>
          <span class="home-course-card__icon" aria-hidden="true">{{ course.icon }}</span>
        </div>
        <h3>{{ course.title }}</h3>
        <p class="home-course-card__description">{{ course.description }}</p>
        <div class="home-course-card__meta">
          <span>{{ course.questionCount }}</span>
          <span v-if="course.version">{{ course.version }}</span>
        </div>
        <el-button type="primary" @click="emit('start-learning', course)">
          {{ t("web.home.startLearning") }}
        </el-button>
      </article>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";

defineProps({
  courses: {
    type: Array,
    required: true,
  },
  loading: Boolean,
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["start-learning", "retry"]);
const { t } = useI18n();
const titleId = "web-home-recommendations-title";
</script>

<style scoped lang="scss">
.home-surface {
  border: 1px solid var(--web-line);
  border-radius: 12px;
  background: var(--web-surface);
  box-shadow: 0 4px 14px rgba(31, 61, 96, 0.06);
}

.home-panel-heading {
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
}

.home-category-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;

  &--product {
    background: #e9f2ff;
    color: #1768d8;
  }

  &--technology {
    background: #f0ebff;
    color: #7955c7;
  }

  &--operation {
    background: #fff3df;
    color: #c87817;
  }
}

.home-recommendations {
  padding: 22px;

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 15px;
  }
}

.home-data-state {
  min-height: 186px;
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

.home-course-card {
  display: flex;
  min-width: 0;
  min-height: 272px;
  flex-direction: column;
  padding: 16px;
  border: 1px solid #e5ecf4;
  border-radius: 10px;
  background: #fbfdff;

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__icon {
    display: grid;
    width: 38px;
    height: 38px;
    place-items: center;
    border-radius: 9px;
    background: #edf5ff;
    color: #4389ef;
    font-size: 20px;
  }

  h3 {
    min-height: 44px;
    margin: 13px 0 6px;
    color: var(--web-text-primary);
    font-size: 15px;
    line-height: 22px;
  }

  &__description {
    min-height: 38px;
    margin: 0;
    color: var(--web-text-secondary);
    font-size: 12px;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 11px 0;
    color: #60748d;
    font-size: 12px;

    span {
      padding: 3px 6px;
      border-radius: 5px;
      background: #f0f4f8;
    }
  }

  :deep(.el-button) {
    margin-top: auto;
    width: 100%;
  }
}

@media (max-width: 1023px) {
  .home-recommendations__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
