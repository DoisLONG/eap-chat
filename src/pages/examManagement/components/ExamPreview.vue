<template>
  <el-descriptions :column="2" border>
    <el-descriptions-item :label="t('exam.name')">{{ form.name || '-' }}</el-descriptions-item>
    <el-descriptions-item :label="t('exam.type')">{{ typeLabel }}</el-descriptions-item>
    <el-descriptions-item :label="t('exam.duration')">{{ form.duration }} {{ t('exam.minutes') }}</el-descriptions-item>
    <el-descriptions-item :label="t('exam.passScore')">{{ form.passScore }}</el-descriptions-item>
    <el-descriptions-item :label="t('exam.totalQuestions')">{{ totalQuestions }}</el-descriptions-item>
    <el-descriptions-item :label="t('exam.totalScore')">{{ totalScore }}</el-descriptions-item>
  </el-descriptions>
  <el-empty v-if="!questions.length" :description="status === 'published' ? t('exam.noPreviewQuestions') : '题目将在发布时由后端生成。'" />
  <el-card v-for="(question, index) in sortedQuestions" :key="question.id ?? question.pk" class="question">
    <template #header>{{ question.sort_order || index + 1 }}. {{ question.typeLabel || questionType(question.question_type) }} · {{ question.score }} {{ t('exam.points') }}</template>
    <p>{{ question.question_text || question.question }}</p>
    <template v-if="question.options?.length"><p v-for="option in question.options" :key="option">{{ option }}</p></template>
    <template v-else-if="options(question.options_json).length"><p v-for="option in options(question.options_json)" :key="String(option)">{{ option.text || option.content || option }}</p></template>
    <el-input v-else type="textarea" disabled :placeholder="t('exam.answerPlaceholder')" />
    <template v-if="status === 'published'"><p><strong>参考答案：</strong>{{ question.correct_answer }}</p><p v-if="question.answer_analysis"><strong>解析：</strong>{{ question.answer_analysis }}</p></template>
  </el-card>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
const props = defineProps({ form: Object, questions: Array, totalQuestions: Number, totalScore: Number, status: { type: String, default: 'draft' } });
const { t } = useI18n();
const typeLabel = computed(() => t(`exam.types.${props.form.type}`));
const sortedQuestions = computed(() => [...props.questions].sort((left, right) => Number(left.sort_order || 0) - Number(right.sort_order || 0)));
const questionType = value => ({ fill_blank: t('exam.types.fillBlank'), short_answer: t('exam.types.qa'), single_choice: t('exam.types.singleChoice'), multiple_choice: t('exam.types.multipleChoice'), true_false: t('exam.types.judgement') }[value] || value || '-');
function options(value) { try { const parsed = typeof value === 'string' ? JSON.parse(value) : value; return Array.isArray(parsed) ? parsed : parsed?.options || []; } catch { return []; } }
</script>

<style scoped>.question { margin-top: 12px; }</style>
