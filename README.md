# 蜜雪冰城AI图片检测大盘

一个基于Vue 3的Web应用，支持导入Excel文件、数据处理和可视化展示，可部署到GitHub Pages。

## 功能特性

- 📊 Excel文件导入（支持.xlsx格式）
- 🔍 数据自动处理和转换
- 📋 数据表格展示（支持分页）
- 🎨 现代化的UI界面

## 数据处理逻辑

1. **数据过滤**：只保留 `checked_label ≠ '已检查无误'` 的记录
2. **算法名称提取**：从 `project_path` 字段提取最后一个'/'后的内容
3. **内容解析**：解析 `content` 字段（JSON格式），提取：
   - `检测结果`：根据label值（1=合格，0=不合格）
   - `描述`：提取content数组中的content值
4. **日期格式化**：将 `gmt_create` 转换为 `yyyy-MM-dd` 格式
5. **图片处理**：将 `images` 字段拆分为：
   - `图片链接`：如果有原图链接则使用，否则生成mock链接
   - `图片缩略图`：显示缩略图，点击可放大查看

## 表格字段

按以下顺序显示：
- gmt_create（日期）
- task_id（任务ID）
- project_name（项目名称）
- 算法名称
- 图片链接（可点击跳转）
- 图片缩略图（点击可放大查看）
- 检测结果
- 描述
- store_code（门店代码）

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 部署到GitHub Pages

1. 修改 `vite.config.js` 中的 `base` 路径为你的仓库名称
2. 构建项目：`npm run build`
3. 将 `dist` 目录的内容推送到GitHub仓库的 `gh-pages` 分支

或者使用GitHub Actions自动部署（需要创建 `.github/workflows/deploy.yml`）。

## 技术栈

- Vue 3
- Vite
- Element Plus
- SheetJS (xlsx.js)

