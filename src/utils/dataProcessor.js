/**
 * 处理Excel导入的数据
 * @param {Array} rawData - 原始Excel数据
 * @returns {Array} 处理后的数据
 */
export function processExcelData(rawData) {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return []
  }

  return rawData
    .filter(item => item.checked_label !== '已检查无误')
    .map(item => {
      // 提取算法名称：从project_path提取最后一个'/'后的内容
      const algorithmName = item.project_path 
        ? item.project_path.split('/').pop() 
        : ''

      // 解析content字段（JSON格式）
      let detectionResult = ''
      let description = ''
      
      if (item.content) {
        try {
          const contentData = typeof item.content === 'string' 
            ? JSON.parse(item.content) 
            : item.content
          
          if (Array.isArray(contentData) && contentData.length > 0) {
            const firstItem = contentData[0]
            // 检测结果：label值（1=合格，0=不合格）
            detectionResult = firstItem.label === 1 ? '合格' : '不合格'
            // 描述：content数组中的content值
            description = firstItem.content || ''
          }
        } catch (e) {
          console.error('解析content字段失败:', e)
        }
      }

      // 日期格式化：gmt_create转换为yyyy-MM-dd格式
      let formattedDate = ''
      if (item.gmt_create) {
        try {
          const date = new Date(item.gmt_create)
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            formattedDate = `${year}-${month}-${day}`
          }
        } catch (e) {
          formattedDate = item.gmt_create
        }
      }

      // 处理图片字段：拆分为图片链接和图片缩略图
      let imageLink = item.images || ''
      
      // 处理图片链接：可能是字符串、数组或其他格式
      if (imageLink) {
        try {
          // 如果是字符串且看起来像JSON数组，尝试解析
          if (typeof imageLink === 'string' && imageLink.trim().startsWith('[')) {
            const parsed = JSON.parse(imageLink)
            if (Array.isArray(parsed) && parsed.length > 0) {
              imageLink = parsed[0]
            }
          } else if (Array.isArray(imageLink) && imageLink.length > 0) {
            imageLink = imageLink[0]
          }
          
          // 修复URL格式：将 https./ 或 http./ 修复为 https:// 或 http://
          if (typeof imageLink === 'string') {
            // 修复 https./ 或 http./ 格式错误
            imageLink = imageLink.replace(/^(https?)\.\//, '$1://')
            // 确保是有效的URL格式
            if (!imageLink.startsWith('http://') && !imageLink.startsWith('https://')) {
              imageLink = ''
            }
          } else {
            imageLink = ''
          }
        } catch (e) {
          console.error('解析图片链接失败:', e)
          imageLink = ''
        }
      }
      
      // 如果没有有效的图片链接，生成一个mock链接
      if (!imageLink) {
        // 使用 task_id 生成一个唯一的mock图片链接
        const mockId = item.task_id || Math.random().toString(36).substr(2, 9)
        imageLink = `https://picsum.photos/800/600?random=${mockId}`
      }
      
      // 缩略图使用对应的图片链接（浏览器会自动缩放显示）
      const imageThumbnail = imageLink

      return {
        gmt_create: formattedDate,
        task_id: item.task_id || '',
        project_name: item.project_name || '',
        算法名称: algorithmName,
        图片链接: imageLink,
        图片缩略图: imageThumbnail,
        检测结果: detectionResult,
        描述: description,
        store_code: item.store_code || ''
      }
    })
}

