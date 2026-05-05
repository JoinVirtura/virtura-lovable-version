const DEVICE_ID_KEY = "virtura_anon_device_id";
const GEN_COUNT_KEY = "virtura_anon_gen_count";
const ANON_TRIAL_LIMIT = 1;

export function getAnonDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = (typeof crypto !== "undefined" && "randomUUID" in crypto)
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

export function getAnonGenerationCount(): number {
  try {
    const v = localStorage.getItem(GEN_COUNT_KEY);
    return v ? parseInt(v, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function incrementAnonGenerationCount(): number {
  const next = getAnonGenerationCount() + 1;
  try {
    localStorage.setItem(GEN_COUNT_KEY, String(next));
  } catch {}
  return next;
}

export function hasAnonTrialRemaining(): boolean {
  return getAnonGenerationCount() < ANON_TRIAL_LIMIT;
}

export { ANON_TRIAL_LIMIT };
