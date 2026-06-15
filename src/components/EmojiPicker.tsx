"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES: { label: string; icon: string; emojis: string[] }[] = [
  {
    label: "Smileys",
    icon: "😊",
    emojis: [
      "😀","😁","😂","🤣","😃","😄","😅","😆","😇","😈","😉","😊","😋","😌","😍","🥰",
      "😎","😏","😐","😑","😒","😓","😔","😕","😖","😗","😘","😙","😚","😛","😜","😝",
      "🤩","🥳","😤","😠","😡","🤬","😢","😭","😩","😫","🥺","😦","😧","😮","😯","😲",
      "🥱","😴","🤤","😪","😵","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","😈",
    ],
  },
  {
    label: "Gestures",
    icon: "👋",
    emojis: [
      "👋","🤚","🖐","✋","🖖","👌","🤌","🤏","✌","🤞","🤟","🤘","🤙","👈","👉","👆",
      "🖕","👇","☝","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🤝","🙏",
      "💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🫀","🫁","🧠","🦷","🦴","👀","👁","👅",
    ],
  },
  {
    label: "Hearts",
    icon: "❤️",
    emojis: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❤️‍🔥","❤️‍🩹","💕","💞","💓",
      "💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉","☸️","✡️","🔯","🕎","☯️","🆘","♾",
      "💯","✅","❎","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🔶","🔷","🔸","🔹",
    ],
  },
  {
    label: "Music",
    icon: "🎵",
    emojis: [
      "🎵","🎶","🎼","🎹","🥁","🪘","🎸","🎺","🎻","🪕","🎷","🪗","🎤","🎧","📻","🎙",
      "🎚","🎛","🎬","🎭","🎨","🖼","🎪","🤹","🎠","🎡","🎢","🎟","🎫","🏆","🥇","🥈",
      "🥉","🏅","🎖","🎗","🏵","🎀","🎁","🎊","🎉","🎈","🎏","🎐","🧧","🎑","🎃","🎄",
    ],
  },
  {
    label: "Nature",
    icon: "🌿",
    emojis: [
      "🌸","🌺","🌻","🌹","🌷","🌼","💐","🍀","🌿","🍃","🍂","🍁","🌱","🌲","🌳","🌴",
      "🌵","🎋","🎍","🍄","🐚","🪸","🌾","💧","🌊","🌬","🌀","🌈","☀️","🌤","⛅","🌥",
      "☁️","🌦","🌧","⛈","🌩","🌨","❄️","☃️","⛄","🌬","💨","🌪","🌫","🌈","☔","⚡",
    ],
  },
  {
    label: "Food",
    icon: "🍕",
    emojis: [
      "🍕","🍔","🍟","🌭","🍿","🧂","🥓","🥚","🍳","🧇","🥞","🧈","🍞","🥐","🥨","🧀",
      "🥗","🥙","🧆","🌮","🌯","🫔","🥘","🍲","🫕","🍜","🍝","🍛","🍣","🍱","🥟","🦪",
      "🍦","🍧","🍨","🍩","🍪","🎂","🍰","🧁","🥧","🍫","🍬","🍭","🍮","🍯","🍷","🍸",
    ],
  },
  {
    label: "Travel",
    icon: "✈️",
    emojis: [
      "✈️","🚀","🛸","🚁","🛩","🚂","🚃","🚄","🚅","🚆","🚇","🚈","🚉","🚊","🚝","🚞",
      "🚋","🚌","🚍","🚎","🚐","🚑","🚒","🚓","🚔","🚕","🚖","🚗","🚘","🚙","🛻","🚚",
      "⛵","🚤","🛥","🛳","⛴","🚢","🏖","🏝","🏜","🏕","⛺","🌆","🌇","🌉","🌃","🗼",
    ],
  },
  {
    label: "Objects",
    icon: "💡",
    emojis: [
      "💡","🔦","🕯","💻","🖥","🖨","⌨","🖱","🖲","💾","💿","📀","📱","☎️","📞","📟",
      "📠","📺","📷","📸","📹","🎥","🔭","🔬","🩺","💉","💊","🩹","🩼","🩻","🪜","🧲",
      "🪝","🔧","🪛","🔩","⚙️","🗜","🔗","⛓","🪤","🔑","🗝","🔐","🔒","🔓","🔨","🪓",
    ],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position?: "top" | "bottom";
}

export default function EmojiPicker({ onSelect, onClose, position = "top" }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <motion.div
      ref={pickerRef}
      initial={{ opacity: 0, scale: 0.92, y: position === "top" ? 8 : -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: position === "top" ? 8 : -8 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={`absolute ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"} left-0 z-50 w-72 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden`}
    >
      {/* Category tabs */}
      <div className="flex items-center gap-0.5 px-2 pt-2 pb-1 border-b border-neutral-800 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(i)}
            title={cat.label}
            className={`flex-shrink-0 w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${
              activeCategory === i
                ? "bg-purple-600/20 ring-1 ring-purple-500/40"
                : "hover:bg-neutral-800"
            }`}
          >
            {cat.icon}
          </button>
        ))}
      </div>

      {/* Category label */}
      <p className="px-3 pt-2 pb-1 text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
        {CATEGORIES[activeCategory].label}
      </p>

      {/* Emoji grid */}
      <div className="grid grid-cols-8 gap-0.5 px-2 pb-3 max-h-44 overflow-y-auto">
        {CATEGORIES[activeCategory].emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-neutral-700 active:scale-90 transition-all"
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
