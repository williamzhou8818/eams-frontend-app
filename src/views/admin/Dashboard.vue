<template>
  <div class="dashboard-container pb-8">
    <h2
      class="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2"
    >
      <el-icon class="text-indigo-500"><DataLine /></el-icon>
      数据看板
    </h2>

    <!-- 👉 统计卡片区（骨架屏正常，保持不变） -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8"
    >
      <el-skeleton
        v-for="(card, index) in statCards"
        :key="card.key"
        :loading="isLoading"
        animated
      >
        <template #template>
          <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <el-skeleton-item variant="text" style="width: 40%" />
            <el-skeleton-item
              variant="h1"
              style="width: 50%; margin-top: 16px; height: 32px"
            />
          </div>
        </template>
        <template #default>
          <div
            class="relative overflow-hidden bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-300 group cursor-default"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <div
              class="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ease-out"
              :class="card.bgColor"
            ></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between">
                <div class="text-gray-500 text-sm font-medium">
                  {{ card.title }}
                </div>
                <div
                  class="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm"
                  :class="card.iconBgColor"
                >
                  <el-icon :size="20" :class="card.iconColor"
                    ><component :is="card.icon"
                  /></el-icon>
                </div>
              </div>
              <div class="text-3xl font-bold mt-3 text-gray-800 tracking-tight">
                {{ stats[card.key] }}
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- 👉 图表区 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <!-- ✅ 修复：图表容器永远在 DOM 中，加载效果改用 v-loading -->
      <el-card
        class="!rounded-xl !border-0 shadow-sm lg:col-span-2 overflow-hidden"
        :body-style="{ padding: '20px' }"
        v-loading="isTrendLoading"
      >
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3 -mt-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-gray-800">出勤趋势</span>
              <el-tag size="small" type="info" effect="plain">人数</el-tag>
            </div>
            <div class="flex gap-2">
              <el-button
                v-for="d in [7, 14, 30]"
                :key="d"
                :type="trendDays === d ? 'primary' : 'default'"
                size="small"
                @click="changeTrendDays(d)"
                round
              >
                近{{ d }}天
              </el-button>
            </div>
          </div>
        </template>

        <!-- ✅ 图表容器：不再被骨架屏包裹 -->
        <div ref="trendChartRef" class="w-full h-[280px] md:h-[320px]"></div>
      </el-card>

      <!-- ✅ 修复：环形图同理 -->
      <el-card
        class="!rounded-xl !border-0 shadow-sm overflow-hidden"
        :body-style="{ padding: '20px' }"
        v-loading="isLoading"
      >
        <template #header>
          <div class="flex items-center gap-2 -mt-1">
            <span class="font-bold text-gray-800">今日出勤分布</span>
            <el-tag size="small" type="warning" effect="plain">实时</el-tag>
          </div>
        </template>

        <div ref="pieChartRef" class="w-full h-[280px] md:h-[320px]"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  onUnmounted,
  nextTick,
  shallowRef,
  markRaw,
} from 'vue';
import {
  User,
  CircleCheck,
  Warning,
  CircleClose,
  DataLine,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import request from '@/api/request';

// ========== 统计数据 ==========
const isLoading = ref(true);
const isTrendLoading = ref(false);
const stats = reactive({
  totalEmployees: 0,
  todayCheckedIn: 0,
  todayLate: 0,
  todayAbsent: 0,
});

// ========== 卡片配置 ==========
const statCards = [
  {
    key: 'totalEmployees',
    title: '总员工数',
    icon: markRaw(User),
    bgColor: 'bg-indigo-500',
    iconBgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-500',
  },
  {
    key: 'todayCheckedIn',
    title: '今日出勤',
    icon: markRaw(CircleCheck),
    bgColor: 'bg-emerald-500',
    iconBgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    key: 'todayLate',
    title: '今日迟到',
    icon: markRaw(Warning),
    bgColor: 'bg-orange-500',
    iconBgColor: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  {
    key: 'todayAbsent',
    title: '今日缺勤',
    icon: markRaw(CircleClose),
    bgColor: 'bg-rose-500',
    iconBgColor: 'bg-rose-50',
    iconColor: 'text-rose-500',
  },
];

// ========== ECharts 实例 ==========
const trendChartRef = ref(null);
const pieChartRef = ref(null);
const trendChart = shallowRef(null);
const pieChart = shallowRef(null);
const trendDays = ref(7);

// ========== 趋势图配置 ==========
const getTrendOption = (data) => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e2e8f0',
    textStyle: { color: '#334155', fontSize: 12 },
  },
  legend: {
    data: ['出勤人数', '迟到人数'],
    top: 0,
    textStyle: { color: '#64748b' },
  },
  grid: { left: 40, right: 16, top: 40, bottom: 28 },
  xAxis: {
    type: 'category',
    data: data.labels,
    axisTick: { show: false },
    axisLine: { lineStyle: { color: '#cbd5e1' } },
    axisLabel: { color: '#64748b' },
  },
  yAxis: {
    type: 'value',
    minInterval: 1,
    splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
    axisLabel: { color: '#64748b' },
  },
  series: [
    {
      name: '出勤人数',
      type: 'bar',
      data: data.checkedIn,
      barMaxWidth: 32,
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#818cf8' },
          { offset: 1, color: '#4f46e5' },
        ]),
      },
    },
    {
      name: '迟到人数',
      type: 'line',
      data: data.late,
      smooth: true,
      symbolSize: 6,
      lineStyle: { width: 3, color: '#f97316' },
      itemStyle: { color: '#f97316', borderWidth: 2, borderColor: '#fff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(249, 115, 22, 0.25)' },
          { offset: 1, color: 'rgba(249, 115, 22, 0)' },
        ]),
      },
    },
  ],
});

// ========== 环形图配置 ==========
const getPieOption = (s) => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} 人 ({d}%)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e2e8f0',
    textStyle: { color: '#334155' },
  },
  legend: { bottom: 10, icon: 'circle', textStyle: { color: '#64748b' } },
  series: [
    {
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 3 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 16, fontWeight: 'bold' },
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.15)' }, // ✅ 括号已修正
      },
      data: [
        {
          value: Math.max(s.todayCheckedIn - s.todayLate, 0),
          name: '正常',
          itemStyle: { color: '#10b981' },
        },
        { value: s.todayLate, name: '迟到', itemStyle: { color: '#f97316' } },
        { value: s.todayAbsent, name: '缺勤', itemStyle: { color: '#ef4444' } },
      ],
    },
  ],
});

// ========== 数据请求 ==========
const loadStats = async () => {
  isLoading.value = true;
  try {
    const res = await request.get('/api/admin/dashboard/stats');
    if (res.data.code === 200) {
      Object.assign(stats, res.data.data);
      // ✅ 此时 pieChart 已初始化，直接渲染
      pieChart.value?.setOption(getPieOption(stats));
    }
  } catch (error) {
    ElMessage.error('加载统计数据失败');
  } finally {
    isLoading.value = false;
  }
};

const loadTrend = async () => {
  isTrendLoading.value = true;
  try {
    const res = await request.get('/api/admin/dashboard/trend', {
      params: { days: trendDays.value },
    });
    if (res.data.code === 200) {
      trendChart.value?.setOption(getTrendOption(res.data.data), true);
    }
  } catch (error) {
    ElMessage.error('加载趋势数据失败');
  } finally {
    isTrendLoading.value = false;
  }
};

const changeTrendDays = (d) => {
  trendDays.value = d;
  loadTrend();
};

// ========== 响应式监听 ==========
let trendObserver = null;
let pieObserver = null;

onMounted(async () => {
  await nextTick();

  // ✅ 现在 div 永远存在，初始化一定成功
  trendChart.value = echarts.init(trendChartRef.value);
  pieChart.value = echarts.init(pieChartRef.value);

  trendObserver = new ResizeObserver(() => trendChart.value?.resize());
  trendObserver.observe(trendChartRef.value);
  pieObserver = new ResizeObserver(() => pieChart.value?.resize());
  pieObserver.observe(pieChartRef.value);

  loadStats();
  loadTrend();
});

onUnmounted(() => {
  trendObserver?.disconnect();
  pieObserver?.disconnect();
  trendChart.value?.dispose();
  pieChart.value?.dispose();
});
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.grid > div {
  animation: fadeInUp 0.4s ease-out forwards;
}
</style>
