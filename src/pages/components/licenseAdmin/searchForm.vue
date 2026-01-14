<template>
  <div class="card table-search">
    <el-form ref="formRef" :model="searchParam">
      <Grid
        ref="gridRef"
        :collapsed="collapsed"
        :gap="[20, 0]"
        :cols="searchCol"
      >
        <GridItem
          v-for="(item, index) in columns"
          :key="item.prop"
          v-bind="getResponsive()"
          :index="index"
        >
          <el-form-item v-if="item.search.el === 'input'" label-width="80px">
            <template #label>
              <el-space :size="4">
                <span>{{ item.label }}</span>
              </el-space>
              <span>&nbsp;:</span>
            </template>
            <el-input
              v-model="searchParam[item.prop]"
              :placeholder="item.placeholder"
            />
          </el-form-item>
          <el-form-item v-if="item.search.el === 'select'" label-width="80px">
            <template #label>
              <el-space :size="4">
                <span>{{ item.label }}</span>
              </el-space>
              <span>&nbsp;:</span>
            </template>
            <el-select
              v-model="searchParam[item.prop]"
              :placeholder="item.placeholder"
              @change="item.change && item.change()"
            >
              <el-option
                v-for="oitem in item.enum || []"
                :key="oitem.value"
                :label="oitem.label"
                :value="oitem.value"
              />
            </el-select>
          </el-form-item>
        </GridItem>
        <GridItem suffix>
          <div class="operation">
            <el-button type="primary" :icon="Search" @click="search">
              {{ $t("common.search") }}
            </el-button>
            <el-button :icon="Delete" @click="reset">
              {{ $t("common.reset") }}
            </el-button>
            <el-button
              v-if="showCollapse"
              type="primary"
              link
              class="search-isOpen"
              @click="collapsed = !collapsed"
            >
              {{ collapsed ? $t("common.expand") : $t("common.collapse") }}
              <el-icon class="el-icon--right">
                <component :is="collapsed ? ArrowDown : ArrowUp"></component>
              </el-icon>
            </el-button>
          </div>
        </GridItem>
      </Grid>
    </el-form>
  </div>
</template>

<script setup lang="ts" name="SearchForm">
import { computed, ref } from "vue";
import { removeEmptyProp } from "@/utils";
import { BreakPoint } from "@/components/Grid/interface";
import { Delete, Search, ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import Grid from "@/components/Grid/index.vue";
import GridItem from "@/components/Grid/components/GridItem.vue";
import {
  getCompanyList,
  getPostList,
  getDeptList,
} from "@/services/company.service";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const searchCol = { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 };

const companyList = ref<{ label: string; value: string }[]>([]);
const deptList = ref<{ label: string; value: string }[]>([]);
const postList = ref<{ label: string; value: string }[]>([]);
const searchParam = ref({
  keyword: "",
  company_id: "",
  department_id: "",
  position_id: "",
});
const queryCompany = () => {
  const params: any = {};
  getCompanyList(params).then((res) => {
    const data = res.data.results || [];
    companyList.value = data.map((item: any) => ({
      label: item.company_name,
      value: item.company_id,
    }));
  });
};
queryCompany();
const queryDept = () => {
  const params: any = {};
  if (searchParam.value.company_id) {
    params.company_id = searchParam.value.company_id;
  }
  getDeptList(params).then((res) => {
    const data = res.data.results || [];
    deptList.value = data.map((item: any) => ({
      label: item.department_name,
      value: item.department_id,
    }));
  });
};
queryDept();

const queryPost = () => {
  const params: any = {};
  if (searchParam.value.company_id) {
    params.company_id = searchParam.value.company_id;
  }
  if (searchParam.value.position_id) {
    params.department_id = searchParam.value.position_id;
  }
  getPostList(params).then((res) => {
    const data = res.data.results || [];
    postList.value = data.map((item: any) => ({
      label: item.position_name,
      value: Number(item.position_id) || item.position_id,
    }));
  });
};
queryPost();

const columns = computed(() => {
  return [
    {
      prop: "keyword",
      label: t("licenseAdmin.keyword"),
      placeholder: t("licenseAdmin.keywordPlaceholder"),
      search: {
        el: "input",
      },
    },
    {
      prop: "company_id",
      label: t("licenseAdmin.company"),
      placeholder: t("licenseAdmin.companyPlaceholder"),
      enum: companyList.value,
      change: () => {
        queryDept();
        postList.value = [];
        searchParam.value.department_id = "";
        searchParam.value.position_id = "";
      },
      search: {
        el: "select",
      },
    },
    {
      prop: "department_id",
      label: t("licenseAdmin.deptment"),
      placeholder: t("licenseAdmin.deptmentPlaceholder"),
      enum: deptList.value,
      change: () => {
        queryPost();
        searchParam.value.position_id = "";
      },
      search: {
        el: "select",
      },
    },
    {
      prop: "position_id",
      label: t("licenseAdmin.position"),
      placeholder: t("licenseAdmin.positionPlaceholder"),
      enum: postList.value,
      search: {
        el: "select",
      },
    },
  ];
});

// 获取响应式设置
const getResponsive = () => {
  return {
    span: undefined,
    offset: 0,
    xs: undefined,
    sm: undefined,
    md: undefined,
    lg: undefined,
    xl: undefined,
  };
};

// 是否默认折叠搜索项
const collapsed = ref(true);
const emits = defineEmits(["search"]);
const search = () => {
  emits("search", removeEmptyProp(searchParam.value));
};

const reset = () => {
  console.log("reset");
  searchParam.value = {
    keyword: "",
    company_id: "",
    department_id: "",
    position_id: "",
  };
  emits("search", {});
};

// 获取响应式断点
const gridRef = ref();
const breakPoint = computed<BreakPoint>(() => gridRef.value?.breakPoint);

// 判断是否显示 展开/合并 按钮
const showCollapse = computed(() => {
  let show = false;
  columns.value.reduce((prev, current) => {
    prev +=
      (current.search![breakPoint.value]?.span ?? current.search?.span ?? 1) +
      (current.search![breakPoint.value]?.offset ??
        current.search?.offset ??
        0);
    if (typeof searchCol !== "number") {
      if (prev >= searchCol[breakPoint.value]) show = true;
    } else {
      if (prev >= searchCol) show = true;
    }
    return prev;
  }, 0);
  return show;
});
</script>
