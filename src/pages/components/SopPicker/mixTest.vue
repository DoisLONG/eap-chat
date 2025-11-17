<template>
  <el-dialog
    v-model="drawerVisible"
    title="混合出题"
    width="350px"
    :close-on-click-modal="false"
    @close="emits('close')"
  >
    <el-form
      ref="ruleFormRef"
      label-width="70px"
      label-suffix=" :"
      :rules="rules"
      :model="operateInfo"
    >
      <el-form-item label="公司" prop="company_id">
        <el-select
          v-model="operateInfo.company_id"
          placeholder="请选择公司"
          clearable
          @change="handleCompanyChange"
        >
          <el-option
            v-for="item in companyList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="部门" prop="department_id">
        <el-select
          v-model="operateInfo.department_id"
          placeholder="请选择部门"
          clearable
          @change="handleDepartmentChange"
        >
          <el-option
            v-for="item in filteredDeptList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="岗位" prop="position_id">
        <el-select
          v-model="operateInfo.position_id"
          placeholder="请选择岗位"
          clearable
        >
          <el-option
            v-for="item in filteredPostList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emits('close')">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="UserDrawer">
import { ref, reactive, onMounted } from "vue";
import { FormInstance } from "element-plus";
import { getCascaderList } from "@/services/sop.api";

const emits = defineEmits(["close", "confirm"]);

const rules = reactive({
  company_id: [{ required: false, message: "请选择公司" }],
  department_id: [{ required: false, message: "请选择部门" }],
  position_id: [{ required: true, message: "请选择岗位" }],
});

const submitLoading = ref(false);
const drawerVisible = ref(true);
const ruleFormRef = ref<FormInstance>();

// 表单数据
const operateInfo = ref<any>({
  company_id: "",
  department_id: "",
  position_id: "",
});

// 原始级联数据
const cascaderData = ref<any[]>([]);

// 所有公司、部门、岗位列表
const companyList = ref<{ id: number | string; name: string }[]>([]);
const deptList = ref<
  { id: number | string; name: string; company_id: number | string }[]
>([]);
const postList = ref<
  { id: number | string; name: string; dept_id: number | string }[]
>([]);

// 筛选后的部门和岗位列表
const filteredDeptList = ref<
  { id: number | string; name: string; company_id: number | string }[]
>([]);
const filteredPostList = ref<
  { id: number | string; name: string; dept_id: number | string }[]
>([]);

/**
 * 将级联数据转换为三个独立数组
 * @param data - 原始级联数据
 */
const convertCascaderToArrays = (data: any[]) => {
  const companies: { id: number | string; name: string }[] = [];
  const departments: {
    id: number | string;
    name: string;
    company_id: number | string;
  }[] = [];
  const positions: {
    id: number | string;
    name: string;
    dept_id: number | string;
  }[] = [];

  data.forEach((company) => {
    // 添加公司
    companies.push({
      id: company.id,
      name: company.name,
    });

    // 处理部门和岗位
    if (company.children && Array.isArray(company.children)) {
      company.children.forEach((dept: any) => {
        // 添加部门
        departments.push({
          id: dept.id,
          name: dept.name,
          company_id: company.id,
        });

        // 处理岗位
        if (dept.children && Array.isArray(dept.children)) {
          dept.children.forEach((post: any) => {
            positions.push({
              id: post.id,
              name: post.name,
              dept_id: dept.id,
            });
          });
        }
      });
    }
  });

  companyList.value = companies;
  deptList.value = departments;
  postList.value = positions;

  // 初始化筛选列表
  filteredDeptList.value = [];
  filteredPostList.value = [];
};

/**
 * 根据公司ID筛选部门和岗位
 * @param companyId - 公司ID
 */
const filterByCompany = (companyId: string | number) => {
  if (!companyId) {
    filteredDeptList.value = [];
    filteredPostList.value = [];
    operateInfo.value.department_id = "";
    operateInfo.value.position_id = "";
    return;
  }

  // 筛选该公司的部门
  filteredDeptList.value = deptList.value.filter(
    (dept) => dept.company_id == companyId
  );

  // 如果当前选中的部门不属于该公司，则清空部门和岗位选择
  if (
    operateInfo.value.department_id &&
    !filteredDeptList.value.some(
      (dept) => dept.id == operateInfo.value.department_id
    )
  ) {
    operateInfo.value.department_id = "";
    operateInfo.value.position_id = "";
    filteredPostList.value = [];
  }
};

/**
 * 根据部门ID筛选岗位
 * @param deptId - 部门ID
 */
const filterByDepartment = (deptId: string | number) => {
  if (!deptId) {
    filteredPostList.value = [];
    operateInfo.value.position_id = "";
    return;
  }

  // 筛选该部门的岗位
  filteredPostList.value = postList.value.filter(
    (post) => post.dept_id == deptId
  );

  // 如果当前选中的岗位不属于该部门，则清空岗位选择
  if (
    operateInfo.value.position_id &&
    !filteredPostList.value.some(
      (post) => post.id == operateInfo.value.position_id
    )
  ) {
    operateInfo.value.position_id = "";
  }
};

/**
 * 公司选择变化处理
 */
const handleCompanyChange = (companyId: string | number) => {
  filterByCompany(companyId);
};

/**
 * 部门选择变化处理
 */
const handleDepartmentChange = (deptId: string | number) => {
  filterByDepartment(deptId);
};

/**
 * 获取级联数据
 */
const fetchCascaderData = async () => {
  try {
    const res = await getCascaderList("test_user");
    cascaderData.value = res.data.results || [];
    convertCascaderToArrays(cascaderData.value);
  } catch (error) {
    console.error("获取级联数据失败:", error);
  }
};

/**
 * 提交数据
 */
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return;

    // 检查是否选择了岗位
    if (!operateInfo.value.position_id) {
      console.warn("请选择岗位");
      return;
    }

    try {
      emits("close");
      emits("confirm", operateInfo.value.position_id);
    } catch (error) {
      console.log(error);
    }
  });
};

onMounted(() => {
  fetchCascaderData();
});
</script>
