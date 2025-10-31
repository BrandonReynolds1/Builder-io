let lastKnownDbHealthy = false;

export async function checkDbHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      lastKnownDbHealthy = false;
      return false;
    }
    const j = await res.json();
    const ok = !!j && j.db === true;
    lastKnownDbHealthy = ok;
    return ok;
  } catch (err) {
    lastKnownDbHealthy = false;
    return false;
  }
}

export function isDbAvailable(): boolean {
  return lastKnownDbHealthy;
}
