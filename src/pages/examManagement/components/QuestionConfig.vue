<template>
  <el-table :data="modelValue" border>
    <el-table-column prop="label" :label="t('exam.questionType')" min-width="130" />
    <el-table-column :label="t('exam.availableCount')" width="110"><template #default="{ row }">{{ row.available ?? '-' }}</template></el-table-column>
    <el-table-column :label="t('exam.drawCount')" width="150"><template #default="{ row }"><el-input-number v-model="row.count" :min="0" :max="row.available ?? undefined" :disabled="disabled" /></template></el-table-column>
    <el-table-column :label="t('exam.scorePerQuestion')" width="150"><template #default="{ row }"><el-input-number v-model="row.score" :min="1" :disabled="disabled" /></template></el-table-column>
    <el-table-column :label="t('exam.drawMode')" min-width="140"><template #default="{ row }"><el-tag>{{ t('exam.random') }}</el-tag></template></el-table-column>
    <el-table-column :label="t('exam.grading')" min-width="140"><template #default="{ row }">{{ row.auto ? t('exam.autoGrade') : t('exam.manualGrade') }}</template></el-table-column>
  </el-table>
</template>

<script setup>
import { useI18n } from "vue-i18n";
defineProps({ modelValue: { type: Array, required: true }, disabled: Boolean });
const { t } = useI18n();
</script>
