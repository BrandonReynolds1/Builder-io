import { RequestHandler } from "express";
import { fetchRoles, fetchPriorities, fetchRegistrationOptions, fetchQuestions } from "../lib/supabase";

export const handleConfig: RequestHandler = async (_req, res) => {
  try {
    // If Supabase is configured, return DB-driven config
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      const [roles, priorities, registration_options, questions] = await Promise.all([
        fetchRoles(),
        fetchPriorities(),
        fetchRegistrationOptions(),
        fetchQuestions(),
      ]);

      return res.status(200).json({ roles, priorities, registration_options, questions });
    }

    // Fallback: return empty arrays (client should use local defaults)
    return res.status(200).json({ roles: [], priorities: [], registration_options: [], questions: [] });
  } catch (err) {
    console.error("Config route error:", err);
    return res.status(500).json({ error: "failed to load config" });
  }
};
