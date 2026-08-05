<template>
  <section class="home-overview home-surface" :aria-labelledby="titleId">
    <h1 :id="titleId">{{ overview.title }}</h1>
    <p>{{ overview.description }}</p>

    <div v-if="loading" class="home-overview__loading">
      <el-skeleton :rows="3" animated />
    </div>
    <div v-else-if="error" class="home-overview__state home-overview__state--error">
      <span>{{ error }}</span>
      <el-button text type="primary" @click="emit('retry')">
        {{ t("web.home.retry") }}
      </el-button>
    </div>
    <div v-else-if="overview.hasProgress" class="home-overview__content">
      <div class="home-overview__progress">
        <span>{{ t("web.home.overallProgress") }}</span>
        <el-progress :percentage="overview.progress" :show-text="false" :stroke-width="8" />
        <strong>{{ overview.progress }}%</strong>
      </div>

      <dl class="home-overview__stats">
        <div v-for="item in overview.stats" :key="item.label">
          <dt>{{ item.label }}</dt>
          <dd>{{ item.value }}</dd>
        </div>
      </dl>
    </div>
    <div v-else class="home-overview__state">{{ t("web.home.noLearningRecord") }}</div>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";

defineProps({
  overview: {
    type: Object,
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
const titleId = "web-home-overview-title";
</script>

<style scoped lang="scss">
.home-surface {
  border: 1px solid var(--web-line);
  border-radius: 12px;
  background: var(--web-surface);
  box-shadow: 0 4px 14px rgba(31, 61, 96, 0.06);
}

.home-overview {
  padding: 23px 24px;
  border-color: #dcecff;
  background: #f0f7ff;

  h1,
  p {
    margin: 0;
  }

  &__loading,
  &__state {
    min-height: 112px;
    margin: 19px 0 0;
  }

  &__state {
    display: grid;
    place-items: center;
    color: #6f819a;
    font-size: 13px;

    &--error {
      gap: 2px;
      text-align: center;
    }
  }

  h1 {
    color: var(--web-text-primary);
    font-size: 22px;
    line-height: 1.35;
  }

  p {
    margin-top: 5px;
    color: #5e7594;
  }

  &__progress {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 14px;
    margin: 19px 0 16px;
    color: var(--web-text-primary);
    font-weight: 600;

    strong {
      color: var(--el-color-primary);
      font-size: 20px;
    }

    :deep(.el-progress-bar__outer) {
      background: #dce9f8;
    }
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin: 0;

    div {
      min-width: 0;
      padding: 11px 12px;
      border: 1px solid #e4effb;
      border-radius: 9px;
      background: var(--web-surface);
    }

    dt,
    dd {
      margin: 0;
    }

    dt {
      color: #6f819a;
      font-size: 12px;
    }

    dd {
      margin-top: 3px;
      overflow: hidden;
      color: #1f477b;
      font-size: 18px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

@media (max-width: 1023px) {
  .home-overview__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
