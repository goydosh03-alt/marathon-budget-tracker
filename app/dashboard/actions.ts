"use server";

import { createClient } from "@/lib/supabase/server";
import { RATE_BASE_PER_HOME } from "@/lib/currency";
import { revalidatePath } from "next/cache";

export type AddTxResult = { ok: boolean; error?: string };

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

  const { error } = await supabase
    .from("transactions")
    .update({
      account_id: input.accountId || null,
      tx_date: input.date,
      type: input.type,
      amount_home: input.amountHome,
      amount_base: input.amountHome * RATE_BASE_PER_HOME,
      exchange_rate: RATE_BASE_PER_HOME,
      category: input.category || "Інше",
      merchant: input.merchant || null,
    })
    .eq("id", id);

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
