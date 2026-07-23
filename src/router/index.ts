// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      // 👇 改回指向 App.vue（确保你的代码确实还在 App.vue 里）
      component: () => import('../components/Home.vue'),
    },
    {
      path: '/attendance/history',
      name: 'AttendanceHistory',
      component: () => import('../components/AttendanceHistory.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

export default router;
