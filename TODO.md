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

### Phase 14：前台 UI 精修

目标：

- 在不改产品结构的前提下，把前台做成更安静、更像会员智库的视觉体验
- 当前状态：已完成（T1401-T1409 全部完成），见 [PHASE14_UI_POLISH.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE14_UI_POLISH.md)

#### T1401 冻结视觉基线

- 输出：视觉方向、颜色基线、字体层级、间距规则
- 依赖：Phase 13 完成

#### T1402 收敛全局设计 token

- 输出：全站颜色、边框、按钮、标签统一
- 依赖：T1401

#### T1403 精修共享壳

- 输出：顶部品牌区、导航、状态区、页脚改版
- 依赖：T1402

#### T1404 精修首页首屏

- 输出：首屏主推荐重排，形成唯一主视觉
- 依赖：T1403

#### T1405 精修首页次级区

- 输出：最新内容、主题、合集、搜索入口重排
- 依赖：T1404

#### T1406 精修会员入口页

- 输出：登录页、忘记密码页、重置密码页风格统一，并改成人工重置口径
- 依赖：T1403

#### T1407 精修内容阅读页

- 输出：详情页阅读体验与信息层级优化
- 依赖：T1402

#### T1408 精修浏览页

- 输出：主题页、合集页、搜索页视觉统一
- 依赖：T1405、T1407

#### T1409 做桌面端与移动端视觉回归

- 输出：视觉回归记录与修正清单
- 依赖：T1403-T1408

Phase 14 当前已交付内容：

- 视觉主张已冻结：安静的会员阅读桌，克制、留白、偏编辑部
- 首页内容节奏已冻结：先主推荐，再最新内容与主题书架，再进入合集与检索
- 交互主张已冻结：少量过渡、弱阴影、强留白
- 颜色基线已冻结：收敛为中性色 + 单一弱强调色
- 字体层级已冻结：同一屏不超过四档字号
- 间距、边框、标签、按钮规则已冻结
- `globals.css` 已开始按新 token 收敛颜色、边框、阴影、按钮与标签
- “忘记密码”页已改成人工重置提示
- 共享壳已精修：顶部品牌区、导航、状态区和页脚已统一成会员站口径
- 首页首屏已精修：改成左侧说明、右侧本期内容包的单一主推荐结构
- 首页次级区已精修：最新内容、主题、合集和搜索入口已降噪重排
- 会员入口页已精修：登录、忘记密码、重置密码页已统一视觉，忘记密码保留人工重置口径
- 内容阅读页已精修：标题区、资产清单、来源区和主题/合集附属区已降噪重排
- 浏览页已精修：主题页、合集页、搜索页统一标题、筛选和列表语言
- 桌面端与移动端视觉回归已完成，当前未发现 T1409 必须修复的问题
- 详细口径已写入 [PHASE14_UI_POLISH.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE14_UI_POLISH.md)

### Phase 15：测试环境验收与发布收口

目标：

- 把测试环境从“可以部署”推进到“可以按真实流程验收”
- 当前状态：已完成（T1501-T1505 已完成，Directus 文件上传已修复），见 [PHASE15_STAGING_ACCEPTANCE.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE15_STAGING_ACCEPTANCE.md)

#### T1501 统一测试环境变量清单

- 输出：Vercel 与 Railway 变量清单、命名收敛、变量检查脚本
- 依赖：Phase 14 完成

#### T1502 做线上前台页面验收

- 输出：首页、登录页、搜索页、主题页、合集页、详情页线上可访问记录
- 依赖：T1501

#### T1503 做真实会员登录验收

- 输出：有效会员、无效会员、退出登录三类验收记录
- 依赖：T1501、T1502

#### T1504 做后台发布到前台展示链路验收

- 输出：后台创建/编辑/发布内容后，前台列表与详情页可见
- 依赖：T1501、T1502、T1503

#### T1505 记录测试环境问题清单

- 输出：必须修复问题、可后置优化问题、已验证通过项目
- 依赖：T1502-T1504

Phase 15 当前已交付内容：

- 测试环境变量清单已从 S3 优先改成当前实际使用的 Railway Volume 优先
- `.env.staging.example` 已改为 Vercel frontend、Railway Directus、Railway PostgreSQL、Railway Volume 四组
- Railway Directus 使用 `KEY`、`SECRET`、`ADMIN_EMAIL`、`DB_HOST` 等实际运行变量名
- 本地 `docker-compose.yml` 已统一使用 `PUBLIC_URL`
- SMTP 已改为可选项，当前继续采用人工重置密码
- 变量检查脚本已新增：[scripts/verify_phase15_env.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase15_env.mjs)
- 线上前台页面验收已完成：未登录访问会员区页面会跳转登录页，并保留正确 `next` 返回路径
- 桌面端 `1280x900` 与移动端 `390x844` 均未发现横向溢出或应用错误页
- 真实会员登录验收已完成：有效会员可进入会员区，无效会员会被拦截，退出后不能继续访问受保护页面
- T1503 临时创建的 2 个 Directus 测试账号已在验收后删除
- 后台发布到前台展示链路已完成：临时发布的测试内容包可在搜索页和详情页看到，验收后已清理
- T1504 发现并修复会员页连续访问时会话被误判过期的问题
- T1505 已完成测试环境问题清单：已通过项、必须修复项、可后置优化项均已写入验收文档
- Directus 文件上传问题已修复：Railway Directus 服务补 `RAILWAY_RUN_UID=0` 后，测试文件上传与删除均已通过
- 当前无已知必须修复问题
- 可后置项：Directus 健康检查仍提示 `email:connection` 为 `ESOCKET`，当前人工重置密码流程不依赖邮件发送

### Phase 16：UI 精修

目标：

- 按已认可的粗线框方向完成 UI 精修
- 当前状态：已完成，见 [PHASE16_UI_REFINEMENT.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE16_UI_REFINEMENT.md)

#### UI16-01 收敛全局设计 token 和页面骨架

- 输出：桌面端 rail 宽度、米白网格底、细线框、弱圆角、弱阴影
- 依赖：Phase 15 完成

#### UI16-02 精修左侧会员导航壳

- 输出：左侧窄栏、`FS` 品牌入口、竖排导航、会员状态入口
- 依赖：UI16-01

#### UI16-03 精修首页首屏与主推荐

- 输出：单一主入口、主推荐资料包、低信息密度首屏
- 依赖：UI16-01、UI16-02

#### UI16-04 精修首页次级区和入口

- 输出：最新内容、主题、合集、搜索入口统一线框语言
- 依赖：UI16-03

#### UI16-05 精修搜索、主题、合集浏览页

- 输出：浏览页 hero、筛选区、结果列表统一视觉
- 依赖：UI16-01、UI16-02

#### UI16-06 精修内容详情页

- 输出：详情页标题区、加工资产、来源、主题与合集区统一视觉
- 依赖：UI16-01、UI16-02

#### UI16-07 精修登录与密码页

- 输出：登录页、忘记密码页、重置密码页统一会员资料库视觉
- 依赖：UI16-01、UI16-02

#### UI16-08 移动端回归、构建与文档

- 输出：桌面端与移动端浏览器检查、类型检查、生产构建、阶段文档
- 依赖：UI16-03 到 UI16-07

Phase 16 当前已交付内容：

- 桌面端已切换为左侧窄栏会员导航
- 全局视觉已收敛为米白底、细线框、大留白、弱阴影
- 首页首屏、首页次级区、搜索页、主题页、合集页、详情页、登录相关页已统一视觉方向
- 桌面端首页、搜索页、详情页已做浏览器检查
- 移动端首页已做浏览器检查
- 当前未发现横向溢出或错误覆盖层
- `npm run typecheck` 已通过
- `npm run build` 已通过

### Phase 17：开放预览模式

目标：

- 先放开前端产品页面，方便继续精修 UI
- 当前状态：已完成，见 [PHASE17_OPEN_PREVIEW.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE17_OPEN_PREVIEW.md)

#### T1701 冻结开放预览策略

- 输出：明确这是临时模式，不删除会员制代码，只通过开关放开页面
- 依赖：Phase 16 完成

#### T1702 新增预览开关

- 输出：新增 `OPEN_PREVIEW_MODE`，本地默认开放，生产环境默认不开放
- 依赖：T1701

#### T1703 放开前端页面访问

- 输出：首页、搜索页、主题页、合集页、详情页都能直接打开
- 依赖：T1702

#### T1704 弱化或隐藏后台入口

- 输出：开放预览时，普通前端不显示后台入口
- 依赖：T1702

#### T1705 保留登录页但不强制使用

- 输出：登录页仍存在，但浏览产品页面不必先登录
- 依赖：T1703、T1704

#### T1706 检查导航跳转

- 输出：左侧导航、本期资料包、浏览全部、主题、合集、搜索等按钮能跳到对应页面
- 依赖：T1703

#### T1707 做浏览器回归

- 输出：桌面端检查首页、搜索页、主题页、合集页、详情页、登录页
- 依赖：T1706

#### T1708 写回文档

- 输出：记录当前是开放预览模式，会员权限后置恢复
- 依赖：T1707

Phase 17 当前已交付内容：

- 新增 `OPEN_PREVIEW_MODE`
- 本地开发默认开放预览，生产环境默认不开放
- 开放预览时，前端页面不再被登录拦截
- 开放预览时，左侧栏和登录页不显示 Directus 后台入口
- 登录页保留，但不是浏览前台产品页面的必要入口
- 浏览器已检查首页、搜索页、主题页、合集页、内容包详情页、登录页
- 当前未发现登录拦截、错误覆盖层或横向溢出

Phase 17 后置待办：

- T1709：排查 Vercel 上 `OPEN_PREVIEW_MODE=true` 重新部署后仍未生效的问题。重点检查变量是否加在正确环境、部署是否使用最新提交、是否需要改用 `NEXT_PUBLIC_OPEN_PREVIEW_MODE`、middleware 是否读取到变量，以及是否命中旧部署或缓存。
- T1710：整理管理员登录与后台入口策略。开放预览阶段前端不展示后台入口；后续恢复会员制和角色权限时，再决定后台入口是否仅管理员可见，或改为内部单独访问地址。

### Phase 18：UI 信息层级收敛

目标：

- 解决“有结构但内容显乱”的问题，让页面更像清晰的会员资料库，而不是每页都像视觉海报
- 当前状态：已完成（T1801-T1812 全部完成），详见 [PHASE18_UI_CONSOLIDATION.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE18_UI_CONSOLIDATION.md)

#### T1801 冻结 UI 收敛原则

- 输出：确认页面主次规则、每页唯一视觉重点、哪些装饰需要降级
- 依赖：Phase 17 完成

#### T1802 收敛字体层级

- 输出：首页标题、页面标题、卡片标题、正文、标签、按钮的字号与行高规则
- 依赖：T1801

#### T1803 降低装饰干扰

- 输出：背景网格、斜切图形、内描边、边框密度和阴影强度的删减方案
- 依赖：T1801、T1802

#### T1804 重做内容卡片信息层级

- 输出：资料条目统一为“标题 → 摘要 → 元信息/标签 → 操作入口”，减少同一行内的信息竞争
- 依赖：T1802

#### T1805 收敛首页首屏与最新内容区

- 输出：首页保留高级感，但降低首屏右侧卡片压迫感，最新内容区改成更易扫读的资料列表
- 依赖：T1803、T1804

#### T1806 收敛主题页、合集页、搜索页

- 输出：浏览页从封面式大标题改成资料库工作区，压缩 hero 高度，筛选和结果列表更清楚
- 依赖：T1803、T1804

#### T1807 收敛内容详情页

- 输出：详情页标题区、加工资产、来源、主题/合集关系重新分层，减少侧栏和正文互相抢注意力
- 依赖：T1803、T1804

#### T1808 收敛登录与辅助页面

- 输出：登录、忘记密码、重置密码页面统一为轻量说明，不暴露技术信息，不抢主产品页面风格
- 依赖：T1802、T1803

#### T1809 复查左侧导航与状态区

- 输出：左侧导航、会员状态、开放预览提示降噪，确保它们不压过页面内容
- 依赖：T1805、T1806、T1807

#### T1810 做移动端收敛检查

- 输出：手机端首页、列表页、详情页不拥挤，不出现横向溢出，导航和卡片可读
- 依赖：T1805-T1809

#### T1811 做视觉 QA 清单

- 输出：记录已修复项、仍需人工判断项、可后置项
- 依赖：T1810

#### T1812 做最终验证与提交

- 输出：类型检查、浏览器检查、必要时生产构建，并提交本阶段改动
- 依赖：T1811

Phase 18 完成标准：

- 首页、主题页、合集页、搜索页、详情页、登录页都不再给人“信息都在抢注意力”的感觉
- 页面仍保留米白、细线、会员资料库的视觉方向
- 列表和详情优先服务阅读与查找，不再用过强装饰压过内容
- 桌面端和移动端都通过浏览器检查

Phase 18 当前已交付内容：

- 卡片结构已改成标题、摘要、元信息、操作的单一阅读流
- 全局标题、正文、标签、按钮的层级已降低
- 背景网格、斜切装饰、重边框和状态区已降噪
- 首页、主题页、合集页、搜索页、详情页、登录相关页的小标题已统一为中文功能标签
- 桌面端和移动端浏览器检查已通过
- 当前未发现错误覆盖层或横向溢出

### Phase 19：标题换行与阅读宽度修正

目标：

- 解决中英混排标题被硬挤成多行、单字断行、卡片标题显得别扭的问题
- 当前状态：已完成（T1901-T1906 全部完成）

#### T1901 明确排版修正标准

- 输出：首页推荐卡、内容详情页、列表页标题的换行标准
- 依赖：Phase 18 完成

#### T1902 修正首页推荐卡标题

- 输出：首页右侧推荐卡使用更短的展示标题，避免在小卡片里显示完整长标题
- 依赖：T1901

#### T1903 修正内容详情页标题宽度

- 输出：详情页保留完整标题，但降低强制窄宽度和过大字号带来的断行
- 依赖：T1901

#### T1904 修正列表与侧栏标题换行

- 输出：列表卡片、来源侧栏、加工资产标题使用更稳定的字号、行高和换行规则
- 依赖：T1902、T1903

#### T1905 桌面与移动端浏览器检查

- 输出：首页、详情页、搜索页、主题页桌面和移动端无错误覆盖层、无横向溢出、标题换行自然
- 依赖：T1902-T1904

#### T1906 验证并提交

- 输出：类型检查通过，提交本次排版修正
- 依赖：T1905

Phase 19 当前已交付内容：

- 首页推荐卡已改成短展示标题，完整标题仍保留在详情页
- 内容详情页标题列已放宽，字号已降低，移动端冒号后的说明独立成行
- 列表、来源侧栏、加工资产标题的字号、行高和换行规则已收敛
- 桌面端检查首页、详情页、搜索页通过；移动端检查首页、详情页通过
- 当前未发现错误覆盖层或横向溢出

### Phase 20：详情与首页细节继续收敛

目标：

- 继续清理前端里不必要的说明文字和空间浪费，让页面更像给会员阅读的资料库
- 当前状态：已完成（T2001-T2006 全部完成）

#### T2001 写入本轮原子级 TODO

- 输出：把本轮修复项拆清楚，避免多个 UI 问题混在同一次修改里
- 依赖：Phase 19 完成

#### T2002 修详情页标题拆行

- 输出：内容标题上方放英文主名，下方放中文说明；“指南整理”进入第二行
- 依赖：T2001

#### T2003 隐藏详情页语言字段

- 输出：不再展示“语言：zh”这类后台字段
- 依赖：T2002

#### T2004 去掉首页最新区重复标题

- 输出：避免“最新入库”和“最新整理”表达重复
- 依赖：T2003

#### T2005 修首页小入口空间利用

- 输出：检索入口小块更均衡，文字不挤在左侧，右侧空白减少
- 依赖：T2004

#### T2006 后置内容预览模块方案

- 输出：把视频、音频、文档、文章预览作为后续单独模块，不混进本轮小修
- 依赖：T2005

Phase 20 当前已交付内容：

- 详情页标题已改为英文主名在上、中文说明在下；“指南整理”进入第二行
- 详情页已隐藏“语言：zh”这类后台字段
- 首页最新区已去掉“最新入库 / 最新整理”的重复标题
- 首页检索入口已改成均匀小方块，文字居中，空间分配更平衡
- 内容预览模块已后置，不与本轮小修混在一起；后续可单独设计视频悬停预览、音频试听、文档封面和文章摘要预览
- 类型检查通过；详情页、首页桌面与移动端浏览器检查通过

### Phase 21：内容运营统一上传台

目标：

- 给内容运营者提供一个“一处填写、一处上传、一键生成资料包”的后台入口
- 底层继续保留 `packages`、`sources`、`processed_assets`、`package_sources`、`package_topics`、`package_collections` 的结构，但不要求运营者手动在多个集合之间来回跳
- 当前状态：进行中（T2101-T2104 已完成）

模块划分：

- 模块 A：运营入口数据模型
- 模块 B：统一上传表单
- 模块 C：自动拆分生成逻辑
- 模块 D：后台可用性与权限
- 模块 E：校验、回滚与培训文档

#### T2101 冻结统一上传台字段清单

- 输出：运营者在一个页面内需要填写的最小字段清单
- 范围：标题、摘要、来源类型、平台、原始链接、主题、合集、加工内容、上传文件、发布状态
- 不做：创建数据库字段
- 依赖：Phase 20 完成
- 状态：已完成，见 [PHASE21_CONTENT_INTAKE.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE21_CONTENT_INTAKE.md)

#### T2102 设计统一上传台状态流

- 输出：`draft`、`ready`、`generated`、`failed`、`archived` 的状态定义
- 范围：运营草稿、生成成功、生成失败、归档
- 不做：替换 `packages.workflow_state`
- 依赖：T2101
- 状态：已完成，见 [PHASE21_CONTENT_INTAKE.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE21_CONTENT_INTAKE.md)

#### T2103 新增 `content_intake` 集合设计

- 输出：`content_intake` 集合字段设计
- 字段：标题、摘要、原始链接、来源类型、平台、原始语言、主题、合集、摘要正文、音频文件、PPT 文件、视频文件、封面、是否发布、生成状态、错误信息
- 不做：前台读取 `content_intake`
- 依赖：T2101、T2102
- 状态：已完成，见 [PHASE21_CONTENT_INTAKE.md](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/PHASE21_CONTENT_INTAKE.md)

#### T2104 新增 Directus 建表脚本

- 输出：可重复执行的 `content_intake` 建表脚本
- 范围：集合、字段、关系、文件字段、必要说明
- 不做：自动生成 `packages`
- 依赖：T2103
- 状态：已完成，见 [scripts/apply_phase21_content_intake.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/apply_phase21_content_intake.mjs)

#### T2105 配置统一上传台表单顺序与中文说明

- 输出：Directus 后台里 `content_intake` 的字段分组、说明文字、显示顺序
- 分组：基础信息、原始来源、加工内容、发布设置、生成状态
- 不做：自定义 Directus 插件
- 依赖：T2104

#### T2106 配置运营者只看统一上传台

- 输出：内容运营角色默认只看到 `content_intake` 和必要文件入口
- 范围：权限、书签、隐藏底层关联集合
- 不做：删除底层集合
- 依赖：T2105

#### T2107 设计生成逻辑映射规则

- 输出：`content_intake` 如何拆成 `sources`、`packages`、`processed_assets`、`package_sources`、`package_topics`、`package_collections`
- 规则：一个 intake 生成一个 package，至少一个 source，至少一个 brief，可选 audio/slides/video
- 不做：写入数据库
- 依赖：T2103

#### T2108 实现生成脚本 dry-run

- 输出：读取一条 `content_intake`，打印将要创建/更新的底层记录
- 要求：不写入数据库
- 依赖：T2107

#### T2109 实现生成脚本正式写入

- 输出：把一条 `content_intake` 正式生成到底层集合
- 要求：避免重复生成；失败时写入错误信息
- 依赖：T2108

#### T2110 实现生成结果回写

- 输出：生成成功后回写 `generated_package_id`、`generated_at`、`generation_status`
- 要求：运营者能在统一上传台看到生成结果
- 依赖：T2109

#### T2111 增加最小校验规则

- 输出：统一上传台保存或生成前的必填检查
- 规则：标题、摘要、来源链接、来源类型、主题、至少一种加工内容
- 不做：复杂审核流
- 依赖：T2109

#### T2112 增加重复来源检测

- 输出：原始链接已存在时复用已有 `source`，避免重复创建
- 依赖：T2109

#### T2113 增加发布模式选择

- 输出：运营者可选择“保存草稿”或“直接发布”
- 规则：保存草稿生成 `draft`；直接发布生成 `published` 并补齐发布时间
- 依赖：T2111

#### T2114 写统一上传台验证脚本

- 输出：验证集合存在、字段存在、权限存在、dry-run 正常、正式生成正常
- 依赖：T2104、T2109、T2110

#### T2115 写运营者使用手册

- 输出：非技术版操作手册
- 内容：新增视频、上传 PPT、上传音频、只放链接、保存草稿、发布、失败后怎么处理
- 依赖：T2114

#### T2116 后置 Directus 自定义模块评估

- 输出：评估是否需要做真正的 Directus 自定义模块或改成 Next.js 独立运营后台
- 原则：如果 `content_intake` 单表表单已经够用，暂不做自定义模块
- 依赖：T2115

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
