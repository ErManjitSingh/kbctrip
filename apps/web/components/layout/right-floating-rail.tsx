"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, Headset, Send, X } from "lucide-react";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const WHATSAPP = `https://wa.me/${SITE.whatsappPhoneDigits}?text=${encodeURIComponent("Hi! I need help planning a trip.")}`;

const SUGGESTIONS = [
  { tag: "Packages", tone: "text-[#3264ff]", question: "Which holiday packages should I look at?" },
  { tag: "Hotels", tone: "text-[#3264ff]", question: "How do I book a hotel?" },
  { tag: "Cabs", tone: "text-[#ff6a00]", question: "How do I get a cab quote?" },
  { tag: "Help", tone: "text-[#ff6a00]", question: "I need to talk to someone" },
];

const REPLIES: { keys: string[]; text: string }[] = [
  { keys: ["package", "holiday", "tour", "trip"], text: "Popular trips include Goa, Manali, Kashmir, Jaipur and Dubai. Packages start from about ₹9,999 per person. Open Packages and search a city to see what is bookable." },
  { keys: ["hotel", "stay", "room"], text: "Search Hotels, pick your city and dates, then choose a stay. Shimla currently has a live hotel. Other cities show a results page as soon as rooms are listed." },
  { keys: ["cab", "car", "taxi", "quote"], text: "Open Cabs, add pickup and drop, and send one request. Approved partners reply with quotes you can compare." },
  { keys: ["price", "cheap", "save", "budget"], text: "Compare the packages on the listing page and use the price filter. If you want a person to check a fare, call +91 98100 23449 or message us on WhatsApp." },
  { keys: ["book", "booking", "how"], text: "Search a destination, open a package or hotel, choose dates and guests, then pay on the booking page. Cabs are booked after you accept a quote." },
  { keys: ["cancel", "refund"], text: "Cancellation rules depend on the stay or package. Your quote shows what is refundable before you pay. Message us if you already have a booking." },
  { keys: ["expert", "agent", "call", "talk", "support", "help", "human", "someone"], text: "The travel desk is on +91 98100 23449. You can also use Service Chat for WhatsApp." },
  { keys: ["hi", "hello", "hey"], text: "Hi. Tell me a city, a hotel, or a cab route and I will point you to the right page." },
];

function replyFor(input: string) {
  const lower = input.toLowerCase();
  return REPLIES.find((item) => item.keys.some((key) => lower.includes(key)))?.text
    ?? "I can help with packages, hotels and cabs. Tell me a destination, or use Service Chat to reach the desk on WhatsApp.";
}

function AssistantFace({ className }: { className?: string }) {
  return (
    // Plain img so the GIF keeps looping. next/image can freeze animated GIFs.
    <img src="/images/kbc-assistant.gif" alt="" draggable={false} className={cn("h-14 w-14", className)} />
  );
}

type ChatMessage = { from: "bot" | "user"; text: string };

export function RightFloatingRail() {
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: "bot", text: "I'm your travel assistant. I can help you plan a trip, look at packages, and book stays or cabs. Ask anything, or try a question below." },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing, chatOpen]);

  if (pathname.startsWith("/cabs/partner")) return null;

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setMessages((current) => [...current, { from: "user", text: trimmed }]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { from: "bot", text: replyFor(trimmed) }]);
      setTyping(false);
    }, 700);
  };

  return (
    <>
      {chatOpen ? (
        <div className="fixed inset-0 z-[80] bg-slate-900/35" onClick={() => setChatOpen(false)} />
      ) : null}

      {chatOpen ? (
        <section
          className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-[440px] flex-col bg-white shadow-[-16px_0_40px_rgba(15,41,77,0.18)]"
          role="dialog"
          aria-label="Travel assistant"
        >
          <header className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <AssistantFace className="h-8 w-8 shrink-0" />
            <p className="min-w-0 flex-1 text-[16px] font-bold text-slate-900">KBC Assistant</p>
            <button type="button" onClick={() => setChatOpen(false)} className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100" aria-label="Close chat">
              <X className="h-5 w-5" />
            </button>
          </header>
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
            <div>
              <p className="text-[22px] font-semibold text-[#6d8cff]">Hi there!</p>
              <h2 className="mt-1 text-[26px] font-bold leading-tight text-[#0f294d]">Get started with KBC</h2>
            </div>
            <p className="rounded-lg bg-[#f5f7fa] px-4 py-3 text-[14px] leading-6 text-[#0f294d]">
              I can help you plan a trip, compare packages, and find stays or cabs. If you are not sure what to ask, try one of the questions below.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item.question}
                  type="button"
                  onClick={() => ask(item.question)}
                  className="rounded-lg border border-slate-200 px-3 py-3 text-left hover:border-[#3264ff]"
                >
                  <span className={cn("text-[12px] font-semibold", item.tone)}>{item.tag}</span>
                  <span className="mt-1 block text-[14px] leading-5 text-[#0f294d]">{item.question}</span>
                </button>
              ))}
            </div>
            {messages.slice(1).map((message, index) => (
              <p
                key={`${message.from}-${index}`}
                className={cn(
                  "max-w-[90%] rounded-lg px-3 py-2 text-[14px] leading-6",
                  message.from === "user" ? "ml-auto bg-[#3264ff] text-white" : "bg-[#f5f7fa] text-[#0f294d]",
                )}
              >
                {message.text}
              </p>
            ))}
            {typing ? <p className="text-[13px] text-slate-400">Typing…</p> : null}
            <div ref={bottomRef} />
          </div>
          <form
            className="border-t border-slate-100 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              ask(input);
            }}
          >
            <div className="flex items-center gap-2 rounded-full border border-[#c5d4ff] px-4 py-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask me anything about travel"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[#0f294d] outline-none placeholder:text-slate-400"
              />
              <button type="submit" className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:text-[#3264ff]" aria-label="Send message">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <div className="fixed bottom-3 right-2 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-3 lg:bottom-8 lg:z-[70]">
        {serviceOpen ? (
          <div className="w-[280px] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,41,77,0.16)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-bold text-[#0f294d]">Service Chat</p>
                <p className="mt-1 text-[13px] leading-5 text-slate-500">Message the travel desk, or call us.</p>
              </div>
              <button type="button" onClick={() => setServiceOpen(false)} className="text-slate-400 hover:text-slate-700" aria-label="Close service chat">
                <X className="h-4 w-4" />
              </button>
            </div>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="mt-3 flex h-10 items-center justify-center rounded-lg bg-[#25D366] text-[14px] font-semibold text-white">
              Chat on WhatsApp
            </a>
            <a href={`tel:+${SITE.whatsappPhoneDigits}`} className="mt-2 flex h-10 items-center justify-center rounded-lg border border-slate-200 text-[14px] font-semibold text-[#0f294d]">
              Call {SITE.phone}
            </a>
          </div>
        ) : null}

        {showTop ? (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#0f294d] shadow-[0_6px_18px_rgba(15,41,77,0.16)]"
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setChatOpen(true);
            setServiceOpen(false);
          }}
          className="relative"
          aria-label="Hi! I'm here. Chat with me now!"
        >
          {!chatOpen ? (
            <span className="absolute right-[62px] top-3 hidden whitespace-nowrap rounded-md bg-[#4b5568] px-3 py-2 text-[13px] font-medium text-white shadow-sm sm:block">
              Hi! I&apos;m here.
            </span>
          ) : null}
          <span className="relative grid h-14 w-14 place-items-center">
            <AssistantFace />
            <span className="absolute -bottom-1 rounded-full bg-[#123a9a] px-1.5 py-0.5 text-[8px] font-black tracking-wide text-white">
              AI
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setServiceOpen((open) => !open)}
          className="grid h-[52px] w-[52px] place-items-center rounded-full bg-white text-[#0f294d] shadow-[0_6px_18px_rgba(15,41,77,0.16)]"
          aria-label="Service Chat"
          aria-expanded={serviceOpen}
        >
          <Headset className="h-6 w-6" strokeWidth={1.8} />
        </button>
      </div>
    </>
  );
}
