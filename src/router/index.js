import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import List from '../pages/LicenseAdmin.vue'
const AppLayout = () => import('../layouts/AppLayout.vue')
// const Chat = () => import('../pages/Chat.vue')
const SopPicker  = () => import('../pages/SopPicker.vue')
const ChatExam   = () => import('../pages/ChatExam.vue')

const routes = [
  // 公开页（不进侧边栏）
  { path: '/login', name: 'Login', component: Login, meta: { public: true } },
  { path: '/chat/sop',  name: 'SopPicker', component: SopPicker },
  { path: '/chat/exam', name: 'ChatExam',  component: ChatExam },

  // 带侧边栏的主框架
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', redirect: '/list' },
      { path: 'list', name: 'List', component: List }
    ]
  },

  // 兜底
  { path: '/:pathMatch(.*)*', redirect: '/list' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 登录守卫：公开页直接放行，其余需要 token
router.beforeEach((to, from, next) => {
  if (to.meta?.public) return next()
  const token = localStorage.getItem('token')
  if (!token) return next({ path: '/login', query: { redirect: to.fullPath } })
  next()
})

export default router
