# FargeSpace Think Tank Phase 6 API Contract

版本：V1  
日期：2026-04-09  
状态：Frozen

关联文件：
- [API_CONTRACT.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/API_CONTRACT.md)
- [scripts/verify_phase6_contract.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase6_contract.mjs)

## 1. Phase 6 目标

Phase 6 只做一件事：

- 在前端开工前冻结接口合同，避免页面开发阶段反复改数据结构

## 2. 本阶段完成项

### 2.1 T601 Package 列表接口

- 列表返回字段已冻结
- 首页/主题页/合集页/搜索页统一复用一个列表结构

### 2.2 T602 Package 详情接口

- 详情返回结构已冻结
- 加工资产、来源、主题、合集均明确为有序返回

### 2.3 T603 搜索接口

- 搜索语义与列表接口对齐
- 筛选维度已冻结：主题、格式、来源类型、发布时间、内容包类型

### 2.4 T604 Topic / Collection 摘要接口

- 导航和列表页头部所需摘要字段已冻结

### 2.5 T605 展示日期规则

- 统一输出 `display_date`
- 规则固定为：`publish_start_at ?? sort_date`

### 2.6 T606 SEO 回退规则

- 详情页统一输出 `seo.title` / `seo.description`
- 缺省时按合同固定回退逻辑处理

## 3. 可执行验证

验证命令：

```bash
node scripts/verify_phase6_contract.mjs
```

验证覆盖：

1. 列表接口字段完整性
2. 详情接口字段完整性与有序数据可读性
3. 搜索接口筛选可用性
4. Topic / Collection 摘要接口可用性

## 4. 通过标准

满足以下条件，Phase 6 才算完成：

1. `API_CONTRACT.md` 已冻结并可供前端直接对接
2. T601-T606 全部有明确输入输出定义
3. 合同验证脚本执行通过

## 5. 下一步

Phase 6 完成后，进入：

- Phase 7：前台共享壳与基础组件
