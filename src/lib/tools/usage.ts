import "server-only";

import { constantTimeEqual } from "@/lib/agents/hash";
import { getServiceConfig } from "@/lib/agents/store";
import { detectBot } from "@/lib/agents/visits";

// Usage metering for tool calls, and classification of who is calling.
//
// The point of the classification is to keep the usage numbers honest. Only an actual tool
// invocation is recorded here (reading /llms.txt or listing MCP tools is not usage), and each
// record carries a client class so crawlers, directory scanners and our own tests can be
// excluded when counting real external agents.
//
// Nothing about the inspected content is stored: no file bytes, no text, no URLs, no hashes.

export const clientClasses = ["internal_test", "search_crawler", "directory_scanner", "browser", "external_agent"] as const;
export type ClientClass = (typeof clientClasses)[number];

// Registries, directory crawlers, uptime monitors and security scanners.
const scannerPattern =
  /glama|smithery|pulsemcp|mcp[-_. ]?(registry|hub|scan|index|market|so)|mcpservers|toolhive|apify|uptime|statuscake|pingdom|datadog|site24x7|monitor|nuclei|zgrab|masscan|nmap|censys|shodan|nikto|sqlmap|wpscan|dirbuster|gobuster|semrush|ahrefs|mj12bot|dotbot|petalbot|bingbot|googlebot|yandex|baiduspider|duckduckbot|facebookexternalhit|slackbot|twitterbot|discordbot|telegrambot|linkedinbot|headlesschrome|lighthouse|pagespeed/i;

export function classifyClient(headers: Headers): ClientClass {
  const token = process.env.INTERNAL_TEST_TOKEN;
  const presented = headers.get("x-aa-internal-test");
  if (token && presented && constantTimeEqual(presented, token)) return "internal_test";
  const userAgent = headers.get("user-agent") ?? "";
  if (detectBot(userAgent)) return "search_crawler";
  if (scannerPattern.test(userAgent)) return "directory_scanner";
  // A real browser sends Fetch Metadata; scripts and agents almost never do.
  if (/mozilla\//i.test(userAgent) && headers.get("sec-fetch-mode")) return "browser";
  return "external_agent";
}

export type UsageRow = {
  ts: string;
  request_id: string;
  tool: string;
  channel: "rest" | "mcp";
  input_mode: string;
  status: "ok" | "error";
  error_code: string | null;
  client_class: ClientClass;
  registered_agent: boolean;
  ip_hash: string;
  user_agent: string | null;
  bytes_in: number;
  duration_ms: number;
  cost_credits: number;
};

type Sink = (row: UsageRow) => void | Promise<void>;
let sink: Sink | null | undefined;

// Test hook: capture rows instead of writing them.
export function setUsageSink(next: Sink | null | undefined) {
  sink = next;
}

// Best effort and bounded: metering must never fail or slow a tool call noticeably.
export async function recordUsage(row: UsageRow): Promise<boolean> {
  try {
    if (sink !== undefined) {
      if (sink) await sink(row);
      return Boolean(sink);
    }
    const config = getServiceConfig();
    if (!config) return false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2_000);
    try {
      const response = await fetch(`${config.url}/rest/v1/tool_usage`, {
        method: "POST",
        headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(row),
        signal: controller.signal,
      });
      return response.ok;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return false;
  }
}

export type UsageSummaryRow = { tool: string; client_class: string; status: string; calls: number };

// Admin view: recent rows aggregated in memory (the table is small; retention is 90 days).
export type UsageSummary = { error: string | null; rows: UsageSummaryRow[]; total: number; sampled: boolean; external: { okCalls: number; distinctCallers: number } };

const emptyExternal = { okCalls: 0, distinctCallers: 0 };

export async function loadUsageSummary(days = 7, limit = 5_000): Promise<UsageSummary> {
  const config = getServiceConfig();
  if (!config) return { error: "Server database key is not configured on this deployment.", rows: [], total: 0, sampled: false, external: emptyExternal };
  try {
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const response = await fetch(
      `${config.url}/rest/v1/tool_usage?select=tool,client_class,status,ip_hash&ts=gte.${encodeURIComponent(since)}&order=ts.desc&limit=${limit}`,
      { headers: { apikey: config.key, Authorization: `Bearer ${config.key}` }, cache: "no-store" },
    );
    if (!response.ok) {
      return { error: response.status === 404 ? "Table tool_usage does not exist yet. Apply supabase/migrations/20261110000000_tools_platform_v1_0.sql." : `Could not load usage (HTTP ${response.status}).`, rows: [], total: 0, sampled: false, external: emptyExternal };
    }
    const data = (await response.json()) as Array<{ tool: string; client_class: string; status: string; ip_hash: string }>;
    const externalOk = data.filter((row) => row.client_class === "external_agent" && row.status === "ok");
    const counts = new Map<string, UsageSummaryRow>();
    for (const row of data) {
      const key = `${row.tool}|${row.client_class}|${row.status}`;
      const entry = counts.get(key) ?? { tool: row.tool, client_class: row.client_class, status: row.status, calls: 0 };
      entry.calls += 1;
      counts.set(key, entry);
    }
    return {
      error: null,
      rows: [...counts.values()].sort((a, b) => b.calls - a.calls),
      total: data.length,
      sampled: data.length >= limit,
      external: { okCalls: externalOk.length, distinctCallers: new Set(externalOk.map((row) => row.ip_hash)).size },
    };
  } catch {
    return { error: "Could not load usage.", rows: [], total: 0, sampled: false, external: emptyExternal };
  }
}
