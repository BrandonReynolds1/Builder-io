import { RequestHandler } from "express";
import { getSupabaseClient } from "../lib/supabase";

export const handleHealth: RequestHandler = async (_req, res) => {
  try {
    // Attempt to run a lightweight query against a small table to verify DB connectivity
    const sb = getSupabaseClient();
    const { data, error } = await sb.from("roles").select("id").limit(1);
    if (error) {
      return res.json({ ok: true, db: false, error: error.message || String(error) });
    }

    // If we reached here, DB is responsive
    return res.json({ ok: true, db: true, sample: Array.isArray(data) ? data.length : null });
  } catch (err: any) {
    return res.json({ ok: true, db: false, error: err?.message || String(err) });
  }
};
