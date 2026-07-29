import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminChatSidebar from "@/components/admin/AdminChatSidebar";
import AdminChatThread from "@/components/admin/AdminChatThread";

interface Session {
  session_id: string;
  visitor_name: string;
  visitor_email: string | null;
  last_message: string;
  last_at: string;
  unread: number;
}

interface ChatMessage {
  id: string;
  message: string;
  sender_type: string;
  created_at: string;
  visitor_name: string;
}

const AdminChat = () => {
  const { user, isAdmin, loading } = useAdminAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const loadSessions = useCallback(async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("session_id, visitor_name, visitor_email, message, created_at, sender_type, is_read")
      .order("created_at", { ascending: false });

    if (!data) return;

    const sessionMap = new Map<string, Session>();
    for (const row of data) {
      const existing = sessionMap.get(row.session_id);
      if (!existing) {
        sessionMap.set(row.session_id, {
          session_id: row.session_id,
          visitor_name: row.visitor_name,
          visitor_email: row.visitor_email,
          last_message: row.message,
          last_at: row.created_at,
          unread: row.sender_type === "visitor" && !row.is_read ? 1 : 0,
        });
      } else {
        if (row.sender_type === "visitor" && !row.is_read) {
          existing.unread += 1;
        }
      }
    }

    setSessions(
      Array.from(sessionMap.values()).sort((a, b) =>
        new Date(b.last_at).getTime() - new Date(a.last_at).getTime()
      )
    );
  }, []);

  const loadSessionMessages = useCallback(async (sid: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("id, message, sender_type, created_at, visitor_name")
      .eq("session_id", sid)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  }, []);

  useEffect(() => {
    if (user && isAdmin) loadSessions();
  }, [user, isAdmin, loadSessions]);

  useEffect(() => {
    if (activeSession) loadSessionMessages(activeSession);
  }, [activeSession, loadSessionMessages]);

  // Poll for new messages (chat_messages is intentionally NOT in the realtime
  // publication — see migration guard_chat_messages_not_in_realtime).
  useEffect(() => {
    if (!user || !isAdmin) return;
    const interval = setInterval(() => {
      loadSessions();
      if (activeSession) loadSessionMessages(activeSession);
    }, 5000);
    return () => clearInterval(interval);
  }, [user, isAdmin, activeSession, loadSessions, loadSessionMessages]);

  const handleSendReply = async () => {
    const trimmed = reply.trim();
    if (!trimmed || !activeSession) return;

    setSending(true);
    const msgId = crypto.randomUUID();
    const session = sessions.find((s) => s.session_id === activeSession);

    const newMsg: ChatMessage = {
      id: msgId,
      message: trimmed,
      sender_type: "admin",
      created_at: new Date().toISOString(),
      visitor_name: "Fichua",
    };

    setMessages((prev) => [...prev, newMsg]);
    setReply("");

    const { error } = await supabase.from("chat_messages").insert({
      id: msgId,
      visitor_name: session?.visitor_name || "Visitor",
      message: trimmed,
      session_id: activeSession,
      sender_type: "admin",
    });

    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      setReply(trimmed);
      toast.error("Failed to send reply");
    }

    setSending(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onAuthenticated={() => {}} />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-label tracking-wider uppercase text-foreground">Access Denied</h1>
          <p className="text-sm text-muted-foreground">You don't have admin privileges.</p>
          <button
            onClick={handleLogout}
            className="bg-primary text-primary-foreground px-4 py-2 text-sm font-label tracking-wider uppercase hover:opacity-90"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar with logout */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        <span className="text-xs text-muted-foreground">{user.email}</span>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        <AdminChatSidebar
          sessions={sessions}
          activeSession={activeSession}
          onSelectSession={setActiveSession}
          onRefresh={loadSessions}
        />

        <div className={`flex-1 flex flex-col ${!activeSession ? "hidden md:flex" : "flex"}`}>
          {!activeSession ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Select a conversation</p>
            </div>
          ) : (
            <AdminChatThread
              messages={messages}
              visitorName={sessions.find((s) => s.session_id === activeSession)?.visitor_name || "Chat"}
              reply={reply}
              sending={sending}
              onReplyChange={setReply}
              onSend={handleSendReply}
              onBack={() => setActiveSession(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
