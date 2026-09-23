const KEY = "elo-routine-v1";
export function loadRecords() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "{}");
    if (!value || Array.isArray(value) || typeof value !== "object") return {};
    return Object.fromEntries(
      Object.entries(value).filter(
        ([, d]) =>
          d &&
          typeof d.date === "string" &&
          Array.isArray(d.meals) &&
          Array.isArray(d.workouts) &&
          d.done &&
          Number.isFinite(d.water) &&
          d.waterGoal > 0,
      ),
    );
  } catch {
    return {};
  }
}
export function saveRecords(records) {
  localStorage.setItem(KEY, JSON.stringify(records));
}
export { KEY };
