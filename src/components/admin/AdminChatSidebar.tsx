import { RefreshCw } from "lucide-react";

interface Session {
  session_id: string;
  visitor_name: string;
  visitor_email: string | null;
  last_message: string;
  last_at: string;
  unread: number;
}

interface AdminChatSidebarProps {
  sessions: Session[];
  activeSession: string | null;
  onSelectSession: (id: string) => void;
  onRefresh: () => void;
}

const AdminChatSidebar = ({ sessions, activeSession, onSelectSession, onRefresh }: AdminChatSidebarProps) => (
  <div className={`w-full md:w-80 border-r border-border flex flex-col shrink-0 ${activeSession ? "hidden md:flex" : "flex"}`}>
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary text-primary-foreground">
      <span className="font-label text-sm tracking-wider uppercase">Conversations</span>
      <button onClick={onRefresh} className="p-1.5 hover:opacity-80" aria-label="Refresh">
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
          onClick={() => onSelectSession(s.session_id)}
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
);

export default AdminChatSidebar;
