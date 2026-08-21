<template>
  <div class="attendance-page p-4 md:p-6">
    <!-- ==================== 页面标题 ==================== -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 md:mb-6"
    >
      <div>
        <h2 class="text-xl md:text-2xl font-bold text-gray-800">考勤管理</h2>

        <p class="text-xs md:text-sm text-gray-400 mt-1">
          HR 补签 / 修改 / 查询 / 导出
        </p>
      </div>
    </div>

    <!-- ==================== 搜索栏 ==================== -->
    <el-card
      class="!rounded-2xl !border-0 shadow-sm mb-4"
      :body-style="{ padding: isMobile ? '14px' : '20px' }"
    >
      <div
        class="flex flex-col gap-2.5 w-full sm:flex-row sm:items-center sm:gap-3"
      >
        <!-- 员工搜索 -->
        <el-input
          v-model="keyword"
          placeholder="搜索员工姓名或工号..."
          :prefix-icon="Search"
          clearable
          :size="compSize"
          class="!w-full sm:!w-64"
          @keyup.enter="handleQuery"
          @clear="handleQuery"
        />

        <!-- 月份 -->
        <el-date-picker
          v-model="month"
          type="month"
          placeholder="选择月份"
          :size="compSize"
          value-format="YYYY-MM"
          class="!w-full sm:!w-48"
          @change="handleQuery"
        />

        <!-- 按钮区域 -->
        <div class="btn-area">
          <!-- 查询 -->
          <el-button
            type="primary"
            :icon="Search"
            :size="compSize"
            :loading="isQuerying"
            class="btn-query !rounded-xl"
            @click="handleQuery"
          >
            查询
          </el-button>

          <!-- 补签 -->
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

          <!-- 导出 -->
          <el-button
            type="success"
            plain
            :icon="Download"
            :size="compSize"
            :loading="isExporting"
            class="btn-export !rounded-xl"
            @click="handleExport"
          >
            {{ isExporting ? '导出中...' : '导出 Excel' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- ==================== 数据展示 ==================== -->
    <el-card
      class="!rounded-2xl !border-0 shadow-sm"
      :body-style="{ padding: isMobile ? '10px 14px' : '20px' }"
      v-loading="isLoading"
    >
      <!-- ========================================================= -->
      <!-- PC：表格 -->
      <!-- ========================================================= -->
      <el-table
        v-if="!isMobile"
        :data="tableData"
        stripe
        border
        style="width: 100%"
        empty-text="暂无考勤数据"
      >
        <!-- 日期 -->
        <el-table-column prop="workDate" label="日期" min-width="120" />

        <!-- 姓名 -->
        <el-table-column prop="employeeName" label="姓名" min-width="100" />

        <!-- 工号 -->
        <el-table-column prop="employeeNo" label="工号" min-width="120" />

        <!-- 上班 -->
        <el-table-column label="上班时间" min-width="120">
          <template #default="{ row }">
            {{ fmtTime(row.checkInTime) }}
          </template>
        </el-table-column>

        <!-- 下班 -->
        <el-table-column label="下班时间" min-width="120">
          <template #default="{ row }">
            {{ fmtTime(row.checkOutTime) }}
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small" round>
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作 -->
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

      <!-- ========================================================= -->
      <!-- 手机：列表 -->
      <!-- ========================================================= -->
      <div v-else>
        <!-- 状态说明 -->
        <div
          class="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 py-2 text-xs text-slate-400 border-b border-gray-100"
        >
          <span class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            正常
          </span>

          <span class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
            迟到/早退
          </span>

          <span class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            迟到+早退
          </span>
        </div>

        <!-- 列表 -->
        <div class="divide-y divide-gray-50">
          <div
            v-for="row in tableData"
            :key="row.id"
            class="flex items-center gap-2 py-3"
          >
            <!-- 状态点 -->
            <span
              class="w-1.5 h-1.5 rounded-full shrink-0"
              :class="getStatusDotClass(row.status)"
            ></span>

            <!-- 姓名 -->
            <span
              class="w-16 shrink-0 text-sm font-medium text-slate-800 truncate"
            >
              {{ row.employeeName || '--' }}
            </span>

            <!-- 日期 -->
            <span class="w-11 shrink-0 text-xs text-slate-400 tabular-nums">
              {{ formatMobileDate(row.workDate) }}
            </span>

            <!-- 时间 -->
            <span
              class="flex-1 text-right text-xs tabular-nums text-slate-600 whitespace-nowrap"
            >
              {{ fmtTime(row.checkInTime) }}

              <span class="mx-0.5 text-gray-300">/</span>

              <span :class="row.checkOutTime ? '' : 'text-rose-500'">
                {{ fmtTime(row.checkOutTime) }}
              </span>
            </span>

            <!-- 修改 -->
            <el-button
              type="primary"
              link
              size="small"
              @click="openEditDialog(row)"
            >
              修改
            </el-button>
          </div>
        </div>

        <!-- 空数据 -->
        <el-empty
          v-if="tableData.length === 0 && !isLoading"
          description="暂无考勤数据"
          :image-size="70"
        />
      </div>

      <!-- ==================== 分页 ==================== -->
      <div
        class="flex justify-center sm:justify-end mt-3 md:mt-6 overflow-x-auto"
      >
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          :layout="
            isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next'
          "
          @size-change="handlePageSizeChange"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- ========================================================= -->
    <!-- 修改考勤 -->
    <!-- ========================================================= -->
    <el-dialog
      v-model="editDialogVisible"
      title="修改考勤"
      :width="isMobile ? '92%' : '450px'"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        :model="editForm"
        :label-width="isMobile ? 'auto' : '90px'"
        :label-position="isMobile ? 'top' : 'right'"
        class="mt-2"
      >
        <!-- 员工 -->
        <el-form-item label="员工">
          <span class="text-gray-700 font-medium">
            {{ editForm.employeeName || '--' }}
            ({{ editForm.employeeNo || '--' }})
          </span>
        </el-form-item>

        <!-- 日期 -->
        <el-form-item label="日期">
          <span class="text-gray-700 font-medium">
            {{ editForm.workDate || '--' }}
          </span>
        </el-form-item>

        <!-- 上班 -->
        <el-form-item label="上班时间">
          <el-time-picker
            v-model="editForm.checkInTimeStr"
            format="HH:mm"
            value-format="HH:mm:ss"
            placeholder="选择时间"
            :size="compSize"
            class="!w-full"
            clearable
          />
        </el-form-item>

        <!-- 下班 -->
        <el-form-item label="下班时间">
          <el-time-picker
            v-model="editForm.checkOutTimeStr"
            format="HH:mm"
            value-format="HH:mm:ss"
            placeholder="选择时间"
            :size="compSize"
            class="!w-full"
            clearable
          />
        </el-form-item>

        <!-- 状态 -->
        <el-form-item label="状态">
          <el-tag :type="getStatusTagType(editForm.status)" size="large">
            {{ getStatusText(editForm.status) }}
          </el-tag>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false" :disabled="submitting">
          取消
        </el-button>

        <el-button
          type="primary"
          @click="handleEditSubmit"
          :loading="submitting"
        >
          确认修改
        </el-button>
      </template>
    </el-dialog>

    <!-- ========================================================= -->
    <!-- 补签 -->
    <!-- ========================================================= -->
    <el-dialog
      v-model="addDialogVisible"
      title="补签考勤"
      :width="isMobile ? '92%' : '500px'"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        :label-width="isMobile ? 'auto' : '90px'"
        :label-position="isMobile ? 'top' : 'right'"
        class="mt-2"
      >
        <!-- 员工 -->
        <el-form-item label="员工" prop="employeeId">
          <el-select
            v-model="addForm.employeeId"
            filterable
            remote
            reserve-keyword
            clearable
            placeholder="请输入员工姓名或工号搜索"
            :remote-method="searchEmployees"
            :loading="employeeSearchLoading"
            :size="compSize"
            class="!w-full"
            @clear="employeeOptions = []"
          >
            <el-option
              v-for="emp in employeeOptions"
              :key="emp.id"
              :label="`${emp.name} (${emp.employeeNo})`"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>

        <!-- 日期 -->
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

        <!-- 上班 -->
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

        <!-- 下班 -->
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

        <!-- 状态 -->
        <el-form-item label="状态" prop="status">
          <el-select v-model="addForm.status" :size="compSize" class="!w-full">
            <el-option label="正常" :value="1" />

            <el-option label="异常/补签" :value="0" />
          </el-select>
        </el-form-item>

        <!-- 原因 -->
        <el-form-item label="补签原因">
          <el-input
            v-model="addForm.reason"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入补签原因（选填）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false" :disabled="submitting">
          取消
        </el-button>

        <el-button
          type="warning"
          @click="handleAddSubmit"
          :loading="submitting"
        >
          确认补签
        </el-button>
      </template>
    </el-dialog>

    <!-- ========================================================= -->
    <!-- iOS 下载提示 -->
    <!-- ========================================================= -->
    <el-dialog
      v-model="iosDownloadDialogVisible"
      title="Excel 已准备完成"
      :width="isMobile ? '90%' : '420px'"
      :show-close="true"
    >
      <div class="text-center py-3">
        <div
          class="mx-auto mb-4 w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center"
        >
          <el-icon :size="28" class="text-green-500">
            <Download />
          </el-icon>
        </div>

        <p class="text-gray-700 font-medium">Excel 文件已经打开</p>

        <p class="text-gray-400 text-sm mt-2 leading-6">
          如果没有看到文件，请点击右上角分享按钮， 选择“存储到文件”即可保存
          Excel。
        </p>
      </div>

      <template #footer>
        <el-button
          type="primary"
          class="!rounded-xl"
          @click="iosDownloadDialogVisible = false"
        >
          知道了
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';

import { Search, Download, Plus, EditPen } from '@element-plus/icons-vue';

import { ElMessage, ElMessageBox } from 'element-plus';

import request from '@/api/request';

/* =========================================================
 * 响应式状态
 * ========================================================= */

const isMobile = ref(false);

const compSize = computed(() => {
  return isMobile.value ? 'large' : 'default';
});

const isLoading = ref(false);
const isQuerying = ref(false);
const isExporting = ref(false);
const submitting = ref(false);

/* =========================================================
 * 列表
 * ========================================================= */

const keyword = ref('');

const month = ref(getCurrentMonth());

const tableData = ref([]);

const total = ref(0);

const page = ref(1);

const pageSize = ref(10);

/* =========================================================
 * 修改
 * ========================================================= */

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

/* =========================================================
 * 补签
 * ========================================================= */

const addDialogVisible = ref(false);

const addFormRef = ref(null);

const employeeSearchLoading = ref(false);

const employeeOptions = ref([]);

const addForm = reactive({
  employeeId: null,
  workDate: '',
  checkInTime: null,
  checkOutTime: null,
  status: 0,
  reason: '',
});

const addFormRules = {
  employeeId: [
    {
      required: true,
      message: '请选择员工',
      trigger: 'change',
    },
  ],

  workDate: [
    {
      required: true,
      message: '请选择补签日期',
      trigger: 'change',
    },
  ],

  checkInTime: [
    {
      required: true,
      message: '请选择上班时间',
      trigger: 'change',
    },
  ],

  checkOutTime: [
    {
      required: true,
      message: '请选择下班时间',
      trigger: 'change',
    },
  ],

  status: [
    {
      required: true,
      message: '请选择状态',
      trigger: 'change',
    },
  ],
};

/* =========================================================
 * iOS 下载
 * ========================================================= */

const iosDownloadDialogVisible = ref(false);

/* =========================================================
 * 工具函数
 * ========================================================= */

function getCurrentMonth() {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}`;
}

/**
 * 格式化时间
 *
 * 兼容：
 *
 * 2026-08-10 09:00:00
 *
 * 以及：
 *
 * 2026-08-10T09:00:00
 */
const fmtTime = (time) => {
  if (!time) {
    return '--:--';
  }

  const str = String(time);

  let timePart = '';

  if (str.includes('T')) {
    timePart = str.split('T')[1];
  } else if (str.includes(' ')) {
    timePart = str.split(' ')[1];
  } else {
    timePart = str.substring(11);
  }

  if (!timePart) {
    return '--:--';
  }

  return timePart.substring(0, 5);
};

/**
 * 手机日期
 *
 * 2026-08-21
 * ↓
 * 08-21
 */
const formatMobileDate = (date) => {
  if (!date) {
    return '--';
  }

  const str = String(date);

  if (str.length >= 10) {
    return str.substring(5, 10);
  }

  return str;
};

/**
 * 未来日期不可选
 */
const disabledFutureDate = (date) => {
  const today = new Date();

  today.setHours(23, 59, 59, 999);

  return date.getTime() > today.getTime();
};

/* =========================================================
 * 状态
 * ========================================================= */

const getStatusText = (status) => {
  switch (Number(status)) {
    case 1:
      return '正常';

    case 2:
      return '迟到';

    case 3:
      return '早退';

    case 4:
      return '迟到 + 早退';

    default:
      return '未打卡';
  }
};

const getStatusTagType = (status) => {
  switch (Number(status)) {
    case 1:
      return 'success';

    case 2:
    case 3:
      return 'warning';

    case 4:
      return 'danger';

    default:
      return 'info';
  }
};

const getStatusDotClass = (status) => {
  switch (Number(status)) {
    case 1:
      return 'bg-emerald-400';

    case 2:
    case 3:
      return 'bg-orange-400';

    case 4:
      return 'bg-red-400';

    default:
      return 'bg-gray-400';
  }
};

/* =========================================================
 * 手机检测
 * ========================================================= */

const checkMobile = () => {
  isMobile.value = typeof window !== 'undefined' && window.innerWidth < 640;
};

/* =========================================================
 * 查询
 * ========================================================= */

const handleQuery = () => {
  page.value = 1;

  loadData();
};

/* =========================================================
 * 加载列表
 * ========================================================= */

const loadData = async () => {
  if (isLoading.value) {
    return;
  }

  isLoading.value = true;
  isQuerying.value = true;

  try {
    const res = await request.get('/api/admin/attendance', {
      params: {
        keyword: keyword.value?.trim() || '',
        month: month.value || '',
        page: page.value,
        pageSize: pageSize.value,
      },
    });

    if (res.data?.code === 200) {
      const data = res.data.data || {};

      tableData.value = data.list || data.records || [];

      total.value = Number(data.total) || 0;
    } else {
      tableData.value = [];
      total.value = 0;

      ElMessage.error(res.data?.message || '加载考勤数据失败');
    }
  } catch (error) {
    console.error('加载考勤列表失败:', error);

    ElMessage.error(getErrorMessage(error, '加载考勤列表失败'));
  } finally {
    isLoading.value = false;
    isQuerying.value = false;
  }
};

/* =========================================================
 * 分页大小改变
 * ========================================================= */

const handlePageSizeChange = () => {
  page.value = 1;

  loadData();
};

/* =========================================================
 * 员工搜索
 * ========================================================= */

const searchEmployees = async (query) => {
  const keywordText = String(query || '').trim();

  if (!keywordText) {
    employeeOptions.value = [];
    return;
  }

  employeeSearchLoading.value = true;

  try {
    const res = await request.get('/api/admin/employees', {
      params: {
        keyword: keywordText,
        page: 1,
        pageSize: 50,
      },
    });

    if (res.data?.code === 200) {
      const data = res.data.data || {};

      employeeOptions.value = data.list || data.records || [];
    } else {
      employeeOptions.value = [];
    }
  } catch (error) {
    console.error('搜索员工失败:', error);

    employeeOptions.value = [];
  } finally {
    employeeSearchLoading.value = false;
  }
};

/* =========================================================
 * 打开补签
 * ========================================================= */

const openAddDialog = async () => {
  addForm.employeeId = null;
  addForm.workDate = '';
  addForm.checkInTime = null;
  addForm.checkOutTime = null;
  addForm.status = 0;
  addForm.reason = '';

  employeeOptions.value = [];

  addDialogVisible.value = true;

  await Promise.resolve();

  addFormRef.value?.clearValidate?.();
};

/* =========================================================
 * 补签
 * ========================================================= */

const handleAddSubmit = async () => {
  if (!addFormRef.value) {
    return;
  }

  const valid = await addFormRef.value.validate();

  if (!valid) {
    return;
  }

  if (
    addForm.checkInTime &&
    addForm.checkOutTime &&
    addForm.checkOutTime <= addForm.checkInTime
  ) {
    ElMessage.warning('下班时间必须晚于上班时间');

    return;
  }

  try {
    submitting.value = true;

    /* ---------------------------------------------
     * 1. 防重复
     * --------------------------------------------- */

    const checkRes = await request.get('/api/admin/attendance/check', {
      params: {
        employeeId: addForm.employeeId,

        workDate: addForm.workDate,
      },
    });

    if (checkRes.data?.code === 200 && checkRes.data?.data?.exists) {
      ElMessage.warning('该员工在此日期已有考勤记录，请使用修改功能');

      return;
    }

    /* ---------------------------------------------
     * 2. 组装数据
     * --------------------------------------------- */

    const payload = {
      employeeId: addForm.employeeId,

      workDate: addForm.workDate,

      checkInTime: addForm.checkInTime
        ? `${addForm.workDate} ${addForm.checkInTime}`
        : null,

      checkOutTime: addForm.checkOutTime
        ? `${addForm.workDate} ${addForm.checkOutTime}`
        : null,

      status: Number(addForm.status),

      reason: addForm.reason?.trim() || '',
    };

    /* ---------------------------------------------
     * 3. 提交
     * --------------------------------------------- */

    const res = await request.post('/api/admin/attendance', payload);

    if (res.data?.code === 200) {
      ElMessage.success('补签成功');

      addDialogVisible.value = false;

      await loadData();
    } else {
      ElMessage.error(res.data?.message || '补签失败');
    }
  } catch (error) {
    console.error('补签失败:', error);

    ElMessage.error(getErrorMessage(error, '补签失败'));
  } finally {
    submitting.value = false;
  }
};

/* =========================================================
 * 打开修改
 * ========================================================= */

const openEditDialog = (row) => {
  editForm.value = {
    id: row.id,

    employeeName: row.employeeName || '',

    employeeNo: row.employeeNo || '',

    workDate: row.workDate || '',

    checkInTimeStr: row.checkInTime ? `${fmtTime(row.checkInTime)}:00` : null,

    checkOutTimeStr: row.checkOutTime
      ? `${fmtTime(row.checkOutTime)}:00`
      : null,

    status: Number(row.status) || 0,
  };

  editDialogVisible.value = true;
};

/* =========================================================
 * 自动计算状态
 *
 * 这里保持你的原业务规则：
 *
 * 上班 > 10:00 = 迟到
 * 下班 < 18:30 = 早退
 * ========================================================= */

const calculateStatus = (checkInTime, checkOutTime) => {
  if (!checkInTime) {
    return 0;
  }

  const inTime = String(checkInTime).substring(0, 5);

  const outTime = checkOutTime ? String(checkOutTime).substring(0, 5) : null;

  const late = inTime > '10:00';

  const earlyLeave = !!outTime && outTime < '18:30';

  if (late && earlyLeave) {
    return 4;
  }

  if (late) {
    return 2;
  }

  if (earlyLeave) {
    return 3;
  }

  return 1;
};

/* =========================================================
 * 修改时间后自动计算状态
 * ========================================================= */

watch(
  [() => editForm.value.checkInTimeStr, () => editForm.value.checkOutTimeStr],

  ([checkIn, checkOut]) => {
    editForm.value.status = calculateStatus(checkIn, checkOut);
  },
);

/* =========================================================
 * 修改提交
 * ========================================================= */

const handleEditSubmit = async () => {
  if (!editForm.value.id) {
    ElMessage.error('考勤记录 ID 不存在');

    return;
  }

  if (
    editForm.value.checkInTimeStr &&
    editForm.value.checkOutTimeStr &&
    editForm.value.checkOutTimeStr <= editForm.value.checkInTimeStr
  ) {
    ElMessage.warning('下班时间必须晚于上班时间');

    return;
  }

  try {
    await ElMessageBox.confirm(
      '确定要修改该员工的考勤记录吗？此操作将被记录在操作日志中。',
      '确认修改',
      {
        type: 'warning',
        confirmButtonText: '确定修改',
        cancelButtonText: '取消',
      },
    );

    submitting.value = true;

    const payload = {
      checkInTime: editForm.value.checkInTimeStr
        ? `${editForm.value.workDate} ${editForm.value.checkInTimeStr}`
        : null,

      checkOutTime: editForm.value.checkOutTimeStr
        ? `${editForm.value.workDate} ${editForm.value.checkOutTimeStr}`
        : null,

      status: Number(editForm.value.status),
    };

    const res = await request.put(
      `/api/admin/attendance/${editForm.value.id}`,
      payload,
    );

    if (res.data?.code === 200) {
      ElMessage.success('修改成功，已记录操作日志');

      editDialogVisible.value = false;

      await loadData();
    } else {
      ElMessage.error(res.data?.message || '修改失败');
    }
  } catch (error) {
    /*
     * Element Plus 取消确认时通常返回 cancel
     */
    if (error !== 'cancel' && error !== 'close') {
      console.error('修改考勤失败:', error);

      ElMessage.error(getErrorMessage(error, '修改失败'));
    }
  } finally {
    submitting.value = false;
  }
};

/* =========================================================
 * 判断 iOS
 *
 * iPhone / iPad / iPod
 *
 * 另外兼容 iPadOS 13+
 * ========================================================= */

const isIOS = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const userAgent =
    navigator.userAgent || navigator.vendor || window.opera || '';

  const classicIOS = /iPad|iPhone|iPod/i.test(userAgent);

  /*
   * iPadOS 有时候 UA 会伪装成 Mac
   */
  const iPadOS =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  return classicIOS || iPadOS;
};

/* =========================================================
 * 判断 Safari
 * ========================================================= */

const isSafari = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent;

  return /Safari/i.test(ua) && !/Chrome|CriOS|Android/i.test(ua);
};

/* =========================================================
 * 从 response headers 获取文件名
 * ========================================================= */

const getFileNameFromResponse = (response) => {
  try {
    const disposition = response?.headers?.['content-disposition'];

    if (!disposition) {
      return null;
    }

    /*
     * filename*=UTF-8''
     */
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);

    if (utf8Match?.[1]) {
      return decodeURIComponent(utf8Match[1]);
    }

    /*
     * filename="xxx.xlsx"
     */
    const normalMatch = disposition.match(/filename="?([^"]+)"?/i);

    if (normalMatch?.[1]) {
      return decodeURIComponent(normalMatch[1]);
    }
  } catch (error) {
    console.warn('解析文件名失败:', error);
  }

  return null;
};

/* =========================================================
 * 生成默认文件名
 * ========================================================= */

const createExportFileName = () => {
  const date = new Date();

  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}${String(date.getDate()).padStart(2, '0')}`;

  const monthText = month.value || '全部';

  return `龍華合同会社出勤管理表_${monthText}_${dateStr}.xlsx`;
};

/* =========================================================
 * Blob 下载
 *
 * PC / Android 使用
 * ========================================================= */

const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);

  try {
    const link = document.createElement('a');

    link.href = url;

    link.download = fileName;

    link.style.display = 'none';

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  } finally {
    /*
     * 延迟释放 URL
     *
     * 部分 Safari 对立即 revoke
     * 比较敏感
     */
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 3000);
  }
};

/* =========================================================
 * iOS 下载
 *
 * 这是这次最重要的修改。
 *
 * iPhone Safari 对：
 *
 * Blob + <a download>
 *
 * 支持并不稳定。
 *
 * 所以 iOS：
 *
 * 1. 用户点击按钮
 * 2. 立即打开新窗口
 * 3. 再请求 Excel
 * 4. 将 Blob URL 写入窗口
 * 5. 用户可以使用 Safari 分享按钮
 * 6. 选择“存储到文件”
 *
 * 这样比单纯 a.download 稳定很多。
 * ========================================================= */

const downloadForIOS = async (blob, fileName, openedWindow) => {
  const url = window.URL.createObjectURL(blob);

  /*
   * 如果之前成功打开窗口
   */
  if (openedWindow && !openedWindow.closed) {
    try {
      openedWindow.location.href = url;

      /*
       * 给 Safari 一点时间
       * 再设置标题
       */
      setTimeout(() => {
        try {
          openedWindow.document.title = fileName;
        } catch (e) {
          // Safari 跨页面时可能无法操作 document
        }
      }, 500);

      /*
       * 不要立即 revoke。
       *
       * 用户还需要打开文件。
       */
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);

      return true;
    } catch (error) {
      console.error('iOS 新窗口打开失败:', error);
    }
  }

  /*
   * 备用方案：
   * 当前页面直接打开 Blob URL
   */
  try {
    window.location.href = url;

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 60000);

    return true;
  } catch (error) {
    console.error('iOS Blob 打开失败:', error);

    return false;
  }
};

/* =========================================================
 * 导出 Excel
 *
 * ⭐⭐⭐ 核心优化 ⭐⭐⭐
 *
 * 最大变化：
 *
 * iOS 下必须在用户点击瞬间
 * 先 window.open()
 *
 * 不能等 axios 请求完成以后
 * 再 window.open()
 *
 * 否则 Safari 很容易把它当成
 * 非用户主动操作而拦截。
 * ========================================================= */

// ========== 导出 Excel ==========
const handleExport = async () => {
  // 防止用户连续点击
  if (isExporting.value) return;

  isExporting.value = true;

  let objectUrl = null;

  try {
    // ==========================================
    // 1. 请求后端
    // ==========================================
    const res = await request({
      url: '/api/admin/attendance/export',
      method: 'get',
      params: {
        keyword: keyword.value || '',
        month: month.value || '',
      },
      responseType: 'blob',
    });

    // ==========================================
    // 2. 获取 Content-Type
    // ==========================================
    const contentType =
      res.headers?.['content-type'] || res.headers?.['Content-Type'] || '';

    console.log('Excel Content-Type:', contentType);
    console.log('Excel Blob Size:', res.data?.size);

    // ==========================================
    // 3. 后端返回 JSON 错误
    //
    // 因为 axios responseType = blob
    // 所以后端 JSON 也会变成 Blob
    // ==========================================
    if (
      contentType.includes('application/json') ||
      contentType.includes('text/plain')
    ) {
      const text = await res.data.text();

      console.error('后端导出错误:', text);

      try {
        const json = JSON.parse(text);

        ElMessage.error(json.message || 'Excel 导出失败');
      } catch {
        ElMessage.error('Excel 导出失败，请检查服务器');
      }

      return;
    }

    // ==========================================
    // 4. 检查 Blob
    // ==========================================
    if (!res.data) {
      ElMessage.error('服务器没有返回文件');
      return;
    }

    if (res.data.size === 0) {
      ElMessage.error('Excel 文件为空');
      return;
    }

    // ==========================================
    // 5. 创建 Excel Blob
    // ==========================================
    const excelBlob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // ==========================================
    // 6. 文件名
    // ==========================================
    const now = new Date();

    const dateStr =
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');

    const fileName = `龍華合同会社出勤管理表_${dateStr}.xlsx`;

    // ==========================================
    // 7. 判断 iPhone / iPad
    // ==========================================
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    console.log('是否 iOS:', isIOS);

    // ==========================================
    // 8. iPhone / iPad
    //
    // 不使用 a.click()
    // 不使用 window.location
    // 不打开 Blob 空白页面
    //
    // 直接进入 iOS 系统分享/保存
    // ==========================================
    if (isIOS && typeof navigator.share === 'function') {
      try {
        const file = new File([excelBlob], fileName, {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const shareData = {
          files: [file],
          title: fileName,
          text: '考勤 Excel 文件',
        };

        // iOS 支持文件分享
        if (
          typeof navigator.canShare === 'function' &&
          navigator.canShare({
            files: [file],
          })
        ) {
          await navigator.share(shareData);

          ElMessage.success('请在系统菜单中选择“存储到文件”');

          return;
        }
      } catch (error) {
        // 用户主动关闭分享菜单
        if (error && error.name === 'AbortError') {
          console.log('用户取消了文件分享');
          return;
        }

        console.warn('iOS 文件分享失败:', error);
      }
    }

    // ==========================================
    // 9. PC / Android / 普通浏览器
    //
    // 使用 Blob + <a download>
    // ==========================================
    objectUrl = window.URL.createObjectURL(excelBlob);

    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = fileName;

    // 防止影响页面
    link.style.display = 'none';

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    // ==========================================
    // 10. 延迟释放 Blob URL
    //
    // 不要立即 revoke
    // Safari / Chrome 有时候还没读取完
    // ==========================================
    setTimeout(() => {
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);

        objectUrl = null;
      }
    }, 5000);

    ElMessage.success('Excel 导出成功');
  } catch (error) {
    console.error('Excel 导出异常:', error);

    // ==========================================
    // 11. 尝试读取后端错误
    // ==========================================
    try {
      const errorData = error?.response?.data;

      if (errorData instanceof Blob) {
        const text = await errorData.text();

        console.error('服务器错误内容:', text);

        try {
          const json = JSON.parse(text);

          ElMessage.error(json.message || 'Excel 导出失败');
        } catch {
          ElMessage.error('Excel 导出失败，请检查服务器');
        }
      } else {
        ElMessage.error(
          error?.response?.data?.message || error?.message || 'Excel 导出失败',
        );
      }
    } catch {
      ElMessage.error('Excel 导出失败');
    }
  } finally {
    isExporting.value = false;
  }
};
/* =========================================================
 * 错误信息
 * ========================================================= */

const getErrorMessage = (error, defaultMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.msg ||
    error?.message ||
    defaultMessage
  );
};

/* =========================================================
 * 生命周期
 * ========================================================= */

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
/* =========================================================
 * 搜索栏按钮
 * ========================================================= */

.btn-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

/*
 * Element Plus 默认按钮之间有 margin-left，
 * 这里统一取消，避免手机端错位。
 */
.btn-area :deep(.el-button + .el-button) {
  margin-left: 0;
}

/* =========================================================
 * 手机端
 * ========================================================= */

@media (max-width: 639px) {
  .attendance-page {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }

  /*
   * 按钮区：
   *
   * 查询
   * ─────────────
   *
   * 补签 | 导出 Excel
   *
   * 这样 iPhone 15 / 16 都不会挤压。
   */
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
    margin: 0 !important;
  }

  /*
   * 防止按钮文字换行
   */
  .btn-area :deep(.el-button span) {
    white-space: nowrap;
  }

  /*
   * 导出按钮
   */
  .btn-area .btn-export {
    min-width: 0;
  }
}

/* =========================================================
 * iPhone 小屏幕
 * ========================================================= */

@media (max-width: 390px) {
  .attendance-page {
    padding-left: 12px;
    padding-right: 12px;
  }

  .btn-area {
    gap: 7px;
  }

  .btn-area :deep(.el-button) {
    padding-left: 8px;
    padding-right: 8px;
  }
}

/* =========================================================
 * 表格优化
 * ========================================================= */

:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-table th.el-table__cell) {
  background: #f8fafc;
}

:deep(.el-table .cell) {
  white-space: nowrap;
}

/* =========================================================
 * Dialog
 * ========================================================= */

@media (max-width: 639px) {
  :deep(.el-dialog) {
    margin-top: 6vh !important;
    margin-bottom: 6vh !important;
    border-radius: 18px;
    overflow: hidden;
  }

  :deep(.el-dialog__body) {
    max-height: 68vh;
    overflow-y: auto;
    padding: 18px;
  }

  :deep(.el-dialog__footer) {
    padding: 12px 18px 18px;
  }
}

/* =========================================================
 * 手机分页
 * ========================================================= */

@media (max-width: 639px) {
  :deep(.el-pagination) {
    white-space: nowrap;
  }

  :deep(.el-pagination .el-pager li) {
    min-width: 32px;
  }
}
</style>
