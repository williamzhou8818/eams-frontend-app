// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      // 指向独立的登录页面
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/',
      name: 'Home',
      // 指向独立的主页面（打卡界面）
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/attendance/history',
      name: 'AttendanceHistory',
      // 指向历史考勤页面
      component: () => import('../views/AttendanceHistory.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      // 找不到页面时，安全地重定向到登录页或主页
      redirect: '/login',
    },
  ],
});

export default router;
