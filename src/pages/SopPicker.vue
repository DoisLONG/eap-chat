<template>
  <div class="sop-picker">
    <!-- 顶栏：品牌 + 操作 -->
    <header class="bar">
      <div class="brand">
        <img src="/logo2.png" class="logo" alt="logo" />
        <h1 class="title">SOP 选择</h1>
      </div>

      <!-- 过滤区：自动响应式网格 -->
      <div class="filters">
        <el-input
          v-model="query.kw"
          class="f-item kw"
          :placeholder="isMobile ? '搜索 SOP…' : '搜索 SOP 名称…'"
          clearable
          @keyup.enter="reload"
        />
        <el-select v-model="query.env" class="f-item env" placeholder="环境" clearable>
          <el-option label="prod" value="prod" />
          <el-option label="test" value="test" />
          <el-option label="dev" value="dev" />
        </el-select>
        <el-button class="f-item btn" type="primary" @click="reload">搜索</el-button>
      </div>
    </header>

    <!-- 内容：桌面表格 / 平板&手机卡片 -->
    <section v-loading="loading">
      <!-- 桌面端：表格 -->
      <el-card v-show="!isTabletOrDown" class="desk-card">
        <el-table :data="items" stripe height="auto">
          <el-table-column type="index" label="#" width="60" />
          <el-table-column prop="name" label="SOP 名称" min-width="380" show-overflow-tooltip />
          <el-table-column prop="env" label="环境" width="120" />
          <el-table-column prop="version" label="版本" width="120" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="goChat(row)">开始练习</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 平板/手机：卡片列表 -->
      <div v-show="isTabletOrDown" class="card-grid">
        <el-empty v-if="!items.length && !loading" description="暂无数据" />
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
            <el-tag size="small" type="info">环境：{{ it.env }}</el-tag>
            <el-tag size="small" class="ml8">版本：{{ it.version }}</el-tag>
          </div>
          <el-button class="c-btn" type="primary" round>开始练习</el-button>
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
        @current-change="p => { query.page = p; reload() }"
      />
    </footer>

    <p class="tips">选择一个 SOP 后进入“对话/考试”页面；后续可将本页数据改为后端接口。</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// —— 响应式断点 —— //
const isMobile = ref(false)
const isTabletOrDown = ref(false)

function updateBreakpoints() {
  const w = window.innerWidth
  isMobile.value = w < 768
  isTabletOrDown.value = w < 1280
}
onMounted(() => {
  updateBreakpoints()
  window.addEventListener('resize', updateBreakpoints, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('resize', updateBreakpoints))

// —— 列表/查询 —— //
const query = reactive({
  kw: '',
  env: '',
  page: 1,
  pageSize: 10
})
const loading = ref(false)
const items = ref([])
const total = ref(0)

async function fetchList() {
  loading.value = true
  try {
    // 这里替换为你的后端接口即可
    await new Promise(r => setTimeout(r, 350))
    const all = [
      { id: 'sop-01', name: '机械检修技工-SOP-01 设备检修标准作业卡-焊接', env: 'prod', version: 'v1' },
      { id: 'sop-02', name: '机械检修技工-SOP-02 设备检修标准作业卡-气割', env: 'prod', version: 'v1' },
      { id: 'sop-03', name: '机械检修技工-SOP-03 设备检修标准作业卡-动平衡', env: 'test', version: 'v2' },
      { id: 'sop-08', name: '机械检修技工-SOP-08 设备检修标准作业卡-干燥机更换干燥剂', env: 'prod', version: 'v1' },
      { id: 'sop-11', name: '电气检修技工-SOP-11 高压柜维护', env: 'dev', version: 'v1' },
      { id: 'sop-21', name: '安全操作-SOP-21 高处作业防护', env: 'prod', version: 'v3' },
    ]
    const k = query.kw.trim()
    let arr = all.filter(x =>
      (!k || x.name.includes(k)) &&
      (!query.env || x.env === query.env)
    )
    total.value = arr.length
    const start = (query.page - 1) * query.pageSize
    const end = start + query.pageSize
    items.value = arr.slice(start, end)
  } finally {
    loading.value = false
  }
}
function reload() {
  query.page = 1
  fetchList()
}

function goChat(row) {
  router.push({
    path: '/chat/exam',
    query: { sopId: row.id, sopName: row.name, sopVer: row.version }
  })
}

onMounted(fetchList)
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
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}
.brand { display:flex; align-items:center; gap:10px; min-width:0; }
.logo { width: 30px; height: 30px; border-radius: 8px; }
.title {
  font-size: clamp(18px, 2.2vw, 22px);
  margin: 0;
  color: #1f2a44;
  font-weight: 800;
  letter-spacing: .5px;
  white-space: nowrap;
}

/* 过滤区：自适应网格 */
.filters {
  display: grid;
  grid-template-columns: 1fr 140px 110px; /* kw | env | btn */
  gap: 10px;
}
.f-item { width: 100%; }
.f-item.btn { white-space: nowrap; }

/* 内容卡片 */
.desk-card { border-radius: 14px; }

/* 平板/手机：自适应网格卡片 */
.card-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr)); /* 平板双列 */
}
.sop-card {
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.c-header { margin-bottom: 6px; }
.c-title {
  font-weight: 700;
  color: #1f2a44;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 最多两行，溢出省略 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.c-meta { margin: 6px 0 12px; }
.ml8 { margin-left: 8px; }
.c-btn { width: 100%; }

/* 分页/说明 */
.pager {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}
.tips {
  color: #9aa3ad;
  margin-top: 10px;
  font-size: 12px;
}

/* —— 断点优化 —— */

/* <1280：隐藏表格，用卡片 */
@media (max-width: 1279px) {
  .sop-picker { --maxw: 980px; }
  .desk-card { display: none; }
}

/* <900：过滤区变 2 行，卡片边距更紧凑 */
@media (max-width: 900px) {
  .filters {
    grid-template-columns: 1fr 1fr;      /* 第一行：kw、env */
    grid-auto-rows: auto;
  }
  .filters .kw { grid-column: 1 / 3; }  /* kw 独占一行 */
  .filters .env { grid-column: 1 / 2; }
  .filters .btn { grid-column: 2 / 3; }

  .card-grid {
    grid-template-columns: 1fr;          /* 手机单列 */
  }
}

/* <768：更紧凑、分页居中 */
@media (max-width: 767px) {
  .sop-picker { padding: 12px; }
  .title { font-size: 18px; }
  .filters { gap: 8px; }
  .c-btn { height: 40px; font-size: 15px; }
  .pager { justify-content: center; }
}

/* 深色模式友好（可选） */
@media (prefers-color-scheme: dark) {
  .title { color: #e7ecf5; }
  .tips { color: #b9c0ca; }
}
</style>
