import { RequestHandler } from "express";
import {
  getUserRoleByUserId,
  countConnectionsForSponsor,
  countUnreadMessagesForUser,
  countAllUsers,
  countUsersByRole,
  countMessagesLast24h,
  countSponsorsPendingApproval,
  countUnreadMessagesFromSponsorsSystemwide,
  countAvailableSponsors,
  countConnectionsForUser,
} from "../lib/supabase";

export const handleGetDashboardMetrics: RequestHandler = async (req, res) => {
  try {
    const userId = (req.query.userId as string) || undefined;
    let role = (req.query.role as string) || undefined;

    if (!role && userId) {
      role = await getUserRoleByUserId(userId) || undefined;
    }
    role = role || 'user';

    if (role === 'sponsor') {
      if (!userId) return res.status(400).json({ error: 'userId required for sponsor metrics' });
      const [accepted, pending, unread] = await Promise.all([
        countConnectionsForSponsor(userId, 'accepted'),
        countConnectionsForSponsor(userId, 'pending'),
        countUnreadMessagesForUser(userId),
      ]);
      return res.status(200).json({
        role,
        connectionsAccepted: accepted,
        connectionsPending: pending,
        unreadMessages: unread,
      });
    }

    if (role === 'admin') {
      const [totalUsers, totalSponsors, msgs24h, sponsorsPending, unreadFromSponsors] = await Promise.all([
        countAllUsers(),
        countUsersByRole('sponsor'),
        countMessagesLast24h(),
        countSponsorsPendingApproval(),
        countUnreadMessagesFromSponsorsSystemwide(),
      ]);
      return res.status(200).json({
        role,
        totalUsers,
        totalSponsors,
        messagesLast24h: msgs24h,
        sponsorsPendingApproval: sponsorsPending,
        unreadMessagesFromSponsors: unreadFromSponsors,
      });
    }

    // default: end-user
    if (!userId) return res.status(400).json({ error: 'userId required for user metrics' });
    const [availableSponsors, unread, accepted, pending] = await Promise.all([
      countAvailableSponsors(),
      countUnreadMessagesForUser(userId),
      countConnectionsForUser(userId, 'accepted'),
      countConnectionsForUser(userId, 'pending'),
    ]);
    return res.status(200).json({
      role: 'user',
      availableSponsors,
      unreadMessages: unread,
      connectionsAccepted: accepted,
      connectionsPending: pending,
    });
  } catch (err) {
    console.error('dashboard metrics error', err);
    return res.status(500).json({ error: 'failed to load metrics' });
  }
};
