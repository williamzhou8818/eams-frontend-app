<template>
  <div>
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <h2 class="text-xl md:text-2xl font-bold text-gray-800">员工管理</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog()"
        >新增员工</el-button
      >
    </div>

    <!-- 搜索栏 -->
    <el-card class="!rounded-xl !border-0 shadow-sm mb-4">
      <el-input
        v-model="keyword"
        placeholder="搜索姓名或工号..."
        :prefix-icon="Search"
        clearable
        @keyup.enter="loadData"
        @clear="loadData"
        class="!w-full sm:!w-80"
      />
    </el-card>

    <!-- 表格 -->
    <el-card class="!rounded-xl !border-0 shadow-sm" v-loading="isLoading">
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="employeeNo" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column
          prop="email"
          label="邮箱"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column prop="phone" label="电话" width="140" />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'HR' ? 'danger' : 'info'" size="small">
              {{ row.role === 'HR' ? 'HR' : '员工' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-button
                type="primary"
                link
                size="small"
                @click="openDialog(row)"
                class="!px-2"
              >
                <el-icon class="mr-1"><Edit /></el-icon>编辑
              </el-button>
              <el-divider direction="vertical" class="!h-4 !m-0" />
              <el-button
                :type="row.role === 'HR' ? 'warning' : 'success'"
                link
                size="small"
                @click="handleToggleRole(row)"
                class="!px-2 whitespace-nowrap"
              >
                <el-icon class="mr-1"><User /></el-icon>
                {{ row.role === 'HR' ? '降级' : '升HR' }}
              </el-button>
              <el-divider direction="vertical" class="!h-4 !m-0" />
              <el-button
                type="danger"
                link
                size="small"
                @click="handleDelete(row)"
                class="!px-2"
              >
                <el-icon class="mr-1"><Delete /></el-icon>删除
              </el-button>
            </div>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑员工' : '新增员工'"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <!-- 新增时显示提示，编辑时显示真实工号 -->
        <el-form-item label="工号" v-if="isEdit">
          <el-input v-model="form.employeeNo" disabled />
        </el-form-item>
        <el-form-item label="工号" v-else>
          <el-input
            value="系统自动生成 (如 A0001)"
            disabled
            class="!text-gray-400"
          />
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="form.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="example@domain.com" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="11位手机号码"
            maxlength="11"
          />
        </el-form-item>
        <el-form-item label="角色" prop="role" v-if="isEdit">
          <el-select v-model="form.role" class="!w-full">
            <el-option label="普通员工" value="EMPLOYEE" />
            <el-option label="HR 管理员" value="HR" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Plus, Search, Edit, User, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/api/request';

const isLoading = ref(false);
const submitting = ref(false);
const keyword = ref('');
const tableData = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);

const form = ref({
  id: null,
  employeeNo: '',
  name: '',
  department: '',
  email: '',
  phone: '',
  role: 'EMPLOYEE',
  status: 1,
});

// 👇 核心：去掉了 employeeNo 的必填校验，因为它是后端自动生成的
const rules = {
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
  phone: [
    { pattern: /^\d{11}$/, message: '电话必须是 11 位数字', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
};

const loadData = async () => {
  isLoading.value = true;
  try {
    const res = await request.get('/api/admin/employees', {
      params: {
        keyword: keyword.value,
        page: page.value,
        pageSize: pageSize.value,
      },
    });
    if (res.data.code === 200) {
      tableData.value = res.data.data.list;
      total.value = res.data.data.total;
    }
  } catch (error) {
    ElMessage.error('加载员工列表失败');
  } finally {
    isLoading.value = false;
  }
};

const openDialog = (row = null) => {
  if (row) {
    isEdit.value = true;
    form.value = { ...row };
  } else {
    isEdit.value = false;
    form.value = {
      id: null,
      employeeNo: '',
      name: '',
      department: '',
      email: '',
      phone: '',
      role: 'EMPLOYEE',
      status: 1,
    };
  }
  dialogVisible.value = true;
  setTimeout(() => {
    formRef.value?.clearValidate();
  }, 0);
};

const handleSubmit = async () => {
  // 1. 前端表单校验
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch (error) {
    return; // 校验失败，直接 return，不发送请求
  }

  submitting.value = true;
  try {
    let res;
    // 2. 发送请求并接收完整的 response 对象
    if (isEdit.value) {
      res = await request.put(
        `/api/admin/employees/${form.value.id}`,
        form.value,
      );
    } else {
      res = await request.post('/api/admin/employees', form.value);
    }

    // 👇 3. 核心修复：检查后端返回的业务 code，而不是只看 HTTP 状态码
    if (res.data.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
      dialogVisible.value = false;
      loadData();
    } else {
      // 后端返回了业务错误 (例如: {code: 500, message: "该邮箱已被其他员工使用！"})
      ElMessage.error(res.data.message || '操作失败，请检查输入');
    }
  } catch (error) {
    // 4. 处理真正的网络级别错误 (如 401 未授权, 500 服务器崩溃等)
    console.error('🔥 网络或系统级错误:', error);
    const errorMsg =
      error.response?.data?.message || error.message || '网络请求失败';
    ElMessage.error(errorMsg);
  } finally {
    submitting.value = false;
  }
};

const handleToggleRole = async (row) => {
  const newRole = row.role === 'HR' ? 'EMPLOYEE' : 'HR';
  const action = newRole === 'HR' ? '升为 HR 管理员' : '降级为普通员工';
  try {
    await ElMessageBox.confirm(`确定要将 ${row.name} ${action}吗？`, '提示', {
      type: 'warning',
    });
    await request.patch(`/api/admin/employees/${row.id}/role`, null, {
      params: { role: newRole },
    });
    ElMessage.success('角色更新成功');
    loadData();
  } catch (e) {}
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除员工 ${row.name} 吗？（逻辑删除，可恢复）`,
      '警告',
      { type: 'warning' },
    );
    await request.delete(`/api/admin/employees/${row.id}`);
    ElMessage.success('删除成功');
    loadData();
  } catch (e) {}
};

onMounted(() => {
  loadData();
});
</script>
