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
          <span class="doc-prefix">{{ $t("licenseAdmin.timuManage") }}</span>
          <el-input
            v-model="local.title"
            class="title-input"
            :placeholder="$t('licenseAdmin.namePlaceholder')"
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
            {{ $t("licenseAdmin.saveAndUpdate") }}
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
                >{{ $t("licenseAdmin.sort", { i: idx + 1 }) }}（{{
                  $t(r.type) || $t("licenseAdmin.unknownti")
                }}）</span
              >
              <el-tag size="small" type="info">{{
                r.position || $t("licenseAdmin.unknownMode")
              }}</el-tag>
              <el-button
                size="small"
                type="danger"
                style="margin-left: auto"
                @click="remove(idx)"
                >{{ $t("common.delete") }}</el-button
              >
            </div>
          </template>

          <div class="qa-body">
            <div class="qa-field">
              <label>{{ $t("licenseAdmin.timu") }}：</label>
              <el-input
                v-model="r.question"
                type="textarea"
                :maxlength="200"
                autosize
                clearable
              />
            </div>
            <div class="qa-field">
              <label>{{ $t("licenseAdmin.answer") }}：</label>
              <el-input
                v-model="r.answer"
                type="textarea"
                :maxlength="200"
                autosize
                clearable
              />
            </div>
            <div class="qa-field">
              <label>{{ $t("licenseAdmin.analysis") }}：</label>
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
          <el-button @click="addOne" plain
            >+ {{ $t("licenseAdmin.addNew") }}</el-button
          >
        </div>
      </div>
    </div>

    <template #footer>
      <div class="foot">
        <el-button @click="$emit('update:modelValue', false)">{{
          $t("common.cancel")
        }}</el-button>
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
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  modelValue: Boolean,
  data: { type: Object, default: () => ({ title: "", items: [] }) },
});

// console.log("props.data", props.data);
const emit = defineEmits(["update:modelValue", "save", "refresh"]);

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
        position: x.position || t("licenseAdmin.unknownDuan"),
        stage: x.stage || "",
        section: x.section || "",
        type: x.type
          ? t(x.type) || t("licenseAdmin.wenda")
          : t("licenseAdmin.wenda"),
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
    position: t("licenseAdmin.xinjieduanTit"),
    position_id: local.items[0].position_id,
    stage: t("licenseAdmin.newDuanTit"),
    section: t("licenseAdmin.newModuleTit"),
    type: t("licenseAdmin.wenda"),
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
    ElMessage.error(t("licenseAdmin.titTip", { i: missingIndex + 1 }));
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
        type: item.type
          ? t(item.type) || t("licenseAdmin.wenda")
          : t("licenseAdmin.wenda"),
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
      ElMessage.success(t("licenseAdmin.saveSuccess"));
    } else {
      ElMessage.success(t("common.saveSuccess"));
    }
    // emit('save', { title: cleanTitle, items: payload.records, sync })
    // if (!sync) emit('update:modelValue', false)
    emit("after-save", { title: cleanTitle, sync });
    emit("update:modelValue", false);
    emit("refresh");
  } catch (e) {
    console.error("[保存失败]", e);
    ElMessage.error(
      `${t("common.saveError")}：${e?.response?.data?.detail || e.message}`
    );
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
