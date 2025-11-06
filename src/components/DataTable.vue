<template>
  <div class="data-table-container">
    <el-card>
      <template #header>
        <div class="table-header">
          <span>图片AI检测明细表</span>
        </div>
      </template>
      <el-table
      :data="paginatedData"
      stripe
      border
      style="width: 100%"
      :default-sort="{ prop: 'gmt_create', order: 'descending' }"
    >
      <el-table-column label="序号" width="80" align="center">
        <template #default="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="gmt_create" label="日期" width="120" sortable />
      <el-table-column prop="task_id" label="任务ID" width="120" />
      <el-table-column prop="project_name" label="项目名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="算法名称" label="算法名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="图片链接" label="图片链接" min-width="200" show-overflow-tooltip>
        <template #default="scope">
          <el-link :href="scope.row.图片链接" target="_blank" type="primary">
            {{ scope.row.图片链接 }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="图片缩略图" label="图片缩略图" width="120">
        <template #default="scope">
          <el-image
            :src="scope.row.图片缩略图"
            :preview-src-list="scope.row.图片链接 ? [scope.row.图片链接] : []"
            fit="cover"
            style="width: 80px; height: 80px; cursor: pointer;"
            preview-teleported
            :hide-on-click-modal="true"
            :z-index="3000"
            @error="handleImageError"
          >
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="检测结果" label="检测结果" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.检测结果 === '合格' ? 'success' : 'danger'">
            {{ scope.row.检测结果 }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="描述" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="store_code" label="门店代码" width="120" />
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="handleViewDetail(scope.row)">
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="记录详情"
      width="800px"
      :before-close="handleCloseDetail"
    >
      <el-descriptions :column="2" border v-if="currentDetail">
        <el-descriptions-item label="序号">{{ currentDetailIndex }}</el-descriptions-item>
        <el-descriptions-item label="日期">{{ currentDetail.gmt_create }}</el-descriptions-item>
        <el-descriptions-item label="任务ID">{{ currentDetail.task_id }}</el-descriptions-item>
        <el-descriptions-item label="项目名称">{{ currentDetail.project_name }}</el-descriptions-item>
        <el-descriptions-item label="算法名称">{{ currentDetail.算法名称 }}</el-descriptions-item>
        <el-descriptions-item label="门店代码">{{ currentDetail.store_code }}</el-descriptions-item>
        <el-descriptions-item label="检测结果">
          <el-tag :type="currentDetail.检测结果 === '合格' ? 'success' : 'danger'">
            {{ currentDetail.检测结果 }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentDetail.描述 }}</el-descriptions-item>
        <el-descriptions-item label="图片链接" :span="2">
          <el-link :href="currentDetail.图片链接" target="_blank" type="primary">
            {{ currentDetail.图片链接 }}
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="图片缩略图" :span="2">
          <el-image
            :src="currentDetail.图片缩略图"
            :preview-src-list="currentDetail.图片链接 ? [currentDetail.图片链接] : []"
            fit="cover"
            style="width: 200px; height: 200px; cursor: pointer;"
            preview-teleported
          >
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

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
import { Picture } from '@element-plus/icons-vue'

const handleImageError = () => {
  // 图片加载失败时的处理
  console.warn('缩略图加载失败')
}

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const currentPage = ref(1)
const pageSize = ref(10) // 默认显示10条记录

// 表格总数基于完整数据，与图表统计使用的数据源相同
const total = computed(() => {
  const count = props.data.length
  console.log(`[表格统计] 总记录数: ${count}`)
  return count
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.data.slice(start, end)
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

// 详情对话框
const detailDialogVisible = ref(false)
const currentDetail = ref(null)
const currentDetailIndex = ref(0)

const handleViewDetail = (row) => {
  currentDetail.value = row
  // 计算全局序号
  const globalIndex = (currentPage.value - 1) * pageSize.value + paginatedData.value.findIndex(item => item === row) + 1
  currentDetailIndex.value = globalIndex
  detailDialogVisible.value = true
}

const handleCloseDetail = () => {
  detailDialogVisible.value = false
  currentDetail.value = null
}
</script>

<style scoped>
.data-table-container {
  margin-top: 20px;
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

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 30px;
}
</style>

