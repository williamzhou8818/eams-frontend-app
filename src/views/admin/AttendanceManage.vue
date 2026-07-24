<template>
  <div>
    <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-6">
      考勤管理 (HR 补签/修改)
    </h2>

    <!-- 搜索栏 -->
    <el-card class="!rounded-xl !border-0 shadow-sm mb-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <el-input
          v-model="keyword"
          placeholder="搜索员工姓名或工号..."
          :prefix-icon="Search"
          clearable
          class="sm:w-64"
          @keyup.enter="loadData"
          @clear="loadData"
        />
        <el-date-picker
          v-model="month"
          type="month"
          placeholder="选择月份"
          @change="loadData"
          class="sm:w-48"
          value-format="YYYY-MM"
        />
        <el-button type="primary" :icon="Search" @click="loadData"
          >查询</el-button
        >
        <el-button type="success" :icon="Download" @click="handleExport"
          >导出 Excel</el-button
        >
      </div>
    </el-card>

    <!-- 考勤列表 -->
    <el-card class="!rounded-xl !border-0 shadow-sm" v-loading="isLoading">
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="workDate" label="日期" width="120" />
        <el-table-column prop="employeeName" label="姓名" width="100" />
        <el-table-column prop="employeeNo" label="工号" width="120" />
        <el-table-column label="上班时间" width="140">
          <template #default="{ row }">{{
            row.checkInTime ? row.checkInTime.substring(11, 16) : '--:--'
          }}</template>
        </el-table-column>
        <el-table-column label="下班时间" width="140">
          <template #default="{ row }">{{
            row.checkOutTime ? row.checkOutTime.substring(11, 16) : '--:--'
          }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : 'warning'"
              size="small"
            >
              {{ row.status === 1 ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="openEditDialog(row)"
              >修改/补签</el-button
            >
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 修改考勤对话框 -->
    <el-dialog v-model="dialogVisible" title="修改/补签考勤" width="450px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="员工">
          <span class="text-gray-600"
            >{{ form.employeeName }} ({{ form.employeeNo }})</span
          >
        </el-form-item>
        <el-form-item label="日期">
          <span class="text-gray-600">{{ form.workDate }}</span>
        </el-form-item>
        <el-form-item label="上班时间">
          <el-time-picker
            v-model="form.checkInTimeStr"
            format="HH:mm"
            value-format="HH:mm:ss"
            placeholder="选择时间"
            class="!w-full"
          />
        </el-form-item>
        <el-form-item label="下班时间">
          <el-time-picker
            v-model="form.checkOutTimeStr"
            format="HH:mm"
            value-format="HH:mm:ss"
            placeholder="选择时间"
            class="!w-full"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" class="!w-full">
            <el-option label="正常" :value="1" />
            <el-option label="异常/补签" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting"
          >确认修改</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Search, Download } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/api/request';

const isLoading = ref(false);
const submitting = ref(false);
const keyword = ref('');
const month = ref(new Date().toISOString().slice(0, 7)); // 默认当前月份，格式 YYYY-MM
const tableData = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const dialogVisible = ref(false);
const form = ref({
  id: null,
  employeeName: '',
  employeeNo: '',
  workDate: '',
  checkInTimeStr: null,
  checkOutTimeStr: null,
  status: 1,
});

const loadData = async () => {
  isLoading.value = true;
  try {
    const res = await request.get('/api/admin/attendance', {
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
    ElMessage.error('加载考勤列表失败');
  } finally {
    isLoading.value = false;
  }
};

const openEditDialog = (row) => {
  form.value = {
    id: row.id,
    employeeName: row.employeeName,
    employeeNo: row.employeeNo,
    workDate: row.workDate,
    // 截取 HH:mm:ss 部分给时间选择器
    checkInTimeStr: row.checkInTime ? row.checkInTime.substring(11, 19) : null,
    checkOutTimeStr: row.checkOutTime
      ? row.checkOutTime.substring(11, 19)
      : null,
    status: row.status,
  };
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要修改该员工的考勤记录吗？此操作将被记录在操作日志中。',
      '警告',
      { type: 'warning' },
    );
    submitting.value = true;

    // 组装提交数据：将日期和时间拼接成完整的 Timestamp 字符串 (YYYY-MM-DD HH:mm:ss)
    const payload = {
      checkInTime: form.value.checkInTimeStr
        ? `${form.value.workDate} ${form.value.checkInTimeStr}`
        : null,
      checkOutTime: form.value.checkOutTimeStr
        ? `${form.value.workDate} ${form.value.checkOutTimeStr}`
        : null,
      status: form.value.status,
    };

    const res = await request.put(
      `/api/admin/attendance/${form.value.id}`,
      payload,
    );
    if (res.data.code === 200) {
      ElMessage.success('修改成功，已记录操作日志');
      dialogVisible.value = false;
      loadData();
    } else {
      ElMessage.error(res.data.message || '修改失败');
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('修改失败');
  } finally {
    submitting.value = false;
  }
};

const handleExport = () => {
  // 核心技巧：对于文件下载，直接使用 window.open 或创建一个隐藏的 a 标签点击是最简单有效的
  // 因为我们的接口需要携带 Token，所以不能直接用 window.open，需要用 axios 获取 blob 流

  request({
    url: '/api/admin/attendance/export',
    method: 'get',
    responseType: 'blob', // 👈 关键：告诉 axios 我们要接收二进制文件流
  })
    .then((res) => {
      // 创建一个隐藏的 a 标签来触发下载
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '考勤数据导出.xlsx'); // 下载的文件名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // 下载完移除标签

      ElMessage.success('导出成功');
    })
    .catch((err) => {
      ElMessage.error('导出失败');
      console.error(err);
    });
};
onMounted(() => {
  loadData();
});
</script>
