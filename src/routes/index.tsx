import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, User, Eye, EyeOff, LogOut, Building2, Mail, Calendar, Send, CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Reportes Looker — AIMO.CO" },
      { name: "description", content: "Sistema de automatización de reportes financieros por quincena." },
    ],
  }),
  component: Index,
});

const USUARIOS_VALIDOS: Record<string, string> = {
  finanzas: "hng2026",
  admin: "hng2026",
};

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const QUINCENAS = MESES.flatMap(m => [`Primera Quincena de ${m}`, `Segunda Quincena de ${m}`]);
const ANOS = Array.from({ length: 6 }, (_, i) => String(2024 + i));

const EMPRESAS_MOCK = [
  { ruc: "20517441792", nombre: "WHITE ROLLING PIN S.R.L.", contacto: "María Alm", email: "lmunoz@grupohng.com" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white">
        <Sparkles className="w-5 h-5 text-violet" style={{ color: "var(--violet)" }} />
      </div>
      <div className="font-display font-bold text-lg text-white">AIMO.CO</div>
    </div>
  );
}

function Hero({ subtitle }: { subtitle: string }) {
  return (
    <div className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-glow)" }}>
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
        background: "radial-gradient(circle at 20% 20%, oklch(0.99 0 0 / 0.18), transparent 45%), radial-gradient(circle at 85% 90%, oklch(0.70 0.20 45 / 0.45), transparent 50%)"
      }} />
      <div className="relative">
        <div className="font-display font-bold uppercase tracking-[0.3em] text-xs md:text-sm text-white/80">AIMO.CO</div>
        <h1 className="font-display font-extrabold text-5xl md:text-7xl mt-4 leading-[0.95] text-white">
          Reportes<br/>Looker
        </h1>
        <p className="mt-6 text-sm md:text-base text-white/75 max-w-md mx-auto">{subtitle}</p>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-muted-foreground">{children}</label>;
}

function LoginView({ onLogin }: { onLogin: (u: string) => void }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (USUARIOS_VALIDOS[usuario] === password) {
      setError("");
      onLogin(usuario);
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <Hero subtitle="Sistema de automatización de reportes financieros" />

        <form onSubmit={submit} className="glass-card p-8 space-y-5">
          <div className="flex items-center gap-2 font-display font-bold uppercase tracking-[0.2em] text-xs text-brand">
            <Lock className="w-4 h-4" /> Acceso al sistema
          </div>

          <div className="space-y-2">
            <FieldLabel>Usuario</FieldLabel>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="finanzas"
                className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-3 text-card-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Contraseña</FieldLabel>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-muted border border-border rounded-xl pl-10 pr-12 py-3 text-card-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
              <XCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <button type="submit" className="btn-brand w-full flex items-center justify-center gap-2 hover:[transform:translateY(-2px)]">
            Ingresar <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

type LogEntry = { ok: boolean; empresa: string; msg: string };

function Dashboard({ usuario, onLogout }: { usuario: string; onLogout: () => void }) {
  const [anio, setAnio] = useState("2026");
  const [quincena, setQuincena] = useState(QUINCENAS[0]);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const empresas = EMPRESAS_MOCK;

  const send = async () => {
    setSending(true);
    setProgress(0);
    setLogs([]);
    for (let i = 0; i < empresas.length; i++) {
      await new Promise(r => setTimeout(r, 900));
      setLogs(prev => [...prev, { ok: true, empresa: empresas[i].nombre, msg: `Enviado a ${empresas[i].email}` }]);
      setProgress(((i + 1) / empresas.length) * 100);
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-80 lg:min-h-screen p-6 lg:p-8 space-y-6">
        <Logo />

        <div className="glass-card p-5 space-y-4">
          <div className="font-display font-bold uppercase tracking-[0.2em] text-[0.7rem] text-brand">Sesión activa</div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-card-foreground">{usuario}</div>
              <div className="text-xs text-muted-foreground">Administrador</div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 rounded-xl border border-border text-card-foreground hover:bg-muted py-2.5 text-sm font-semibold transition">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>

        <div className="hidden lg:block text-xs text-white/60 leading-relaxed pl-1">
          Automatiza la generación y envío de reportes Looker por quincena para cada empresa registrada.
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 lg:pl-0 max-w-5xl mx-auto w-full space-y-8">
        <Hero subtitle="Automatización de reportes financieros por quincena" />

        {/* Empresas */}
        <section className="glass-card p-6 md:p-8">
          <div className="flex items-center gap-2 font-display font-bold uppercase tracking-[0.2em] text-xs text-brand mb-5">
            <Building2 className="w-4 h-4" /> Empresas registradas
          </div>
          <div className="space-y-2">
            {empresas.map((e, i) => (
              <div key={e.ruc} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-4 rounded-xl bg-accent border border-brand/15 hover:border-brand/40 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 px-2.5 py-1 rounded-md bg-brand text-brand-foreground text-xs font-bold font-display">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-card-foreground truncate">{e.ruc} · {e.nombre}</div>
                    <div className="text-xs text-muted-foreground">{e.contacto}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-brand font-medium">
                  <Mail className="w-3.5 h-3.5" /> {e.email}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">Total: {empresas.length} empresa(s) cargada(s)</div>
        </section>

        {/* Período */}
        <section className="glass-card p-6 md:p-8">
          <div className="flex items-center gap-2 font-display font-bold uppercase tracking-[0.2em] text-xs text-brand mb-5">
            <Calendar className="w-4 h-4" /> Seleccionar período
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Año">
              <Select value={anio} onChange={setAnio} options={ANOS} />
            </Field>
            <Field label="Quincena">
              <Select value={quincena} onChange={setQuincena} options={QUINCENAS} />
            </Field>
          </div>
        </section>

        {/* Enviar */}
        <button
          onClick={send}
          disabled={sending}
          className="btn-brand w-full text-base md:text-lg flex items-center justify-center gap-3 disabled:opacity-70 hover:[transform:translateY(-2px)]"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {sending ? "Procesando..." : `Enviar ${empresas.length} Reporte${empresas.length !== 1 ? "s" : ""} — ${quincena} ${anio}`}
        </button>

        {(sending || logs.length > 0) && (
          <section className="glass-card p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-display font-bold uppercase tracking-[0.2em] text-xs text-brand">Progreso</div>
              <div className="text-sm text-muted-foreground">{Math.round(progress)}%</div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: "var(--gradient-brand)" }} />
            </div>
            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {logs.map((l, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm p-3 rounded-lg border ${l.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-destructive/10 border-destructive/30 text-destructive"}`}>
                  {l.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                  <span className="font-semibold">{l.empresa}</span>
                  <span className="text-muted-foreground">— {l.msg}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-card-foreground focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition appearance-none cursor-pointer"
      style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%23ff7a1f' d='M6 8L0 0h12z'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center" }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Index() {
  const [usuario, setUsuario] = useState<string | null>(null);
  return usuario
    ? <Dashboard usuario={usuario} onLogout={() => setUsuario(null)} />
    : <LoginView onLogin={setUsuario} />;
}
