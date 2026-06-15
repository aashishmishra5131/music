"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { verifySchema } from "@/schemas/verifySchema";
import { ApiResponse } from "@/types/ApiResponse";
import { BackgroundBeams } from "@/components/ui/background-beams";

type VerifySchema = z.infer<typeof verifySchema>;

const VerifyAccount = () => {
  const router = useRouter();
  const { username } = useParams<{ username: string }>();

  const [form, setForm] = useState<VerifySchema>({
    code: "",
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post<ApiResponse>("/api/verify-code", {
        username,
        code: form.code,
      });

      setMessage(response.data.message);
      router.push("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse>;
        setMessage(
          axiosError.response?.data.message ?? "Error verifying account"
        );
      } else {
        setMessage("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center relative antialiased">
      <BackgroundBeams className="absolute inset-0 z-0" />
      <div className="max-w-md w-full mx-auto p-6 md:p-8 shadow-2xl bg-black/60 backdrop-blur-md border border-neutral-800 rounded-2xl relative z-10">
        <h2 className="font-bold text-3xl text-neutral-200 text-center">
          Verify Your Account
        </h2>
        <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-6 h-[1px] w-full" />
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-2 w-full">
            <label htmlFor="code" className="text-gray-300 text-sm font-medium">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              placeholder="Enter verification code"
              value={form.code}
              onChange={handleChange}
              className="border border-neutral-700 rounded-xl px-4 py-3 bg-neutral-900 text-white placeholder-neutral-600 outline-none focus:border-purple-500/60 transition-all text-sm"
              required
            />
          </div>

          {message && (
            <p className={`text-center text-sm ${message.toLowerCase().includes("success") || message.toLowerCase().includes("verified") ? "text-green-400" : "text-red-400"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-br from-zinc-900 to-neutral-600 w-full text-white rounded-xl h-11 font-medium shadow-[0px_1px_0px_0px_#ffffff20_inset] disabled:opacity-50 hover:opacity-90 transition-all mt-2"
          >
            {isSubmitting ? "Verifying..." : "Verify Code →"}
          </button>
        </form>
      </div>
    </div>
  );
};


export default VerifyAccount;
