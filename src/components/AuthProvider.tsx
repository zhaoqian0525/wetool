"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, AuthError, SupabaseClient } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured, getAuthRedirectTo } from "@/lib/supabase";

/** signUp / signIn 的返回值 */
interface AuthResult {
  data: {
    user: User | null;
    identities?: { identity_id: string; provider: string }[] | null;
  } | null;
  error: AuthError | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    const client = getSupabase();
    if (!client) {
      setLoading(false);
      return;
    }

    // 获取已有 session
    let cancelled = false;

    client.auth.getSession().then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        console.warn("[Auth] getSession error:", error.message);
      }
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // 监听 auth 状态变化（登录、登出、token 刷新）
    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);

      // TOKEN_REFRESHED / SIGNED_IN 时确保 loading 已关闭
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "SIGNED_OUT") {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [configured]);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const client = getSupabase();
    if (!client) {
      return {
        data: null,
        error: { message: "Supabase 未配置，请检查环境变量", name: "ConfigError" } as AuthError,
      };
    }

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        // 邮箱验证后重定向到 /auth/callback
        emailRedirectTo: getAuthRedirectTo(),
      },
    });

    return {
      data: data
        ? {
            user: data.user,
            // identities.length === 0 表示需要邮箱验证
            identities: data.user?.identities as { identity_id: string; provider: string }[] | null,
          }
        : null,
      error,
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const client = getSupabase();
    if (!client) {
      return {
        data: null,
        error: { message: "Supabase 未配置，请检查环境变量", name: "ConfigError" } as AuthError,
      };
    }

    const { data, error } = await client.auth.signInWithPassword({ email, password });

    return {
      data: data ? { user: data.user } : null,
      error,
    };
  }, []);

  const signOut = useCallback(async () => {
    const client = getSupabase();
    if (client) {
      await client.auth.signOut();
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, configured, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
