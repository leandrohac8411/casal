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
import { nexoStatus } from "./nexo";
import "./styles.css";
const iconProps = { size: 20, strokeWidth: 1.65 };
const fmt = (d, options) => parseDate(d).toLocaleDateString("pt-BR", options);
function Brand({ compact = false }) {
  return (
    <span className={`brand${compact ? " brand-symbol" : ""}`}>
      <img src={`${import.meta.env.BASE_URL}${compact ? "cf.png" : "casal-fit.png"}`} alt={compact ? "Casal Fit" : "Casal Fit — Hábitos melhores juntos"} />
    </span>
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
    [nexo, setNexo] = useState({});
  const toastTimer = useRef();
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
  useEffect(() => {
    Object.keys(profiles).forEach((p) => syncNexo(p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function syncNexo(p) {
    setNexo((s) => ({ ...s, [p]: { ...s[p], syncing: true, error: "" } }));
    try {
      const result = await nexoStatus(p);
      if (result === null) {
        setNexo((s) => ({ ...s, [p]: { syncing: false, error: "", configured: false } }));
        return;
      }
      const { trainedDates = [], water = [] } = result;
      const until = dateKey();
      const trainedKeys = new Set(trainedDates.map((iso) => dateKey(new Date(iso))));
      const waterByDate = new Map(water.map((w) => [w.date, w.amountMl]));
      const dates = new Set([...trainedKeys, ...waterByDate.keys()]);
      const fresh = loadRecords();
      let changed = false;
      for (const key of dates) {
        if (key > until) continue;
        const existing = fresh[`${p}:${key}`];
        const day = existing ? structuredClone(existing) : createDay(p, key);
        let dayChanged = false;
        if (trainedKeys.has(key) && day.workouts.length && day.workouts.some((w) => !w.done)) {
          day.workouts.forEach((w) => {
            w.done = true;
            w.nexo = true;
          });
          dayChanged = true;
        }
        if (waterByDate.has(key) && day.water !== waterByDate.get(key)) {
          day.water = waterByDate.get(key);
          day.waterNexo = true;
          dayChanged = true;
        }
        if (dayChanged) {
          day.person = p;
          fresh[`${p}:${key}`] = day;
          changed = true;
        }
      }
      if (changed) {
        saveRecords(fresh);
        setRecords(fresh);
      }
      setNexo((s) => ({ ...s, [p]: { syncing: false, error: "", configured: true, lastSync: Date.now() } }));
    } catch {
      setNexo((s) => ({
        ...s,
        [p]: { ...s[p], syncing: false, configured: true, error: "Não foi possível sincronizar com o NEXO Fit." },
      }));
    }
  }
  const notify = (text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  };
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
    if (p === "house") Object.keys(profiles).forEach((pp) => syncNexo(pp));
    else syncNexo(p);
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
          <span>
            {plans.find((x) => x.id === d.planId)?.name}{" "}
            {d.example ? "· exemplo para explorar" : ""}
          </span>
        </div>
      </section>
    );
  }
  function NexoStatus({ p }) {
    return (
      <div className="integration-note">
        <Link2 size={14} />
        <span>
          NEXO Fit{" "}
          <span>
            {nexo[p]?.error
              ? "· erro ao sincronizar"
              : nexo[p]?.syncing
                ? "· sincronizando…"
                : nexo[p]?.configured
                  ? "· sincronizado"
                  : "· não configurado"}
          </span>
        </span>
      </div>
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
          {d.example
            ? "Meta ilustrativa. Ajuste ao definir seu plano."
            : d.waterNexo
              ? "Água sincronizada automaticamente do NEXO Fit."
              : d.water >= d.waterGoal
                ? "Meta de água alcançada. Muito bem!"
                : "Informe o total do dia. Você pode corrigir depois."}
        </p>
        <NexoStatus p={p} />
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
                  {w.time} ·{" "}
                  {w.done
                    ? w.nexo
                      ? "Concluído · NEXO Fit"
                      : "Concluído"
                    : w.detail}
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
        <NexoStatus p={p} />
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
        {d.example && (
          <div className="demo-note">
            O plano de Leandro é ilustrativo. Vamos personalizar suas refeições
            e metas na próxima etapa.
          </div>
        )}
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
        <div className="page-heading">
          <div>
            <div className="date-label">O CALENDÁRIO DE {profiles[p].name.toUpperCase()}</div>
            <h1>
              Seu mês, <span className="accent">um cuidado por vez.</span>
            </h1>
            <p>Escolha um dia para abrir suas refeições, água e treino.</p>
          </div>
        </div>
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
        <div className="calendar-status-key"><span><i className="key-done"/>Concluído</span><span><i className="key-partial"/>Em andamento</span><span><i/>Ainda sem marcação</span></div>
        <p className="calendar-explainer">
          Seu dia de hoje pode continuar em andamento sem quebrar a sequência.
          Dias futuros não entram na conta. O percentual considera apenas os
          dias com registros neste mês.
        </p>
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
                  <span className="avatar">{profile.initial}</span>
                  <div>
                    <h2>{profile.name}</h2>
                    <span>
                      {s.done} de {s.total} cuidados{" "}
                      {d.example ? "· plano ilustrativo" : ""}
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
          <div className="profile-choices">
            {Object.entries(profiles).map(([p, profile]) => (
              <button
                key={p}
                className={`profile-card theme-${profile.color}`}
                onClick={() => enter(p)}
              >
                <span className="profile-top">
                  <span className="avatar">{profile.initial}</span>
                  <ArrowUpRight size={23} />
                </span>
                <span className="profile-greeting">MEU MOMENTO DE CUIDADO</span>
                <strong>{profile.name}</strong>
                <span className="profile-bottom">
                  Entrar na minha rotina <ArrowRight size={19} />
                </span>
              </button>
            ))}
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
              onClick={() => setView(key)}
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
          <span className="breadcrumb">
            Nossa rotina <span>/</span> {nav.find((n) => n[0] === view)?.[2]}
          </span>
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
createRoot(document.getElementById("root")).render(<App />);

