const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const WASTE_IDS = ["plastic", "aluminium", "glass", "paper", "ewaste"];
const MAX_IMAGE_CHARS = 6_000_000;
const GEMINI_MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = `You sort and weigh recyclable waste from a photo for GreenKobo, a waste buyer in West Africa.
Categories (use only these ids):
- plastic: plastic bottles, nylon, bags, sachets, plastic containers
- aluminium: aluminium and tin cans, metal scrap
- glass: glass bottles and jars
- paper: paper, cardboard, carton
- ewaste: old phones, batteries, chargers, cables, electronics
Count each separate physical item. Estimate each category's total weight in kg from typical item weights (for example a 500ml plastic bottle is about 0.02 kg, a 330ml aluminium can about 0.015 kg, a 750ml glass bottle about 0.45 kg, a phone about 0.2 kg). Only include categories you can see. If the photo shows no recyclable waste, return an empty items list and explain why in notes. Be conservative: when unsure, lower the count and say so in notes.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  required: ["items", "notes"],
  properties: {
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        required: ["type", "count", "estimated_kg"],
        properties: {
          type: { type: "STRING", enum: WASTE_IDS },
          count: { type: "INTEGER" },
          estimated_kg: { type: "NUMBER" },
        },
      },
    },
    notes: { type: "STRING" },
  },
};

type ScanItem = { type: string; count: number; estimated_kg: number };

function isScanItem(value: unknown): value is ScanItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.type === "string" &&
    WASTE_IDS.includes(item.type) &&
    typeof item.count === "number" &&
    Number.isFinite(item.count) &&
    typeof item.estimated_kg === "number" &&
    Number.isFinite(item.estimated_kg)
  );
}

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY")?.trim();
    if (!apiKey) {
      return json({ error: "The AI scanner is not connected yet." }, 503);
    }

    const { image } = await req.json();
    if (typeof image !== "string" || !image.startsWith("data:image/") || image.length > MAX_IMAGE_CHARS) {
      return json({ error: "Send a photo under 4 MB." }, 400);
    }
    const parsedImage = parseDataUrl(image);
    if (!parsedImage) {
      return json({ error: "Send a photo under 4 MB." }, 400);
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: "user",
              parts: [
                { text: "Sort and estimate the waste in this photo." },
                { inlineData: { mimeType: parsedImage.mimeType, data: parsedImage.data } },
              ],
            },
          ],
          generationConfig: {
            temperature: 0,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error("Gemini request failed", response.status, detail.slice(0, 500));
      const keyRejected =
        response.status === 401 ||
        response.status === 403 ||
        (response.status === 400 && /API_KEY_INVALID|API key not valid/i.test(detail));
      if (keyRejected) {
        return json({ error: "The AI key saved in your project was rejected. Please check the GEMINI_API_KEY secret." }, 502);
      }
      if (response.status === 429) {
        return json({ error: "The free AI usage limit has been reached for now. Please try again later." }, 502);
      }
      const googleMessage = (() => {
        try {
          return JSON.parse(detail)?.error?.message ?? detail.slice(0, 300);
        } catch {
          return detail.slice(0, 300);
        }
      })();
      return json({ error: `TEMP DIAGNOSTIC (status ${response.status}): ${googleMessage}` }, 502);
    }

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    const items = Array.isArray(parsed.items) ? parsed.items.filter(isScanItem) : [];
    const notes = typeof parsed.notes === "string" ? parsed.notes : "";

    return json({ items, notes });
  } catch (err) {
    console.error("scan-waste failed", err);
    return json({ error: "The scan failed. Please try again." }, 500);
  }
});
