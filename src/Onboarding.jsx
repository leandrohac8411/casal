import React, { useState } from "react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { saveOnboarding, createCoupleInvite, joinCoupleByCode, markCoupleMemberOnboarded } from "./cloud";

const empty = {
  sex: "",
  age: "",
  height: "",
  weight: "",
  goal: "",
  targetWeight: "",
  activityLevel: "",
  sleepHours: "",
  mealTimes: [],
  trainDays: [],
  trainTime: "",
  mealsPerDay: "",
  eatsVeggies: "",
  avoidFoods: "",
  allergies: "",
  keepSweets: "",
  supplements: "",
  cooks: "",
  freezesMeals: "",
  cookTime: "",
  budget: "",
  workoutGoal: "",
  workoutPlace: "",
  equipment: "",
  experience: "",
  likedExercises: "",
  dislikedExercises: "",
  limitations: "",
};

function Chips({ options, value, onChange, hints }) {
  return (
    <>
      <div className="ob-chips">
        {options.map(([val, label]) => (
          <button
            key={val}
            type="button"
            className={`ob-chip ${value === val ? "on" : ""}`}
            onClick={() => onChange(val)}
          >
            {label}
          </button>
        ))}
      </div>
      {hints && value && hints[value] && <p className="ob-hint">{hints[value]}</p>}
    </>
  );
}

function MultiChips({ options, value, onChange }) {
  const list = value || [];
  function toggle(val) {
    onChange(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);
  }
  return (
    <div className="ob-chips">
      {options.map(([val, label]) => (
        <button
          key={val}
          type="button"
          className={`ob-chip ${list.includes(val) ? "on" : ""}`}
          onClick={() => toggle(val)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="ob-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function Onboarding({ uid, name, onDone }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [coupleStep, setCoupleStep] = useState(null); // null | "invite" | "join"
  const [inviteCode, setInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [coupleNotice, setCoupleNotice] = useState("");
  const [coupleId, setCoupleId] = useState(null);

  function set(key, val) {
    setData((d) => ({ ...d, [key]: val }));
  }

  const steps = [
    {
      title: "Sobre você",
      render: () => (
        <>
          <Field label="Sexo">
            <Chips
              options={[
                ["F", "Feminino"],
                ["M", "Masculino"],
                ["outro", "Outro"],
              ]}
              value={data.sex}
              onChange={(v) => set("sex", v)}
            />
          </Field>
          <Field label="Idade">
            <input type="number" value={data.age} onChange={(e) => set("age", e.target.value)} placeholder="anos" />
          </Field>
          <Field label="Altura (cm)">
            <input type="number" value={data.height} onChange={(e) => set("height", e.target.value)} placeholder="ex: 170" />
          </Field>
          <Field label="Peso atual (kg)">
            <input type="number" value={data.weight} onChange={(e) => set("weight", e.target.value)} placeholder="ex: 70" />
          </Field>
        </>
      ),
    },
    {
      title: "Objetivo",
      render: () => (
        <>
          <Field label="O que você busca?">
            <Chips
              options={[
                ["emagrecer", "Emagrecer"],
                ["manter", "Manter"],
                ["ganhar", "Ganhar massa"],
                ["performance", "Performance"],
              ]}
              value={data.goal}
              onChange={(v) => set("goal", v)}
            />
          </Field>
          <Field label="Peso desejado (kg) — opcional">
            <input
              type="number"
              value={data.targetWeight}
              onChange={(e) => set("targetWeight", e.target.value)}
              placeholder="opcional"
            />
          </Field>
        </>
      ),
    },
    {
      title: "Rotina",
      render: () => (
        <>
          <Field label="Nível de atividade no dia a dia">
            <Chips
              options={[
                ["sedentario", "Sedentário"],
                ["leve", "Leve"],
                ["moderado", "Moderado"],
                ["intenso", "Intenso"],
              ]}
              value={data.activityLevel}
              onChange={(v) => set("activityLevel", v)}
              hints={{
                sedentario: "Pouco ou nenhum exercício, rotina mais parada no dia a dia.",
                leve: "Exercício leve de 1 a 3 vezes por semana.",
                moderado: "Exercício moderado de 3 a 5 vezes por semana.",
                intenso: "Exercício intenso quase todos os dias.",
              }}
            />
          </Field>
          <Field label="Horas de sono por noite">
            <input type="number" value={data.sleepHours} onChange={(e) => set("sleepHours", e.target.value)} placeholder="ex: 7" />
          </Field>
          <Field label="Refeições que costuma fazer">
            <MultiChips
              options={[
                ["pre", "Pré-treino"],
                ["cafe", "Café da manhã"],
                ["almoco", "Almoço"],
                ["lanche", "Lanche da tarde"],
                ["jantar", "Jantar"],
              ]}
              value={data.mealTimes}
              onChange={(v) => set("mealTimes", v)}
            />
          </Field>
          <Field label="Dias que treina">
            <MultiChips
              options={[
                ["seg", "Seg"],
                ["ter", "Ter"],
                ["qua", "Qua"],
                ["qui", "Qui"],
                ["sex", "Sex"],
                ["sab", "Sáb"],
                ["dom", "Dom"],
              ]}
              value={data.trainDays}
              onChange={(v) => set("trainDays", v)}
            />
          </Field>
          <Field label="Horário habitual do treino — opcional">
            <input
              type="text"
              value={data.trainTime}
              onChange={(e) => set("trainTime", e.target.value)}
              placeholder="ex: 8h da manhã"
            />
          </Field>
        </>
      ),
    },
    {
      title: "Alimentação",
      render: () => (
        <>
          <Field label="Quantas refeições por dia prefere">
            <input type="number" value={data.mealsPerDay} onChange={(e) => set("mealsPerDay", e.target.value)} placeholder="ex: 5" />
          </Field>
          <Field label="Come salada/legumes?">
            <Chips
              options={[
                ["sim", "Sim"],
                ["pouco", "Pouco"],
                ["nao", "Não"],
              ]}
              value={data.eatsVeggies}
              onChange={(v) => set("eatsVeggies", v)}
            />
          </Field>
          <Field label="Alimentos que não come">
            <input type="text" value={data.avoidFoods} onChange={(e) => set("avoidFoods", e.target.value)} placeholder="separado por vírgula" />
          </Field>
          <Field label="Alergias/restrições">
            <input type="text" value={data.allergies} onChange={(e) => set("allergies", e.target.value)} placeholder="opcional" />
          </Field>
          <Field label="Quer manter algum doce na rotina?">
            <Chips
              options={[
                ["sim", "Sim"],
                ["nao", "Não"],
              ]}
              value={data.keepSweets}
              onChange={(v) => set("keepSweets", v)}
            />
          </Field>
          <Field label="Usa suplemento (whey etc.)?">
            <Chips
              options={[
                ["sim", "Sim"],
                ["nao", "Não"],
              ]}
              value={data.supplements}
              onChange={(v) => set("supplements", v)}
            />
          </Field>
          <Field label="Cozinha no dia a dia?">
            <Chips
              options={[
                ["sim", "Sim"],
                ["nao", "Não"],
              ]}
              value={data.cooks}
              onChange={(v) => set("cooks", v)}
            />
          </Field>
          <Field label="Congela marmita?">
            <Chips
              options={[
                ["sim", "Sim"],
                ["nao", "Não"],
              ]}
              value={data.freezesMeals}
              onChange={(v) => set("freezesMeals", v)}
            />
          </Field>
          <Field label="Tempo disponível pra cozinhar">
            <Chips
              options={[
                ["pouco", "Pouco"],
                ["medio", "Médio"],
                ["bastante", "Bastante"],
              ]}
              value={data.cookTime}
              onChange={(v) => set("cookTime", v)}
            />
          </Field>
          <Field label="Orçamento alimentar">
            <Chips
              options={[
                ["baixo", "Baixo"],
                ["medio", "Médio"],
                ["alto", "Alto"],
              ]}
              value={data.budget}
              onChange={(v) => set("budget", v)}
            />
          </Field>
        </>
      ),
    },
    {
      title: "Treino",
      render: () => (
        <>
          <Field label="Objetivo do treino">
            <Chips
              options={[
                ["hipertrofia", "Hipertrofia"],
                ["condicionamento", "Condicionamento"],
                ["geral", "Sem foco específico"],
              ]}
              value={data.workoutGoal}
              onChange={(v) => set("workoutGoal", v)}
            />
          </Field>
          <Field label="Onde treina">
            <Chips
              options={[
                ["academia", "Academia"],
                ["casa", "Casa"],
                ["ambos", "Ambos"],
              ]}
              value={data.workoutPlace}
              onChange={(v) => set("workoutPlace", v)}
            />
          </Field>
          <Field label="Equipamento disponível">
            <input type="text" value={data.equipment} onChange={(e) => set("equipment", e.target.value)} placeholder="opcional" />
          </Field>
          <Field label="Experiência">
            <Chips
              options={[
                ["iniciante", "Iniciante"],
                ["intermediario", "Intermediário"],
                ["avancado", "Avançado"],
              ]}
              value={data.experience}
              onChange={(v) => set("experience", v)}
            />
          </Field>
          <Field label="Exercícios que gosta">
            <input type="text" value={data.likedExercises} onChange={(e) => set("likedExercises", e.target.value)} placeholder="opcional" />
          </Field>
          <Field label="Exercícios que não gosta">
            <input type="text" value={data.dislikedExercises} onChange={(e) => set("dislikedExercises", e.target.value)} placeholder="opcional" />
          </Field>
          <Field label="Dor ou limitação">
            <input type="text" value={data.limitations} onChange={(e) => set("limitations", e.target.value)} placeholder="opcional" />
          </Field>
        </>
      ),
    },
    {
      title: "Vínculo do casal",
      render: () => (
        <>
          {!coupleStep && (
            <div className="ob-couple-choices">
              <button type="button" className="land-btn acid" onClick={() => setCoupleStep("invite")}>
                Convidar parceiro(a)
              </button>
              <button type="button" className="land-btn" onClick={() => setCoupleStep("join")}>
                Já tenho um código
              </button>
              <button type="button" className="ob-skip" onClick={() => setCoupleStep("skip")}>
                Pular por enquanto
              </button>
            </div>
          )}
          {coupleStep === "invite" && (
            <div className="ob-couple-panel">
              {inviteCode ? (
                <>
                  <p>Envie este código para seu par:</p>
                  <p className="ob-code">{inviteCode}</p>
                </>
              ) : (
                <button
                  type="button"
                  className="land-btn acid"
                  onClick={async () => {
                    setError("");
                    try {
                      const { code, coupleId: newId } = await createCoupleInvite(uid, name);
                      setInviteCode(code);
                      setCoupleId(newId);
                    } catch (err) {
                      setError(err.message);
                    }
                  }}
                >
                  Gerar código
                </button>
              )}
            </div>
          )}
          {coupleStep === "join" && (
            <div className="ob-couple-panel">
              <Field label="Código do seu par">
                <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="ex: 7F3K2Q" />
              </Field>
              <button
                type="button"
                className="land-btn acid"
                onClick={async () => {
                  setError("");
                  try {
                    const { coupleId: joinedId } = await joinCoupleByCode(uid, name, joinCode);
                    setCoupleId(joinedId);
                    setCoupleNotice("Vínculo feito!");
                  } catch (err) {
                    setError(err.message);
                  }
                }}
              >
                Vincular
              </button>
              {coupleNotice && <p className="ob-notice">{coupleNotice}</p>}
            </div>
          )}
        </>
      ),
    },
  ];

  const last = step === steps.length - 1;

  async function finish() {
    setSaving(true);
    setError("");
    try {
      await saveOnboarding(uid, data);
      if (coupleId) await markCoupleMemberOnboarded(coupleId, uid);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="land ob">
      <div className="ob-panel">
        <div className="ob-progress">
          {steps.map((_, i) => (
            <span key={i} className={`ob-dot ${i <= step ? "on" : ""}`} />
          ))}
        </div>
        <h2 className="land-d ob-title">{steps[step].title}</h2>
        <div className="ob-form">{steps[step].render()}</div>
        {error && <p className="ob-error">{error}</p>}
        <div className="ob-nav">
          {step > 0 && (
            <button type="button" className="land-btn ob-back" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft size={17} />
              Voltar
            </button>
          )}
          {!last && (
            <button type="button" className="land-btn acid ob-next" onClick={() => setStep((s) => s + 1)}>
              Continuar
              <ArrowRight size={17} />
            </button>
          )}
          {last && (
            <button type="button" className="land-btn acid ob-next" onClick={finish} disabled={saving}>
              {saving ? "Salvando..." : "Concluir"}
              <Check size={17} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
