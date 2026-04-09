import { StatePanel } from "./state-panel";

type EmptyStateProps = {
  title?: string;
  description?: string;
};

export function EmptyState({
  title = "暂无内容",
  description = "当前筛选条件下还没有可显示的内容包。",
}: EmptyStateProps) {
  return <StatePanel tone="empty" title={title} description={description} />;
}
