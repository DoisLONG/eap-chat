<template>
  <div class="sop-picker">
    <!-- 顶栏：品牌 + 操作 -->
    <header class="bar">
      <div class="brand">
        <img src="/logo2.png" class="logo" alt="logo" />
        <h1 class="title">{{ $t("SopPicker.select") }}</h1>
      </div>

      <div class="actions">
        <el-dropdown trigger="click" @command="changeLanguage">
          <div class="language-switch">
            <img :src="globalIcon" alt="language" class="language-icon" />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="item in languageList"
                :key="item.value"
                :command="item.value"
                :disabled="language === item.value"
              >
                {{ item.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 过滤区 -->
    <div class="filters">
      <el-input
        v-model="query.kw"
        class="f-item kw"
        style="max-width: 500px"
        :placeholder="
          isMobile ? $t('SopPicker.sopSearch') : $t('SopPicker.sopSearchPc')
        "
        clearable
        @keyup.enter="reload"
      />
      <!-- <el-select
        v-model="query.env"
        class="f-item env"
        :placeholder="$t('SopPicker.env')"
        clearable
      >
        <el-option label="prod" value="prod" />
        <el-option label="test" value="test" />
        <el-option label="dev" value="dev" />
      </el-select> -->
      <el-button class="f-item env" type="primary" @click="reload">
        {{ $t("common.search") }}
      </el-button>
      <el-button
        class="f-item btn"
        :class="!isMobile ? 'btn-pc' : ''"
        style="margin-left: 0"
        type="primary"
        @click="toMixTest"
      >
        {{ $t("SopPicker.mixMode") }}
      </el-button>
    </div>

    <!-- 内容：桌面表格 / 平板&手机卡片 -->
    <section v-loading="loading" class="content-section">
      <!-- 桌面端：表格 -->
      <el-card v-show="!isTabletOrDown" class="desk-card">
        <el-table :data="items" stripe height="auto">
          <el-table-column type="index" label="#" width="60" />
          <el-table-column
            prop="name"
            :label="$t('SopPicker.sopName')"
            min-width="380"
            show-overflow-tooltip
          />
          <el-table-column
            prop="env"
            :label="$t('SopPicker.env')"
            width="120"
          />
          <el-table-column
            prop="version"
            :label="$t('SpPicker.version')"
            width="120"
          />
          <el-table-column
            :label="$t('common.operate')"
            width="180"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="goChat(row)">{{
                $t("SopPicker.beginTest")
              }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 平板/手机：卡片列表 -->
      <div v-show="isTabletOrDown" class="card-grid">
        <el-empty
          v-if="!items.length && !loading"
          :description="$t('SopPicker.noData')"
        />
        <el-card
          v-for="it in items"
          :key="it.id"
          class="sop-card"
          shadow="hover"
          @click="goChat(it)"
        >
          <div class="c-header">
            <div class="c-title" :title="it.name">{{ it.name }}</div>
          </div>
          <div class="c-meta">
            <el-tag size="small" type="info"
              >{{ $t("SopPicker.env") }}：{{ it.env }}</el-tag
            >
            <el-tag size="small" class="ml8"
              >{{ $t("SopPicker.version") }}：{{ it.version }}</el-tag
            >
          </div>
          <el-button class="c-btn" type="primary" round>{{
            $t("SopPicker.beginTest")
          }}</el-button>
        </el-card>
      </div>
    </section>

    <!-- 分页 -->
    <footer class="pager" v-if="total > 0">
      <el-pagination
        background
        layout="prev, pager, next, total"
        :total="total"
        :current-page="query.page"
        :page-size="query.pageSize"
        @current-change="
          (p) => {
            query.page = p;
            reload();
          }
        "
      />
    </footer>

    <p class="tips">{{ $t("SopPicker.selectOne") }}</p>

    <!-- 混合出题 -->
    <MixTest
      v-if="mixVisible"
      @confirm="handleConfirmMix"
      @close="mixVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";
import { getSops } from "@/services/sop.api"; // 请确认已定义该接口方法
import MixTest from "@/pages/components/SopPicker/mixTest.vue";
import { useUserStore } from "@/stores/modules/user";
import { storeToRefs } from "pinia";
import globalIcon from "@/assets/images/global.png";
import { useGlobalStore } from "@/stores/modules/global";
import { useI18n } from "vue-i18n";

const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);

const router = useRouter();

const i18n = useI18n();
const globalStore = useGlobalStore();
const language = computed(() => globalStore.language);

const languageList = [
  { label: "简体中文", value: "zh" },
  { label: "ภาษาไทย", value: "th" },
];

const changeLanguage = (lang) => {
  i18n.locale.value = lang;
  globalStore.setGlobalState("language", lang);
};

// —— 响应式断点 —— //
const isMobile = ref(false);
const isTabletOrDown = ref(false);
function updateBreakpoints() {
  const w = window.innerWidth;
  isMobile.value = w < 768;
  isTabletOrDown.value = w < 1280;
}
onMounted(() => {
  updateBreakpoints();
  window.addEventListener("resize", updateBreakpoints, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener("resize", updateBreakpoints));

// —— 查询条件与数据 —— //
const query = reactive({
  kw: "",
  env: "",
  page: 1,
  pageSize: 10,
});
const loading = ref(false);
const items = ref([]);
const total = ref(0);

// —— 获取数据 —— //
async function fetchList() {
  loading.value = true;
  try {
    const { data } = await getSops({
      user_id: String(userInfo.value.id),
      page: query.page,
      pageSize: query.pageSize,
      keyword: query.kw.trim(),
    });
    const raw = Array.isArray(data?.results?.records)
      ? data.results.records
      : [];

    const mapped = raw.map((item) => {
      const fileName = item.filename || "";
      const title = item.title || fileName.replace(/\.[^.]+$/, "");
      return {
        id: item.id,
        fileName,
        name: title,
        env: "prod",
        version: "v1",
        task_id: item.task_id || "",
      };
    });

    items.value = mapped;
    total.value = data?.results?.total || 0;

    // 前端关键词/环境过滤
    const kw = query.kw.trim();
    const filtered = mapped.filter(
      (x) => (!kw || x.name.includes(kw)) && (!query.env || x.env === query.env)
    );

    total.value = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    items.value = filtered.slice(start, start + query.pageSize);
  } catch (e) {
    console.error("[fetchList error]", e);
  } finally {
    loading.value = false;
  }
}

function reload() {
  query.page = 1;
  fetchList();
}

function goChat(row) {
  router.push({
    path: "/chat/exam",
    query: {
      sopId: row.id,
      sopName: row.fileName,
      sopVer: row.version,
    },
  });
}

onMounted(fetchList);

// 混合出题
const mixVisible = ref(false);
const toMixTest = () => {
  mixVisible.value = true;
};
const handleConfirmMix = (position_id) => {
  router.push({
    path: "/chat/exam",
    query: {
      position_id,
    },
  });
};
</script>

<style scoped>
/* 容器宽度：大屏居中，移动端全宽 */
.sop-picker {
  --maxw: 1180px;
  margin: 0 auto;
  padding: clamp(12px, 2.2vw, 20px);
  max-width: var(--maxw);
}

/* 顶栏 */
.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: contain;
}

.title {
  font-size: clamp(20px, 3vw, 24px);
  margin: 0;
  color: #1f2a44;
  font-weight: 800;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.language-switch {
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.language-switch:hover {
  background-color: #f5f7fa;
}

.language-icon {
  width: 22px;
  height: 22px;
  display: block;
}

/* 过滤区：自适应网格 */
.filters {
  display: grid;
  grid-template-columns: 1fr 140px 110px; /* kw | env | btn */
  gap: 12px;
  margin-bottom: 24px;
}

.f-item {
  width: 100%;
}

.f-item.btn {
  white-space: nowrap;
}
.btn-pc {
  min-width: 170px;
}
/* 内容区域 */
.content-section {
  margin-bottom: 20px;
}

/* 内容卡片 */
.desk-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 平板/手机：自适应网格卡片 */
.card-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr)); /* 平板双列 */
}

.sop-card {
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #ebeef5;
}

.sop-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.c-header {
  margin-bottom: 12px;
  padding: 16px 16px 0;
}

.c-title {
  font-weight: 700;
  color: #1f2a44;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 最多两行，溢出省略 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 16px;
}

.c-meta {
  margin: 0 16px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ml8 {
  margin-left: 8px;
}

.c-btn {
  width: calc(100% - 32px);
  margin: 0 16px 16px;
  height: 40px;
}

/* 分页/说明 */
.pager {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.tips {
  color: #9aa3ad;
  text-align: center;
  margin: 10px 0 30px;
  font-size: 14px;
}

/* —— 断点优化 —— */

/* 移动端布局调整 */
@media (max-width: 767px) {
  .sop-picker {
    padding: 16px 12px;
  }

  .bar {
    margin-bottom: 16px;
  }

  .title {
    font-size: 20px;
  }

  .filters {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .card-grid {
    grid-template-columns: 1fr; /* 手机单列 */
    gap: 12px;
  }

  .c-header {
    padding: 12px 12px 0;
  }

  .c-title {
    font-size: 15px;
  }

  .c-meta {
    margin: 0 12px 12px;
    gap: 6px;
  }

  .c-btn {
    width: calc(100% - 24px);
    margin: 0 12px 12px;
    height: 36px;
    font-size: 14px;
  }

  .pager {
    margin: 16px 0;
  }

  .tips {
    font-size: 13px;
    margin: 8px 0 20px;
  }
}

/* 平板布局调整 */
@media (min-width: 768px) and (max-width: 1279px) {
  .sop-picker {
    --maxw: 980px;
  }

  .desk-card {
    display: none;
  }
}

/* <900：过滤区变 2 行 */
@media (max-width: 900px) {
  .filters {
    grid-template-columns: 1fr 1fr; /* 第一行：kw、env */
    grid-auto-rows: auto;
  }
  .filters .kw {
    grid-column: 1 / 3;
  } /* kw 独占一行 */
  .filters .env {
    grid-column: 1 / 2;
  }
  .filters .btn {
    grid-column: 2 / 3;
  }
}

/* 深色模式友好 */
@media (prefers-color-scheme: dark) {
  .title {
    color: #e7ecf5;
  }
  .tips {
    color: #b9c0ca;
  }
  .language-switch:hover {
    background-color: #2d3a4b;
  }
  .sop-card {
    border-color: #434b5a;
  }
}
</style>
