import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import type { TopicDisplayItem } from "@/lib/ui-models";

export function TopicPill({ topic }: { topic: TopicDisplayItem }) {
  return (
    <Link className="topic-pill" href={ROUTES.topicDetail(topic.slug)}>
      {topic.name}
    </Link>
  );
}
