// Категорія → іконка Solar + колір диска.
// Для чого іконки нема (кастомні категорії юзера, Кафе/Аптека/Одяг…) —
// повертаємо null, і диск малює емодзі, як і раніше. Домовленість: кастомні
// категорії лишаються на емодзі, поки не з'являться відповідні іконки.

export type CatVisual = { icon: string | null; color: string };

const MAP: Record<string, CatVisual> = {
  "Їжа":         { icon: "BoldShoppingEcommerceCartLarge", color: "var(--sc-cat-orange)" },
  "Транспорт":   { icon: "BoldTransportPartsServiceBus",   color: "var(--sc-cat-blue)" },
  "Розваги":     { icon: "BoldAstronomyStarsMinimalistic", color: "var(--sc-cat-purple)" },
  "Комунальні":  { icon: "BoldEssentionalUIHome2",         color: "var(--sc-cat-teal)" },
  "Зарплата":    { icon: "BoldMoneyMoneyBag",              color: "var(--sc-cat-green)" },
  "Фриланс":     { icon: "BoldMoneyDollarMinimalistic",    color: "var(--sc-cat-green)" },
};

// Кольори для категорій без іконки — щоб диск усе одно був у палітрі системи.
const FALLBACK_COLOR: Record<string, string> = {
  "Кафе": "var(--sc-cat-orange)",
  "Аптека": "var(--sc-cat-red)",
  "Одяг": "var(--sc-cat-purple)",
  "Подарунок": "var(--sc-cat-purple)",
  "Інше": "var(--sc-cat-teal)",
};

export function catVisual(category: string, isIncome: boolean): CatVisual {
  const hit = MAP[category];
  if (hit) return hit;
  if (isIncome) return { icon: "BoldMoneyMoneyBag", color: "var(--sc-cat-green)" };
  return { icon: null, color: FALLBACK_COLOR[category] ?? "var(--sc-cat-teal)" };
}

export const ACCOUNT_ICON: Record<string, string> = {
  cash: "BoldMoneyWallet",
  card: "BoldMoneyCard",
  bank: "BoldMoneyCard",
};
export const ACCOUNT_COLOR: Record<string, string> = {
  cash: "var(--sc-cat-orange)",
  card: "var(--sc-cat-blue)",
  bank: "var(--sc-cat-blue)",
};
