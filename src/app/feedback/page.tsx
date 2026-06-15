"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconSend, IconLoader2, IconHeadphones, IconCircleFilled,
  IconWifiOff, IconCheck, IconMessage, IconUser, IconMoodSmile,
} from "@tabler/icons-react";
import EmojiPicker from "@/components/EmojiPicker";

interface Message {
  _id: string;
  sender: "user" | "admin";
  text: string;
  isRead: boolean;
  createdAt: string;
}

export default function FeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const conversationId = session?.user
    ? `user_${(session.user as any)._id || session.user.email?.replace(/[^a-z0-9]/gi, "")}`
    : null;

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await axios.get(`/api/chat/messages?conversationId=${conversationId}`);
      setMessages(res.data.messages || []);
    } catch {}
  }, [conversationId]);

  // Initial load
  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated" || !conversationId) return;
    fetchMessages().finally(() => setIsLoading(false));
  }, [status, conversationId, fetchMessages, router]);

  // SSE real-time
  useEffect(() => {
    if (!conversationId) return;
    const es = new EventSource(`/api/sse/user-chat?conversationId=${conversationId}`);

    es.addEventListener("connected", () => setIsConnected(true));

    es.addEventListener("new_message", (e: MessageEvent) => {
      const { message } = JSON.parse(e.data);
      setMessages((prev) => {
        if (prev.some((m) => m._id.toString() === message._id.toString())) return prev;
        return [...prev, message];
      });
    });

    es.onerror = () => setIsConnected(false);
    return () => es.close();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isSending || !conversationId) return;
    const text = inputText.trim();
    setInputText("");
    setIsSending(true);

    const tempId = `temp_${Date.now()}`;
    const tempMsg: Message = { _id: tempId, sender: "user", text, isRead: false, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await axios.post("/api/chat/send", {
        conversationId,
        text,
        sender: "user",
        username: (session?.user as any)?.username || session?.user?.name || "User",
        userEmail: session?.user?.email || "",
      });
      await fetchMessages();
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setInputText(text);
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <IconLoader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const username = (session?.user as any)?.username || session?.user?.name || "You";

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl"
        style={{ height: "80vh", minHeight: 520, maxHeight: 720 }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center gap-3 px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <IconHeadphones className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Support Chat</p>
            <p className="text-neutral-500 text-xs">MusicNext · Typically replies in minutes</p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium ${
            isConnected ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-neutral-800 border-neutral-700 text-neutral-500"
          }`}>
            {isConnected ? (
              <><IconCircleFilled className="w-2 h-2 animate-pulse" />Live</>
            ) : (
              <><IconWifiOff className="w-3 h-3" />Offline</>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Welcome */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex items-end gap-2.5 max-w-[75%]">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-1">
                <IconHeadphones className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-neutral-800 border border-neutral-700/60 text-neutral-200 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm">
                <p>👋 Hi <span className="text-purple-300 font-semibold">@{username}</span>! How can we help you today?</p>
                <p className="text-neutral-500 text-[10px] mt-1">Support Team</p>
              </div>
            </div>
          </motion.div>

          {messages.map((msg, i) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i === messages.length - 1 ? 0.05 : 0 }}
              className={`flex items-end gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "admin" && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-1">
                  <IconHeadphones className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={`max-w-[70%] px-4 py-2.5 text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-purple-500/20"
                  : "bg-neutral-800 border border-neutral-700/60 text-neutral-200 rounded-2xl rounded-bl-sm"
              }`}>
                <p>{msg.text}</p>
                <div className={`flex items-center gap-1 mt-1 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <span className={`text-[10px] ${msg.sender === "user" ? "text-purple-200/70" : "text-neutral-500"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {msg.sender === "user" && (
                    <IconCheck className={`w-3 h-3 ${msg.isRead ? "text-purple-200" : "text-purple-300/50"}`} />
                  )}
                </div>
              </div>
              {msg.sender === "user" && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center mb-1 text-white text-xs font-bold uppercase">
                  {username.charAt(0)}
                </div>
              )}
            </motion.div>
          ))}

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <IconMessage className="w-10 h-10 text-neutral-700" />
              <p className="text-neutral-500 text-sm">Send a message to start the conversation</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 p-4 border-t border-neutral-800 bg-neutral-950">
          <div className="relative flex items-center gap-3 bg-neutral-900 rounded-2xl px-4 py-3 border border-neutral-800 focus-within:border-purple-500/40 transition-all">
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
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xs font-bold uppercase">
              {username.charAt(0)}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type your message..."
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-neutral-600"
            />
            <button
              onClick={() => setShowEmojiPicker((v) => !v)}
              className={`flex-shrink-0 transition-colors ${showEmojiPicker ? "text-purple-400" : "text-neutral-500 hover:text-neutral-300"}`}
              title="Emoji"
            >
              <IconMoodSmile className="w-5 h-5" />
            </button>
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isSending}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium disabled:opacity-30 hover:opacity-90 active:scale-95 transition-all shadow-md shadow-purple-500/20"
            >
              {isSending ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <><IconSend className="w-4 h-4" />Send</>}
            </button>
          </div>
          <p className="text-neutral-600 text-[11px] mt-2 text-center">
            Our support team usually responds within a few minutes
          </p>
        </div>
      </motion.div>
    </div>
  );
}
