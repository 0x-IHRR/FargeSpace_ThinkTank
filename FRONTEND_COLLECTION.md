# FargeSpace Think Tank 合集页实现（T803）

版本：V1  
日期：2026-04-09  
状态：Frozen

## 1. 目标

完成合集页 3 个模块：

1. 合集标题
2. 合集描述
3. 有序内容包列表

## 2. 当前落地

合集页实现：

- [app/collections/[slug]/page.tsx](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/collections/[slug]/page.tsx)

合集数据与顺序定义：

- [lib/mock-content.ts](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/lib/mock-content.ts)

合集页样式：

- [app/globals.css](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/globals.css)

## 3. 顺序规则

合集页不按时间自动重排，使用合集内固定顺序输出内容包。

## 4. 下一步

进入 T804：

- 搜索页（URL 筛选、结果数、清空筛选）
