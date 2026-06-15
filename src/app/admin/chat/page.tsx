"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconMessage, IconSend, IconLoader2, IconSearch,
  IconUsers, IconHeadphones, IconCircleFilled, IconArrowLeft, IconInbox,
  IconWifi, IconWifiOff, IconMoodSmile,
} from "@tabler/icons-react";
import EmojiPicker from "@/components/EmojiPicker";

interface Message {
  _id: string;
  sender: "user" | "admin";
  text: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  _id: string;
  username: string;
  userEmail?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);
  const selectedConvRef = useRef<Conversation | null>(null);
  selectedConvRef.current = selectedConv;

  const fetchConversations = useCallback(async () => {
    try {
      const res = await axios.get("/api/chat/conversations");
      setConversations(res.data.conversations);
    } catch {}
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await axios.get(`/api/chat/messages?conversationId=${convId}`);
      setMessages(res.data.messages);
    } catch {}
  }, []);

  useEffect(() => {
    fetchConversations();
    const es = new EventSource("/api/sse/admin-chat");

    es.addEventListener("connected", () => {
      setIsConnected(true);
      fetchConversations();
    });

    es.addEventListener("new_message", (e: MessageEvent) => {
      const { message, conversationId } = JSON.parse(e.data);
      if (selectedConvRef.current?._id === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id.toString() === message._id.toString())) return prev;
          return [...prev, message];
        });
        axios.patch("/api/chat/read", { conversationId, sender: "user" }).catch(() => {});
      }
      setConversations((prev) => {
        const exists = prev.find((c) => c._id === conversationId);
        const isOpen = selectedConvRef.current?._id === conversationId;
        if (exists) {
          return [...prev.map((c) =>
            c._id === conversationId
              ? { ...c, lastMessage: message.text, lastMessageAt: message.createdAt, unreadCount: isOpen ? 0 : c.unreadCount + 1 }
              : c
          ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())];
        }
        return [{ _id: conversationId, username: message.username, userEmail: message.userEmail, lastMessage: message.text, lastMessageAt: message.createdAt, unreadCount: 1 }, ...prev];
      });
    });

    es.addEventListener("message_sent", (e: MessageEvent) => {
      const { message, conversationId } = JSON.parse(e.data);
      setConversations((prev) =>
        prev.map((c) => c._id === conversationId ? { ...c, lastMessage: message.text, lastMessageAt: message.createdAt } : c)
          .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
      );
    });

    es.onerror = () => setIsConnected(false);
    return () => es.close();
  }, [fetchConversations]);

  useEffect(() => {
    if (!selectedConv) return;
    fetchMessages(selectedConv._id);
    axios.patch("/api/chat/read", { conversationId: selectedConv._id, sender: "user" }).catch(() => {});
    setConversations((prev) => prev.map((c) => (c._id === selectedConv._id ? { ...c, unreadCount: 0 } : c)));
  }, [selectedConv, fetchMessages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (selectedConv) setTimeout(() => replyInputRef.current?.focus(), 200); }, [selectedConv]);

  const sendReply = async () => {
    if (!replyText.trim() || !selectedConv || isSending) return;
    const text = replyText.trim();
    setReplyText("");
    setIsSending(true);
    const tempId = `temp_${Date.now()}`;
    setMessages((prev) => [...prev, { _id: tempId, sender: "admin", text, isRead: false, createdAt: new Date().toISOString() }]);
    try {
      await axios.post("/api/chat/send", { conversationId: selectedConv._id, text, sender: "admin", username: "Admin" });
      await fetchMessages(selectedConv._id);
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setReplyText(text);
    } finally { setIsSending(false); }
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  const filteredConvs = conversations.filter(
    (c) => c.username.toLowerCase().includes(searchQuery.toLowerCase()) || (c.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full overflow-hidden">
      <AnimatePresence>
        {(showSidebar || !selectedConv) && (
          <motion.aside initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="w-80 flex-shrink-0 border-r border-neutral-800 flex flex-col bg-neutral-950">
            <div className="p-4 border-b border-neutral-800 flex-shrink-0">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <IconHeadphones className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Chat Support</p>
                  <p className="text-neutral-500 text-xs">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
                </div>
                <div className={`ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full border ${isConnected ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                  {isConnected ? (
                    <><IconCircleFilled className="w-2 h-2 text-green-400 animate-pulse" /><span className="text-green-400 text-[10px] font-medium">Live</span></>
                  ) : (
                    <><IconWifiOff className="w-2.5 h-2.5 text-red-400" /><span className="text-red-400 text-[10px] font-medium">Offline</span></>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 bg-neutral-900 rounded-xl px-3 py-2 border border-neutral-800 focus-within:border-purple-500/40 transition-all">
                <IconSearch className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder-neutral-600" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                  <IconInbox className="w-8 h-8 text-neutral-700" />
                  <p className="text-neutral-500 text-sm">{searchQuery ? "No results" : "No conversations yet"}</p>
                </div>
              ) : filteredConvs.map((conv) => (
                <button key={conv._id} onClick={() => { setSelectedConv(conv); setShowSidebar(false); }}
                  className={`w-full flex items-start gap-3 p-4 text-left border-b border-neutral-800/60 hover:bg-neutral-900 transition-colors ${selectedConv?._id === conv._id ? "bg-purple-950/40 border-l-2 border-l-purple-500" : ""}`}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold uppercase text-sm">
                    {conv.username.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-white text-sm font-semibold truncate">@{conv.username}</p>
                      <p className="text-neutral-500 text-[10px] flex-shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-neutral-500 text-xs truncate pr-2">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 min-w-5 h-5 px-1 bg-purple-600 rounded-full text-white text-[10px] flex items-center justify-center font-bold">{conv.unreadCount}</span>
                      )}
                    </div>
                    {conv.userEmail && <p className="text-neutral-600 text-[10px] mt-0.5 truncate">{conv.userEmail}</p>}
                  </div>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        {selectedConv ? (
          <>
            <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-neutral-800 bg-neutral-950">
              <button onClick={() => { setShowSidebar(true); setSelectedConv(null); }} className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
                <IconArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold uppercase text-sm flex-shrink-0">
                {selectedConv.username.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold leading-none">@{selectedConv.username}</p>
                {selectedConv.userEmail && <p className="text-neutral-500 text-xs mt-0.5 truncate">{selectedConv.userEmail}</p>}
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-[10px] font-medium">Active</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <IconMessage className="w-10 h-10 text-neutral-700" />
                  <p className="text-neutral-500 text-sm">No messages yet</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div key={msg._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i === messages.length - 1 ? 0.05 : 0 }}
                  className={`flex items-end gap-3 ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                  {msg.sender === "user" && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase mb-1">
                      {selectedConv.username.charAt(0)}
                    </div>
                  )}
                  <div className={`max-w-[65%] px-4 py-2.5 text-sm leading-relaxed ${msg.sender === "admin"
                    ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl rounded-br-sm shadow-lg shadow-purple-500/20"
                    : "bg-neutral-800 border border-neutral-700/60 text-neutral-200 rounded-2xl rounded-bl-sm"}`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === "admin" ? "text-purple-200/70 text-right" : "text-neutral-500"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      {msg.sender === "admin" && <span className="ml-1">{msg.isRead ? "✓✓" : "✓"}</span>}
                    </p>
                  </div>
                  {msg.sender === "admin" && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xs font-bold mb-1">A</div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex-shrink-0 p-4 border-t border-neutral-800 bg-neutral-950">
              <div className="relative flex items-center gap-3 bg-neutral-900 rounded-xl px-4 py-3 border border-neutral-800 focus-within:border-purple-500/40 transition-all duration-200">
                {/* Emoji Picker */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <EmojiPicker
                      position="top"
                      onSelect={(emoji) => {
                        setReplyText((prev) => prev + emoji);
                        replyInputRef.current?.focus();
                      }}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  className={`flex-shrink-0 transition-colors ${showEmojiPicker ? "text-purple-400" : "text-neutral-500 hover:text-neutral-300"}`}
                  title="Emoji"
                >
                  <IconMoodSmile className="w-5 h-5" />
                </button>
                <input ref={replyInputRef} type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder={`Reply to @${selectedConv.username}...`} className="flex-1 bg-transparent text-white text-sm outline-none placeholder-neutral-600" />
                <button onClick={sendReply} disabled={!replyText.trim() || isSending}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium disabled:opacity-30 hover:opacity-90 active:scale-95 transition-all shadow-md shadow-purple-500/20">
                  {isSending ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <><IconSend className="w-4 h-4" />Send</>}
                </button>
              </div>
              <p className="text-neutral-600 text-[10px] mt-2 text-center flex items-center justify-center gap-1">
                {isConnected
                  ? <><IconWifi className="w-3 h-3 text-green-500" /> Real-time · Press Enter to send</>
                  : <><IconWifiOff className="w-3 h-3 text-red-400" /> Reconnecting...</>}
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center ring-1 ring-purple-500/20">
              <IconUsers className="w-10 h-10 text-purple-400" />
            </div>
            <p className="text-white text-lg font-semibold">Select a Conversation</p>
            <p className="text-neutral-500 text-sm">Choose from the sidebar to start replying</p>
          </div>
        )}
      </div>
    </div>
  );
}
