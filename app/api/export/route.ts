import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isLang, translate, dataLabel, DEFAULT_LANG, type StringKey } from "@/lib/i18n";

export const dynamic = "force-dynamic";

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Екранування поля CSV (кома, лапки, перенос рядка).
function cell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

type TxRow = {
  tx_date: string;
  type: string;
  category: string | null;
  merchant: string | null;
  amount_home: number | null;
  home_currency: string | null;
  note: string | null;
};

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const lg = user.user_metadata?.lang;
  const lang = isLang(lg) ? lg : DEFAULT_LANG;
  const t = (k: StringKey) => translate(k, lang);

  const sp = req.nextUrl.searchParams;
  let q = supabase
    .from("transactions")
    .select("tx_date,type,category,merchant,amount_home,home_currency,note")
    .eq("user_id", user.id)
    .order("tx_date", { ascending: false });

  const type = sp.get("type");
  if (type === "expense" || type === "income") q = q.eq("type", type);
  const cat = sp.get("cat");
  if (cat) q = q.eq("category", cat);
  const from = sp.get("from");
  if (from) q = q.gte("tx_date", from);
  const to = sp.get("to");
  if (to) q = q.lte("tx_date", to);

  const { data, error } = await q;
  if (error) return new Response(error.message, { status: 500 });
  const rows = (data ?? []) as TxRow[];

  const header = [t("csv.date"), t("csv.type"), t("csv.category"), t("csv.place"), t("csv.amount"), t("csv.currency"), t("csv.note")];
  const body = rows.map((r) => [
    r.tx_date,
    r.type === "income" ? t("common.income") : t("common.expense"),
    r.category ? dataLabel(r.category, lang) : "",
    r.merchant ?? "",
    typeof r.amount_home === "number" ? r.amount_home.toFixed(2) : "",
    r.home_currency ?? "",
    r.note ?? "",
  ]);

  // BOM (﻿) — щоб Excel коректно показав кирилицю.
  const csv = "﻿" + [header, ...body].map((r) => r.map(cell).join(",")).join("\r\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="snapcost-export-${isoDate(new Date())}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
