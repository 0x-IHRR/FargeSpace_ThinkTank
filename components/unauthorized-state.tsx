import type { ReactNode } from "react";
import { StatePanel } from "./state-panel";

export function UnauthorizedState({ actions }: { actions?: ReactNode }) {
  return (
    <StatePanel
      tone="unauthorized"
      title="权限不足"
      description="请先登录会员账号，或检查账号是否具备访问权限。"
      actions={actions}
    />
  );
}
