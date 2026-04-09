import type { ReactNode } from "react";
import { StatePanel } from "./state-panel";

export function ErrorState({ actions }: { actions?: ReactNode }) {
  return (
    <StatePanel
      tone="error"
      title="加载失败"
      description="服务暂时不可用，请稍后重试。"
      actions={actions}
    />
  );
}
