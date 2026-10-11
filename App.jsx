import { useEffect, useMemo, useState } from "react";
import {
  Instagram, Facebook, Menu, X, PawPrint, Heart, ShoppingBag,
  BookOpen, Copy, Check, Wifi, Mail, HandHeart,
} from "lucide-react";

/* =====================================================================
   ⚙️ CONFIGURACIÓN — todo lo que debes editar está aquí
   ===================================================================== */
const CONFIG = {
  // Google Sheets: Archivo > Compartir > Publicar en la web > elige la pestaña > formato CSV
  // Pega aquí cada enlace CSV (una pestaña "gatos" y otra "productos").
  GATOS_CSV: "",
  PRODUCTOS_CSV: "",

  // Google Forms: Enviar > pestaña "<>" (incrustar) > copia solo el src del iframe
  FORM_URL: "",

  LOGO: "/logo.png", // pon tu logo en la carpeta /public
  INSTAGRAM: "https://instagram.com/adopcionesgatunasmedellin",
  FACEBOOK: "https://facebook.com/",   // ← cambia por tu enlace
  TIKTOK: "https://tiktok.com/@gatunas",
  EMAIL: "tucorreo@gmail.com",         // ← contacto virtual

  EBOOK_URL: "#",                      // ← enlace de compra/descarga del e-book
  DONACIONES: [
    { medio: "Nequi", dato: "300 000 0000" },
    { medio: "Bancolombia", dato: "Ahorros 000-000000-00" },
    { medio: "BREB", dato: "@tullave" },
  ],
};

/* Datos de ejemplo: se muestran si aún no conectas tu Google Sheet */
const DEMO_GATOS = [
  { nombre: "Michi", edad: "3 meses", sexo: "Macho", temperamento: "Juguetón y cariñoso", estado: "Disponible", foto: "" },
  { nombre: "Luna", edad: "1 año", sexo: "Hembra", temperamento: "Tranquila, le gustan las siestas", estado: "En proceso", foto: "" },
  { nombre: "Tigre", edad: "2 años", sexo: "Macho", temperamento: "Curioso y sociable", estado: "Adoptado", foto: "" },
];
const DEMO_PRODUCTOS = [
  { nombre: "Kit de bienvenida", precio: "89000", descripcion: "Comedero, arenero, rascador y juguete.", foto: "", enlace: "#" },
  { nombre: "Alimento premium 2kg", precio: "42000", descripcion: "Con descuento por ser parte de la comunidad.", foto: "", enlace: "#" },
];

/* =====================================================================
   Utilidades
   ===================================================================== */
// Lector CSV simple (soporta comillas y comas dentro de celdas)
function parseCSV(text) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((x) => x.trim()));
  if (!head) return [];
  const keys = head.map((h) => h.trim().toLowerCase());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] || "").trim()])));
}

// Convierte enlaces de Google Drive en imágenes visibles
function fotoUrl(url) {
  if (!url) return "";
  const m = url.match(/\/d\/([\w-]+)/) || url.match(/[?&]id=([\w-]+)/);
  return m && url.includes("drive.google.com")
    ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800`
    : url;
}

const precioCOP = (v) => {
  const n = Number(String(v).replace(/[^\d]/g, ""));
  return n ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n) : v;
};

function useSheet(url, demo) {
  const [data, setData] = useState(url ? null : demo);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!url) return;
    fetch(url).then((r) => r.text()).then((t) => setData(parseCSV(t))).catch(() => { setError(true); setData(demo); });
  }, [url]);
  return { data, error };
}

/* =====================================================================
   Componentes
   ===================================================================== */
const TikTok = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" {...p}>
    <path d="M16.6 3c.3 2.4 1.7 3.9 4 4v3.1c-1.5.1-2.8-.4-4-1.1v6.2c0 5.1-5.5 6.7-8.3 3.1-1.8-2.4-.7-6.4 3.1-6.8v3.3c-.4.1-.9.2-1.2.4-1.1.7-.8 2.5.6 2.8 1.6.4 2.6-.7 2.6-2.1V3h3.2z" />
  </svg>
);

const SOCIALS = [
  { n: "Instagram", href: CONFIG.INSTAGRAM, i: <Instagram size={20} /> },
  { n: "Facebook", href: CONFIG.FACEBOOK, i: <Facebook size={20} /> },
  { n: "TikTok", href: CONFIG.TIKTOK, i: <TikTok /> },
];

const ESTADO = {
  Disponible: "bg-[#00A8C6] text-white",
  "En proceso": "bg-amber-400 text-[#1E1E1E]",
  Adoptado: "bg-[#1E1E1E] text-white",
};

function Foto({ src, alt }) {
  const [fail, setFail] = useState(false);
  if (!src || fail)
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#00A8C6]/10 text-[#00A8C6]">
        <PawPrint size={56} />
      </div>
    );
  return <img src={fotoUrl(src)} alt={alt} loading="lazy" onError={() => setFail(true)} className="h-full w-full object-cover" />;
}

function Seccion({ id, titulo, subtitulo, children, oscura }) {
  return (
    <section id={id} className={`scroll-mt-20 px-4 py-14 ${oscura ? "bg-[#1E1E1E] text-white" : "bg-white text-[#1E1E1E]"}`}>
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{titulo}</h2>
        {subtitulo && <p className={`mt-2 max-w-2xl ${oscura ? "text-white/70" : "text-[#1E1E1E]/70"}`}>{subtitulo}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function Cargando() {
  return <p className="py-10 text-center text-[#00A8C6]">Cargando…</p>;
}

function CopyBtn({ texto }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(texto); setOk(true); setTimeout(() => setOk(false), 1800); }}
      className="flex min-h-11 items-center gap-2 rounded-full bg-[#00A8C6] px-4 text-sm font-bold text-white active:scale-95"
    >
      {ok ? <Check size={16} /> : <Copy size={16} />} {ok ? "Copiado" : "Copiar"}
    </button>
  );
}

/* =====================================================================
   App
   ===================================================================== */
export default function App() {
  const [menu, setMenu] = useState(false);
  const [filtro, setFiltro] = useState("Todos");
  const [elegido, setElegido] = useState("");
  const gatos = useSheet(CONFIG.GATOS_CSV, DEMO_GATOS);
  const productos = useSheet(CONFIG.PRODUCTOS_CSV, DEMO_PRODUCTOS);

  const lista = useMemo(
    () => (gatos.data || []).filter((g) => g.nombre && (filtro === "Todos" || g.estado === filtro)),
    [gatos.data, filtro]
  );

  const NAV = [
    ["gatos", "Gaticos"], ["formulario", "Adoptar"], ["tienda", "Tienda"], ["apoyo", "Apoyar"],
  ];
  const ir = (id) => { setMenu(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  const quiero = (nombre) => { setElegido(nombre); ir("formulario"); };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1E1E1E]" style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#1E1E1E] text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <img src={CONFIG.LOGO} alt="Logo Adopciones Gatunas Medellín" className="h-11 w-11 rounded-full bg-white object-contain" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
          <button onClick={() => ir("inicio")} className="text-left text-base font-black leading-tight sm:text-lg">
            Adopciones Gatunas <span className="text-[#00A8C6]">Medellín</span>
          </button>
          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {NAV.map(([id, t]) => (
              <button key={id} onClick={() => ir(id)} className="rounded-full px-4 py-2 font-bold hover:bg-white/10">{t}</button>
            ))}
            {SOCIALS.map((s) => (
              <a key={s.n} href={s.href} target="_blank" rel="noreferrer" aria-label={s.n} className="rounded-full p-2 text-[#00A8C6] hover:bg-white/10">{s.i}</a>
            ))}
          </nav>
          <button className="ml-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#00A8C6] md:hidden" onClick={() => setMenu(!menu)} aria-label="Abrir menú">
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        {menu && (
          <div className="border-t border-white/10 px-4 pb-4 md:hidden">
            {NAV.map(([id, t]) => (
              <button key={id} onClick={() => ir(id)} className="block w-full py-3 text-left text-lg font-bold">{t}</button>
            ))}
            <div className="mt-2 flex gap-3">
              {SOCIALS.map((s) => (
                <a key={s.n} href={s.href} target="_blank" rel="noreferrer" aria-label={s.n} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#00A8C6]">{s.i}</a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="inicio" className="bg-[#00A8C6] px-4 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] sm:text-6xl">Un gatico está esperando tu hogar.</h1>
          <p className="mt-4 max-w-xl text-lg text-white/90">Adopta con responsabilidad desde Medellín. Todo el proceso es <b>100% virtual</b>: sin visitas ni direcciones, solo tú, tu celular y un nuevo amigo.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => ir("gatos")} className="min-h-12 rounded-full bg-[#1E1E1E] px-6 font-extrabold active:scale-95">Ver gaticos</button>
            <button onClick={() => ir("apoyo")} className="min-h-12 rounded-full bg-white px-6 font-extrabold text-[#1E1E1E] active:scale-95">Apoyar el hogar de paso</button>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold"><Wifi size={16} /> Proceso 100% virtual</p>
        </div>
      </section>

      {/* CATÁLOGO */}
      <Seccion id="gatos" titulo="Gaticos en adopción" subtitulo="Toca “Quiero adoptar” en el que te robó el corazón y te llevamos al formulario.">
        <div className="mb-6 flex flex-wrap gap-2">
          {["Todos", "Disponible", "En proceso", "Adoptado"].map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`min-h-11 rounded-full border-2 px-4 font-bold ${filtro === f ? "border-[#1E1E1E] bg-[#1E1E1E] text-white" : "border-[#1E1E1E]/15"}`}>{f}</button>
          ))}
        </div>
        {!gatos.data ? <Cargando /> : lista.length === 0 ? (
          <p className="py-10 text-center text-[#1E1E1E]/60">No hay gaticos en esta categoría por ahora.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((g, i) => (
              <article key={i} className="flex flex-col overflow-hidden rounded-3xl border border-[#1E1E1E]/10 bg-white shadow-sm">
                <div className="relative aspect-[4/3]">
                  <Foto src={g.foto} alt={`Foto de ${g.nombre}`} />
                  <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-sm font-extrabold ${ESTADO[g.estado] || ESTADO["Disponible"]}`}>{g.estado || "Disponible"}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-2xl font-black">{g.nombre}</h3>
                  <p className="mt-1 text-sm font-bold text-[#00A8C6]">{g.edad} · {g.sexo}</p>
                  <p className="mt-2 flex-1 text-[#1E1E1E]/75">{g.temperamento}</p>
                  <button disabled={g.estado === "Adoptado"} onClick={() => quiero(g.nombre)}
                    className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#00A8C6] font-extrabold text-white active:scale-95 disabled:cursor-not-allowed disabled:bg-[#1E1E1E]/20 disabled:text-[#1E1E1E]/50">
                    <Heart size={18} /> {g.estado === "Adoptado" ? "Ya tiene hogar" : "Quiero adoptar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Seccion>

      {/* FORMULARIO */}
      <Seccion id="formulario" oscura titulo="Solicitud de adopción" subtitulo="Llena el formulario y te contactamos por medios virtuales.">
        {elegido && (
          <p className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-[#00A8C6] p-4 font-bold">
            <span>Quieres adoptar a <b>{elegido}</b>. Escribe su nombre en el formulario.</span>
            <button onClick={() => setElegido("")} aria-label="Quitar" className="shrink-0"><X size={20} /></button>
          </p>
        )}
        <p className="mb-5 rounded-2xl border-2 border-[#00A8C6] bg-white/5 p-4 text-sm leading-relaxed sm:text-base">
          <b>Atención:</b> Debes tener la sesión iniciada en tu cuenta de Gmail para llenar la solicitud. Todo el proceso de adopción es 100% virtual.
        </p>
        <div className="overflow-hidden rounded-3xl bg-white">
          {CONFIG.FORM_URL ? (
            <iframe title="Formulario de adopción" src={CONFIG.FORM_URL} className="h-[900px] w-full" frameBorder="0">Cargando…</iframe>
          ) : (
            <p className="p-10 text-center text-[#1E1E1E]/60">Pega el enlace de tu Google Forms en CONFIG.FORM_URL para verlo aquí.</p>
          )}
        </div>
      </Seccion>

      {/* TIENDA */}
      <Seccion id="tienda" titulo="Tienda aliada y kits de bienvenida" subtitulo="Todo lo que tu gatico necesita, con descuento por ser parte de la comunidad.">
        {!productos.data ? <Cargando /> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productos.data.filter((p) => p.nombre).map((p, i) => (
              <article key={i} className="flex flex-col overflow-hidden rounded-3xl border border-[#1E1E1E]/10">
                <div className="aspect-square"><Foto src={p.foto} alt={p.nombre} /></div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-xl font-black">{p.nombre}</h3>
                  <p className="mt-1 text-2xl font-black text-[#00A8C6]">{precioCOP(p.precio)}</p>
                  <p className="mt-2 flex-1 text-[#1E1E1E]/75">{p.descripcion}</p>
                  <a href={p.enlace || "#"} target="_blank" rel="noreferrer"
                    className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1E1E1E] font-extrabold text-white active:scale-95">
                    <ShoppingBag size={18} /> Ver / Comprar
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </Seccion>

      {/* APOYO */}
      <Seccion id="apoyo" oscura titulo="Apoya al hogar de paso" subtitulo="Cada aporte se convierte en comida, esterilizaciones y atención veterinaria.">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white/5 p-6">
            <h3 className="flex items-center gap-2 text-2xl font-black"><HandHeart className="text-[#00A8C6]" /> Apadrinar</h3>
            <p className="mt-3 text-white/80">¿No puedes adoptar ahora? Apadrina a un gatico: aportas una cuota mensual para su comida y cuidados mientras espera su familia. Si estás adoptando, también puedes apadrinar a otro gatico del hogar de paso.</p>
            <a href={CONFIG.INSTAGRAM} target="_blank" rel="noreferrer" className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-[#00A8C6] font-extrabold active:scale-95">Quiero apadrinar</a>
          </div>
          <div className="rounded-3xl bg-white p-6 text-[#1E1E1E]">
            <h3 className="flex items-center gap-2 text-2xl font-black"><Heart className="text-[#00A8C6]" /> Donar</h3>
            <ul className="mt-4 space-y-3">
              {CONFIG.DONACIONES.map((d) => (
                <li key={d.medio} className="flex items-center justify-between gap-3 rounded-2xl bg-[#1E1E1E]/5 p-3">
                  <div><p className="font-black">{d.medio}</p><p className="text-[#1E1E1E]/70">{d.dato}</p></div>
                  <CopyBtn texto={d.dato} />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6 flex flex-col items-start gap-4 rounded-3xl bg-[#00A8C6] p-6 sm:flex-row sm:items-center">
          <BookOpen size={44} className="shrink-0" />
          <div className="flex-1">
            <h3 className="text-2xl font-black">E-book: cuidado de gaticos</h3>
            <p className="mt-1 text-white/90">Alimentación, salud, adaptación al hogar y más, en una guía fácil para tu celular.</p>
          </div>
          <a href={CONFIG.EBOOK_URL} target="_blank" rel="noreferrer" className="flex min-h-12 items-center rounded-full bg-[#1E1E1E] px-6 font-extrabold active:scale-95">Quiero el e-book</a>
        </div>
      </Seccion>

      {/* FOOTER */}
      <footer className="bg-[#1E1E1E] px-4 py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-black">Adopciones Gatunas <span className="text-[#00A8C6]">Medellín</span></p>
            <p className="mt-1 text-sm text-white/70">Medellín, Colombia · Atención 100% virtual</p>
            <a href={`mailto:${CONFIG.EMAIL}`} className="mt-2 inline-flex items-center gap-2 text-sm text-[#00A8C6]"><Mail size={16} /> {CONFIG.EMAIL}</a>
          </div>
          <div className="flex gap-3">
            {SOCIALS.map((s) => (
              <a key={s.n} href={s.href} target="_blank" rel="noreferrer" aria-label={s.n} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#00A8C6]">{s.i}</a>
            ))}
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-6xl border-t border-white/10 pt-4 text-xs text-white/50">© {new Date().getFullYear()} Adopciones Gatunas Medellín. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
