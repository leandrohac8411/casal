const API_BASE = import.meta.env.VITE_NEXO_API_BASE;
const SECRET = import.meta.env.VITE_NEXO_SECRET;

export async function nexoTrainedDates(person) {
  if (!API_BASE || !SECRET) return null;
  const res = await fetch(
    `${API_BASE.replace(/\/$/, "")}/api/nexo-status?person=${person}`,
    { headers: { Authorization: `Bearer ${SECRET}` } },
  );
  if (!res.ok) throw new Error(`NEXO Fit respondeu ${res.status}`);
  const body = await res.json();
  return body.trainedDates;
}
