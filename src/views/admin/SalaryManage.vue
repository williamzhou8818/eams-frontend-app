<template>
  <div class="p-4 md:p-6">
    <!-- 顶部标题与操作区 -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <h2
        class="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2"
      >
        <el-icon class="text-amber-500"><Money /></el-icon>
        工资管理
      </h2>

      <!-- 核心操作区：移动端占满宽度，PC端自适应 -->
      <div class="flex gap-3 w-full sm:w-auto">
        <el-date-picker
          v-model="calcMonth"
          type="month"
          placeholder="选择计算月份"
          value-format="YYYY-MM"
          :size="compSize"
          class="!flex-1 sm:!w-40"
        />
        <el-button
          type="warning"
          :icon="Cpu"
          @click="handleCalculate"
          :loading="isCalculating"
          :size="compSize"
          class="!flex-1 sm:!flex-none"
        >
          一键计算
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <el-card
      class="!rounded-xl !border-0 shadow-sm mb-4"
      :body-style="{ padding: isMobile ? '14px' : '20px' }"
    >
      <el-input
        v-model="keyword"
        placeholder="搜索员工姓名或工号..."
        :prefix-icon="Search"
        clearable
        :size="compSize"
        @keyup.enter="loadData"
        @clear="loadData"
        class="!w-full sm:!w-80"
      />
    </el-card>

    <!-- 工资列表 -->
    <el-card
      class="!rounded-xl !border-0 shadow-sm"
      :body-style="{ padding: isMobile ? '14px' : '20px' }"
      v-loading="isLoading"
    >
      <!-- 🖥️ PC端：传统表格 (包含缺勤扣款列) -->
      <el-table
        v-if="!isMobile"
        :data="tableData"
        stripe
        style="width: 100%"
        border
      >
        <el-table-column prop="employeeNo" label="工号" width="120" />
        <el-table-column prop="employeeName" label="姓名" width="120" />
        <el-table-column prop="salaryMonth" label="月份" width="110" />
        <el-table-column
          prop="workingDays"
          label="出勤(天)"
          width="90"
          align="center"
        />

        <el-table-column label="基本工资" width="120" align="right">
          <template #default="{ row }"
            >¥{{ formatMoney(row.baseSalary) }}</template
          >
        </el-table-column>
        <el-table-column label="加班费" width="110" align="right">
          <template #default="{ row }">
            <span class="text-emerald-600"
              >+¥{{ formatMoney(row.overtimePay) }}</span
            >
          </template>
        </el-table-column>
        <el-table-column label="迟到扣款" width="110" align="right">
          <template #default="{ row }">
            <span class="text-rose-500"
              >-¥{{ formatMoney(row.lateDeduction) }}</span
            >
          </template>
        </el-table-column>
        <!-- 缺勤扣款列 -->
        <el-table-column label="缺勤扣款" width="110" align="right">
          <template #default="{ row }">
            <span class="text-rose-500"
              >-¥{{ formatMoney(row.absentDeduction) }}</span
            >
          </template>
        </el-table-column>

        <el-table-column label="实发工资" min-width="140" align="right">
          <template #default="{ row }">
            <span class="font-bold text-lg text-blue-600"
              >¥{{ formatMoney(row.actualSalary) }}</span
            >
          </template>
        </el-table-column>

        <el-table-column label="操作" width="110" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleExport(row)"
            >
              导出明细
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 📱 移动端：财务卡片视图 -->
      <div v-else class="space-y-3">
        <div
          v-for="row in tableData"
          :key="row.id"
          class="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <!-- 头部：员工信息 + 醒目的实发工资 -->
          <div class="flex justify-between items-start mb-3">
            <div>
              <div class="font-bold text-gray-800 text-base">
                {{ row.employeeName }}
              </div>
              <div class="text-xs text-gray-400 mt-1">
                {{ row.employeeNo }} · {{ row.salaryMonth }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-500">实发工资</div>
              <div class="text-xl font-bold text-blue-600 tabular-nums">
                ¥{{ formatMoney(row.actualSalary) }}
              </div>
            </div>
          </div>

          <!-- 明细：网格布局展示各项收支 -->
          <div
            class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-gray-200 pt-3"
          >
            <div class="flex justify-between">
              <span class="text-gray-500">出勤天数</span>
              <span class="text-gray-800 font-medium"
                >{{ row.workingDays }} 天</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">基本工资</span>
              <span class="text-gray-800 font-medium"
                >¥{{ formatMoney(row.baseSalary) }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-emerald-600">+ 加班费</span>
              <span class="text-emerald-600 font-medium"
                >¥{{ formatMoney(row.overtimePay) }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-rose-500">- 迟到扣款</span>
              <span class="text-rose-500 font-medium"
                >¥{{ formatMoney(row.lateDeduction) }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-rose-500">- 缺勤扣款</span>
              <span class="text-rose-500 font-medium"
                >¥{{ formatMoney(row.absentDeduction) }}</span
              >
            </div>
          </div>

          <!-- 底部操作 -->
          <div class="mt-3 flex justify-end">
            <el-button
              type="primary"
              plain
              size="small"
              @click="handleExport(row)"
              >导出工资条</el-button
            >
          </div>
        </div>

        <el-empty
          v-if="tableData.length === 0 && !isLoading"
          description="暂无工资数据"
          :image-size="70"
        />
      </div>

      <!-- 分页器：移动端精简 -->
      <div class="flex justify-center sm:justify-end mt-4 md:mt-6">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          :layout="
            isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next'
          "
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Search, Cpu, Money } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/api/request';

// ========== 响应式状态 ==========
const isMobile = ref(false);
const compSize = computed(() => (isMobile.value ? 'large' : 'default'));
const checkMobile = () => {
  isMobile.value = window.innerWidth < 640;
};

const isLoading = ref(false);
const isCalculating = ref(false);
const keyword = ref('');
const calcMonth = ref(new Date().toISOString().slice(0, 7));
const month = ref(new Date().toISOString().slice(0, 7));

const tableData = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

// ========== 工具函数：金额格式化 ==========
const formatMoney = (val) => {
  if (val === null || val === undefined || val === '') return '0.00';
  return Number(val).toFixed(2);
};

// ========== 加载工资列表 ==========
const loadData = async () => {
  isLoading.value = true;
  try {
    const res = await request.get('/api/admin/salary', {
      params: {
        keyword: keyword.value,
        month: month.value, // 👈 已修正：与后端 @RequestParam String month 保持一致
        page: page.value,
        pageSize: pageSize.value,
      },
    });
    if (res.data.code === 200) {
      tableData.value = res.data.data.list;
      total.value = res.data.data.total;
    } else {
      ElMessage.error(res.data.message || '加载失败');
    }
  } catch (error) {
    ElMessage.error('加载工资列表失败');
  } finally {
    isLoading.value = false;
  }
};

// ========== 一键计算工资 ==========
const handleCalculate = async () => {
  if (!calcMonth.value) {
    ElMessage.warning('请先选择要计算的月份');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要计算 ${calcMonth.value} 月份的全公司工资吗？\n系统将根据考勤记录自动核算，已计算过的员工不会重复计算。`,
      '工资计算确认',
      {
        type: 'warning',
        confirmButtonText: '开始计算',
        cancelButtonText: '取消',
      },
    );

    isCalculating.value = true;
    const res = await request.post('/api/admin/salary/calculate', null, {
      params: { month: calcMonth.value }, // 👈 已修正：与后端 @RequestParam String month 保持一致
    });

    if (res.data.code === 200) {
      ElMessage.success(`${calcMonth.value} 月份工资计算完成！`);
      month.value = calcMonth.value;
      page.value = 1;
      loadData();
    } else {
      ElMessage.error(res.data.message || '计算失败');
    }
  } catch (e) {
    // 用户取消
  } finally {
    isCalculating.value = false;
  }
};

// ========== 导出明细 ==========
const handleExport = (row) => {
  ElMessage.info(
    `导出 ${row.employeeName} 的 ${row.salaryMonth} 工资条功能开发中...`,
  );
};

// ========== 生命周期 ==========
onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  loadData();
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>
