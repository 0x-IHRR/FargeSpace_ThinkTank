# FargeSpace Think Tank Phase 3 Rules

版本：V1  
日期：2026-04-09  
状态：Frozen

关联文件：
- [directus/schema/phase3-rules.sql](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/directus/schema/phase3-rules.sql)
- [scripts/apply_phase3_rules.sh](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/apply_phase3_rules.sh)
- [scripts/apply_phase3_presets.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/apply_phase3_presets.mjs)
- [scripts/verify_phase3_rules.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase3_rules.mjs)

## 1. Phase 3 目标

Phase 3 只做两件事：

- 让后台只能按规则把内容推进到可发布状态
- 给编辑预置一组能直接用的书签视图

当前不做：

- 前台可见性控制
- 角色权限切分
- 正式导入流程

这些留到后续阶段。

## 2. 当前启用的硬规则

### 2.1 发布时间规则

当 `packages.workflow_state` 进入：

- `scheduled`
- `published`

系统强制要求：

- `publish_start_at` 不为空

### 2.2 内容包最小要求

当 `packages.workflow_state` 进入：

- `scheduled`
- `published`

系统强制要求：

- 至少有 1 个来源
- 至少有 1 个主来源
- 至少有 1 个有效加工内容
- 至少有 1 个有效 `brief`
- `primary_topic_id` 必须同时存在于 `package_topics`

### 2.3 加工内容格式规则

- `brief` 必须至少提供正文或文件
- `audio` / `slides` / `video` 必须至少提供文件或外部链接

### 2.4 主来源与主资产唯一

系统现在通过唯一索引保证：

- 一个包只能有 1 个主来源
- 一个包只能有 1 个主资产

## 3. 当前启用的编辑书签

已为 `packages` 准备 5 个后台书签：

- `待补来源`
- `待补摘要`
- `可排期`
- `已排期`
- `已发布`

这些书签用于让编辑快速切到需要处理的内容清单。

## 4. 本地使用顺序

### 4.1 应用硬规则

```bash
bash scripts/apply_phase3_rules.sh
```

### 4.2 写入后台书签

```bash
node scripts/apply_phase3_presets.mjs
```

### 4.3 运行验证

```bash
node scripts/verify_phase3_rules.mjs
```

## 5. 验证范围

验证脚本会检查这些情况：

1. 没有 `publish_start_at` 不能发布
2. 空 `brief` 不能写入
3. 同包不能出现第二个主资产
4. 同包不能出现第二个主来源
5. 满足条件后可以进入 `scheduled`
6. 已排期内容不能删掉主主题关联
7. 已排期内容不能删掉唯一主来源
8. 已排期内容不能把唯一有效摘要归档

## 6. 为什么把规则放在数据库层

这一阶段的规则不依赖编辑是否记得流程，也不依赖前台是否调用了某段逻辑。

只要数据会写进数据库，这些限制就会生效。

这样做的目的很明确：

- 后台手工编辑不会绕过去
- 后续如果接前台接口，也不会绕过去
- 规则只写一次，不会在多个地方重复

## 7. Phase 3 完成标准

满足以下条件，Phase 3 才算完成：

1. 发布状态规则已经生效
2. 内容包最小要求已经生效
3. 资产格式规则已经生效
4. 主来源唯一已经生效
5. 主资产唯一已经生效
6. 5 个后台书签已经可见
7. 验证脚本已通过

## 8. 下一步

Phase 3 完成后，进入：

- Phase 4：角色与权限
