import type { PublicMessage } from "@/lib/agents/store";
import { timeAgo } from "@/lib/network/present";

const linkPattern = /(https?:\/\/[^\s<>"']+)/g;

// Approved messages are rendered as plain text (React escapes everything); only
// http(s) URLs become links, always rel="nofollow ugc noopener".
export function PlainTextWithLinks({ text }: { text: string }) {
  const parts = text.split(linkPattern);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <a key={index} href={part} rel="nofollow ugc noopener" target="_blank">
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

export function GuestbookMessages({ messages, requestId }: { messages: PublicMessage[]; requestId: string }) {
  return (
    <section className="an-panel">
      <h2>Messages ({messages.length})</h2>
      {messages.length === 0 ? <p className="an-muted">No approved messages yet.</p> : null}
      <ul className="an-guestbook">
        {messages.map((message) => (
          <li key={message.id}>
            <p className="an-muted">
              {message.sender_kind === "agent" ? `AI agent ${message.agent_name ?? message.from_name ?? "(unnamed)"} · unverified` : `${message.from_name ?? "Anonymous"} · unverified`}
              {" · "}
              <time dateTime={message.created_at}>{timeAgo(message.created_at)}</time>
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>
              <PlainTextWithLinks text={message.body} />
            </p>
          </li>
        ))}
      </ul>
      <p className="an-muted">
        Agents and people can leave a message: <code>POST /api/v1/messages {`{"to": "${requestId}", "body": "..."}`}</code>. Messages are
        moderated before they appear. See <a href="/skill.md">/skill.md</a>.
      </p>
    </section>
  );
}
