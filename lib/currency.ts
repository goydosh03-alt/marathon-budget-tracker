// Тимчасовий фіксований курс, поки не підключили ExchangeRate API.
// base = USD, home = PLN. 1 PLN ≈ 0.25 USD (тобто 1 USD ≈ 4 zł).
export const RATE_BASE_PER_HOME = 0.25;

export function toBase(home: number): number {
  return home * RATE_BASE_PER_HOME;
}

// $ (валюта обліку). dp — знаків після коми.
export function usd(home: number, dp = 2): string {
  return (
    "$" +
    toBase(home).toLocaleString("en-US", {
      minimumFractionDigits: dp,
      maximumFractionDigits: dp,
    })
  );
}

// zł (домашня валюта).
export function pln(home: number, dp = 0): string {
  return (
    home.toLocaleString("uk-UA", {
      minimumFractionDigits: dp,
      maximumFractionDigits: dp,
    }) + " zł"
  );
}
