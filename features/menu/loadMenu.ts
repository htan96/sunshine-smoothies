import { SquareClient } from "square";
import { transformCatalog } from "./transform";

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
});

export async function loadMenu(locationId: string) {

  let cursor: string | undefined = undefined;
  const objects: any[] = [];

  do {
    const res = await squareClient.catalog.list({
      cursor,
    });

    const pageObjects = (res as any).objects ?? (res as any).result?.objects ?? [];

    objects.push(...pageObjects);

    cursor = (res as any).cursor ?? (res as any).result?.cursor ?? undefined;

  } while (cursor);

  const { items } = transformCatalog(objects, locationId);

  return items;
}