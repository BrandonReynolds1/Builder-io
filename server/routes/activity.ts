import { RequestHandler } from "express";
import { getSupabaseClient, getUserRoleByUserId } from "../lib/supabase";

export const handleGetRecentActivity: RequestHandler = async (req, res) => {
  try {
    const userId = (req.query.userId as string) || undefined;
    let role = (req.query.role as string) || undefined;
    if (!role && userId) role = (await getUserRoleByUserId(userId)) || undefined;
    role = role || "user";

    const sb = getSupabaseClient();

    // We'll fetch relevant audit logs by role in one or two queries, collect userIds, map to names, then build items.
    type LogRow = { created_at: string; actor_user_id: string | null; action: string; metadata: any };
    let logs: LogRow[] = [];

    if (role === "sponsor") {
      if (!userId) return res.status(400).json({ error: "userId required" });
      const { data } = await sb
        .from("audit_logs")
        .select("created_at, actor_user_id, action, metadata")
        .in("action", ["connection.requested", "message.sent", "connection.accepted", "connection.declined", "messages.read"])
        .order("created_at", { ascending: false })
        .limit(50);
      logs = (data as any) || [];
      // Filter to only those targeting this sponsor
      logs = logs.filter((l) => {
        if (l.action === "connection.requested") return l.metadata?.sponsorId === userId;
        if (l.action === "message.sent") return l.metadata?.to_user_id === userId;
        if (l.action === "messages.read") return l.metadata?.fromUserId === userId; // your messages were read
        if (l.action === "connection.accepted" || l.action === "connection.declined") return l.metadata?.sponsorId === userId;
        return false;
      });
    } else if (role === "admin") {
      const { data } = await sb
        .from("audit_logs")
        .select("created_at, actor_user_id, action, metadata")
        .in("action", [
          "message.sent",
          "connection.requested",
          "connection.accepted",
          "connection.declined",
          "sponsor.approved",
          "sponsor.declined",
          "user.registered",
          "profile.updated",
          "password.changed",
        ])
        .order("created_at", { ascending: false })
        .limit(50);
      logs = (data as any) || [];
    } else {
      if (!userId) return res.status(400).json({ error: "userId required" });
      const { data } = await sb
        .from("audit_logs")
        .select("created_at, actor_user_id, action, metadata")
        .in("action", ["message.sent", "connection.accepted", "connection.declined", "messages.read", "connection.requested"])
        .order("created_at", { ascending: false })
        .limit(50);
      logs = (data as any) || [];
      // Filter to those relevant to this user
      logs = logs.filter((l) => {
        if (l.action === "message.sent") return l.metadata?.to_user_id === userId;
        if (l.action === "messages.read") return l.metadata?.userId === userId; // you read messages
        if (l.action === "connection.accepted" || l.action === "connection.declined") return l.metadata?.userId === userId;
        if (l.action === "connection.requested") return l.metadata?.userId === userId;
        return false;
      });
    }

    // Collect userIds to resolve names
    const userIds = new Set<string>();
    logs.forEach((l) => {
      if (l.actor_user_id) userIds.add(l.actor_user_id);
      const m = l.metadata || {};
      [m.userId, m.sponsorId, m.to_user_id, m.fromUserId].forEach((id: string | undefined) => {
        if (id) userIds.add(id);
      });
    });

    const nameMap = new Map<string, string>();
    if (userIds.size > 0) {
      const { data: users } = await sb
        .from("users")
        .select("id, full_name, email")
        .in("id", Array.from(userIds));
      (users || []).forEach((u: any) => {
        nameMap.set(u.id, u.full_name || u.email || u.id);
      });
    }

    const items: { type: string; description: string; timestamp: string }[] = [];
    for (const l of logs) {
      const actor = l.actor_user_id ? nameMap.get(l.actor_user_id) || l.actor_user_id : "System";
      const m = l.metadata || {};
      const userName = m.userId ? nameMap.get(m.userId) || m.userId : undefined;
      const sponsorName = m.sponsorId ? nameMap.get(m.sponsorId) || m.sponsorId : undefined;
      const toName = m.to_user_id ? nameMap.get(m.to_user_id) || m.to_user_id : undefined;
      const fromName = m.fromUserId ? nameMap.get(m.fromUserId) || m.fromUserId : undefined;

      switch (l.action) {
        case "message.sent":
          items.push({ type: "message", description: `Message from ${actor} to ${toName ?? "user"}`, timestamp: l.created_at });
          break;
        case "messages.read":
          // Actor read messages from fromUserId
          items.push({ type: "message", description: `${actor} read messages from ${fromName ?? "user"}`, timestamp: l.created_at });
          break;
        case "connection.requested":
          items.push({ type: "connection", description: `${actor} requested connection with ${sponsorName ?? "sponsor"}`, timestamp: l.created_at });
          break;
        case "connection.accepted":
          items.push({ type: "connection", description: `${sponsorName ?? actor} accepted connection with ${userName ?? "user"}`, timestamp: l.created_at });
          break;
        case "connection.declined":
          items.push({ type: "connection", description: `${sponsorName ?? actor} declined connection with ${userName ?? "user"}`, timestamp: l.created_at });
          break;
        case "sponsor.approved":
          items.push({ type: "connection", description: `Sponsor approved: ${sponsorName ?? "sponsor"}`, timestamp: l.created_at });
          break;
        case "sponsor.declined":
          items.push({ type: "connection", description: `Sponsor declined: ${sponsorName ?? "sponsor"}`, timestamp: l.created_at });
          break;
        case "user.registered":
          items.push({ type: "connection", description: `New user registered: ${userName ?? actor}`, timestamp: l.created_at });
          break;
        case "profile.updated":
          items.push({ type: "connection", description: `Profile updated: ${userName ?? actor}`, timestamp: l.created_at });
          break;
        case "password.changed":
          items.push({ type: "connection", description: `Password changed for ${userName ?? actor}`, timestamp: l.created_at });
          break;
        default:
          // Ignore unknowns
          break;
      }
    }

    // Sort and cap
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return res.status(200).json(items.slice(0, 10));
  } catch (err) {
    console.error("recent activity error", err);
    return res.status(500).json({ error: "failed to fetch activity" });
  }
};
