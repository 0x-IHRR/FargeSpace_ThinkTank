# FargeSpace Think Tank Phase 11 Upload Flow

版本：V1
日期：2026-04-09
状态：Frozen

关联文件：
- [scripts/apply_phase11_upload_flow.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/apply_phase11_upload_flow.mjs)
- [scripts/verify_phase11_upload_flow.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase11_upload_flow.mjs)
- [DATA_MODEL.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/DATA_MODEL.md)
- [PHASE3_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE3_SETUP.md)
- [PHASE4_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE4_SETUP.md)

## 1. 目标

这一阶段只做一件事：

- 把后台上传与发布流程固定成可重复执行的操作方式

## 2. 当前固定的上传文件夹

根目录：

- `FargeSpace Uploads`

子目录：

- `来源封面`
- `内容封面`
- `摘要附件`
- `音频文件`
- `幻灯片文件`
- `视频文件`

## 3. 文件放置口径

| 内容类型 | 放到哪个文件夹 |
|---|---|
| 原始来源缩略图 | `来源封面` |
| 内容包封面 | `内容封面` |
| brief 附件 | `摘要附件` |
| 音频文件 | `音频文件` |
| 幻灯片文件 | `幻灯片文件` |
| 视频文件 | `视频文件` |

## 4. 当前固定的后台书签

`packages`

- `待补来源`
- `待补摘要`
- `可排期`
- `已排期`
- `已发布`

`sources`

- `最新来源`

`processed_assets`

- `摘要资产`
- `多媒体资产`

## 5. 后台操作顺序

### 5.1 先建来源

在 `sources` 中补齐：

- 标题
- 来源类型
- 平台
- 原始链接
- 原始语言
- 发布时间
- 来源封面（可选）

### 5.2 再建内容包

在 `packages` 中补齐：

- `slug`
- 标题
- 摘要
- 主主题
- 会员层级
- 内容包类型
- 难度
- 用途
- 信号等级
- 排序时间

当前先保持：

- `workflow_state = draft`

### 5.3 关联来源

在 `package_sources` 中：

- 关联至少 1 个来源
- 其中必须有 1 个主来源

### 5.4 关联主题和合集

在 `package_topics` 中：

- 把主主题也加进去

在 `package_collections` 中：

- 需要归档的内容再放入合集

### 5.5 添加加工内容

在 `processed_assets` 中：

- 至少有 1 条 `brief`
- `brief` 可以是正文，或者附件
- `audio` / `slides` / `video` 至少要有文件或外链
- 只能有 1 条主资产

### 5.6 最后排期或发布

只有满足这些条件，才允许进：

- `scheduled`
- `published`

系统会强制检查：

- 有发布时间
- 有来源
- 有主来源
- 有加工内容
- 有有效 brief
- 主主题存在于主题关联中

## 6. 当前建议的后台使用方式

编辑平时优先看：

1. `待补来源`
2. `待补摘要`
3. `可排期`
4. `已排期`
5. `已发布`

素材整理时优先看：

1. `最新来源`
2. `摘要资产`
3. `多媒体资产`

## 7. 执行命令

应用上传流程初始化：

```bash
node scripts/apply_phase11_upload_flow.mjs
```

验证上传流程：

```bash
node scripts/verify_phase11_upload_flow.mjs
```

## 8. 完成标准

满足以下条件，这一阶段才算完成：

1. 上传文件夹已创建
2. 上传书签已创建
3. 后台操作顺序已写清
4. 可通过脚本重复校验
