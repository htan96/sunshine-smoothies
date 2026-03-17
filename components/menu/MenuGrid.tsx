import type { MenuItem } from "@/features/menu/types";
import MenuItemCard from "./MenuItemCard";

type Props = {
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
};

export default function MenuGrid({ items, onItemClick }: Props) {
  if (!items) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
      {items.map((item) => (
        <div key={item.id} className="min-h-0 flex flex-col w-full">
          <MenuItemCard item={item} onClick={() => onItemClick(item)} />
        </div>
      ))}
    </div>
  );
}
