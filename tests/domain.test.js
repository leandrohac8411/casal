import { test } from "node:test";
import assert from "node:assert/strict";
import { createDay, status, metrics, plans, generateMeals } from "../src/domain.js";
test("um dia só fica completo com refeições, água e todos os treinos", () => {
  const d = createDay("stephany", "2026-09-22");
  d.meals.forEach((m) => (d.done[m.id] = true));
  d.water = 2100;
  d.workouts[0].done = true;
  assert.equal(status(d).complete, false);
  d.workouts[1].done = true;
  assert.equal(status(d).complete, true);
  d.water = 2099;
  assert.equal(status(d).complete, false);
});
test("descanso não exige treino; lanche não planejado não é exigido", () => {
  const d = createDay("stephany", "2026-09-27");
  assert.equal(d.workouts.length, 0);
  assert.equal(
    d.meals.some((m) => m.id === "doce"),
    false,
  );
  d.meals.forEach((m) => (d.done[m.id] = true));
  d.water = 2500;
  assert.equal(status(d).complete, true);
});
test("cada dia mantém uma cópia independente do template", () => {
  const d = createDay("stephany", "2026-09-21");
  d.meals[0].items = "alterado";
  assert.notEqual(plans[0].meals[0].items, "alterado");
});
test("hoje em andamento não quebra sequência; futuro não entra nas métricas", () => {
  const records = {};
  for (const key of ["2026-09-20", "2026-09-21", "2026-09-23"]) {
    let d = createDay("stephany", key);
    d.person = "stephany";
    d.meals.forEach((m) => (d.done[m.id] = true));
    d.workouts.forEach((w) => (w.done = true));
    d.water = 2100;
    records[key] = d;
  }
  assert.deepEqual(metrics(records, "stephany", "2026-09", "2026-09-22"), {
    complete: 2,
    eligible: 2,
    percent: 100,
    best: 2,
    current: 2,
  });
});
test("sem onboarding completo, o dia usa os planos fixos de sempre", () => {
  const d = createDay("stephany", "2026-09-22", { onboardingComplete: false });
  assert.notEqual(d.planId, "personalizado");
});
test("com onboarding completo, o dia é gerado a partir da base de alimentos", () => {
  const d = createDay("stephany", "2026-09-22", { onboardingComplete: true });
  assert.equal(d.planId, "personalizado");
  assert.equal(d.meals.length, 5);
});
test("a mesma pessoa e data sempre gera as mesmas refeições", () => {
  const prefs = { onboardingComplete: true };
  const a = generateMeals(prefs, "leandro:2026-09-22");
  const b = generateMeals(prefs, "leandro:2026-09-22");
  assert.deepEqual(a, b);
});
test("respeita os horários de refeição escolhidos no onboarding", () => {
  const meals = generateMeals(
    { onboardingComplete: true, mealTimes: ["cafe", "jantar"] },
    "leandro:2026-09-22",
  );
  assert.deepEqual(meals.map((m) => m.id), ["cafe", "jantar"]);
});
test("alimentos evitados não aparecem nas refeições geradas", () => {
  const meals = generateMeals(
    { onboardingComplete: true, avoidFoods: "frango, atum, presunto" },
    "leandro:2026-09-22",
  );
  const text = meals.map((m) => m.items.toLowerCase()).join(" ");
  assert.equal(text.includes("frango"), false);
  assert.equal(text.includes("atum"), false);
  assert.equal(text.includes("presunto"), false);
});
