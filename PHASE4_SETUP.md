# FargeSpace Think Tank Phase 4 Access

版本：V1  
日期：2026-04-09  
状态：Frozen

关联文件：
- [directus/schema/phase4-access.sql](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/directus/schema/phase4-access.sql)
- [scripts/apply_phase4_access.sh](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/apply_phase4_access.sh)
- [scripts/verify_phase4_access.mjs](/Users/ihrr/Code/python/MVP/FargeSpace_ThinkTank/scripts/verify_phase4_access.mjs)

## 1. Phase 4 目标

Phase 4 只做一件事：

- 把后台和会员读取权限固定成可复用规则

## 2. 当前角色定义

- `Administrator`：保留系统默认全权限
- `Editor`：可管理内容，不可管理用户和系统设置
- `Member`：不可进入后台，只能读会员可见内容

## 3. 当前政策定义

- `Editor Content Policy`
  - `app_access=true`
  - `admin_access=false`
  - 可读写内容集合
  - 不可读写 `users`、`roles`、`policies`、`permissions`

- `Member Read Policy`
  - `app_access=false`
  - `admin_access=false`
  - 只允许读取发布窗口内的内容

## 4. 会员可见范围

会员读取规则：

1. `packages` 只看 `workflow_state=published`
2. `publish_start_at <= now`
3. `publish_end_at` 为空或 `>= now`

关联内容可见性：

- `processed_assets` 仅能读取挂在可见 `packages` 下的记录
- `package_sources` / `package_topics` / `package_collections` 仅能读取挂在可见 `packages` 下的记录
- `sources` 直接读取默认关闭，避免绕过内容包可见性规则

## 5. 本地使用顺序

### 5.1 应用权限规则

```bash
bash scripts/apply_phase4_access.sh
```

### 5.2 运行验证

```bash
node scripts/verify_phase4_access.mjs
```

## 6. 验证范围

验证脚本会检查：

1. `member` 只能看到已发布且在窗口内的内容包
2. `member` 只能看到这些内容包对应的关联记录与加工内容
3. `editor` 可以创建内容包
4. `editor` 不能创建用户
5. 未登录用户不能读取会员内容

## 7. Phase 4 完成标准

满足以下条件，Phase 4 才算完成：

1. `Editor` / `Member` 已存在并绑定对应 policy
2. `editor` 可管内容，不能管用户和系统设置
3. `member` 前台只读已发布窗口内容
4. 关联可见性已随 `package` 生效
5. 权限验证脚本通过

## 8. 下一步

Phase 4 完成后，进入：

- Phase 5：种子数据与试填验证
