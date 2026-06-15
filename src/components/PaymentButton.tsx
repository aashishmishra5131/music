"use client";

import React, { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconLoader2, IconCheck, IconLock, IconShoppingCart,
  IconX, IconCreditCard, IconDeviceMobile, IconBuildingBank,
  IconAlertCircle, IconShieldCheck,
} from "@tabler/icons-react";

interface PaymentButtonProps {
  courseId: string;       // MongoDB _id OR slug (for static JSON courses)
  courseTitle: string;
  price: number;
  courseSlug?: string;
  courseImage?: string;
  isPurchased?: boolean;
  onSuccess?: () => void;
}

export default function PaymentButton({ courseId, courseTitle, price, courseSlug, courseImage, isPurchased = false, onSuccess }: PaymentButtonProps) {
  const { status } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [paying, setPaying] = useState(false);
  const [enrolled, setEnrolled] = useState(isPurchased);
  const [showSuccess, setShowSuccess] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [expiry, setExpiry] = useState("12/26");
  const [cvv, setCvv] = useState("123");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("success@razorpay");

  const handleBuyClick = () => {
    if (status !== "authenticated") { router.push("/login"); return; }
    setShowModal(true);
    setPayError(null);
  };

  const handlePay = async () => {
    setPaying(true);
    setPayError(null);
    // Simulate processing animation
    await new Promise((res) => setTimeout(res, 1500));
    try {
      // Call mock-complete API — saves order to DB + allots course to user
      const res = await axios.post("/api/payment/mock-complete", {
        courseId: courseId && !courseId.includes("-") ? courseId : null,
        courseTitle,
        courseSlug: courseSlug || courseId,
        courseImage: courseImage || "",
        price,
      });
      if (res.data.success) {
        setShowModal(false);
        setEnrolled(true);
        setShowSuccess(true);
        onSuccess?.();
        setTimeout(() => setShowSuccess(false), 4000);
      } else {
        setPayError(res.data.message || "Payment failed");
      }
    } catch (err: any) {
      setPayError(err.response?.data?.message || "Payment failed. Try again.");
    } finally {
      setPaying(false);
    }
  };

  const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) => v.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");

  if (enrolled) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400">
          <IconCheck className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm">You are enrolled in this course!</span>
        </div>
        <button onClick={() => router.push("/my-courses")} className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-all text-sm font-medium">
          Go to My Courses →
        </button>
        <AnimatePresence>
          {showSuccess && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
              <IconCheck className="w-4 h-4 flex-shrink-0" />
              🎉 Payment successful! Welcome to {courseTitle}!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <button onClick={handleBuyClick}
          className="relative group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base transition-all duration-200 shadow-lg shadow-purple-500/30 overflow-hidden">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <IconShoppingCart className="w-5 h-5" />
          {status !== "authenticated" ? `Login to Purchase — ₹${price.toLocaleString("en-IN")}` : `Buy Now — ₹${price.toLocaleString("en-IN")}`}
        </button>
        <div className="flex items-center justify-center gap-2 text-neutral-500 text-xs">
          <IconLock className="w-3.5 h-3.5" />
          Secured by Razorpay · 100% Safe Payment
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/10">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">M</div>
                  <div>
                    <p className="text-white text-sm font-bold">MusicNext</p>
                    <p className="text-neutral-400 text-xs">Secure Checkout</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all">
                  <IconX className="w-4 h-4" />
                </button>
              </div>

              {/* Order Summary */}
              <div className="px-6 py-4 bg-purple-600/5 border-b border-neutral-800">
                <p className="text-neutral-400 text-xs mb-1">Paying for</p>
                <p className="text-white font-semibold text-sm">{courseTitle}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-neutral-400 text-xs">Amount</span>
                  <span className="text-white font-bold text-lg">₹{price.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div className="px-6 pt-4">
                <div className="flex gap-2 mb-5">
                  {([
                    { id: "card", label: "Card", icon: IconCreditCard },
                    { id: "upi", label: "UPI", icon: IconDeviceMobile },
                    { id: "netbanking", label: "Net Banking", icon: IconBuildingBank },
                  ] as const).map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setSelectedMethod(id)}
                      className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${selectedMethod === id ? "border-purple-500 bg-purple-600/10 text-purple-300" : "border-neutral-700 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300"}`}>
                      <Icon className="w-4 h-4" />{label}
                    </button>
                  ))}
                </div>

                {selectedMethod === "card" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-neutral-400 text-xs mb-1.5 block">Card Number</label>
                      <input value={cardNumber} onChange={(e) => setCardNumber(formatCard(e.target.value))}
                        placeholder="1234 5678 9012 3456" maxLength={19}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500/60 transition-all placeholder-neutral-600 font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-neutral-400 text-xs mb-1.5 block">Expiry</label>
                        <input value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY" maxLength={5}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500/60 transition-all placeholder-neutral-600 font-mono" />
                      </div>
                      <div>
                        <label className="text-neutral-400 text-xs mb-1.5 block">CVV</label>
                        <input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                          placeholder="123" maxLength={3} type="password"
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500/60 transition-all placeholder-neutral-600 font-mono" />
                      </div>
                    </div>
                    <div>
                      <label className="text-neutral-400 text-xs mb-1.5 block">Name on Card</label>
                      <input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Your Name"
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500/60 transition-all placeholder-neutral-600" />
                    </div>
                  </div>
                )}

                {selectedMethod === "upi" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-neutral-400 text-xs mb-1.5 block">UPI ID</label>
                      <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi"
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-purple-500/60 transition-all placeholder-neutral-600" />
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-blue-300 text-xs">
                      <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
                      Test UPI: <span className="font-mono ml-1">success@razorpay</span>
                    </div>
                  </div>
                )}

                {selectedMethod === "netbanking" && (
                  <div className="grid grid-cols-2 gap-2">
                    {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "Yes Bank"].map((bank) => (
                      <button key={bank} className="py-2.5 px-3 rounded-xl border border-neutral-700 text-neutral-300 text-sm hover:border-purple-500/40 hover:bg-purple-600/5 transition-all">
                        {bank}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pay Button */}
              <div className="px-6 py-5 mt-2">
                <button onClick={handlePay} disabled={paying}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-500/30 disabled:opacity-70 disabled:cursor-not-allowed">
                  {paying ? (<><IconLoader2 className="w-4 h-4 animate-spin" />Processing payment...</>) : (<><IconShieldCheck className="w-4 h-4" />Pay ₹{price.toLocaleString("en-IN")} Securely</>)}
                </button>
                {paying && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-3 flex items-center justify-center gap-2 text-neutral-400 text-xs">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="ml-1">Saving to your account...</span>
                  </motion.div>
                )}
                {payError && (
                  <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                    <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
                    {payError}
                  </div>
                )}
                <p className="text-center text-neutral-600 text-[11px] mt-3 flex items-center justify-center gap-1">
                  <IconLock className="w-3 h-3" />256-bit SSL encrypted · Powered by Razorpay
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
