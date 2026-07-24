<template>
  <div>
    <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
      数据看板
    </h2>

    <!-- 👉 响应式网格：手机 1 列，sm(640px+) 2 列，lg(1024px+) 4 列 -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8"
      v-loading="isLoading"
    >
      <el-card
        class="!rounded-xl !border-0 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="text-gray-500 text-xs md:text-sm flex items-center gap-2">
          <el-icon><User /></el-icon> 总员工数
        </div>
        <div class="text-2xl md:text-3xl font-bold text-indigo-500 mt-2">
          {{ stats.totalEmployees }}
        </div>
      </el-card>

      <el-card
        class="!rounded-xl !border-0 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="text-gray-500 text-xs md:text-sm flex items-center gap-2">
          <el-icon><CircleCheck /></el-icon> 今日出勤
        </div>
        <div class="text-2xl md:text-3xl font-bold text-green-500 mt-2">
          {{ stats.todayCheckedIn }}
        </div>
      </el-card>

      <el-card
        class="!rounded-xl !border-0 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="text-gray-500 text-xs md:text-sm flex items-center gap-2">
          <el-icon><Warning /></el-icon> 今日迟到
        </div>
        <div class="text-2xl md:text-3xl font-bold text-orange-500 mt-2">
          {{ stats.todayLate }}
        </div>
      </el-card>

      <el-card
        class="!rounded-xl !border-0 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="text-gray-500 text-xs md:text-sm flex items-center gap-2">
          <el-icon><CircleClose /></el-icon> 今日缺勤
        </div>
        <div class="text-2xl md:text-3xl font-bold text-red-500 mt-2">
          {{ stats.todayAbsent }}
        </div>
      </el-card>
    </div>

    <!-- 图表占位区 (移动端自适应高度) -->
    <el-card
      class="!rounded-xl !border-0 shadow-sm p-4 md:p-8 text-center text-gray-400 min-h-[200px] md:min-h-[300px] flex flex-col items-center justify-center"
    >
      <el-icon :size="40" class="mb-3 md:mb-4 text-indigo-200"
        ><TrendCharts
      /></el-icon>
      <p class="text-base md:text-lg">考勤趋势图表区域</p>
      <p class="text-xs md:text-sm mt-2">
        （Phase 3 将在此接入 ECharts 实现可视化）
      </p>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  User,
  CircleCheck,
  Warning,
  CircleClose,
  TrendCharts,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import request from '@/api/request';

const isLoading = ref(true);
const stats = ref({
  totalEmployees: 0,
  todayCheckedIn: 0,
  todayLate: 0,
  todayAbsent: 0,
});

const loadStats = async () => {
  isLoading.value = true;
  try {
    const res = await request.get('/api/admin/dashboard/stats');
    if (res.data.code === 200) {
      stats.value = res.data.data;
    }
  } catch (error) {
    console.error('加载看板数据失败:', error);
    ElMessage.error('加载统计数据失败，请检查网络');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadStats();
});
</script>
