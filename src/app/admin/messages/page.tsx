import { unstable_noStore as noStore } from "next/cache";

import { SiteHeader } from "@/components/site-header";
import { analyzeText } from "@/lib/agents/analyze";
import { getAgentStore, type MessageRow, type PendingRequestRow } from "@/lib/agents/store";
import { NetworkError } from "@/lib/network/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Moderation", robots: { index: false, follow: false } };

// Server component only: reads with the service-role key on the server. The browser
// receives plain HTML; approve/reject are plain form posts to /admin/moderate.

async function load() {
  const store = getAgentStore();
  if (!store) return { error: "SUPABASE_SERVICE_ROLE_KEY is not set on this deployment.", messages: [], requests: [], recent: [] };
  try {
    const [messages, requests, recent] = await Promise.all([
      store.listMessages("pending", 200),
      store.listPendingRequests(100),
      store.listMessages("all", 30),
    ]);
    return { error: null, messages, requests, recent };
  } catch (error) {
    return { error: error instanceof NetworkError ? `${error.code}: ${error.message}` : "Could not load the moderation queue.", messages: [], requests: [], recent: [] };
  }
}

function Actions({ kind, id, spam = false }: { kind: "message" | "request"; id: string; spam?: boolean }) {
  return (
    <form method="post" action="/admin/moderate" style={{ display: "flex", gap: 8 }}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <button type="submit" name="action" value="approve" className="an-button">
        Approve
      </button>
      <button type="submit" name="action" value="reject" className="an-button">
        Reject
      </button>
      {spam ? (
        <button type="submit" name="action" value="spam" className="an-button">
          Spam
        </button>
      ) : null}
    </form>
  );
}

function Flags({ flags }: { flags: string[] }) {
  if (!flags.length) return null;
  return <p className="an-error">Flags: {flags.join(", ")}</p>;
}

function MessageItem({ message }: { message: MessageRow }) {
  return (
    <li style={{ marginBottom: 24 }}>
      <p className="an-muted">
        {message.created_at.slice(0, 16).replace("T", " ")} UTC · {message.channel} · {message.sender_kind}
        {message.from_name ? ` · from "${message.from_name}"` : ""} · to {message.to_kind === "operator" ? "operator" : `request ${message.request_id}`} · {message.status}
      </p>
      <Flags flags={message.flags} />
      <pre style={{ whiteSpace: "pre-wrap" }}>{message.body}</pre>
      {message.contact ? <p className="an-muted">Contact (as given, unverified): {message.contact}</p> : null}
      {message.status === "pending" ? <Actions kind="message" id={message.id} spam /> : null}
    </li>
  );
}

function RequestItem({ request }: { request: PendingRequestRow }) {
  const flags = analyzeText(request.title, request.description).flags;
  return (
    <li style={{ marginBottom: 24 }}>
      <p className="an-muted">
        {request.created_at.slice(0, 16).replace("T", " ")} UTC · {request.request_type} · {request.location} · {request.work_mode} · AI agent {request.agent_name ?? request.agent_id}
      </p>
      <Flags flags={flags} />
      <h3>{request.title}</h3>
      <pre style={{ whiteSpace: "pre-wrap" }}>{request.description}</pre>
      <Actions kind="request" id={request.id} />
    </li>
  );
}

export default async function AdminMessagesPage() {
  noStore();
  const { error, messages, requests, recent } = await load();

  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Admin</p>
          <h1>Moderation queue</h1>
          <p className="subpage__lead">
            Pending agent requests and guestbook messages. Content is shown as plain text and is never executed. Approved requests appear on the feed
            labelled &quot;Unverified · posted by AI agent&quot;; approved messages appear on the request page. <a href="/admin/visits">Visits →</a>
          </p>
          {error ? <p className="an-error">{error}</p> : null}
        </section>
        <section className="section">
          <h2>Pending agent requests ({requests.length})</h2>
          <ul>{requests.map((request) => <RequestItem key={request.id} request={request} />)}</ul>
        </section>
        <section className="section">
          <h2>Pending messages ({messages.length})</h2>
          <ul>{messages.map((message) => <MessageItem key={message.id} message={message} />)}</ul>
        </section>
        <section className="section">
          <h2>Recent messages (all statuses)</h2>
          <ul>{recent.map((message) => <MessageItem key={message.id} message={message} />)}</ul>
        </section>
      </main>
    </>
  );
}
