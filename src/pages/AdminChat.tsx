import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

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
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Simple password gate (not for real security – just prevents casual access)
  const ADMIN_PASS = "fichua2024";

  const handleAuth = () => {
    if (password === ADMIN_PASS) {
      setAuthed(true);
      localStorage.setItem("fichua_admin", "1");
    } else {
      toast.error("Wrong password");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("fichua_admin") === "1") setAuthed(true);
  }, []);

  // Load sessions
  const loadSessions = useCallback(async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("session_id, visitor_name, visitor_email, message, created_at, sender_type, is_read")
      .order("created_at", { ascending: false });

    if (!data) return;

    const sessionMap = new Map<string, Session>();
    // Process in reverse to get latest message per session
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

    setSessions(Array.from(sessionMap.values()).sort((a, b) => 
      new Date(b.last_at).getTime() - new Date(a.last_at).getTime()
    ));
  }, []);

  useEffect(() => {
    if (authed) loadSessions();
  }, [authed, loadSessions]);

  // Load messages for active session
  const loadSessionMessages = useCallback(async (sid: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("id, message, sender_type, created_at, visitor_name")
      .eq("session_id", sid)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  }, []);

  useEffect(() => {
    if (activeSession) {
      loadSessionMessages(activeSession);
      inputRef.current?.focus();
    }
  }, [activeSession, loadSessionMessages]);

  // Realtime for all messages (admin view)
  useEffect(() => {
    if (!authed) return;

    const channel = supabase
      .channel("admin-chat-all")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const newMsg = payload.new as ChatMessage & { session_id: string };
          // Update messages if viewing this session
          if (newMsg.session_id === activeSession) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
          // Refresh session list
          loadSessions();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [authed, activeSession, loadSessions]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-label tracking-wider uppercase text-center text-foreground">Admin Chat</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            onKeyDown={(e) => { if (e.key === "Enter") handleAuth(); }}
          />
          <button
            onClick={handleAuth}
            className="w-full bg-primary text-primary-foreground px-4 py-3 text-sm font-label tracking-wider uppercase hover:opacity-90"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar – session list */}
      <div className={`w-full md:w-80 border-r border-border flex flex-col shrink-0 ${activeSession ? "hidden md:flex" : "flex"}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary text-primary-foreground">
          <span className="font-label text-sm tracking-wider uppercase">Conversations</span>
          <button onClick={loadSessions} className="p-1.5 hover:opacity-80" aria-label="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-8">No conversations yet</p>
          )}
          {sessions.map((s) => (
            <button
              key={s.session_id}
              onClick={() => setActiveSession(s.session_id)}
              className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted transition-colors ${activeSession === s.session_id ? "bg-muted" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground">{s.visitor_name}</span>
                {s.unread > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">{s.unread}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{s.last_message}</p>
              <span className="text-[10px] text-muted-foreground">
                {new Date(s.last_at).toLocaleString()}
              </span>
              {s.visitor_email && (
                <span className="block text-[10px] text-muted-foreground">{s.visitor_email}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${!activeSession ? "hidden md:flex" : "flex"}`}>
        {!activeSession ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Select a conversation</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
              <button
                onClick={() => setActiveSession(null)}
                className="md:hidden p-1.5 hover:opacity-80 text-foreground"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
              <span className="font-label text-sm tracking-wider uppercase text-foreground">
                {sessions.find((s) => s.session_id === activeSession)?.visitor_name || "Chat"}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-2 text-sm ${
                      msg.sender_type === "admin"
                        ? "bg-primary text-primary-foreground rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                        : "bg-muted text-foreground rounded-tl-lg rounded-tr-lg rounded-br-lg"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    <span className="block text-[10px] opacity-60 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            <div className="shrink-0 border-t border-border p-3 flex gap-2">
              <textarea
                ref={inputRef}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type a reply..."
                rows={1}
                className="flex-1 border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                maxLength={2000}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendReply(); }
                }}
              />
              <button
                onClick={handleSendReply}
                disabled={sending || !reply.trim()}
                className="shrink-0 bg-primary text-primary-foreground p-2.5 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send reply"
              >
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
