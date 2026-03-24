<template>
  <div class="model-setting-container" @click="handleClickOutside">
    <!-- 主内容区域 -->
    <router-view v-slot="{ Component }">
      <template v-if="!Component">
        <div class="header">
          <div class="header-content">
            <div class="title">{{ t("modelSetting.index.title") }}</div>
            <div class="desc">
              {{ t("modelSetting.index.description") }}
            </div>
          </div>
          <el-button
            type="primary"
            class="add-btn"
            :style="{
              width: language === 'zh' ? '108px' : '140px',
            }"
            @click="handleAddConfig"
            >{{ t("modelSetting.index.addConfig") }}</el-button
          >
        </div>
        <div class="config-grid" v-if="configItems.length">
          <div v-for="item in configItems" :key="item.id" class="config-card">
            <div class="config-header">
              <div class="config-type">
                <div :class="['tag', item.type]">{{ item.typeText }}</div>
                <div class="tag-title">
                  <div class="title">{{ item.title }}</div>
                  <div class="subtitle">{{ item.subtitle }}</div>
                </div>
              </div>
              <div
                class="dropdown-container"
                :ref="(el) => (item.dropdownContainer = el)"
              >
                <div
                  class="el-dropdown-link"
                  @click.stop="toggleDropdown(item)"
                >
                  <img src="@/assets/images/more-icon.png" alt="" />
                </div>
                <div
                  class="dropdown-menu"
                  :style="{
                    width: language === 'zh' ? '120px' : '170px',
                  }"
                  v-if="item.isDropdownVisible"
                >
                  <div
                    class="menu-item"
                    @click.stop="handleMenuClick(item, 'edit')"
                  >
                    <img src="@/assets/images/edit.png" alt="" />
                    {{ t("modelSetting.index.editConfig") }}
                  </div>
                  <!-- <div
                    class="menu-item"
                    @click.stop="handleMenuClick(item, 'copy')"
                  >
                    <img src="@/assets/images/copy.png" alt="" />
                    {{ t("modelSetting.index.copyConfig") }}
                  </div>
                  <div
                    class="menu-item"
                    @click.stop="handleMenuClick(item, 'delete')"
                  >
                    <img src="@/assets/images/delete.png" alt="" />
                    {{ t("modelSetting.index.deleteConfig") }}
                  </div> -->
                </div>
              </div>
            </div>
            <div class="config-description">
              {{ item.description }}
            </div>
            <div class="config-tags">
              <div class="tag" v-for="(tag, index) in item.tags" :key="index">
                <div :class="['dot', tag.status]"></div>
                <div>{{ tag.name }}</div>
              </div>
            </div>
            <div class="config-status">
              <div :class="['status', item.status]">
                <img
                  :src="
                    item.status === 'success'
                      ? successIcon
                      : item.status === 'pending'
                        ? pendingIcon
                        : errorIcon
                  "
                  alt=""
                />
                {{ item.statusText }}
              </div>
              <span class="update-time"
                >{{ t("modelSetting.index.updateTime") }}
                <span>{{ item.updateTime }}</span></span
              >
            </div>
          </div>
        </div>
        <div v-else class="no-data-container">
          <div class="no-data-icon">
            <img
              src="@/assets/images/nodata.png"
              class="no-data-icon"
              alt="no-data"
            />
          </div>
          <div class="no-data-text">{{ t("modelSetting.index.noConfig") }}</div>
        </div>
      </template>
      <template v-else>
        <component :is="Component" />
      </template>
    </router-view>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import successIcon from "@/assets/images/success.png";
import pendingIcon from "@/assets/images/pedding.png";
import errorIcon from "@/assets/images/error.png";
import { useRouter } from "vue-router";
import { getModelConfigList } from "@/services/company.service";
import { formatDate } from "@/utils/dateFormat";
import { useGlobalStore } from "@/stores/modules/global";

const globalStore = useGlobalStore();
const language = computed(() => globalStore.language);

const { t } = useI18n();

const router = useRouter();
// 配置项数据
const configItems = ref([
  // {
  //   id: 5,
  //   type: "llm",
  //   typeText: "LLM",
  //   title: "默认模型配置",
  //   subtitle: "大模型配置",
  //   description:
  //     "用于替换和管理数据预处理模型、陪练交互模型。包含数据预处理模型和陪练交互模型的完整配置。",
  //   tags: [
  //     { name: "数据预处理", status: "success" },
  //     { name: "陪练交互", status: "error" },
  //   ],
  //   status: "success",
  //   statusText: "运行正常",
  //   updateTime: "2026-01-18",
  //   isDropdownVisible: false,
  //   dropdownContainer: null,
  //   isActive: true,
  // },
]);

const configLabel = computed(() => {
  return {
    dataprep_llm: {
      type: "llm",
      typeText: "LLM",
      title: t("modelSetting.index.defaultModelConfig"),
      subtitle: t("modelSetting.index.llmConfig"),
      tags: [
        { name: t("modelSetting.index.dataPreprocessing"), status: "success" },
      ],
      description: t("modelSetting.index.llmDescription"),
    },
    smart_practice_llm: {
      type: "llm",
      typeText: "LLM",
      title: t("modelSetting.index.defaultModelConfig"),
      subtitle: t("modelSetting.index.llmConfig"),
      tags: [
        {
          name: t("modelSetting.index.practiceInteraction"),
          status: "success",
        },
      ],
      description: t("modelSetting.index.llmDescription"),
    },
    embedding: {
      type: "embedding",
      typeText: "Emb",
      title: t("modelSetting.index.embeddingVectorConfig"),
      subtitle: t("modelSetting.index.embeddingConfig"),
      tags: [{ name: "Embedding", status: "success" }],
      description: t("modelSetting.index.embeddingDescription"),
    },
    asr: {
      type: "asr",
      typeText: "ASR",
      title: t("modelSetting.index.asrSpeechRecognitionConfig"),
      subtitle: t("modelSetting.index.asrConfig"),
      tags: [{ name: "ASR", status: "success" }],
      description: t("modelSetting.index.asrDescription"),
    },
  };
});
const getConfigList = async () => {
  const res = await getModelConfigList();
  if (res.data.status === 200) {
    const data = res.data.results || [];
    configItems.value = data.map((item) => ({
      ...item,
      ...configLabel.value[item.scope],
      updateTime: item.updated_at ? formatDate(item.updated_at) : "-",
      status: item.last_test_status,
      statusText:
        item.last_test_status === "success"
          ? t("modelSetting.index.status.success")
          : t("modelSetting.index.status.error"),
      isDropdownVisible: false,
      dropdownContainer: null,
    }));
  }
};
getConfigList();
// 新增配置
const handleAddConfig = () => {
  localStorage.removeItem("editConfig");
  const itemsScope = configItems.value.map((item) => item.scope);
  localStorage.setItem("existsConfig", JSON.stringify(itemsScope));
  router.push("/system/modelSetting/operate");
};
const toggleDropdown = (item) => {
  // 先关闭所有下拉菜单
  configItems.value.forEach((config) => {
    config.isDropdownVisible = false;
  });
  // 再打开当前点击的下拉菜单
  item.isDropdownVisible = true;
};

const handleMenuClick = (item, command) => {
  // 处理下拉菜单命令
  console.log("Menu command:", command, "for config:", item.id);
  if (command === "edit") {
    // 编辑配置逻辑
    localStorage.setItem("editConfig", JSON.stringify(item));
    router.push(`/system/modelSetting/operate?id=${item.id}`);
  }
  item.isDropdownVisible = false;
};

const handleClickOutside = (event) => {
  configItems.value.forEach((item) => {
    if (
      item.dropdownContainer &&
      !item.dropdownContainer.contains(event.target)
    ) {
      item.isDropdownVisible = false;
    }
  });
};

// 监听点击事件
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// 监听语言变化，重新获取配置列表以更新文案
watch(language, () => {
  getConfigList();
});
</script>

<style scoped lang="scss">
.model-setting-container {
  .no-data-container {
    height: calc(100vh - 194px);
    flex-direction: column;
    display: flex;
    align-items: center;
    justify-content: center;
    .no-data-icon {
      width: 180px;
      height: 180px;
    }
    .no-data-text {
      height: 24px;
      line-height: 24px;
      font-size: 16px;
      font-weight: 500;
      color: #01021d;
      margin-top: 12px;
    }
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
  .add-btn {
    height: 36px;
    line-height: 36px;
    width: 108px;
    border-radius: 4px;
  }
}

.config-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: 16px;
}
.config-grid :deep(.el-card__body) {
  padding: 0;
}

.config-card {
  border-radius: 8px;
  padding: 24px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  background-color: #fff;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  &.active {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  height: 40px;

  .config-type {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .tag {
      width: 40px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 600;
      margin-right: 8px;

      &.llm {
        color: #1677ff;
        background-color: #1677ff14;
      }

      &.embedding {
        color: #8743e2;
        background-color: #8743e214;
      }

      &.asr {
        color: #da612b;
        background-color: #da612b14;
      }
    }

    .tag-title {
      .title {
        height: 24px;
        line-height: 24px;
        font-size: 16px;
        font-weight: 600;
        color: #01021d;
      }
      .subtitle {
        margin-top: 4px;
        height: 12px;
        line-height: 12px;
        font-size: 12px;
        color: #6a7282;
      }
    }
  }
}
.dropdown-container {
  position: relative;
  .el-dropdown-link {
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    img {
      width: 28px;
      height: 28px;
    }
  }
  .el-dropdown-link:hover {
    background-color: #f9fafb;
  }
  .dropdown-menu {
    width: 120px;
    height: 52px;
    // height: 124px;
    position: absolute;
    padding-top: 8px;
    box-sizing: border-box;
    top: 42px;
    right: 0;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    .menu-item {
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #1d2129;
      img {
        width: 16px;
        height: 16px;
        margin-right: 8px;
      }
      &:hover {
        background-color: #f9fafb;
      }
    }
    .menu-item.active {
      background-color: #f9fafb;
    }
  }
}

.config-description {
  font-size: 14px;
  color: #6a7282;
  line-height: 24px;
  margin: 24px 0 16px 0;
}

.config-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  .tag {
    padding: 0 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    height: 24px;
    line-height: 24px;
    font-size: 12px;
    color: #6a7282;
    background-color: #f9fafb;
    font-weight: 400;
    .dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      margin-right: 4px;
    }
    .dot.success {
      background-color: #00c950;
    }
    .dot.failed,
    .dot.error {
      background-color: #ff6467;
    }
  }
}

.config-status {
  border-top: 1px solid #f3f3f3;
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .status {
    display: flex;
    align-items: center;
    height: 24px;
    padding: 0 12px;
    border-radius: 8px;
    font-size: 12px;
    img {
      width: 12px;
      height: 12px;
      margin-right: 4px;
    }
  }
  .status.success {
    color: #00a63e;
    background-color: #00c9500f;
    border: 1px solid #00c95033;
  }
  .status.pending {
    color: #973c00;
    background-color: #973c000f;
    border: 1px solid #973c0033;
  }
  .status.failed,
  .status.error {
    color: #ff6467;
    background-color: #ff64670f;
    border: 1px solid #ff646733;
  }
  .update-time {
    font-size: 12px;
    color: #6a7282;
    font-weight: 400;
    span {
      font-weight: 500;
      margin-left: 2px;
    }
  }
}
</style>
