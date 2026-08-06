"use client";

import { getSupabase } from "./supabase";

/**
 * ? Supabase session token ? fetch?
 * ????????? Authorization: Bearer <access_token>?
 * ??? API ?????????????????? userId??
 */
export async function authedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const client = getSupabase();
  let token = "";
  if (client) {
    try {
      const { data } = await client.auth.getSession();
      token = data.session?.access_token ?? "";
    } catch {
      token = "";
    }
  }
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
