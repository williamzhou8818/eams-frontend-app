<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="flex items-center mb-6">
      <el-button @click="goBack" text> 返回 </el-button>

      <h2 class="text-xl font-bold ml-4">历史考勤</h2>
    </div>

    <!-- 查询月份 -->
    <el-card class="mb-5 rounded-2xl">
      <el-date-picker
        v-model="month"
        type="month"
        placeholder="选择月份"
        @change="loadHistory"
      />
    </el-card>

    <!-- 考勤列表 -->
    <el-card class="rounded-2xl">
      <div v-if="records.length === 0" class="text-center text-gray-400 py-8">
        暂无考勤记录
      </div>

      <div
        v-for="item in records"
        :key="item.id"
        class="py-4 border-b last:border-none"
      >
        <div class="flex justify-between">
          <!-- 日期 -->
          <div>
            <div class="font-bold">
              {{ item.workDate }}
            </div>

            <div class="text-sm text-gray-400">
              {{ item.week }}
            </div>
          </div>

          <!-- 时间 -->
          <div class="text-sm">
            <div>
              上班:
              {{ item.in }}
            </div>

            <div>
              下班:
              {{ item.out }}
            </div>
          </div>

          <!-- 工时状态 -->
          <div>
            <div class="font-bold text-indigo-500">
              {{ item.hours }}
            </div>

            <el-tag size="small">
              {{ item.status }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '@/api/request';

const router = useRouter();

// 员工ID
// const employeeId = localStorage.getItem('employeeId');
const employeeId = 4;

console.log('employeeId:', employeeId);
// 当前月份
const month = ref(new Date());

// 数据列表
const records = ref([]);

// 查询历史考勤
const loadHistory = async () => {
  try {
    const res = await request.get('/api/attendance/history', {
      params: {
        employeeId: employeeId,

        month: formatMonth(month.value),
      },
    });

    console.log('历史考勤:', res.data.data);

    records.value = res.data.data.map((item) => ({
      // id
      id: item.id,

      // 日期
      workDate: item.workDate,

      // 星期
      week: getWeek(item.workDate),

      // 上班
      in: item.checkInTime ? item.checkInTime.substring(11, 16) : '--:--',

      // 下班
      out: item.checkOutTime ? item.checkOutTime.substring(11, 16) : '--:--',

      // 工时
      hours: calcHours(item.checkInTime, item.checkOutTime),

      // 状态
      status: item.status === 1 ? '正常' : '异常',
    }));
  } catch (e) {
    console.log('查询失败:', e);
  }
};

// 格式化月份
const formatMonth = (date) => {
  const y = date.getFullYear();

  const m = String(date.getMonth() + 1).padStart(2, '0');

  return `${y}-${m}`;
};

// 计算星期
const getWeek = (date) => {
  const d = new Date(date);

  const weeks = [
    '星期日',
    '星期一',
    '星期二',
    '星期三',
    '星期四',
    '星期五',
    '星期六',
  ];

  return weeks[d.getDay()];
};

// 计算工作时间
const calcHours = (start, end) => {
  if (!start || !end) {
    return '--';
  }

  const s = new Date(start);

  const e = new Date(end);

  const minutes = Math.floor((e - s) / 1000 / 60);

  return Math.floor(minutes / 60) + 'h ' + (minutes % 60) + 'm';
};

// 返回
const goBack = () => {
  router.back();
};

onMounted(() => {
  loadHistory();
});
</script>
