<template>
  <div class="card table-search">
    <div class="search-head">
      <h2>练习筛选</h2>
      <span>按名称和组织范围查询已生成的练习</span>
    </div>
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
          <el-form-item
            v-if="item.search.el === 'input'"
            :label-width="language === 'zh' ? '80px' : '160px'"
          >
            <template #label>
              <el-space :size="4">
                <span>{{ item.label }}</span>
              </el-space>
              <span>&nbsp;:</span>
            </template>
            <el-input
              v-model="searchParam[item.prop]"
              :placeholder="item.placeholder"
              clearable
              @keyup.enter="search"
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
import {
  Delete,
  Search,
  ArrowDown,
  ArrowUp,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import Grid from "@/components/Grid/index.vue";
import GridItem from "@/components/Grid/components/GridItem.vue";
import { storeToRefs } from "pinia";
import {
  getCompanyList,
  getPostList,
  getDeptList,
} from "@/services/company.service";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/stores/modules/user";
import { useGlobalStore } from "@/stores/modules/global";

const globalStore = useGlobalStore();
const language = computed(() => globalStore.language);

const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);

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
const queryCompany = async () => {
  const params: any = {};
  try {
    const res = await getCompanyList(params);
    const data = res.data.results || [];
    companyList.value = data.map((item: any) => ({
      label: item.company_name,
      value: item.company_id,
    }));
  } catch (error) {
    ElMessage.error("公司筛选数据加载失败");
  }
};
queryCompany();
const queryDept = async () => {
  const params: any = {};
  if (searchParam.value.company_id) {
    params.company_id = searchParam.value.company_id;
  }
  try {
    const res = await getDeptList(params);
    const data = res.data.results || [];
    deptList.value = data.map((item: any) => ({
      label: item.department_name,
      value: item.department_id,
    }));
  } catch (error) {
    ElMessage.error("部门筛选数据加载失败");
  }
};
queryDept();

const queryPost = async () => {
  const params: any = {};
  if (searchParam.value.company_id) {
    params.company_id = searchParam.value.company_id;
  }
  if (searchParam.value.department_id) {
    params.department_id = searchParam.value.department_id;
  }
  try {
    const res = await getPostList(params);
    const data = res.data.results || [];
    postList.value = data.map((item: any) => ({
      label: item.position_name,
      value: Number(item.position_id) || item.position_id,
    }));
  } catch (error) {
    ElMessage.error("岗位筛选数据加载失败");
  }
};
queryPost();

const columns = computed(() => {
  let searchOption = [
    {
      prop: "keyword",
      label: t("licenseAdmin.keyword"),
      placeholder: t("licenseAdmin.keywordPlaceholder"),
      search: {
        el: "input",
      },
    },
  ];
  if (userInfo.value?.name === "superadmin") {
    searchOption = [
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
  }
  return searchOption;
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
<style scoped>
.search-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 14px;
}
.search-head h2 {
  margin: 0;
  color: #26364a;
  font-size: 16px;
}
.search-head span {
  color: #8b98a9;
  font-size: 12px;
}
.operation {
  display: flex;
  gap: 8px;
}
</style>
