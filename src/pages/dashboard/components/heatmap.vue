<template>
  <div class="heatmap">
    <div class="heatmap-title">
      <span>在线热力图</span>
    </div>
    <div ref="chartRef" class="heatmap-chart"></div>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
  computed,
  toRefs,
  watch,
  nextTick,
  inject,
} from "vue";
import * as echarts from "echarts";
import { getHeatmap } from "@/services/dashboard.service";
import { getTotalUserCount } from "@/services/user.service";

const props = defineProps({
  areasize: {
    type: Number,
    default: 0,
  },
});

const { areasize } = toRefs(props);
const chartRef = ref(null);
let chart = null;
const heatmapWdith = computed(() => areasize.value * 12 + 24);
const heatmapData = ref([]);
const totalUserCount = ref(0);

// 注入activeDuan状态
const activeDuan = inject("activeDuan", ref("admin"));
const transformedHeatmapData = ref([]);
const getHeatmapData = async () => {
  try {
    const res = await getHeatmap();
    if (res.data.status === 200) {
      heatmapData.value = res.data.data || [];
      transformedHeatmapData.value = transformHeatmapData();
    }
  } catch (error) {
    console.error("获取热力图数据失败:", error);
    return {};
  }
};

// 转换API数据为热力图格式
const transformHeatmapData = () => {
  const data = [];
  // 按日期排序，确保数据是按时间顺序的
  // const sortedData = [...heatmapData.value].sort(
  //   (a, b) => new Date(a.date) - new Date(b.date),
  // );
  const sortedData = heatmapData.value;

  // 获取首天日期
  const firstDay =
    sortedData.length > 0 ? new Date(sortedData[0].date) : new Date();

  sortedData.forEach((item) => {
    // 计算当前日期与首天的天数差作为索引
    const currentDay = new Date(item.date);
    const dayDiff = Math.floor((currentDay - firstDay) / (1000 * 60 * 60 * 24));

    // 提取时间区间的开始小时并转换为索引
    const startHour = parseInt(item.time_period.split(":")[0]);
    const hourIndex = startHour / 2;
    // 使用count作为值
    const value = item.count;
    data.push([dayDiff, hourIndex, value]);
  });
  // console.warn("转换后热力图数据", data);
  return data;
};

const getTotalUser = async () => {
  try {
    const res = await getTotalUserCount();
    if (res.data.status === 200) {
      totalUserCount.value = res.data.data.total_users || 0;
      // console.warn("用户总数", totalUserCount.value);
    }
  } catch (error) {
    console.error("获取用户总数失败:", error);
    return 0;
  }
};
// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;

  // 确保有数据才初始化图表
  if (heatmapData.value.length === 0) return;

  // 如果图表已存在，先销毁
  if (chart) {
    chart.dispose();
  }

  chart = echarts.init(chartRef.value);

  // 按日期排序，获取首天和总天数
  // const sortedData = [...heatmapData.value].sort(
  //   (a, b) => new Date(a.date) - new Date(b.date),
  // );
  const sortedData = heatmapData.value;
  const firstDay = new Date(sortedData[0].date);

  // 计算总天数30天）
  // const lastDay =
  //   sortedData.length > 0
  //     ? new Date(sortedData[sortedData.length - 1].date)
  //     : new Date();
  // const totalDays = Math.min(
  //   Math.floor((lastDay - firstDay) / (1000 * 60 * 60 * 24)) + 1,
  //   30,
  // );
  const totalDays = 30; // 默认30天数据
  // console.warn("总天数", totalDays);
  // 生成dayLabels数组，使用实际日期
  const dayLabels = [];
  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(firstDay);
    currentDate.setDate(firstDay.getDate() + i);
    dayLabels.push(`${currentDate.getMonth() + 1}-${currentDate.getDate()}`);
  }
  // console.warn("X轴标签", dayLabels);
  const hourLabels = Array.from({ length: 12 }, (_, i) =>
    ((i + 1) * 2).toString(),
  );
  // console.warn("Y轴标签", hourLabels);

  const option = {
    tooltip: {
      position: "top",
      backgroundColor: "rgba(1, 2, 29, 0.85)",
      // borderColor: "#1677FF",
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      textStyle: {
        color: "#fff",
        fontSize: 14,
      },
      formatter: function (params) {
        const actualHour = params.value[1] * 2; // 将索引转换回实际小时（从2开始）
        const nextHour = actualHour + 2;
        const currentDate = new Date(firstDay);
        currentDate.setDate(firstDay.getDate() + params.value[0]);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        const value = params.value[2];
        const percentage = (value / totalUserCount.value) * 100; // 计算占比
        return `<div style="font-size: 12px;color: #6A7282;width: 128px;">${year}年${month}月${day}日</div><hr style="margin: 8px 0; border: none; height: 1px; background-color: rgba(106, 114, 130, 0.2);"/><div style="color:#F9FAFB; font-size:12px;">${actualHour}:00 - ${nextHour}:00</div><div style="font-size: 12px;color: #6A7282;display: flex; align-items: center; justify-content: space-between;"><div>当前在线人数: </div><div style="color: #1677FF; font-weight: 600;">${value}</div></div><div style="margin-top: 8px;margin-bottom: 4px; height: 4px; background-color: rgba(255, 255, 255, 0.2); border-radius: 2px; overflow: hidden;"><div style="height: 100%; width: ${percentage}%; background-color: #1677FF; border-radius: 2px;"></div></div>`;
      },
    },
    grid: {
      height: `${12 * areasize.value}px`,
      width: `${totalDays * areasize.value}px`,
      top: "12px",
      left: "0",
      right: "0",
      bottom: "0",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dayLabels,
      splitArea: {
        show: true,
        areaStyle: {
          color: "#ffffff",
        },
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        formatter: function (value, index) {
          // 隔四天显示一次
          if (index % 4 === 0) {
            return value;
          }
          return "";
        },
      },
    },
    yAxis: {
      type: "category",
      data: hourLabels,
      splitArea: {
        show: true,
        areaStyle: {
          color: "#ffffff",
        },
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        formatter: function (value, index) {
          const hour = parseInt(value);
          if (hour === 0) {
            return "0";
          } else if (hour % 4 === 0) {
            return `${hour}h`;
          }
          return "";
        },
      },
    },
    visualMap: {
      show: false,
      min: 0,
      max: 100,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "5%",
      inRange: {
        color: [
          "#F9FAFB",
          "rgba(22, 119, 255, 0.1)",
          "rgba(22, 119, 255, 0.2)",
          "rgba(22, 119, 255, 0.3)",
          "rgba(22, 119, 255, 0.4)",
          "rgba(22, 119, 255, 0.5)",
          "rgba(22, 119, 255, 0.6)",
          "rgba(22, 119, 255, 0.7)",
          "rgba(22, 119, 255, 0.8)",
          "rgba(22, 119, 255, 0.9)",
          "#1677FF",
        ],
      },
    },
    series: [
      {
        name: "在线热度",
        type: "heatmap",
        data: transformedHeatmapData.value,
        label: {
          show: false,
        },
        itemStyle: {
          borderWidth: Math.max(areasize.value / 10, 2),
          borderColor: "#ffffff",
          borderRadius: Math.max(areasize.value / 5 + 2, 6),
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 6,
            shadowColor: "rgba(22, 119, 255, 0.4)",
          },
        },
      },
    ],
  };

  chart.setOption(option);
};

// 响应式调整
const handleResize = () => {
  chart?.resize();
};

// 检查组件是否可见并调整图表
const checkVisibilityAndResize = () => {
  if (chartRef.value && chart) {
    const isVisible =
      chartRef.value.offsetWidth > 0 && chartRef.value.offsetHeight > 0;
    if (isVisible) {
      nextTick(() => {
        chart.resize();
      });
    }
  }
};

onMounted(async () => {
  await Promise.all([getHeatmapData(), getTotalUser()]);
  // 确保数据加载完成后再初始化图表
  nextTick(() => {
    initChart();
  });
  window.addEventListener("resize", handleResize);
});

// 监听数据变化，更新图表
watch(
  heatmapData,
  (newData) => {
    if (newData.length > 0) {
      if (chart) {
        // 重新初始化图表以更新所有配置
        initChart();
        // 检查组件可见性并调整图表
        checkVisibilityAndResize();
      } else {
        // 如果图表还未初始化，则初始化
        initChart();
      }
    }
  },
  { deep: true },
);

// 监听activeDuan变化，当从用户端切换到管理端时调整图表
watch(activeDuan, (newVal) => {
  if (newVal === "admin") {
    // 切换到管理端后，检查组件可见性并调整图表
    nextTick(() => {
      checkVisibilityAndResize();
    });
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  chart?.dispose();
});
defineExpose({
  handleResize,
  checkVisibilityAndResize,
});
</script>

<style scoped lang="scss">
.heatmap {
  width: 100%;
  /* height: 100%; */
  display: flex;
  flex-direction: column;
  padding: 12px 24px 16px 24px;
  background-color: #fff;
  border-radius: 8px;
  box-sizing: border-box;
}

.heatmap-title {
  font-size: 18px;
  font-weight: 600;
  height: 36px;
  line-height: 36px;
  color: #01021d;
}

.heatmap-chart {
  /* flex: 1; */
  width: 100%;
  box-sizing: border-box;
  min-height: v-bind('heatmapWdith + "px"');
  /* overflow: auto; */
}
</style>
