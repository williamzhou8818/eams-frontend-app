<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">员工管理</h2>
      <el-button type="primary" :icon="Plus">新增员工</el-button>
    </div>

    <el-card class="!rounded-xl !border-0 shadow-sm">
      <el-empty description="员工列表功能将在下一步实现" />
    </el-card>
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue';
</script>
