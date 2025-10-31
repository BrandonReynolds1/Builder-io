import { RequestHandler } from "express";
import { DemoResponse } from "@shared/api";
import { fetchDemoRows } from "../lib/supabase";

export const handleDemo: RequestHandler = async (req, res) => {
  try {
    // If Supabase is configured in environment, return demo rows from the DB.
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      const rows = await fetchDemoRows();
      return res.status(200).json({ message: "Hello from Express server (Supabase)", rows });
    }

    const response: DemoResponse = {
      message: "Hello from Express server",
    };
    return res.status(200).json(response);
  } catch (err) {
    console.error("Demo route error:", err);
    const response: DemoResponse = {
      message: "Hello from Express server (error reading Supabase)",
    };
    return res.status(200).json(response);
  }
};
