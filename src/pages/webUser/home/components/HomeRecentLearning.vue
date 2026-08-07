<template>
  <section class="home-recent home-surface" :aria-labelledby="titleId">
    <header class="home-panel-heading">
      <div>
        <h2 :id="titleId">{{ t("web.home.recentLearning") }}</h2>
        <p>{{ t("web.home.recentLearningDescription") }}</p>
      </div>
      <span v-if="learning" class="home-category-tag home-category-tag--product">{{ learning.category }}</span>
    </header>

    <div v-if="loading" class="home-data-state">
      <el-skeleton :rows="4" animated />
    </div>
    <div v-else-if="error" class="home-data-state home-data-state--error">
      <p>{{ error }}</p>
      <el-button text type="primary" @click="emit('retry')">{{ t("web.home.retry") }}</el-button>
    </div>
    <el-empty v-else-if="!learning" :description="t('web.home.noLearningRecord')" :image-size="68" />
    <template v-else>
      <h3>{{ learning.title }}</h3>
      <p class="home-recent__chapter">{{ learning.chapter }}</p>
      <div class="home-recent__progress-label">
        <span>{{ t("web.home.learningProgress") }}</span>
        <span>{{ learning.progress }}%</span>
      </div>
      <el-progress :percentage="learning.progress" :show-text="false" :stroke-width="7" />
      <p class="home-recent__last-study">{{ learning.lastStudy }}</p>
      <el-button type="primary" @click="emit('continue-learning')">
        {{ t("web.home.continueLearning") }}
      </el-button>
    </template>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";

defineProps({
  learning: {
    type: Object,
    default: null,
  },
  loading: Boolean,
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["continue-learning", "retry"]);
const { t } = useI18n();
const titleId = "web-home-recent-title";
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
}

.home-category-tag {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;

  &--product {
    background: #e9f2ff;
    color: #1768d8;
  }
}

.home-recent {
  display: flex;
  flex-direction: column;
  padding: 22px;

  h3 {
    margin: 16px 0 10px;
    color: var(--web-text-primary);
    font-size: 16px;
    font-weight: 600;
  }

  &__chapter {
    margin: 0 0 12px;
    color: #647892;
    font-size: 13px;
  }

  &__progress-label {
    display: flex;
    justify-content: space-between;
    margin: 2px 0 6px;
    color: var(--web-text-secondary);
    font-size: 12px;
  }

  &__last-study {
    margin: auto 0 0;
    padding-top: 16px;
    color: var(--web-text-secondary);
    font-size: 12px;
  }

  :deep(.el-progress-bar__outer) {
    background: #dce9f8;
  }

  :deep(.el-button) {
    align-self: flex-end;
    min-width: 88px;
    margin: 11px 0 0;
  }
}

.home-data-state {
  min-height: 166px;
  padding-top: 24px;

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
</style>
