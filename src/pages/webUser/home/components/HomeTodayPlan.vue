<template>
  <section class="home-plan home-surface" :aria-labelledby="titleId">
    <header class="home-panel-heading">
      <div>
        <h2 :id="titleId">{{ t("web.home.todayPlan") }}</h2>
        <p>{{ t("web.home.todayPlanDescription") }}</p>
      </div>
    </header>

    <div v-if="loading" class="home-data-state">
      <el-skeleton :rows="4" animated />
    </div>
    <div v-else-if="error" class="home-data-state home-data-state--error">
      <p>{{ error }}</p>
      <el-button text type="primary" @click="emit('retry')">{{ t("web.home.retry") }}</el-button>
    </div>
    <el-empty v-else-if="!plan" :description="t('web.home.noLearningRecord')" :image-size="68" />
    <template v-else>
    <ul>
      <li v-for="item in plan.items" :key="item.title">
        <span class="home-plan__status" :class="{ 'is-done': item.done }" aria-hidden="true">{{ item.done ? "✓" : "" }}</span>
        <div>
          <strong>{{ item.title }}</strong>
          <span>{{ item.type }} · {{ item.status }}</span>
        </div>
      </li>
    </ul>

    <p class="home-plan__total">{{ t("web.home.planTotal", { completed: plan.completed, total: plan.total }) }}</p>
    </template>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";

defineProps({
  plan: {
    type: Object,
    default: null,
  },
  loading: Boolean,
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["retry"]);
const { t } = useI18n();
const titleId = "web-home-plan-title";
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

.home-plan {
  padding: 22px;

  ul {
    padding: 0;
    margin: 2px 0 0;
    list-style: none;
  }

  li {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 11px 0;
    border-bottom: 1px solid #edf1f5;

    &:last-child {
      border-bottom: 0;
    }

    strong,
    div > span {
      display: block;
    }

    strong {
      color: var(--web-text-primary);
      font-size: 13px;
      font-weight: 600;
    }

    div > span {
      margin-top: 2px;
      color: #7a899c;
      font-size: 12px;
    }
  }

  &__status {
    display: grid;
    width: 18px;
    height: 18px;
    flex: 0 0 18px;
    place-items: center;
    margin-top: 1px;
    border: 1px solid #b7c9dd;
    border-radius: 50%;
    background: var(--web-surface);
    color: #278b5b;
    font-size: 11px;

    &.is-done {
      border-color: #79c9a0;
      background: #e7f8ef;
    }
  }

  &__total {
    margin: 15px 0 0;
    padding-top: 14px;
    border-top: 1px solid #edf1f5;
    color: #258458;
    font-weight: 600;
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
