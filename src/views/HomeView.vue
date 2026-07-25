<template>
  <div class="min-h-screen bg-gray-50 flex justify-center">
    <div
      class="w-full max-w-md bg-gray-50 min-h-screen shadow-xl overflow-hidden"
    >
      <!-- 顶部区域 -->
      <div class="bg-white px-6 pt-10 pb-6 shadow-sm">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <el-avatar :size="44" class="!bg-indigo-500 font-bold">
              {{ employeeName ? employeeName.charAt(0) : '?' }}
            </el-avatar>
            <div>
              <div class="font-bold text-lg">{{ employeeName }}</div>
              <div class="text-xs text-gray-400">{{ department }}</div>
            </div>
          </div>

          <!-- 👇 核心修改 1：右侧操作区，增加管理后台入口 -->
          <div class="flex items-center gap-2">
            <!-- 仅 HR 或 ADMIN 可见 -->
            <el-button
              v-if="role === 'HR' || role === 'ADMIN'"
              type="primary"
              link
              :icon="Monitor"
              @click="goToAdmin"
              class="!text-indigo-600 hover:!text-indigo-800 font-medium"
            >
              管理后台
            </el-button>

            <el-divider
              direction="vertical"
              v-if="role === 'HR' || role === 'ADMIN'"
              class="!h-4"
            />

            <el-button text @click="handleLogout"> 退出 </el-button>
          </div>
        </div>

        <div class="text-center mt-6">
          <div class="text-6xl font-extralight text-gray-800">
            {{ currentTimeStr }}
          </div>
          <div class="text-indigo-500 text-sm mt-2">{{ encouragement }}</div>
        </div>
      </div>

      <!-- 内容区域：打卡按钮、今日状态、本周记录 (保持你原有的优秀代码不变) -->
      <div class="px-6 py-6">
        <!-- 打卡按钮 -->
        <div class="flex flex-col gap-3 mb-6">
          <!-- 出勤打卡按钮 -->
          <button
            class="h-24 rounded-2xl text-white shadow-lg transition-all duration-300 flex flex-col items-center justify-center"
            :class="[
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : clockInTime
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 active:scale-95',
            ]"
            :disabled="isLoading || !!clockInTime"
            @click="handleClock('in')"
          >
            <div v-if="isLoading" class="flex items-center gap-2">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span class="text-xl font-bold">同步数据中...</span>
            </div>
            <div v-else class="text-xl font-bold">
              {{ clockInTime ? `已出勤 ${clockInTime}` : '出勤打卡' }}
            </div>
            <div class="text-xs mt-1">
              {{
                isLoading
                  ? '请稍候'
                  : clockInTime
                    ? '今日工作已开始'
                    : '09:00 前打卡为正常'
              }}
            </div>
          </button>

          <!-- 退勤打卡按钮 -->
          <button
            class="h-24 rounded-2xl text-white shadow-lg transition-all duration-300 flex flex-col items-center justify-center"
            :class="[
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : clockOutTime
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 active:scale-95',
            ]"
            :disabled="isLoading || !!clockOutTime"
            @click="handleClock('out')"
          >
            <div v-if="isLoading" class="flex items-center gap-2">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span class="text-xl font-bold">同步数据中...</span>
            </div>
            <div v-else class="text-xl font-bold">
              {{ clockOutTime ? `已退勤 ${clockOutTime}` : '退勤打卡' }}
            </div>
            <div class="text-xs mt-1">
              {{
                isLoading
                  ? '请稍候'
                  : clockOutTime
                    ? '今日工作已结束'
                    : '18:00 后打卡为正常'
              }}
            </div>
          </button>
        </div>

        <!-- 今日状态 -->
        <el-card class="!rounded-2xl mb-6" :class="{ 'opacity-50': isLoading }">
          <div class="grid grid-cols-3 text-center">
            <div>
              <div class="text-xs text-gray-400">出勤</div>
              <div class="font-bold text-green-500">
                {{ clockInTime || '--:--' }}
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-400">退勤</div>
              <div class="font-bold text-red-500">
                {{ clockOutTime || '--:--' }}
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-400">工时</div>
              <div class="font-bold text-indigo-500">{{ workHours }}</div>
            </div>
          </div>
        </el-card>

        <!-- 本周考勤记录 -->
        <div class="mb-4" :class="{ 'opacity-50': isLoading }">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-base font-bold text-gray-800">本周考勤记录</h3>
            <el-button
              text
              type="primary"
              size="small"
              @click="goHistory"
              :disabled="isLoading"
            >
              查看全部
            </el-button>
          </div>

          <el-card class="!rounded-2xl !shadow-sm !border-gray-100">
            <div
              v-if="isLoading"
              class="text-center py-8 text-gray-400 text-sm flex flex-col items-center gap-2"
            >
              <el-icon class="is-loading text-2xl"><Loading /></el-icon>
              <span>正在加载本周记录...</span>
            </div>
            <div
              v-else-if="weekRecords.length === 0"
              class="text-center py-8 text-gray-400 text-sm"
            >
              本周暂无考勤记录
            </div>
            <div
              v-else
              v-for="(record, index) in weekRecords"
              :key="index"
              class="px-4 py-4 border-b last:border-0"
            >
              <div class="flex justify-between items-center">
                <div>
                  <div class="text-sm font-bold text-gray-800">
                    {{ record.date }}
                  </div>
                  <div class="text-xs text-gray-400">{{ record.week }}</div>
                </div>
                <div class="text-sm text-gray-600">
                  <div>上班: {{ record.in }}</div>
                  <div>下班: {{ record.out }}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm font-bold text-indigo-500">
                    {{ record.hours }}
                  </div>
                  <div class="text-xs text-gray-400">工时</div>
                </div>
                <el-tag
                  size="small"
                  effect="plain"
                  :type="record.status === '正常' ? 'success' : 'warning'"
                >
                  {{ record.status }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
// 👇 核心修改 2：引入 Monitor (显示器) 图标代表管理后台
import { User, Loading, Monitor } from '@element-plus/icons-vue';
import request from '@/api/request';

const router = useRouter();

const employeeId = localStorage.getItem('employeeId');
const employeeName = ref(localStorage.getItem('employeeName') || '');
const department = ref(localStorage.getItem('department') || '员工');
// 👇 核心修改 3：获取当前用户的角色
const role = ref(localStorage.getItem('role') || '');

if (!employeeId) {
  router.push('/login');
}

// 👇 核心修改 4：跳转到管理后台的方法
const goToAdmin = () => {
  router.push('/admin/dashboard');
};

const isLoading = ref(true);
const clockInTime = ref(null);
const clockOutTime = ref(null);
const workMinutes = ref(null);
const weekRecords = ref([]);
const now = ref(new Date());
let timer = null;

const currentTimeStr = computed(() =>
  now.value.toLocaleTimeString('zh-CN', { hour12: false }),
);

const workHours = computed(() => {
  if (workMinutes.value === null) return '--';
  const h = Math.floor(workMinutes.value / 60);
  const m = workMinutes.value % 60;
  return `${h}h ${m}m`;
});

const encouragements = {
  morning: ['新的一天，元气满满！', '早安，今天也要加油哦！'],
  afternoon: ['下午好，继续努力！', '保持专注，加油！'],
  evening: ['辛苦了，早点休息！', '今天工作完成！'],
};

const encouragement = computed(() => {
  const hour = now.value.getHours();
  const list =
    hour < 12
      ? encouragements.morning
      : hour < 18
        ? encouragements.afternoon
        : encouragements.evening;
  return list[Math.floor(now.value.getDate() % list.length)];
});

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('employeeId');
  localStorage.removeItem('employeeName');
  localStorage.removeItem('department');
  localStorage.removeItem('role'); // 👈 退出时一并清理 role
  router.push('/login');
};

const handleClock = async (type) => {
  isLoading.value = true;
  try {
    if (type === 'in') {
      await request.post('/api/attendance/check-in');
      ElMessage.success('出勤打卡成功');
    } else {
      await request.post('/api/attendance/check-out');
      ElMessage.success('退勤打卡成功');
    }
    await loadTodayAttendance();
    await loadWeekAttendance();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '操作失败，请检查网络');
  } finally {
    isLoading.value = false;
  }
};

const loadTodayAttendance = async () => {
  clockInTime.value = null;
  clockOutTime.value = null;
  workMinutes.value = null;
  try {
    const res = await request.get('/api/attendance/today');
    const attendance = res.data.data;
    if (!attendance) return;
    if (attendance.checkInTime)
      clockInTime.value = formatTime(attendance.checkInTime);
    if (attendance.checkOutTime)
      clockOutTime.value = formatTime(attendance.checkOutTime);
    workMinutes.value = attendance.workMinutes;
  } catch (error) {
    console.error('查询今日失败', error);
    ElMessage.warning('今日考勤数据加载失败');
  }
};

const loadWeekAttendance = async () => {
  try {
    const res = await request.get('/api/attendance/week');
    const dataList = res.data.data || [];
    weekRecords.value = dataList.map((item) => ({
      date: item.workDate.substring(5),
      week: getWeekName(item.workDate),
      in: item.checkInTime ? formatTime(item.checkInTime) : '--:--',
      out: item.checkOutTime ? formatTime(item.checkOutTime) : '--:--',
      hours: formatWorkMinutes(item.workMinutes),
      status: item.checkInTime ? '正常' : '未打卡',
    }));
  } catch (e) {
    console.error('查询本周失败', e);
  }
};

const goHistory = () => router.push('/attendance/history');

const formatTime = (time) => (time ? time.substring(11, 16) : null);
const formatWorkMinutes = (minutes) => {
  if (minutes == null) return '--';
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};
const getWeekName = (date) =>
  ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][
    new Date(date).getDay()
  ];

onMounted(async () => {
  try {
    await Promise.all([loadTodayAttendance(), loadWeekAttendance()]);
  } catch (error) {
    ElMessage.error('初始化数据失败，请刷新页面');
  } finally {
    isLoading.value = false;
  }
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style>
/* 保持你原有的优秀样式不变 */
.el-input__wrapper {
  box-shadow: 0 0 0 1px #e5e7eb inset !important;
  border-radius: 12px !important;
  padding: 4px 15px !important;
  transition: all 0.3s ease !important;
}
.el-input__wrapper:hover {
  box-shadow: 0 0 0 1px #a5b4fc inset !important;
}
.el-input__wrapper.is-focus {
  box-shadow:
    0 0 0 1px #6366f1 inset,
    0 0 0 4px rgba(99, 102, 241, 0.1) !important;
}
</style>
