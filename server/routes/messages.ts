import { RequestHandler } from "express";
import { fetchMessagesForUser, insertMessage } from "../lib/supabase";

export const handleGetMessagesForUser: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.id as string;
    const rows = await fetchMessagesForUser(userId);
    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to fetch messages' });
  }
};

export const handlePostMessage: RequestHandler = async (req, res) => {
  try {
    const { fromUserId, toUserId, body } = req.body;
    const row = await insertMessage(fromUserId, toUserId, body);
    return res.status(200).json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to insert message' });
  }
};
