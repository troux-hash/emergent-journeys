import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const languages = [
  { code: "en", label: "English", placeholder: "Type your message...", namePlaceholder: "Your name", emailPlaceholder: "Your email (optional)", sendLabel: "Send", successMsg: "Message sent! We'll get back to you soon.", titleLabel: "Chat with us" },
  { code: "fr", label: "Français", placeholder: "Écrivez votre message...", namePlaceholder: "Votre nom", emailPlaceholder: "Votre email (optionnel)", sendLabel: "Envoyer", successMsg: "Message envoyé ! Nous vous répondrons bientôt.", titleLabel: "Discutons" },
  { code: "zh", label: "中文", placeholder: "输入您的消息...", namePlaceholder: "您的姓名", emailPlaceholder: "您的邮箱（可选）", sendLabel: "发送", successMsg: "消息已发送！我们会尽快回复您。", titleLabel: "在线咨询" },
];

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [langCode, setLangCode] = useState("en");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const lang = languages.find((l) => l.code === langCode) || languages[0];

  useEffect(() => {
    if (open && textareaRef.current) textareaRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || !name.trim()) return;

    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      visitor_name: name.trim(),
      visitor_email: email.trim() || null,
      message: trimmed,
      language: langCode,
    });

    setSending(false);
    if (error) {
      toast.error("Failed to send message");
      return;
    }

    setSent(true);
    setMessage("");
    toast.success(lang.successMsg);
    setTimeout(() => setSent(false), 3000);
  };

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
            className="fixed bottom-6 right-6 z-50 w-[340px] max-w-[calc(100vw-3rem)] bg-background border border-border shadow-xl flex flex-col overflow-hidden"
            style={{ borderRadius: "var(--radius)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
              <span className="font-label text-sm tracking-wider uppercase">{lang.titleLabel}</span>
              <div className="flex items-center gap-1">
                {/* Language picker */}
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

            {/* Body */}
            <div className="flex flex-col gap-3 p-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang.namePlaceholder}
                className="w-full border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                maxLength={100}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lang.emailPlaceholder}
                className="w-full border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                maxLength={255}
              />
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={lang.placeholder}
                rows={3}
                className="w-full border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                maxLength={1000}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
              />
              <button
                onClick={handleSend}
                disabled={sending || !message.trim() || !name.trim()}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 text-sm font-label tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                {lang.sendLabel}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
