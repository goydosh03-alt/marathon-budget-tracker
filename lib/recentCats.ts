// «Recent categories» — порядок за тим, чим користувались останнім часом.
// Живе в localStorage: жодного запиту й жодної зміни бекенду.
const KEY = "sc_recent_cats";
const LIMIT = 40;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Запамʼятати щойно використану категорію. */
export function noteCategory(name: string) {
  if (typeof window === "undefined" || !name) return;
  try {
    const next = [name, ...read().filter((c) => c !== name)].slice(0, LIMIT);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* приватний режим — просто лишаємо порядок як є */
  }
}

/** Впорядкувати список: спершу нещодавні, далі решта у своєму порядку. */
export function sortByRecent(cats: string[]): string[] {
  const recent = read();
  if (!recent.length) return cats;
  const rank = new Map(recent.map((c, i) => [c, i]));
  return [...cats].sort((a, b) => {
    const ra = rank.has(a) ? rank.get(a)! : Infinity;
    const rb = rank.has(b) ? rank.get(b)! : Infinity;
    if (ra === rb) return cats.indexOf(a) - cats.indexOf(b);
    return ra - rb;
  });
}
