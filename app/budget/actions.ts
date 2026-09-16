"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type BudgetInput = {
  type: "overall" | "category";
  category: string | null;
  period: "day" | "week" | "month";
  startRef: number | null;
  amount: number;
};

export type ActionResult = { ok: boolean; error?: string };

export async function createBudget(input: BudgetInput): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };
  if (!(input.amount > 0)) return { ok: false, error: "Amount must be positive" };

  const { error } = await supabase.from("budgets").insert({
    user_id: user.id,
    type: input.type,
    category: input.type === "category" ? input.category : null,
    period: input.period,
    start_ref: input.startRef,
    amount: input.amount,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/budget");
  return { ok: true };
}

export async function deleteBudget(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/budget");
  return { ok: true };
}
