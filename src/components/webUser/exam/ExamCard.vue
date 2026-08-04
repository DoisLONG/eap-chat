<template>
  <article class="web-exam-card">
    <div class="web-exam-card__tags">
      <el-tag effect="light" :class="`web-exam-card__category--${categoryTone}`">
        {{ displayValue(exam.primaryCategoryName) }}
      </el-tag>
      <el-tag effect="plain" type="info">{{ statusText }}</el-tag>
    </div>

    <h3 :title="exam.title">{{ displayValue(exam.title) }}</h3>

    <dl class="web-exam-card__meta">
      <div>
        <dt>{{ questionMetricLabel(exam.firstQuestionMetricLabel) }}</dt>
        <dd>{{ displayCount(exam.firstQuestionMetricCount) }}</dd>
      </div>
      <div>
        <dt>{{ questionMetricLabel(exam.secondQuestionMetricLabel) }}</dt>
        <dd>{{ displayCount(exam.secondQuestionMetricCount) }}</dd>
      </div>
      <div>
        <dt>{{ t("web.exam.duration") }}</dt>
        <dd>{{ displayDuration(exam.durationMinutes) }}</dd>
      </div>
      <div>
        <dt>{{ t("web.exam.totalScore") }}</dt>
        <dd>{{ displayScore(exam.totalScore) }}</dd>
      </div>
    </dl>

    <dl class="web-exam-card__time">
      <div>
        <dt>{{ t("web.exam.startTime") }}</dt>
        <dd>{{ displayValue(exam.startTime) }}</dd>
      </div>
      <div>
        <dt>{{ t("web.exam.endTime") }}</dt>
        <dd>{{ displayValue(exam.endTime) }}</dd>
      </div>
    </dl>

    <footer class="web-exam-card__footer">
      <span>{{ disabledReasonText }}</span>
      <div class="web-exam-card__actions">
        <el-tooltip :content="primaryActionTooltip">
          <span>
            <el-button type="primary" :disabled="!canPrimaryAction" :loading="exam.starting" @click="emit('action', exam)">{{ primaryActionText }}</el-button>
          </span>
        </el-tooltip>
        <el-tooltip :content="t('web.exam.historyPending')">
          <span>
            <el-button plain disabled>{{ t("web.exam.history") }}</el-button>
          </span>
        </el-tooltip>
      </div>
    </footer>
  </article>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  exam: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["action"]);

const statusText = computed(() => {
  const statusKey = props.exam.statusKey;
  if (statusKey === "inProgress") return t("web.exam.status.inProgress");
  if (statusKey === "completed") return t("web.exam.status.completed");
  return t("web.exam.status.pending");
});

const primaryActionText = computed(() => {
  if (props.exam.statusKey === "inProgress") return t("web.exam.continue");
  if (props.exam.statusKey === "completed") return t("web.exam.viewResult");
  return t("web.exam.start");
});

const categoryTone = computed(() => {
  const code = String(props.exam.primaryCategoryCode || "").toLowerCase();
  if (code.includes("product")) return "product";
  if (code.includes("operation")) return "operation";
  if (code.includes("technology") || code.includes("technical")) return "technology";
  return "default";
});

const primaryActionTooltip = computed(() =>
  props.exam.statusKey === "completed"
    ? (canPrimaryAction.value ? "" : t("web.exam.resultPending"))
    : canPrimaryAction.value ? "" : t("web.exam.answerPending"),
);

const canPrimaryAction = computed(() =>
  props.exam.statusKey === "pending" ? props.exam.canStart : props.exam.statusKey === "inProgress" ? props.exam.canContinue : props.exam.canViewResult,
);

const disabledReasonText = computed(() => {
  const mapping = {
    not_started: "web.exam.notStarted",
    ended: "web.exam.ended",
    attempt_expired: "web.exam.attemptExpired",
    attempts_exhausted: "web.exam.attemptsExhausted",
  };
  return props.exam.disabledReason ? t(mapping[props.exam.disabledReason] || "web.exam.unavailable") : "";
});

const questionMetricLabel = (metric) => {
  const keys = {
    fillBlank: "web.exam.fillBlankCount",
    choice: "web.exam.choiceCount",
    shortAnswer: "web.exam.qaCount",
    unknown: "web.exam.unknownQuestionType",
  };
  return t(keys[metric] || "web.exam.unknownQuestionType");
};

const displayValue = (value) => (value === null || value === undefined || value === "" ? "--" : value);
const displayWithUnit = (value, unitKey) => {
  const displayed = displayValue(value);
  return displayed === "--" ? displayed : `${displayed} ${t(unitKey)}`;
};
const displayCount = (value) => displayWithUnit(value, "web.exam.questionUnit");
const displayDuration = (value) => displayWithUnit(value, "web.exam.minuteUnit");
const displayScore = (value) => displayWithUnit(value, "web.exam.scoreUnit");
</script>

<style scoped lang="scss">
.web-exam-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 16px;
  border: 1px solid var(--web-line);
  border-radius: 12px;
  background: var(--web-surface);
  box-shadow: 0 8px 22px rgba(31, 73, 128, 0.07);

  &__tags {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    :deep(.el-tag) {
      max-width: 50%;
    }
  }

  &__category {
    &--product {
      --el-tag-bg-color: #eaf3ff;
      --el-tag-border-color: #b9d7ff;
      --el-tag-text-color: #1677ff;
    }

    &--operation {
      --el-tag-bg-color: #fff4e8;
      --el-tag-border-color: #ffd6a8;
      --el-tag-text-color: #d46b08;
    }

    &--technology {
      --el-tag-bg-color: #f1edff;
      --el-tag-border-color: #d5c9ff;
      --el-tag-text-color: #6c49c9;
    }

    &--mixed,
    &--default {
      --el-tag-bg-color: #f4f6f8;
      --el-tag-border-color: #d9e1e8;
      --el-tag-text-color: #718096;
    }
  }

  h3 {
    margin: 12px 0 0;
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin: 13px 0;

    div {
      min-width: 0;
      padding: 8px 9px;
      border-radius: 10px;
      background: #f7f9fc;
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
      margin-top: 5px;
      overflow: hidden;
      color: var(--web-text-primary);
      font-size: 14px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__time {
    display: grid;
    gap: 8px;
    margin: 0;

    div {
      display: flex;
      justify-content: space-between;
      gap: 16px;
    }

    dt,
    dd {
      margin: 0;
      font-size: 13px;
    }

    dt {
      color: var(--web-text-secondary);
    }

    dd {
      overflow: hidden;
      color: var(--web-text-primary);
      text-align: right;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--web-line);

    > span {
      min-width: 0;
      overflow: hidden;
      color: var(--web-text-secondary);
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__actions {
    display: flex;
    flex: 0 0 auto;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;

    :deep(.el-button) {
      min-width: 88px;
      height: 36px;
      padding: 0 14px;
      border-radius: 10px;
      font-weight: 600;
    }
  }
}
</style>
