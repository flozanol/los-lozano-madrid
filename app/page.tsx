export const dynamic = "force-dynamic";

type Spot = {
  id: string;
  nombre: string;
  tipo: string | null;
  caminar: string | null;
  aptoAbuela: boolean;
  paraNinos: boolean;
  historia: string;
  mapa: string | null;
  votos: number | null;
  fechaIdeal: string | null;
};

type ItItem = {
  id: string;
  dia: string | null;      // "2026-03-26"
  hora: string;            // "10:00 am" o ""
  lugarIds: string[];      // ids de Spots
  plan: string | null;     // "Opción A"
  grupo: string | null;    // "Todos"
  notas: string;
};

async function getJSON<T>(path: string): Promise<T> {
  const base =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const res = await fetch(`${base}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error en ${path}`);
  return res.json();
}

function formatDia(iso: string | null) {
  if (!iso) return "Sin fecha";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export default async function Home() {
  const [{ items: spots }, { items: itinerary }] = await Promise.all([
    getJSON<{ items: Spot[] }>("/api/spots"),
    getJSON<{ items: ItItem[] }>("/api/itinerary"),
  ]);

  const spotById = new Map(spots.map((s) => [s.id, s]));

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 1120, margin: "0 auto" }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 34, margin: 0 }}>Los Lozano en Madrid 🇪🇸</h1>
        <p style={{ margin: "6px 0 0", opacity: 0.75 }}>
          Se edita en Notion · aquí se ve bonito (público)
        </p>
      </header>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1.1fr 0.9fr" }}>
        {/* Itinerario */}
        <section style={card}>
          <h2 style={{ marginTop: 0 }}>📅 Itinerario</h2>

          <div style={{ display: "grid", gap: 10 }}>
            {itinerary.map((it) => {
              const lugares = it.lugarIds
                .map((id) => spotById.get(id)?.nombre)
                .filter(Boolean)
                .join(", ");

              return (
                <div key={it.id} style={item}>
                  <div style={{ fontWeight: 900 }}>
                    {formatDia(it.dia)} {it.hora ? `· ${it.hora}` : ""}
                  </div>

                  <div style={{ marginTop: 4 }}>
                    <b>Lugar:</b> {lugares || <span style={{ opacity: 0.6 }}>— (por decidir)</span>}
                  </div>

                  <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {it.grupo && <Tag>👨‍👩‍👧‍👦 {it.grupo}</Tag>}
                    {it.plan && <Tag>🗓️ {it.plan}</Tag>}
                  </div>

                  {it.notas ? (
                    <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>{it.notas}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        {/* Spots */}
        <section style={card}>
          <h2 style={{ marginTop: 0 }}>📍 Lugares y restaurantes</h2>

          <div style={{ display: "grid", gap: 10 }}>
            {spots.map((s) => (
              <div key={s.id} style={item}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 900 }}>{s.nombre}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{s.tipo ?? "—"}</div>
                </div>

                {s.historia ? (
                  <div style={{ marginTop: 6, fontSize: 14, opacity: 0.85 }}>{s.historia}</div>
                ) : null}

                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {s.aptoAbuela && <Tag>🧓 Apto abuela</Tag>}
                  {s.paraNinos && <Tag>👶 Niños</Tag>}
                  {s.caminar && <Tag>🚶 {s.caminar}</Tag>}
                  {s.votos != null && <Tag>⭐ {s.votos}</Tag>}
                  {s.mapa && (
                    <a href={s.mapa} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                      Ver mapa →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer style={{ marginTop: 18, opacity: 0.6, fontSize: 12 }}>
        Tip: editen en Notion y recarguen esta página 🙂
      </footer>
    </main>
  );
}

const card: React.CSSProperties = {
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 16,
  background: "#fff",
};

const item: React.CSSProperties = {
  border: "1px solid #f0f0f0",
  borderRadius: 12,
  padding: 12,
  background: "#fafafa",
};

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 12,
        padding: "4px 8px",
        borderRadius: 999,
        background: "#f1f1f1",
        border: "1px solid #e7e7e7",
      }}

      
    >
      {children}
    </span>
  );
}