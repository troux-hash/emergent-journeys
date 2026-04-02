import { useRef, useEffect } from "react";
import { Send, ArrowLeft } from "lucide-react";

interface ChatMessage {
  id: string;
  message: string;
  sender_type: string;
  created_at: string;
  visitor_name: string;
}

interface AdminChatThreadProps {
  messages: ChatMessage[];
  visitorName: string;
  reply: string;
  sending: boolean;
  onReplyChange: (val: string) => void;
  onSend: () => void;
  onBack: () => void;
}

const AdminChatThread = ({ messages, visitorName, reply, sending, onReplyChange, onSend, onBack }: AdminChatThreadProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        <button onClick={onBack} className="md:hidden p-1.5 hover:opacity-80 text-foreground" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <span className="font-label text-sm tracking-wider uppercase text-foreground">{visitorName}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
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
          onChange={(e) => onReplyChange(e.target.value)}
          placeholder="Type a reply..."
          rows={1}
          className="flex-1 border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          maxLength={2000}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
          }}
        />
        <button
          onClick={onSend}
          disabled={sending || !reply.trim()}
          className="shrink-0 bg-primary text-primary-foreground p-2.5 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send reply"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default AdminChatThread;
