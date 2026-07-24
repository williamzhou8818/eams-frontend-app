<template>
  <!-- 👇 核心优化 1：外层增加 flex justify-center，让内容在 PC 端居中 -->
  <div class="min-h-screen bg-gray-50 p-6 flex justify-center">
    <!-- 👇 核心优化 2：限制最大宽度为 3xl (768px)，既不会太窄，也不会在大屏上拉得太长 -->
    <div class="w-full max-w-3xl">
      <!-- Header -->
      <div class="flex items-center mb-6">
        <el-button
          @click="goBack"
          text
          :disabled="isLoading"
          class="!px-2 hover:bg-gray-200 rounded-lg"
        >
          <el-icon class="mr-1"><ArrowLeft /></el-icon> 返回
        </el-button>
        <h2 class="text-xl font-bold ml-2 text-gray-800">历史考勤</h2>
      </div>

      <!-- 查询月份 -->
      <el-card class="mb-5 rounded-2xl !border-0 !shadow-sm">
        <el-date-picker
          v-model="month"
          type="month"
          placeholder="选择查询月份"
          :disabled="isLoading"
          @change="loadHistory"
          class="!w-full"
        />
      </el-card>

      <!-- 考勤列表 -->
      <el-card
        class="rounded-2xl !border-0 !shadow-sm min-h-[300px]"
        v-loading="isLoading"
        element-loading-text="正在加载考勤数据..."
      >
        <!-- 1. 空状态 -->
        <div
          v-if="!isLoading && records.length === 0"
          class="flex flex-col items-center justify-center py-16 text-gray-400"
        >
          <el-icon :size="48" class="mb-3 text-gray-300"
            ><DocumentDelete
          /></el-icon>
          <p class="text-sm">该月份暂无考勤记录</p>
        </div>

        <!-- 2. 数据列表 -->
        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="item in records"
            :key="item.id"
            class="py-4 first:pt-2 last:pb-2 last:border-none hover:bg-gray-50 transition-colors rounded-lg px-2"
          >
            <!-- 👇 核心优化 3：使用 Grid 布局替代 Flex，固定各列比例，PC端绝不松散 -->
            <div class="grid grid-cols-12 gap-4 items-center">
              <!-- 左侧：日期与星期 (占 3/12) -->
              <div class="col-span-3 flex flex-col">
                <div class="font-bold text-gray-800 text-base">
                  {{ item.workDate }}
                </div>
                <div class="text-xs text-gray-400 mt-1">
                  {{ item.week }}
                </div>
              </div>

              <!-- 中间：上下班时间 (占 5/12) -->
              <div
                class="col-span-5 text-sm text-gray-600 flex flex-col gap-1.5"
              >
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-400 w-8">上班</span>
                  <span class="font-medium text-gray-700">{{ item.in }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-400 w-8">下班</span>
                  <span class="font-medium text-gray-700">{{ item.out }}</span>
                </div>
              </div>

              <!-- 右侧：工时与状态 (占 4/12，右对齐) -->
              <div class="col-span-4 flex flex-col items-end gap-2">
                <div class="font-bold text-indigo-500 text-sm">
                  {{ item.hours }}
                </div>

                <!-- 动态状态标签 -->
                <el-tag
                  size="small"
                  :type="getStatusType(item.status)"
                  effect="light"
                  class="!rounded-full px-3"
                >
                  {{ item.status }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, DocumentDelete } from '@element-plus/icons-vue';
import request from '@/api/request';

const router = useRouter();

const isLoading = ref(false);
const month = ref(new Date());
const records = ref([]);

const loadHistory = async () => {
  isLoading.value = true;
  try {
    const res = await request.get('/api/attendance/history', {
      params: {
        month: formatMonth(month.value),
      },
    });

    const dataList = res.data.data || [];
    records.value = dataList.map((item) => ({
      id: item.id,
      workDate: item.workDate,
      week: getWeek(item.workDate),
      in: item.checkInTime ? item.checkInTime.substring(11, 16) : '--:--',
      out: item.checkOutTime ? item.checkOutTime.substring(11, 16) : '--:--',
      hours: calcHours(item.checkInTime, item.checkOutTime),
      status: item.status === 1 ? '正常' : '异常',
    }));
  } catch (e) {
    console.error('查询失败:', e);
    ElMessage.error('加载历史考勤失败，请检查网络');
    records.value = [];
  } finally {
    isLoading.value = false;
  }
};

const getStatusType = (status) => {
  if (status === '正常') return 'success';
  if (status.includes('迟到') || status.includes('早退')) return 'warning';
  if (status === '异常' || status.includes('缺勤')) return 'danger';
  return 'info';
};

const formatMonth = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const getWeek = (date) => {
  const weeks = [
    '星期日',
    '星期一',
    '星期二',
    '星期三',
    '星期四',
    '星期五',
    '星期六',
  ];
  return weeks[new Date(date).getDay()];
};

const calcHours = (start, end) => {
  if (!start || !end) return '--';
  const s = new Date(start);
  const e = new Date(end);
  const minutes = Math.floor((e - s) / 1000 / 60);
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
};

const goBack = () => router.back();

onMounted(() => {
  loadHistory();
});
</script>
