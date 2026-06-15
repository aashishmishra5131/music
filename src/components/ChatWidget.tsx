"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  IconMessageCircle,
  IconX,
  IconSend,
  IconLoader2,
  IconHeadphones,
  IconMoodSmile,
} from "@tabler/icons-react";
import EmojiPicker from "@/components/EmojiPicker";

type ChatState = "hidden" | "bubble" | "open";

interface Message {
  _id: string;
  sender: "user" | "admin";
  text: string;
  isRead: boolean;
  createdAt: string;
}

export default function ChatWidget() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [chatState, setChatState] = useState<ChatState>("hidden");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [conversationId, setConversationId] = useState<string>("");
  const [username, setUsername] = useState("Guest");
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Don't show on admin pages
  if (pathname.startsWith("/admin")) return null;

  // Setup conversationId from session or localStorage
  useEffect(() => {
    if (session?.user?._id) {
      setConversationId(`user_${session.user._id}`);
      setUsername(session.user.username || session.user.name || "User");
    } else {
      let id = localStorage.getItem("chat_session_id");
      if (!id) {
        id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("chat_session_id", id);
      }
      setConversationId(id);
    }
  }, [session]);

  // Auto-open after 5s (only once per session)
  useEffect(() => {
    const alreadyOpened = sessionStorage.getItem("chat_auto_opened");
    if (alreadyOpened) {
      setChatState("bubble");
      return;
    }
    const timer = setTimeout(() => {
      setChatState("open");
      sessionStorage.setItem("chat_auto_opened", "true");
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await axios.get(
        `/api/chat/messages?conversationId=${conversationId}`
      );
      setMessages(res.data.messages);
    } catch {
      // silent fail
    }
  }, [conversationId]);

  // Polling when open
  useEffect(() => {
    if (chatState === "open" && conversationId) {
      fetchMessages();
      // Mark admin messages as read when user opens chat
      axios
        .patch("/api/chat/read", { conversationId, sender: "admin" })
        .catch(() => {});
      pollingRef.current = setInterval(fetchMessages, 3000);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [chatState, conversationId, fetchMessages]);

  // Unread count (admin messages not yet read)
  useEffect(() => {
    const count = messages.filter(
      (m) => m.sender === "admin" && !m.isRead
    ).length;
    setUnreadCount(count);
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    if (chatState === "open") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatState]);

  // Focus input on open
  useEffect(() => {
    if (chatState === "open") {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [chatState]);

  const sendMessage = async () => {
    if (!inputText.trim() || !conversationId || isSending) return;
    const text = inputText.trim();
    setInputText("");
    setIsSending(true);

    // Optimistic update
    const tempId = `temp_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        _id: tempId,
        sender: "user",
        text,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      await axios.post("/api/chat/send", {
        conversationId,
        text,
        sender: "user",
        username,
        userEmail: session?.user?.email,
      });
      await fetchMessages();
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setChatState("bubble");
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      {/* ── Chat Popup ── */}
      <AnimatePresence>
        {chatState === "open" && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.88 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="fixed bottom-24 right-5 z-50 flex flex-col rounded-2xl border border-white/10 shadow-2xl shadow-purple-900/30"
            style={{ width: 340, height: 500 }}
          >
            {/* Header */}
            <div className="relative flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-violet-950 via-purple-900 to-indigo-950 flex-shrink-0 rounded-t-2xl overflow-hidden">
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-grid-white/[0.04] pointer-events-none" />
              {/* Top purple line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent" />

              <div className="relative flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/40">
                    <IconHeadphones className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-violet-950 animate-pulse" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-none">
                    MusicNext Support
                  </p>
                  <p className="text-green-300 text-[11px] mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                    Online now
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="relative p-1.5 rounded-lg hover:bg-white/10 transition-colors text-neutral-300 hover:text-white"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-950 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
              {/* Empty state */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center justify-center h-full gap-3 text-center px-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center ring-1 ring-purple-500/20">
                    <IconMessageCircle className="w-7 h-7 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      Hey {username}! 👋
                    </p>
                    <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                      Ask us anything about music courses, features, or
                      support.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Message bubbles */}
              {messages.map((msg, i) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i === messages.length - 1 ? 0.05 : 0,
                  }}
                  className={`flex items-end gap-2 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "admin" && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold mb-1">
                      M
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl rounded-br-sm shadow-lg shadow-purple-500/20"
                        : "bg-neutral-800 border border-neutral-700/60 text-neutral-200 rounded-2xl rounded-bl-sm"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.sender === "user"
                          ? "text-purple-200/70"
                          : "text-neutral-500"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex-shrink-0 rounded-b-2xl">
              <div className="relative flex items-center gap-2 bg-neutral-900 rounded-xl px-3.5 py-2.5 border border-neutral-700/60 focus-within:border-purple-500/50 focus-within:shadow-sm focus-within:shadow-purple-500/10 transition-all duration-200">
                {/* Emoji Picker */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <EmojiPicker
                      position="top"
                      onSelect={(emoji) => {
                        setInputText((prev) => prev + emoji);
                        inputRef.current?.focus();
                      }}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  )}
                </AnimatePresence>
                {/* Emoji Button */}
                <button
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  className={`flex-shrink-0 transition-colors ${showEmojiPicker ? "text-purple-400" : "text-neutral-500 hover:text-neutral-300"}`}
                  title="Emoji"
                >
                  <IconMoodSmile className="w-4 h-4" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-neutral-600"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isSending}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white disabled:opacity-30 hover:opacity-90 active:scale-95 transition-all duration-150 shadow-md shadow-purple-500/20"
                >
                  {isSending ? (
                    <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <IconSend className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-center text-neutral-700 text-[10px] mt-1.5">
                Powered by MusicNext ✦
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Bubble ── */}
      <AnimatePresence>
        {chatState !== "open" && (
          <motion.button
            key="chat-bubble"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            onClick={() => setChatState("open")}
            className="fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/40 text-white"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-purple-500/25 animate-ping" />
            <IconMessageCircle className="w-6 h-6 relative z-10" />

            {/* Unread badge */}
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-lg z-20"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
