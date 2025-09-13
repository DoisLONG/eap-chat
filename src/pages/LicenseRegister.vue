<template>
  <div class="register-bg">
    <div class="register-box">
      <div class="register-header">
        <img class="logo" src="/logo2.png" alt="logo" />
        <span class="title">申请 License 注册</span>
      </div>
      <el-form
        :model="form"
        :rules="rules"
        ref="registerForm"
        label-width="110px"
        size="large"
        class="register-form"
      >
        <el-divider>申请人信息</el-divider>
        <el-form-item label="申请人姓名" prop="username">
          <el-input v-model="form.username" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="公司名称" prop="company">
          <el-input v-model="form.company" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="电话号码" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="申请人邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="集群码" prop="cluster_code">
          <el-input v-model="form.cluster_code" placeholder="请输入集群码" />
        </el-form-item>

        <el-divider>许可证信息</el-divider>
        <el-form-item label="选择的产品" prop="product">
          <el-select v-model="form.product" placeholder="请选择">
            <el-option label="BAP" value="BAP"/>
            <el-option label="BEC" value="BEC"/>
            <el-option label="BSA" value="BSA"/>
            <el-option label="BCP" value="BCP"/>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="note">
          <el-input v-model="form.note" type="textarea" :rows="2" placeholder="备注（可选）" />
        </el-form-item>
        <el-form-item label="到期时间" prop="expire_at">
          <el-date-picker v-model="form.expire_at" type="date" style="width: 100%;" value-format="YYYY-MM-DD" placeholder="请选择到期日期" @change="onDateChange"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%;" @click="onSubmit" :loading="loading">
            提 交
          </el-button>
        </el-form-item>
      </el-form>
      <div class="footer">
        © {{year}} 管理系统
      </div>
    </div>
    <el-dialog v-model="showSuccess" title="注册成功" width="340px" :show-close="false">
      <div>您的License申请已提交，请等待管理员审核。</div>
      <template #footer>
        <el-button type="primary" @click="goHome">知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { createLicense } from '@/services/license.service'
import { ElMessage } from 'element-plus'

function onDateChange(val) {
  console.log('[日期选择] 当前 expire_at:', val)
}

const router = useRouter()
const year = new Date().getFullYear()
const registerForm = ref()
const loading = ref(false)
const showSuccess = ref(false)

const form = reactive({
  username: '',
  company: '',
  phone: '',
  email: '',
  cluster_code: '',
  product: '',
  note: '',
  expire_at: ''
})

const rules = {
  username: [{ required: true, message: '请输入申请人姓名', trigger: 'blur' }],
  company: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  cluster_code: [{ required: true, message: '请输入集群码', trigger: 'blur' }],
  product: [{ required: true, message: '请选择产品', trigger: 'change' }],
  expire_at: [{ required: true, message: '请选择到期时间', trigger: 'change' }]
}

const onSubmit = () => {
  registerForm.value.validate(async (valid) => {
    if (!valid) return
    console.log('[提交前] form:', { ...form })
    loading.value = true

    // 构造提交参数
    const postData = {
      issuedTime: new Date().toISOString().slice(0, 19).replace('T', ' '), 
      expiryTime: form.expire_at + ' 23:59:59',  // 选中日期+固定时间
      subject: '15345',
      description: form.note,
      kind: 'base64',
      username: form.username,
      email: form.email,
      phone: form.phone,
      company: form.company,
      productName: form.product,
      clusterCode: form.cluster_code
    }
    console.log('[提交参数 postData]:', postData)
    try {
      const { data } = await createLicense(postData)
      // 提交成功
      loading.value = false
      showSuccess.value = true
      // 后续处理
    } catch (e) {
      loading.value = false
      ElMessage.error('注册失败：' + (e.response?.data?.message || e.message))
    }
  })
}
function resetForm() {
  form.username = ''
  form.company = ''
  form.phone = ''
  form.email = ''
  form.cluster_code = ''
  form.product = ''
  form.note = ''
  form.expire_at = ''
}

const goHome = () => {
  showSuccess.value = false
  resetForm()   // 清空表单
  router.push('/license/register')
}
</script>

<style scoped>
.register-bg {
  min-height: 100vh;
  background: linear-gradient(120deg, #f4f8fb 0%, #dde7f7 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.register-box {
  width: 820px;
  padding: 46px 52px 26px 52px;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 4px 32px 0 #dde6f1, 0 1.5px 7px 0 #e3eaf6;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.2s;
}

.register-box:hover {
  box-shadow: 0 6px 36px 0 #c9d6ec, 0 2.5px 11px 0 #dae3f5;
}

.register-header {
  display: flex;
  align-items: center;
  margin-bottom: 28px;
  width: 100%;
  justify-content: center;
}

.logo {
  height: 38px;
  margin-right: 12px;
  border-radius: 6px;
  background: #f5f8fa;
}

.title {
  font-size: 25px;
  color: #1b388f;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-shadow: 0 1px 0 #cdd7ee;
}

.register-form {
  width: 100%;
  margin-top: 6px;
}

.el-form-item {
  margin-bottom: 18px !important;
}

.el-divider {
  margin: 18px 0 12px 0 !important;
  color: #5a7cd7;
  font-weight: bold;
  font-size: 15px;
}

.el-input__inner, .el-textarea__inner {
  border-radius: 9px !important;
  font-size: 15px;
  padding: 8px 13px;
}

.el-input__inner:focus, .el-textarea__inner:focus {
  border-color: #3573e2;
  box-shadow: 0 0 0 2px #c6dbfb6c;
}

.el-select .el-input__inner {
  cursor: pointer;
}

.el-date-editor {
  width: 100%;
}

.el-form-item__label {
  color: #2f3b56;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.el-form-item.is-error .el-input__inner,
.el-form-item.is-error .el-textarea__inner {
  border-color: #ff4d4f;
  background: #fff6f6;
}

.el-button[type="primary"] {
  background: linear-gradient(93deg,#3573e2 30%,#5990ee 100%);
  border-radius: 9px;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 2px 12px #e0e6ee9f;
  height: 44px;
  transition: background 0.2s;
}

.el-button[type="primary"]:hover {
  background: linear-gradient(90deg,#246be5 0%,#3b84f9 100%);
}

.footer {
  text-align: center;
  margin-top: 35px;
  color: #adb4bd;
  font-size: 13px;
  width: 100%;
  letter-spacing: 0.5px;
  font-family: 'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

@media (max-width: 650px) {
  .register-box {
    width: 96vw;
    min-width: 0;
    padding: 22px 4vw 15px 4vw;
  }
}
</style>

