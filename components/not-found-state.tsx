import type { ReactNode } from "react";
import { StatePanel } from "./state-panel";

export function NotFoundState({ actions }: { actions?: ReactNode }) {
  return (
    <StatePanel
      tone="not-found"
      title="内容不存在"
      description="这个路径没有对应内容，可能已被移动或删除。"
      actions={actions}
    />
  );
}
