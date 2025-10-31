export async function checkDbHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      localStorage.setItem('sobr_db_available', '0');
      return false;
    }
    const j = await res.json();
    const ok = !!j && j.db === true;
    localStorage.setItem('sobr_db_available', ok ? '1' : '0');
    return ok;
  } catch (err) {
    localStorage.setItem('sobr_db_available', '0');
    return false;
  }
}

export function isDbAvailable(): boolean {
  return localStorage.getItem('sobr_db_available') === '1';
}
