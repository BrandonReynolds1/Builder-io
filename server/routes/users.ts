import { RequestHandler } from "express";
import { fetchUsers, approveSponsor, declineSponsor, bulkApproveSponsors, addAuditLog } from "../lib/supabase";

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
    const { id, email, full_name, metadata, password, role } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email required' });
    const { upsertUser } = await import("../lib/supabase");
    const row = await upsertUser({ id, email, full_name, metadata, password, role });
    try {
      if (row?.id) {
        if (!id) {
          // Treat as new registration when no id provided
          await addAuditLog(row.id, 'user.registered', 'user', row.id, { userId: row.id, email: row.email });
        } else {
          await addAuditLog(row.id, 'profile.updated', 'user', row.id, { userId: row.id });
        }
      }
    } catch {}
    return res.status(200).json({ ok: true, user: row });
  } catch (err) {
    console.error('upsert user error', err);
    return res.status(500).json({ error: 'failed to upsert user' });
  }
};

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      return res.status(400).json({ error: 'supabase not configured' });
    }
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const { verifyUserLogin } = await import("../lib/supabase");
    const row = await verifyUserLogin(email, password);
    if (!row) return res.status(401).json({ error: 'invalid credentials' });
    return res.status(200).json({ ok: true, user: row });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'failed to login' });
  }
};

export const handleChangePassword: RequestHandler = async (req, res) => {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      return res.status(400).json({ error: 'supabase not configured' });
    }
    const { userId, oldPassword, newPassword } = req.body || {};
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ error: 'userId, oldPassword, and newPassword required' });
    }
    const { changeUserPassword } = await import("../lib/supabase");
    const ok = await changeUserPassword(userId, oldPassword, newPassword);
    if (!ok) return res.status(401).json({ error: 'invalid old password' });
    try { await addAuditLog(userId, 'password.changed', 'user', userId, { userId }); } catch {}
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('change password error', err);
    return res.status(500).json({ error: 'failed to change password' });
  }
};

export const handleApproveSponsor: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;
    await approveSponsor(id);
    try { await addAuditLog(null, 'sponsor.approved', 'sponsor', id, { sponsorId: id }); } catch {}
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
    try { await addAuditLog(null, 'sponsor.declined', 'sponsor', id, { sponsorId: id }); } catch {}
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
