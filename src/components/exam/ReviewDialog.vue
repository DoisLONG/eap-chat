<template>
  <el-dialog
    :model-value="modelValue"
    @update:modelValue="v => $emit('update:modelValue', v)"
    width="980px"
    top="6vh"
    :close-on-click-modal="false"
    class="review-dialog"
  >
    <template #header>
      <div class="dlg-head">
        <div class="title-wrap">
          <span class="doc-prefix">题目管理</span>
          <el-input
            v-model="local.title"
            class="title-input"
            placeholder="请输入名称"
            size="large"
            maxlength="60"
            show-word-limit
          />
          <el-button class="ml8" @click="onRename" plain>重命名</el-button>
        </div>
        <div class="head-ops">
          <el-button @click="$emit('regen')" type="primary" plain>重新生成</el-button>
          <el-button @click="$emit('add-doc')" plain>+添加文档</el-button>
          <el-button type="primary" @click="onSave(true)">保存并同步知识库</el-button>
        </div>
      </div>
    </template>

    <!-- 表头 -->
    <div class="thead">
      <div class="th pos">原文位置</div>
      <div class="th q">问题</div>
      <div class="th a">答案</div>
      <div class="th act"></div>
    </div>

    <!-- 行 -->
    <div class="rows">
      <div class="row" v-for="(r, idx) in local.items" :key="r._key">
        <div class="td pos">
          <div class="pos-no">{{ idx + 1 }}</div>
          <div class="pos-meta">
            <div class="pos-line ellipsis">{{ r.stage }}</div>
            <div class="pos-sub ellipsis">{{ r.section }}</div>
          </div>
        </div>

        <div class="td q">
          <div class="label">问题 {{ idx + 1 }}：</div>
          <el-input
            v-model="r.question"
            placeholder="请输入问题"
            :maxlength="120"
            clearable
          />
        </div>

        <div class="td a">
          <div class="label">答：</div>
          <el-input
            v-model="r.answer"
            placeholder="请输入答案"
            :maxlength="200"
            clearable
          />
        </div>

        <div class="td act">
          <el-button size="small" @click="remove(idx)">删除</el-button>
        </div>
      </div>

      <div class="add-line">
        <el-button @click="addOne" plain>+ 新增一题</el-button>
      </div>
    </div>

    <template #footer>
      <div class="foot">
        <el-button @click="$emit('update:modelValue', false)">取 消</el-button>
        <el-button type="primary" @click="onSave()">保 存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /**
   * data 结构示例：
   * {
   *   title: '机械检修技工_SOP-01设备检修标准作业卡',
   *   items: [
   *     { stage:'阶段《作业中》步骤5', section:'作业量/任务分解 新需材料', question:'...', answer:'...' }
   *   ]
   * }
   */
  data: { type: Object, default: () => ({ title: '', items: [] }) }
})
const emit = defineEmits(['update:modelValue','save','regen','add-doc','rename'])

const local = reactive({ title: '', items: [] })

watch(
  () => props.data,
  (v) => {
    local.title = v?.title || ''
    local.items = (v?.items || []).map(x => ({ _key: cryptoRandom(), ...x }))
  },
  { immediate: true, deep: true }
)

function cryptoRandom() {
  try { return crypto.randomUUID?.() || String(Date.now() + Math.random()) }
  catch { return String(Date.now() + Math.random()) }
}

function addOne() {
  local.items.push({
    _key: cryptoRandom(),
    stage: '阶段《作业中》步骤5',
    section: '作业量/任务分解 新需材料',
    question: '',
    answer: ''
  })
}
function remove(i) {
  local.items.splice(i, 1)
}
function onSave(sync = false) {
  // 返回干净对象
  emit('save', {
    title: local.title.trim(),
    items: local.items.map(({ _key, ...rest }) => ({ ...rest })),
    sync
  })
}
function onRename() {
  emit('rename', local.title.trim())
}
</script>

<style scoped>
.review-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: 14px 16px 0 16px;
}
.review-dialog :deep(.el-dialog__body) {
  padding: 8px 16px 10px 16px;
}
.dlg-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.doc-prefix {
  color: #7a869a;
  font-size: 13px;
  margin-right: 4px;
}
.title-input {
  flex: 1;
}
.ml8 { margin-left: 8px; }

.head-ops {
  display: flex;
  align-items: center;
  gap: 8px;
}

.thead {
  display: grid;
  grid-template-columns: 300px 1fr 1fr 76px;
  gap: 8px;
  padding: 8px 4px;
  border-bottom: 1px solid #eef0f4;
  color: #6b778c;
  font-weight: 600;
}
.th { padding-left: 6px; }

.rows {
  max-height: 58vh;
  overflow: auto;
  padding: 6px 0;
}
.row {
  display: grid;
  grid-template-columns: 300px 1fr 1fr 76px;
  gap: 8px;
  align-items: center;
  padding: 10px 4px;
  border-bottom: 1px dashed #eef0f4;
}
.td.pos {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 8px;
  align-items: center;
}
.pos-no {
  width: 28px;
  height: 28px;
  background: #eff4ff;
  color: #3370ff;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 700;
}
.pos-meta {
  min-width: 0;
}
.pos-line { font-weight: 600; }
.pos-sub  { font-size: 12px; color: #8b98a9; }
.ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.td.q .label,
.td.a .label {
  margin-bottom: 6px;
  color: #6b778c;
  font-size: 13px;
}
.add-line {
  padding: 10px 4px 0 4px;
}
.foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
