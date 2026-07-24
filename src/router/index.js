// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/attendance/history',
      name: 'AttendanceHistory',
      component: () => import('../views/AttendanceHistory.vue'),
    },

    // 👇 新增：管理员后台路由 (嵌套路由)
    {
      path: '/admin',
      name: 'AdminLayout',
      component: () => import('../views/admin/AdminLayout.vue'),
      redirect: '/admin/dashboard', // 访问 /admin 时，默认跳转到 dashboard
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('../views/admin/Dashboard.vue'),
        },
        {
          path: 'employees',
          name: 'AdminEmployees',
          component: () => import('../views/admin/EmployeeManage.vue'),
        },
        // 后续如果需要考勤管理，可以在这里继续加 children
      ],
    },

    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
});

// 👇 全局前置守卫：每次路由跳转前执行
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // 1. 如果要访问管理员页面 (以 /admin 开头)
  if (to.path.startsWith('/admin')) {
    if (!token) {
      // 没登录，踢回登录页
      next('/login');
    } else if (role !== 'HR' && role !== 'ADMIN') {
      // 登录了但不是 HR/ADMIN，踢回员工主页，并提示
      alert('权限不足：您没有管理员权限！');
      next('/');
    } else {
      // 是管理员，放行
      next();
    }
  } else {
    // 2. 访问普通员工页面，正常放行
    next();
  }
});

export default router;
