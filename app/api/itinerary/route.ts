import { NextResponse } from "next/server";

function getDate(p: any, key: string) {
  return p?.[key]?.date?.start ?? null;
}
function getRichText(p: any, key: string) {
  const arr = p?.[key]?.rich_text ?? [];
  return arr.map((x: any) => x.plain_text).join("") ?? "";
}
function getSelect(p: any, key: string) {
  return p?.[key]?.select?.name ?? null;
}
function getRelationIds(p: any, key: string) {
  const rel = p?.[key]?.relation ?? [];
  return rel.map((r: any) => r.id).filter(Boolean);
}

export async function GET() {
  try {
    const token = process.env.NOTION_TOKEN as string;
    const databaseId = process.env.ITINERARY_DB_ID as string;

    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page_size: 200,
        // Si tu columna se llama distinto a "Día", luego lo ajustamos
        sorts: [{ property: "Día", direction: "ascending" }],
      }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message ?? "Error querying Notion", details: data },
        { status: res.status }
      );
    }

    const items = (data.results ?? []).map((page: any) => {
      const p = page.properties || {};
      return {
        id: page.id,
        dia: getDate(p, "Día"),
        hora: getRichText(p, "Hora"),
        lugarIds: getRelationIds(p, "Lugar"),
        plan: getSelect(p, "Plan"),
        grupo: getSelect(p, "Grupo"),
        notas: getRichText(p, "Notas"),
      };
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}