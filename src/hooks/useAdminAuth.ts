import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const checkAdminRole = async (userId: string) => {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });

  if (error) {
    console.error("Admin role check failed:", error);
    return false;
  }

  return !!data;
};

export function useAdminAuth(): AdminAuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    let requestId = 0;

    const syncAdminState = async (currentUser: User | null) => {
      const currentRequestId = ++requestId;

      if (!isActive) {
        return;
      }

      setUser(currentUser);

      if (!currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const admin = await checkAdminRole(currentUser.id);

      if (!isActive || currentRequestId !== requestId) {
        return;
      }

      setIsAdmin(admin);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;

      window.setTimeout(() => {
        void syncAdminState(currentUser);
      }, 0);
    });

    const hydrateAdminState = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session read failed:", error);
      }

      await syncAdminState(session?.user ?? null);
    };

    void hydrateAdminState();

    return () => {
      isActive = false;
      requestId += 1;
      subscription.unsubscribe();
    };
  }, []);

  return { user, isAdmin, loading };
}
