<template>
  <div class="page">
    <div class="toolbar">
      <div class="left">
        <el-input
          v-model="q.keyword"
          placeholder="搜索规程名称 / 公司 / 部门 / 岗位"
          clearable
          style="width: 320px"
          @clear="load"
          @keyup.enter="load"
        />
        <el-button class="ml8" @click="load">查询</el-button>
      </div>
      <div class="right">
        <el-button @click="onImport">导入 SOP</el-button>
        <el-button type="danger" @click="onBatchDelete" :disabled="!selection.length">删除</el-button>
      </div>
    </div>

    <el-table
      :data="list"
      v-loading="loading"
      style="width:100%"
      @selection-change="val => selection = val"
      row-key="id"
      border
    >
      <el-table-column type="selection" width="50" />
      <el-table-column label="规程名称" min-width="280">
        <template #default="{ row }">
          <div class="doc-cell">
            <div class="thumb"></div>
            <div class="meta">
              <div class="name ellipsis" :title="row.title">{{ row.title }}</div>
              <div class="sub ellipsis" :title="row.fileName">{{ row.fileName }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="company" label="公司" width="120" />
      <el-table-column prop="dept" label="部门" width="120" />
      <el-table-column prop="job" label="岗位" width="120" />
      <el-table-column prop="version" label="版本号" width="100" />
      <el-table-column label="复核题目" width="200">
        <template #default="{ row }">
          <el-link type="primary" @click="openReview(row)">
            {{ row.examLinkText }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="onEdit(row)">编辑</el-button>
          <el-button size="small" @click="onDelete(row)" type="danger" plain>删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        background
        layout="prev, pager, next, total"
        :total="pager.total"
        :page-size="pager.pageSize"
        :current-page="pager.page"
        @current-change="p => { pager.page = p; load(); }"
      />
    </div>

    <!-- 复核弹窗 -->
    <ReviewDialog
      v-model="review.visible"
      :data="review.data"
      @save="handleSaveReview"
      @rename="handleRename"
      @regen="handleRegen"
      @add-doc="handleAddDoc"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import ReviewDialog from '@/components/exam/ReviewDialog.vue'

// ===== 查询条件 & 分页 =====
const q = reactive({ keyword: '' })
const pager = reactive({ page: 1, pageSize: 10, total: 0 })
const loading = ref(false)
const list = ref([])
let selection = ref([])

// ===== mock 加载 =====
function load() {
  loading.value = true
  setTimeout(() => {
    // 模拟 6 条
    const all = Array.from({ length: 6 }).map((_, i) => ({
      id: 1000 + i,
      title: `机械检修技工_SOP-0${i+1}设备检修标准作业卡`,
      fileName: '准作业卡-钢板类.xlsx',
      company: '合肥 XXX 厂',
      dept: 'xxx 部门',
      job: 'xxxx 工',
      version: 'v1',
      examLinkText: '机械检修技工_SOP-01设备检修标准作业卡 试题题目'
    }))
    // 简单过滤
    const k = (q.keyword || '').trim()
    const filtered = k ? all.filter(x =>
      [x.title, x.company, x.dept, x.job].some(f => String(f).includes(k))
    ) : all

    pager.total = filtered.length
    const start = (pager.page - 1) * pager.pageSize
    list.value = filtered.slice(start, start + pager.pageSize)
    loading.value = false
  }, 250)
}

onMounted(load)

// ===== 复核弹窗 =====
const review = reactive({
  visible: false,
  data: {
    title: '',
    items: []
  },
  currentRowId: null
})

function openReview(row) {
  review.currentRowId = row.id
  review.data = {
    title: row.title,
    items: [
      {
        stage: '阶段《作业中》步骤5',
        section: '作业量/任务分解 新需材料',
        question: '问题 1 文本示例',
        answer: '答案 1 文本示例'
      },
      {
        stage: '阶段《作业后》步骤2',
        section: '质量复核/交接',
        question: '问题 2 文本示例',
        answer: '答案 2 文本示例'
      },
      {
        stage: '阶段《准备》步骤1',
        section: '工具检查/安全确认',
        question: '问题 3 文本示例',
        answer: '答案 3 文本示例'
      },
      {
        stage: '阶段《作业中》步骤9',
        section: '记录/拍照归档',
        question: '问题 4 文本示例',
        answer: '答案 4 文本示例'
      }
    ]
  }
  review.visible = true
}

// dialog 事件回调（此处仅演示 - 你对接后端即可）
function handleSaveReview(payload) {
  // payload: { title, items, sync }
  console.log('[SAVE REVIEW]', review.currentRowId, payload)
  ElMessage.success(payload.sync ? '已保存并同步知识库' : '保存成功')
  review.visible = false
}
function handleRename(newTitle) {
  console.log('[RENAME]', review.currentRowId, newTitle)
  ElMessage.success('名称已更新')
}
function handleRegen() {
  console.log('[REGEN]', review.currentRowId)
  ElMessage.success('已触发重新生成')
}
function handleAddDoc() {
  console.log('[ADD DOC]', review.currentRowId)
  ElMessage.success('已添加到文档队列')
}

// ===== 行内操作（演示版）=====
function onEdit(row) {
  ElMessage.info(`编辑：${row.title}（自行实现表单/路由跳转）`)
}
function onDelete(row) {
  ElMessageBox.confirm(`确定删除「${row.title}」？`, '提示', { type: 'warning' })
    .then(() => {
      list.value = list.value.filter(x => x.id !== row.id)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}
function onBatchDelete() {
  if (!selection.value?.length) return
  ElMessageBox.confirm(`已选中 ${selection.value.length} 条，确定删除？`, '提示', { type: 'warning' })
    .then(() => {
      const ids = new Set(selection.value.map(x => x.id))
      list.value = list.value.filter(x => !ids.has(x.id))
      selection.value = []
      ElMessage.success('批量删除成功')
    })
    .catch(() => {})
}

function onImport() {
  ElMessage.info('导入 SOP（这里弹文件选择或跳转导入向导）')
}
</script>

<style scoped>
.page { padding: 20px; }

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}
.left { display: flex; align-items: center; }
.right { display: flex; gap: 8px; }
.ml8 { margin-left: 8px; }

.doc-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.thumb {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: linear-gradient(135deg,#eff4ff,#e8f0ff);
  border: 1px solid #e8eef9;
}
.meta { min-width: 0; }
.name { font-weight: 600; color: #2b3a55; }
.sub { font-size: 12px; color: #8b98a9; }
.ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.pager {
  display: flex;
  justify-content: flex-end;
  padding: 14px 0 4px;
}
</style>
