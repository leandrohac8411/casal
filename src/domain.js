export const profiles = {
  stephany: {
    name: "Stephany",
    short: "Steph",
    initial: "S",
    color: "rose",
    water: 2100,
  },
  leandro: {
    name: "Leandro",
    short: "Lê",
    initial: "L",
    color: "sage",
    water: 2000,
  },
};
const meal = (id, time, name, items) => ({ id, time, name, items });
export const plans = [
  {
    id: "frango",
    name: "Frango & hambúrguer",
    note: "Simples, do almoço ao jantar.",
    meals: [
      meal("pre", "07:00", "Um começo leve", "1 banana pequena · café"),
      meal(
        "cafe",
        "09:10",
        "Café da manhã",
        "2 ovos · 2 fatias de pão · 1 fatia de muçarela",
      ),
      meal(
        "almoco",
        "12:00",
        "Almoço",
        "Arroz cozido 120 g · feijão 80 g · frango 130 g · azeite 5 g",
      ),
      meal(
        "lanche",
        "16:30",
        "Lanche da tarde",
        "2 fatias de pão · frango desfiado 70 g · 1 fatia de muçarela",
      ),
      meal(
        "jantar",
        "20:30",
        "Hambúrguer em casa",
        "Pão de hambúrguer · patinho 120 g · 1 fatia de queijo · molho a gosto",
      ),
    ],
  },
  {
    id: "pizza",
    name: "Carne moída & pizza",
    note: "Uma pizza para fechar o dia.",
    meals: [
      meal(
        "pre",
        "07:00",
        "Um começo leve",
        "1 fatia de pão · geleia ou doce de leite 10–15 g · café",
      ),
      meal(
        "cafe",
        "09:10",
        "Café da manhã",
        "1 pão francês · 2 ovos · 1 fatia de muçarela",
      ),
      meal(
        "almoco",
        "12:00",
        "Almoço",
        "Arroz 120 g · feijão 80 g · patinho moído 130 g",
      ),
      meal("lanche", "16:30", "Lanche da tarde", "Iogurte proteico · 1 banana"),
      meal(
        "jantar",
        "20:30",
        "Pizza de Rap10",
        "1 Rap10 · molho de tomate · frango 80–100 g · muçarela 40 g",
      ),
    ],
  },
  {
    id: "tilapia",
    name: "Tilápia & um docinho",
    note: "Tem espaço para o que você gosta.",
    meals: [
      meal("pre", "07:00", "Um começo leve", "1 banana pequena · café"),
      meal(
        "cafe",
        "09:10",
        "Café da manhã",
        "1 pão francês · omelete de 2 ovos · 1 fatia de queijo",
      ),
      meal("doce", "10:30", "Uma pausa doce", "Chocolate 20 g"),
      meal(
        "almoco",
        "12:00",
        "Almoço",
        "Arroz 120 g · feijão 80 g · tilápia 150 g · azeite 5 g",
      ),
      meal(
        "lanche",
        "16:30",
        "Lanche da tarde",
        "2 fatias de pão · frango 70 g · requeijão light",
      ),
      meal(
        "jantar",
        "20:30",
        "Jantar",
        "Arroz 100 g · feijão 60 g · carne ou frango 120 g · 1 ovo",
      ),
    ],
  },
  {
    id: "jiu",
    name: "Dia de jiu & hambúrguer",
    note: "Uma pausa extra antes do tatame.",
    meals: [
      meal("pre", "07:00", "Um começo leve", "1 banana pequena · café"),
      meal(
        "cafe",
        "09:10",
        "Café da manhã",
        "1 pão francês · 2 ovos · queijo · 1 fruta pequena",
      ),
      meal(
        "almoco",
        "12:00",
        "Almoço",
        "Arroz 130 g · feijão 80 g · frango 130 g · azeite 5 g",
      ),
      meal(
        "lanche",
        "16:30",
        "Lanche da tarde",
        "Iogurte proteico · fruta pequena",
      ),
      meal(
        "prejiu",
        "17:45",
        "Antes do jiu",
        "1 banana · 1 fatia de pão com doce de leite",
      ),
      meal(
        "jantar",
        "20:30",
        "Hambúrguer em casa",
        "Pão · patinho 120 g · 1 fatia de queijo · vegetais opcionais",
      ),
    ],
  },
  {
    id: "espetinho",
    name: "Jiu & churrasquinho",
    note: "O jantar também pode ser fora.",
    meals: [
      meal("pre", "07:00", "Um começo leve", "1 banana · café"),
      meal(
        "cafe",
        "09:10",
        "Café da manhã",
        "2 fatias de pão · 2 ovos · muçarela · 1 fruta",
      ),
      meal(
        "almoco",
        "12:00",
        "Almoço",
        "Arroz 120 g · feijão 80 g · carne moída 120 g",
      ),
      meal("lanche", "16:30", "Lanche da tarde", "Iogurte proteico"),
      meal(
        "prejiu",
        "17:45",
        "Antes do jiu",
        "Pão ou banana · um pouco de geleia ou doce de leite",
      ),
      meal(
        "jantar",
        "20:30",
        "Churrasquinho",
        "2 espetinhos de carne ou frango · pequena porção de mandioca ou arroz",
      ),
    ],
  },
];
export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function parseDate(key) {
  return new Date(key + "T12:00:00");
}
export function addDays(key, n) {
  let d = parseDate(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}
export function createDay(person, key) {
  const weekday = parseDate(key).getDay();
  const plan = plans[[0, 0, 3, 1, 4, 2, 0][weekday]];
  return {
    date: key,
    planId: plan.id,
    meals: structuredClone(plan.meals),
    waterGoal: profiles[person].water,
    water: 0,
    done: {},
    workouts:
      weekday === 0 || weekday === 6
        ? []
        : [
            {
              id: "gym",
              name: "Musculação",
              time: "08:00",
              detail: "Seu momento de movimento",
              done: false,
            },
            ...([2, 4].includes(weekday)
              ? [
                  {
                    id: "jiu",
                    name: "Jiu-jitsu",
                    time: "19:00",
                    detail: "Hora de ir para o tatame",
                    done: false,
                  },
                ]
              : []),
          ],
  };
}
export function status(day) {
  const meals = day.meals.filter((m) => day.done[m.id]).length;
  const water = day.water >= day.waterGoal ? 1 : 0;
  const workouts = day.workouts.filter((w) => w.done).length;
  const total = day.meals.length + 1 + day.workouts.length;
  const done = meals + water + workouts;
  return {
    done,
    total,
    percent: Math.round((done / total) * 100),
    complete: done === total,
    started: done > 0 || day.water > 0,
    meals,
    water,
    workouts,
  };
}
export function metrics(records, person, month, today) {
  const days = Object.values(records).filter(
    (d) => d.person === person && d.date.startsWith(month) && d.date <= today,
  );
  const complete = days.filter((d) => status(d).complete).length;
  const eligible = days.length;
  const dates = Object.values(records)
    .filter((d) => d.person === person && d.date <= today && status(d).complete)
    .map((d) => d.date)
    .sort();
  let best = 0,
    run = 0,
    prev = "";
  for (const key of dates) {
    run = prev && addDays(prev, 1) === key ? run + 1 : 1;
    best = Math.max(best, run);
    prev = key;
  }
  let current = 0,
    cursor = dates.includes(today) ? today : addDays(today, -1);
  while (dates.includes(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  return {
    complete,
    eligible,
    percent: eligible ? Math.round((complete / eligible) * 100) : 0,
    best,
    current,
  };
}
