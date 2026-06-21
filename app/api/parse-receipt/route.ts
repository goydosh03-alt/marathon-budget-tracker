import { createClient } from "@/lib/supabase/server";
import { parseReceipt } from "@/lib/claude";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  // 1. Перевірка авторизації — захищаємо ендпоінт (щоб не палили чужі гроші на API)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ ok: false, error: "Не авторизовано" }, { status: 401 });
  }

  // 2. Зчитуємо зображення
  let body: { image?: string; mediaType?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Невірний запит" }, { status: 400 });
  }
  if (!body.image) {
    return Response.json({ ok: false, error: "Немає зображення" }, { status: 400 });
  }

  // 3. Розпізнаємо
  try {
    const data = await parseReceipt(body.image, body.mediaType || "image/jpeg");
    return Response.json({ ok: true, data });
  } catch (e) {
    console.error("parse-receipt error:", e);
    return Response.json(
      { ok: false, error: "Не вдалося прочитати чек. Спробуй ще раз або введи вручну." },
      { status: 500 }
    );
  }
}
