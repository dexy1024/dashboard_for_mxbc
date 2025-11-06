<template>
  <div class="app-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>蜜雪冰城AI图片检测大盘<el-button type="primary" @click="triggerFileInput" style="margin-left: 10px;">导入数据</el-button></h1>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx"
          style="display: none"
          @change="handleFileInputChange"
        />
      </el-header>
      <el-main>

        <div v-if="processedData.length > 0" class="data-section">
          <div class="data-info">
            <el-alert
              :title="`已加载 ${processedData.length} 条数据`"
              type="success"
              :closable="false"
              show-icon
            />
          </div>
          <!-- 筛选面板 -->
          <FilterPanel :data="processedData" @filter-change="handleFilterChange" />
          <!-- 统计指标卡和图表都基于筛选后的数据 -->
          <StatisticsCards :data="filteredData" />
          <AlgorithmChart :data="filteredData" />
          <!-- 门店代码维度统计表格 -->
          <StoreCodeTable :data="filteredData" />
          <!-- 表格内部会进行分页，但统计和图表使用的是筛选后的数据 -->
          <DataTable :data="filteredData" />
        </div>

        <div v-else-if="hasError" class="error-section">
          <el-alert
            title="文件解析失败，请检查文件格式"
            type="error"
            :closable="false"
            show-icon
          />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { processExcelData } from './utils/dataProcessor.js'
import DataTable from './components/DataTable.vue'
import StatisticsCards from './components/StatisticsCards.vue'
import AlgorithmChart from './components/AlgorithmChart.vue'
import StoreCodeTable from './components/StoreCodeTable.vue'
import FilterPanel from './components/FilterPanel.vue'

const processedData = ref([])
const filteredData = ref([])
const hasError = ref(false)
const fileInput = ref(null)
const filterConditions = ref({
  dateRange: null,
  algorithmNames: [],
  storeCodes: []
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileInputChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  hasError.value = false
  processedData.value = []

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      
      // 读取第一个工作表
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      
      // 转换为JSON格式（第一行作为表头）
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      
      if (jsonData.length === 0) {
        hasError.value = true
        return
      }

      // 处理数据
      processedData.value = processExcelData(jsonData)
      filteredData.value = processedData.value
      
      if (processedData.value.length === 0) {
        hasError.value = true
      }
    } catch (error) {
      console.error('文件解析错误:', error)
      hasError.value = true
    }
  }
  
  reader.onerror = () => {
    hasError.value = true
  }
  
  reader.readAsArrayBuffer(file)
  
  // 清空input，以便可以重复选择同一文件
  event.target.value = ''
}

// 处理筛选条件变化
const handleFilterChange = (conditions) => {
  filterConditions.value = conditions
  
  let result = [...processedData.value]
  
  // 日期区间筛选
  if (conditions.dateRange && conditions.dateRange.length === 2) {
    const [startDate, endDate] = conditions.dateRange
    result = result.filter(item => {
      if (!item.gmt_create) return false
      return item.gmt_create >= startDate && item.gmt_create <= endDate
    })
  }
  
  // 算法名称筛选
  if (conditions.algorithmNames && conditions.algorithmNames.length > 0) {
    result = result.filter(item => {
      return conditions.algorithmNames.includes(item.算法名称)
    })
  }
  
  // 门店代码筛选
  if (conditions.storeCodes && conditions.storeCodes.length > 0) {
    result = result.filter(item => {
      return conditions.storeCodes.includes(item.store_code)
    })
  }
  
  filteredData.value = result
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
}

.app-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.el-header {
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.el-header h1 {
  font-size: 24px;
  font-weight: 500;
  display: flex;
  align-items: center;
  margin: 0;
}

.el-main {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.data-section {
  margin-top: 30px;
}

.data-info {
  margin-bottom: 20px;
}

.error-section {
  margin-top: 20px;
}
</style>

