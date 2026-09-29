import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  House,
  LayoutGrid,
  Utensils,
  Droplets,
  Dumbbell,
  Plus,
  Minus,
  X,
  LogOut,
  Link2,
  Sparkles,
  Sun,
  Heart,
  RefreshCw,
  Maximize,
  Minimize,
  CheckCheck,
  Leaf,
  Coffee,
  Flame,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Camera,
} from "lucide-react";
import {
  profiles,
  plans,
  dateKey,
  parseDate,
  addDays,
  createDay,
  status,
  metrics,
} from "./domain";
import { loadRecords, saveRecords, KEY } from "./store";
import { verseOfDay } from "./verses";
import { AuthProvider, useAuth } from "./AuthProvider";
import { firebaseReady } from "./firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";
import Onboarding from "./Onboarding";
import { uploadProfilePhoto, subscribeProfilePhotos, subscribeCouple, createCoupleInvite } from "./cloud";
import "./styles.css";
const iconProps = { size: 20, strokeWidth: 1.65 };
const fmt = (d, options) => parseDate(d).toLocaleDateString("pt-BR", options);
function personKeyForName(name) {
  const n = (name || "").toLowerCase();
  const found = Object.entries(profiles).find(([, p]) => n.includes(p.name.toLowerCase()));
  return found ? found[0] : Object.keys(profiles)[0];
}
function Brand({ compact = false }) {
  return (
    <span className={`brand${compact ? " brand-symbol" : ""}`}>
      <img src={`${import.meta.env.BASE_URL}${compact ? "cf.png" : "casal-fit.png"}`} alt={compact ? "Casal Fit" : "Casal Fit — Hábitos melhores juntos"} />
    </span>
  );
}
const landArrow = (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const landFeatures = [
  {
    Icon: Utensils,
    title: "Alimentação",
    text: "Refeições no seu ritmo, com planos simples e comida de verdade — não uma dieta de laboratório.",
  },
  {
    Icon: Droplets,
    title: "Água",
    text: "O quanto cada um bebeu no dia, sem complicação nenhuma pra registrar.",
  },
  {
    Icon: Dumbbell,
    title: "Treino",
    text: "Seus treinos e seus dias de descanso, marcados por você, no seu tempo.",
  },
  {
    Icon: Heart,
    title: "Casal",
    text: "A rotina dos dois lado a lado — cada um no seu ritmo, os dois no mesmo caminho.",
  },
];
const landPrinciples = [
  {
    title: "Vida real",
    text: "Antes da dieta perfeita. Pizza, hambúrguer e churrasco não são falha, são parte da vida.",
  },
  {
    title: "Menos decisões",
    text: "Quanto menos você precisa pensar pra cuidar de si, mais fácil é continuar.",
  },
  {
    title: "Consistência",
    text: "Acima de perfeição. Um dia difícil não apaga os outros trinta que vieram antes.",
  },
  {
    title: "Individual + casal",
    text: "Metas e ritmos diferentes, sem precisar viver duas rotinas separadas.",
  },
];
const landFaq = [
  {
    q: "Precisa pagar pra usar?",
    a: "Não. Hoje é de uso pessoal, sem nenhum custo.",
  },
  {
    q: "Onde ficam salvos meus registros?",
    a: "Neste navegador, no seu aparelho. Sincronizar entre celular e computador está a caminho.",
  },
  {
    q: "Funciona bem no celular?",
    a: "Sim — foi pensado primeiro pro celular, com o quadro da casa pensado pra tela maior.",
  },
  {
    q: "Dá pra usar sozinho, sem o parceiro?",
    a: "Dá. Cada perfil é independente; usar os dois juntos é só um diferencial a mais.",
  },
];
function Landing({ onEnter }) {
  const [navSolid, setNavSolid] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.querySelectorAll("[data-tear]").forEach((el) => {
      const pts = [];
      let x = 0;
      while (x < 100) {
        pts.push(`${x.toFixed(1)}% ${(20 + Math.random() * 70).toFixed(1)}%`);
        x += 0.6 + Math.random() * 2.2;
      }
      pts.push("100% 50%");
      el.style.clipPath = el.hasAttribute("data-flip")
        ? `polygon(0 0,100% 0,${pts.reverse().join(",")},0 50%)`
        : `polygon(0 50%,${pts.join(",")},100% 100%,0 100%)`;
    });
  }, []);
  useEffect(() => {
    const els = document.querySelectorAll(".land-rv");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <div className="land">
      <header className={`land-nav ${navSolid ? "solid" : ""}`}>
        <div className="land-nav-inner">
          <Brand />
        </div>
      </header>
      <section
        className="land-hero land-hero-photo"
        style={{ "--hero-photo": `url(${import.meta.env.BASE_URL}landing/hero.webp)` }}
      >
        <div className="land-wrap land-hero-top">
          <span className="land-eyebrow">
            <span />
            PEQUENOS CUIDADOS, TODOS OS DIAS
          </span>
          <h1 className="land-d">
            Faz bem cuidar.
            <br />
            <span className="l2">Melhor ainda, juntos.</span>
          </h1>
          <p className="land-sub">
            Refeições, água e treino — o de cada um, no seu ritmo — e a
            rotina da casa, lado a lado.
          </p>
          <div className="land-cta-row">
            <button className="land-btn acid" onClick={onEnter}>
              Entrar
              <i>{landArrow}</i>
            </button>
          </div>
        </div>
      </section>

      <div className="land-tear to-paper" data-tear></div>
      <section className="land-paper land-features" id="land-features">
        <div className="land-wrap">
          <h2 className="land-d">Cuidar dos dois, sem duplicar esforço.</h2>
          <div className="land-feat-grid">
            {landFeatures.map(({ Icon, title, text }) => (
              <div className="land-feat land-rv" key={title}>
                <Icon size={26} />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="land-tear up to-paper" data-tear data-flip></div>

      <section className="land-principles">
        <div className="land-wrap">
          <h2 className="land-d">Como a gente pensa isso.</h2>
          <div className="land-p-grid">
            {landPrinciples.map(({ title, text }) => (
              <div className="land-p land-rv" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="land-faq" id="land-faq">
        <div className="land-wrap">
          <h2 className="land-d">Dúvidas frequentes.</h2>
          <div className="land-faq-grid">
            {landFaq.map(({ q, a }, i) => (
              <div className={`land-q ${openFaq === i ? "open" : ""}`} key={q}>
                <button
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                >
                  {q}
                  <span className="land-pm" />
                </button>
                <div className="land-a">
                  <div>
                    <p>{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="land-marquee" aria-hidden="true">
        <div className="land-track">
          {Array.from({ length: 6 }, (_, i) => (
            <b key={i}>
              Hábitos melhores juntos <Heart size={34} fill="currentColor" />
            </b>
          ))}
        </div>
      </div>

      <footer className="land-footer">
        <div className="land-wrap">
          <h2 className="land-d">Um dia de cada vez. Vamos começar?</h2>
          <div className="land-cta-row">
            <button className="land-btn acid" onClick={onEnter}>
              Entrar
              <i>{landArrow}</i>
            </button>
          </div>

        </div>
      </footer>
    </div>
  );
}
function authErrorMessage(err) {
  const code = err && err.code ? err.code : "";
  if (code.includes("email-already-in-use")) return "Esse e-mail já tem uma conta.";
  if (code.includes("invalid-email")) return "E-mail inválido.";
  if (code.includes("weak-password")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (
    code.includes("user-not-found") ||
    code.includes("wrong-password") ||
    code.includes("invalid-credential")
  )
    return "E-mail ou senha incorretos.";
  if (code.includes("too-many-requests")) return "Muitas tentativas. Tente novamente em instantes.";
  return "Não foi possível continuar. Tente novamente.";
}
function LoginPage({ onBack }) {
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const signup = mode === "signup";
  async function handleSubmit(e) {
    e.preventDefault();
    setNotice("");
    if (!firebaseReady) {
      setError("O cadastro na nuvem ainda está sendo configurado. Volte em instantes.");
      return;
    }
    if (signup && password !== confirmPassword) {
      setError("As senhas não são iguais.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (signup) await signUp(name, email, password);
      else await signIn(email, password);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  async function handleForgot() {
    setError("");
    if (!email) {
      setNotice("Digite seu e-mail acima para receber o link de redefinição.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setNotice("Enviamos um link de redefinição para o seu e-mail.");
    } catch (err) {
      setError(authErrorMessage(err));
    }
  }
  return (
    <div className="land login">
      <div
        className="login-photo"
        style={{ "--login-photo": `url(${import.meta.env.BASE_URL}landing/login.webp)` }}
      >
        <div className="login-photo-inner">
          <span className="land-eyebrow">
            <span />
            HÁBITOS MELHORES JUNTOS
          </span>
          <h1 className="land-d">
            Vida real.
            <br />
            Rotina real.
            <br />
            <span className="l2">Resultados juntos.</span>
          </h1>
          <span className="login-rule" />
        </div>
      </div>
      <div className="login-panel">
        <div className="login-panel-inner">
          <button className="login-brand" onClick={onBack} aria-label="Voltar ao início">
            <Brand />
          </button>
          <h2 className="land-d login-title">
            {signup ? (
              <>
                Criar
                <br />
                <span className="l2">sua conta.</span>
              </>
            ) : (
              <>
                Bom ter você
                <br />
                <span className="l2">de volta.</span>
              </>
            )}
          </h2>
          <p className="login-sub">
            {signup ? "Leva menos de um minuto." : "Continue de onde parou."}
          </p>
          <form className="login-form" onSubmit={handleSubmit}>
            {signup && (
              <label className="login-field">
                <span>Nome</span>
                <div className="login-input">
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    autoComplete="name"
                    required
                  />
                </div>
              </label>
            )}
            <label className="login-field">
              <span>E-mail</span>
              <div className="login-input">
                <Mail size={17} />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="username"
                  required
                />
              </div>
            </label>
            <label className="login-field">
              <span>Senha</span>
              <div className="login-input">
                <Lock size={17} />
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  autoComplete={signup ? "new-password" : "current-password"}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="login-eye"
                  aria-label={showPw ? "Esconder senha" : "Mostrar senha"}
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            {signup && (
              <label className="login-field">
                <span>Confirmar senha</span>
                <div className="login-input">
                  <Lock size={17} />
                  <input
                    type={showPw ? "text" : "password"}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
              </label>
            )}
            {!signup && (
              <div className="login-row">
                <span />
                <button type="button" className="login-link" onClick={handleForgot}>
                  Esqueci minha senha
                </button>
              </div>
            )}
            <button className="land-btn acid login-submit" type="submit" disabled={busy}>
              {busy ? "Um momento..." : signup ? "Criar conta" : "Entrar"}
              <i>{landArrow}</i>
            </button>
            {notice && <p className="login-notice">{notice}</p>}
            {error && <p className="login-notice login-error">{error}</p>}
          </form>
          <div className="login-divider">
            <span>ou</span>
          </div>
          <p className="login-sub login-create-hint">
            {signup ? "Já tem conta?" : "Ainda não tem conta?"}
          </p>
          <button
            className="land-btn login-create"
            onClick={() => {
              setMode(signup ? "login" : "signup");
              setError("");
              setNotice("");
            }}
          >
            {signup ? "Entrar" : "Criar minha conta"}
            <i>{landArrow}</i>
          </button>
        </div>
      </div>
    </div>
  );
}
function VerifyEmail({ email }) {
  const { resendVerification, refreshEmailVerified, signOutUser } = useAuth();
  const [status, setStatus] = useState("Enviando o e-mail de confirmação...");
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  useEffect(() => {
    resendVerification()
      .then(() => setStatus(""))
      .catch(() => setStatus("Não conseguimos enviar o e-mail agora. Tenta \"Reenviar\" abaixo."));
  }, []);
  async function handleResend() {
    setResending(true);
    setStatus("");
    try {
      await resendVerification();
      setStatus("Reenviado! Confere sua caixa de entrada (e o spam).");
    } catch (err) {
      setStatus("Não deu pra reenviar: " + (err?.code || err?.message || "erro desconhecido"));
    } finally {
      setResending(false);
    }
  }
  async function handleCheck() {
    setChecking(true);
    setStatus("");
    const verified = await refreshEmailVerified();
    if (!verified) setStatus("Ainda não encontramos a confirmação. Já clicou no link do e-mail?");
    setChecking(false);
  }
  return (
    <div className="land login">
      <div className="login-panel">
        <div className="login-panel-inner">
          <div className="login-brand">
            <Brand />
          </div>
          <h2 className="land-d login-title">
            Confirme
            <br />
            <span className="l2">seu e-mail.</span>
          </h2>
          <p className="login-sub">
            Mandamos um link de confirmação para <strong>{email}</strong>. Clica nele e volta
            aqui.
          </p>
          <button className="land-btn acid login-submit" type="button" onClick={handleCheck} disabled={checking}>
            {checking ? "Verificando..." : "Já confirmei"}
            <i>{landArrow}</i>
          </button>
          {status && <p className="login-notice">{status}</p>}
          <div className="login-divider">
            <span>ou</span>
          </div>
          <button className="land-btn login-create" type="button" onClick={handleResend} disabled={resending}>
            {resending ? "Enviando..." : "Reenviar e-mail"}
            <i>{landArrow}</i>
          </button>
          <button
            type="button"
            className="login-link"
            style={{ marginTop: 22 }}
            onClick={() => signOutUser()}
          >
            Usar outra conta
          </button>
        </div>
      </div>
    </div>
  );
}
function App() {
  const [person, setPerson] = useState(null),
    [view, setView] = useState("today"),
    [records, setRecords] = useState(loadRecords),
    [selected, setSelected] = useState(dateKey()),
    [today, setToday] = useState(dateKey()),
    [month, setMonth] = useState(dateKey().slice(0, 7)),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState(""),
    [full, setFull] = useState(false),
    [stage, setStage] = useState("landing"),
    [photos, setPhotos] = useState({}),
    [uploadingPhoto, setUploadingPhoto] = useState(false),
    [couple, setCouple] = useState(null),
    [generatingInvite, setGeneratingInvite] = useState(false);
  const toastTimer = useRef();
  const photoInputRef = useRef();
  const pendingPhotoPerson = useRef(null);
  const { user, userDoc, loading: authLoading } = useAuth();
  async function handleGenerateInvite() {
    setGeneratingInvite(true);
    try {
      await createCoupleInvite(user.uid, userDoc.name);
    } catch {
      notify("Não foi possível gerar o convite. Tenta de novo.");
    } finally {
      setGeneratingInvite(false);
    }
  }
  useEffect(() => {
    if (!firebaseReady) return;
    return subscribeProfilePhotos(setPhotos);
  }, []);
  useEffect(() => {
    if (!userDoc?.coupleId) {
      setCouple(null);
      return;
    }
    return subscribeCouple(userDoc.coupleId, setCouple);
  }, [userDoc?.coupleId]);
  useEffect(() => {
    const timer = setInterval(() => setToday(dateKey()), 30000);
    const sync = (e) => {
      if (e.key === KEY) setRecords(loadRecords());
    };
    const fs = () => setFull(Boolean(document.fullscreenElement));
    window.addEventListener("storage", sync);
    document.addEventListener("fullscreenchange", fs);
    return () => {
      clearInterval(timer);
      clearTimeout(toastTimer.current);
      window.removeEventListener("storage", sync);
      document.removeEventListener("fullscreenchange", fs);
    };
  }, []);
  const notify = (text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  };
  async function enterFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    } catch {
      notify("A tela cheia não está disponível neste navegador.");
    }
  }
  async function exitFullscreenMode() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* ignore */
    }
  }
  function openPhotoPicker(p) {
    if (!firebaseReady) {
      notify("O upload de foto ainda está sendo configurado.");
      return;
    }
    pendingPhotoPerson.current = p;
    photoInputRef.current?.click();
  }
  async function handlePhotoFile(e) {
    const file = e.target.files[0];
    const p = pendingPhotoPerson.current;
    e.target.value = "";
    if (!file || !p) return;
    setUploadingPhoto(true);
    try {
      await uploadProfilePhoto(p, file);
    } catch {
      notify("Não foi possível enviar a foto.");
    } finally {
      setUploadingPhoto(false);
    }
  }
  const dayFor = (p, key = selected) =>
    records[`${p}:${key}`] || createDay(p, key);
  function update(p, key, fn) {
    if (key !== today) {
      notify("Só é possível alterar as marcações de hoje.");
      return;
    }
    const fresh = loadRecords();
    const day = structuredClone(fresh[`${p}:${key}`] || createDay(p, key));
    fn(day);
    day.person = p;
    const next = { ...fresh, [`${p}:${key}`]: day };
    try {
      saveRecords(next);
      setRecords(next);
    } catch {
      notify(
        "Não foi possível salvar. Verifique o espaço e as permissões do navegador.",
      );
    }
  }
  function enter(p) {
    setPerson(p);
    setView(p === "house" ? "house" : "consistency");
    setSelected(today);
    setMonth(today.slice(0, 7));
    window.scrollTo(0, 0);
  }
  function toggleMeal(p, d, id) {
    update(p, d.date, (v) => (v.done[id] = !v.done[id]));
  }
  function changePlan(p, d, plan) {
    if (d.date !== today) { notify("Só é possível alterar o planejamento de hoje."); return; }
    update(p, d.date, (v) => {
      const previous = v.meals;
      const done = v.done;
      v.planId = plan.id;
      v.meals = structuredClone(plan.meals);
      v.done = Object.fromEntries(
        v.meals
          .filter(
            (m) =>
              done[m.id] &&
              previous.some((old) => old.id === m.id && old.items === m.items),
          )
          .map((m) => [m.id, true]),
      );
    });
    setModal(null);
    notify("Planejamento do dia atualizado.");
  }
  const active = person === "house" ? "stephany" : person;
  const nav = [
    ["consistency", CalendarDays, "Calendário"],
    ["today", Sun, "Meu dia"],
    ["diet", Utensils, "Alimentação"],
    ["house", House, "Quadro da casa"],
  ];
  function week(p) {
    const monday = addDays(selected, -((parseDate(selected).getDay() + 6) % 7));
    return (
      <div className="week-strip">
        <button
          className="icon-button week-arrow"
          aria-label="Semana anterior"
          disabled={addDays(selected, -7) < today}
          onClick={() => setSelected(addDays(selected, -7))}
        >
          <ChevronLeft size={18} />
        </button>
        {Array.from({ length: 7 }, (_, i) => {
          const key = addDays(monday, i),
            saved = records[`${p}:${key}`],
            complete = saved && status(saved).complete;
          return (
            <button
              key={key}
              className={`week-day ${selected === key ? "selected" : ""} ${key === today ? "is-today" : ""}`}
              disabled={key < today}
              onClick={() => setSelected(key)}
              aria-label={`${fmt(key, { day: "numeric", month: "long" })}${complete ? ", completo" : ""}`}
              aria-pressed={selected === key}
            >
              <span>{fmt(key, { weekday: "short" }).replace(".", "")}</span>
              <strong>{parseDate(key).getDate()}</strong>
              <span className={`day-dot ${complete ? "done" : ""}`}>
                {complete ? <Check size={10} /> : key === today ? "•" : ""}
              </span>
            </button>
          );
        })}
        <button
          className="icon-button week-arrow"
          aria-label="Próxima semana"
          onClick={() => setSelected(addDays(selected, 7))}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  }
  function Meals({ p, d, compact = false }) {
    const s = status(d);
    return (
      <section className={`panel meals-panel ${compact ? "compact" : ""}`}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">NO SEU TEMPO</span>
            <h2>
              À mesa{" "}
              <span className="soft-count">
                {s.meals}/{d.meals.length}
              </span>
            </h2>
          </div>
          <button
            className="text-button"
            disabled={d.date !== today}
            onClick={() => setModal({ type: "plans", p, d })}
          >
            Trocar plano <RefreshCw size={14} />
          </button>
        </div>
        <div className="meal-list">
          {d.meals.map((m, i) => (
            <div
              className={`meal-row ${d.done[m.id] ? "meal-done" : ""}`}
              key={m.id}
            >
              <div className="meal-time">
                {m.time}
                <span className="timeline-dot" />
              </div>
              <button
                className="meal-info"
                onClick={() => setModal({ type: "meal", p, d, meal: m })}
              >
                <span className="meal-title">{m.name}</span>
                <span className="meal-description">
                  {compact ? m.items : m.items}
                </span>
              </button>
              <button
                className="check-button"
                aria-label={`${d.done[m.id] ? "Desmarcar" : "Concluir"} ${m.name} de ${profiles[p].name}`}
                aria-pressed={!!d.done[m.id]}
                disabled={d.date !== today}
                onClick={() => toggleMeal(p, d, m.id)}
              >
                {d.done[m.id] ? <Check size={19} /> : <Plus size={18} />}
              </button>
            </div>
          ))}
        </div>
        <div className="panel-foot">
          <Leaf size={15} />
          <span>{plans.find((x) => x.id === d.planId)?.name}</span>
        </div>
      </section>
    );
  }
  function Water({ p, d }) {
    return (
      <section className="panel water-panel">
        <div className="section-heading">
          <div className="icon-label">
            <span className="water-icon">
              <Droplets {...iconProps} />
            </span>
            <h2>Água do dia</h2>
          </div>
          {status(d).water === 1 && (
            <CheckCheck size={20} className="water-color" />
          )}
        </div>
        <div className="water-values">
          <strong>
            {(d.water / 1000).toLocaleString("pt-BR", {
              maximumFractionDigits: 2,
            })}
            <span> L</span>
          </strong>
          <span>de {(d.waterGoal / 1000).toLocaleString("pt-BR")} L</span>
        </div>
        <div
          className="water-track"
          role="progressbar"
          aria-label="Água consumida"
          aria-valuenow={d.water}
          aria-valuemax={Math.max(d.waterGoal, d.water)}
        >
          <div
            style={{
              width: `${Math.min((d.water / d.waterGoal) * 100, 100)}%`,
            }}
          />
        </div>
        <form className="water-total-form" onSubmit={(event) => {
          event.preventDefault();
          const input = event.currentTarget.elements.total;
          const raw = input.value.trim().replace(',', '.');
          const liters = Number(raw);
          if (!/^\d+(\.\d{1,3})?$/.test(raw) || !Number.isFinite(liters) || liters < 0) {
            input.setCustomValidity('Informe o total em litros, por exemplo: 2,1.');
            input.reportValidity();
            return;
          }
          update(p, d.date, value => { value.water = Math.round(liters * 1000); });
        }}>
          <label htmlFor={`water-total-${p}-${d.date}`}>Quanto você bebeu neste dia?</label>
          <div className="water-total-controls">
            <div className="water-total-input"><input id={`water-total-${p}-${d.date}`} name="total" type="text" inputMode="decimal" required autoComplete="off" defaultValue={(d.water / 1000).toLocaleString('pt-BR', {maximumFractionDigits: 3})} placeholder="Ex.: 2,1" disabled={d.date !== today} onInput={event => event.currentTarget.setCustomValidity('')} /><span>litros</span></div>
            <button type="submit" disabled={d.date !== today}>Salvar total</button>
          </div>
        </form>
        <p className="tiny">
          {d.water >= d.waterGoal
            ? "Meta de água alcançada. Muito bem!"
            : "Informe o total do dia. Você pode corrigir depois."}
        </p>
      </section>
    );
  }
  function Workouts({ p, d }) {
    return (
      <section className="panel workout-panel">
        <div className="section-heading">
          <div className="icon-label">
            <Dumbbell {...iconProps} />
            <h2>Corpo em movimento</h2>
          </div>
        </div>
        {d.workouts.length ? (
          d.workouts.map((w) => (
            <div key={w.id} className="workout-row">
              <span className="workout-glyph">
                {w.id === "gym" ? <Dumbbell size={22} /> : <Flame size={22} />}
              </span>
              <div>
                <strong>{w.name}</strong>
                <span>
                  {w.time} · {w.done ? "Concluído" : w.detail}
                </span>
              </div>
              <button
                className={`check-button ${w.done ? "checked" : ""}`}
                aria-pressed={w.done}
                disabled={d.date !== today}
                aria-label={`${w.done ? "Desmarcar" : "Concluir"} ${w.name} de ${profiles[p].name}`}
                onClick={() =>
                  update(
                    p,
                    d.date,
                    (v) =>
                      (v.workouts.find((x) => x.id === w.id).done = !w.done),
                  )
                }
              >
                {w.done ? <Check size={18} /> : <Plus size={18} />}
              </button>
            </div>
          ))
        ) : (
          <p className="rest">
            <Leaf size={22} />
            Hoje tem espaço para descansar.
            <span>Sem treino obrigatório neste dia.</span>
          </p>
        )}
      </section>
    );
  }
  function Daily({ p }) {
    const d = dayFor(p),
      s = status(d);
    return (
      <>
        <button className="text-button back-calendar" onClick={() => {
          setMonth(selected.slice(0, 7));
          setView("consistency");
          window.scrollTo(0, 0);
        }}><ChevronLeft size={17} />Voltar ao calendário</button>
        <div className="page-heading">
          <div>
            <div className="date-label">
              {fmt(selected, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </div>
            <h1>
              {selected === today ? (
                <>
                  Um dia de cada vez
                  <span className="accent">, {profiles[p].short}.</span>
                </>
              ) : (
                "Seu dia, no seu ritmo."
              )}
            </h1>
            <p>Um pouco de cuidado. Mais perto de você.</p>
          </div>
          <span className="outline-icon">
            <Heart size={27} strokeWidth={1.3} />
          </span>
        </div>
        {week(p)}
        {selected !== today && <div className="readonly-day"><CalendarDays size={17}/><span>{selected < today ? "Este dia já passou. O histórico está disponível apenas para consulta." : "Dia planejado. As marcações serão liberadas nesta data."}</span></div>}
        <div className="daily-grid">
          <div className="main-column">
            <div className="daily-summary">
              <div
                className="progress-ring"
                style={{ "--progress": `${s.percent}%` }}
              >
                <span>
                  {s.percent}
                  <small>%</small>
                </span>
              </div>
              <div>
                <span className="eyebrow">{selected === today ? "SEU RITMO DE HOJE" : "SEU RITMO NESTE DIA"}</span>
                <h3>
                  {s.complete
                    ? "Seu dia está completo."
                    : s.done
                      ? "Cada cuidado conta."
                      : "O primeiro cuidado começa aqui."}
                </h3>
                <p>
                  {s.done} de {s.total} cuidados concluídos{" "}
                  {s.complete
                    ? "· feito por você."
                    : "· sem pressa, sem perfeição."}
                </p>
              </div>
              <Sparkles className="summary-spark" size={27} />
            </div>
            <Meals p={p} d={d} />
          </div>
          <aside className="side-column">
            <Water p={p} d={d} />
            <Workouts p={p} d={d} />
            <div className="kind-note">
              <span>UM LEMBRETE GENTIL</span>
              <p>
                Você não precisa fazer tudo perfeito.
                <br />
                Só continuar cuidando de você.
              </p>
              <Heart size={16} />
            </div>
          </aside>
        </div>
      </>
    );
  }
  function Calendar() {
    const p = active,
      m = metrics(records, p, month, today),
      start = new Date(month + "-01T12:00:00"),
      offset = (start.getDay() + 6) % 7,
      count = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    return (
      <>
        {full && (
          <button
            className="calendar-fullscreen-exit"
            aria-label="Sair da tela cheia"
            onClick={exitFullscreenMode}
          >
            <X size={22} />
          </button>
        )}
        {!full && (
          <div className="page-heading">
            <div>
              <div className="date-label">O CALENDÁRIO DE {profiles[p].name.toUpperCase()}</div>
              <h1>
                Seu mês, <span className="accent">um cuidado por vez.</span>
              </h1>
              <p>Escolha um dia para abrir suas refeições, água e treino.</p>
            </div>
          </div>
        )}
        {!full && (
          <div className="metrics">
            {[
              [m.complete, "dias completos"],
              [`${m.percent}%`, "dos dias registrados"],
              [m.current, "sequência atual"],
              [m.best, "melhor sequência"],
            ].map(([n, label]) => (
              <div key={label}>
                <strong>{n}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
        <section className="panel calendar-panel routine-calendar">
          <div className="section-heading">
            <button
              className="icon-button"
              aria-label="Mês anterior"
              onClick={() => {
                start.setMonth(start.getMonth() - 1);
                setMonth(dateKey(start).slice(0, 7));
              }}
            >
              <ChevronLeft />
            </button>
            <h2>
              {start.toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button className="calendar-today" onClick={() => {setMonth(today.slice(0,7));setSelected(today);}}>Hoje</button>
            <button
              className="icon-button"
              aria-label="Próximo mês"
              onClick={() => {
                start.setMonth(start.getMonth() + 1);
                setMonth(dateKey(start).slice(0, 7));
              }}
            >
              <ChevronRight />
            </button>
          </div>
          <div className="calendar-grid">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((x) => (
              <span className="calendar-weekday" key={x}>
                {x}
              </span>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <span className="calendar-empty" aria-hidden="true" key={"blank" + i} />
            ))}
            {Array.from({ length: count }, (_, i) => {
              const key = `${month}-${String(i + 1).padStart(2, "0")}`,
                d = dayFor(p, key),
                s = status(d),
                dietDone = s.meals === d.meals.length,
                waterDone = Boolean(s.water),
                rest = d.workouts.length === 0,
                workoutDone = !rest && s.workouts === d.workouts.length;
              return (
                <button
                  className={`calendar-cell ${key === today ? "is-today" : ""} ${key === selected ? "selected" : ""} ${s?.complete ? "complete" : ""} ${key > today ? "future" : ""}`}
                  key={key}
                  disabled={key < today}
                  aria-label={`${fmt(key,{day:'numeric',month:'long',year:'numeric'})}${key===today?', hoje':''}. ${key>today?'Planejado':s.complete?'Dia completo':s.started?'Em andamento':'Sem registros'}. Alimentação ${dietDone?'concluída':`${s.meals} de ${d.meals.length}`}, água ${waterDone?'concluída':'pendente'}, ${rest?'descanso':workoutDone?'treino concluído':'treino pendente'}. Abrir dia.`}
                  onClick={() => {
                    setSelected(key);
                    setView("today");
                    window.scrollTo(0, 0);
                  }}
                >
                  <span className="calendar-date"><strong>{i + 1}</strong>{key===today?<em>Hoje</em>:null}</span>{s.complete && <Check className="calendar-big-check" aria-hidden="true" strokeWidth={2.5}/>}
                  <span className="calendar-care" aria-hidden="true">
                    <span className={`care-icon ${dietDone?'care-done':s.meals?'care-partial':''}`}><Utensils size={17}/></span>
                    <span className={`care-icon ${waterDone?'care-done':d.water?'care-partial':''}`}><Droplets size={17}/></span>
                    <span className={`care-icon ${workoutDone?'care-done':rest?'care-rest':s.workouts?'care-partial':''}`}>{rest?<Leaf size={17}/>:<Dumbbell size={17}/>}</span>
                  </span>
                  <small className="calendar-plan">{plans.find(x=>x.id===d.planId)?.name}</small>
                  <span className="calendar-day-progress" aria-hidden="true"><span style={{width:`${s.percent}%`}}/></span>
                </button>
              );
            })}
            {Array.from({length:(7-(offset+count)%7)%7},(_,i)=><span className="calendar-empty" aria-hidden="true" key={`end-${i}`}/>)}
          </div>
          <div className="calendar-legend">
            <span><Utensils size={14}/>Alimentação</span>
            <span><Droplets size={14}/>Água</span>
            <span><Dumbbell size={14}/>Treino</span>
            <span><Leaf size={14}/>Descanso</span>
          </div>
        </section>
        {!full && (
          <>
            <div className="calendar-status-key"><span><i className="key-done"/>Concluído</span><span><i className="key-partial"/>Em andamento</span><span><i/>Ainda sem marcação</span></div>
            <p className="calendar-explainer">
              Seu dia de hoje pode continuar em andamento sem quebrar a sequência.
              Dias futuros não entram na conta. O percentual considera apenas os
              dias com registros neste mês.
            </p>
          </>
        )}
      </>
    );
  }
  function HouseBoard() {
    return (
      <>
        <div className="page-heading">
          <div>
            <div className="date-label">NOSSA ROTINA, JUNTOS</div>
            <h1>
              Um cuidado <span className="accent">a dois.</span>
            </h1>
            <p>
              {fmt(selected, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              · cada um no seu ritmo.
            </p>
          </div>
          <button
            className="secondary-button"
            onClick={async () => {
              try {
                document.fullscreenElement
                  ? await document.exitFullscreen()
                  : await document.documentElement.requestFullscreen();
              } catch {
                notify("A tela cheia não está disponível neste navegador.");
              }
            }}
          >
            {full ? <Minimize size={18} /> : <Maximize size={18} />}
            <span>{full ? "Sair da tela cheia" : "Tela cheia"}</span>
          </button>
        </div>
        <div className="board-date">
          <button
            className="icon-button"
            aria-label="Dia anterior"
            disabled={addDays(selected, -1) < today}
            onClick={() => setSelected(addDays(selected, -1))}
          >
            <ChevronLeft />
          </button>
          <button className="text-button" onClick={() => setSelected(today)}>
            {selected === today
              ? "Hoje"
              : fmt(selected, { day: "numeric", month: "short" })}
          </button>
          <button
            className="icon-button"
            aria-label="Próximo dia"
            onClick={() => setSelected(addDays(selected, 1))}
          >
            <ChevronRight />
          </button>
        </div>
        <div className="house-grid">
          {Object.entries(profiles).map(([p, profile]) => {
            const d = dayFor(p),
              s = status(d);
            return (
              <div className={`person-board theme-${profile.color}`} key={p}>
                <div className="board-person">
                  {photos[p] ? (
                    <img className="avatar avatar-photo" src={photos[p]} alt={profile.name} />
                  ) : (
                    <span className="avatar">{profile.initial}</span>
                  )}
                  <div>
                    <h2>{profile.name}</h2>
                    <span>
                      {s.done} de {s.total} cuidados
                    </span>
                  </div>
                  <strong>{s.percent}%</strong>
                </div>
                <div className="board-progress">
                  <div style={{ width: `${s.percent}%` }} />
                </div>
                <Meals p={p} d={d} compact />
                <Water p={p} d={d} />
                <Workouts p={p} d={d} />
              </div>
            );
          })}
        </div>
      </>
    );
  }
  function Diet() {
    const d = dayFor(active);
    return (
      <>
        <div className="page-heading">
          <div>
            <div className="date-label">COMIDA DE VERDADE</div>
            <h1>
              Seu plano, <span className="accent">com espaço para viver.</span>
            </h1>
            <p>
              Escolha o que combina com o seu dia.{" "}
              {fmt(selected, { day: "numeric", month: "long" })}.
            </p>
          </div>
        </div>
        <div className="plans-grid">
          {plans.map((plan, i) => (
            <button
              key={plan.id}
              className={`plan-card ${d.planId === plan.id ? "active" : ""}`}
              disabled={selected !== today}
              onClick={() =>
                setModal({ type: "planDetail", p: active, d, plan })
              }
            >
              <span className="plan-icon">
                {i === 2 ? (
                  <Coffee size={27} />
                ) : i > 2 ? (
                  <Flame size={27} />
                ) : (
                  <Utensils size={27} />
                )}
              </span>
              <span className="eyebrow">
                {plan.meals.length} REFEIÇÕES {i > 2 ? "· COM PRÉ-JIU" : ""}
              </span>
              <h2>{plan.name}</h2>
              <p>{plan.note}</p>
              <span className="plan-action">
                {d.planId === plan.id ? (
                  <>
                    <Check size={16} /> Plano deste dia
                  </>
                ) : (
                  <>
                    Ver refeições <ArrowUpRight size={18} />
                  </>
                )}
              </span>
            </button>
          ))}
        </div>
        <p className="calendar-explainer">
          Opções transcritas do planejamento enviado para Stephany. Quantidades
          e valores nutricionais ainda não foram validados. Alterar um plano
          aqui muda somente a data selecionada.
        </p>
      </>
    );
  }
  const verse = verseOfDay();
  if (authLoading) return null;
  if (!user && stage === "landing")
    return <Landing onEnter={() => setStage("login")} />;
  if (!user && stage !== "landing") return <LoginPage onBack={() => setStage("landing")} />;
  if (user && !userDoc) return null;
  if (user && userDoc && !userDoc.onboardingComplete)
    return <Onboarding uid={user.uid} name={userDoc.name} onDone={() => {}} />;
  if (!person)
    return (
      <div className="welcome theme-rose">
        <header>
          <Brand />
          <span className="welcome-top">NOSSA ROTINA. NOSSO TEMPO.</span>
        </header>
        <main className="welcome-main">
          <span className="welcome-kicker">
            <span />
            PEQUENOS CUIDADOS, TODOS OS DIAS
          </span>
          <h1>
            Faz bem cuidar.
            <br />
            <span>Melhor ainda, juntos.</span>
          </h1>
          <p>
            Seu espaço para comer bem, se movimentar
            <br className="desktop-break" /> e celebrar cada pequeno passo.
          </p>
          <input
            type="file"
            accept="image/*"
            ref={photoInputRef}
            style={{ display: "none" }}
            onChange={handlePhotoFile}
          />
          <div className="profile-choices">
            {(() => {
              const myKey = personKeyForName(userDoc?.name);
              const otherKey = Object.keys(profiles).find((k) => k !== myKey);
              const myName = userDoc?.name || profiles[myKey].name;
              const otherUid = couple?.memberUids?.find((id) => id !== user.uid);
              const otherMember = otherUid ? couple?.members?.[otherUid] : null;
              const otherReady = Boolean(otherMember?.onboardingComplete);
              const myProfile = profiles[myKey];
              const otherProfile = profiles[otherKey];

              function PhotoWrap({ p, name }) {
                return (
                  <span
                    className="profile-photo-wrap"
                    role="button"
                    tabIndex={0}
                    aria-label={`Trocar foto de ${name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openPhotoPicker(p);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        openPhotoPicker(p);
                      }
                    }}
                  >
                    {photos[p] ? (
                      <img className="profile-photo" src={photos[p]} alt={name} />
                    ) : (
                      <span className="avatar profile-photo-fallback">{profiles[p].initial}</span>
                    )}
                    <span className="profile-photo-edit">
                      <Camera size={14} />
                    </span>
                  </span>
                );
              }

              return (
                <>
                  <button
                    className={`profile-card theme-${myProfile.color}`}
                    onClick={() => enter(myKey)}
                  >
                    <PhotoWrap p={myKey} name={myName} />
                    <span className="profile-greeting">MEU MOMENTO DE CUIDADO</span>
                    <strong>{myName}</strong>
                    <span className="profile-bottom">
                      Entrar na minha rotina <ArrowRight size={19} />
                    </span>
                  </button>

                  {otherMember ? (
                    <button
                      className={`profile-card theme-${otherProfile.color} ${otherReady ? "" : "waiting"}`}
                      onClick={() => otherReady && enter(otherKey)}
                    >
                      <PhotoWrap p={otherKey} name={otherMember.name} />
                      <span className="profile-greeting">
                        {otherReady ? "MEU MOMENTO DE CUIDADO" : "AINDA NÃO COMEÇOU"}
                      </span>
                      <strong>{otherMember.name}</strong>
                      <span className="profile-bottom">
                        {otherReady ? (
                          <>
                            Entrar na rotina de {otherMember.name.split(" ")[0]}{" "}
                            <ArrowRight size={19} />
                          </>
                        ) : (
                          `Aguardando ${otherMember.name}`
                        )}
                      </span>
                    </button>
                  ) : couple?.inviteCode ? (
                    <div className="profile-card waiting">
                      <span className="profile-photo-wrap">
                        <span className="avatar profile-photo-fallback">
                          <Link2 size={28} />
                        </span>
                      </span>
                      <span className="profile-greeting">CONVITE ENVIADO</span>
                      <strong>Compartilhe o código</strong>
                      <span className="profile-bottom ob-code-inline">{couple.inviteCode}</span>
                    </div>
                  ) : (
                    <button
                      className="profile-card waiting"
                      onClick={handleGenerateInvite}
                      disabled={generatingInvite}
                    >
                      <span className="profile-photo-wrap">
                        <span className="avatar profile-photo-fallback">
                          <Link2 size={28} />
                        </span>
                      </span>
                      <span className="profile-greeting">AINDA SEM VÍNCULO</span>
                      <strong>Convide seu par</strong>
                      <span className="profile-bottom">
                        {generatingInvite ? (
                          "Gerando..."
                        ) : (
                          <>
                            Gerar código <ArrowRight size={19} />
                          </>
                        )}
                      </span>
                    </button>
                  )}
                </>
              );
            })()}
          </div>
          <button className="house-entry" onClick={() => enter("house")}>
            <House size={20} />
            <span>
              Abrir o quadro da casa
              <small>Os dois lado a lado, do nosso jeito.</small>
            </span>
            <ArrowRight size={19} />
          </button>
          <div className="welcome-footer">
            <Heart size={14} />
            Feito para a vida real. Um dia de cada vez.
          </div>
          <div className="verse-of-day">
            <p>&ldquo;{verse.text}&rdquo;</p>
            <span>{verse.ref}</span>
          </div>
        </main>
      </div>
    );
  return (
    <div
      className={`app theme-${profiles[active].color} ${full ? "fullscreen" : ""}`}
    >
      <aside className="sidebar">
        <button
          className="brand-button"
          onClick={() => setPerson(null)}
          aria-label="Voltar à escolha de perfil"
        >
          <Brand />
        </button>
        <div className="sidebar-caption">SEU ESPAÇO DE CUIDADO</div>
        <nav>
          {nav.map(([key, Icon, label]) => (
            <button
              key={key}
              aria-label={label}
              className={view === key ? "active" : ""}
              onClick={() => {
                setView(key);
                if (key === "consistency") enterFullscreen();
              }}
            >
              <Icon {...iconProps} />
              <span>{label}</span>
              {view === key && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="little-message">
            <Link2 size={22} />
            <p>
              Pequenos passos.
              <br />
              <strong>Uma rotina que fica.</strong>
            </p>
          </div>
          <button
            className="profile-switch"
            aria-label="Trocar perfil"
            onClick={() => setPerson(null)}
          >
            <span className="avatar small">
              {person === "house" ? (
                <House size={18} />
              ) : (
                profiles[active].initial
              )}
            </span>
            <span>
              {person === "house" ? "Nossa casa" : profiles[active].name}
              <small>Trocar perfil</small>
            </span>
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="mobile-brand brand-button"
            onClick={() => setPerson(null)}
          >
            <Brand />
          </button>
          <div className="topbar-right">
            <button
              className="avatar small"
              aria-label="Trocar perfil"
              onClick={() => setPerson(null)}
            >
              {profiles[active].initial}
            </button>
          </div>
        </header>
        <main className="content">
          {view === "today" ? (
            <Daily p={active} />
          ) : view === "diet" ? (
            <Diet />
          ) : view === "consistency" ? (
            <Calendar />
          ) : (
            <HouseBoard />
          )}
          <footer className="content-footer">
            <Brand compact />
            <span>Um dia de cada vez. E está tudo bem.</span>
            <span>Stephany & Leandro</span>
          </footer>
        </main>
      </div>
      <nav className="bottom-nav">
        {nav.map(([key, Icon, label]) => (
          <button
            key={key}
            aria-label={label}
            className={view === key ? "active" : ""}
            onClick={() => {
              setView(key);
              window.scrollTo(0, 0);
              if (key === "consistency") enterFullscreen();
            }}
          >
            <Icon size={21} />
            <span>
              {key === "house"
                ? "Nossa casa"
                : key === "diet"
                  ? "Comer bem"
                  : label}
            </span>
          </button>
        ))}
      </nav>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      {modal && (
        <Modal onClose={() => setModal(null)}>
          {modal.type === "meal" ? (
            <>
              <span className="eyebrow">
                {modal.meal.time} · {profiles[modal.p].name}
              </span>
              <h2>{modal.meal.name}</h2>
              <ul className="food-list">
                {modal.meal.items.split(" · ").map((x) => (
                  <li key={x}>
                    <Leaf size={17} />
                    {x}
                  </li>
                ))}
              </ul>
              <button
                className="primary-button"
                disabled={modal.d.date !== today}
                onClick={() => {
                  toggleMeal(
                    modal.p,
                    dayFor(modal.p, modal.d.date),
                    modal.meal.id,
                  );
                  setModal(null);
                }}
              >
                <Check size={18} />
                {dayFor(modal.p, modal.d.date).done[modal.meal.id]
                  ? "Desmarcar refeição"
                  : "Concluir refeição"}
              </button>
            </>
          ) : modal.type === "plans" ? (
            <>
              <span className="eyebrow">SÓ PARA ESTE DIA</span>
              <h2>O que combina com hoje?</h2>
              <p className="modal-copy">
                Refeições alteradas precisarão ser marcadas novamente.
              </p>
              <div className="plan-options">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    disabled={modal.d.date !== today}
                    onClick={() => changePlan(modal.p, modal.d, plan)}
                  >
                    <span>
                      <strong>{plan.name}</strong>
                      <small>{plan.meals.length} refeições</small>
                    </span>
                    {modal.d.planId === plan.id ? (
                      <Check size={18} />
                    ) : (
                      <ArrowRight size={18} />
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : modal.type === "planDetail" ? (
            <>
              <span className="eyebrow">
                {modal.plan.meals.length} REFEIÇÕES
              </span>
              <h2>{modal.plan.name}</h2>
              <div className="plan-detail">
                {modal.plan.meals.map((m) => (
                  <div key={m.id}>
                    <span>{m.time}</span>
                    <strong>{m.name}</strong>
                    <p>{m.items}</p>
                  </div>
                ))}
              </div>
              <button
                className="primary-button"
                onClick={() => changePlan(modal.p, modal.d, modal.plan)}
              >
                Usar neste dia <ArrowRight size={18} />
              </button>
              <p className="tiny">
                Refeições com alimentos diferentes serão desmarcadas.
              </p>
            </>
          ) : (
            <>
              <span className="eyebrow">
                {fmt(modal.key, { day: "numeric", month: "long" })}
              </span>
              <h2>{profiles[modal.p].name}, seu dia.</h2>
              <div className="day-modal-status">
                {status(dayFor(modal.p, modal.key)).done} de{" "}
                {status(dayFor(modal.p, modal.key)).total} cuidados concluídos
              </div>
              <Meals p={modal.p} d={dayFor(modal.p, modal.key)} compact />
              <Water p={modal.p} d={dayFor(modal.p, modal.key)} />
              <Workouts p={modal.p} d={dayFor(modal.p, modal.key)} />
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
function Modal({ children, onClose }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current,
      previous = document.activeElement;
    el.showModal();
    return () => {
      el.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label="Detalhes do planejamento"
    >
      <div className="modal-inner">
        <button
          className="icon-button modal-close"
          aria-label="Fechar"
          onClick={onClose}
        >
          <X />
        </button>
        {children}
      </div>
    </dialog>
  );
}
createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);

