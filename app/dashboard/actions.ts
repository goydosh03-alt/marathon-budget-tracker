"use server";

import { createClient } from "@/lib/supabase/server";
import { RATE_BASE_PER_HOME } from "@/lib/currency";
import { revalidatePath } from "next/cache";

export type AddTxResult = { ok: boolean; error?: string };

export type Recurring = {
  id: string;
  name: string;
  amountHome: number;
  type: "expense" | "income";
  category: string;
  accountId: string;
  dayOfMonth: number; // 1..31 (день із startDate)
  startDate: string; // YYYY-MM-DD
  autoAdd: boolean; // створювати транзакцію автоматично
  lastGenerated: string | null;
};

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function readRecurring() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, recs: [] as Recurring[] };
  const recs: Recurring[] = Array.isArray(user.user_metadata?.recurring) ? user.user_metadata.recurring : [];
  return { supabase, user, recs };
}

export async function addRecurring(r: Omit<Recurring, "id" | "lastGenerated">): Promise<AddTxResult> {
  const { supabase, user, recs } = await readRecurring();
  if (!user) return { ok: false, error: "Не авторизовано" };
  if (!r.name.trim()) return { ok: false, error: "Введи назву" };
  const item: Recurring = { ...r, name: r.name.trim(), id: crypto.randomUUID(), lastGenerated: null };
  const { error } = await supabase.auth.updateUser({ data: { recurring: [...recs, item] } });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateRecurring(id: string, fields: Omit<Recurring, "id" | "lastGenerated">): Promise<AddTxResult> {
  const { supabase, user, recs } = await readRecurring();
  if (!user) return { ok: false, error: "Не авторизовано" };
  const next = recs.map((c) => (c.id === id ? { ...c, ...fields, name: fields.name.trim(), id } : c));
  const { error } = await supabase.auth.updateUser({ data: { recurring: next } });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteRecurring(id: string): Promise<AddTxResult> {
  const { supabase, user, recs } = await readRecurring();
  if (!user) return { ok: false, error: "Не авторизовано" };
  const { error } = await supabase.auth.updateUser({ data: { recurring: recs.filter((c) => c.id !== id) } });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

// Автостворення: створює транзакції за регулярними платежами, що настали (раз на відкриття).
export async function processRecurring(): Promise<{ created: number }> {
  const { supabase, user, recs } = await readRecurring();
  if (!user || !recs.length) return { created: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inserts: Record<string, unknown>[] = [];
  let changed = false;

  const nextRecs = recs.map((r) => {
    if (!r.autoAdd) return r; // лише ті, де ввімкнено автододавання
    const start = new Date((r.startDate || isoDate(today)) + "T00:00:00");
    const lastGen = r.lastGenerated ? new Date(r.lastGenerated + "T00:00:00") : null;
    let newLast = r.lastGenerated ?? null;
    let y = start.getFullYear();
    let m = start.getMonth();
    for (let i = 0; i < 36; i++) {
      const dim = new Date(y, m + 1, 0).getDate();
      const occ = new Date(y, m, Math.min(r.dayOfMonth, dim));
      occ.setHours(0, 0, 0, 0);
      if (occ > today) break;
      const afterLast = lastGen ? occ > lastGen : occ >= start;
      if (afterLast && occ >= start) {
        inserts.push({
          user_id: user.id,
          account_id: r.accountId || null,
          tx_date: isoDate(occ),
          type: r.type,
          amount_home: r.amountHome,
          home_currency: "PLN",
          amount_base: r.amountHome * RATE_BASE_PER_HOME,
          base_currency: "USD",
          exchange_rate: RATE_BASE_PER_HOME,
          category: r.category || "Інше",
          merchant: r.name || null,
          is_confirmed: true,
        });
        newLast = isoDate(occ);
        changed = true;
      }
      m++;
      if (m > 11) { m = 0; y++; }
    }
    return { ...r, lastGenerated: newLast };
  });

  if (inserts.length) await supabase.from("transactions").insert(inserts);
  if (changed) {
    await supabase.auth.updateUser({ data: { recurring: nextRecs } });
    revalidatePath("/dashboard");
    revalidatePath("/history");
  }
  return { created: inserts.length };
}

export type UserCategory = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  type: "expense" | "income";
};

// Категорії користувача — у метаданих акаунта (без окремої таблиці).
export async function addCategory(cat: Omit<UserCategory, "id">): Promise<AddTxResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Не авторизовано" };
  if (!cat.name.trim()) return { ok: false, error: "Введи назву" };

  const current: UserCategory[] = Array.isArray(user.user_metadata?.categories)
    ? user.user_metadata.categories
    : [];
  const item: UserCategory = { ...cat, name: cat.name.trim(), id: crypto.randomUUID() };
  const { error } = await supabase.auth.updateUser({ data: { categories: [...current, item] } });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateCategory(
  id: string,
  fields: Omit<UserCategory, "id">
): Promise<AddTxResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Не авторизовано" };

  const current: UserCategory[] = Array.isArray(user.user_metadata?.categories)
    ? user.user_metadata.categories
    : [];
  const next = current.map((c) => (c.id === id ? { ...c, ...fields, name: fields.name.trim(), id } : c));
  const { error } = await supabase.auth.updateUser({ data: { categories: next } });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<AddTxResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Не авторизовано" };

  const current: UserCategory[] = Array.isArray(user.user_metadata?.categories)
    ? user.user_metadata.categories
    : [];
  const { error } = await supabase.auth.updateUser({
    data: { categories: current.filter((c) => c.id !== id) },
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

// Налаштування користувача зберігаємо в метаданих акаунта (без окремої таблиці).
export async function setHideCents(value: boolean): Promise<AddTxResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Не авторизовано" };
  const { error } = await supabase.auth.updateUser({ data: { hide_cents: value } });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

// Додає транзакцію (дохід або витрата). Сума вводиться в домашній валюті (zł).
export async function addTransaction(input: {
  type: "expense" | "income";
  amountHome: number;
  category: string;
  merchant: string;
  accountId: string;
  date: string; // YYYY-MM-DD
  note?: string;
  items?: { name: string; price: number }[];
}): Promise<AddTxResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Не авторизовано" };

  if (!input.amountHome || input.amountHome <= 0) {
    return { ok: false, error: "Введи суму більше нуля" };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    account_id: input.accountId || null,
    tx_date: input.date,
    type: input.type,
    amount_home: input.amountHome,
    home_currency: "PLN",
    amount_base: input.amountHome * RATE_BASE_PER_HOME,
    base_currency: "USD",
    exchange_rate: RATE_BASE_PER_HOME,
    category: input.category || "Інше",
    merchant: input.merchant || null,
    note: input.note || null,
    items: input.items && input.items.length ? input.items : null,
    is_confirmed: true,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { ok: true };
}

// Оновлює існуючу транзакцію (RLS гарантує, що тільки свою).
export async function updateTransaction(
  id: string,
  input: {
    type: "expense" | "income";
    amountHome: number;
    category: string;
    merchant: string;
    accountId: string;
    date: string;
    items?: { name: string; price: number }[];
  }
): Promise<AddTxResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Не авторизовано" };
  if (!input.amountHome || input.amountHome <= 0) {
    return { ok: false, error: "Введи суму більше нуля" };
  }

  const patch: Record<string, unknown> = {
    account_id: input.accountId || null,
    tx_date: input.date,
    type: input.type,
    amount_home: input.amountHome,
    amount_base: input.amountHome * RATE_BASE_PER_HOME,
    exchange_rate: RATE_BASE_PER_HOME,
    category: input.category || "Інше",
    merchant: input.merchant || null,
  };
  // позиції оновлюємо лише якщо їх передали (щоб не затирати наявні)
  if (input.items !== undefined) {
    patch.items = input.items.length ? input.items : null;
  }

  const { error } = await supabase.from("transactions").update(patch).eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { ok: true };
}

export async function createAccount(input: {
  name: string;
  type: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Не авторизовано" };
  if (!input.name.trim()) return { ok: false, error: "Введи назву рахунку" };

  const { data, error } = await supabase
    .from("accounts")
    .insert({ user_id: user.id, name: input.name.trim(), type: input.type || "cash", currency: "PLN" })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { ok: true, id: data.id as string };
}

// Оновлює позиції чека + суму (коли видаляєш позицію в деталі транзакції).
export async function updateTransactionItems(
  id: string,
  items: { name: string; price: number }[],
  amountHome: number
): Promise<AddTxResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Не авторизовано" };

  const { error } = await supabase
    .from("transactions")
    .update({
      items: items.length ? items : null,
      amount_home: amountHome,
      amount_base: amountHome * RATE_BASE_PER_HOME,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { ok: true };
}

export async function getTransaction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("transactions").select("*").eq("id", id).single();
  return data;
}

export async function deleteTransaction(id: string): Promise<AddTxResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Не авторизовано" };

  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { ok: true };
}

export async function renameAccount(id: string, name: string): Promise<AddTxResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Не авторизовано" };
  if (!name.trim()) return { ok: false, error: "Введи назву" };

  const { error } = await supabase
    .from("accounts")
    .update({ name: name.trim() })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/settings");
  return { ok: true };
}

export async function deleteAccount(id: string): Promise<AddTxResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Не авторизовано" };

  // відвʼязуємо транзакції від рахунку, щоб не впертись у FK
  await supabase.from("transactions").update({ account_id: null }).eq("account_id", id);
  const { error } = await supabase.from("accounts").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/settings");
  return { ok: true };
}

// Небезпечна зона: видаляє ВСІ транзакції користувача.
export async function deleteAllTransactions(): Promise<AddTxResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Не авторизовано" };

  const { error } = await supabase.from("transactions").delete().eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { ok: true };
}
