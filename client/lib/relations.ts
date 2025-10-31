export interface RawUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  vetted?: boolean;
  qualifications?: string[];
  yearsOfExperience?: number;
}

export interface ConnectionRecord {
  userId: string; // seeker
  sponsorId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export interface ConversationMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserRole: "sponsor" | "user" | "admin";
  lastMessage: string;
  lastMessageTime: string;
  messages: ConversationMessage[];
  isRead: boolean;
}

// Users
export function getAllUsers(): RawUser[] {
  return JSON.parse(localStorage.getItem("sobrUsers") || "[]");
}

// Async (DB-backed) versions - attempt to use server API and fall back to localStorage
export async function getAllUsersAsync(): Promise<RawUser[]> {
  try {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('network');
    const users = await res.json();
    // cache locally for fallback
    localStorage.setItem('sobrUsers', JSON.stringify(users));
    localStorage.setItem('sobr_db_available', '1');
    return users as RawUser[];
  } catch (err) {
    localStorage.setItem('sobr_db_available', '0');
    return getAllUsers();
  }
}

export function saveAllUsers(users: RawUser[]) {
  localStorage.setItem("sobrUsers", JSON.stringify(users));
}

export function getUserById(id: string): RawUser | undefined {
  return getAllUsers().find((u) => u.id === id);
}

export function getPendingSponsors(): RawUser[] {
  return getAllUsers().filter((u) => u.role === "sponsor" && !u.vetted);
}

export async function getPendingSponsorsAsync(): Promise<RawUser[]> {
  const users = await getAllUsersAsync();
  return users.filter((u) => u.role === 'sponsor' && !u.vetted);
}

export function approveSponsor(id: string) {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return;
  users[idx].vetted = true;
  saveAllUsers(users);
}

export async function approveSponsorAsync(id: string) {
  try {
    const res = await fetch(`/api/sponsors/${id}/approve`, { method: 'POST' });
    if (!res.ok) throw new Error('approve failed');
    // refresh cache
    await getAllUsersAsync();
  } catch (err) {
    // fallback to local change
    approveSponsor(id);
  }
}

export function declineSponsor(id: string) {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return;
  // downgrade to regular user to remove sponsor privileges
  users[idx].role = "user";
  users[idx].vetted = false;
  saveAllUsers(users);
}

export async function declineSponsorAsync(id: string) {
  try {
    const res = await fetch(`/api/sponsors/${id}/decline`, { method: 'POST' });
    if (!res.ok) throw new Error('decline failed');
    await getAllUsersAsync();
  } catch (err) {
    declineSponsor(id);
  }
}

export function bulkApproveSponsors(ids: string[]) {
  const users = getAllUsers();
  ids.forEach((id) => {
    const idx = users.findIndex((u) => u.id === id);
    if (idx !== -1) users[idx].vetted = true;
  });
  saveAllUsers(users);
}

export async function bulkApproveSponsorsAsync(ids: string[]) {
  try {
    const res = await fetch('/api/sponsors/bulk_approve', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ids }) });
    if (!res.ok) throw new Error('bulk approve failed');
    await getAllUsersAsync();
  } catch (err) {
    bulkApproveSponsors(ids);
  }
}

export function searchPendingSponsors(query: string): RawUser[] {
  const q = query.trim().toLowerCase();
  if (!q) return getPendingSponsors();
  return getPendingSponsors().filter(
    (u) => u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
  );
}

// Connections
export function getConnections(): ConnectionRecord[] {
  return JSON.parse(localStorage.getItem("sobrConnections") || "[]");
}

export async function getConnectionsAsync(): Promise<ConnectionRecord[]> {
  // No dedicated connections list endpoint exists; we will read via users or fallback
  try {
    // Try to derive connections from server via incoming requests per sponsor
    // For now return local cache
    return getConnections();
  } catch (err) {
    return getConnections();
  }
}

export function saveConnections(conns: ConnectionRecord[]) {
  localStorage.setItem("sobrConnections", JSON.stringify(conns));
}

export function getConnection(userId: string, sponsorId: string): ConnectionRecord | undefined {
  return getConnections().find((c) => c.userId === userId && c.sponsorId === sponsorId);
}

export async function getConnectionAsync(userId: string, sponsorId: string): Promise<ConnectionRecord | undefined> {
  const conns = await getConnectionsAsync();
  return conns.find((c) => c.userId === userId && c.sponsorId === sponsorId);
}

export function addConnectionRequest(userId: string, sponsorId: string) {
  const conns = getConnections();
  const exists = conns.find((c) => c.userId === userId && c.sponsorId === sponsorId);
  if (exists) return;
  conns.push({ userId, sponsorId, status: "pending", createdAt: new Date().toISOString() });
  saveConnections(conns);
  // create a lightweight conversation entry for requester so they can see status
  ensureConversationForUser(userId, sponsorId, "sponsor");
}

export async function addConnectionRequestAsync(userId: string, sponsorId: string) {
  try {
    const res = await fetch('/api/connections', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId, sponsorId }) });
    if (!res.ok) throw new Error('add connection failed');
    localStorage.setItem('sobr_db_available', '1');
    // ensure conversation locally
    ensureConversationForUser(userId, sponsorId, 'sponsor');
  } catch (err) {
    localStorage.setItem('sobr_db_available', '0');
    addConnectionRequest(userId, sponsorId);
  }
}

export function acceptConnection(userId: string, sponsorId: string) {
  const conns = getConnections();
  const idx = conns.findIndex((c) => c.userId === userId && c.sponsorId === sponsorId);
  if (idx === -1) return;
  conns[idx].status = "accepted";
  saveConnections(conns);
  // ensure both parties have a conversation entry
  ensureConversationForUser(userId, sponsorId, "sponsor");
  ensureConversationForUser(sponsorId, userId, "user");
}

export async function acceptConnectionAsync(userId: string, sponsorId: string) {
  try {
    const res = await fetch('/api/connections/accept', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId, sponsorId }) });
    if (!res.ok) throw new Error('accept failed');
    // local update
    localStorage.setItem('sobr_db_available', '1');
    acceptConnection(userId, sponsorId);
  } catch (err) {
    localStorage.setItem('sobr_db_available', '0');
    acceptConnection(userId, sponsorId);
  }
}

export function declineConnection(userId: string, sponsorId: string) {
  let conns = getConnections();
  conns = conns.filter((c) => !(c.userId === userId && c.sponsorId === sponsorId));
  saveConnections(conns);
}

export async function declineConnectionAsync(userId: string, sponsorId: string) {
  try {
    const res = await fetch('/api/connections/decline', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId, sponsorId }) });
    if (!res.ok) throw new Error('decline failed');
    localStorage.setItem('sobr_db_available', '1');
    declineConnection(userId, sponsorId);
  } catch (err) {
    localStorage.setItem('sobr_db_available', '0');
    declineConnection(userId, sponsorId);
  }
}

export function getIncomingRequestsForSponsor(sponsorId: string): ConnectionRecord[] {
  return getConnections().filter((c) => c.sponsorId === sponsorId && c.status === "pending");
}

export async function getIncomingRequestsForSponsorAsync(sponsorId: string): Promise<ConnectionRecord[]> {
  try {
    const res = await fetch(`/api/connections/sponsor/${sponsorId}/incoming`);
    if (!res.ok) throw new Error('fetch incoming failed');
    const rows = await res.json();
    localStorage.setItem('sobr_db_available', '1');
    // normalize
    return (rows || []).map((r: any) => ({ userId: r.user_id, sponsorId: r.sponsor_id, status: r.status, createdAt: r.created_at }));
  } catch (err) {
    localStorage.setItem('sobr_db_available', '0');
    return getIncomingRequestsForSponsor(sponsorId);
  }
}

// Conversations
export function getConversationsForUser(userId: string): Conversation[] {
  return JSON.parse(localStorage.getItem(`conversations_${userId}`) || "[]");
}

export async function getConversationsForUserAsync(userId: string): Promise<Conversation[]> {
  try {
    const res = await fetch(`/api/messages/user/${userId}`);
    if (!res.ok) throw new Error('fetch messages failed');
    const msgs = await res.json();
    // build conversations grouped by other user
    const byOther: Record<string, Conversation> = {};
    for (const m of msgs) {
      const otherId = m.from_user_id === userId ? m.to_user_id : m.from_user_id;
      const senderName = m.from_user_id === userId ? 'You' : m.from_user_name || m.from_user_id;
      if (!byOther[otherId]) {
        byOther[otherId] = {
          id: `conv_${otherId}`,
          otherUserId: otherId,
          otherUserName: m.from_user_id === userId ? (m.to_user_name || otherId) : (m.from_user_name || otherId),
          otherUserRole: 'sponsor',
          lastMessage: m.body,
          lastMessageTime: new Date(m.sent_at).toLocaleTimeString(),
          messages: [],
          isRead: true,
        };
      }
      byOther[otherId].messages.push({ id: m.id, senderId: m.from_user_id, senderName: m.from_user_name || 'Unknown', message: m.body, timestamp: m.sent_at });
      byOther[otherId].lastMessage = m.body;
      byOther[otherId].lastMessageTime = new Date(m.sent_at).toLocaleTimeString();
    }
    const convs = Object.values(byOther);
    // cache locally
    localStorage.setItem(`conversations_${userId}`, JSON.stringify(convs));
    localStorage.setItem('sobr_db_available', '1');
    return convs;
  } catch (err) {
    localStorage.setItem('sobr_db_available', '0');
    return getConversationsForUser(userId);
  }
}

export function saveConversationsForUser(userId: string, convs: Conversation[]) {
  localStorage.setItem(`conversations_${userId}`, JSON.stringify(convs));
}

export async function saveConversationsForUserAsync(userId: string, convs: Conversation[]) {
  // we persist locally; server persistence is via messages endpoint
  saveConversationsForUser(userId, convs);
}

export function ensureConversationForUser(userId: string, otherId: string, otherRole: "sponsor" | "user" | "admin") {
  const convs = getConversationsForUser(userId);
  const existing = convs.find((c) => c.otherUserId === otherId);
  if (existing) return;
  const newConv: Conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    otherUserId: otherId,
    otherUserName: getUserById(otherId)?.displayName || "Unknown",
    otherUserRole: otherRole,
    lastMessage: "",
    lastMessageTime: "",
    messages: [],
    isRead: false,
  };
  convs.push(newConv);
  saveConversationsForUser(userId, convs);
}

export function addMessageBetween(senderId: string, receiverId: string, message: string) {
  const sender = getUserById(senderId);
  if (!sender) return;
  const msg = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    senderId,
    senderName: sender.displayName,
    message,
    timestamp: new Date().toISOString(),
  };

  // update sender conversations
  const senderConvs = getConversationsForUser(senderId);
  const senderConvIdx = senderConvs.findIndex((c) => c.otherUserId === receiverId);
  if (senderConvIdx !== -1) {
    senderConvs[senderConvIdx].messages.push(msg);
    senderConvs[senderConvIdx].lastMessage = message;
    senderConvs[senderConvIdx].lastMessageTime = new Date().toLocaleTimeString();
    saveConversationsForUser(senderId, senderConvs);
  }

  // update receiver conversations
  const receiverConvs = getConversationsForUser(receiverId);
  const receiverConvIdx = receiverConvs.findIndex((c) => c.otherUserId === senderId);
  if (receiverConvIdx !== -1) {
    receiverConvs[receiverConvIdx].messages.push(msg);
    receiverConvs[receiverConvIdx].lastMessage = message;
    receiverConvs[receiverConvIdx].lastMessageTime = new Date().toLocaleTimeString();
    saveConversationsForUser(receiverId, receiverConvs);
  }
}

export async function addMessageBetweenAsync(senderId: string, receiverId: string, message: string) {
  try {
    const res = await fetch('/api/messages', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fromUserId: senderId, toUserId: receiverId, body: message }) });
    if (!res.ok) throw new Error('post message failed');
    localStorage.setItem('sobr_db_available', '1');
    // refresh conversations cache
    await getConversationsForUserAsync(senderId);
    await getConversationsForUserAsync(receiverId);
  } catch (err) {
    localStorage.setItem('sobr_db_available', '0');
    addMessageBetween(senderId, receiverId, message);
  }
}

export function connectionIsAccepted(userId: string, sponsorId: string): boolean {
  const conn = getConnection(userId, sponsorId);
  return !!conn && conn.status === "accepted";
}

export async function connectionIsAcceptedAsync(userId: string, sponsorId: string): Promise<boolean> {
  const conn = await getConnectionAsync(userId, sponsorId);
  return !!conn && conn.status === 'accepted';
}
