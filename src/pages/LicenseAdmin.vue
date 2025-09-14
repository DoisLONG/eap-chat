<template>
  <div class="page">
    <!-- 工具条 -->
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

    <!-- 列表 -->
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
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="onEdit(row)">编辑</el-button>
          <el-button size="small" @click="onDelete(row)" type="danger" plain>删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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

    <!-- 复核弹窗（你已有的组件） -->
    <ReviewDialog
      v-model="review.visible"
      :data="review.data"
      @save="handleSaveReview"
      @rename="handleRename"
      @regen="handleRegen"
      @add-doc="handleAddDoc"
    />

    <!-- 导入 SOP 对话框 -->
    <el-dialog
      v-model="importDlg.visible"
      title="导入 SOP"
      width="520px"
      :close-on-click-modal="false"
    >
      <div class="import-body">
        <el-form label-width="110px">
          <el-form-item label="生成题目数">
            <el-input-number v-model="importDlg.totalQa" :min="1" :max="200" />
          </el-form-item>

          <el-form-item label="选择文件">
            <el-upload
              drag
              multiple
              :auto-upload="false"
              :file-list="importDlg.files"
              :on-change="onUploadChange"
              :on-remove="onUploadRemove"
              accept=".xlsx,.xls"
            >
              <i class="el-icon-upload" />
              <div class="el-upload__text">
                拖拽文件到此处，或 <em>点击选择</em><br />
                支持 .xlsx / .xls，多文件上传
              </div>
            </el-upload>
          </el-form-item>
        </el-form>

        <div v-if="importDlg.running" class="import-progress">
          <el-alert
            title="任务已提交，正在轮询进度，请勿关闭窗口"
            type="info"
            :closable="false"
            show-icon
          />
          <div class="hint">任务ID：{{ importDlg.taskId || '-' }}，状态：{{ importDlg.status || 'PENDING' }}</div>
        </div>
      </div>

      <template #footer>
        <el-button @click="importDlg.visible=false" :disabled="importDlg.running">取 消</el-button>
        <el-button type="primary" @click="startImport" :loading="importDlg.running" :disabled="!importDlg.files.length">
          {{ importDlg.running ? '导入中…' : '开始导入' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import ReviewDialog from '@/components/exam/ReviewDialog.vue'
import { getSops, generateQa, pollTaskStatus, deleteSop, getQaList, saveQaList } from '@/services/sop.api'

// ===== 查询条件 & 分页 =====
const q = reactive({ keyword: '' })
const pager = reactive({ page: 1, pageSize: 10, total: 0 })
const loading = ref(false)
const list = ref([])
let selection = ref([])

// 你的系统内的 user_id（后端默认 test_user，也可改从登录信息取）
const userId = ref('test_user')

// ===== 加载列表（对接 /v1/dataprep/sops）=====
async function load() {
  loading.value = true
  try {
    // 发起请求
    const { data } = await getSops({ user_id: userId.value })

    // 解析 results 字段（接口真实返回格式：{ status, message, results: [string] }）
    let arr = []
    try {
      arr = Array.isArray(data?.results) ? data.results : []
    } catch {
      arr = []
    }

    // 映射到前端展示结构
    const mapped = arr.map((fileName, idx) => {
      const title = fileName.replace(/\.[^.]+$/, '') // 去掉 .xlsx 后缀
      return {
        id: idx + 1,
        title,
        fileName,
        company: '—', // 默认值，可由后端返回后再替换
        dept: '—',
        job: '—',
        version: 'v1',
        examLinkText: `${title} 试题题目`
      }
    })

    // 搜索关键词过滤
    const keyword = q.keyword.trim()
    const filtered = keyword
      ? mapped.filter(x => [x.title, x.company, x.dept, x.job].some(field => field.includes(keyword)))
      : mapped

    // 分页逻辑
    pager.total = filtered.length
    const start = (pager.page - 1) * pager.pageSize
    list.value = filtered.slice(start, start + pager.pageSize)
  } catch (e) {
    console.error('[load error]', e)
    ElMessage.error('SOP 列表加载失败')
    // 加兜底 mock，避免页面空白
    pager.total = 1
    list.value = [{
      id: 1,
      title: '示例_SOP文件',
      fileName: '示例_SOP文件.xlsx',
      company: '示例公司',
      dept: '示例部门',
      job: '示例岗位',
      version: 'v1',
      examLinkText: '示例_SOP文件 试题题目'
    }]
  } finally {
    loading.value = false
  }
}

onMounted(load)

// ===== 复核弹窗 =====
const review = reactive({
  visible: false,
  data: {
    title: '',
    items: []
  },
  currentRow: null
})

async function openReview(row) {
  review.currentRow = row
  review.data.title = row.title
  review.visible = true

  try {
    // const { data } = await getQaList({ file_name: row.fileName })
    const fileName = review.currentRow?.fileName
    const { data } = await getQaList(fileName)
    const items = typeof data === 'string' ? JSON.parse(data) : data

    // 确保结构合法
    review.data.items = Array.isArray(items)
      ? items.map((x, i) => ({
          _key: i + '-' + Date.now(),
          stage: x.stage || '',
          section: x.section || '',
          question: x.question || '',
          answer: x.answer || ''
        }))
      : []

  } catch (e) {
    console.error('加载题目失败', e)
    review.data.items = []
    ElMessage.error('加载题目失败')
  }
}


// 复核弹窗事件（演示逻辑）
function handleSaveReview(payload) {
  console.log('[SAVE REVIEW]', review.currentRow?.fileName, payload)
  ElMessage.success(payload.sync ? '已保存并同步知识库' : '保存成功')
  review.visible = false
}
function handleRename(newTitle) {
  if (!review.currentRow) return
  review.currentRow.title = newTitle
  ElMessage.success('名称已更新')
}
function handleRegen() {
  ElMessage.success('已触发重新生成')
}
function handleAddDoc() {
  ElMessage.success('已添加到文档队列')
}

// ===== 行内操作（演示版/可对接 delete_sop）=====
async function onDelete(row) {
  await ElMessageBox.confirm(`确定删除「${row.title}」？`, '提示', { type: 'warning' })
  try {
    // 后端删除：/v1/dataprep/delete_sop { file_name }
    await deleteSop(row.fileName)
    ElMessage.success('删除成功')
    pager.page = 1
    await load()
  } catch (e) {
    console.error(e)
    ElMessage.error('删除失败')
  }
}
function onBatchDelete() {
  if (!selection.value?.length) return
  ElMessageBox.confirm(`已选中 ${selection.value.length} 条，确定删除？`, '提示', { type: 'warning' })
    .then(async () => {
      try {
        await Promise.all(selection.value.map(x => deleteSop(x.fileName)))
        selection.value = []
        ElMessage.success('批量删除成功')
        pager.page = 1
        await load()
      } catch (e) {
        console.error(e)
        ElMessage.error('批量删除失败')
      }
    })
}
function onEdit(row) {
  ElMessage.info(`编辑：${row.title}（自行实现表单/路由跳转）`)
}

// ===== 导入 SOP（上传 + 轮询）=====
const importDlg = reactive({
  visible: false,
  files: [],        // Element Plus fileList
  totalQa: 50,
  running: false,
  taskId: '',
  status: '',
})

function onImport() {
  importDlg.visible = true
}
function onUploadChange(file, fileList) {
  importDlg.files = fileList
}
function onUploadRemove(file, fileList) {
  importDlg.files = fileList
}

async function startImport() {
  if (!importDlg.files.length) return ElMessage.warning('请先选择 Excel 文件')
  importDlg.running = true
  importDlg.taskId = ''
  importDlg.status = 'PENDING'
  try {
    const realFiles = importDlg.files.map(f => f.raw).filter(Boolean)
    const { data: taskId } = await generateQa(realFiles, importDlg.totalQa)
    importDlg.taskId = taskId

    const finalStatus = await pollTaskStatus(taskId, {
      judge: (s) => !!s && String(s).toUpperCase() !== 'PENDING',
      intervalMs: 2000,
      maxTimes: 300
    })
    importDlg.status = finalStatus
    ElMessage.success('导入并生成完成')
    importDlg.visible = false
    pager.page = 1
    await load()
  } catch (e) {
    console.error(e)
    ElMessage.error('导入失败')
  } finally {
    importDlg.running = false
  }
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

.import-body { padding: 4px 4px 0; }
.import-progress { margin-top: 10px; }
.hint { margin-top: 8px; font-size: 12px; color: #778; }
</style>
