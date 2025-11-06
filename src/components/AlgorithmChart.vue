<template>
  <div class="algorithm-chart">
    <el-card>
      <template #header>
        <div class="chart-header">
          <span>按照算法名称维度统计</span>
        </div>
      </template>
      <div ref="chartContainer" class="chart-container"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const chartContainer = ref(null)
let chartInstance = null

// 处理数据，按算法名称分组统计
// 注意：这里使用的是表格的完整数据（props.data），而不是分页后的数据
// 确保图表统计的是所有记录，而不仅仅是当前页显示的数据
// 数据来源：与「图片AI检测明细表」使用相同的数据源 processedData
const processChartData = () => {
  const algorithmMap = new Map()
  
  // 遍历所有数据（表格的完整数据集）
  // props.data 就是「图片AI检测明细表」中的所有数据
  const totalRecords = props.data.length
  console.log(`[图表统计] 基于表格数据，总记录数: ${totalRecords}`)
  
  props.data.forEach(item => {
    const algorithmName = item.算法名称 || '未知算法'
    
    if (!algorithmMap.has(algorithmName)) {
      algorithmMap.set(algorithmName, {
        name: algorithmName,
        total: 0,
        qualified: 0,
        unqualified: 0
      })
    }
    
    const stat = algorithmMap.get(algorithmName)
    stat.total++
    
    if (item.检测结果 === '合格') {
      stat.qualified++
    } else if (item.检测结果 === '不合格') {
      stat.unqualified++
    }
  })
  
  // 转换为数组并按总检测数排序
  const algorithmStats = Array.from(algorithmMap.values())
    .sort((a, b) => b.total - a.total)
  
  console.log(`[图表统计] 算法数量: ${algorithmStats.length}，总检测数: ${algorithmStats.reduce((sum, item) => sum + item.total, 0)}`)
  
  return algorithmStats
}

const initChart = () => {
  if (!chartContainer.value) return
  
  // 如果图表实例已存在，先销毁
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(chartContainer.value)
  
  const algorithmStats = processChartData()
  
  if (algorithmStats.length === 0) {
    chartInstance.setOption({
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'middle',
        textStyle: {
          color: '#909399',
          fontSize: 16
        }
      }
    })
    return
  }
  
  const algorithmNames = algorithmStats.map(item => item.name)
  const qualifiedData = algorithmStats.map(item => item.qualified)
  const unqualifiedData = algorithmStats.map(item => item.unqualified)
  const qualifiedRates = algorithmStats.map(item => {
    if (item.total === 0) return 0
    return ((item.qualified / item.total) * 100).toFixed(2)
  })
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function(params) {
        let result = params[0].name + '<br/>'
        params.forEach(param => {
          if (param.seriesName === '合格率') {
            result += param.marker + param.seriesName + ': ' + param.value + '%<br/>'
          } else {
            result += param.marker + param.seriesName + ': ' + param.value + '<br/>'
          }
        })
        return result
      }
    },
    legend: {
      data: ['合格', '不合格', '合格率'],
      top: 10
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: algorithmNames,
      axisLabel: {
        rotate: 45, // 旋转标签，避免重叠
        interval: 0,
        width: 100,
        overflow: 'break'
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '检测数',
        position: 'left',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '合格率(%)',
        position: 'right',
        axisLabel: {
          formatter: '{value}%'
        },
        min: 0,
        max: 100
      }
    ],
    series: [
      {
        name: '合格',
        type: 'bar',
        stack: '检测结果',
        data: qualifiedData,
        itemStyle: {
          color: '#67c23a'
        }
      },
      {
        name: '不合格',
        type: 'bar',
        stack: '检测结果',
        data: unqualifiedData,
        itemStyle: {
          color: '#f56c6c'
        }
      },
      {
        name: '合格率',
        type: 'line',
        yAxisIndex: 1,
        data: qualifiedRates,
        itemStyle: {
          color: '#409eff'
        },
        lineStyle: {
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  }
  
  chartInstance.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', handleResize)
}

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

watch(() => props.data, () => {
  nextTick(() => {
    initChart()
  })
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.algorithm-chart {
  margin-bottom: 20px;
}

.chart-header {
  font-size: 16px;
  font-weight: 500;
}

.chart-container {
  width: 100%;
  height: 500px;
  min-height: 500px;
}
</style>

