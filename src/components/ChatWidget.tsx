import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const languages = [
  { code: "en", label: "English", placeholder: "Type your message...", namePlaceholder: "Your name", emailPlaceholder: "Your email (optional)", sendLabel: "Send", successMsg: "Message sent!", titleLabel: "Chat with us", waitingMsg: "We'll reply shortly..." },
  { code: "fr", label: "Français", placeholder: "Écrivez votre message...", namePlaceholder: "Votre nom", emailPlaceholder: "Votre email (optionnel)", sendLabel: "Envoyer", successMsg: "Message envoyé !", titleLabel: "Discutons", waitingMsg: "Nous répondrons bientôt..." },
  { code: "zh", label: "中文", placeholder: "输入您的消息...", namePlaceholder: "您的姓名", emailPlaceholder: "您的邮箱（可选）", sendLabel: "发送", successMsg: "消息已发送！", titleLabel: "在线咨询", waitingMsg: "我们会尽快回复..." },
];

interface ChatMessage {
  id: string;
  message: string;
  sender_type: string;
  created_at: string;
  visitor_name: string;
}

const SESSION_KEY = "fichua_chat_session";

function getOrCreateSession(): string {
  let session = localStorage.getItem(SESSION_KEY);
  if (!session) {
    session = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, session);
  }
  return session;
}

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [langCode, setLangCode] = useState("en");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasIntroduced, setHasIntroduced] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(getOrCreateSession());

  const lang = languages.find((l) => l.code === langCode) || languages[0];

  // Check if user already has messages in this session
  useEffect(() => {
    const stored = localStorage.getItem("fichua_chat_name");
    if (stored) {
      setName(stored);
      setHasIntroduced(true);
    }
  }, []);

  // Load existing messages for session
  const loadMessages = useCallback(async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("id, message, sender_type, created_at, visitor_name")
      .eq("session_id", sessionId.current)
      .order("created_at", { ascending: true });
    if (data && data.length > 0) {
      setMessages(data);
      setHasIntroduced(true);
    }
  }, []);

  useEffect(() => {
    if (open) loadMessages();
  }, [open, loadMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!open) return;

    const channel = supabase
      .channel(`chat-${sessionId.current}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `session_id=eq.${sessionId.current}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus textarea when opened
  useEffect(() => {
    if (open && hasIntroduced && textareaRef.current) textareaRef.current.focus();
  }, [open, hasIntroduced]);

  // Close lang menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleIntroduce = () => {
    if (!name.trim()) return;
    localStorage.setItem("fichua_chat_name", name.trim());
    setHasIntroduced(true);
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setSending(true);
    const msgId = crypto.randomUUID();
    const newMsg: ChatMessage = {
      id: msgId,
      message: trimmed,
      sender_type: "visitor",
      created_at: new Date().toISOString(),
      visitor_name: name.trim(),
    };

    // Optimistic add
    setMessages((prev) => [...prev, newMsg]);
    setMessage("");

    const { error } = await supabase.from("chat_messages").insert({
      id: msgId,
      visitor_name: name.trim(),
      visitor_email: email.trim() || null,
      message: trimmed,
      language: langCode,
      session_id: sessionId.current,
      sender_type: "visitor",
    });

    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      setMessage(trimmed);
      toast.error("Failed to send message");
    } else {
      // Fire-and-forget email notification
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "chat-notification",
          idempotencyKey: `chat-notify-${msgId}`,
          templateData: {
            visitorName: name.trim(),
            visitorEmail: email.trim() || undefined,
            message: trimmed,
            language: langCode,
          },
        },
      }).catch(() => {});
    }

    setSending(false);
  };

  const unreadAdmin = messages.filter((m) => m.sender_type === "admin").length;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label="Open chat"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[480px] max-h-[calc(100vh-6rem)] bg-background border border-border shadow-xl flex flex-col overflow-hidden"
            style={{ borderRadius: "var(--radius)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
              <span className="font-label text-sm tracking-wider uppercase">{lang.titleLabel}</span>
              <div className="flex items-center gap-1">
                <div ref={langRef} className="relative">
                  <button onClick={() => setLangMenuOpen(!langMenuOpen)} className="p-1.5 hover:opacity-80" aria-label="Change language">
                    <Globe size={16} />
                  </button>
                  {langMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-background border border-border shadow-md min-w-[120px] z-50">
                      {languages.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => { setLangCode(l.code); setLangMenuOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors ${l.code === langCode ? "font-semibold" : ""}`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setOpen(false)} className="p-1.5 hover:opacity-80" aria-label="Close chat">
                  <X size={16} />
                </button>
              </div>
            </div>

            {!hasIntroduced ? (
              /* Introduction form */
              <div className="flex flex-col gap-3 p-4 flex-1 justify-center">
                <p className="text-sm text-muted-foreground text-center">{lang.waitingMsg}</p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang.namePlaceholder}
                  className="w-full border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  maxLength={100}
                  onKeyDown={(e) => { if (e.key === "Enter") handleIntroduce(); }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={lang.emailPlaceholder}
                  className="w-full border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  maxLength={255}
                />
                <button
                  onClick={handleIntroduce}
                  disabled={!name.trim()}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 text-sm font-label tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Chat
                </button>
              </div>
            ) : (
              <>
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-8">{lang.waitingMsg}</p>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === "visitor" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 text-sm ${
                          msg.sender_type === "visitor"
                            ? "bg-primary text-primary-foreground rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                            : "bg-muted text-foreground rounded-tl-lg rounded-tr-lg rounded-br-lg"
                        }`}
                      >
                        {msg.sender_type === "admin" && (
                          <span className="block text-xs font-semibold text-muted-foreground mb-1">Fichua</span>
                        )}
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        <span className="block text-[10px] opacity-60 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="shrink-0 border-t border-border p-3 flex gap-2">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={lang.placeholder}
                    rows={1}
                    className="flex-1 border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    maxLength={1000}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !message.trim()}
                    className="shrink-0 bg-primary text-primary-foreground p-2.5 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={lang.sendLabel}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
