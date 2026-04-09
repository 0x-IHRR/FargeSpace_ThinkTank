# FargeSpace Think Tank 页面共享框架（T702）

版本：V1  
日期：2026-04-09  
状态：Frozen

## 1. 目标

把所有页面共用的框架先固定，后续页面只填内容，不重复造壳。

## 2. 已完成范围

### 2.1 页头

- 品牌区（名称 + 定位说明）
- 全站导航入口

### 2.2 导航

- 首页、主题示例、合集示例、内容包示例、搜索页、登录页
- 统一胶囊样式，后续页面复用

### 2.3 登录状态区

- 固定在页头内
- 显示当前状态（访客模式）
- 提供两类入口：
  - 会员登录
  - Directus 后台入口

### 2.4 页宽规则

- 全站统一 `site-width` 容器
- 桌面端固定最大宽度
- 移动端保留左右边距

### 2.5 页脚

- 统一信息区
- 当前版本下作为全站底部占位，后续可补版权与外链

## 3. 关联实现文件

- [app/layout.tsx](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/layout.tsx)
- [app/globals.css](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/globals.css)

## 4. 下一步

进入 T703：

- 实现共享展示组件（hero/card/pill/badge）
