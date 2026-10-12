// Single source of truth for Fichua's pricing maths.
export const FICHUA_RATE = 0.07;
export const OTA_LOW = 0.15;
export const OTA_HIGH = 0.2;
export const SUBSCRIPTION_USD = 99;
export const FREE_BOOKINGS = 10;

/** How many times cheaper Fichua's commission is than an OTA rate. */
export const cheaperMultiple = (otaRate: number) => otaRate / FICHUA_RATE;

export function monthlySavings(bookingValue: number, bookings: number) {
  const savedLow = bookings * bookingValue * (OTA_LOW - FICHUA_RATE);
  const savedHigh = bookings * bookingValue * (OTA_HIGH - FICHUA_RATE);
  return { savedLow, savedHigh, keptLow: savedLow - SUBSCRIPTION_USD, keptHigh: savedHigh - SUBSCRIPTION_USD };
}

/** Bookings needed per month for commission savings to cover the subscription. */
export function breakEven(bookingValue: number) {
  if (bookingValue <= 0) return null;
  return {
    best: Math.ceil(SUBSCRIPTION_USD / (bookingValue * (OTA_HIGH - FICHUA_RATE))),
    conservative: Math.ceil(SUBSCRIPTION_USD / (bookingValue * (OTA_LOW - FICHUA_RATE))),
  };
}

// Indicative exchange rates (approx., not live). Update periodically.
export const CURRENCIES = {
  USD: { rate: 1, symbol: "$", locale: "en-US" },
  RWF: { rate: 1450, symbol: "RWF ", locale: "en-US" },
  XOF: { rate: 570, symbol: "CFA ", locale: "fr-FR" },
} as const;
export type Currency = keyof typeof CURRENCIES;

export const toCurrency = (usd: number, cur: Currency) => usd * CURRENCIES[cur].rate;

export function formatMoney(usd: number, cur: Currency) {
  const c = CURRENCIES[cur];
  const v = Math.round(toCurrency(usd, cur));
  const roundTo = cur === "USD" ? 1 : 100;
  const r = Math.round(Math.abs(v) / roundTo) * roundTo;
  return `${v < 0 ? "−" : ""}${c.symbol}${r.toLocaleString("en-US")}`;
}
