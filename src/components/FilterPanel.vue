<template>
  <div class="filter-panel">
    <el-card>
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="日期区间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        
        <el-form-item label="算法名称">
          <el-select
            v-model="filterForm.algorithmNames"
            multiple
            placeholder="请选择算法名称"
            filterable
            clearable
            style="width: 300px"
          >
            <el-option
              v-for="algorithm in algorithmOptions"
              :key="algorithm"
              :label="algorithm"
              :value="algorithm"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="门店代码">
          <el-select
            v-model="filterForm.storeCodes"
            multiple
            placeholder="请输入或选择门店代码"
            filterable
            clearable
            allow-create
            default-first-option
            style="width: 300px"
          >
            <el-option
              v-for="storeCode in filteredStoreCodeOptions"
              :key="storeCode"
              :label="storeCode"
              :value="storeCode"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['filter-change'])

const filterForm = ref({
  dateRange: null,
  algorithmNames: [],
  storeCodes: []
})

// 获取所有唯一的算法名称
const algorithmOptions = computed(() => {
  const algorithms = new Set()
  props.data.forEach(item => {
    if (item.算法名称) {
      algorithms.add(item.算法名称)
    }
  })
  return Array.from(algorithms).sort()
})

// 获取所有唯一的门店代码
const storeCodeOptions = computed(() => {
  const storeCodes = new Set()
  props.data.forEach(item => {
    if (item.store_code) {
      storeCodes.add(item.store_code)
    }
  })
  return Array.from(storeCodes).sort()
})

// 过滤后的门店代码选项（用于模糊搜索）
const filteredStoreCodeOptions = computed(() => {
  return storeCodeOptions.value
})

// 查询
const handleQuery = () => {
  emit('filter-change', {
    dateRange: filterForm.value.dateRange,
    algorithmNames: filterForm.value.algorithmNames,
    storeCodes: filterForm.value.storeCodes
  })
}

// 重置
const handleReset = () => {
  filterForm.value = {
    dateRange: null,
    algorithmNames: [],
    storeCodes: []
  }
  emit('filter-change', {
    dateRange: null,
    algorithmNames: [],
    storeCodes: []
  })
}

// 监听数据变化，自动触发查询（可选）
watch(() => props.data, () => {
  // 数据变化时，如果有筛选条件，自动查询
  if (filterForm.value.dateRange || 
      filterForm.value.algorithmNames.length > 0 || 
      filterForm.value.storeCodes.length > 0) {
    handleQuery()
  }
}, { deep: true })
</script>

<style scoped>
.filter-panel {
  margin-bottom: 20px;
}

.filter-form {
  padding: 10px 0;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
}
</style>

