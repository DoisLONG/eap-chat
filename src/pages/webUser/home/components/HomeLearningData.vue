<template>
  <section class="home-learning-data home-surface" :aria-labelledby="titleId">
    <header>
      <h2 :id="titleId">{{ t("web.home.learningData") }}</h2>
      <p>{{ t("web.home.learningDataDescription") }}</p>
    </header>

    <div v-if="loading" class="home-data-state">
      <el-skeleton :rows="4" animated />
    </div>
    <div v-else-if="error" class="home-data-state home-data-state--error">
      <p>{{ error }}</p>
      <el-button text type="primary" @click="emit('retry')">{{ t("web.home.retry") }}</el-button>
    </div>
    <el-empty v-else-if="!items.length" :description="t('web.home.noLearningRecord')" :image-size="68" />
    <dl v-else>
      <div v-for="item in items" :key="item.label">
        <dt>{{ item.label }}</dt>
        <dd :class="{ 'is-success': item.tone === 'success' }">{{ item.value }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";

defineProps({
  items: {
    type: Array,
    required: true,
  },
  loading: Boolean,
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["retry"]);
const { t } = useI18n();
const titleId = "web-home-learning-data-title";
</script>

<style scoped lang="scss">
.home-surface {
  border: 1px solid var(--web-line);
  border-radius: 12px;
  background: var(--web-surface);
  box-shadow: 0 4px 14px rgba(31, 61, 96, 0.06);
}

.home-learning-data {
  padding: 22px;

  h2,
  p {
    margin: 0;
  }

  h2 {
    color: var(--web-text-primary);
    font-size: 17px;
    font-weight: 600;
  }

  header p {
    margin-top: 3px;
    color: var(--web-text-secondary);
    font-size: 12px;
  }

  dl {
    display: grid;
    gap: 13px;
    margin: 15px 0 0;
  }

  dl div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #edf1f5;

    &:last-child {
      padding-bottom: 0;
      border-bottom: 0;
    }
  }

  dt,
  dd {
    margin: 0;
  }

  dt {
    color: var(--web-text-secondary);
    font-size: 13px;
  }

  dd {
    color: #244d80;
    font-size: 20px;
    font-weight: 600;

    &.is-success {
      color: #278b5b;
    }
  }
}

.home-data-state {
  min-height: 154px;
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
