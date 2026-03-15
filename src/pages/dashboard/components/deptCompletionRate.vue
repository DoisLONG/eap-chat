<template>
  <div class="dept-completion-rate">
    <div class="header">
      <div class="header-title">各部门完成度</div>
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
          <div class="stat-label">整体完成率</div>
          <div class="stat-change positive" v-if="isHaveData">
            <img src="@/assets/images/up-icon.png" class="stat-change-icon" />{{
              summary?.completion_growth
            }}%
          </div>
          <div
            class="stat-change"
            v-else
            style="display: flex; align-items: center"
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
          <div class="stat-label">进行中</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-value" :class="[{ 'stat-value-warning': isHaveData }]">
          {{ formatNumber(summary?.pending_count) }}
        </div>
        <div class="stat-content">
          <div class="stat-label">待考人次</div>
          <div class="stat-warning" v-if="isHaveData">
            {{ summary?.due_soon_count }}人即将到期
          </div>
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
          label="任务名称"
          min-width="220"
        >
          <template #default="{ row }">
            <span class="task-name">{{ row.task_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="health" label="健康度" min-width="80">
          <template #default="{ row }">
            <span>{{ row.health_score }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="completionRate" label="完成率" min-width="80">
          <template #default="{ row }">
            <span>{{ row.completion_rate }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="待考/已完成" min-width="110">
          <template #default="{ row }">
            <span>{{ row.pending_count }}/{{ row.completed_count }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="80">
          <template #default="{ row }">
            <span
              :class="
                ['running', 'RUNNING'].includes(row.status)
                  ? 'task-status-primary'
                  : 'task-status'
              "
              >{{
                ["running", "RUNNING"].includes(row.status)
                  ? "进行中"
                  : "已截止"
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
      <div class="no-data-text">暂无SOP任务</div>
      <div class="no-data-text-warning">请添加考试任务</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { getDeptList } from "@/services/company.service";
import { formatNumber } from "@/utils/index";
import { getDepartmentExam } from "@/services/dashboard.service";

// 部门选择
const selectedDept = ref("total");
const deptList = ref([]);

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
      label: "全公司",
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
    console.log("各部门考试完成率", res);
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
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  position: relative;
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
