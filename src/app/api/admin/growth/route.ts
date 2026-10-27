import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase, getAdminServiceClient, unauthorizedResponse } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

type GrowthRow = {
  event: string;
  visitor_id: string;
  session_id: string | null;
  tool_id: string | null;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  created_at: string;
};

type ChannelBucket = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  visitors: Set<string>;
  events: number;
  toolOpen: number;
  toolCompleted: number;
  shareClick: number;
  remixClick: number;
  createStarted: number;
  publishCompleted: number;
};

function isMissingTableError(message: string): boolean {
  return (
    message.includes("Could not find the table") ||
    message.includes("PGRST205") ||
    message.includes("schema cache")
  );
}

export async function GET(request: NextRequest) {
  const ctx = await getAuthedSupabase(request);
  if (!ctx) return unauthorizedResponse();
  if (!ctx.isAdmin) {
    return NextResponse.json({ error: "无管理员权限" }, { status: 403 });
  }

  const admin = getAdminServiceClient();
  if (!admin) {
    return NextResponse.json(
      { error: "服务器未配置 SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 },
    );
  }

  const daysParam = Number(new URL(request.url).searchParams.get("days"));
  const days = Number.isFinite(daysParam) ? Math.min(90, Math.max(1, daysParam)) : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from("growth_events")
    .select("event, visitor_id, session_id, tool_id, source, medium, campaign, content, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(50000);

  if (error) {
    if (isMissingTableError(error.message)) {
      return NextResponse.json({
        initialized: false,
        hint: "请在 Supabase SQL Editor 执行 supabase_v227_growth_events.sql",
      });
    }
    return NextResponse.json({ error: "查询增长数据失败" }, { status: 500 });
  }

  const rows = (data ?? []) as GrowthRow[];
  const totals = {
    events: rows.length,
    visitors: new Set(rows.map((row) => row.visitor_id).filter(Boolean)).size,
    firstVisit: 0,
    returnVisit: 0,
    toolOpen: 0,
    toolCompleted: 0,
    shareClick: 0,
    remixClick: 0,
    createStarted: 0,
    publishCompleted: 0,
  };
  const channels = new Map<string, ChannelBucket>();
  const tools = new Map<string, { opens: number; completions: number }>();
  const daily = new Map<string, { visitors: Set<string>; events: number; completions: number }>();

  for (const row of rows) {
    switch (row.event) {
      case "first_visit": totals.firstVisit++; break;
      case "return_visit": totals.returnVisit++; break;
      case "tool_open": totals.toolOpen++; break;
      case "tool_completed": totals.toolCompleted++; break;
      case "share_click": totals.shareClick++; break;
      case "remix_click": totals.remixClick++; break;
      case "create_started": totals.createStarted++; break;
      case "publish_completed": totals.publishCompleted++; break;
    }

    const source = row.source || "direct";
    const medium = row.medium || "";
    const campaign = row.campaign || "";
    const content = row.content || "";
    const channelKey = [source, medium, campaign, content].join("|");
    const channel = channels.get(channelKey) ?? {
      source,
      medium,
      campaign,
      content,
      visitors: new Set<string>(),
      events: 0,
      toolOpen: 0,
      toolCompleted: 0,
      shareClick: 0,
      remixClick: 0,
      createStarted: 0,
      publishCompleted: 0,
    };
    channel.visitors.add(row.visitor_id);
    channel.events++;
    if (row.event === "tool_open") channel.toolOpen++;
    if (row.event === "tool_completed") channel.toolCompleted++;
    if (row.event === "share_click") channel.shareClick++;
    if (row.event === "remix_click") channel.remixClick++;
    if (row.event === "create_started") channel.createStarted++;
    if (row.event === "publish_completed") channel.publishCompleted++;
    channels.set(channelKey, channel);

    if (row.tool_id) {
      const tool = tools.get(row.tool_id) ?? { opens: 0, completions: 0 };
      if (row.event === "tool_open") tool.opens++;
      if (row.event === "tool_completed") tool.completions++;
      tools.set(row.tool_id, tool);
    }

    const day = row.created_at.slice(0, 10);
    const dayBucket = daily.get(day) ?? { visitors: new Set<string>(), events: 0, completions: 0 };
    dayBucket.visitors.add(row.visitor_id);
    dayBucket.events++;
    if (row.event === "tool_completed") dayBucket.completions++;
    daily.set(day, dayBucket);
  }

  return NextResponse.json({
    initialized: true,
    days,
    totals,
    channels: Array.from(channels.values())
      .map((channel) => ({
        source: channel.source,
        medium: channel.medium,
        campaign: channel.campaign,
        content: channel.content,
        visitors: channel.visitors.size,
        events: channel.events,
        toolOpen: channel.toolOpen,
        toolCompleted: channel.toolCompleted,
        shareClick: channel.shareClick,
        remixClick: channel.remixClick,
        createStarted: channel.createStarted,
        publishCompleted: channel.publishCompleted,
      }))
      .sort((a, b) => b.visitors - a.visitors),
    tools: Array.from(tools.entries())
      .map(([toolId, value]) => ({ toolId, ...value }))
      .sort((a, b) => b.opens - a.opens)
      .slice(0, 10),
    daily: Array.from(daily.entries())
      .map(([date, value]) => ({
        date,
        visitors: value.visitors.size,
        events: value.events,
        completions: value.completions,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  });
}
