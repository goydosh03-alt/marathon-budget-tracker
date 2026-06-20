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
    is_confirmed: true,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}
