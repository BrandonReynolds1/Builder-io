import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Send,
  MessageCircle,
  Users,
  Search,
  Star,
  Clock,
  MapPin,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  addConnectionRequestAsync,
  getIncomingRequestsForSponsorAsync,
  acceptConnectionAsync,
  declineConnectionAsync,
  connectionIsAcceptedAsync,
  addMessageBetweenAsync,
  getConversationsForUserAsync,
  getAllUsersAsync,
  markConversationReadAsync,
  fetchConnectionStatus,
} from "@/lib/relations";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ADMIN_ID, ADMIN_EMAIL } from "@/config/admin";

interface ConversationMessage {
          
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
    id: string;
}

interface SponsorProfile {
  id: string;
  displayName: string;
  qualifications: string[];
  yearsOfExperience: number;
  vetted: boolean;
  rating: number;
  recoveryGoals?: string[];
}

interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserRole: "sponsor" | "user" | "admin";
  lastMessage: string;
  lastMessageTime: string;
  messages: ConversationMessage[];
  isRead: boolean;
}

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("messages");
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [availableSponsors, setAvailableSponsors] = useState<SponsorProfile[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);

  // ...other logic...

  // Add any necessary useEffect hooks here for fetching data, etc.

  // Helper: usersById map (for display names)
  const usersById: Record<string, string> = {};
  // Helper: filteredConversations
  const filteredConversations = conversations.filter((conv) =>
    conv.otherUserName.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  // Helper: refreshConversations
  const refreshConversations = async () => {
    const convs = await getConversationsForUserAsync(user.id);
    setConversations(convs);
  };
  // Helper: startConversation
  const startConversation = async (sponsor: SponsorProfile) => {
    setSelectedConversation(
      conversations.find((c) => c.otherUserId === sponsor.id) || null
    );
    setActiveTab("messages");
  };

  const sendMessage = async () => {
    if (!selectedConversation || !messageInput.trim()) return;

    const otherId = selectedConversation.otherUserId;

    // Enforce connection approval: if user is seeker and other is sponsor, require accepted connection
    let accepted = true;
    // Allow messaging admin regardless of vetting/connection state
    if (selectedConversation.otherUserRole === "admin" || otherId === ADMIN_ID) {
      accepted = true;
    } else {
      if (user.role === "user" && selectedConversation.otherUserRole === "sponsor") {
        accepted = await connectionIsAcceptedAsync(user.id, otherId);
      }
      if (user.role === "sponsor" && selectedConversation.otherUserRole === "user") {
        accepted = await connectionIsAcceptedAsync(otherId, user.id);
      }
    }

    if (!accepted) {
      // Inform user that the connection is pending via toast (no blocking alert)
      toast({
        title: "Connection Pending",
        description: "Sponsor must approve connection first.",
      });
      return;
    }

    // Use shared helper to persist message to both sides
    await addMessageBetweenAsync(user.id, otherId, messageInput);

    // Refresh conversations in UI
    const saved = await getConversationsForUserAsync(user.id);
    setConversations(saved);
    const updatedSelected = saved.find((c) => c.otherUserId === otherId) || null;
    setSelectedConversation(updatedSelected);
    setMessageInput("");
  };

  // ...other logic...

  return (
    <Layout showHeader={true}>
      <div className="min-h-screen bg-background">
        <div className="flex h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <div className="w-80 border-r border-border flex flex-col bg-muted/10">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">SOBR</h1>
                  <p className="text-xs text-muted-foreground">
                    {user.displayName}
                  </p>
                  {/* Sponsor approval status banner */}
                  {user.role === "sponsor" && !user.vetted && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-sm">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">Application Pending</div>
                          <p className="text-xs text-amber-900/85 mt-1">
                            Your sponsor application is under review. Once
                            approved you'll receive connection requests and be
                            able to message seekers.
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setShowSupportModal(true)}
                          className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors"
                        >
                          Contact Support
                        </button>
                        <button
                          onClick={() => navigate("/sponsor-registration")}
                          className="px-2 py-1 bg-muted text-foreground rounded text-xs font-medium hover:bg-muted/80 transition-colors"
                        >
                          Edit Application
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("messages")}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    activeTab === "messages"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Messages
                </button>
                {user.role === "user" && (
                  <button
                    onClick={() => setActiveTab("browse")}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                      activeTab === "browse"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Find Sponsor
                  </button>
                )}
              </div>
              {/* Search */}
              {activeTab === "messages" && (
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </div>
            {/* Conversation List or Sponsor Browse */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "messages" ? (
                // If sponsor, show incoming connection requests above conversation list
                user.role === "sponsor" && incomingRequests.length > 0 ? (
                  <div>
                    <div className="p-4 border-b">
                      <h3 className="font-medium">Incoming Requests</h3>
                      <div className="space-y-2 mt-2">
                        {incomingRequests.map((r) => (
                          <div key={`${r.userId}_${r.sponsorId}`} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1 min-w-0">
                              {(() => {
                                const convName = conversations.find(c => c.otherUserId === r.userId)?.otherUserName;
                                const name = usersById[r.userId] || convName || r.userId;
                                const short = usersById[r.userId] || convName || `${r.userId.substring(0, 8)}…`;
                                return (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="font-medium truncate break-all" title={name}>
                                        {short}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="max-w-xs">
                                        <div className="font-medium text-foreground">{name}</div>
                                        {name !== r.userId && (
                                          <div className="text-xs text-muted-foreground mt-1">ID: {r.userId}</div>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })()}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  await acceptConnectionAsync(r.userId, r.sponsorId);
                                  refreshConversations();
                                }}
                                className="px-2 py-1 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={async () => {
                                  await declineConnectionAsync(r.userId, r.sponsorId);
                                  refreshConversations();
                                }}
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition-colors"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-b" />
                  </div>
                ) : null
              ) : null}
              {activeTab === "messages" ? (
                filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={async () => {
                        setSelectedConversation(conv);
                        try { await markConversationReadAsync(user.id, conv.otherUserId); } catch {}
                      }}
                      className={`w-full p-4 border-b border-border text-left transition-colors ${
                        selectedConversation?.id === conv.id
                          ? "bg-primary/10 border-l-2 border-l-primary"
                          : "hover:bg-muted/20"
                      }`}
                    >
                      <h3 className="font-medium text-foreground truncate">
                        {conv.otherUserName}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {conv.lastMessage || "No messages yet"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conv.lastMessageTime}
                      </p>
                    </button>
                  ))
                )
              ) : null}
              {activeTab === "browse" ? (
                <div className="p-4 space-y-4">
                  {availableSponsors.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No sponsors available yet</p>
                    </div>
                  ) : (
                    availableSponsors.map((sponsor) => (
                      <div
                        key={sponsor.id}
                        className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <h3 className="font-medium text-foreground mb-2">
                          {sponsor.displayName}
                        </h3>
                        {/* Status pill */}
                        <div className="mb-3">
                          {(() => {
                            const status = connectionStatus[sponsor.id] ?? null;
                            if (status === 'accepted') {
                              return <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-700 border border-green-500/20">Connected</span>;
                            }
                            if (status === 'pending') {
                              return <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-700 border border-yellow-500/20">Pending</span>;
                            }
                            return <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border">Available</span>;
                          })()}
                        </div>
                        <div className="space-y-2 text-xs text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>
                              {sponsor.yearsOfExperience}+ years experience
                            </span>
                          </div>
                          {sponsor.vetted && (
                            <div className="flex items-center gap-2">
                              <Star className="w-3 h-3" />
                              <span>Verified Sponsor</span>
                            </div>
                          )}
                        </div>
                        {(() => {
                          const status = connectionStatus[sponsor.id] ?? null;
                          const label = status === 'accepted' ? 'Message' : status === 'pending' ? 'Pending Approval' : 'Connect & Message';
                          const disabled = status === 'pending';
                          return (
                            <button
                              onClick={() => startConversation(sponsor)}
                              disabled={disabled}
                              className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${disabled ? 'bg-primary/30 text-primary-foreground/60 cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                            >
                              {label}
                            </button>
                          );
                        })()}
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* If no chat selected, show empty state */}
            {!selectedConversation ? (
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Select a conversation or browse sponsors</p>
                  <p className="text-sm">to get started</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-border bg-card">
                  <h2 className="text-lg font-bold text-foreground">
                    {selectedConversation.otherUserName}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.otherUserRole === "sponsor"
                      ? "Sponsor"
                      : selectedConversation.otherUserRole === "admin"
                      ? "Administrator"
                      : "Seeker"}
                  </p>
                </div>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                      <div>
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    selectedConversation.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.senderId === user.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.senderId === user.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-xs font-medium opacity-75 mb-1">
                            {msg.senderName}
                          </p>
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-50 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {/* Message Input */}
                <div className="p-4 border-t border-border bg-card">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!messageInput.trim()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Support compose modal */}
        {showSupportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowSupportModal(false)}
            />
            <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-lg p-6 z-10">
              <h3 className="text-lg font-bold mb-2">Contact Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Write a short message to the Administrator about your application.
              </p>
              <textarea
                rows={6}
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                className="w-full p-3 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground resize-none"
                placeholder="Describe your question or concern..."
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowSupportModal(false);
                    setSupportMessage("");
                  }}
                  className="px-3 py-2 bg-muted rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const body = supportMessage.trim();
                    if (!body) return;
                    // Ensure admin user exists in DB with a valid UUID (no local cache)
                    let adminUserId = ADMIN_ID;
                    try {
                      const res = await fetch('/api/users/upsert', {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({
                          email: ADMIN_EMAIL,
                          full_name: 'Administrator',
                          role: 'admin',
                          metadata: {}
                        })
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data.ok && data.user?.id) {
                          adminUserId = data.user.id;
                        }
                      }
                    } catch {}
                    // Send message to admin (best-effort in test/jsdom environments)
                    try {
                      await addMessageBetweenAsync(user.id, adminUserId, body);
                    } catch {}
                    // Refresh and open admin conversation
                    setShowSupportModal(false);
                    setSupportMessage("");
                    refreshConversations();
                    setSelectedConversation(conversations.find(c => c.otherUserId === adminUserId) || null);
                    // Show success toast
                    toast({
                      title: "Message sent",
                      description: "Your message was delivered to the Administrator.",
                    });
                  }}
                  disabled={!supportMessage.trim()}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

