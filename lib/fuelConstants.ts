export const PACK_VARIATIONS: Record<string, string> = {
  MEDIUM: "KXQQMGMMFQ6W3HR4KSCALRAV",
  LARGE: "XWUYXYSNYYWNVJU3EJSIYTLL",
  XL: "JM44WSKHPJGAMNSJTSOQIH4R",
  JUMBO: "NW2DIXVFXRFELXRUNRDB3NE2",
};

// Fuel Pack Redemptions
export const REDEEM_VARIATIONS: Record<string, string> = {
  MEDIUM: "RMILMPJ3UMVOMOH4LFBQDS4H",
  LARGE: "BWJMGIMUZHU3EVPBEKMFMPEB",
  XL: "F7QLDQMENXO4CIOQO6QPHIV5",
  JUMBO: "7XQ7EXVJELMIM63UDTLMLAC7",
};

const variationIdToSize = new Map<string, string>();
for (const [size, id] of Object.entries(PACK_VARIATIONS)) {
  variationIdToSize.set(id, size);
}
for (const [size, id] of Object.entries(REDEEM_VARIATIONS)) {
  variationIdToSize.set(id, size);
}

const SIZE_DISPLAY: Record<string, string> = {
  MEDIUM: "Medium",
  LARGE: "Large",
  XL: "XL",
  JUMBO: "Jumbo",
};

/** Returns "Medium", "Large", "XL", or "Jumbo" for Fuel Pack/Redemption variations; otherwise null. */
export function getFuelVariationDisplayName(variationId: string): string | null {
  const size = variationIdToSize.get(variationId);
  if (!size) return null;
  return SIZE_DISPLAY[size] ?? size;
}