<template>
  <article class="practice-card">
    <div class="practice-card__tags">
      <el-tag effect="plain">{{ displayCategory(practice.primaryCategory) }}</el-tag>
      <el-tag effect="plain" type="info">
        {{ displayCategory(practice.secondaryCategory) }}
      </el-tag>
      <el-tag effect="light" type="primary">{{ displayValue(practice.version) }}</el-tag>
    </div>

    <h3>{{ practice.title }}</h3>
    <p v-if="practice.description" class="practice-card__description">{{ practice.description }}</p>

    <dl class="practice-card__meta">
      <div>
        <dt>{{ t("web.practice.fillBlankCount") }}</dt>
        <dd>{{ displayValue(practice.fillBlankCount) }}</dd>
      </div>
      <div>
        <dt>{{ t("web.practice.answerCount") }}</dt>
        <dd>{{ displayValue(practice.answerCount) }}</dd>
      </div>
      <div>
        <dt>{{ t("web.practice.totalQuestions") }}</dt>
        <dd>{{ displayValue(practice.totalQuestions) }}</dd>
      </div>
    </dl>

    <div class="practice-card__progress">
      <div>
        <span>{{ t("web.practice.progress") }}</span>
        <strong>{{ progressText }}</strong>
      </div>
      <el-progress v-if="hasProgress" :percentage="progressPercentage" :show-text="false" />
    </div>

    <div class="practice-card__actions">
      <el-tooltip :content="t('web.practice.notAvailable')">
        <span>
          <el-button plain disabled>{{ t("web.practice.history") }}</el-button>
        </span>
      </el-tooltip>
      <el-button type="primary" @click="emit('start', practice)">
        {{ t("web.practice.start") }}
      </el-button>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

/**
 * Stable display model returned by the user-practice service adapter.
 *
 * @typedef {Object} PracticeViewModel
 * @property {number} id
 * @property {number} sopId
 * @property {string | null} sopName
 * @property {string | null} title
 * @property {string | null} description
 * @property {{ id: number, name: string } | null} primaryCategory
 * @property {{ id: number, name: string } | null} secondaryCategory
 * @property {string | null} version
 * @property {number} fillBlankCount
 * @property {number} answerCount
 * @property {number} totalQuestions
 * @property {number | null} estimatedMinutes
 * @property {number | null} progressPercent
 */

const props = defineProps({
  practice: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["start"]);

const hasProgress = computed(
  () => props.practice.progressPercent !== null && props.practice.progressPercent !== undefined && Number.isFinite(Number(props.practice.progressPercent)),
);

const progressPercentage = computed(() => {
  const value = Number(props.practice.progressPercent);
  if (!hasProgress.value) return 0;

  return Math.min(Math.max(value, 0), 100);
});

const progressText = computed(() => {
  if (!hasProgress.value) {
    return "--";
  }

  return `${progressPercentage.value}%`;
});

const displayValue = (value) => (value === null || value === undefined || value === "" ? "--" : value);
const displayCategory = (category) => displayValue(category?.name);
</script>

<style scoped lang="scss">
.practice-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 20px;
  border: 1px solid var(--web-line);
  border-radius: 12px;
  background: var(--web-surface);
  box-shadow: 0 4px 14px rgba(31, 61, 96, 0.06);

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    :deep(.el-tag) {
      max-width: 100%;
    }
  }

  h3 {
    margin: 16px 0 0;
    overflow: hidden;
    color: var(--web-text-primary);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__description {
    display: -webkit-box;
    min-height: 21px;
    margin: 8px 0 0;
    overflow: hidden;
    color: var(--web-text-secondary);
    font-size: 13px;
    line-height: 1.6;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  &__meta {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin: 18px 0;

    div {
      min-width: 0;
      padding: 9px 8px;
      border-radius: 8px;
      background: var(--web-page-bg);
    }

    dt,
    dd {
      margin: 0;
    }

    dt {
      overflow: hidden;
      color: var(--web-text-secondary);
      font-size: 12px;
      line-height: 1.4;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    dd {
      margin-top: 5px;
      color: var(--web-text-primary);
      font-size: 15px;
      font-weight: 600;
      line-height: 1.2;
    }
  }

  &__progress {
    margin-top: auto;

    > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      color: var(--web-text-secondary);
      font-size: 13px;
    }

    strong {
      color: var(--web-text-primary);
      font-weight: 600;
    }
  }

  &__actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 10px;
    margin-top: 18px;

    > span,
    :deep(.el-button) {
      width: 100%;
    }
  }
}
</style>
