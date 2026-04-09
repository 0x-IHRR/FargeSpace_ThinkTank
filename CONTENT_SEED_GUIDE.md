# 20 条真实内容试填说明

版本：V1
日期：2026-04-09
状态：Draft

关联文档：
- [PRD.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PRD.md)
- [DATA_MODEL.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/DATA_MODEL.md)
- [CONTENT_SEED_20.csv](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/CONTENT_SEED_20.csv)

## 1. 这份模板的目的

这不是运营表，也不是最终后台导入文件。

这份模板的唯一目的，是在正式写代码之前验证三件事：

1. 当前数据结构是否够用
2. 内容包、原始来源、加工资产之间的边界是否清楚
3. 是否会在真实内容面前出现大量例外情况

## 2. 怎么使用

请找 20 条你们真的可能上线的内容，不要用假数据。

每一条都按 `CONTENT_SEED_20.csv` 填写。

优先覆盖这些类型：

- 长文章
- 视频访谈
- 论文或研究报告
- 工具类内容
- 趋势类内容
- 能做成摘要的内容
- 能做成音频或幻灯片的内容

## 3. 填写规则

### 3.1 一条记录代表什么

一行代表一个准备上线的 `Package`。

这个 `Package` 至少要回答：

- 原始来源是谁
- 会被整理成什么形式
- 属于什么主题
- 会归到什么合集
- 什么时候发布

### 3.2 必须遵守的规则

- 每一行都必须有 `source_title`
- 每一行都必须有 `source_url`
- 每一行都必须有 `package_title`
- 每一行都必须有 `package_type`
- 每一行都必须有 `primary_topic`
- 每一行都必须有 `brief_required`

### 3.3 关于加工内容

这次试填只验证 V1 的四类加工资产：

- `brief`
- `audio`
- `slides`
- `video`

其中：

- `brief_required` 必须填 `yes`
- `audio_optional`、`slides_optional`、`video_optional` 可填 `yes` 或 `no`

## 4. 填完后怎么判断结构对不对

如果出现下面这些情况，说明结构还不能直接开工：

- 你总想再加一个临时字段才能描述内容
- 同一类内容每次都要换一种填法
- 你分不清某条信息应该放在 `Source` 还是 `Package`
- 你总是不确定某个加工结果到底是不是独立资产
- 你发现主题体系太虚，填到一半开始混乱

## 5. 通过标准

这 20 条内容试填通过，至少要满足：

1. 所有内容都能落进现有字段
2. 不需要加“其他说明字段”兜底
3. 同类内容填法一致
4. `Package` 和 `Source` 边界清楚
5. 主题与合集能够自然归类

## 6. 建议的填写顺序

1. 先填来源信息
2. 再定内容包标题
3. 再定主主题
4. 再判断是否要有音频、幻灯片、视频
5. 最后填合集和发布时间

## 7. 试填完成后的下一步

试填完成后只做两件事：

1. 标出最难填的 5 条内容
2. 统计最常卡住的字段

如果卡点集中在某几个字段上，再回头改 `DATA_MODEL.md`，不要先写代码绕过去。
