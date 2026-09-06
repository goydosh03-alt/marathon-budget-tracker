// Категорія → іконка Solar + колір диска.
// Усі ДЕФОЛТНІ категорії тепер мають іконку. Кастомні категорії користувача
// (він сам обирає емодзі на /categories) повертають icon: null — диск малює емодзі.

export type CatVisual = { icon: string | null; color: string };

const MAP: Record<string, CatVisual> = {
  "Їжа":         { icon: "BoldShoppingEcommerceCartLarge", color: "var(--sc-cat-orange)" },
  "Кафе":        { icon: "BoldCupHot",                     color: "var(--sc-cat-orange)" },
  "Транспорт":   { icon: "BoldTransportPartsServiceBus",   color: "var(--sc-cat-blue)" },
  "Розваги":     { icon: "BoldClapperboard",               color: "var(--sc-cat-purple)" },
  "Аптека":      { icon: "BoldPill",                       color: "var(--sc-cat-red)" },
  "Одяг":        { icon: "BoldTShirt",                     color: "var(--sc-cat-purple)" },
  "Комунальні":  { icon: "BoldLightbulb",                  color: "var(--sc-cat-teal)" },
  "Зарплата":    { icon: "BoldMoneyMoneyBag",              color: "var(--sc-cat-green)" },
  "Фриланс":     { icon: "BoldMoneyDollarMinimalistic",    color: "var(--sc-cat-green)" },
  "Подарунок":   { icon: "BoldGift",                       color: "var(--sc-cat-purple)" },
  "Інше":        { icon: "BoldBill",                       color: "var(--sc-cat-teal)" },
};

// Для кастомних категорій без іконки — колір лишається в палітрі системи.
const FALLBACK_COLOR = "var(--sc-cat-teal)";

/** Нейтральний вектор, коли нічого кращого немає. Емодзі-затички більше не показуємо. */
const NEUTRAL_ICON = "BoldEssentionalUIMenuDotsCircle";

export type CatLook = { icon: string | null; emoji: string | null; color: string };

/**
 * Як намалювати диск категорії.
 * Дефолтна категорія -> векторний гліф. Кастомна -> ВЛАСНИЙ емодзі й колір
 * користувача (це його вибір на /categories). Нічого з цього нема -> нейтральний вектор.
 */
export function resolveCat(
  category: string,
  isIncome: boolean,
  custom?: { emoji?: string; color?: string }
): CatLook {
  const hit = MAP[category];
  if (hit) return { icon: hit.icon, emoji: null, color: hit.color };
  if (custom?.emoji) return { icon: null, emoji: custom.emoji, color: custom.color || FALLBACK_COLOR };
  if (isIncome) return { icon: "BoldMoneyMoneyBag", emoji: null, color: "var(--sc-cat-green)" };
  return { icon: NEUTRAL_ICON, emoji: null, color: custom?.color || FALLBACK_COLOR };
}

export function catVisual(category: string, isIncome: boolean): CatVisual {
  const hit = MAP[category];
  if (hit) return hit;
  if (isIncome) return { icon: "BoldMoneyMoneyBag", color: "var(--sc-cat-green)" };
  return { icon: null, color: FALLBACK_COLOR };
}

export const ACCOUNT_ICON: Record<string, string> = {
  cash: "BoldMoneyWallet",
  card: "BoldMoneyCard",
  bank: "BoldMoneyCard",
  savings: "BoldMoneySafeSquare",
};
export const ACCOUNT_COLOR: Record<string, string> = {
  cash: "var(--sc-cat-orange)",
  card: "var(--sc-cat-blue)",
  bank: "var(--sc-cat-blue)",
  savings: "var(--sc-cat-teal)",
};
