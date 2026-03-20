<template>
  <siderLeft :step="2"></siderLeft>
  <div v-if="step === 1" class="guide-right">
    <div class="sidebar">
      <div class="step-img-content">
        <img class="step-img" :src="step21" alt="上传学习资料" />
        <img class="step-dot" :src="step1Dot" alt="上传学习资料" />
      </div>
      <div class="line-container">
        <img class="line" :src="line" alt="上传学习资料" />
      </div>
      <div class="step-text">第一步 侧边栏点击<span>练习管理</span></div>
    </div>
    <el-button type="primary" size="large" @click="nextStep" class="next-btn">
      下一步
    </el-button>
  </div>
  <div v-if="step === 2" class="guide-right">
    <div class="sidebar">
      <div class="step2-img-content">
        <img class="step-img" :src="step22" alt="上传学习资料" />
      </div>
      <img class="step2-dot" :src="step2Dot" alt="上传学习资料" />
      <div class="line2-container">
        <img class="line" :src="line2" alt="上传学习资料" />
      </div>
      <div class="step2-text">第二步 点击<span>导入文档</span></div>
    </div>
    <el-button type="text" v-if="step > 1" @click="prevStep" class="prev-btn">
      上一步
    </el-button>
    <el-button type="primary" size="large" @click="nextStep" class="next-btn">
      下一步
    </el-button>
  </div>
  <div v-if="step === 3" class="guide-right">
    <div class="sidebar">
      <div class="step3-img-content">
        <img class="step-img" :src="step23" alt="上传学习资料" />
        <img class="step-dot" :src="step3Dot" alt="上传学习资料" />
      </div>
      <div class="sidebar-title">💾 上传资料</div>
      <div class="sidebar-desc">
        <div class="desc-item">
          · 上传类型：选择对应的业务分类（如生产、服务）；
        </div>
        <div class="desc-item">
          · 解析模式：四种解析模式即,根据类型和需求完整提取文件内容；
        </div>
        <div class="desc-item">
          · 选择文件：拖拽或点击上传.xlsx/.xls格式文件；
        </div>
        <div class="desc-item">
          · 公司 / 部门 /
          岗位：指定文档适用范围，确保权限可控。填写完成后点「开始导入」，系统自动生成规程。
        </div>
      </div>
    </div>
    <el-button type="text" v-if="step > 1" @click="prevStep" class="prev-btn">
      上一步
    </el-button>
    <el-button type="primary" size="large" @click="nextStep" class="next-btn">
      下一个
    </el-button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import step21 from "@/assets/images/guide/step2-1.png";
import step1Dot from "@/assets/images/guide/step1-dot.png";
import line from "@/assets/images/guide/line.png";
import step22 from "@/assets/images/guide/step2-2.png";
import step2Dot from "@/assets/images/guide/step2-dot.png";
import line2 from "@/assets/images/guide/line2.png";
import step23 from "@/assets/images/guide/step2-3.png";
import step3Dot from "@/assets/images/guide/step3-dot.png";
import siderLeft from "./siderLeft.vue";

const emit = defineEmits(["nextStep"]);
const step = ref(1);
const nextStep = () => {
  if (step.value < 3) {
    step.value++;
  } else {
    emit("nextStep");
  }
};
const prevStep = () => {
  if (step.value > 1) {
    step.value--;
  }
};
</script>

<style scoped lang="scss">
.guide-right {
  flex: 1;
  position: relative;
  background: #fafbfc;
  border-radius: 8px 0 0 8px;
  transition: all 0.3s ease-in-out;
  .sidebar {
    position: relative;
    .step-img-content {
      width: 213px;
      height: 364px;
      margin-top: 88px;
      margin-left: 40px;
      overflow: hidden;
      position: relative;
      img {
        width: 100%;
        height: 100%;
        border-radius: 8px;
        object-fit: contain;
      }
      .step-dot {
        position: absolute;
        bottom: 100px;
        left: 96px;
        width: 40px;
        height: 40px;
      }
    }
    .line-container {
      position: absolute;
      bottom: 115px;
      left: 227px;
      width: 122px;
      height: 61px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .step-text {
      position: absolute;
      bottom: 176px;
      left: 260px;
      font-size: 18px;
      color: #01021d;
      font-weight: 400;
      height: 40px;
      line-height: 40px;
      border: 2px solid #1677ff;
      border-radius: 20px;
      padding: 0 12px;
      box-sizing: border-box;
      span {
        font-weight: 600;
      }
    }
    // 第二步
    .step2-img-content {
      width: 598px;
      height: 196px;
      margin-top: 172px;
      margin-left: 24px;
      overflow: hidden;
      position: relative;
      img {
        width: 100%;
        height: 100%;
        border-radius: 8px;
        object-fit: contain;
      }
    }
    .step2-dot {
      position: absolute;
      top: -30px;
      left: 35px;
      width: 40px;
      height: 40px;
    }
    .line2-container {
      position: absolute;
      top: -60px;
      left: 69px;
      width: 153px;
      height: 69px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .step2-text {
      position: absolute;
      top: -99px;
      left: 121px;
      font-size: 18px;
      color: #01021d;
      font-weight: 400;
      height: 40px;
      line-height: 40px;
      border: 2px solid #1677ff;
      border-radius: 20px;
      padding: 0 12px;
      box-sizing: border-box;
      span {
        font-weight: 600;
      }
    }
    // 第三步
    .step3-img-content {
      width: 598px;
      height: 214px;
      margin-left: 24px;
      margin-top: 24px;
      overflow: hidden;
      position: relative;
      img {
        width: 100%;
        height: 100%;
        border-radius: 8px;
        object-fit: contain;
      }
      .step-dot {
        position: absolute;
        bottom: 98px;
        left: 108px;
        width: 40px;
        height: 40px;
      }
    }
    .sidebar-title {
      height: 31px;
      line-height: 31px;
      font-size: 22px;
      color: #01021d;
      font-weight: 600;
      margin-top: 29px;
      padding-left: 24px;
    }
    .sidebar-desc {
      width: 603px;
      box-sizing: border-box;
      padding-left: 32px;
      margin-top: 12px;
      .desc-item {
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        color: #4d4d60;
        margin-bottom: 4px;
      }
    }
  }
  .next-btn {
    position: absolute;
    bottom: 24px;
    right: 32px;
    width: 120px;
    height: 48px;
    border-radius: 12px;
    line-height: 48px;
  }
  .prev-btn {
    position: absolute;
    bottom: 24px;
    left: 24px;
    width: 120px;
    height: 48px;
    line-height: 48px;
    border-radius: 12px;
    color: #989fb0;
  }
  .prev-btn:hover {
    background-color: #f0f2f5;
    color: #1677ff;
  }
}
</style>
