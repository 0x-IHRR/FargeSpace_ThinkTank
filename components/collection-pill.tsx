import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import type { CollectionDisplayItem } from "@/lib/ui-models";

export function CollectionPill({
  collection,
}: {
  collection: CollectionDisplayItem;
}) {
  return (
    <Link
      className="collection-pill"
      href={ROUTES.collectionDetail(collection.slug)}
    >
      {collection.name}
    </Link>
  );
}
