// Розпізнавання чека через Claude vision. ВИКЛИКАЄТЬСЯ ТІЛЬКИ НА СЕРВЕРІ.

const CATS = ["Їжа", "Кафе", "Транспорт", "Розваги", "Аптека", "Одяг", "Комунальні", "Інше"];

export type ReceiptItem = { name: string; price: number };

export type ParsedReceipt = {
  merchant: string | null;
  date: string | null; // YYYY-MM-DD
  total: number | null;
  category: string;
  items: ReceiptItem[];
};

export async function parseReceipt(imageBase64: string, mediaType: string): Promise<ParsedReceipt> {
  const prompt = `Це фото чека. Уважно прочитай його і поверни ТІЛЬКИ JSON без жодного тексту навколо:
{
  "merchant": "назва магазину/закладу або null",
  "date": "YYYY-MM-DD або null",
  "total": число (фінальна сума ДО СПЛАТИ, разом) або null,
  "category": одне з [${CATS.map((c) => `"${c}"`).join(", ")}],
  "items": [{"name": "назва позиції", "price": число}]
}

Правила:
- ДАТА: знайди дату покупки, надруковану на чеку (зазвичай зверху або біля номера чека), і поверни її у форматі YYYY-MM-DD. НЕ став сьогоднішню — бери саме з чека.
- СУМА: бери підсумкову суму "RAZEM / SUMA / TOTAL / ДО СПЛАТИ", а не проміжні.
- КАТЕГОРІЯ: визнач за типом магазину й товарами. Підказки: продуктові (Biedronka, Lidl, Auchan, Żabka, Carrefour) → "Їжа"; аптеки/дрогері/косметика (Rossmann, Hebe, аптека, DM) → "Аптека"; кафе/ресторани/Starbucks/McDonald's → "Кафе"; квитки/таксі/Uber/Bolt/паливо → "Транспорт"; одяг/взуття → "Одяг"; комунальні/інтернет/телефон → "Комунальні"; кіно/розваги → "Розваги"; якщо незрозуміло → "Інше".
- ПОЗИЦІЇ (items): випиши окремі товари/послуги з чека — назву і ціну кожного. Якщо позиції не видно — постав [].
- Якщо поле не читається — постав null.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: prompt },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Claude API ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw: string = data?.content?.[0]?.text ?? "";
  const parsed = extractJson(raw);

  // нормалізуємо
  const category = CATS.includes(parsed.category) ? parsed.category : "Інше";
  const total =
    typeof parsed.total === "number" ? parsed.total : parseFloat(String(parsed.total).replace(",", ".")) || null;

  const items: ReceiptItem[] = Array.isArray(parsed.items)
    ? parsed.items
        .map((it: { name?: unknown; price?: unknown }) => ({
          name: String(it?.name ?? "").trim(),
          price:
            typeof it?.price === "number"
              ? it.price
              : parseFloat(String(it?.price).replace(",", ".")) || 0,
        }))
        .filter((it: ReceiptItem) => it.name)
    : [];

  return {
    merchant: parsed.merchant ?? null,
    date: parsed.date ?? null,
    total,
    category,
    items,
  };
}

function extractJson(text: string): any {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("У відповіді немає JSON");
  return JSON.parse(match[0]);
}
