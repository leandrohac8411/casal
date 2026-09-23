import { test } from "node:test";
import assert from "node:assert/strict";
import { createDay, status, metrics, plans } from "../src/domain.js";
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
