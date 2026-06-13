export const DEFAULT_CURRENCY = 'ARS' as const;
export const DEFAULT_CURRENCY_LOCALE = 'es-AR' as const;

export const CURRENCY_LABELS: Record<string, string> = {
  ARS: 'Peso argentino (ARS)',
  EUR: 'Euro (EUR)',
  USD: 'Dólar estadounidense (USD)',
};

export function getCurrencyLabel(currency: string = DEFAULT_CURRENCY): string {
  return CURRENCY_LABELS[currency] ?? currency;
}

export function getCurrencySymbol(currency: string = DEFAULT_CURRENCY): string {
  const parts = new Intl.NumberFormat(DEFAULT_CURRENCY_LOCALE, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }).formatToParts(0);

  return parts.find((part) => part.type === 'currency')?.value ?? currency;
}

export function formatMenuPrice(
  price: string | number,
  currency: string = DEFAULT_CURRENCY,
): string {
  const value = typeof price === 'number' ? price : Number.parseFloat(price);

  if (!Number.isFinite(value)) {
    return String(price);
  }

  return new Intl.NumberFormat(DEFAULT_CURRENCY_LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
