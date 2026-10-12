import { describe, expect, it } from "vitest";
import { breakEven, cheaperMultiple, monthlySavings, formatMoney, FREE_BOOKINGS, SUBSCRIPTION_USD } from "@/lib/pricing";

describe("pricing rules", () => {
  it("subscription is a flat $99 a month", () => expect(SUBSCRIPTION_USD).toBe(99));
  it("ten free bookings before payment", () => expect(FREE_BOOKINGS).toBe(10));
  it("7% vs 20% is just under 3x cheaper", () => expect(cheaperMultiple(0.2)).toBeCloseTo(2.857, 2));
  it("one $1,000 booking saves $80–$130", () => {
    const s = monthlySavings(1000, 1);
    expect(Math.round(s.savedLow)).toBe(80);
    expect(Math.round(s.savedHigh)).toBe(130);
  });
  it("break-even at $1,000 bookings is 1–2 bookings", () => expect(breakEven(1000)).toEqual({ best: 1, conservative: 2 }));
  it("break-even at $150 bookings is 6–9 bookings", () => expect(breakEven(150)).toEqual({ best: 6, conservative: 9 }));
  it("converts $99 to about RWF 143,600", () => expect(formatMoney(99, "RWF")).toBe("RWF 143,600"));
});
