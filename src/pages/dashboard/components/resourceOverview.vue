<template>
  <div class="resource-overview">
    <div class="title">{{ $t("dashboard.resource.title") }}</div>
    <div v-if="isHaveData" class="chart-container" ref="chartContainerRef">
      <svg ref="chartRef" class="chart" viewBox="0 0 200 200"></svg>
      <div
        v-if="tooltipVisible"
        class="tooltip"
        :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
      >
        <div>
          {{ $t("dashboard.resource.resourceType") }} {{ tooltipData.name }}
        </div>
        <div>{{ $t("dashboard.resource.count") }} {{ tooltipData.value }}</div>
      </div>
    </div>
    <div v-else class="chart-container-nodata">
      <svg class="chart" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r="60"
          fill="none"
          stroke="#F9FAFB"
          stroke-width="25"
        />
      </svg>
    </div>
    <div class="resource-list">
      <div class="resource-item" v-for="item in data" :key="item.name">
        <span :class="['dot', item.colorClass]"></span>
        <span class="name">{{ item.name }}</span>
        <span class="count">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import { getResourceSummary } from "@/services/dashboard.service";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const chartRef = ref(null);
const chartContainerRef = ref(null);

// 监听语言切换
watch(
  () => locale.value,
  () => {
    // 语言切换时更新data中的国际化文本
    updateDataNames();
    nextTick(() => {
      initChart();
    });
  },
);

// 更新data中的国际化名称
const updateDataNames = () => {
  data.value = data.value.map((item) => {
    if (item.colorClass === "blue") {
      return { ...item, name: t("dashboard.resource.questionBank") };
    } else if (item.colorClass === "light-blue") {
      return { ...item, name: t("dashboard.resource.materialLibrary") };
    } else if (item.colorClass === "yellow") {
      return { ...item, name: t("dashboard.resource.practiceMaterials") };
    } else if (item.colorClass === "gray") {
      return { ...item, name: t("dashboard.resource.robot") };
    }
    return item;
  });
};

// Tooltip 相关状态
const tooltipVisible = ref(false);
const tooltipData = ref({ name: "", value: "" });
const tooltipX = ref(0);
const tooltipY = ref(0);
const isHaveData = ref(false);

const data = ref([
  {
    value: 0,
    name: t("dashboard.resource.questionBank"),
    color: "#1677FF",
    colorClass: "blue",
  },
  {
    value: 0,
    name: t("dashboard.resource.materialLibrary"),
    color: "#86B8FF",
    colorClass: "light-blue",
  },
  {
    value: 0,
    name: t("dashboard.resource.practiceMaterials"),
    color: "#D3FF33",
    colorClass: "yellow",
  },
  {
    value: 0,
    name: t("dashboard.resource.robot"),
    color: "#D9D9D9",
    colorClass: "gray",
  },
]);
const getData = () => {
  getResourceSummary().then((res) => {
    if (res.data.status === 200) {
      const info = res.data.data[0] || {};
      data.value = [
        {
          value: info.sop_count,
          name: t("dashboard.resource.questionBank"),
          color: "#1677FF",
          colorClass: "blue",
        },
        {
          value: info.material_count,
          name: t("dashboard.resource.materialLibrary"),
          color: "#86B8FF",
          colorClass: "light-blue",
        },
        {
          value: info?.exercise_count || 0,
          name: t("dashboard.resource.practiceMaterials"),
          color: "#D3FF33",
          colorClass: "yellow",
        },
        {
          value: info.robot_count,
          name: t("dashboard.resource.robot"),
          color: "#D9D9D9",
          colorClass: "gray",
        },
      ];
      isHaveData.value = !!(
        info.sop_count ||
        info.material_count ||
        info.exercise_count ||
        info.robot_count
      );
      nextTick(() => {
        initChart();
      });
    } else {
      isHaveData.value = false;
    }
  });
};

onMounted(() => {
  getData();
  window.addEventListener("resize", initChart);
});

const initChart = () => {
  if (!chartRef.value) return;

  // 清空 SVG
  chartRef.value.innerHTML = "";

  // 计算数据总和
  const total = data.value.reduce((sum, item) => sum + item.value, 0);
  console.warn("total", total);

  let startAngle = 180; // 从顶部开始

  // 按值从大到小排序数据
  const sortedData = [...data.value].sort((a, b) => b.value - a.value);
  // 为每个数据项添加排序索引
  const dataWithRank = data.value.map((item) => ({
    ...item,
    rank: sortedData.findIndex((sortedItem) => sortedItem.name === item.name),
  }));
  const sortedDataWithRank = dataWithRank.sort((a, b) => a.rank - b.rank);
  const nonZeroData = sortedDataWithRank.filter((item) => item.value > 0);

  nonZeroData.forEach((item, index) => {
    const ratio = item.value / total;
    const endAngle = startAngle - ratio * 360; // 逆时针旋转

    // 根据排序等级设置不同的半径，实现不同的宽度
    let innerRadius, outerRadius;
    const rank = item.rank;
    if (rank === 0) {
      // 数量最多的，最宽
      innerRadius = 45;
      outerRadius = 70;
    } else if (rank === 1) {
      // 数量第二多的，较宽
      innerRadius = 49;
      outerRadius = 66;
    } else if (rank === 2) {
      // 数量第三多的，中等宽度
      innerRadius = 53;
      outerRadius = 62;
    } else {
      // 数量最少的，最窄
      innerRadius = 55;
      outerRadius = 60;
    }

    const path = createArcPath(
      100,
      100,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
    );

    // 创建一个 g 元素作为容器，用于捕获鼠标事件
    const gElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    gElement.setAttribute("cursor", "pointer");

    // 创建 SVG 元素
    const pathElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    pathElement.setAttribute("d", path);
    pathElement.setAttribute("fill", item.color);
    pathElement.setAttribute("transform-origin", "50% 50%");
    pathElement.style.transition = "all 0.3s ease";

    // 添加到 g 元素
    gElement.appendChild(pathElement);

    // 添加 hover 效果到 g 元素
    gElement.addEventListener("mouseenter", (event) => {
      // 显示 tooltip
      showTooltip(event, item);
      // 添加 hover 效果
      pathElement.setAttribute("fill", adjustColor(item.color, 0.9));
      // 添加放大效果
      pathElement.style.transform = "scale(1.02)";
    });

    gElement.addEventListener("mouseleave", () => {
      // 隐藏 tooltip
      tooltipVisible.value = false;
      // 恢复原始颜色
      pathElement.setAttribute("fill", item.color);
      // 恢复原始大小
      pathElement.style.transform = "scale(1)";
    });

    // 添加到 SVG
    chartRef.value.appendChild(gElement);

    // 更新起始角度
    startAngle = endAngle;
  });
};

// 显示 tooltip
const showTooltip = (event, item) => {
  if (!chartContainerRef.value) return;

  const rect = chartContainerRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left + 10;
  const y = event.clientY - rect.top + 10;

  tooltipData.value = item;
  tooltipX.value = x;
  tooltipY.value = y;
  tooltipVisible.value = true;
};

// 调整颜色亮度
const adjustColor = (color, factor) => {
  // 解析 hex 颜色
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 调整亮度
  const newR = Math.min(255, Math.round(r * factor));
  const newG = Math.min(255, Math.round(g * factor));
  const newB = Math.min(255, Math.round(b * factor));

  // 转换回 hex 格式
  const toHex = (num) => {
    const hex = num.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

// 创建弧形路径
const createArcPath = (
  cx,
  cy,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
) => {
  // 处理单数据情况，确保创建完整的圆环
  if (Math.abs(endAngle - startAngle) >= 360) {
    // 对于完整圆环，使用稍微小于360度的角度，确保路径有效
    endAngle = startAngle - 359.999;
  }

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const startX1 = cx + Math.cos(startRad) * innerRadius;
  const startY1 = cy + Math.sin(startRad) * innerRadius;
  const startX2 = cx + Math.cos(startRad) * outerRadius;
  const startY2 = cy + Math.sin(startRad) * outerRadius;

  const endX1 = cx + Math.cos(endRad) * innerRadius;
  const endY1 = cy + Math.sin(endRad) * innerRadius;
  const endX2 = cx + Math.cos(endRad) * outerRadius;
  const endY2 = cy + Math.sin(endRad) * outerRadius;

  const largeArcFlag = endAngle - startAngle <= -180 ? 1 : 0;

  return [
    `M ${startX2} ${startY2}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${endX2} ${endY2}`,
    `L ${endX1} ${endY1}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${startX1} ${startY1}`,
    `Z`,
  ].join(" ");
};
</script>

<style scoped>
.resource-overview {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.title {
  height: 28px;
  line-height: 28px;
  font-size: 18px;
  font-weight: 600;
  color: #01021d;
}

.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.chart {
  margin-top: 24px;
  width: 200px;
  height: 200px;
}

.resource-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 18px;
  gap: 8px;
  justify-content: center;
}

.resource-item {
  display: flex;
  height: 26px;
  padding: 0 12px;
  align-items: center;
  gap: 8px;
  background-color: #fafbfc;
  border-radius: 15px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.blue {
  background-color: #1677ff;
}

.dot.light-blue {
  background-color: #86b8ff;
}

.dot.yellow {
  background-color: #d3ff33;
}

.dot.gray {
  background-color: #d9d9d9;
}

.name {
  font-size: 12px;
  color: #99a1af;
}

.count {
  font-size: 12px;
  font-weight: 600;
  color: #01021d;
}

.tooltip {
  position: absolute;
  background: rgba(1, 2, 29, 0.8);
  color: #fff;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 1000;
  pointer-events: none;
  white-space: nowrap;
  div {
    height: 20px;
    line-height: 20px;
  }
}

.chart-container {
  position: relative;
}

.chart-container-nodata {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}
</style>
