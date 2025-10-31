import { RequestHandler } from "express";
import { fetchIncomingRequestsForSponsor, addConnectionRequest, acceptConnection, declineConnection, fetchConnection } from "../lib/supabase";

export const handleGetIncomingForSponsor: RequestHandler = async (req, res) => {
  try {
    const sponsorId = req.params.id as string;
    const rows = await fetchIncomingRequestsForSponsor(sponsorId);
    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to fetch incoming requests' });
  }
};

export const handleAddConnection: RequestHandler = async (req, res) => {
  try {
    const { userId, sponsorId } = req.body;
    const row = await addConnectionRequest(userId, sponsorId);
    return res.status(200).json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to add connection' });
  }
};

export const handleAcceptConnection: RequestHandler = async (req, res) => {
  try {
    const { userId, sponsorId } = req.body;
    await acceptConnection(userId, sponsorId);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to accept connection' });
  }
};

export const handleDeclineConnection: RequestHandler = async (req, res) => {
  try {
    const { userId, sponsorId } = req.body;
    await declineConnection(userId, sponsorId);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to decline connection' });
  }
};

export const handleGetConnectionStatus: RequestHandler = async (req, res) => {
  try {
    const userId = (req.query.userId as string) || (req.params as any).userId;
    const sponsorId = (req.query.sponsorId as string) || (req.params as any).sponsorId;
    if (!userId || !sponsorId) return res.status(400).json({ error: 'userId and sponsorId required' });
    const row = await fetchConnection(userId, sponsorId);
    if (!row) return res.status(200).json({ status: null });
    return res.status(200).json({ status: row.status, connection: row });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to get connection status' });
  }
};
