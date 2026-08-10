<template>
  <div class="p-4 md:p-6">
    <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
      考勤管理 (HR 补签/修改)
    </h2>

    <!-- 搜索栏 -->
    <el-card
      class="!rounded-2xl !border-0 shadow-sm mb-4"
      :body-style="{ padding: isMobile ? '14px' : '20px' }"
    >
      <div
        class="flex flex-col gap-2.5 w-full sm:flex-row sm:items-center sm:gap-3"
      >
        <el-input
          v-model="keyword"
          placeholder="搜索员工姓名或工号..."
          :prefix-icon="Search"
          clearable
          :size="compSize"
          class="!w-full sm:!w-64"
          @keyup.enter="loadData"
          @clear="loadData"
        />
        <el-date-picker
          v-model="month"
          type="month"
          placeholder="选择月份"
          :size="compSize"
          @change="loadData"
          class="!w-full sm:!w-48"
          value-format="YYYY-MM"
        />

        <!-- 按钮区 -->
        <div class="btn-area">
          <el-button
            type="primary"
            :icon="Search"
            :size="compSize"
            :loading="isQuerying"
            class="btn-query !rounded-xl"
            @click="loadData"
          >
            查询
          </el-button>
          <el-button
            type="warning"
            plain
            :icon="Plus"
            :size="compSize"
            class="!rounded-xl"
            @click="openAddDialog"
          >
            补签
          </el-button>
          <el-button
            type="success"
            plain
            :icon="Download"
            :size="compSize"
            :loading="isExporting"
            class="!rounded-xl"
            @click="handleExport"
          >
            导出 Excel
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 数据展示区 -->
    <el-card
      class="!rounded-2xl !border-0 shadow-sm"
      :body-style="{ padding: isMobile ? '10px 14px' : '20px' }"
      v-loading="isLoading"
    >
      <!-- 🖥️ PC端：表格 -->
      <el-table v-if="!isMobile" :data="tableData" stripe style="width: 100%">
        <el-table-column prop="workDate" label="日期" width="120" />
        <el-table-column prop="employeeName" label="姓名" width="100" />
        <el-table-column prop="employeeNo" label="工号" width="120" />
        <el-table-column label="上班时间" width="140">
          <template #default="{ row }">{{ fmtTime(row.checkInTime) }}</template>
        </el-table-column>
        <el-table-column label="下班时间" width="140">
          <template #default="{ row }">{{
            fmtTime(row.checkOutTime)
          }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : 'warning'"
              size="small"
              round
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
              :icon="EditPen"
              @click="openEditDialog(row)"
            >
              修改
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 📱 移动端：紧凑单行列表 -->
      <div v-else>
        <div
          class="flex items-center gap-4 px-1 py-2 text-xs text-slate-400 border-b border-gray-100"
        >
          <span class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>正常
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-orange-400"></span
            >异常/补签
          </span>
        </div>

        <div class="divide-y divide-gray-50">
          <div
            v-for="row in tableData"
            :key="row.id"
            class="flex items-center gap-2 py-2"
          >
            <span
              class="w-1.5 h-1.5 rounded-full shrink-0"
              :class="row.status === 1 ? 'bg-emerald-400' : 'bg-orange-400'"
            ></span>
            <span
              class="w-16 shrink-0 text-sm font-medium text-slate-800 truncate"
              >{{ row.employeeName }}</span
            >
            <span class="w-10 shrink-0 text-xs text-slate-400 tabular-nums">{{
              row.workDate.substring(5)
            }}</span>
            <span class="flex-1 text-right text-xs tabular-nums text-slate-600">
              {{ fmtTime(row.checkInTime) }} /
              <span :class="row.checkOutTime ? '' : 'text-rose-500'">{{
                fmtTime(row.checkOutTime)
              }}</span>
            </span>
            <el-button
              type="primary"
              link
              size="small"
              @click="openEditDialog(row)"
              >修改</el-button
            >
          </div>
        </div>

        <el-empty
          v-if="tableData.length === 0 && !isLoading"
          description="暂无考勤数据"
          :image-size="70"
        />
      </div>

      <div class="flex justify-center sm:justify-end mt-3 md:mt-6">
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

    <!-- 修改考勤对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="修改考勤"
      :width="isMobile ? '92%' : '450px'"
      destroy-on-close
    >
      <el-form
        :model="editForm"
        :label-width="isMobile ? 'auto' : '90px'"
        :label-position="isMobile ? 'top' : 'right'"
        class="mt-2"
      >
        <el-form-item label="员工">
          <span class="text-gray-700 font-medium"
            >{{ editForm.employeeName }} ({{ editForm.employeeNo }})</span
          >
        </el-form-item>
        <el-form-item label="日期">
          <span class="text-gray-700 font-medium">{{ editForm.workDate }}</span>
        </el-form-item>
        <el-form-item label="上班时间">
          <el-time-picker
            v-model="editForm.checkInTimeStr"
            format="HH:mm"
            value-format="HH:mm:ss"
            placeholder="选择时间"
            :size="compSize"
            class="!w-full"
          />
        </el-form-item>
        <el-form-item label="下班时间">
          <el-time-picker
            v-model="editForm.checkOutTimeStr"
            format="HH:mm"
            value-format="HH:mm:ss"
            placeholder="选择时间"
            :size="compSize"
            class="!w-full"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status" :size="compSize" class="!w-full">
            <el-option label="正常" :value="1" />
            <el-option label="异常/补签" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false" :disabled="submitting"
          >取消</el-button
        >
        <el-button
          type="primary"
          @click="handleEditSubmit"
          :loading="submitting"
          >确认修改</el-button
        >
      </template>
    </el-dialog>

    <!-- 补签考勤对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="补签考勤"
      :width="isMobile ? '92%' : '500px'"
      destroy-on-close
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        :label-width="isMobile ? 'auto' : '90px'"
        :label-position="isMobile ? 'top' : 'right'"
        class="mt-2"
      >
        <el-form-item label="员工" prop="employeeId">
          <el-select
            v-model="addForm.employeeId"
            filterable
            remote
            reserve-keyword
            placeholder="请输入员工姓名或工号搜索"
            :remote-method="searchEmployees"
            :loading="employeeSearchLoading"
            :size="compSize"
            class="!w-full"
          >
            <el-option
              v-for="emp in employeeOptions"
              :key="emp.id"
              :label="`${emp.name} (${emp.employeeNo})`"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="补签日期" prop="workDate">
          <el-date-picker
            v-model="addForm.workDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledFutureDate"
            :size="compSize"
            class="!w-full"
          />
        </el-form-item>
        <el-form-item label="上班时间" prop="checkInTime">
          <el-time-picker
            v-model="addForm.checkInTime"
            format="HH:mm"
            value-format="HH:mm:ss"
            placeholder="选择上班时间"
            :size="compSize"
            class="!w-full"
          />
        </el-form-item>
        <el-form-item label="下班时间" prop="checkOutTime">
          <el-time-picker
            v-model="addForm.checkOutTime"
            format="HH:mm"
            value-format="HH:mm:ss"
            placeholder="选择下班时间"
            :size="compSize"
            class="!w-full"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="addForm.status" :size="compSize" class="!w-full">
            <el-option label="正常" :value="1" />
            <el-option label="异常/补签" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="补签原因" prop="reason">
          <el-input
            v-model="addForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入补签原因（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false" :disabled="submitting"
          >取消</el-button
        >
        <el-button type="warning" @click="handleAddSubmit" :loading="submitting"
          >确认补签</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { Search, Download, Plus, EditPen } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/api/request';

// ========== 响应式状态 ==========
const isMobile = ref(false);
const compSize = computed(() => (isMobile.value ? 'large' : 'default'));

const isLoading = ref(false);
const isQuerying = ref(false);
const isExporting = ref(false);
const submitting = ref(false);

// ========== 列表数据 ==========
const keyword = ref('');
const month = ref(new Date().toISOString().slice(0, 7));
const tableData = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

// ========== 工具函数 ==========
// 兼容后端返回 "2026-08-10 09:00:00" 或 "2026-08-10T09:00:00" 格式
const fmtTime = (t) => {
  if (!t) return '--:--';
  const timePart = t.includes('T') ? t.split('T')[1] : t.substring(11);
  return timePart ? timePart.substring(0, 5) : '--:--';
};

// 只允许选择【今天】或【过去】的日期
const disabledFutureDate = (date) => {
  return date.getTime() > Date.now();
};

// ========== 修改对话框 ==========
const editDialogVisible = ref(false);
const editForm = ref({
  id: null,
  employeeName: '',
  employeeNo: '',
  workDate: '',
  checkInTimeStr: null,
  checkOutTimeStr: null,
  status: 1,
});

// ========== 补签对话框 ==========
const addDialogVisible = ref(false);
const addFormRef = ref(null);
const employeeSearchLoading = ref(false);
const employeeOptions = ref([]);
const addForm = reactive({
  employeeId: null,
  workDate: '',
  checkInTime: null, // 👈 优化：改为 null 避免 TimePicker 警告
  checkOutTime: null, // 👈 优化：改为 null
  status: 0,
  reason: '',
});

const addFormRules = {
  employeeId: [{ required: true, message: '请选择员工', trigger: 'change' }],
  workDate: [{ required: true, message: '请选择补签日期', trigger: 'change' }],
  checkInTime: [
    { required: true, message: '请选择上班时间', trigger: 'change' },
  ],
  checkOutTime: [
    { required: true, message: '请选择下班时间', trigger: 'change' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

// ========== 屏幕尺寸监听 ==========
const checkMobile = () => {
  isMobile.value = window.innerWidth < 640;
};

// ========== 加载考勤列表 ==========
const loadData = async () => {
  isLoading.value = true;
  isQuerying.value = true;
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
    isQuerying.value = false;
  }
};

// ========== 搜索员工（补签用） ==========
const searchEmployees = async (query) => {
  if (!query) {
    employeeOptions.value = [];
    return;
  }
  employeeSearchLoading.value = true;
  try {
    // 👇 修改：调用后端现有的分页查询接口，传入 keyword，并限制 pageSize 为 50
    const res = await request.get('/api/admin/employees', {
      params: { keyword: query, page: 1, pageSize: 50 },
    });
    if (res.data.code === 200) {
      // 👇 修改：从分页结果中提取数组 (兼容 VO 里叫 list 或 records 的情况)
      const data = res.data.data;
      employeeOptions.value = data.list || data.records || [];
    }
  } catch (error) {
    console.error('搜索员工失败:', error);
  } finally {
    employeeSearchLoading.value = false;
  }
};

// ========== 补签 ==========
const openAddDialog = () => {
  addForm.employeeId = null;
  addForm.workDate = '';
  addForm.checkInTime = null; // 👈 同步修改为 null
  addForm.checkOutTime = null; // 👈 同步修改为 null
  addForm.status = 0;
  addForm.reason = '';
  employeeOptions.value = [];
  addDialogVisible.value = true;
};

const handleAddSubmit = async () => {
  if (!addFormRef.value) return;

  await addFormRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      submitting.value = true;

      // 防重复补签检查 (GET 请求，参数名与后端 Attendance 属性名一致)
      const checkRes = await request.get('/api/admin/attendance/check', {
        params: {
          employeeId: addForm.employeeId,
          workDate: addForm.workDate,
        },
      });
      if (checkRes.data.code === 200 && checkRes.data.data.exists) {
        ElMessage.warning('该员工在此日期已有考勤记录，请使用修改功能');
        return;
      }

      // 组装 payload (POST 请求，直接映射到后端 Attendance 对象)
      const payload = {
        employeeId: addForm.employeeId,
        workDate: addForm.workDate,
        checkInTime: addForm.checkInTime
          ? `${addForm.workDate} ${addForm.checkInTime}`
          : null,
        checkOutTime: addForm.checkOutTime
          ? `${addForm.workDate} ${addForm.checkOutTime}`
          : null,
        status: addForm.status,
        reason: addForm.reason,
      };

      const res = await request.post('/api/admin/attendance', payload);
      if (res.data.code === 200) {
        ElMessage.success('补签成功');
        addDialogVisible.value = false;
        loadData();
      } else {
        ElMessage.error(res.data.message || '补签失败');
      }
    } catch (error) {
      ElMessage.error('补签失败');
      console.error(error);
    } finally {
      submitting.value = false;
    }
  });
};

// ========== 修改 ==========
const openEditDialog = (row) => {
  editForm.value = {
    id: row.id,
    employeeName: row.employeeName,
    employeeNo: row.employeeNo,
    workDate: row.workDate,
    checkInTimeStr: row.checkInTime ? fmtTime(row.checkInTime) + ':00' : null,
    checkOutTimeStr: row.checkOutTime
      ? fmtTime(row.checkOutTime) + ':00'
      : null,
    status: row.status,
  };
  editDialogVisible.value = true;
};

const handleEditSubmit = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要修改该员工的考勤记录吗？此操作将被记录在操作日志中。',
      '警告',
      { type: 'warning' },
    );
    submitting.value = true;

    const payload = {
      checkInTime: editForm.value.checkInTimeStr
        ? `${editForm.value.workDate} ${editForm.value.checkInTimeStr}`
        : null,
      checkOutTime: editForm.value.checkOutTimeStr
        ? `${editForm.value.workDate} ${editForm.value.checkOutTimeStr}`
        : null,
      status: editForm.value.status,
    };

    const res = await request.put(
      `/api/admin/attendance/${editForm.value.id}`,
      payload,
    );
    if (res.data.code === 200) {
      ElMessage.success('修改成功，已记录操作日志');
      editDialogVisible.value = false;
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

// ========== 导出 Excel ==========
const handleExport = async () => {
  isExporting.value = true;
  try {
    const res = await request({
      url: '/api/admin/attendance/export',
      method: 'get',
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    link.setAttribute('download', `龍華合同会社出勤管理表_${dateStr}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
  } catch (err) {
    ElMessage.error('导出失败');
    console.error(err);
  } finally {
    isExporting.value = false;
  }
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

<style scoped>
.btn-area {
  display: flex;
  gap: 12px;
}
.btn-area :deep(.el-button + .el-button) {
  margin-left: 0;
}
@media (max-width: 639px) {
  .btn-area {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
  }
  .btn-area .btn-query {
    grid-column: 1 / -1;
  }
  .btn-area :deep(.el-button) {
    width: 100%;
  }
}
</style>
