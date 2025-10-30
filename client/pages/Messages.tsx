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

interface ConversationMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
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
  otherUserRole: "sponsor" | "user";
  lastMessage: string;
  lastMessageTime: string;
  messages: ConversationMessage[];
  isRead: boolean;
}

export default function Messages() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"messages" | "browse">(
    user?.role === "sponsor" ? "messages" : "browse",
  );
  const [availableSponsors, setAvailableSponsors] = useState<SponsorProfile[]>(
    [],
  );

  if (!user) {
    navigate("/login");
    return null;
  }

  useEffect(() => {
    // Load conversations from localStorage
    const savedConversations = localStorage.getItem(`conversations_${user.id}`);
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }

    // Load available sponsors for regular users
    if (user.role === "user") {
      const allUsers = JSON.parse(localStorage.getItem("sobrUsers") || "[]");
      const sponsors = allUsers.filter((u: any) => u.role === "sponsor");
      setAvailableSponsors(sponsors);
    }
  }, [user.id]);

  const sendMessage = () => {
    if (!selectedConversation || !messageInput.trim()) return;

    const newMessage: ConversationMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderName: user.displayName,
      message: messageInput,
      timestamp: new Date().toISOString(),
    };

    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessage: messageInput,
      lastMessageTime: new Date().toLocaleTimeString(),
    };

    const updatedConversations = conversations.map((c) =>
      c.id === selectedConversation.id ? updatedConversation : c,
    );

    setConversations(updatedConversations);
    setSelectedConversation(updatedConversation);
    localStorage.setItem(
      `conversations_${user.id}`,
      JSON.stringify(updatedConversations),
    );
    setMessageInput("");
  };

  const startConversation = (sponsor: SponsorProfile) => {
    const existingConv = conversations.find(
      (c) => c.otherUserId === sponsor.id,
    );

    if (existingConv) {
      setSelectedConversation(existingConv);
      setActiveTab("messages");
      return;
    }

    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      otherUserId: sponsor.id,
      otherUserName: sponsor.displayName,
      otherUserRole: "sponsor",
      lastMessage: "",
      lastMessageTime: "",
      messages: [],
      isRead: true,
    };

    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    setSelectedConversation(newConversation);
    localStorage.setItem(
      `conversations_${user.id}`,
      JSON.stringify(updatedConversations),
    );
    setActiveTab("messages");
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUserName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/80 transition-colors"
                >
                  Logout
                </button>
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
                filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
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
              ) : (
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
                        <button
                          onClick={() => startConversation(sponsor)}
                          className="w-full px-3 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          Message This Sponsor
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border bg-card">
                  <h2 className="text-lg font-bold text-foreground">
                    {selectedConversation.otherUserName}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.otherUserRole === "sponsor"
                      ? "Sponsor"
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">
                    Select a conversation or browse sponsors
                  </p>
                  <p className="text-sm">to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
