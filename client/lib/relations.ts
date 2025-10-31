export interface RawUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  vetted?: boolean;
  qualifications?: string[];
  yearsOfExperience?: number;
  sponsorMotivation?: string;
  metadata?: any;
}

const isBrowser = typeof window !== 'undefined';
const originBase = (globalThis as any).location?.origin || '';

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
// DB-only: Fetch all users from the server

// Async (DB-backed) versions - attempt to use server API and fall back to localStorage
export async function getAllUsersAsync(): Promise<RawUser[]> {
  const res = await fetch(`${originBase}/api/users`);
  if (!res.ok) throw new Error('Failed to load users');
  const users = await res.json();
  const normalized: RawUser[] = (users || []).map((u: any) => ({
    id: u.id,
    email: u.email,
    displayName: u.displayName || u.full_name || u.email,
    role: u.role || 'user',
    vetted: u.vetted,
    qualifications: u.qualifications,
    yearsOfExperience: u.yearsOfExperience,
    sponsorMotivation: u.sponsorMotivation ?? (u.metadata && u.metadata.sponsorMotivation) ?? '',
    metadata: u.metadata,
  }));
  return normalized;
}

// DB-only helpers no longer cache locally

export async function getUserByIdAsync(id: string): Promise<RawUser | undefined> {
  const users = await getAllUsersAsync();
  return users.find((u) => u.id === id);
}

export async function getPendingSponsorsAsync(): Promise<RawUser[]> {
  const users = await getAllUsersAsync();
  return users.filter((u) => u.role === 'sponsor' && !u.vetted);
}

export async function approveSponsorAsync(id: string) {
  const res = await fetch(`${originBase}/api/sponsors/${id}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error('approve failed');
}

export async function declineSponsorAsync(id: string) {
  const res = await fetch(`${originBase}/api/sponsors/${id}/decline`, { method: 'POST' });
  if (!res.ok) throw new Error('decline failed');
}

export async function bulkApproveSponsorsAsync(ids: string[]) {
  const res = await fetch(`${originBase}/api/sponsors/bulk_approve`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ids }) });
  if (!res.ok) throw new Error('bulk approve failed');
}

export async function searchPendingSponsors(query: string): Promise<RawUser[]> {
  const q = query.trim().toLowerCase();
  const base = await getPendingSponsorsAsync();
  if (!q) return base;
  return base.filter(
    (u) => u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
  );
}

// Connections
// Connections are DB-only now

export async function fetchConnectionStatus(userId: string, sponsorId: string): Promise<"pending" | "accepted" | "declined" | null> {
  const url = `${originBase}/api/connections/status?userId=${encodeURIComponent(userId)}&sponsorId=${encodeURIComponent(sponsorId)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return (data && data.status) || null;
}

export async function addConnectionRequestAsync(userId: string, sponsorId: string) {
  const res = await fetch(`${originBase}/api/connections`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId, sponsorId }) });
  if (!res.ok) throw new Error('add connection failed');
}

export async function acceptConnectionAsync(userId: string, sponsorId: string) {
  const res = await fetch(`${originBase}/api/connections/accept`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId, sponsorId }) });
  if (!res.ok) throw new Error('accept failed');
}

export async function declineConnectionAsync(userId: string, sponsorId: string) {
  const res = await fetch(`${originBase}/api/connections/decline`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId, sponsorId }) });
  if (!res.ok) throw new Error('decline failed');
}

export async function getIncomingRequestsForSponsorAsync(sponsorId: string): Promise<ConnectionRecord[]> {
  const res = await fetch(`${originBase}/api/connections/sponsor/${sponsorId}/incoming`);
  if (!res.ok) throw new Error('fetch incoming failed');
  const rows = await res.json();
  return (rows || []).map((r: any) => ({ userId: r.user_id, sponsorId: r.sponsor_id, status: r.status, createdAt: r.created_at }));
}

// Conversations
export async function getConversationsForUserAsync(userId: string): Promise<Conversation[]> {
  const res = await fetch(`${originBase}/api/messages/user/${userId}`);
  if (!res.ok) throw new Error('fetch messages failed');
  const msgs = await res.json();
  // build conversations grouped by other user
  const byOther: Record<string, Conversation> = {};
  for (const m of msgs) {
    const otherId = m.from_user_id === userId ? m.to_user_id : m.from_user_id;
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
  return convs;
}

// No local conversation caching in DB-only mode

export async function addMessageBetweenAsync(senderId: string, receiverId: string, message: string) {
  const res = await fetch(`${originBase}/api/messages`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fromUserId: senderId, toUserId: receiverId, body: message }) });
  if (!res.ok) throw new Error('post message failed');
}

export async function connectionIsAcceptedAsync(userId: string, sponsorId: string): Promise<boolean> {
  const status = await fetchConnectionStatus(userId, sponsorId);
  return status === 'accepted';
}

export async function markConversationReadAsync(userId: string, otherUserId: string): Promise<void> {
  try {
    const res = await fetch(`${originBase}/api/messages/mark-read`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId, otherUserId })
    });
    if (!res.ok) throw new Error('mark read failed');
  } catch {}
}
