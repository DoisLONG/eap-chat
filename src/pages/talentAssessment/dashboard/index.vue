<template>
  <div class="talent-page">
    <div class="page-title-row">
      <div>
        <div class="breadcrumb">陪练管理端 / 人才评估</div>
        <h2>首页</h2>
        <p>查看人才评估模块的基础数据和待处理简历。</p>
      </div>
      <el-button type="primary" @click="goResume">上传简历</el-button>
    </div>

    <el-row :gutter="16" class="summary-row">
      <el-col :span="6" v-for="item in summaryCards" :key="item.label">
        <div class="summary-card">
          <div class="summary-label">{{ item.label }}</div>
          <div class="summary-value">{{ item.value }}</div>
          <div class="summary-tip">{{ item.tip }}</div>
        </div>
      </el-col>
    </el-row>

    <div class="content-card">
      <div class="card-header">
        <div>
          <h3>第一阶段流程</h3>
          <p>岗位由管理员维护，简历上传后由后端自动解析、匹配岗位并生成面试题。</p>
        </div>
      </div>
      <div class="flow-list">
        <div class="flow-item">
          <div class="flow-dot">1</div>
          <div>
            <strong>维护岗位</strong>
            <span>管理员手动填写岗位职责、任职要求、评分维度。</span>
          </div>
        </div>
        <div class="flow-line" />
        <div class="flow-item">
          <div class="flow-dot">2</div>
          <div>
            <strong>上传简历</strong>
            <span>上传弹窗只保留文件，候选人姓名、适配岗位等由 AI 提取。</span>
          </div>
        </div>
        <div class="flow-line" />
        <div class="flow-item">
          <div class="flow-dot">3</div>
          <div>
            <strong>开始面试</strong>
            <span>一页展示面试题，管理员自由挑选询问，并手动维护最终结果。</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getTalentDashboardSummary } from "@/services/talent.service";

const router = useRouter();
const summary = ref({
  positionCount: 0,
  candidateCount: 0,
  pendingInterviewCount: 0,
  processedResumeCount: 0,
});

const summaryCards = computed(() => [
  { label: "岗位数量", value: summary.value.positionCount, tip: "招聘岗位" },
  { label: "候选人", value: summary.value.candidateCount, tip: "已上传简历" },
  { label: "待面试", value: summary.value.pendingInterviewCount, tip: "默认结果" },
  { label: "已处理简历", value: summary.value.processedResumeCount, tip: "解析完成" },
]);

const getSummary = async () => {
  try {
    const res = await getTalentDashboardSummary();
    if (res.data?.is_success) {
      summary.value = res.data.data || summary.value;
    }
  } catch (error) {
    ElMessage.error("首页统计加载失败");
  }
};

const goResume = () => router.push("/talent/resume");

onMounted(getSummary);
</script>

<style scoped>
.talent-page { padding: 24px; }
.page-title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.breadcrumb { font-size: 13px; color: #6b7280; margin-bottom: 8px; }
h2 { margin: 0 0 8px; font-size: 28px; color: #111827; }
p { margin: 0; color: #6b7280; }
.summary-row { margin-bottom: 18px; }
.summary-card { background: #fff; border: 1px solid #edf0f5; border-radius: 14px; padding: 18px; box-shadow: 0 10px 26px rgba(15,23,42,.04); }
.summary-label { color: #6b7280; font-size: 14px; }
.summary-value { font-size: 30px; font-weight: 800; color: #2563eb; margin: 8px 0; }
.summary-tip { color: #9ca3af; font-size: 13px; }
.content-card { background: #fff; border: 1px solid #edf0f5; border-radius: 14px; padding: 20px; }
.card-header h3 { margin: 0 0 6px; font-size: 18px; }
.flow-list { margin-top: 22px; display: flex; align-items: stretch; }
.flow-item { flex: 1; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; display: flex; gap: 12px; }
.flow-dot { width: 32px; height: 32px; border-radius: 50%; background: #2563eb; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.flow-item strong { display: block; margin-bottom: 6px; color: #111827; }
.flow-item span { color: #6b7280; font-size: 13px; }
.flow-line { width: 24px; }
</style>
