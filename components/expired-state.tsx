import type { ReactNode } from "react";
import { StatePanel } from "./state-panel";

export function ExpiredState({ actions }: { actions?: ReactNode }) {
  return (
    <StatePanel
      tone="expired"
      title="内容已下线"
      description="这个内容包已超出展示窗口，暂时不可查看。"
      actions={actions}
    />
  );
}
