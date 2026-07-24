<template>
  <div
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
        <p class="text-xs text-gray-400">© 2026 龍華考勤系统</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User } from '@element-plus/icons-vue';
import request from '@/api/request';

const router = useRouter();

// 👇 登录页只需要这两个响应式变量
const employeeNo = ref('');
const loading = ref(false);

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

    // 如果后端返回 code 500 或没有 data，说明登录失败
    if (res.data.code === 500 || !res.data.data) {
      ElMessage.error(res.data.message || '员工号不存在');
      return;
    }

    // 👇 核心：直接从 res.data.data 中取出信息，存入 localStorage
    const userData = res.data.data;

    localStorage.setItem('token', userData.token);
    localStorage.setItem('employeeId', userData.id);
    localStorage.setItem('employeeName', userData.name);
    localStorage.setItem('department', userData.department || '员工');
    localStorage.setItem('role', userData.role);

    ElMessage.success(`欢迎 ${userData.name}`);

    // 👇 登录成功，跳转到主页
    router.push('/');
  } catch (error) {
    console.error('登录失败:', error);
    ElMessage.error('登录失败，请检查网络或联系管理员');
  } finally {
    loading.value = false;
  }
};
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
