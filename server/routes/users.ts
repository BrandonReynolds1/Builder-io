import { RequestHandler } from "express";
import { fetchUsers, approveSponsor, declineSponsor, bulkApproveSponsors } from "../lib/supabase";

export const handleGetUsers: RequestHandler = async (_req, res) => {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      return res.status(200).json([]);
    }
    const users = await fetchUsers();
    return res.status(200).json(users);
  } catch (err) {
    console.error("handleGetUsers error", err);
    return res.status(500).json({ error: "failed to fetch users" });
  }
};

export const handleUpsertUser: RequestHandler = async (req, res) => {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      return res.status(400).json({ error: 'supabase not configured' });
    }
    const { id, email, full_name, metadata } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email required' });
    const { upsertUser } = await import("../lib/supabase");
    const row = await upsertUser({ id, email, full_name, metadata });
    return res.status(200).json({ ok: true, user: row });
  } catch (err) {
    console.error('upsert user error', err);
    return res.status(500).json({ error: 'failed to upsert user' });
  }
};

export const handleApproveSponsor: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;
    await approveSponsor(id);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("approve sponsor error", err);
    return res.status(500).json({ error: "failed to approve sponsor" });
  }
};

export const handleDeclineSponsor: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;
    await declineSponsor(id);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("decline sponsor error", err);
    return res.status(500).json({ error: "failed to decline sponsor" });
  }
};

export const handleBulkApprove: RequestHandler = async (req, res) => {
  try {
    const ids: string[] = req.body.ids ?? [];
    await bulkApproveSponsors(ids);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("bulk approve error", err);
    return res.status(500).json({ error: "failed to bulk approve" });
  }
};
