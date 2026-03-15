<template>
  <div class="grades-rank-container">
    <!-- 标题 -->
    <div class="grades-rank-header">
      <span> 成绩排名 </span>
      <el-tooltip
        class="box-item"
        effect="dark"
        content="展示指定考核下已完成考试用户的成绩排名"
        popper-style="width: 150px; box-sizing: border-box; background: rgba(1, 2, 29, 0.8); font-size: 12px; border-radius: 8px; padding: 12px;"
        placement="right"
      >
        <img
          src="@/assets/images/error-warning-line.png"
          class="stat-title-icon"
        />
      </el-tooltip>
    </div>

    <el-row :gutter="24">
      <!-- 左侧：筛选区域 + 考核名称选择 + 考核信息 -->
      <el-col :span="12">
        <!-- 筛选区域 -->
        <div class="filter-area">
          <el-input
            v-model="keyword"
            placeholder="输入关键词"
            class="search-input"
            @keyup.enter="getSopListData"
          >
            <template #prefix>
              <img src="@/assets/images/search.png" class="search-prefix" />
            </template>
          </el-input>
          <div class="filter-row">
            <el-select
              v-model="deptFilter"
              popper-style="border-radius: 8px"
              class="filter-select"
              placeholder="部门筛选"
              @change="getSopListData"
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
            <el-select
              v-model="timeDimension"
              placeholder="时间维度"
              class="filter-select"
              @change="getSopListData"
            >
              <el-option label="全部时间" value="all" />
              <el-option label="本周" value="week" />
              <el-option label="本月" value="month" />
              <el-option label="本季度" value="quarter" />
              <template #prefix>
                <img src="@/assets/images/calendar.png" class="select-prefix" />
              </template>
            </el-select>
            <el-button
              type="default"
              text
              @click="resetFilters"
              class="reset-button"
              >重置</el-button
            >
          </div>
        </div>

        <!-- 考核名称选择 -->
        <div class="exam-select" style="display: flex">
          <el-select
            v-model="currentSop"
            placeholder="请选择SOP"
            size="small"
            @visible-change="handleVisibleChange"
            class="exam-select-dropdown"
          >
            <el-option
              v-for="oitem in sopList"
              :key="oitem.sop_id"
              :label="oitem.sop_title"
              :value="oitem.sop_id"
            />
            <template #prefix>
              <span class="select-label">{{
                currentSopLabel || "请选择SOP"
              }}</span>
              <img
                src="@/assets/images/arrow-down.png"
                class="select-prefix"
                :class="{ 'rotate-180': isDeptDropdownOpen }"
              />
            </template>
          </el-select>
        </div>

        <!-- 考核信息 -->
        <div
          class="exam-info-card"
          v-if="exam_info && JSON.stringify(exam_info) !== '{}'"
        >
          <div class="exam-title">{{ currentSopLabel }}</div>
          <div class="exam-info-item">
            <img src="@/assets/images/building.png" class="exam-info-icon" />
            <span>所属部门：{{ exam_info?.sop_title || "-" }}</span>
          </div>
          <div class="exam-info-item">
            <img src="@/assets/images/calendar.png" class="exam-info-icon" />
            <span
              >时间：{{ exam_info?.start_time || "-" }} -
              {{ exam_info?.end_time || "-" }}</span
            >
          </div>
          <div class="exam-stats">
            <div class="stat-item">
              <div class="stat-label">
                <img
                  src="@/assets/images/usergroup.png"
                  class="stat-label-icon"
                />
                <span>应考人数</span>
              </div>
              <div class="stat-value">
                {{ exam_info?.total_participants }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">
                <div class="stat-label-dot"></div>
                <span>已完成</span>
              </div>
              <div class="stat-value completed">
                {{ exam_info?.completed_participants }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">完成率</div>
              <div class="stat-value">{{ exam_info?.completion_rate }}%</div>
            </div>
          </div>
        </div>
        <div v-else class="exam-info-card exam-info-no-data">
          <img src="@/assets/images/nodata.png" class="no-data-icon" />
          <div class="no-data-text">暂无SOP</div>
        </div>
      </el-col>

      <!-- 右侧：成绩排名详情 -->
      <el-col :span="12">
        <div class="ranking-card">
          <div class="ranking-card-content">
            <div class="ranking-header">
              <div class="ranking-title">
                <img
                  src="@/assets/images/trendingUp.png"
                  class="ranking-title-icon"
                />
                <span>成绩排名详情</span>
              </div>
              <div class="participant-count">
                <img
                  src="@/assets/images/usergroup.png"
                  class="participant-count-icon"
                />
                <span>当前展示人数: {{ showCount }}</span>
              </div>
            </div>
            <div class="ranking-subtitle">
              当前展示:
              {{ currentSopLabel || "-" }}
            </div>
            <div class="ranking-list-wrapper" v-if="rankingData.length > 0">
              <div class="ranking-list">
                <div
                  v-for="(item, index) in rankingData"
                  :key="index"
                  class="ranking-item"
                >
                  <div class="ranking-number" :class="{ top3: item.rank <= 3 }">
                    {{ item.rank }}
                  </div>
                  <el-avatar :size="32" class="user-avatar">{{
                    item.user_name.charAt(0)
                  }}</el-avatar>
                  <div class="user-info">
                    <div class="user-name">{{ item.user_name }}</div>
                    <div class="user-dept">{{ item.department }}</div>
                  </div>
                  <div class="user-score">{{ item.score }}分</div>
                  <div
                    class="rank-change"
                    :class="{
                      up: Number(item.rank_change) > 0,
                      down: Number(item.rank_change) < 0,
                      'no-change': Number(item.rank_change) === 0,
                    }"
                  >
                    <template v-if="Number(item.rank_change) > 0">
                      <img
                        src="@/assets/images/chevronUp.png"
                        class="rank-change-icon"
                      />
                      <span>{{ Math.abs(Number(item.rank_change)) }}</span>
                    </template>
                    <template v-else-if="Number(item.rank_change) < 0">
                      <img
                        src="@/assets/images/chevronDown.png"
                        class="rank-change-icon"
                      />
                      <span>{{ Math.abs(Number(item.rank_change)) }}</span>
                    </template>
                    <span v-else>-</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="ranking-list-wrapper ranking-no-data">
              <img src="@/assets/images/nodata.png" class="no-data-icon" />
              <div class="no-data-text">暂无成绩排名</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { getDeptList } from "@/services/company.service";
import { getRank, getSopList } from "@/services/dashboard.service";

const deptList = ref<{ label: string; value: string }[]>([]);
const keyword = ref("");
const deptFilter = ref("");
const timeDimension = ref("");
const currentSop = ref(""); // 当前选择
const sopList = ref<{ sop_title: string; sop_id: string }[]>([]);
const exam_info = ref<{
  sop_title: string;
  start_time: string;
  end_time: string;
  total_participants: number;
  completed_participants: number;
  completion_rate: number;
}>();
const showCount = ref(0);
const rankingData = ref<
  {
    user_name: string;
    department: string;
    score: number;
    rank: number;
    rank_change: number;
  }[]
>([]);

// 生成日期范围
const generateDateRange = (dimension: string) => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (dimension) {
    case "week":
      // 本周：从周一开始，到周日结束
      const dayOfWeek = now.getDay() || 7; // 将周日(0)转换为7
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek + 1);
      endDate = new Date(now);
      endDate.setDate(now.getDate() + (7 - dayOfWeek));
      break;
    case "month":
      // 本月：从1号到月底
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case "quarter":
      // 本季度：从季度第一天到季度最后一天
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      break;
    default:
      return { start_time: "", end_time: "" };
  }

  // 格式化日期为YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  return {
    start_time: formatDate(startDate),
    end_time: formatDate(endDate),
  };
};

const getSopListData = () => {
  const params: any = {};
  if (keyword.value) {
    params.keyword = keyword.value;
  }
  if (deptFilter.value) {
    params.department_id = deptFilter.value;
  }
  if (timeDimension.value && timeDimension.value !== "all") {
    const dateRange = generateDateRange(timeDimension.value);
    params.start_time = dateRange.start_time;
    params.end_time = dateRange.end_time;
  }
  // 清空选中的sop
  currentSop.value = "";
  exam_info.value = undefined;
  rankingData.value = [];

  getSopList(params).then((res) => {
    if (res.data.status === 200) {
      sopList.value = res.data.data || [];
      currentSop.value = sopList.value[0]?.sop_id || "";
      getRankData();
    }
  });
};
getSopListData();
const currentSopLabel = computed(() => {
  return (
    sopList.value.find((item) => item.sop_id === currentSop.value)?.sop_title ||
    ""
  );
});
const getRankData = () => {
  const params = {
    sop_id: currentSop.value,
  };
  getRank(params).then((res) => {
    console.log("成绩排名", res);
    if (res.data.status === 200) {
      exam_info.value = res.data.data.exam_info || {};
      rankingData.value = res.data.data.ranking || [];
      showCount.value = res.data.data.count || 0;
    }
  });
};

// 获取部门列表
const queryDept = () => {
  const params: any = {};
  getDeptList(params).then((res) => {
    const data = res.data.results || [];
    deptList.value = data.map((item: any) => ({
      label: item.department_name,
      value: item.department_id,
    }));
  });
};
queryDept();
// sop选择框是否打开
const isDeptDropdownOpen = ref(false);
const handleVisibleChange = (visible: boolean) => {
  isDeptDropdownOpen.value = visible;
};

const resetFilters = () => {
  keyword.value = "";
  deptFilter.value = "";
  timeDimension.value = "";
  getSopListData();
};
</script>

<style scoped lang="scss">
.grades-rank-container {
  padding: 16px 24px 24px 24px;
  background-color: #ffffff;
  border-radius: 8px;
}

.grades-rank-header {
  height: 28px;
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  span {
    font-size: 18px;
    font-weight: 600;
    height: 28px;
    line-height: 28px;
    color: #01021d;
  }
  .stat-title-icon {
    width: 16px;
    height: 16px;
    margin-left: 4px;
  }
}

.filter-area {
  .search-prefix {
    width: 20px;
    height: 20px;
  }
  .select-prefix {
    width: 16px;
    height: 16px;
  }
}

.search-input {
  width: 100%;
  height: 36px;
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-select {
  height: 36px;
  flex: 1;
  min-width: 120px;
}

.filter-select :deep(.el-select__wrapper) {
  height: 36px;
}
.reset-button {
  white-space: nowrap;
}

.exam-select-dropdown {
  height: 20px;
  width: 100%;
}
.exam-select-dropdown :deep(.el-select__wrapper) {
  height: 20px;
  box-shadow: none;
}
.exam-select-dropdown :deep(.el-select__selection),
.exam-select-dropdown :deep(.el-select__suffix) {
  display: none;
}

.exam-select {
  margin-bottom: 24px;
  .select-prefix {
    width: 16px;
    height: 16px;
    transition: transform 0.3s ease;
  }
  .select-prefix.rotate-180 {
    transform: rotate(180deg);
  }
  .select-label {
    color: #0f172b;
    font-weight: bold;
    font-size: 14px;
    text-decoration: underline;
    margin-right: 4px;
  }
}

.exam-info-card {
  padding: 16px 24px;
  background-color: #fafbfc;
  border-radius: 8px;
}

.exam-info-card .exam-title {
  height: 25px;
  line-height: 25px;
  font-size: 18px;
  font-weight: 500;
  color: #0f172b;
}
.exam-info-no-data {
  width: 100%;
  height: 218px;
  box-sizing: border-box;
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

.exam-info-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  height: 20px;
  color: #62748e;
  margin-top: 8px;
  .exam-info-icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }
}

.exam-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  background-color: #fff;
  border-radius: 14px;
  padding: 16px 0;
}

.stat-item {
  width: 33.33%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  &:not(:last-child)::after {
    content: "";
    position: absolute;
    right: 0;
    top: 25%;
    bottom: 25%;
    width: 1px;
    background-color: #e4e7ed;
  }
}

.stat-label {
  height: 16px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #90a1b9;
  .stat-label-icon {
    width: 12px;
    height: 12px;
    margin-right: 4px;
  }
  .stat-label-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #0065ff;
    margin-right: 4px;
  }
}

.stat-value {
  height: 28px;
  line-height: 28px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172b;
  margin-top: 4px;
}

.stat-value.completed {
  color: #0065ff;
}

.ranking-card {
  height: 366px;
  background-color: #fafbfc;
  border-radius: 8px;
  padding: 16px 0 0 16px;
  box-sizing: border-box;
  box-sizing: border-box;
  overflow: hidden;
  .ranking-card-content {
    height: 100%;
  }
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-right: 16px;
}

.ranking-title {
  height: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #01021d;
  .ranking-title-icon {
    width: 16px;
    height: 16px;
  }
}

.participant-count {
  height: 23px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  background-color: #fff;
  gap: 4px;
  padding: 0 8px;
  font-size: 12px;
  color: #99a1af;
  .participant-count-icon {
    width: 12px;
    height: 12px;
  }
}

.ranking-subtitle {
  font-size: 12px;
  margin-left: 24px;
  color: #6a7282;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ranking-list-wrapper {
  height: calc(100% - 46px);
  overflow: hidden;
}
.ranking-no-data {
  width: 100%;
  height: 100%;
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
.ranking-list {
  height: 100%;
  overflow-y: auto;
  margin-top: 20px;
  padding-right: 16px;
  box-sizing: border-box;
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
}

.ranking-item {
  display: flex;
  align-items: center;
  height: 44px;
  gap: 12px;
  margin-bottom: 8px;
}
.ranking-item:hover {
  background-color: #ecf5ff;
}

// .ranking-item:last-child {
//   border-bottom: none;
// }

.ranking-number {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  background-color: #0065ff;
}

.ranking-number:not(.top3) {
  background-color: #dcdfe6;
  color: #606266;
}

.user-avatar {
  background-color: #dbeafe;
  color: #2b7fff;
  font-size: 12px;
}

.user-info {
  flex: 1;
}

.user-name {
  height: 20px;
  line-height: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #01021d;
  margin-bottom: 2px;
}

.user-dept {
  height: 16px;
  line-height: 16px;
  font-size: 12px;
  color: #99a1af;
}

.user-score {
  height: 20px;
  line-height: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #01021d;
  min-width: 60px;
  text-align: left;
}

.rank-change {
  height: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  min-width: 40px;
  text-align: right;
  font-weight: 700;
  .rank-change-icon {
    width: 16px;
    height: 16px;
  }
}

.rank-change.up {
  color: #00bc7d;
}

.rank-change.down {
  color: #ff6467;
}

.rank-change.no-change {
  color: #99a1af;
}

.change-icon {
  font-size: 12px;
}
</style>
