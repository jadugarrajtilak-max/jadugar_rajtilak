"use client";

import { useEffect, useState } from "react";
import { Mail, Inbox, Check, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/admin-client";

// ─────────────────────────────────────────────────────────────
// Contact Messages inbox — real messages submitted through the
// public contact form (stored in the ContactMessage table).
// Rendered inside the Leads CRM tab.
// ─────────────────────────────────────────────────────────────

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  handled: boolean;
  createdAt: string;
};

export function MessagesInbox() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await adminFetch<{ messages: ContactMessage[] }>("/api/contact");
      if (cancelled) return;
      if (res.ok && res.data) setMessages(res.data.messages);
      else setMessages([]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleHandled = async (m: ContactMessage) => {
    setBusyId(m.id);
    const res = await adminFetch("/api/contact", {
      method: "PUT",
      body: JSON.stringify({ id: m.id, handled: !m.handled }),
    });
    setBusyId(null);
    if (res.ok) {
      setMessages((cur) =>
        (cur ?? []).map((x) => (x.id === m.id ? { ...x, handled: !m.handled } : x))
      );
    } else {
      toast({ title: "Could not update", description: res.error ?? "Try again", variant: "destructive" });
    }
  };

  if (messages === null) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-[#e3d9c6] bg-[#fffdf7] p-6 text-sm text-[#5b5266]">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading contact messages…
      </div>
    );
  }

  const unhandled = messages.filter((m) => !m.handled).length;

  return (
    <section className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6 sm:p-7" aria-labelledby="messages-heading">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="messages-heading" className="flex items-center gap-2.5 font-display text-xl font-semibold text-[#2a1b3d]">
            <Inbox className="h-5 w-5 text-[#b8923a]" aria-hidden="true" /> Contact form messages
            {unhandled > 0 && (
              <Badge className="rounded-full bg-[#b3263e] text-[11px] text-[#fdf8ee]">
                {unhandled} new
              </Badge>
            )}
          </h2>
          <p className="mt-1 text-sm text-[#5b5266]">
            Real messages from the public contact form — nothing here is fake.
          </p>
        </div>
        <span className="text-xs text-[#5b5266]/70 tabular-nums">{messages.length} total</span>
      </header>

      {messages.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-[#e3d9c6] bg-[#faf6ee] p-8 text-center text-sm text-[#5b5266]">
          No messages yet — they appear here the moment a visitor writes through the
          contact page.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`rounded-2xl border p-4.5 px-5 py-4 ${
                m.handled ? "border-[#e3d9c6] bg-[#faf6ee]/60" : "border-[#b8923a]/50 bg-[#fffdf7]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#2a1b3d]">
                  <Mail className="h-3.5 w-3.5 text-[#b8923a]" aria-hidden="true" />
                  {m.name}
                  <span className="font-normal text-[#5b5266]">· {m.email}</span>
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] tabular-nums text-[#5b5266]/70">
                    {new Date(m.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                  <button
                    onClick={() => void toggleHandled(m)}
                    disabled={busyId === m.id}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      m.handled
                        ? "bg-[#efe8da] text-[#5b5266] hover:bg-[#e3d9c6]"
                        : "bg-[#3e8e8a] text-[#faf6ee] hover:bg-[#35736f]"
                    }`}
                    aria-label={m.handled ? "Mark as new" : "Mark as handled"}
                  >
                    {busyId === m.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : m.handled ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Handled
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" /> Mark handled
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-2.5 whitespace-pre-wrap text-[15px] leading-7 text-[#2a1b3d]/90">
                {m.message}
              </p>
              <a
                href={`mailto:${m.email}?subject=Re: your message to Jadugar Rajtilak`}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#b3263e] underline-offset-4 hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> Reply by email
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
