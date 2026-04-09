# FargeSpace Think Tank 共享展示组件（T703）

版本：V1  
日期：2026-04-09  
状态：Frozen

## 1. 目标

把列表和详情页都会复用的展示组件先固定，后续页面实现直接组合使用。

## 2. 组件清单

- `package hero`
  - 文件：[components/package-hero.tsx](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/components/package-hero.tsx)
- `package card`
  - 文件：[components/package-card.tsx](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/components/package-card.tsx)
- `topic pill`
  - 文件：[components/topic-pill.tsx](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/components/topic-pill.tsx)
- `collection pill`
  - 文件：[components/collection-pill.tsx](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/components/collection-pill.tsx)
- `source badge`
  - 文件：[components/source-badge.tsx](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/components/source-badge.tsx)
- `asset badge`
  - 文件：[components/asset-badge.tsx](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/components/asset-badge.tsx)

## 3. 数据模型

共享展示组件统一使用：

- [lib/ui-models.ts](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/lib/ui-models.ts)

字段定义与 Phase 6 接口合同对齐。

## 4. 验证方式

组件当前通过首页组件演示区验证：

- [app/page.tsx](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/page.tsx)

样式定义：

- [app/globals.css](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/app/globals.css)

## 5. 下一步

进入 T704：

- loading / empty / error / expired / unauthorized / not found 状态组件
