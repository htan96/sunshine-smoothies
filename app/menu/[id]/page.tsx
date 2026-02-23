"use client";

import { useParams, notFound } from "next/navigation";
import { useMenu } from "@/features/menu/useMenu";
import MenuItemDetail from "@/components/menu/MenuItemDetail";

export default function MenuItemPage() {
  const params = useParams();
  const id = params?.id as string;

  const { items, loading } = useMenu();

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );
  }

  const item = items.find((i) => i.id === id);

  if (!item) return notFound();

  return <MenuItemDetail item={item} />;
}