<template>
  <div class="study-task-dashboard">
    <div class="dashboard-header">
      <div class="dashboard-title">学习任务看板</div>

      <el-select
        v-model="timeDimension"
        placeholder="时间维度"
        class="time-select"
        @change="getData"
      >
        <!-- <el-option label="全部时间" value="all" /> -->
        <el-option label="本周" value="week" />
        <el-option label="本月" value="month" />
        <el-option label="本季度" value="quarter" />
        <template #prefix>
          <img src="@/assets/images/calendar.png" class="select-prefix" />
        </template>
      </el-select>
    </div>

    <div v-if="tasks.length > 0" class="dashboard-content-container">
      <div class="dashboard-content">
        <div
          v-for="(task, index) in tasks"
          :key="task.task_id"
          class="task-card"
          :class="{ 'last-card': index === tasks.length - 1 }"
        >
          <div class="task-title">{{ task.task_name }}</div>
          <div class="task-stats">
            <div class="stat-item">
              <div class="stat-label">实参/应参</div>
              <div class="stat-value">
                {{ task.participant_count }}/{{ task.should_participant_count }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">学习时长</div>
              <div class="stat-value">{{ task.study_duration }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">健康值</div>
              <div
                class="stat-value"
                :class="{
                  healthy: task.health_status >= 60,
                  unhealthy: task.health_status < 60,
                }"
              >
                {{ task.health_status }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-data">
      <img src="@/assets/images/nodata.png" class="no-data-icon" />
      <div class="no-data-text">暂无学习任务</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { getTaskBoard } from "@/services/dashboard.service";

const timeDimension = ref("week");
const tasks = ref<
  {
    task_id: string;
    task_name: string;
    participant_count: number;
    should_participant_count: number;
    study_duration: number;
    health_status: number;
  }[]
>([]);

const getData = () => {
  const params = {
    period: timeDimension.value,
  };
  getTaskBoard(params).then((res) => {
    if (res.data.status === 200) {
      tasks.value = res.data.data.list || [];
    }
  });
};
getData();
</script>

<style scoped lang="scss">
.study-task-dashboard {
  background: #ffffff;
  border-radius: 8px;
  padding-bottom: 16px;

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    padding: 0 24px;
    box-sizing: border-box;

    .dashboard-title {
      font-size: 18px;
      font-weight: 600;
      color: #01021d;
    }

    .time-select {
      max-width: 140px;
      height: 36px;
      flex: 1;
      min-width: 120px;
      .select-prefix {
        width: 16px;
        height: 16px;
      }
    }
    .time-select :deep(.el-select__wrapper) {
      height: 36px;
    }
  }
  .dashboard-content-container {
    width: 100%;
    padding: 0 24px;
    box-sizing: border-box;
    overflow: hidden;
  }

  .dashboard-content {
    width: 100%;
    max-height: 350px;
    margin-top: 5px;
    overflow-y: auto;
    border: 1px solid #e4e7ed;
    border-radius: 8px;

    // 滚动条样式
    &::-webkit-scrollbar {
      width: 3px;
    }

    &::-webkit-scrollbar-track {
      background: #fafbfc;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #d9d9d9;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }

    .task-card {
      border-bottom: 1px solid #e4e7ed;
      transition: all 0.3s ease;

      &:hover {
        background-color: #f5f7fa;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      &.last-card {
        border-bottom: none;
      }

      .task-title {
        height: 48px;
        line-height: 48px;
        font-size: 14px;
        padding: 0 16px;
        font-weight: 500;
        color: #01021d;
        box-sizing: border-box;
        background-color: #f9fafb;
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .task-stats {
        display: flex;
        padding: 12px 16px;

        .stat-item {
          width: 33.33%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;

          .stat-label {
            height: 20px;
            line-height: 20px;
            font-size: 14px;
            color: #6a7282;
            font-weight: 400;
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 14px;
            font-weight: 500;
            color: #01021d;

            &.healthy {
              color: #00c950;
            }

            &.unhealthy {
              color: #ff6467;
            }
          }
        }
      }
    }
  }
}
// 无数据
.no-data {
  width: 100%;
  height: 380px;
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
}
</style>
