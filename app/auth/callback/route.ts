import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Обробляє посилання з листа: міняє код на сесію і веде на dashboard.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // новий акаунт: створюємо 2 рахунки за замовчуванням (готівка + картка)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { count } = await supabase
          .from("accounts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);
        if (!count) {
          await supabase.from("accounts").insert([
            { user_id: user.id, name: "Готівка", type: "cash", currency: "PLN" },
            { user_id: user.id, name: "Картка", type: "card", currency: "PLN" },
          ]);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
