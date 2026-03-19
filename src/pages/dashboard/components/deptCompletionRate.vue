<template>
  <div class="dept-completion-rate">
    <div class="header">
      <div class="header-title">
        {{ $t("dashboard.deptCompletionRate.title") }}
      </div>
      <div class="select-box">
        <el-select
          v-model="selectedDept"
          popper-style="border-radius: 8px"
          placeholder=""
          class="filter-select"
          @change="changeDept"
        >
          <el-option
            v-for="oitem in deptList"
            :key="oitem.value"
            :label="oitem.label"
            :value="oitem.value"
          />
          <template #prefix>
            <img src="@/assets/images/filter.png" class="select-prefix" />
          </template>
        </el-select>
      </div>
    </div>
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-value">
          {{ summary?.overall_completion_rate || "-" }}%
        </div>
        <div class="stat-content">
          <el-tooltip
            :content="$t('dashboard.deptCompletionRate.overallCompletionRate')"
            placement="top"
            effect="dark"
            :disabled="!isOverallCompletionRateOverflow"
          >
            <div
              class="stat-label sle"
              :style="{
                width: language === 'zh' ? 'auto' : 'calc(100% - 60px)',
              }"
              ref="overallCompletionRateRef"
              @mouseenter="checkOverflow($event)"
            >
              {{ $t("dashboard.deptCompletionRate.overallCompletionRate") }}
            </div>
          </el-tooltip>
          <div
            class="stat-change positive"
            style="width: 60px"
            v-if="isHaveData"
          >
            <img src="@/assets/images/up-icon.png" class="stat-change-icon" />{{
              summary?.completion_growth
            }}%
          </div>
          <div
            v-else
            class="stat-change"
            style="display: flex; align-items: center; width: 60px"
          >
            <img
              src="@/assets/images/unknown-icon.png"
              class="stat-change-icon"
            /><span>-</span>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-value">
          {{ summary?.active_sop_count }}
          <span class="stat-unit">/{{ summary?.total_sop_count }}</span>
        </div>
        <div class="stat-content">
          <el-tooltip
            :content="$t('dashboard.deptCompletionRate.inProgress')"
            placement="top"
            effect="dark"
            :disabled="!isInProgressOverflow"
          >
            <div
              class="stat-label"
              ref="inProgressRef"
              @mouseenter="checkOverflow($event)"
            >
              {{ $t("dashboard.deptCompletionRate.inProgress") }}
            </div>
          </el-tooltip>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-value" :class="[{ 'stat-value-warning': isHaveData }]">
          {{ formatNumber(summary?.pending_count) }}
        </div>
        <div class="stat-content">
          <el-tooltip
            :content="$t('dashboard.deptCompletionRate.pendingCount')"
            placement="top"
            effect="dark"
            :disabled="!isPendingCountOverflow"
          >
            <div
              class="stat-label sle"
              :style="{
                width: language === 'zh' ? 'auto' : '50%',
              }"
              ref="pendingCountRef"
              @mouseenter="checkOverflow($event)"
            >
              {{ $t("dashboard.deptCompletionRate.pendingCount") }}
            </div>
          </el-tooltip>
          <el-tooltip
            :content="
              summary?.due_soon_count +
              $t('dashboard.deptCompletionRate.dueSoon')
            "
            placement="top"
            effect="dark"
            :disabled="!isDueSoonOverflow"
            v-if="isHaveData"
          >
            <div
              class="stat-warning sle"
              :style="{
                width: language === 'zh' ? 'auto' : '50%',
              }"
              ref="dueSoonRef"
              @mouseenter="checkOverflow($event)"
            >
              {{ summary?.due_soon_count
              }}{{ $t("dashboard.deptCompletionRate.dueSoon") }}
            </div>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div class="table-container" v-if="isHaveData">
      <el-table
        :data="tasks"
        :header-cell-style="{ background: '#F9FAFB', fontWeight: 'normal' }"
        style="width: 100%"
        height="242px"
        class="task-table"
      >
        <el-table-column
          prop="name"
          show-overflow-tooltip
          :label="$t('dashboard.deptCompletionRate.taskName')"
          min-width="220"
        >
          <template #default="{ row }">
            <span class="task-name">{{ row.task_name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="health"
          show-overflow-tooltip
          :label="$t('dashboard.deptCompletionRate.health')"
          min-width="80"
        >
          <template #default="{ row }">
            <span>{{ row.health_score }}</span>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="completionRate"
          :label="$t('dashboard.deptCompletionRate.completionRate')"
          min-width="80"
        >
          <template #default="{ row }">
            <span>{{ row.completion_rate }}%</span>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          :label="$t('dashboard.deptCompletionRate.pendingCompleted')"
          min-width="110"
        >
          <template #default="{ row }">
            <span>{{ row.pending_count }}/{{ row.completed_count }}</span>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          :label="$t('dashboard.deptCompletionRate.status')"
          min-width="80"
        >
          <template #default="{ row }">
            <span
              :class="
                ['running', 'RUNNING'].includes(row.status)
                  ? 'task-status-primary'
                  : 'task-status'
              "
              >{{
                ["running", "RUNNING"].includes(row.status)
                  ? $t("dashboard.deptCompletionRate.running")
                  : $t("dashboard.deptCompletionRate.expired")
              }}</span
            >
          </template>
        </el-table-column>
        <!-- <el-table-column label="趋势" min-width="100">
          <template #default="{ row }">
            <div class="trend-chart">
              <svg width="100" height="20" viewBox="0 0 100 20">
                <path
                  :d="row.trendPath"
                  :stroke="row.status === 'in_progress' ? '#00c950' : '#ff6467'"
                  stroke-width="2"
                  fill="none"
                />
              </svg>
            </div>
          </template>
        </el-table-column> -->
      </el-table>
    </div>
    <div v-else class="table-container no-data">
      <img src="@/assets/images/nodata.png" class="no-data-icon" />
      <div class="no-data-text">
        {{ $t("dashboard.deptCompletionRate.noTask") }}
      </div>
      <div class="no-data-text-warning">
        {{ $t("dashboard.deptCompletionRate.addTask") }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { getDeptList } from "@/services/company.service";
import { formatNumber } from "@/utils/index";
import { getDepartmentExam } from "@/services/dashboard.service";
import { useI18n } from "vue-i18n";
import { useGlobalStore } from "@/stores/modules/global";

const globalStore = useGlobalStore();
const language = computed(() => globalStore.language);

const { t } = useI18n();

// 部门选择
const selectedDept = ref("total");
const deptList = ref([]);

// 文本溢出检测
const overallCompletionRateRef = ref(null);
const inProgressRef = ref(null);
const pendingCountRef = ref(null);
const dueSoonRef = ref(null);

// 溢出状态
const isOverallCompletionRateOverflow = ref(false);
const isInProgressOverflow = ref(false);
const isPendingCountOverflow = ref(false);
const isDueSoonOverflow = ref(false);

// 检测文本是否溢出
const isTextOverflow = (el) => {
  if (!el) return false;
  return el.scrollWidth > el.clientWidth;
};

// 检查溢出并设置状态
const checkOverflow = (event) => {
  const el = event.target;
  const refMap = {
    overallCompletionRateRef: isOverallCompletionRateOverflow,
    inProgressRef: isInProgressOverflow,
    pendingCountRef: isPendingCountOverflow,
    dueSoonRef: isDueSoonOverflow,
  };

  // 根据元素找到对应的ref和状态变量
  Object.entries(refMap).forEach(([refName, statusRef]) => {
    if (el === eval(refName).value) {
      statusRef.value = isTextOverflow(el);
    }
  });
};

const isHaveData = computed(() => tasks.value?.length);

const summary = ref({});
const tasks = ref([]);
const queryDept = () => {
  const params = {};
  getDeptList(params).then((res) => {
    const data = res.data.results || [];
    deptList.value = data.map((item) => ({
      label: item.department_name,
      value: item.department_id,
    }));
    deptList.value.unshift({
      label: t("dashboard.deptCompletionRate.allCompany"),
      value: "total",
    });
  });
};
queryDept();
// 获取数据
const getData = () => {
  const params = {};
  if (selectedDept.value !== "total") {
    params.department_id = selectedDept.value;
  }
  getDepartmentExam(params).then((res) => {
    // console.log("各部门考试完成率", res);
    if (res.data.status === 200) {
      summary.value = res.data.data.summary || {};
      tasks.value = res.data.data.list || [];
    }
  });
};
getData();
const changeDept = () => {
  getData();
};
</script>

<style scoped lang="scss">
.dept-completion-rate {
  background-color: #fff;
  border-radius: 8px;
  padding: 0px 24px 24px 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  height: 28px;
  line-height: 28px;
  color: #01021d;
}

.select-box {
  width: 140px;
  height: 36px;
  .select-prefix {
    width: 16px;
    height: 16px;
  }
}

.stats-cards {
  display: flex;
  width: 100%;
  margin-top: 16px;
  // display: grid;
  // grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  width: calc(33.33% - 11px);
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  position: relative;
  box-sizing: border-box;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.stat-value {
  font-size: 30px;
  font-weight: 700;
  color: #01021d;
  height: 36px;
  line-height: 36px;
  margin-bottom: 6px;
}
.stat-content {
  height: 20px;
  display: flex;
  align-items: center;
}
.stat-unit {
  font-size: 14px;
  font-weight: 400;
  color: #01021d;
}

.stat-label {
  font-size: 14px;
  color: #6a7282;
  margin-right: 6px;
  font-weight: 400;
}
.stat-value-warning {
  color: #ff6467;
}

.stat-change {
  font-size: 12px;
  .stat-change-icon {
    width: 10px;
    height: 10px;
    margin-right: 4px;
  }
}

.stat-change.positive {
  color: #00c950;
}

.stat-warning {
  font-size: 14px;
  color: #ff6467;
  font-weight: bold;
}
.filter-select {
  height: 36px;
}

.filter-select :deep(.el-select__wrapper) {
  height: 36px;
}

.table-container {
  margin-top: 25px;
  overflow-x: auto;
}

.task-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.task-status {
  color: #6a7282;
}
.task-status-primary {
  color: #00c950;
}

.trend-chart {
  width: 100px;
  height: 20px;
}

.task-name {
  display: block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-table {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

// 无数据
.no-data {
  width: 100%;
  height: 342px;
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;
  .no-data-icon {
    width: 100px;
    height: 100px;
  }
  .no-data-text {
    height: 20px;
    line-height: 20px;
    font-size: 14px;
    font-weight: 500;
    color: #01021d;
    margin-top: 12px;
  }
  .no-data-text-warning {
    height: 16px;
    line-height: 16px;
    font-size: 12px;
    font-weight: 400;
    color: #99a1af;
    margin-top: 8px;
  }
}
</style>
