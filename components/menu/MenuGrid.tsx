import type { MenuItem } from "@/features/square/types";
import MenuItemCard from "./MenuItemCard";

type Props = {
  items: MenuItem[];
};

export default function MenuGrid({ items }: Props) {
  if (!items) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
