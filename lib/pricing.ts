/**
 * Tax rate used for client-side price estimates.
 * Should match Square's tax configuration for your locations.
 * Vallejo, CA combined rate is typically ~9.25%.
 */
export const TAX_RATE_PERCENT = 9.25;

/** Convert percent to decimal (e.g. 9.25 → 0.0925) */
export function taxRateDecimal(): number {
  return TAX_RATE_PERCENT / 100;
}

/** Calculate tax in cents from subtotal in cents */
export function calculateTaxCents(subtotalCents: number): number {
  return Math.round(subtotalCents * taxRateDecimal());
}

/** Calculate final total in cents (subtotal + tax) */
export function calculateTotalWithTaxCents(subtotalCents: number): number {
  return subtotalCents + calculateTaxCents(subtotalCents);
}
