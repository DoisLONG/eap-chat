<!-- src/components/exam/ReviewDialog.vue -->
<template>
  <el-dialog
    :model-value="modelValue"
    @update:modelValue="(v) => $emit('update:modelValue', v)"
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
            disabled
          />
        </div>
        <div class="head-ops">
          <el-button
            type="primary"
            :disabled="local.saving"
            @click.stop="onSave(true)"
          >
            保存并同步知识库
          </el-button>
        </div>
      </div>
    </template>

    <div class="qa-list-container">
      <div class="qa-list">
        <el-card
          v-for="(r, idx) in local.items"
          :key="r._key"
          class="qa-card"
          shadow="hover"
        >
          <template #header>
            <div class="qa-header">
              <span class="qa-title"
                >第 {{ idx + 1 }} 题（{{ r.type || "题型未知" }}）</span
              >
              <el-tag size="small" type="info">{{
                r.position || "模块未知"
              }}</el-tag>
              <el-button
                size="small"
                type="danger"
                style="margin-left: auto"
                @click="remove(idx)"
                >删除</el-button
              >
            </div>
          </template>

          <div class="qa-body">
            <div class="qa-field">
              <label>题目：</label>
              <el-input
                v-model="r.question"
                type="textarea"
                :maxlength="200"
                autosize
                clearable
              />
            </div>
            <div class="qa-field">
              <label>参考答案：</label>
              <el-input
                v-model="r.answer"
                type="textarea"
                :maxlength="200"
                autosize
                clearable
              />
            </div>
            <div class="qa-field">
              <label>解析说明：</label>
              <el-input
                v-model="r.content"
                type="textarea"
                :maxlength="1000"
                autosize
                clearable
              />
            </div>
          </div>
        </el-card>

        <div class="add-line">
          <el-button @click="addOne" plain>+ 新增一题</el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="foot">
        <el-button @click="$emit('update:modelValue', false)">取消</el-button>
        <!-- <el-button type="primary" :disabled="local.saving" @click="onSave()">保存</el-button> -->
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import { saveQaList } from "@/services/sop.api";
import { watchEffect } from "vue";

const props = defineProps({
  modelValue: Boolean,
  data: { type: Object, default: () => ({ title: "", items: [] }) },
});

// console.log("props.data", props.data);
const emit = defineEmits(["update:modelValue", "save"]);

const local = reactive({
  title: "",
  items: [],
  saving: false,
});

// 每次弹窗打开都完整替换，不保留旧数据
watchEffect(() => {
  const v = props.data;
  local.title = v?.title || "";
  local.items = Array.isArray(v?.items)
    ? v.items.map((x) => ({
        ...x,
        _key: cryptoRandom(),
        id: x.id ?? Date.now() + Math.floor(Math.random() * 1000),
        row: x.row ?? 1,
        position: x.position || "未知阶段",
        stage: x.stage || "",
        section: x.section || "",
        type: x.type || "问答题",
        question: x.question || "",
        answer: String(x.answer ?? "").trim(),
        content: x.content || "",
      }))
    : [];
});

// watch(
//   () => props.modelValue,
//   (visible) => {
//     if (visible) {
//       const v = props.data
//       local.title = v?.title || ''
//       local.items = Array.isArray(v?.items)
//         ? v.items.map(x => ({
//             _key: cryptoRandom(),
//             id: x.id ?? Date.now() + Math.floor(Math.random() * 1000),
//             row: x.row ?? 1,
//             position: x.position || `${x.stage || '未知阶段'}-${x.section || '未知模块'}`,
//             stage: x.stage || '',
//             section: x.section || '',
//             type: x.type || '问答题',
//             question: x.question || '',
//             answer: String(x.answer ?? '').trim(),
//             content: x.content || ''
//           }))
//         : []
//     }
//   },
//   { immediate: true }
// )
function cryptoRandom() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

function addOne() {
  local.items.push({
    _key: cryptoRandom(),
    id: Date.now(),
    row: 1,
    position: "新阶段-新模块",
    stage: "新阶段",
    section: "新模块",
    type: "问答题",
    question: "",
    answer: "",
    content: "",
  });
}

function remove(i) {
  local.items.splice(i, 1);
}

async function onSave(sync = false) {
  if (local.saving) return; // 🔒 重入锁：已经在保存就直接返回
  local.saving = true; // 🔒 先上锁，避免双击或双触发

  const cleanTitle = local.title.trim();
  const fileName = props.data?.fileName || `${local.title.trim()}.xlsx`;
  // const fileName = cleanTitle.endsWith('.xlsx') ? cleanTitle : `${cleanTitle}.xlsx`

  const missingIndex = local.items.findIndex(
    (item) => !item.question?.trim() || !item.answer?.trim()
  );

  if (missingIndex !== -1) {
    ElMessage.error(
      `第 ${missingIndex + 1} 题有未填写的内容，请补充完整后再保存`
    );
    local.saving = false;
    return;
  }
  const payload = {
    // file_name: fileName,
    sop_info_id: props.data?.id,
    records: local.items.map((item) => {
      const params = {
        // id: item.id,
        ...item,
        row: item.row,
        position: item.position,
        question: item.question?.trim() || "",
        answer: String(item.answer ?? "").trim(), // 后端要求是 string
        content: item.content ?? "",
        type: item.type ?? "问答题",
      };
      delete params.id;
      return params;
    }),
  };

  local.saving = true;
  // console.log("payload", payload);
  try {
    await saveQaList(payload.sop_info_id, payload.records);
    if (sync) {
      ElMessage.success("已保存并同步知识库");
    } else {
      ElMessage.success("保存成功");
    }
    // emit('save', { title: cleanTitle, items: payload.records, sync })
    // if (!sync) emit('update:modelValue', false)
    emit("after-save", { title: cleanTitle, sync });
    emit("update:modelValue", false);
  } catch (e) {
    console.error("[保存失败]", e);
    ElMessage.error(`保存失败：${e?.response?.data?.detail || e.message}`);
  } finally {
    local.saving = false;
  }
}
</script>
<style scoped>
.review-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: 14px 16px 0 16px;
}

.review-dialog :deep(.el-dialog__body) {
  padding: 12px 16px;
  max-height: 70vh;
  overflow-y: auto;
}
.dlg-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 0 0;
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
}
.title-input {
  flex: 1;
}
.head-ops {
  display: flex;
  align-items: center;
  gap: 8px;
}
.qa-list-container {
  height: calc(70vh - 100px);
  padding: 12px 0;
  overflow: hidden;
}
.qa-list {
  height: 100%;
  overflow-y: auto;
}
.qa-card {
  margin-bottom: 16px;
}
.qa-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.qa-title {
  font-weight: bold;
  font-size: 15px;
}
.qa-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.qa-field label {
  font-size: 13px;
  color: #6b778c;
  display: block;
  margin-bottom: 4px;
}
.add-line {
  text-align: left;
  padding: 12px 4px 0;
}
.foot {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
