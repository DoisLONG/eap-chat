<template>
  <div class="login-bg">
    <div class="login-box">
      <div class="login-header">
        <img class="logo" src="/logo2.png" alt="logo" />
        <span class="title"> {{ $t("header.logoTitle") }}</span>
        <el-dropdown
          style="margin-left: 15px"
          trigger="hover"
          @command="changeLanguage"
        >
          <div>
            <img
              :src="globalIcon"
              alt="language"
              style="width: 23px; height: 23px"
            />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="item in languageList"
                :key="item.value"
                :command="item.value"
                :disabled="language === item.value"
              >
                {{ item.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <el-form
        :model="form"
        :rules="rules"
        ref="loginForm"
        size="large"
        class="login-form"
        @keyup.enter="onLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            :placeholder="$t('header.userPlaceholder')"
            prefix-icon="el-icon-user"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            :placeholder="$t('header.passwordPlaceholder')"
            show-password
            prefix-icon="el-icon-lock"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            style="width: 100%"
            @click="onLogin"
            :loading="loading"
            >{{ $t("header.login") }}</el-button
          >
        </el-form-item>
      </el-form>
      <div class="footer">© {{ year }} {{ $t("header.logo") }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { login } from "@/services/user.service";
import { useUserStore } from "@/stores/modules/user";
import { useGlobalStore } from "@/stores/modules/global";
import { LanguageType } from "@/stores/interface";
import globalIcon from "@/assets/images/global.png";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const loginForm = ref<any>();
const loading = ref(false);
const year = new Date().getFullYear();

const i18n = useI18n();
const globalStore = useGlobalStore();
const language = computed(() => globalStore.language);

const languageList = [
  { label: "简体中文", value: "zh" },
  { label: "English", value: "en" },
  { label: "ภาษาไทย", value: "th" },
];

const rules = computed(() => ({
  username: [
    { required: true, message: t("header.userPlaceholder"), trigger: "blur" },
  ],
  password: [
    {
      required: true,
      message: t("header.passwordPlaceholder"),
      trigger: "blur",
    },
  ],
}));

const changeLanguage = (lang: string) => {
  i18n.locale.value = lang;
  globalStore.setGlobalState("language", lang as LanguageType);
};

const form = reactive({
  username: "",
  password: "",
});

const onLogin = async () => {
  await loginForm.value.validate(async (valid: boolean) => {
    if (!valid) return;
    loading.value = true;
    const params = {
      name: form.username,
      password: form.password,
    };
    login(params)
      .then((res) => {
        if (res.data.http_status_code === 200) {
          const token = res.data.data.token;
          localStorage.setItem("token", token);
          userStore.setUserInfo(res.data.data.data);
          // 2) 支持 redirect 回跳
          const redirect = (route.query.redirect as string) || "/license/admin";
          router.replace(redirect);

          ElMessage.success(t("header.loginSuccess"));
        } else {
          ElMessage.error(res.data.message || t("header.loginError"));
        }
      })
      .finally(() => {
        loading.value = false;
      });
    // 这里是“前端写死”的登录校验（你也可以直接去掉判断，始终通过）
    // setTimeout(async () => {
    //   loading.value = false;
    //   if (form.username === "admin" && form.password === "bluedot@123") {
    //     // 1) 先写 token，给路由守卫识别
    //     const fakeToken = "mock-token-abc123";
    //     localStorage.setItem("token", fakeToken);

    //     // 2) 支持 redirect 回跳
    //     const redirect = (route.query.redirect as string) || "/license/admin";
    //     await router.replace(redirect);

    //     ElMessage.success("登录成功！");
    //   } else {
    //     ElMessage.error("用户名或密码错误");
    //   }
    // }, 400);
  });
};
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #e3ebf8 0%, #dbe6fb 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-box {
  width: 450px;
  padding: 36px 32px 18px 32px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px 0 #e4eaf2;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login-header {
  display: flex;
  align-items: center;
  margin-bottom: 28px;
  width: 100%;
  justify-content: center;
}
.logo {
  height: 38px;
  margin-right: 10px;
}
.title {
  font-size: 22px;
  color: #3573e2;
  font-weight: bold;
  letter-spacing: 1px;
}
.login-form {
  width: 100%;
}
.footer {
  text-align: center;
  margin-top: 32px;
  color: #adb4bd;
  font-size: 13px;
  width: 100%;
}
</style>
