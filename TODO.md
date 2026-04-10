# FargeSpace Think Tank TODO

版本：V1
日期：2026-04-09
状态：Draft

关联文档：
- [PRD.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PRD.md)
- [DATA_MODEL.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/DATA_MODEL.md)
- [CONTENT_SEED_20.csv](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/CONTENT_SEED_20.csv)

## 1. 使用方式

这份 TODO 不是概念清单，而是开工顺序表。

每个任务都尽量拆到：

- 能独立完成
- 有明确输入输出
- 有依赖边界
- 能单独验收

后面如果要多 Agent 并行，这份文档就是分工底稿。

## 2. 总体原则

先串行，后并行。

必须先锁定这些东西，后面才适合多 Agent 一起跑：

1. 术语和字段冻结
2. 数据结构冻结
3. API 合同冻结
4. 权限和可见性规则冻结

在这些没定之前就并行开发，后面一定返工。

## 3. 阶段划分

### Phase 0：冻结基础规则

目标：

- 把后续所有实现依赖的基础规则先锁死
- 当前状态：已完成，见 [PHASE0_DECISIONS.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE0_DECISIONS.md)

#### T001 冻结受控枚举值

- 范围：`source_type`、`package_type`、`publication_cycle`、`workflow_state`、`asset_type`、`language`、`status`
- 输入：`PRD.md`、`DATA_MODEL.md`
- 输出：一份最终受控值清单
- 依赖：无

#### T002 冻结主题体系

- 范围：确认 V1 首批主题列表
- 输入：`CONTENT_SEED_20.csv`
- 输出：首批 `topics` 种子值
- 依赖：T001

#### T003 冻结合集体系

- 范围：确认 V1 首批合集列表
- 输入：`CONTENT_SEED_20.csv`
- 输出：首批 `curated_collections` 种子值
- 依赖：T001

#### T004 冻结内容边界规则

- 范围：
  - `Package` 是会员主对象
  - `Source` 不可单独给会员看
  - 每个 `Package` 必须有 1 个 `Source`
  - 每个 `Package` 必须有 1 个 `ProcessedAsset`
  - 每个 `Package` 必须有 1 个 `brief`
- 输入：`PRD.md`、`DATA_MODEL.md`
- 输出：最终业务规则清单
- 依赖：无

#### T005 冻结 V1 权限规则

- 范围：`admin`、`editor`、`member`
- 输出：角色权限最终口径
- 依赖：T004

### Phase 1：后台基础环境

目标：

- 把 Directus、数据库、存储、基础配置搭起来
- 当前状态：已完成，见 [PHASE1_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE1_SETUP.md)

#### T101 选定 Directus 版本与部署形态

- 输出：版本号、运行方式、基础部署方案
- 依赖：Phase 0 完成

#### T102 创建环境变量模板

- 范围：
  - DB
  - 存储
  - CORS
  - Auth
  - Mail
- 输出：`.env.example` 结构草案
- 依赖：T101

#### T103 准备 PostgreSQL

- 输出：数据库可连接
- 依赖：T101

#### T104 准备文件存储

- 方案：本地对象存储或 S3 兼容存储
- 输出：文件上传路径可用
- 依赖：T101

#### T105 初始化 Directus 项目

- 输出：后台可访问、管理员可登录
- 依赖：T102、T103、T104

#### T106 确定 schema 导出/回放方式

- 输出：结构变更如何保存与重建
- 依赖：T105

### Phase 2：内容集合与字段建模

目标：

- 把 `DATA_MODEL.md` 真正映射成后台结构
- 当前状态：已完成，见 [PHASE2_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE2_SETUP.md)

#### T201 创建 `sources`

- 输出：字段与枚举完整
- 依赖：Phase 1 完成

#### T202 创建 `packages`

- 输出：字段、状态、发布时间、主主题、会员层级完整
- 依赖：Phase 1 完成

#### T203 创建 `processed_assets`

- 输出：资产类型、文件/外链、排序、主资产标记完整
- 依赖：Phase 1 完成

#### T204 创建 `topics`

- 输出：主题表完成
- 依赖：T002

#### T205 创建 `curated_collections`

- 输出：合集表完成
- 依赖：T003

#### T206 创建 `member_tiers`

- 输出：默认会员层级完成
- 依赖：T005

#### T207 创建 `package_sources`

- 输出：来源关联表完成
- 依赖：T201、T202

#### T208 创建 `package_topics`

- 输出：主题关联表完成
- 依赖：T202、T204

#### T209 创建 `package_collections`

- 输出：合集关联表完成
- 依赖：T202、T205

#### T210 配置唯一约束与索引

- 范围：`slug`、状态、排序时间、发布时间等
- 依赖：T201-T209

#### T211 配置后台列表视图

- 范围：字段显示、默认排序、搜索字段
- 依赖：T201-T209

Phase 2 已交付内容：

- Directus 9 个集合已建成
- 固定枚举已配置为后台下拉字段
- 13 条基础关系已配置
- 9 个 `topics`、8 个 `curated_collections`、1 个 `member_tiers` 已写入
- [directus/schema/schema.yaml](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/directus/schema/schema.yaml) 已导出
- [directus/schema/phase2-indexes.sql](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/directus/schema/phase2-indexes.sql) 已应用

### Phase 3：编辑流程与校验规则

目标：

- 让后台不仅能存东西，还能按规则发布
- 当前状态：已完成，见 [PHASE3_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE3_SETUP.md)

#### T301 配置工作流状态

- 范围：`draft`、`review`、`approved`、`scheduled`、`published`、`archived`
- 依赖：T202

#### T302 校验发布时间规则

- 规则：没有 `publish_start_at` 不可发布
- 依赖：T301

#### T303 校验内容包最小要求

- 规则：
  - 至少 1 个来源
  - 至少 1 个加工资产
  - 至少 1 个 `brief`
- 依赖：T202、T203、T207

#### T304 校验主来源唯一

- 规则：一个包只能有一个主来源
- 依赖：T207

#### T305 校验主资产唯一

- 规则：一个包只能有一个主资产
- 依赖：T203

#### T306 校验主主题存在于关联主题中

- 依赖：T202、T208

#### T307 配置编辑视图

- 视图建议：
  - 待补来源
  - 待补摘要
  - 可排期
  - 已排期
  - 已发布
- 依赖：T301-T306

Phase 3 已交付内容：

- [directus/schema/phase3-rules.sql](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/directus/schema/phase3-rules.sql) 已启用
- 主来源唯一与主资产唯一已通过唯一索引生效
- 发布前检查、内容包最小要求、摘要格式检查已通过数据库触发生效
- 5 个后台书签已写入：待补来源、待补摘要、可排期、已排期、已发布
- [scripts/verify_phase3_rules.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase3_rules.mjs) 已通过

### Phase 4：角色与权限

目标：

- 保证后台和前台的可见性不乱
- 当前状态：已完成，见 [PHASE4_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE4_SETUP.md)

#### T401 创建角色

- `admin`
- `editor`
- `member`
- 依赖：T105

#### T402 配置后台访问权限

- 规则：
  - `member` 不可进后台
  - `editor` 可管内容，不可管用户和系统设置
  - `admin` 全权限
- 依赖：T401

#### T403 配置前台读取规则

- 规则：
  - 会员只能看到 `published`
  - 且必须在发布时间窗口内
- 依赖：T301、T401

#### T404 配置关联记录可见性

- 范围：只有挂在可见 `Package` 下的 `Source` 和 `ProcessedAsset` 才能被会员读取
- 依赖：T403

#### T405 权限测试

- 测试角色：
  - `admin`
  - `editor`
  - `member`
  - 未登录用户
- 依赖：T402-T404

Phase 4 已交付内容：

- `Editor` 和 `Member` 角色已创建并绑定独立 policy
- `editor` 可管理内容，不可创建用户与修改系统权限
- `member` 仅可读取已发布且在窗口内的内容包
- 关联可见性已对 `processed_assets` / `package_sources` / `package_topics` / `package_collections` 生效
- 原始 `sources` 直接读取已关闭，避免绕过内容包可见边界
- [scripts/verify_phase4_access.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase4_access.mjs) 已通过

### Phase 11：后台上传流程

目标：

- 把后台上传、整理、发布流程固定成可执行操作
- 当前状态：已完成，见 [PHASE11_UPLOAD_FLOW.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE11_UPLOAD_FLOW.md)

#### T1101 固定上传文件夹

- 范围：来源封面、内容封面、摘要附件、音频、幻灯片、视频
- 输出：后台文件夹结构固定
- 依赖：Phase 1 完成

#### T1102 固定上传书签

- 范围：`sources`、`processed_assets`、`packages`
- 输出：上传与发布书签可直接使用
- 依赖：T1101

#### T1103 固定后台操作顺序

- 范围：先来源、再内容包、再关联、再资产、最后排期/发布
- 输出：后台操作说明文档
- 依赖：T1101、T1102

#### T1104 做可重复校验

- 范围：文件夹、书签、核心流程口径
- 输出：校验脚本
- 依赖：T1101、T1102、T1103

Phase 11 已交付内容：

- 上传文件夹结构已写入 Directus
- 上传书签已写入 `sources`、`processed_assets`、`packages`
- 后台操作顺序已写入 [PHASE11_UPLOAD_FLOW.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE11_UPLOAD_FLOW.md)
- [scripts/verify_phase11_upload_flow.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase11_upload_flow.mjs) 已通过

### Phase 12：后台内容编辑与发布流程

目标：

- 把后台编辑、审核、排期、发布、归档流程固定成可执行操作
- 当前状态：已完成，见 [PHASE12_EDITORIAL_FLOW.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE12_EDITORIAL_FLOW.md)

#### T1201 固定编辑书签

- 范围：`草稿池`、`待审核`、`已归档`
- 输出：`packages` 编辑入口补齐
- 依赖：Phase 3、Phase 11 完成

#### T1202 固定集合与字段说明

- 范围：`packages`、`sources`、`processed_assets`、关键关联表
- 输出：后台关键字段的填写口径可直接查看
- 依赖：T1201

#### T1203 固定状态切换口径

- 范围：`draft`、`review`、`approved`、`scheduled`、`published`、`archived`
- 输出：状态含义和下一步动作明确
- 依赖：T1201、T1202

#### T1204 做可重复校验

- 范围：编辑书签、集合说明、字段说明、状态顺序
- 输出：校验脚本
- 依赖：T1201-T1203

Phase 12 已交付内容：

- `packages` 编辑书签已补齐为 `草稿池`、`待补来源`、`待补摘要`、`待审核`、`可排期`、`已排期`、`已发布`、`已归档`
- 集合说明与关键字段说明已写入 Directus
- 后台编辑与发布顺序已写入 [PHASE12_EDITORIAL_FLOW.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE12_EDITORIAL_FLOW.md)
- [scripts/verify_phase12_editorial_flow.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase12_editorial_flow.mjs) 已通过

### Phase 13：正式会员登录

目标：

- 把当前演示登录替换成真实会员登录
- 当前状态：已完成，见 [PHASE13_MEMBER_AUTH.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE13_MEMBER_AUTH.md)

#### T1301 冻结登录方案

- 范围：确认前台会员登录接哪一套认证
- 建议口径：
  - 使用 Directus 邮箱密码登录
  - 前台继续保留 `/login`
  - 前台不直接暴露后台令牌
- 输出：登录方案说明文档
- 依赖：Phase 1、Phase 4、Phase 9 完成

#### T1302 冻结会员账号字段

- 范围：确认会员账号最少需要哪些字段
- 建议至少包括：
  - 邮箱
  - 显示名
  - 角色
  - `member_tier`
  - 账号状态
- 输出：账号字段清单与来源说明
- 依赖：T1301

#### T1303 配置后台会员账号结构

- 范围：把会员层级、账号状态、前台可读字段接到账号体系
- 输出：后台账号结构可用
- 依赖：T1302

#### T1304 实现真实登录动作

- 范围：
  - 前台表单提交真实认证
  - 登录失败给出明确提示
  - 不再接受任意邮箱密码直接通过
- 输出：`/login` 改为真实登录
- 依赖：T1301、T1303

#### T1305 实现真实会话写入与读取

- 范围：
  - 写入真实会话
  - 读取当前登录用户
  - 会话过期后要求重新登录
- 输出：前台会话不再是演示数据
- 依赖：T1304

#### T1306 接入会员层级校验

- 范围：
  - 登录后读取真实 `member_tier`
  - 会员层级无效时阻止进入会员区
- 输出：会员访问口径和后台层级一致
- 依赖：T1303、T1305

#### T1307 完成登出与密码重置入口

- 范围：
  - 真实登出
  - 忘记密码 / 重置密码入口
- 输出：登录闭环完整
- 依赖：T1304、T1305

#### T1308 做端到端验证

- 范围：
  - 正确账号可登录
  - 错误密码不可登录
  - 过期会话自动失效
  - 无会员权限不可进入会员区
  - 登出后无法继续访问受保护页面
- 输出：验证脚本与验收记录
- 依赖：T1304-T1307

#### T1309 更新测试环境配置

- 范围：
  - Vercel 环境变量
  - Directus 邮件与重置链接
  - 测试账号说明
- 输出：测试环境可重复部署
- 依赖：T1304-T1308

Phase 13 当前已交付内容：

- 正式会员登录已确定采用“前台 `/login` + Next 服务端代理 Directus 登录”的方案
- 前后台登录边界已冻结：会员走前台，编辑继续走 Directus Admin
- 会话口径已冻结：前台会员会话与服务端 refresh token 分离保存
- 会员账号最小模型已冻结：直接使用 `directus_users`，补 `member_tier_id` 与 `member_profile_status`
- 前台真正使用的账号字段已冻结：`userId`、`role`、`displayName`、`activeMemberTierCode`、`sessionExpiry`
- `directus_users.member_tier_id` 与 `directus_users.member_profile_status` 已写入后台
- `directus_users.member_tier_id -> member_tiers` 关系已建立
- 后台会员管理书签已补齐：`有效会员`、`待补层级`、`已停用会员`
- [scripts/apply_phase13_account_structure.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/apply_phase13_account_structure.mjs) 已可重复执行
- [scripts/verify_phase13_account_structure.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase13_account_structure.mjs) 已通过
- `/login` 已改为真实 Directus 账号认证，不再接受任意邮箱密码直接通过
- 登录失败提示已补齐：错误密码、停用账号、无权限账号都会明确提示
- 登录成功时已写入真实会员会话与服务端 refresh token
- 顶部状态区与登录页已改为读取真实后台当前用户
- refresh token 缺失或失效时，受保护页面会要求重新登录
- 会员层级现在必须真实有效，缺失层级或失效层级账号不会进入会员区
- [scripts/verify_phase13_member_tier.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase13_member_tier.mjs) 已通过
- 退出登录现在会同步注销后台 refresh token，旧会话不能继续刷新
- `/forgot-password` 与 `/reset-password` 已补齐
- [scripts/verify_phase13_auth_flow.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase13_auth_flow.mjs) 已通过
- 测试环境变量模板已补齐：`PASSWORD_RESET_URL_ALLOW_LIST`、`EMAIL_TRANSPORT`、`EMAIL_SMTP_*`
- [STAGING_DEPLOY.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/STAGING_DEPLOY.md) 已补入 Railway / Vercel 的填写说明
- 方案说明已写入 [PHASE13_MEMBER_AUTH.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE13_MEMBER_AUTH.md)

### Phase 5：种子数据与试填验证

目标：

- 确保当前结构可以撑住真实内容
- 当前状态：已完成，见 [PHASE5_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE5_SETUP.md)

#### T501 校验 CSV 结构

- 检查列名、必填列、日期、布尔值、slug 唯一性
- 输入：`CONTENT_SEED_20.csv`
- 依赖：Phase 2 完成

#### T502 归一化主题与合集

- 输出：
  - 主题种子
  - 合集种子
- 依赖：T501

#### T503 建立导入映射规则

- 范围：
  - `sources`
  - `packages`
  - `processed_assets`
  - 关联表
- 依赖：T501、T502

#### T504 Dry-run 导入 20 条内容

- 目标：只试跑，不正式导入
- 依赖：T503

#### T505 修正模型问题

- 如果 dry-run 暴露结构问题，先改结构文档，不直接写代码绕过
- 依赖：T504

#### T506 正式导入种子数据

- 条件：只有 dry-run 清洁后才执行
- 依赖：T505 或 T504 通过

Phase 5 已交付内容：

- 结构校验入口已完成：[scripts/phase5_validate_seed.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/phase5_validate_seed.mjs)
- dry-run 全流程已完成：[scripts/phase5_dry_run_import.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/phase5_dry_run_import.mjs)
- 正式导入已完成：[scripts/phase5_import_seed.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/phase5_import_seed.mjs)
- 导入共享能力已沉淀：[scripts/lib/phase5_seed.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/lib/phase5_seed.mjs)、[scripts/lib/phase5_directus.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/lib/phase5_directus.mjs)
- 20 条真实内容已入库（20 `packages` / 20 `sources` / 56 `processed_assets`）

### Phase 6：接口合同冻结

目标：

- 在前端开始前先锁定接口结构
- 当前状态：已完成，见 [PHASE6_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE6_SETUP.md)

#### T601 冻结 Package 列表接口

- 用途：首页、主题页、合集页、搜索页复用
- 字段至少包括：
  - `slug`
  - `title`
  - `summary`
  - `cover`
  - `primary_topic`
  - `package_type`
  - `sort_date`
  - `is_featured`
  - 可用资产类型
- 依赖：T202、T203、T204、T205、T403

#### T602 冻结 Package 详情接口

- 字段至少包括：
  - 基本信息
  - 有序加工资产
  - 有序来源
  - 关联主题
  - 关联合集
- 依赖：T601

#### T603 冻结搜索接口

- 筛选：
  - 主题
  - 格式
  - 来源类型
  - 发布时间
  - 内容包类型
- 依赖：T601

#### T604 冻结 Topic / Collection 摘要接口

- 用途：导航和列表页头部
- 依赖：T204、T205

#### T605 冻结前台展示日期规则

- 统一使用 `publish_start_at` 或 `sort_date`
- 依赖：T601

#### T606 冻结 SEO 回退规则

- 规则：`seo_title`、`seo_description` 为空时怎么处理
- 依赖：T602

Phase 6 已交付内容：

- 冻结接口合同文档：[API_CONTRACT.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/API_CONTRACT.md)
- 阶段说明与验收口径：[PHASE6_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE6_SETUP.md)
- 合同可执行验证脚本：[scripts/verify_phase6_contract.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase6_contract.mjs)
- T601-T606 已全部落地并完成验证

### Phase 7：前台共享壳与基础组件

目标：

- 把所有页面共用的东西先做完
- 当前状态：已完成（T701-T704 全部完成）

#### T701 定路由结构

- `/`
- `/topics/[slug]`
- `/collections/[slug]`
- `/packages/[slug]`
- `/search`
- `/login`
- 依赖：T601-T604

#### T702 做页面共享框架

- 范围：
  - 页头
  - 导航
  - 登录状态区
  - 页宽规则
  - 页脚
- 依赖：T701

#### T703 做共享展示组件

- 组件：
  - package hero
  - package card
  - topic pill
  - collection pill
  - source badge
  - asset badge
- 依赖：T601

#### T704 做共享状态组件

- 状态：
  - loading
  - empty
  - error
  - expired
  - unauthorized
  - not found
- 依赖：T702

Phase 7 当前已交付：

- T701 路由结构已落地：`/`、`/topics/[slug]`、`/collections/[slug]`、`/packages/[slug]`、`/search`、`/login`
- 路由冻结文档：[FRONTEND_ROUTES.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/FRONTEND_ROUTES.md)
- T702 共享壳已落地：页头、导航、登录状态区、页宽规则、页脚
- 共享壳文档：[FRONTEND_SHELL.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/FRONTEND_SHELL.md)
- T703 共享展示组件已落地：package hero/card、topic/collection pill、source/asset badge
- 组件文档：[FRONTEND_COMPONENTS.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/FRONTEND_COMPONENTS.md)
- T704 共享状态组件已落地：loading、empty、error、expired、unauthorized、not found
- 状态组件文档：[FRONTEND_STATES.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/FRONTEND_STATES.md)

### Phase 8：前台页面实现

目标：

- 完成 V1 的会员浏览能力
- 当前状态：已完成（T801-T806 全部完成）

#### T801 首页

- 模块：
  - featured package
  - latest packages
  - topic entry
  - collection entry
  - basic filter entry
- 依赖：T702、T703、T704、T601

#### T802 主题页

- 模块：
  - 主题标题
  - 描述
  - 内容包列表
  - 筛选
- 依赖：T703、T704、T601、T604

#### T803 合集页

- 模块：
  - 合集标题
  - 描述
  - 有序内容包列表
- 依赖：T703、T704、T601、T604

#### T804 搜索页

- 模块：
  - URL 筛选
  - 结果数
  - 清空筛选
- 依赖：T603、T703、T704

#### T805 内容包详情页

- 模块：
  - 标题
  - 摘要
  - 加工资产区
  - 来源区
  - 主题/合集信息
- 依赖：T602、T703、T704

#### T806 登录页

- 模块：
  - 会员登录
  - Directus 后台入口链接
- 依赖：T901

Phase 8 当前已交付：

- T801 首页已落地：featured package、latest packages、topic entry、collection entry、basic filter entry
- 首页实现文档：[FRONTEND_HOME.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/FRONTEND_HOME.md)
- T802 主题页已落地：主题标题、描述、内容包列表、筛选
- 主题页实现文档：[FRONTEND_TOPIC.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/FRONTEND_TOPIC.md)
- T803 合集页已落地：合集标题、描述、有序内容包列表
- 合集页实现文档：[FRONTEND_COLLECTION.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/FRONTEND_COLLECTION.md)
- T804 搜索页已落地：URL 筛选、结果数、清空筛选
- 搜索页实现文档：[FRONTEND_SEARCH.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/FRONTEND_SEARCH.md)
- T805 内容包详情页已落地：标题、摘要、加工资产区、来源区、主题/合集信息
- 详情页实现文档：[FRONTEND_PACKAGE.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/FRONTEND_PACKAGE.md)
- T806 登录页已落地：会员登录表单、Directus 后台入口链接
- 登录页实现文档：[FRONTEND_LOGIN.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/FRONTEND_LOGIN.md)

### Phase 9：登录与会话

目标：

- 把前台访问控制接起来
- 当前状态：已完成（T901-T904 全部完成）

#### T901 冻结登录入口方案

- 结论建议：
  - 会员前台登录单独处理
  - 后台用户通过 Directus Admin 入口登录
- 依赖：T401-T404

#### T902 冻结会话对象

- 至少包含：
  - user id
  - role
  - display name
  - active member tier
  - session expiry
- 依赖：T901

#### T903 路由保护

- 未登录跳 `/login`
- 依赖：T902

#### T904 登出与会话过期处理

- 依赖：T902

Phase 9 当前已交付：

- T901 登录入口方案已冻结：会员走前台登录页，后台用户走 Directus Admin 登录页
- T902 会话对象已冻结：`userId`、`role`、`displayName`、`activeMemberTierCode`、`sessionExpiry`
- T903 路由保护已落地：未登录访问受保护页面自动跳转 `/login`
- T904 会话收口已落地：登录写入会话 cookie、登出清理会话 cookie、过期会话自动清理并提示重登
- 阶段文档：[PHASE9_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE9_SETUP.md)
- 会话标准文档：[SESSION_CONTRACT.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/SESSION_CONTRACT.md)

### Phase 10：测试与上线准备

目标：

- 确保不是“能跑”，而是“可交付”
- 当前状态：已完成（T1001-T1006 全部完成）

#### T1001 页面级检查

- 首页
- 主题页
- 合集页
- 搜索页
- 内容包详情页
- 登录页
- 依赖：Phase 8 完成

#### T1002 角色权限检查

- `member`
- `editor`
- `admin`
- 未登录用户
- 依赖：Phase 4、Phase 9 完成

#### T1003 发布状态检查

- `draft`、`scheduled` 对会员不可见
- 依赖：T301、T403、T805

#### T1004 媒体组合检查

- article/video/podcast/paper/website
- brief/audio/slides/video
- 依赖：T506、T805

#### T1005 移动端检查

- 卡片布局
- 筛选区
- 详情页阅读流
- 依赖：Phase 8 完成

#### T1006 预发环境 smoke test

- 依赖：T1001-T1005

Phase 10 当前已交付：

- T1001 页面级检查已落地：覆盖首页、主题页、合集页、搜索页、内容包详情页、登录页
- T1002 角色权限检查已落地：覆盖 member/editor/admin/未登录用户
- T1003 发布状态检查已落地：验证 `draft`、`scheduled` 对会员不可见
- T1004 媒体组合检查已落地：覆盖 5 类来源与 4 类加工形态
- T1005 移动端检查已落地：覆盖卡片布局、筛选区、详情页阅读流
- T1006 预发 smoke test 已落地：串联执行环境健康、构建与 T1001-T1005 回归
- 页面检查脚本：[scripts/verify_phase10_pages.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase10_pages.mjs)
- 角色检查脚本：[scripts/verify_phase10_roles.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase10_roles.mjs)
- 发布状态检查脚本：[scripts/verify_phase10_publish_visibility.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase10_publish_visibility.mjs)
- 媒体组合检查脚本：[scripts/verify_phase10_media_mix.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase10_media_mix.mjs)
- 移动端检查脚本：[scripts/verify_phase10_mobile.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase10_mobile.mjs)
- smoke 脚本：[scripts/verify_phase10_smoke.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase10_smoke.mjs)
- 阶段文档：[PHASE10_SETUP.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE10_SETUP.md)

## 4. 可平行执行图

### 4.1 必须串行的阶段

以下阶段不要并行：

1. Phase 0
2. Phase 1
3. Phase 2
4. Phase 3
5. Phase 4
6. Phase 6

原因：

- 这些阶段决定术语、结构、权限、接口
- 一旦没定就平行开发，后面会整片返工

### 4.2 可以并行的阶段

当满足下面前提后，可以开始多 Agent 平行跑：

前提：

- Phase 2 完成
- Phase 4 完成
- Phase 6 完成

这时可以并行：

#### 并行组 A：后台易分工项

- T211 后台列表视图
- T307 编辑视图
- T501-T503 种子校验工具

#### 并行组 B：前台页面组

- T801 首页
- T802 主题页
- T803 合集页
- T804 搜索页

#### 并行组 C：详情与媒体组

- T805 内容包详情页
- T806 登录页
- brief/audio/slides/video 渲染组件

#### 并行组 D：环境与测试组

- 部署环境配置
- T1001-T1005 测试用例

## 5. 多 Agent 运行建议

可以，而且应该这样做，但要分阶段。

### 不适合多 Agent 的阶段

- Phase 0 到 Phase 6

原因：

- 这些阶段主要在“定规则”
- 多人同时改，容易把边界改乱

### 适合多 Agent 的阶段

当 Phase 6 完成后，可以按下面方式并行：

#### Agent 1：后台体验

- T211
- T307
- 后台字段 UI 整理

#### Agent 2：前台列表页

- T801
- T802
- T803

#### Agent 3：搜索与详情页

- T804
- T805
- T806
- 媒体渲染

#### Agent 4：环境与测试

- 部署配置
- 测试脚本
- smoke test

## 6. 当前最合理的开工顺序

推荐实际执行顺序：

1. Phase 0
2. Phase 1
3. Phase 2
4. Phase 3
5. Phase 4
6. Phase 5
7. Phase 6
8. 进入多 Agent 并行开发
9. Phase 10 收尾

## 7. 当前结论

是的，这个项目后面可以多 Agent 一起跑。

但前提不是“任务很多”，而是：

- 数据结构先定
- 接口先定
- 权限先定
- 依赖先拆清楚

现在这份 `TODO.md` 的作用，就是把这些前提变成真正可执行的顺序表。
