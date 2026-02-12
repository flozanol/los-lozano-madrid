import { NextResponse } from "next/server";

function getTitle(p: any, key: string) {
  return p?.[key]?.title?.[0]?.plain_text ?? "";
}
function getSelect(p: any, key: string) {
  return p?.[key]?.select?.name ?? null;
}
function getCheckbox(p: any, key: string) {
  return p?.[key]?.checkbox ?? false;
}
function getRichText(p: any, key: string) {
  const arr = p?.[key]?.rich_text ?? [];
  return arr.map((x: any) => x.plain_text).join("") ?? "";
}
function getUrl(p: any, key: string) {
  return p?.[key]?.url ?? null;
}
function getNumber(p: any, key: string) {
  return p?.[key]?.number ?? null;
}
function getDate(p: any, key: string) {
  return p?.[key]?.date?.start ?? null;
}

export async function GET() {
  try {
    const token = process.env.NOTION_TOKEN as string;
    const databaseId = process.env.SPOTS_DB_ID as string;

    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 100 }),
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
        nombre: getTitle(p, "Nombre"),
        tipo: getSelect(p, "Tipo"),
        caminar: getSelect(p, "Caminar"),
        aptoAbuela: getCheckbox(p, "Apto para la abuela"),
        paraNinos: getCheckbox(p, "Para Niños"), // OJO: si no existe, luego lo ajustamos
        historia: getRichText(p, "Historia Corta"),
        mapa: getUrl(p, "Google Maps"),
        votos: getNumber(p, "Votos ⭐"),
        fechaIdeal: getDate(p, "Fecha Ideal"),
      };
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}