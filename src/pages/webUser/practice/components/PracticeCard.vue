<template>
  <article class="practice-card">
    <div class="practice-card__tags">
      <el-tag effect="plain">{{ displayValue(practice.primaryCategory) }}</el-tag>
      <el-tag effect="plain" type="info">
        {{ displayValue(practice.secondaryCategory) }}
      </el-tag>
      <el-tag effect="light" type="primary">{{ displayValue(practice.version) }}</el-tag>
    </div>

    <h3>{{ practice.title }}</h3>

    <dl class="practice-card__meta">
      <div>
        <dt>{{ t("web.practice.choiceCount") }}</dt>
        <dd>{{ displayValue(practice.choiceCount) }}</dd>
      </div>
      <div>
        <dt>{{ t("web.practice.answerCount") }}</dt>
        <dd>{{ displayValue(practice.answerCount) }}</dd>
      </div>
      <div>
        <dt>{{ t("web.practice.estimatedMinutes") }}</dt>
        <dd>{{ displayValue(practice.estimatedMinutes) }}</dd>
      </div>
    </dl>

    <div class="practice-card__progress">
      <div>
        <span>{{ t("web.practice.progress") }}</span>
        <strong>{{ progressText }}</strong>
      </div>
      <el-progress :percentage="progressPercentage" :show-text="false" />
    </div>

    <div class="practice-card__actions">
      <el-tooltip :content="t('web.practice.notAvailable')">
        <span>
          <el-button plain disabled>{{ t("web.practice.history") }}</el-button>
        </span>
      </el-tooltip>
      <el-button type="primary" @click="emit('start', practice)">
        {{ progressPercentage > 0 ? t("web.practice.continue") : t("web.practice.start") }}
      </el-button>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

/**
 * Stable page display model for the future user-side practice-list adapter.
 * It is intentionally not a contract for any backend response.
 *
 * @typedef {Object} PracticeViewModel
 * @property {string} id
 * @property {string} sopId
 * @property {string} sopName
 * @property {string} title
 * @property {string} primaryCategory
 * @property {string} secondaryCategory
 * @property {string} version
 * @property {number | null} choiceCount
 * @property {number | null} answerCount
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

const progressPercentage = computed(() => {
  const value = Number(props.practice.progressPercent);
  if (!Number.isFinite(value)) return 0;

  return Math.min(Math.max(value, 0), 100);
});

const progressText = computed(() => {
  if (props.practice.progressPercent === null || props.practice.progressPercent === undefined) {
    return "--";
  }

  return `${progressPercentage.value}%`;
});

const displayValue = (value) => (value === null || value === undefined || value === "" ? "--" : value);
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
