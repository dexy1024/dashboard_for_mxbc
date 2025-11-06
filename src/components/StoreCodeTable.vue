<template>
  <div class="store-code-table">
    <el-card>
      <template #header>
        <div class="table-header">
          <span>按照门店代码维度统计</span>
        </div>
      </template>
      <el-table
        :data="paginatedStats"
        stripe
        border
        style="width: 100%"
        :default-sort="{ prop: '总检测数', order: 'descending' }"
      >
        <el-table-column prop="门店代码" label="门店代码" min-width="200" sortable />
        <el-table-column prop="总检测数" label="总检测数" min-width="150" sortable />
        <el-table-column prop="合格数" label="合格数" min-width="150" sortable>
          <template #default="scope">
            <span style="color: #67c23a; font-weight: 500;">{{ scope.row.合格数 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="不合格数" label="不合格数" min-width="150" sortable>
          <template #default="scope">
            <span style="color: #f56c6c; font-weight: 500;">{{ scope.row.不合格数 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="合格率" label="合格率" min-width="150" sortable>
          <template #default="scope">
            <el-tag :type="parseFloat(scope.row.合格率) >= 80 ? 'success' : parseFloat(scope.row.合格率) >= 60 ? 'warning' : 'danger'">
              {{ scope.row.合格率 }}%
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

// 按门店代码分组统计
// 注意：这里使用的是表格的完整数据（props.data），而不是分页后的数据
// 确保统计的是所有记录，而不仅仅是当前页显示的数据
// 数据来源：与「图片AI检测明细表」使用相同的数据源 processedData
const storeCodeStats = computed(() => {
  const storeCodeMap = new Map()
  
  // 遍历所有数据（表格的完整数据集）
  props.data.forEach(item => {
    const storeCode = item.store_code || '未知门店'
    
    if (!storeCodeMap.has(storeCode)) {
      storeCodeMap.set(storeCode, {
        门店代码: storeCode,
        总检测数: 0,
        合格数: 0,
        不合格数: 0,
        合格率: '0.00'
      })
    }
    
    const stat = storeCodeMap.get(storeCode)
    stat.总检测数++
    
    if (item.检测结果 === '合格') {
      stat.合格数++
    } else if (item.检测结果 === '不合格') {
      stat.不合格数++
    }
  })
  
  // 计算合格率并转换为数组
  const stats = Array.from(storeCodeMap.values()).map(stat => {
    if (stat.总检测数 > 0) {
      stat.合格率 = ((stat.合格数 / stat.总检测数) * 100).toFixed(2)
    }
    return stat
  })
  
  // 按总检测数降序排序
  return stats.sort((a, b) => b.总检测数 - a.总检测数)
})

const currentPage = ref(1)
const pageSize = ref(10) // 默认显示10行

const total = computed(() => storeCodeStats.value.length)

const paginatedStats = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return storeCodeStats.value.slice(start, end)
})

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 当数据变化时，重置到第一页
watch(() => props.data, () => {
  currentPage.value = 1
}, { deep: true })
</script>

<style scoped>
.store-code-table {
  margin-bottom: 20px;
}

.table-header {
  font-size: 16px;
  font-weight: 500;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

