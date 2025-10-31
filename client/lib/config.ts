export type AppConfig = {
  roles: Array<{ id: number; name: string; description?: string }>;
  priorities: Array<{ id: number; key: string; label: string; weight?: number }>; 
  registration_options: Array<{ id: number; key: string; label: string; description?: string }>;
  questions: Array<{ id: number; key: string; question_text: string; help_text?: string }>
};

export async function fetchAppConfig(): Promise<AppConfig> {
  try {
    const origin = (globalThis as any).location?.origin || '';
    const res = await fetch(`${origin}/api/config`);
    if (!res.ok) throw new Error('failed to fetch config');
    const json = await res.json();
    return {
      roles: json.roles ?? [],
      priorities: json.priorities ?? [],
      registration_options: json.registration_options ?? [],
      questions: json.questions ?? [],
    };
  } catch (err) {
    console.warn('fetchAppConfig failed, falling back to defaults', err);
    return { roles: [], priorities: [], registration_options: [], questions: [] };
  }
}
