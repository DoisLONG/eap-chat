<template>
  <div class="card table-search">
    <h2 class="search-title">练习筛选</h2>

    <div class="category-tabs" aria-label="一级分类">
      <button
        v-for="category in primaryCategories"
        :key="category.id ?? 'all'"
        type="button"
        class="category-button"
        :class="{ active: category.id === null ? !activePrimaryCategory : activePrimaryCategory?.id === category.id }"
        :aria-pressed="category.id === null ? !activePrimaryCategory : activePrimaryCategory?.id === category.id"
        @click="selectPrimaryCategory(category)"
      >
        {{ category.name }}
      </button>
    </div>

    <div v-if="activePrimaryCategory" class="secondary-tabs">
      <button
        v-for="category in currentSecondaryCategories"
        :key="category.id ?? 'all-secondary'"
        type="button"
        class="secondary-button"
        :class="{ active: category.id === null ? !activeSecondaryCategory : activeSecondaryCategory?.id === category.id }"
        :aria-pressed="category.id === null ? !activeSecondaryCategory : activeSecondaryCategory?.id === category.id"
        @click="selectSecondaryCategory(category)"
      >
        {{ category.name }}
      </button>
    </div>

    <div class="search-row">
      <el-form class="name-form" :model="searchParam" @submit.prevent="search">
        <el-form-item label="名称：">
          <el-input
            v-model="searchParam.name"
            placeholder="请输入名称"
            clearable
            @keyup.enter="search"
          />
        </el-form-item>
      </el-form>
      <div class="operation">
        <el-button type="primary" :icon="Search" @click="search">
          搜索
        </el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="SearchForm">
import { computed, ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { removeEmptyProp } from "@/utils";

const props = defineProps<{
  categories: Array<{ id: number; name: string; children?: Array<{ id: number; name: string }> }>;
}>();
const activePrimaryCategory = ref<{
  id: number;
  name: string;
  children?: Array<{ id: number; name: string }>;
} | null>(null);
const activeSecondaryCategory = ref<{ id: number; name: string } | null>(null);
const searchParam = ref({ name: "" });
const emits = defineEmits(["search"]);
const primaryCategories = computed(() => [
  { id: null, name: "全部" },
  ...props.categories,
]);
const currentSecondaryCategories = computed(
  () =>
    activePrimaryCategory.value
      ? [
          { id: null, name: `全部${activePrimaryCategory.value.name}` },
          ...(activePrimaryCategory.value.children || []),
        ]
      : [],
);

const search = () => {
  const params: Record<string, string | number> = {
    ...removeEmptyProp(searchParam.value),
  };
  if (activePrimaryCategory.value?.id != null) {
    params.primary_category_id = activePrimaryCategory.value.id;
  }
  if (activeSecondaryCategory.value?.id != null) {
    params.category_id = activeSecondaryCategory.value.id;
  }
  emits("search", params);
};

const selectPrimaryCategory = (category: { id: number | null; name: string; children?: Array<{ id: number; name: string }> }) => {
  activePrimaryCategory.value = category.id === null ? null : category;
  activeSecondaryCategory.value = null;
  search();
};

const selectSecondaryCategory = (category: { id: number | null; name: string }) => {
  activeSecondaryCategory.value = category.id === null ? null : category;
  search();
};

const reset = () => {
  activePrimaryCategory.value = null;
  activeSecondaryCategory.value = null;
  searchParam.value.name = "";
  search();
};
</script>

<style scoped>
.table-search {
  margin-bottom: 9px;
  padding: 14px;
}
.search-title {
  margin: 0 0 12px;
  color: #26364a;
  font-size: 15px;
  font-weight: 600;
}
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.category-button {
  height: 36px;
  padding: 0 17px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: #f1f4f8;
  color: #475467;
  cursor: pointer;
}
.category-button:hover {
  background: #eaf3ff;
  color: #1677ff;
}
.category-button.active {
  background: #1677ff;
  color: #fff;
}
.secondary-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f6f8fc;
}
.secondary-button {
  height: 32px;
  padding: 0 14px;
  border: 1px solid #e0e7f0;
  border-radius: 999px;
  background: #fff;
  color: #475467;
  cursor: pointer;
  font-size: 12px;
}
.secondary-button.active {
  border-color: #91bfff;
  background: #eaf3ff;
  color: #1677ff;
}
.search-row,
.name-form,
.operation {
  display: flex;
  align-items: center;
}
.search-row {
  gap: 20px;
  margin-top: 16px;
}
.name-form {
  flex: 1;
  margin: 0;
}
.name-form :deep(.el-form-item) {
  width: 310px;
  margin: 0;
}
.name-form :deep(.el-input) {
  width: 250px;
}
.name-form :deep(.el-form-item__label) {
  color: #344054;
}
.operation {
  flex: none;
  gap: 8px;
  margin-left: auto;
}
@media (max-width: 640px) {
  .search-row {
    flex-wrap: wrap;
  }
  .name-form,
  .name-form :deep(.el-form-item) {
    width: 100%;
  }
  .name-form :deep(.el-input) {
    width: 100%;
  }
  .operation {
    margin-left: 0;
  }
}
</style>
