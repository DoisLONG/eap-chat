<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div>仪表盘</div>
      <span class="update-time">{{ todayDate }} 00:00:00 更新数据</span>
    </div>
    <div v-if="isOnline">
      <overview :data="overviewData" />
      <div class="main-card">
        <!-- 左侧 -->
        <div class="left-card" :style="{ width: `${leftCardWidth}px` }">
          <!-- 在线热力图 -->
          <heatmap
            ref="heatmapRef"
            v-if="isHeatmapShow"
            :areasize="heatmapAreaSize"
          />
          <div class="area-card">
            <deptCompletionRate />
          </div>
          <div class="area-card">
            <gradesRank />
          </div>
        </div>
        <!-- 右侧 -->
        <div class="right-card" :style="{ width: rightCardWidth }">
          <welcome />
          <div class="area-card">
            <announcement />
          </div>
          <div class="area-card">
            <studyTaskDashboard />
          </div>
          <div class="area-card">
            <resourceOverview />
          </div>
        </div>
      </div>
    </div>
    <div v-else class="offline-container">
      <div class="no-data-icon">
        <img src="@/assets/images/offline.png" class="no-data-icon" />
      </div>
      <div class="no-data-text">失去连接</div>
      <div class="no-data-text-warning">
        哎呀……未找到网络连接。请检查您的网络连接
      </div>
      <div>
        <el-button
          type="primary"
          class="retry"
          @click="retryNetwork"
          :loading="isChecking"
        >
          {{ isChecking ? "检查中..." : "再试一次" }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useGlobalStore } from "@/stores/modules/global";
import overview from "./components/overview.vue";
import heatmap from "./components/heatmap.vue";
import deptCompletionRate from "./components/deptCompletionRate.vue";
import gradesRank from "./components/gradesRank.vue";
import welcome from "./components/welcome.vue";
import announcement from "./components/announcement.vue";
import studyTaskDashboard from "./components/studyTaskDashboard.vue";
import resourceOverview from "./components/resourceOverview.vue";
import { getOverview } from "@/services/dashboard.service";

const isOnline = ref(true); // 是否有网络
const isChecking = ref(false); // 是否正在检查网络
// console.log("w", (window.innerWidth - 240 - 48 - 320 - 16 - 48) / 31);
const globalStore = useGlobalStore();
const isCollapse = computed(() => globalStore.isCollapse);
const daysInMonth = 30; // 热力图显示30天数据
// const heatmapAreaSize = ref(22); // 默认热力图小块大小
const heatmapAreaSize = computed(() => {
  return Math.floor(
    (window.innerWidth -
      (isCollapse.value ? 65 : 240) -
      48 -
      320 -
      16 -
      48 -
      80) /
      daysInMonth,
  ); // -菜单栏-padding-右侧栏-ml-leftCardWidth的padding
});
const leftCardWidth = computed(() => {
  return `${heatmapAreaSize.value * daysInMonth + 48}`; // 左右padding 48px
});
const rightCardWidth = computed(() => {
  return `calc(100% - ${leftCardWidth.value}px - 16px)`; // - 左侧宽度+ml16px
});
const overviewData = ref([]);
const isHeatmapShow = ref(true); // 是否显示热力图

// 当天日期
const todayDate = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return `${year}.${month}.${day}`;
});
// 尺寸变化需要重绘热力图
watch(
  () => heatmapAreaSize.value,
  () => {
    isHeatmapShow.value = false;
    nextTick(() => {
      isHeatmapShow.value = true;
    });
  },
);
// 检查网络连接&获取概览
const checkNetwork = async () => {
  if (isChecking.value) return;
  isChecking.value = true;
  try {
    const response = await getOverview();
    console.log("概览", response);
    if (response.data.status === 200) {
      overviewData.value = response.data.data || {};
    }
    isOnline.value = response.statusText === "OK";
  } catch (error) {
    isOnline.value = false;
  } finally {
    isChecking.value = false;
  }
};

const retryNetwork = async () => {
  await checkNetwork();
};

const handleNetworkChange = () => {
  checkNetwork();
};

onMounted(() => {
  checkNetwork();
  window.addEventListener("online", handleNetworkChange);
  window.addEventListener("offline", handleNetworkChange);
});
</script>

<style scoped>
.dashboard-header {
  display: flex;
  align-items: center;
  height: 32px;
}

.dashboard-header div {
  font-size: 24px;
  font-weight: 500;
  color: #01021d;
}

.update-time {
  font-size: 14px;
  color: #99a1af;
  margin-left: 12px;
}

.main-card {
  margin-top: 16px;
  width: 100%;
  display: flex;
  box-sizing: border-box;
  .area-card {
    margin-top: 16px;
  }
  .left-card {
    /* width: 916px; */
  }
  .right-card {
    /* width: calc(100% - 932px); */
    margin-left: 16px;
    box-sizing: border-box;
  }
}

.offline-container {
  width: 100%;
  height: calc(100vh - 170px);
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;
  .no-data-icon {
    width: 200px;
    height: 200px;
  }
  .no-data-text {
    height: 24px;
    line-height: 24px;
    font-size: 18px;
    font-weight: 700;
    color: #01021d;
    margin-top: 2px;
  }
  .no-data-text-warning {
    height: 20px;
    line-height: 20px;
    font-size: 14px;
    font-weight: 500;
    color: #99a1af;
    margin-top: 8px;
  }
  .retry {
    width: 174px;
    margin-top: 12px;
    border-radius: 16px;
  }
}
</style>
