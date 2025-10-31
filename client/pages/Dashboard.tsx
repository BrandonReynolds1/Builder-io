import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { MessageSquare, UserCircle, Users, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface DashboardStats {
  unreadMessages: number;
  pendingConnections: number;
  activeConnections: number;
  recentActivity: { type: string; description: string; timestamp: string }[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    unreadMessages: 0,
    pendingConnections: 0,
    activeConnections: 0,
    recentActivity: [],
  });

  if (!user) {
    navigate("/login");
    return null;
  }

  useEffect(() => {
    // TODO: Fetch actual stats from API
    // For now, using placeholder data
    setStats({
      unreadMessages: 3,
      pendingConnections: 1,
      activeConnections: 5,
      recentActivity: [
        { type: "message", description: "New message from Sarah", timestamp: "2 hours ago" },
        { type: "connection", description: "Connection request approved", timestamp: "5 hours ago" },
        { type: "message", description: "New message from John", timestamp: "1 day ago" },
      ],
    });
  }, [user.id]);

  const quickActions = [
    {
      title: "Messages",
      description: `${stats.unreadMessages} unread`,
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      action: () => navigate("/messages"),
    },
    {
      title: "Profile",
      description: "Edit your information",
      icon: UserCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      action: () => navigate("/profile"),
    },
    {
      title: user.role === "sponsor" ? "View Seekers" : "Find Sponsors",
      description: user.role === "sponsor" ? "Connect with seekers" : "Browse available sponsors",
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      action: () => navigate("/messages"),
    },
  ];

  return (
    <Layout showHeader={true}>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">
              Welcome back, {user.displayName || user.email}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here's what's happening with your account
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-medium text-foreground mb-1">Account Status</h2>
                <div className="flex items-center gap-4 text-sm mt-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.role === "sponsor" && !user.vetted ? "bg-yellow-500" : "bg-green-500"}`} />
                    <span className="text-muted-foreground capitalize">Role: {user.role}</span>
                  </div>
                  {user.role === "sponsor" && (
                    <div className="flex items-center gap-2">
                      {user.vetted ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 font-medium">Vetted</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          <span className="text-yellow-600 font-medium">Pending Vetting</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {user.role === "sponsor" && !user.vetted && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                <p className="text-sm text-yellow-700 dark:text-yellow-600">
                  Your sponsor application is pending admin approval. You'll be notified once your account is vetted.
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unread Messages</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">{stats.unreadMessages}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">{stats.pendingConnections}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Connections</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">{stats.activeConnections}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.action}
                  className="bg-card rounded-lg border border-border p-6 hover:border-primary/50 transition-all text-left group"
                >
                  <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-medium text-foreground mb-4">Recent Activity</h2>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                    <div className={`w-8 h-8 rounded-full ${activity.type === "message" ? "bg-blue-500/10" : "bg-green-500/10"} flex items-center justify-center flex-shrink-0`}>
                      {activity.type === "message" ? (
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Users className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity to display
              </p>
            )}
          </div>

          {/* Admin Widget */}
          {user.role === "admin" && (
            <div className="mt-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-6">
              <h2 className="text-lg font-medium text-foreground mb-3">Admin Panel</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Manage sponsor applications and user moderation
              </p>
              <button
                onClick={() => navigate("/admin")}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Go to Admin Panel
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
