<template>
  <el-dropdown>
    <div class="avatar">
      <img src="@/assets/images/user.png" alt="avatar" />
      <el-text>{{ userInfo.name }}</el-text>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="showPwdDrawer = true">
          <el-icon><Edit /></el-icon>修改密码
        </el-dropdown-item>
        <el-dropdown-item @click="logout">
          <el-icon><SwitchButton /></el-icon>退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <UpdatePwd v-if="showPwdDrawer" @close="showPwdDrawer = false" />
</template>

<script setup>
import { ref } from "vue";
import UpdatePwd from "./UpdatePwd.vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import { useUserStore } from "@/stores/modules/user";
import { storeToRefs } from "pinia";

const router = useRouter();
const showPwdDrawer = ref(false);
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);
console.log(userInfo); // 退出登录
const logout = () => {
  ElMessageBox.confirm("您是否确认退出登录?", "温馨提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    localStorage.removeItem("token");
    setTimeout(() => {
      window.location.href = "/login";
    }, 500);
    ElMessage.success("退出登录成功！");
  });
};
</script>

<style scoped lang="scss">
.avatar {
  img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 7px;
  }
  display: flex;
  align-items: center;
  outline: none;
  cursor: pointer;
  white-space: nowrap;
  padding: 5px 5px 5px 10px;
  border-radius: 6px;

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}
</style>
