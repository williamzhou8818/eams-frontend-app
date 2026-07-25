<template>
  <div>
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <h2 class="text-xl md:text-2xl font-bold text-gray-800">工资管理</h2>

      <!-- 核心操作区：选择月份并一键计算 -->
      <div class="flex gap-3">
        <el-date-picker
          v-model="calcMonth"
          type="month"
          placeholder="选择计算月份"
          value-format="YYYY-MM"
          class="!w-40"
        />
        <el-button
          type="warning"
          :icon="Cpu"
          @click="handleCalculate"
          :loading="isCalculating"
        >
          一键计算工资
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <el-card class="!rounded-xl !border-0 shadow-sm mb-4">
      <el-input
        v-model="keyword"
        placeholder="搜索员工姓名或工号..."
        :prefix-icon="Search"
        clearable
        @keyup.enter="loadData"
        @clear="loadData"
        class="!w-full sm:!w-80"
      />
    </el-card>

    <!-- 工资列表 -->
    <el-card class="!rounded-xl !border-0 shadow-sm" v-loading="isLoading">
      <el-table :data="tableData" stripe style="width: 100%" border>
        <el-table-column prop="employeeNo" label="工号" width="120" />
        <el-table-column prop="employeeName" label="姓名" width="120" />
        <el-table-column prop="salaryMonth" label="月份" width="120" />
        <el-table-column
          prop="workingDays"
          label="出勤(天)"
          width="100"
          align="center"
        />

        <el-table-column label="基本工资" width="120" align="right">
          <template #default="{ row }">¥{{ row.baseSalary }}</template>
        </el-table-column>
        <el-table-column label="加班费" width="120" align="right">
          <template #default="{ row }" class="text-green-600"
            >+¥{{ row.overtimePay }}</template
          >
        </el-table-column>
        <el-table-column label="迟到扣款" width="120" align="right">
          <template #default="{ row }" class="text-red-600"
            >-¥{{ row.lateDeduction }}</template
          >
        </el-table-column>

        <el-table-column label="实发工资" min-width="150" align="right">
          <template #default="{ row }">
            <span class="font-bold text-lg text-blue-600"
              >¥{{ row.actualSalary }}</span
            >
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right" align="center">
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

      <!-- 分页 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Search, Cpu } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/api/request';

const isLoading = ref(false);
const isCalculating = ref(false);
const keyword = ref('');
const calcMonth = ref(new Date().toISOString().slice(0, 7)); // 默认当前月份
const month = ref(new Date().toISOString().slice(0, 7)); // 列表默认查询当前月

const tableData = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

// 加载工资列表
const loadData = async () => {
  isLoading.value = true;
  try {
    const res = await request.get('/api/admin/salary', {
      params: {
        keyword: keyword.value,
        month: month.value,
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

// 一键计算工资
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
      params: { month: calcMonth.value },
    });

    if (res.data.code === 200) {
      ElMessage.success(`${calcMonth.value} 月份工资计算完成！`);
      // 计算完成后，自动将列表切换到该月份并刷新
      month.value = calcMonth.value;
      page.value = 1;
      loadData();
    } else {
      ElMessage.error(res.data.message || '计算失败');
    }
  } catch (e) {
    // 用户取消或网络错误
  } finally {
    isCalculating.value = false;
  }
};

// 导出明细 (占位功能，后续可接入 Excel 导出)
const handleExport = (row) => {
  ElMessage.info(
    `导出 ${row.employeeName} 的 ${row.salaryMonth} 工资条功能开发中...`,
  );
};

onMounted(() => {
  loadData();
});
</script>
