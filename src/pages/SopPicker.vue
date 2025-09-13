<template>
  <div class="sop-picker">
    <header class="bar">
      <div class="l">
        <img src="/logo2.png" class="logo" />
        <h2>SOP 选择</h2>
      </div>
      <div class="r">
        <el-input v-model="kw" placeholder="搜索 SOP 名称…" clearable class="w260" />
        <el-button type="primary" @click="load">搜索</el-button>
      </div>
    </header>

    <el-card class="list-card">
      <el-table :data="filtered" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="name" label="SOP 名称" min-width="320" />
        <el-table-column prop="env" label="环境" width="100" />
        <el-table-column prop="version" label="版本" width="100" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goChat(row)">开始练习</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="tips">
      选择一个 SOP 后进入“对话/考试”页面。
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const kw = ref('')

// 模拟数据（换接口时：把 mockSops 换成接口返回值）
const sops = ref([
  { id: 'sop-01', name: '机械检修技工-SOP-01 设备检修标准作业卡-焊接', env: 'prod', version: 'v1' },
  { id: 'sop-02', name: '机械检修技工-SOP-02 设备检修标准作业卡-气割', env: 'prod', version: 'v1' },
  { id: 'sop-08', name: '机械检修技工-SOP-08 设备检修标准作业卡-干燥机更换干燥剂', env: 'prod', version: 'v1' }
])

const filtered = computed(() => {
  const k = kw.value.trim()
  if (!k) return sops.value
  return sops.value.filter(s => s.name.includes(k))
})

function load() {
  // 如果接后端，这里发请求拉列表；kw 作为查询条件即可
}

function goChat(row) {
  // 带着 sop 信息进入对话页
  router.push({
    path: '/chat/exam',
    query: { sopId: row.id, sopName: row.name, sopVer: row.version }
  })
}
</script>

<style scoped>
.sop-picker { padding: 16px; }
.bar {
  display:flex; justify-content:space-between; align-items:center; gap:12px;
  margin-bottom: 14px;
}
.l { display:flex; align-items:center; gap:8px; }
.logo { width:28px; height:28px; border-radius:6px; }
.w260 { width: 260px; margin-right: 8px; }
.list-card { border-radius: 12px; }
.tips { color:#9aa3ad; margin-top:10px; font-size:13px; }
@media (max-width: 768px) {
  .bar { flex-direction: column; align-items: flex-start; gap: 10px; }
  .w260 { width: 100%; margin: 8px 0 0; }
}
</style>
