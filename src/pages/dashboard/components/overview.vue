<template>
  <div class="dashboard-stats">
    <div class="stat-card" v-for="item in overviewData" :key="item.title">
      <div class="stat-title">
        <span>{{ item.title }}</span>
        <el-tooltip
          class="box-item"
          effect="dark"
          :content="item.tooltip"
          placement="right"
          :popper-style="{
            width: (item?.tooltipWidth || 150) + 'px',
            boxSizing: 'border-box',
            background: 'rgba(1, 2, 29, 0.8)',
            fontSize: '12px',
            borderRadius: '8px',
            padding: '12px',
          }"
        >
          <img
            src="@/assets/images/error-warning-line.png"
            class="stat-title-icon"
          />
        </el-tooltip>
      </div>
      <div class="stat-value">
        <div>{{ item.number }}</div>
        <img :src="item.icon" style="width: 48px; height: 48px" />
      </div>
      <div class="stat-change" v-if="item.change > 0">
        <img src="@/assets/images/up-icon.png" class="stat-change-icon" />
        <span class="positive">{{ item.change }}</span>
        <span class="common">较上周</span>
        <span class="positive">新增</span>
      </div>
      <div class="stat-change" v-else-if="item.change < 0">
        <img src="@/assets/images/down-icon.png" class="stat-change-icon" />
        <span class="negative">{{ item.change }}</span>
        <span class="common">较上周</span>
        <span class="negative">下降</span>
      </div>
      <div class="stat-change" v-else>
        <img src="@/assets/images/unknown-icon.png" class="stat-change-icon" />
        <span class="neutral">-</span>
        <span class="common">较上周</span>
        <span class="neutral">-</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, toRefs } from "vue";
import userIcon from "@/assets/images/users.png";
import activeUsersIcon from "@/assets/images/active-users.png";
import totalStudyHoursIcon from "@/assets/images/total-study-hours.png";
import activityIcon from "@/assets/images/activity.png";
import testIcon from "@/assets/images/test.png";
import { formatNumber } from "@/utils/index";

const props = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});
const { data } = toRefs(props);

const overviewData = computed(() => {
  return [
    {
      title: "用户数",
      tooltip: "本周登录使用平台的用户数",
      icon: userIcon,
      number: formatNumber(data.value.total_users?.statistics_user_count),
      change: Number(data.value.total_users?.compare_result) || 0,
    },
    {
      title: "活跃用户",
      tooltip: "本周内累计学习时长超过30分钟的活跃用户数",
      tooltipWidth: 152,
      icon: activeUsersIcon,
      number: formatNumber(data.value.active_users?.statistics_active_users),
      change: Number(data.value.active_users?.compare_result) || 0,
    },
    {
      title: "总学习时长(h)",
      tooltip: "本周所有用户累计学习时长的总和(单位:小时)",
      icon: totalStudyHoursIcon,
      number: formatNumber(
        data.value.total_learn_seconds?.statistics_learn_seconds,
      ),
      change: Number(data.value.total_learn_seconds?.compare_result) || 0,
    },
    {
      title: "达标率(%)",
      tooltip: "本周考试达标人数占所有参加考试人员的比例",
      icon: activityIcon,
      number: data.value.avg_pass_rate?.statistics_avg_pass_rate,
      change: Number(data.value.avg_pass_rate?.compare_result) || 0,
    },
    {
      title: "考试场次",
      tooltip: "本周独立举办的考试场次数",
      icon: testIcon,
      number: formatNumber(data.value.exam_count?.statistics_exam_count),
      change: Number(data.value.exam_count?.compare_result) || 0,
    },
  ];
});
</script>
<style scoped lang="scss">
.dashboard-stats {
  margin-top: 26px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-title {
  height: 20px;
  font-size: 14px;
  color: #6a7282;
  display: flex;
  align-items: center;
  .stat-title-icon {
    width: 16px;
    height: 16px;
    margin-left: 4px;
  }
}

.stat-value {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-value div {
  width: calc(100% - 56px);
  font-size: 30px;
  font-weight: 700;
  color: #01021d;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.stat-icon {
  font-size: 28px;
  color: #409eff;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  font-weight: 400;
  margin-top: 12px;
  .stat-change-icon {
    width: 10px;
    height: 10px;
    margin-right: 4px;
  }
}

.stat-change .common {
  color: #99a1af;
  font-weight: 400;
  font-size: 12px;
  margin-left: 6px;
}
.stat-change .positive {
  color: #00c950;
}

.stat-change .negative {
  color: #ff6467;
}

.stat-change .neutral {
  color: #99a1af;
}

.stat-change el-icon {
  margin-right: 4px;
  font-size: 12px;
}
</style>
