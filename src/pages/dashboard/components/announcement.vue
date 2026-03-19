<template>
  <div class="announcement-container">
    <div class="announcement-header flx-justify-between">
      <div class="announcement-title">
        {{ $t("dashboard.announcement.title") }}
      </div>
      <!-- <div class="view-all">查看全部</div> -->
      <div class="view-all"></div>
    </div>

    <div v-if="isHaveData">
      <div class="announcement-section">
        <div class="section-title flx-align-center">
          <img
            src="@/assets/images/calendar.png"
            alt="calendar"
            class="section-title-icon"
          />
          <span>{{ $t("dashboard.announcement.latestExam") }}</span>
        </div>

        <div v-if="newData.length > 0">
          <div class="announcement-item" v-for="item in newData" :key="item.id">
            <div class="item-title item-title-announcement">
              {{ item.title }}
            </div>
            <div class="item-time">
              {{ $t("dashboard.announcement.examTime") }}
              {{ `${item.start_time}-${item.end_time}` }}
            </div>
          </div>
        </div>
        <div v-else class="new-no-data">
          <div class="no-data-icon">
            <img
              src="@/assets/images/nodata.png"
              class="no-data-icon"
              alt="no-data"
            />
          </div>
          <div class="no-data-text">
            {{ $t("dashboard.announcement.noLatestExam") }}
          </div>
        </div>
      </div>

      <div class="announcement-section">
        <div class="section-title flx-align-center">
          <img
            src="@/assets/images/error-icon.png"
            alt="warning"
            class="section-title-icon"
          />
          <span class="warning-text">{{
            $t("dashboard.announcement.expiring")
          }}</span>
        </div>

        <div v-if="expiringData.length > 0">
          <div
            class="announcement-item announcement-item-warning"
            v-for="item in expiringData"
            :key="item.id"
          >
            <div class="item-title item-title-align flx-justify-between">
              <div class="title">{{ item.title }}</div>
              <div class="countdown-warp">
                <div class="countdown" v-if="item.time_left">
                  {{
                    $t("dashboard.announcement.timeLeft", {
                      time: item.time_left,
                    })
                  }}
                </div>
                <div class="countdown" v-else>
                  {{
                    $t("dashboard.announcement.daysLeft", {
                      days: item.days_left,
                    })
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="expiring-no-data">
          <div class="no-data-icon">
            <img
              src="@/assets/images/nodata.png"
              class="no-data-icon"
              alt="no-data"
            />
          </div>
          <div class="no-data-text">
            {{ $t("dashboard.announcement.noExpiring") }}
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="no-data">
        <div class="no-data-icon">
          <img
            src="@/assets/images/nodata.png"
            class="no-data-icon"
            alt="no-data"
          />
        </div>
        <div class="no-data-text">
          {{ $t("dashboard.announcement.noData") }}
        </div>
        <div class="no-data-text-warning">
          {{ $t("dashboard.announcement.noNotification") }}
        </div>
        <div class="no-data-text-warning">
          {{ $t("dashboard.announcement.comeBackLater") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { getAnnouncements } from "@/services/dashboard.service";

const expiringData = ref([]);
const newData = ref([]);
const isHaveData = computed(
  () => expiringData.value?.length > 0 || newData.value?.length > 0,
);
const getData = () => {
  const params = {};
  getAnnouncements(params).then((res) => {
    if (res.data.status === 200) {
      // 只留前两个数据
      expiringData.value = res.data.data.expiring?.slice(0, 2) || [];
      newData.value = res.data.data.new?.slice(0, 2) || [];
    }
  });
};
getData();
</script>

<style scoped lang="scss">
.announcement-container {
  background: #ffffff;
  border-radius: 8px;
  padding: 0px 24px 16px 24px;
}

.announcement-header {
  height: 60px;
  display: flex;
  align-items: center;
}

.announcement-title {
  font-size: 18px;
  font-weight: 600;
  color: #01021d;
}

.view-all {
  font-size: 12px;
  color: #99a1af;
  transition: color 0.3s;
  cursor: pointer;
}

.view-all:hover {
  color: #409eff;
  cursor: pointer;
}

.announcement-section {
  margin-bottom: 14px;
}

.announcement-section:last-child {
  margin-bottom: 0;
  padding-top: 14px;
  border-top: 1px solid #f3f4f6;
}

.section-title {
  height: 16px;
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  color: #01021d;
  margin-bottom: 16px;
}

.section-title .section-title-icon {
  width: 12px;
  height: 12px;
  margin-right: 4px;
}

.section-title .warning-text {
  color: #f56c6c;
}

.announcement-item {
  background: #f9fafb;
  border-radius: 10px;
  padding: 12px 8px 12px 12px;
  margin-bottom: 12px;
  transition: all 0.3s;
}
.item-title {
  height: 20px;
  line-height: 20px;
  font-size: 14px;
  font-weight: 400;
  color: #01021d;
  margin-bottom: 4px;
}
.item-title-announcement {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.announcement-item-warning {
  height: 36px;
  width: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 0px 0 12px;
  background: #ffffff;
  .item-title-align {
    width: 100%;
    .title {
      width: calc(100% - 100px);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .flx-justify-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.announcement-item:hover {
  background: #ecf5ff;
}

.announcement-item:last-child {
  margin-bottom: 0;
}

.item-time {
  height: 16px;
  line-height: 16px;
  font-size: 12px;
  color: #99a1af;
  font-weight: 400;
}

.countdown-warp {
  width: 110px;
  display: flex;
  justify-content: flex-end;
}
.countdown {
  font-size: 12px;
  font-weight: 500;
  color: #fb2c36;
  background: #fef2f2;
  padding: 2px 8px;
  border-radius: 4px;
}
// 无数据
.no-data {
  width: 100%;
  height: 315px;
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
.expiring-no-data {
  height: 76px;
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;
  .no-data-icon {
    width: 30px;
    height: 30px;
  }
  .no-data-text {
    height: 16px;
    line-height: 16px;
    font-size: 12px;
    font-weight: 500;
    color: #01021d;
    margin-top: 12px;
  }
}
.new-no-data {
  height: 142px;
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;
  .no-data-icon {
    width: 50px;
    height: 50px;
  }
  .no-data-text {
    height: 16px;
    line-height: 16px;
    font-size: 12px;
    font-weight: 500;
    color: #01021d;
    margin-top: 12px;
  }
}
</style>
