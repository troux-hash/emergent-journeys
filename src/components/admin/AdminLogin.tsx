import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminLoginProps {
  onAuthenticated: () => void;
}

const AdminLogin = ({ onAuthenticated }: AdminLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
    } else {
      onAuthenticated();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-label tracking-wider uppercase text-center text-foreground">
          Admin Login
        </h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground px-4 py-3 text-sm font-label tracking-wider uppercase hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
