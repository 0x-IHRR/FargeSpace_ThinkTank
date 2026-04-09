# FargeSpace Think Tank 首页实现（T801）

版本：V1  
日期：2026-04-09  
状态：Frozen

## 1. 目标

完成首页的 5 个必备模块：

1. featured package
2. latest packages
3. topic entry
4. collection entry
5. basic filter entry

## 2. 当前落地

首页文件：

- [app/page.tsx](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/page.tsx)

首页样式：

- [app/globals.css](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/globals.css)

首页数据占位（用于前端结构联调）：

- [lib/mock-content.ts](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/lib/mock-content.ts)

## 3. 模块说明

### 3.1 featured package

- 使用 `package hero` 组件呈现本期重点内容

### 3.2 latest packages

- 使用 `package card` 组件显示最新内容列表

### 3.3 topic entry

- 使用 `topic pill` 作为主题入口

### 3.4 collection entry

- 使用 `collection pill` 作为合集入口

### 3.5 basic filter entry

- 提供常用筛选的快捷入口（跳转到 `/search` 并带 query）

## 4. 下一步

进入 T802：

- 主题页（标题、描述、内容包列表、筛选）
