<template>
  <el-descriptions :column="2" border>
    <el-descriptions-item :label="t('exam.name')">{{ form.name || '-' }}</el-descriptions-item>
    <el-descriptions-item :label="t('exam.type')">{{ typeLabel }}</el-descriptions-item>
    <el-descriptions-item :label="t('exam.duration')">{{ form.duration }} {{ t('exam.minutes') }}</el-descriptions-item>
    <el-descriptions-item :label="t('exam.passScore')">{{ form.passScore }}</el-descriptions-item>
    <el-descriptions-item :label="t('exam.totalQuestions')">{{ totalQuestions }}</el-descriptions-item>
    <el-descriptions-item :label="t('exam.totalScore')">{{ totalScore }}</el-descriptions-item>
  </el-descriptions>
  <el-empty v-if="!questions.length" :description="t('exam.noPreviewQuestions')" />
  <el-card v-for="(question, index) in questions" :key="question.pk" class="question">
    <template #header>{{ index + 1 }}. {{ question.typeLabel }} · {{ question.score }} {{ t('exam.points') }}</template>
    <p>{{ question.question }}</p>
    <template v-if="question.options?.length"><p v-for="option in question.options" :key="option">{{ option }}</p></template>
    <el-input v-else type="textarea" disabled :placeholder="t('exam.answerPlaceholder')" />
  </el-card>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
const props = defineProps({ form: Object, questions: Array, totalQuestions: Number, totalScore: Number });
const { t } = useI18n();
const typeLabel = computed(() => t(`exam.types.${props.form.type}`));
</script>

<style scoped>.question { margin-top: 12px; }</style>
