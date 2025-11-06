<template>
  <div class="statistics-cards">
    <el-card>
      <template #header>
        <div class="cards-header">
          <span>总合格率统计</span>
        </div>
      </template>
      <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">总检测数</div>
            <div class="stat-value">{{ totalCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card stat-card-success">
          <div class="stat-content">
            <div class="stat-label">合格数</div>
            <div class="stat-value">{{ qualifiedCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card stat-card-danger">
          <div class="stat-content">
            <div class="stat-label">不合格数</div>
            <div class="stat-value">{{ unqualifiedCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card stat-card-primary">
          <div class="stat-content">
            <div class="stat-label">合格率</div>
            <div class="stat-value">{{ qualifiedRate }}%</div>
          </div>
        </el-card>
      </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

// 注意：统计基于表格的完整数据（props.data），而不是分页后的数据
// 确保统计的是所有记录，而不仅仅是当前页显示的数据
const totalCount = computed(() => props.data.length)

const qualifiedCount = computed(() => {
  return props.data.filter(item => item.检测结果 === '合格').length
})

const unqualifiedCount = computed(() => {
  return props.data.filter(item => item.检测结果 === '不合格').length
})

const qualifiedRate = computed(() => {
  if (totalCount.value === 0) return '0.00'
  return ((qualifiedCount.value / totalCount.value) * 100).toFixed(2)
})
</script>

<style scoped>
.statistics-cards {
  margin-bottom: 20px;
}

.cards-header {
  font-size: 16px;
  font-weight: 500;
}

.stat-card {
  text-align: center;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  padding: 10px 0;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.stat-card-success .stat-value {
  color: #67c23a;
}

.stat-card-danger .stat-value {
  color: #f56c6c;
}

.stat-card-primary .stat-value {
  color: #409eff;
}
</style>

