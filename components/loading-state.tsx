import { StatePanel } from "./state-panel";

export function LoadingState() {
  return (
    <StatePanel
      tone="loading"
      title="数据加载中"
      description="正在同步内容包列表，请稍候。"
    />
  );
}
