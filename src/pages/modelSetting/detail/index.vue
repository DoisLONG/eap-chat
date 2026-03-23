<template>
  <div class="model-detail-container">
    <div class="header">
      <div class="header-content">
        <div class="title">模型配置</div>
        <div class="desc">
          统一管理数据预处理、陪练交互、Embedding 及可选语音模型配置。
        </div>
      </div>
      <div>
        <el-button
          type="plain"
          style="margin-right: 8px"
          class="cancel-btn"
          @click="handleBack"
          >取消</el-button
        >
        <el-button type="primary" class="add-btn" @click="handleSaveConfig"
          >保存配置</el-button
        >
      </div>
    </div>
    <div class="content">
      <div class="content-left">
        <div class="nav-container">
          <div class="nav-title">配置导航</div>
          <div class="nav-items">
            <div
              v-for="(item, index) in navItems"
              :key="index"
              class="nav-item"
              :class="{ active: activeNavItem === index }"
              @click="handleNavClick(index)"
            >
              {{ item.name }}
            </div>
          </div>
          <div
            class="suggestion-box"
            v-if="
              operateMode === 'add' ||
              (operateMode === 'edit' &&
                ['dataprep_llm', 'smart_practice_llm'].includes(editShowModle))
            "
          >
            <div class="suggestion-title">建议：</div>
            <div class="suggestion-content">
              <p
                v-if="operateMode === 'add' || editShowModle === 'dataprep_llm'"
              >
                数据预处理优先选择生成质量高、稳定性强的模型；
              </p>
              <p
                v-if="
                  operateMode === 'add' ||
                  editShowModle === 'smart_practice_llm'
                "
              >
                陪练交互优先选择响应速度快、延迟低的模型。
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="content-right" ref="contentRightRef">
        <div class="config-content">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-position="top"
          >
            <!-- 大模型配置 -->
            <div class="config-section" id="llm-config">
              <div class="section-header">
                <h2>一、大模型配置</h2>
                <span class="section-tag">核心配置</span>
              </div>
              <p class="section-desc">
                用于替换和管理数据预处理模型、陪练交互模型。
              </p>

              <div
                class="model-grid"
                :class="{
                  'model-grid2': [
                    'dataprep_llm',
                    'smart_practice_llm',
                  ].includes(editShowModle),
                }"
              >
                <div
                  class="model-item"
                  v-if="
                    operateMode === 'add' ||
                    (operateMode === 'edit' && editShowModle === 'dataprep_llm')
                  "
                >
                  <div class="model-header">
                    <h3>数据预处理模型</h3>
                    <span class="model-recommend">建议高质量</span>
                  </div>
                  <p class="model-desc">
                    适用于题目生成、内容理解、数据处理等场景，建议选用生成质量更高的模型。
                  </p>

                  <el-form-item prop="dataprep_llm.modelName" class="form-item">
                    <label>Model Name</label>
                    <el-input
                      v-model="formData.dataprep_llm.modelName"
                      placeholder="例如：gpt-4.1 / qwen-max / deepseek-v3"
                    />
                  </el-form-item>
                  <el-form-item prop="dataprep_llm.apiKey" class="form-item">
                    <label>API Key</label>
                    <el-input
                      v-model="formData.dataprep_llm.apiKey"
                      placeholder="请输入 API Key"
                    />
                  </el-form-item>
                  <el-form-item prop="dataprep_llm.baseUrl" class="form-item">
                    <label>Base URL</label>
                    <el-input
                      v-model="formData.dataprep_llm.baseUrl"
                      placeholder="例如：https://api.xxx.com/v1"
                    />
                  </el-form-item>
                </div>

                <div
                  class="model-item"
                  v-if="
                    operateMode === 'add' ||
                    (operateMode === 'edit' &&
                      editShowModle === 'smart_practice_llm')
                  "
                >
                  <div class="model-header">
                    <h3>陪练交互模型</h3>
                    <span class="model-recommend recommend-low-latency"
                      >建议低延迟</span
                    >
                  </div>
                  <p class="model-desc">
                    适用于实时问答、网络反馈、对话互动等场景，建议选用响应速度更快的模型。
                  </p>

                  <el-form-item
                    prop="smart_practice_llm.modelName"
                    class="form-item"
                  >
                    <label>Model Name</label>
                    <el-input
                      v-model="formData.smart_practice_llm.modelName"
                      placeholder="例如：gpt-4o-mini / qwen-turbo / deepseek-chat"
                    />
                  </el-form-item>
                  <el-form-item
                    prop="smart_practice_llm.apiKey"
                    class="form-item"
                  >
                    <label>API Key</label>
                    <el-input
                      v-model="formData.smart_practice_llm.apiKey"
                      placeholder="请输入 API Key"
                    />
                  </el-form-item>
                  <el-form-item
                    prop="smart_practice_llm.baseUrl"
                    class="form-item"
                  >
                    <label>Base URL</label>
                    <el-input
                      v-model="formData.smart_practice_llm.baseUrl"
                      placeholder="例如：https://api.xxx.com/v1"
                    />
                  </el-form-item>
                </div>
              </div>
            </div>

            <!-- Embedding 配置 -->
            <div
              class="config-section"
              id="embedding-config"
              v-if="
                operateMode === 'add' ||
                (operateMode === 'edit' && editShowModle === 'embedding')
              "
            >
              <div class="section-header">
                <h2>二、Embedding 配置</h2>
                <span class="section-tag tag-purple">需支持 1024 维</span>
              </div>
              <p class="section-desc">
                用于向量化检索、知识匹配等场景，请确保模型支持 1024 维向量输出。
              </p>

              <div class="form-grid">
                <el-form-item
                  prop="embedding.modelName"
                  style="margin-right: 16px"
                  class="form-item"
                >
                  <label>Model Name</label>
                  <el-input
                    v-model="formData.embedding.modelName"
                    placeholder="例如：text-embedding-3-large / bge-large-zh"
                  />
                </el-form-item>
                <el-form-item prop="embedding.apiKey" class="form-item">
                  <label>API Key</label>
                  <el-input
                    v-model="formData.embedding.apiKey"
                    placeholder="请输入 API Key"
                  />
                </el-form-item>
                <el-form-item
                  prop="embedding.baseUrl"
                  class="form-item full-width"
                >
                  <label>Base URL</label>
                  <el-input
                    v-model="formData.embedding.baseUrl"
                    placeholder="例如：https://api.xxx.com/v1"
                  />
                </el-form-item>
              </div>

              <div class="config-note">
                <p>
                  配置说明：Embedding
                  模型需要兼容系统向量检索能力，建议优先选择支持 1024
                  维输出的模型，避免与现有知识检索链路不兼容。
                </p>
              </div>
            </div>

            <!-- ASR 配置 -->
            <div
              class="config-section"
              id="asr-config"
              v-if="
                operateMode === 'add' ||
                (operateMode === 'edit' && editShowModle === 'asr')
              "
            >
              <div class="section-header">
                <h2>三、ASR 配置（可选）</h2>
                <div class="asr-toggle">
                  <span>启用 ASR</span>
                  <el-switch
                    v-model="formData.asr.enabled"
                    @change="handleASRChange"
                  />
                </div>
              </div>
              <p class="section-desc">
                当系统需要语音输入、语音转文字时启用；若当前仅使用文本交互，可先不配置。
              </p>

              <div class="form-grid">
                <el-form-item
                  prop="asr.modelName"
                  style="margin-right: 16px"
                  class="form-item"
                  :disabled="!formData.asr.enabled"
                >
                  <label>Model Name</label>
                  <el-input
                    v-model="formData.asr.modelName"
                    placeholder="例如：whisper-large-v3"
                    :disabled="!formData.asr.enabled"
                  />
                </el-form-item>
                <el-form-item
                  prop="asr.apiKey"
                  class="form-item"
                  :disabled="!formData.asr.enabled"
                >
                  <label>API Key</label>
                  <el-input
                    v-model="formData.asr.apiKey"
                    placeholder="请输入 API Key"
                    :disabled="!formData.asr.enabled"
                  />
                </el-form-item>
                <el-form-item
                  prop="asr.baseUrl"
                  class="form-item full-width"
                  :disabled="!formData.asr.enabled"
                >
                  <label>Base URL</label>
                  <el-input
                    v-model="formData.asr.baseUrl"
                    placeholder="例如：https://api.xxx.com/v1"
                    :disabled="!formData.asr.enabled"
                  />
                </el-form-item>
              </div>
            </div>

            <!-- 连通性测试与状态 -->
            <div class="config-section" id="connectivity-test">
              <div class="section-header">
                <h2>四、连通性测试与状态</h2>
                <el-tooltip
                  content="暂无可测试配置"
                  placement="top"
                  effect="dark"
                  :disabled="!isCanTest"
                  popper-style="box-sizing: border-box; background: rgba(1, 2, 29, 0.8); font-size: 12px; border-radius: 8px; padding: 12px;"
                >
                  <el-button
                    type="plain"
                    class="test-btn"
                    @click="handleTestConnectivity"
                    :disabled="isCanTest"
                    :loading="isTesting"
                  >
                    一键测试连接</el-button
                  >
                </el-tooltip>
              </div>
              <p class="section-desc">
                配置完成后建议逐项测试，避免保存后运行异常。
              </p>

              <div class="status-grid">
                <!-- 数据预处理模型 -->
                <div
                  v-if="formData.dataprep_llm?.modelName"
                  class="status-item"
                >
                  <h3>数据预处理模型</h3>
                  <div
                    :class="[
                      'status-indicator',
                      testStatus.dataprep_llm.status,
                    ]"
                  >
                    <div
                      class="dot"
                      v-if="
                        ['ready', 'pending'].includes(
                          testStatus.dataprep_llm.status,
                        )
                      "
                    ></div>
                    <div
                      class="dot"
                      v-else-if="testStatus.dataprep_llm.status === 'success'"
                    ></div>
                    <div
                      class="dot"
                      v-else-if="testStatus.dataprep_llm.status === 'failed'"
                    >
                      X
                    </div>
                    {{
                      testStatus.dataprep_llm.status === "ready"
                        ? "待测试"
                        : testStatus.dataprep_llm.status === "pending"
                          ? "测试中"
                          : testStatus.dataprep_llm.status === "success"
                            ? "连接正常"
                            : testStatus.dataprep_llm.message || "连接失败"
                    }}
                  </div>
                </div>

                <!-- 陪练交互模型 -->
                <div
                  v-if="formData.smart_practice_llm?.modelName"
                  class="status-item"
                >
                  <h3>陪练交互模型</h3>
                  <div
                    :class="[
                      'status-indicator',
                      testStatus.smart_practice_llm.status,
                    ]"
                  >
                    <div
                      class="dot"
                      v-if="
                        ['ready', 'pending'].includes(
                          testStatus.smart_practice_llm.status,
                        )
                      "
                    ></div>
                    <div
                      class="dot"
                      v-else-if="
                        testStatus.smart_practice_llm.status === 'success'
                      "
                    ></div>
                    <div
                      class="dot"
                      v-else-if="
                        testStatus.smart_practice_llm.status === 'failed'
                      "
                    >
                      X
                    </div>
                    {{
                      testStatus.smart_practice_llm.status === "ready"
                        ? "待测试"
                        : testStatus.smart_practice_llm.status === "pending"
                          ? "测试中"
                          : testStatus.smart_practice_llm.status === "success"
                            ? "连接正常"
                            : testStatus.smart_practice_llm.message ||
                              "连接失败"
                    }}
                  </div>
                </div>

                <!-- Embedding 模型 -->
                <div v-if="formData.embedding?.modelName" class="status-item">
                  <h3>Embedding 模型</h3>
                  <div
                    :class="['status-indicator', testStatus.embedding.status]"
                  >
                    <div
                      class="dot"
                      v-if="
                        ['ready', 'pending'].includes(
                          testStatus.embedding.status,
                        )
                      "
                    ></div>
                    <div
                      class="dot"
                      v-else-if="testStatus.embedding.status === 'success'"
                    ></div>
                    <div
                      class="dot"
                      v-else-if="testStatus.embedding.status === 'failed'"
                    >
                      X
                    </div>
                    {{
                      testStatus.embedding.status === "ready"
                        ? "待测试"
                        : testStatus.embedding.status === "pending"
                          ? "测试中"
                          : testStatus.embedding.status === "success"
                            ? "连接正常"
                            : testStatus.embedding.message || "连接失败"
                    }}
                  </div>
                </div>

                <!-- ASR 模型 -->
                <div v-if="formData.asr?.modelName" class="status-item">
                  <h3>ASR 模型</h3>
                  <div :class="['status-indicator', testStatus.asr.status]">
                    <div
                      class="dot"
                      v-if="
                        ['ready', 'pending'].includes(testStatus.asr.status)
                      "
                    ></div>
                    <div
                      class="dot"
                      v-else-if="testStatus.asr.status === 'success'"
                    ></div>
                    <div
                      class="dot"
                      v-else-if="testStatus.asr.status === 'failed'"
                    >
                      X
                    </div>
                    {{
                      testStatus.asr.status === "ready"
                        ? "待测试"
                        : testStatus.asr.status === "pending"
                          ? "测试中"
                          : testStatus.asr.status === "success"
                            ? "连接正常"
                            : testStatus.asr.message || "连接失败"
                    }}
                  </div>
                </div>
              </div>
            </div>
          </el-form>
        </div>
      </div>
    </div>
    <el-dialog title="提示" v-model="dialogVisible" width="400px">
      <div class="dialog-content">
        {{ dialogContent }}
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import {
  updateModelConfig,
  testAllModelConfig,
} from "@/services/company.service";

const router = useRouter();
const contentRightRef = ref(null);
const activeNavItem = ref(0);
const formRef = ref(null);
const operateMode = ref("add"); // add: 新增, edit: 修改
const editShowModle = ref("");
const isTesting = ref(false);

// 测试状态
const testStatus = ref({
  dataprep_llm: {
    status: "ready", //  ready：待测试，pending: 测试中, success: 成功, failed: 失败
    message: "",
  },
  smart_practice_llm: {
    status: "ready",
    message: "",
  },
  embedding: {
    status: "ready",
    message: "",
  },
  asr: {
    status: "ready",
    message: "",
  },
});

// 表单数据
const formData = ref({
  // 数据预处理模型
  dataprep_llm: {
    modelName: "",
    apiKey: "",
    baseUrl: "",
  },
  // 陪练交互模型
  smart_practice_llm: {
    modelName: "",
    apiKey: "",
    baseUrl: "",
  },
  // Embedding 配置
  embedding: {
    modelName: "",
    apiKey: "",
    baseUrl: "",
  },
  // ASR 配置
  asr: {
    enabled: false,
    modelName: "",
    apiKey: "",
    baseUrl: "",
  },
});

onMounted(() => {
  const editConfig = localStorage.getItem("editConfig");
  if (editConfig) {
    operateMode.value = "edit"; // 编辑模式，编辑模式只显示需要编辑的单模块
    const config = JSON.parse(editConfig);
    if (config.scope === "dataprep_llm") {
      editShowModle.value = "dataprep_llm";
      navItems.value = [
        { id: "llm-config", name: "大模型配置" },
        { id: "connectivity-test", name: "连通性测试与状态" },
      ];
      formData.value.dataprep_llm = {
        modelName: config.model,
        apiKey: config.api_key_plain,
        baseUrl: config.base_url,
      };
    } else if (config.scope === "smart_practice_llm") {
      editShowModle.value = "smart_practice_llm";
      navItems.value = [
        { id: "llm-config", name: "大模型配置" },
        { id: "connectivity-test", name: "连通性测试与状态" },
      ];
      formData.value.smart_practice_llm = {
        modelName: config.model,
        apiKey: config.api_key_plain,
        baseUrl: config.base_url,
      };
    } else if (config.scope === "embedding") {
      editShowModle.value = "embedding";
      navItems.value = [
        { id: "embedding-config", name: "Embedding 配置" },
        { id: "connectivity-test", name: "连通性测试与状态" },
      ];
      formData.value.embedding = {
        modelName: config.model,
        apiKey: config.api_key_plain,
        baseUrl: config.base_url,
      };
    } else if (config.scope === "asr") {
      editShowModle.value = "asr";
      navItems.value = [
        { id: "asr-config", name: "ASR 配置（可选）" },
        { id: "connectivity-test", name: "连通性测试与状态" },
      ];
      formData.value.asr = {
        modelName: config.model,
        apiKey: config.api_key_plain,
        baseUrl: config.base_url,
      };
    }
  }
});

const handleASRChange = (val) => {
  if (!val) {
    formData.value.asr.modelName = "";
    formData.value.asr.apiKey = "";
    formData.value.asr.baseUrl = "";
  }
};
const isCanTest = computed(() => {
  return (
    !formData.value.dataprep_llm.modelName &&
    !formData.value.smart_practice_llm.modelName &&
    !formData.value.embedding.modelName &&
    !formData.value.asr.modelName
  );
});
// 表单校验规则
const rules = ref({
  // 数据预处理模型
  "dataprep_llm.modelName": [
    { required: false, message: "请输入模型名称", trigger: "blur" },
  ],
  "dataprep_llm.apiKey": [
    { required: false, message: "请输入 API Key", trigger: "blur" },
  ],
  "dataprep_llm.baseUrl": [
    {
      required: true,
      message: "请输入 Base URL",
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (formData.value.dataprep_llm.modelName && !value) {
          callback(new Error("请输入 Base URL"));
        } else if (formData.value.dataprep_llm.modelName && value) {
          // 验证 URL 格式
          const urlRegex =
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
          if (!urlRegex.test(value)) {
            callback(new Error("请输入有效的 URL"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      },
    },
  ],
  // 陪练交互模型
  "smart_practice_llm.modelName": [
    { required: false, message: "请输入模型名称", trigger: "blur" },
  ],
  "smart_practice_llm.apiKey": [
    { required: false, message: "请输入 API Key", trigger: "blur" },
  ],
  "smart_practice_llm.baseUrl": [
    {
      required: true,
      message: "请输入 Base URL",
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (formData.value.smart_practice_llm.modelName && !value) {
          callback(new Error("请输入 Base URL"));
        } else if (formData.value.smart_practice_llm.modelName && value) {
          // 验证 URL 格式
          const urlRegex =
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
          if (!urlRegex.test(value)) {
            callback(new Error("请输入有效的 URL"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      },
    },
  ],
  // Embedding 配置
  "embedding.modelName": [
    { required: false, message: "请输入模型名称", trigger: "blur" },
  ],
  "embedding.apiKey": [
    { required: false, message: "请输入 API Key", trigger: "blur" },
  ],
  "embedding.baseUrl": [
    {
      required: true,
      message: "请输入 Base URL",
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (formData.value.embedding.modelName && !value) {
          callback(new Error("请输入 Base URL"));
        } else if (formData.value.embedding.modelName && value) {
          // 验证 URL 格式
          const urlRegex =
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
          if (!urlRegex.test(value)) {
            callback(new Error("请输入有效的 URL"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      },
    },
  ],
  // ASR 配置（可选）
  "asr.modelName": [
    {
      required: true,
      message: "请输入模型名称",
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (formData.value.asr.enabled && !value) {
          callback(new Error("请输入模型名称"));
        } else {
          callback();
        }
      },
    },
  ],
  "asr.apiKey": [
    {
      required: false,
      message: "请输入 API Key",
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (formData.value.asr.enabled && !value) {
          callback(new Error("请输入 API Key"));
        } else {
          callback();
        }
      },
    },
  ],
  "asr.baseUrl": [
    {
      required: false,
      message: "请输入 Base URL",
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (
          formData.value.asr.enabled &&
          formData.value.asr.modelName &&
          !value
        ) {
          callback(new Error("请输入 Base URL"));
        } else if (
          formData.value.asr.enabled &&
          formData.value.asr.modelName &&
          value
        ) {
          // 验证 URL 格式
          const urlRegex =
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
          if (!urlRegex.test(value)) {
            callback(new Error("请输入有效的 URL"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      },
    },
  ],
});

const handleBack = () => {
  router.back();
};

const dialogContent = ref("");
const dialogVisible = ref(false);
const handleSaveConfig = () => {
  if (formRef.value) {
    formRef.value.validate((valid) => {
      if (valid) {
        // 新增的需要给予是否已加模型提示判断
        if (operateMode.value === "add") {
          const exists = localStorage.getItem("existsConfig");
          if (exists) {
            const existsConfig = JSON.parse(exists);
            // dataprep_llm smart_practice_llm  embedding  asr
            let str = "";
            if (
              formData.value.dataprep_llm.modelName &&
              existsConfig.includes("dataprep_llm")
            ) {
              str += "数据预处理模型 ";
            }
            if (
              formData.value.smart_practice_llm.modelName &&
              existsConfig.includes("smart_practice_llm")
            ) {
              str += "陪练交互模型 ";
            }
            if (
              formData.value.embedding.modelName &&
              existsConfig.includes("embedding")
            ) {
              str += "Embedding 模型 ";
            }
            if (
              formData.value.asr.enabled &&
              formData.value.asr.modelName &&
              existsConfig.includes("asr")
            ) {
              str += "ASR 模型";
            }
            if (str) {
              dialogVisible.value = true;
              dialogContent.value = `您已存在${str}，是否继续添加？`;
              return;
            }
          }
        }
        handleSave();
      }
    });
  }
};
const transformData = () => {
  // 转换数据格式
  const configData = [];
  if (formData.value.dataprep_llm.modelName) {
    const item = {
      scope: "dataprep_llm",
      model: formData.value.dataprep_llm.modelName,
      base_url: formData.value.dataprep_llm.baseUrl,
      api_key: formData.value.dataprep_llm.apiKey,
    };
    if (!["ready", "pending"].includes(testStatus.value.dataprep_llm.status)) {
      item.last_test_status = testStatus.value.dataprep_llm.status;
    }
    configData.push(item);
  }
  if (formData.value.smart_practice_llm.modelName) {
    const item = {
      scope: "smart_practice_llm",
      model: formData.value.smart_practice_llm.modelName,
      base_url: formData.value.smart_practice_llm.baseUrl,
      api_key: formData.value.smart_practice_llm.apiKey,
    };
    if (
      !["ready", "pending"].includes(testStatus.value.smart_practice_llm.status)
    ) {
      item.last_test_status = testStatus.value.smart_practice_llm.status;
    }
    configData.push(item);
  }
  if (formData.value.embedding.modelName) {
    const item = {
      scope: "embedding",
      model: formData.value.embedding.modelName,
      base_url: formData.value.embedding.baseUrl,
      api_key: formData.value.embedding.apiKey,
    };
    if (!["ready", "pending"].includes(testStatus.value.embedding.status)) {
      item.last_test_status = testStatus.value.embedding.status;
    }
    configData.push(item);
  }
  // 只有当 ASR 启用时才添加 ASR 配置
  if (formData.value.asr.enabled) {
    const item = {
      scope: "asr",
      model: formData.value.asr.modelName,
      base_url: formData.value.asr.baseUrl,
      api_key: formData.value.asr.apiKey,
    };
    if (!["ready", "pending"].includes(testStatus.value.asr.status)) {
      item.last_test_status = testStatus.value.asr.status;
    }
    configData.push(item);
  }
  return {
    configs: configData,
  };
};
const handleSave = () => {
  const configData = transformData();
  const isNotTested = configData.configs.some(
    (item) =>
      ["ready", "pending"].includes(item.last_test_status) ||
      !item.last_test_status,
  );
  if (isNotTested) {
    ElMessage.error("请先进行模型连通性测试");
    return;
  }
  if (configData.configs.length > 0) {
    console.log("表单验证通过，准备保存配置:", configData);
    updateModelConfig(configData).then((res) => {
      if (res.data.status === 200) {
        ElMessage.success("配置保存成功");
        router.back();
      } else {
        ElMessage.error(res.data.message || "配置保存失败");
      }
    });
  } else {
    ElMessage.error("无配置修改");
  }
};
// 测试连通性
const handleTestConnectivity = () => {
  // 重置测试状态
  testStatus.value = {
    dataprep_llm: {
      status: "ready",
      message: "",
    },
    smart_practice_llm: {
      status: "ready",
      message: "",
    },
    embedding: {
      status: "ready",
      message: "",
    },
    asr: {
      status: "ready",
      message: "",
    },
  };

  // 检查数据预处理模型
  if (formData.value.dataprep_llm.modelName) {
    testStatus.value.dataprep_llm.status = "pending";
  }

  // 检查陪练交互模型
  if (formData.value.smart_practice_llm.modelName) {
    testStatus.value.smart_practice_llm.status = "pending";
  }

  // 检查 Embedding 模型
  if (formData.value.embedding.modelName) {
    testStatus.value.embedding.status = "pending";
  }

  // 检查 ASR 模型（仅在启用时）
  if (formData.value.asr.enabled && formData.value.asr.modelName) {
    testStatus.value.asr.status = "pending";
  }

  const testConfigs = transformData();
  // 模拟测试过程
  if (testConfigs.configs.length > 0) {
    isTesting.value = true;
    testAllModelConfig(testConfigs)
      .then((res) => {
        if (res.data.status === 200) {
          // 更新测试状态
          res.data.results.forEach((item) => {
            testStatus.value[item.scope].status = item.status;
            testStatus.value[item.scope].message = item.summary;
          });
        } else {
          ElMessage.error("连通性测试失败");
          // 更新测试状态
          res.data.results.forEach((item) => {
            testStatus.value[item.scope].status = "failed";
          });
        }
      })
      .finally(() => {
        isTesting.value = false;
      });
  } else {
    ElMessage.warning("请至少填写一个模型名称");
  }
};
const navItems = ref([
  { id: "llm-config", name: "大模型配置" },
  { id: "embedding-config", name: "Embedding 配置" },
  { id: "asr-config", name: "ASR 配置（可选）" },
  { id: "connectivity-test", name: "连通性测试与状态" },
]);

const handleNavClick = (index) => {
  activeNavItem.value = index;
  const targetId = navItems.value[index].id;
  const targetElement = document.getElementById(targetId);
  // 第一个标题的top
  const firstElement = document.getElementById(navItems.value[0].id);
  if (targetElement && contentRightRef.value) {
    contentRightRef.value.scrollTo({
      top: targetElement.offsetTop - firstElement.offsetTop,
      behavior: "smooth",
    });
  }
};

// 监听模型名称变化，重置测试状态
watch(
  () => formData.value.dataprep_llm.modelName,
  () => {
    testStatus.value.dataprep_llm.status = "ready";
    testStatus.value.dataprep_llm.message = "";
  },
);

watch(
  () => formData.value.smart_practice_llm.modelName,
  () => {
    testStatus.value.smart_practice_llm.status = "ready";
    testStatus.value.smart_practice_llm.message = "";
  },
);

watch(
  () => formData.value.embedding.modelName,
  () => {
    testStatus.value.embedding.status = "ready";
    testStatus.value.embedding.message = "";
  },
);

watch(
  () => formData.value.asr.modelName,
  () => {
    testStatus.value.asr.status = "ready";
    testStatus.value.asr.message = "";
  },
);
</script>
<style scoped lang="scss">
.model-detail-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  :deep(.el-form-item--default .el-form-item__content) {
    line-height: 20px !important;
    margin-bottom: 6px !important;
  }
  :deep(.el-input__inner) {
    height: 34px;
    line-height: 34px;
  }
}
.header {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 8px;

  .header-content {
    .title {
      height: 28px;
      line-height: 28px;
      font-size: 20px;
      font-weight: 600;
      color: #01021d;
    }
    .desc {
      height: 22px;
      line-height: 22px;
      font-size: 14px;
      font-weight: 400;
      color: #6a7282;
    }
  }
  .cancel-btn {
    height: 36px;
    line-height: 36px;
    border-radius: 4px;
  }
  .add-btn {
    height: 36px;
    line-height: 36px;
    width: 108px;
    border-radius: 4px;
  }
}
.content {
  width: 100%;
  margin-top: 16px;
  display: flex;
  .content-left {
    width: 200px;
    background: #fff;
    border-radius: 10px;
    padding: 16px;
    height: 398px;
    box-sizing: border-box;
    .nav-container {
      .nav-title {
        height: 16px;
        line-height: 16px;
        font-size: 12px;
        font-weight: 500;
        color: #6a7282;
        margin-bottom: 12px;
      }
      .nav-items {
        .nav-item {
          height: 36px;
          line-height: 36px;
          padding: 0 12px;
          border-radius: 4px;
          margin-bottom: 4px;
          font-size: 14px;
          color: #4a5565;
          cursor: pointer;
          transition: all 0.3s ease;
          &:hover {
            background-color: #f0f7ff;
          }
          &.active {
            background-color: #1677ff;
            color: #fff;
          }
        }
      }
      .suggestion-box {
        margin-top: 24px;
        padding: 13px 12px;
        border: 1px solid #fef3c6;
        border-radius: 4px;
        background-color: #fef3c60f;
        .suggestion-title {
          height: 20px;
          line-height: 20px;
          font-size: 14px;
          font-weight: 500;
          color: #973c00;
          margin-bottom: 8px;
        }
        .suggestion-content {
          font-size: 12px;
          color: #973c00;
          line-height: 20px;
          font-weight: 400;
          p {
            margin: 0;
          }
        }
      }
    }
  }
  .content-right {
    width: calc(100% - 200px);
    margin-left: 16px;
    box-sizing: border-box;
    border-radius: 10px;
    max-height: calc(100vh - 210px);
    overflow-y: auto;
    &::-webkit-scrollbar {
      width: 3px;
    }

    &::-webkit-scrollbar-track {
      background: #fafbfc;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #d9d9d9;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
    .config-content {
      .config-section {
        margin-bottom: 16px;
        padding: 24px;
        box-sizing: border-box;
        background: #fff;
        border-radius: 10px;
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          h2 {
            height: 24px;
            line-height: 24px;
            font-size: 16px;
            font-weight: 600;
            color: #101828;
            margin: 0;
          }
          .section-tag {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            color: #4a5565;
            border-radius: 8px;
            background-color: #f9fafb;
            &.tag-purple {
              color: #8743e2;
              background-color: #8743e20f;
            }
          }
          .asr-toggle {
            display: flex;
            align-items: center;
            gap: 8px;
            span {
              font-size: 12px;
              color: #4a5565;
            }
          }
          .test-btn {
            height: 32px;
            line-height: 32px;
          }
        }
        .section-desc {
          font-size: 14px;
          color: #6a7282;
          height: 20px;
          line-height: 20px;
          margin-bottom: 16px;
          margin-top: 0;
        }
        .model-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          .model-item {
            padding: 16px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            .model-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
              h3 {
                height: 20px;
                font-size: 14px;
                font-weight: 600;
                color: #101828;
                margin: 0;
              }
              .model-recommend {
                padding: 2px 8px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 500;
                color: #00c950;
                background-color: #00c9500a;
                &.recommend-low-latency {
                  color: #0069a8;
                  background-color: #0069a80a;
                }
              }
            }
            .model-desc {
              line-height: 20px;
              font-size: 12px;
              color: #6a7282;
              margin: 0 0 12px 0;
            }
          }
        }
        .model-grid2 {
          grid-template-columns: 1fr;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          .form-item {
            &.full-width {
              grid-column: span 2;
            }
          }
        }
        .form-item {
          margin-bottom: 16px;
          label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-bottom: 8px;
          }
          .el-input {
            width: 100%;
          }
        }
        .config-note {
          padding: 16px;
          border: 1px solid #ede9fe;
          border-radius: 4px;
          background-color: #8743e20f;
          p {
            font-size: 14px;
            line-height: 20px;
            color: #5d0ec0;
            margin: 0;
          }
        }
        .status-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-top: 24px;
          .status-item {
            padding: 16px;
            border: 1px solid #f3f4f6;
            border-radius: 10px;
            background-color: #f9fafb;
            h3 {
              font-size: 14px;
              height: 20px;
              line-height: 20px;
              font-weight: 500;
              color: #6a7282;
              margin-bottom: 8px;
              margin-top: 0;
            }
            .status-indicator {
              display: flex;
              align-items: center;
              border-radius: 4px;
              height: 20px;
              line-height: 20px;
              font-size: 14px;
              &.success {
                color: #00c950;
                .dot {
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  margin-right: 4px;
                  background-color: #00c950;
                }
              }
              &.ready {
                color: #fe9a00;
                .dot {
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  margin-right: 4px;
                  border: 2px solid #fe9a00;
                }
              }
              &.pending {
                color: #fe9a00;
                .dot {
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  margin-right: 4px;
                  border: 2px solid #fe9a00;
                  animation: pulse 1.5s infinite;
                }
              }
              &.failed {
                color: #ff6467;
                .dot {
                  font-size: 14px;
                  margin-right: 4px;
                }
              }
            }
          }
        }
      }
      .config-section:nth-last-of-type(1) {
        margin-bottom: 0;
      }
    }
  }
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
}
.dialog-content {
  font-size: 14px;
  line-height: 20px;
  color: #101828;
  padding-bottom: 20px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
