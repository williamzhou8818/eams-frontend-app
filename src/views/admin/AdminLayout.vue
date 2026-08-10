<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <!-- 👉 桌面端固定侧边栏 (md 及以上屏幕显示，移动端隐藏) -->
    <aside
      class="hidden md:flex w-64 bg-slate-900 text-white flex-col shadow-xl flex-shrink-0"
    >
      <div
        class="h-16 flex items-center justify-center border-b border-slate-700"
      >
        <h1 class="text-lg font-bold tracking-wider">龍華合同会社</h1>
      </div>

      <nav class="flex-1 py-4 overflow-y-auto">
        <router-link
          to="/admin/dashboard"
          class="flex items-center px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          active-class="bg-indigo-600 text-white border-r-4 border-indigo-300"
        >
          <el-icon class="mr-3"><DataLine /></el-icon>
          <span>数据看板</span>
        </router-link>

        <router-link
          to="/admin/employees"
          class="flex items-center px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          active-class="bg-indigo-600 text-white border-r-4 border-indigo-300"
        >
          <el-icon class="mr-3"><User /></el-icon>
          <span>员工管理</span>
        </router-link>

        <router-link
          to="/admin/attendance"
          class="flex items-center px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          active-class="bg-indigo-600 text-white border-r-4 border-indigo-300"
        >
          <el-icon class="mr-3"><Calendar /></el-icon>
          <span>考勤管理</span>
        </router-link>

        <router-link
          to="/admin/salary"
          class="flex items-center px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          active-class="bg-indigo-600 text-white border-r-4 border-indigo-300"
        >
          <el-icon class="mr-3"><Money /></el-icon>
          <span>工资管理</span>
        </router-link>
      </nav>
    </aside>

    <!-- 👉 移动端/iPad 侧边抽屉 (仅在屏幕小于 md 时通过 v-model 控制显示) -->
    <el-drawer
      v-model="isMobileMenuOpen"
      direction="ltr"
      size="250px"
      :with-header="false"
      class="md:hidden mobile-menu-drawer"
    >
      <div class="bg-slate-900 h-full text-white">
        <div
          class="h-16 flex items-center justify-center border-b border-slate-700"
        >
          <h1 class="text-lg font-bold tracking-wider">龍華合同会社</h1>
        </div>

        <nav class="flex-1 py-4 overflow-y-auto">
          <router-link
            to="/admin/dashboard"
            class="flex items-center px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            active-class="bg-indigo-600 text-white border-r-4 border-indigo-300"
            @click="isMobileMenuOpen = false"
          >
            <el-icon class="mr-3"><DataLine /></el-icon>
            <span>数据看板</span>
          </router-link>

          <router-link
            to="/admin/employees"
            class="flex items-center px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            active-class="bg-indigo-600 text-white border-r-4 border-indigo-300"
            @click="isMobileMenuOpen = false"
          >
            <el-icon class="mr-3"><User /></el-icon>
            <span>员工管理</span>
          </router-link>

          <router-link
            to="/admin/attendance"
            class="flex items-center px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            active-class="bg-indigo-600 text-white border-r-4 border-indigo-300"
            @click="isMobileMenuOpen = false"
          >
            <el-icon class="mr-3"><Calendar /></el-icon>
            <span>考勤管理</span>
          </router-link>

          <router-link
            to="/admin/salary"
            class="flex items-center px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            active-class="bg-indigo-600 text-white border-r-4 border-indigo-300"
            @click="isMobileMenuOpen = false"
          >
            <el-icon class="mr-3"><Money /></el-icon>
            <span>工资管理</span>
          </router-link>
        </nav>
      </div>
    </el-drawer>

    <!-- 右侧主体内容 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 顶部导航 -->
      <header
        class="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-6 flex-shrink-0"
      >
        <div class="flex items-center gap-3">
          <!-- 👉 移动端汉堡菜单按钮 (md 及以上屏幕隐藏) -->
          <el-button
            text
            class="!p-2 md:hidden"
            @click="isMobileMenuOpen = true"
          >
            <el-icon :size="24"><Fold /></el-icon>
          </el-button>

          <!-- 👇 新增：返回打卡主页按钮 -->
          <el-button type="primary" plain size="small" @click="goToCheckIn">
            <el-icon class="mr-1"><HomeFilled /></el-icon>
            <!-- 手机端隐藏文字，只显示图标，节省空间 -->
            <span class="hidden sm:inline">返回打卡</span>
          </el-button>

          <!-- 👇 原有工作台标识，加上左边框分割线 -->
          <div
            class="flex items-center gap-2 text-gray-500 border-l border-gray-200 pl-3 ml-1"
          >
            <el-icon><Monitor /></el-icon>
            <span class="text-sm font-medium hidden sm:inline"
              >管理员工作台</span
            >
          </div>
        </div>

        <div class="flex items-center gap-3 md:gap-4">
          <div class="text-right hidden sm:block">
            <div class="text-sm font-bold text-gray-800">
              {{ employeeName }}
            </div>
            <div class="text-xs text-indigo-600 font-semibold">HR 管理员</div>
          </div>
          <el-avatar :size="36" class="!bg-indigo-500 flex-shrink-0">
            {{ employeeName ? employeeName.charAt(0) : '?' }}
          </el-avatar>
          <el-button type="danger" text size="small" @click="handleLogout"
            >退出</el-button
          >
        </div>
      </header>

      <!-- 页面内容区域 (允许内部滚动) -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Fold,
  Monitor,
  DataLine,
  User,
  Calendar,
  Money,
  HomeFilled, // 👈 新增：引入“首页/打卡”图标
} from '@element-plus/icons-vue';

const router = useRouter();
const employeeName = ref(localStorage.getItem('employeeName') || '管理员');
const isMobileMenuOpen = ref(false); // 控制移动端抽屉开关

// 👇 新增：返回打卡界面的方法
const goToCheckIn = () => {
  // ⚠️ 注意：请把 '/' 替换成你实际的前台打卡页面的路由路径！
  // 例如：如果打卡页路由是 '/checkin'，请改为 router.push('/checkin');
  router.push('/');
};

const handleLogout = () => {
  localStorage.clear();
  router.push('/login');
};
</script>
