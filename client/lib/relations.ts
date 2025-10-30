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
  otherUserRole: "sponsor" | "user";
  lastMessage: string;
  lastMessageTime: string;
  messages: ConversationMessage[];
  isRead: boolean;
}

// Users
export function getAllUsers(): RawUser[] {
  return JSON.parse(localStorage.getItem("sobrUsers") || "[]");
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

export function approveSponsor(id: string) {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return;
  users[idx].vetted = true;
  saveAllUsers(users);
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

export function bulkApproveSponsors(ids: string[]) {
  const users = getAllUsers();
  ids.forEach((id) => {
    const idx = users.findIndex((u) => u.id === id);
    if (idx !== -1) users[idx].vetted = true;
  });
  saveAllUsers(users);
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

export function saveConnections(conns: ConnectionRecord[]) {
  localStorage.setItem("sobrConnections", JSON.stringify(conns));
}

export function getConnection(userId: string, sponsorId: string): ConnectionRecord | undefined {
  return getConnections().find((c) => c.userId === userId && c.sponsorId === sponsorId);
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

export function declineConnection(userId: string, sponsorId: string) {
  let conns = getConnections();
  conns = conns.filter((c) => !(c.userId === userId && c.sponsorId === sponsorId));
  saveConnections(conns);
}

export function getIncomingRequestsForSponsor(sponsorId: string): ConnectionRecord[] {
  return getConnections().filter((c) => c.sponsorId === sponsorId && c.status === "pending");
}

// Conversations
export function getConversationsForUser(userId: string): Conversation[] {
  return JSON.parse(localStorage.getItem(`conversations_${userId}`) || "[]");
}

export function saveConversationsForUser(userId: string, convs: Conversation[]) {
  localStorage.setItem(`conversations_${userId}`, JSON.stringify(convs));
}

export function ensureConversationForUser(userId: string, otherId: string, otherRole: "sponsor" | "user") {
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

export function connectionIsAccepted(userId: string, sponsorId: string): boolean {
  const conn = getConnection(userId, sponsorId);
  return !!conn && conn.status === "accepted";
}
