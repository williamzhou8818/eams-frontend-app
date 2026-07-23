<template>
  <!-- ================= 登录界面 ================= -->

  <div
    v-if="!isLoggedIn"
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4"
  >
    <el-card
      class="w-full max-w-sm !rounded-3xl !shadow-2xl !border-0 bg-white/90"
    >
      <div class="text-center mb-8 pt-4">
        <div
          class="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <el-icon :size="36" class="text-indigo-600">
            <User />
          </el-icon>
        </div>

        <h1 class="text-2xl font-bold text-gray-800">员工考勤系统</h1>

        <p class="text-gray-400 text-sm mt-2">请输入您的工号开始工作</p>
      </div>

      <el-form @submit.prevent="handleLogin">
        <el-form-item>
          <el-input
            v-model="employeeNo"
            placeholder="请输入 工号"
            size="large"
            :prefix-icon="User"
            @keyup.enter="handleLogin"
            :disabled="loading"
          />
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          class="!w-full !h-12 !rounded-xl !text-lg"
          :loading="loading"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登 录' }}
        </el-button>
      </el-form>

      <div class="text-center mt-8">
        <p class="text-xs text-gray-400">© 2026 EAMS 考勤系统</p>
      </div>
    </el-card>
  </div>

  <!-- ================= 主界面 ================= -->

  <div v-else class="min-h-screen bg-gray-50 flex justify-center">
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
              <div class="font-bold text-lg">
                {{ employeeName }}
              </div>

              <div class="text-xs text-gray-400">
                {{ employee.department || '员工' }}
              </div>
            </div>
          </div>

          <el-button text @click="handleLogout"> 退出 </el-button>
        </div>

        <!-- 当前时间 -->

        <div class="text-center mt-6">
          <div class="text-6xl font-extralight text-gray-800">
            {{ currentTimeStr }}
          </div>

          <div class="text-indigo-500 text-sm mt-2">
            {{ encouragement }}
          </div>
        </div>
      </div>

      <!-- 内容 -->

      <div class="px-6 py-6">
        <!-- 打卡按钮 -->

        <div class="flex flex-col gap-3 mb-6">
          <button
            class="h-24 rounded-2xl text-white bg-green-500 shadow-lg disabled:bg-gray-300"
            :disabled="!!clockInTime"
            @click="handleClock('in')"
          >
            <div class="text-xl font-bold">
              {{ clockInTime ? `已出勤 ${clockInTime}` : '出勤打卡' }}
            </div>

            <div class="text-xs mt-1">
              {{ clockInTime ? '今日工作已开始' : '09:00 前打卡为正常' }}
            </div>
          </button>

          <button
            class="h-24 rounded-2xl text-white bg-red-500 shadow-lg disabled:bg-gray-300"
            :disabled="!!clockOutTime"
            @click="handleClock('out')"
          >
            <div class="text-xl font-bold">
              {{ clockOutTime ? `已退勤 ${clockOutTime}` : '退勤打卡' }}
            </div>

            <div class="text-xs mt-1">
              {{ clockOutTime ? '今日工作已结束' : '18:00 后打卡为正常' }}
            </div>
          </button>
        </div>

        <!-- 今日状态 -->

        <el-card class="!rounded-2xl mb-6">
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

              <div class="font-bold text-indigo-500">
                {{ workHours }}
              </div>
            </div>
          </div>
        </el-card>

        <!-- 本周考勤记录 -->
        <div class="mb-4">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-base font-bold text-gray-800">本周考勤记录</h3>

            <el-button text type="primary" size="small" @click="goHistory">
              查看全部
            </el-button>
          </div>

          <el-card class="!rounded-2xl !shadow-sm !border-gray-100">
            <!-- 没数据 -->
            <div
              v-if="weekRecords.length === 0"
              class="text-center py-8 text-gray-400 text-sm"
            >
              本周暂无考勤记录
            </div>

            <!-- 数据 -->
            <div
              v-for="(record, index) in weekRecords"
              :key="index"
              class="px-4 py-4 border-b last:border-0"
            >
              <div class="flex justify-between items-center">
                <!-- 日期 -->
                <div>
                  <div class="text-sm font-bold text-gray-800">
                    {{ record.date }}
                  </div>

                  <div class="text-xs text-gray-400">
                    {{ record.week }}
                  </div>
                </div>

                <!-- 时间 -->
                <div class="text-sm text-gray-600">
                  <div>
                    上班:
                    {{ record.in }}
                  </div>

                  <div>
                    下班:
                    {{ record.out }}
                  </div>
                </div>

                <!-- 工时 -->
                <div class="text-center">
                  <div class="text-sm font-bold text-indigo-500">
                    {{ record.hours }}
                  </div>

                  <div class="text-xs text-gray-400">工时</div>
                </div>

                <!-- 状态 -->
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

import { User, Sunny } from '@element-plus/icons-vue';

import request from '@/api/request';

// ================= 状态 =================
const router = useRouter();

const isLoggedIn = ref(false);

const employee = ref(null);

const employeeName = ref('');

const employeeNo = ref('');

const loading = ref(false);

const clockInTime = ref(null);

const clockOutTime = ref(null);

const workMinutes = ref(null);

const weekRecords = ref([]);

const now = ref(new Date());

let timer = null;

// ================= 当前时间 =================

const currentTimeStr = computed(() => {
  return now.value.toLocaleTimeString('zh-CN', {
    hour12: false,
  });
});

// ================= 工时 =================

const workHours = computed(() => {
  if (workMinutes.value === null) {
    return '--';
  }

  const h = Math.floor(workMinutes.value / 60);

  const m = workMinutes.value % 60;

  return `${h}h ${m}m`;
});

// ================= 鼓励语 =================

const encouragements = {
  morning: ['新的一天，元气满满！', '早安，今天也要加油哦！'],

  afternoon: ['下午好，继续努力！', '保持专注，加油！'],

  evening: ['辛苦了，早点休息！', '今天工作完成！'],
};

const encouragement = computed(() => {
  const hour = now.value.getHours();

  let list;

  if (hour < 12) {
    list = encouragements.morning;
  } else if (hour < 18) {
    list = encouragements.afternoon;
  } else {
    list = encouragements.evening;
  }

  return list[Math.floor(now.value.getDate() % list.length)];
});

// ================= 登录 =================

const handleLogin = async () => {
  if (!employeeNo.value) {
    ElMessage.warning('请输入员工号');

    return;
  }

  loading.value = true;

  try {
    const res = await request.post('/api/auth/login', {
      employeeNo: employeeNo.value,
    });

    if (res.data.code === 500) {
      ElMessage.error('员工号不存在');

      return;
    }

    // 重点修改
    employee.value = res.data;

    employeeName.value = employee.value.name;

    isLoggedIn.value = true;

    // 清理旧数据
    clockInTime.value = null;

    clockOutTime.value = null;

    workMinutes.value = null;

    // 查询
    await loadTodayAttendance();

    await loadWeekAttendance();

    ElMessage.success(`欢迎 ${employeeName.value}`);
  } catch (error) {
    console.log(error);

    ElMessage.error('登录失败');
  } finally {
    loading.value = false;
  }
};

// ================= 登出 =================

const handleLogout = () => {
  isLoggedIn.value = false;

  employee.value = null;

  employeeName.value = '';

  employeeNo.value = '';

  clockInTime.value = null;

  clockOutTime.value = null;

  workMinutes.value = null;

  weekRecords.value = [];
};

// ================= 打卡 =================

const handleClock = async (type) => {
  if (!employee.value) {
    ElMessage.error('请先登录');

    return;
  }

  try {
    if (type === 'in') {
      await request.post('/api/attendance/check-in', null, {
        params: {
          employeeId: employee.value.id,
        },
      });

      ElMessage.success('出勤打卡成功');
    } else {
      await request.post('/api/attendance/check-out', null, {
        params: {
          employeeId: employee.value.id,
        },
      });

      ElMessage.success('退勤打卡成功');
    }

    // 重新读取数据库

    await loadTodayAttendance();

    await loadWeekAttendance();
  } catch (error) {
    ElMessage.error(error.response?.data || '操作失败');
  }
};

// ================= 今日考勤 =================

const loadTodayAttendance = async () => {
  // 非常重要
  // 每次进入先清空

  clockInTime.value = null;

  clockOutTime.value = null;

  workMinutes.value = null;

  try {
    const res = await request.get('/api/attendance/today', {
      params: {
        employeeId: employee.value.id,
      },
    });

    const attendance = res.data.data;

    // 今天没有记录

    if (!attendance) {
      return;
    }

    if (attendance.checkInTime) {
      clockInTime.value = formatTime(attendance.checkInTime);
    }

    if (attendance.checkOutTime) {
      clockOutTime.value = formatTime(attendance.checkOutTime);
    }

    workMinutes.value = attendance.workMinutes;
  } catch (error) {
    console.log('查询今日失败', error);
  }
};

// ================= 本周考勤 =================

const loadWeekAttendance = async () => {
  try {
    const res = await request.get('/api/attendance/week', {
      params: {
        employeeId: employee.value.id,
      },
    });

    weekRecords.value = res.data.data.map((item) => ({
      date: item.workDate.substring(5),

      week: getWeekName(item.workDate),

      in: item.checkInTime ? formatTime(item.checkInTime) : '--:--',

      out: item.checkOutTime ? formatTime(item.checkOutTime) : '--:--',

      hours: formatWorkMinutes(item.workMinutes),

      status: item.checkInTime ? '正常' : '未打卡',
    }));
  } catch (e) {
    console.log('查询本周失败', e);
  }
};

// ================= 进入历史考勤页面 =================
const goHistory = () => {
  console.log('进入历史考勤页面');
  router.push('/attendance/history');
};

// ================= 工具 =================

const formatTime = (time) => {
  if (!time) {
    return null;
  }

  return time.substring(11, 16);
};

const formatWorkMinutes = (minutes) => {
  if (minutes == null) {
    return '--';
  }

  const h = Math.floor(minutes / 60);

  const m = minutes % 60;

  return `${h}h ${m}m`;
};

const getWeekName = (date) => {
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return weeks[new Date(date).getDay()];
};

// ================= 生命周期 =================

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>
<style>
/* 针对 Element Plus 输入框的微调 */
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
