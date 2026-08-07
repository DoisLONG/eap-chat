<template>
  <el-dialog v-model="visible" :title="t('examForm.selectUsers')" width="min(760px, calc(100vw - 32px))" align-center :close-on-click-modal="false" @closed="reset">
    <div class="user-select-dialog">
      <div class="user-select-search">
        <el-input v-model="keyword" :placeholder="t('examForm.userSearchPlaceholder')" clearable :prefix-icon="Search" @keyup.enter="search" @clear="search" />
        <el-button type="primary" :icon="Search" @click="search">{{ t('common.search') }}</el-button>
      </div>
      <el-table ref="tableRef" v-loading="loading" :data="list" row-key="id" :max-height="380" @selection-change="onSelectionChange">
        <el-table-column type="selection" width="46" reserve-selection />
        <el-table-column :label="t('userManagement.fullName')" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">{{ userName(row) }}</template>
        </el-table-column>
        <el-table-column prop="name" :label="t('userManagement.name')" min-width="120" show-overflow-tooltip />
        <el-table-column prop="email" :label="t('userManagement.email')" min-width="160" show-overflow-tooltip />
        <el-table-column :label="t('companyManagement.deptment')" min-width="110" show-overflow-tooltip>
          <template #default="{ row }">{{ orgName(row.department) }}</template>
        </el-table-column>
        <el-table-column :label="t('companyManagement.position')" min-width="110" show-overflow-tooltip>
          <template #default="{ row }">{{ orgName(row.position) }}</template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" :total="total" :page-size="pageSize" layout="total, prev, pager, next" @current-change="load" />
    </div>
    <template #footer>
      <div class="user-select-footer">
        <span class="user-select-count">{{ t('examForm.selectedUsersCount', { count: selectedCount }) }}</span>
        <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirm">{{ t('common.confirm') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { getUserList } from "@/services/user.service";

const props = defineProps({ modelValue: Boolean, selected: { type: Array, default: () => [] } });
const emit = defineEmits(["update:modelValue", "confirm"]);
const { t } = useI18n();
const visible = computed({ get: () => props.modelValue, set: value => emit("update:modelValue", value) });

const keyword = ref(""), list = ref([]), total = ref(0), page = ref(1), pageSize = ref(10), loading = ref(false);
const tableRef = ref();
// selectedMap 是跨页稳定名单：打开时由 props.selected 播种，表格勾选变化时同步；
// 已删除/停用用户不在列表里，仍保留在 map 中，可在外层标签处手动移除。
const selectedMap = ref(new Map());
const selectedCount = computed(() => selectedMap.value.size);
let requestId = 0;

function userName(row) { return row.full_name || row.name || `#${row.id}`; }
function orgName(value) { return value && typeof value === "object" ? value.name : value || "-"; }

async function load(targetPage = 1) {
  page.value = targetPage;
  const current = ++requestId;
  loading.value = true;
  try {
    const response = await getUserList({ name: keyword.value.trim() || undefined, pageNum: page.value, pageSize: pageSize.value });
    if (current !== requestId) return;
    list.value = response.data?.data?.data || [];
    total.value = response.data?.data?.total || 0;
    await nextTick();
    list.value.forEach(row => { if (selectedMap.value.has(Number(row.id))) tableRef.value?.toggleRowSelection(row, true); });
  } catch (error) {
    if (current === requestId) ElMessage.error(error.message || t("examForm.userListLoadFailed"));
  } finally {
    if (current === requestId) loading.value = false;
  }
}

function onSelectionChange(rows) {
  const map = new Map(selectedMap.value);
  rows.forEach(row => map.set(Number(row.id), row));
  // 当前页被取消勾选的行从名单移除；其他页已选行由 reserve-selection 保留在 rows 中
  list.value.forEach(row => { if (!rows.some(item => Number(item.id) === Number(row.id))) map.delete(Number(row.id)); });
  selectedMap.value = map;
}

function search() { load(1); }

function confirm() {
  emit("confirm", [...selectedMap.value.values()]);
  visible.value = false;
}

function reset() { requestId++; keyword.value = ""; list.value = []; total.value = 0; page.value = 1; selectedMap.value = new Map(); }

watch(() => props.modelValue, (show) => {
  if (show) {
    requestId++;
    keyword.value = "";
    selectedMap.value = new Map((props.selected || []).map(user => [Number(user.id), user]));
    load(1);
  }
});
</script>

<style scoped>
.user-select-dialog { display: grid; gap: 12px; }
.user-select-search { display: flex; gap: 8px; }
.user-select-footer { display: flex; align-items: center; gap: 10px; }
.user-select-count { flex: 1; color: var(--el-text-color-secondary); font-size: 13px; }
:deep(.el-pagination) { justify-content: flex-end; }
</style>
