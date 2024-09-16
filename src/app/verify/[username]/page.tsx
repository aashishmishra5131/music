"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { verifySchema } from "@/schemas/verifySchema";
import { ApiResponse } from "@/types/ApiResponse"; 

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
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
      <div className="max-w-md w-full mx-auto p-4 md:p-8 shadow-input">
        <h2 className="font-bold text-3xl text-neutral-800 dark:text-neutral-200 text-center">
          Verify Your Account
        </h2>
        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
        <form className="my-4 mt-16" onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-2 w-full mb-4">
            <label
              htmlFor="code"
              className="text-gray-700 dark:text-gray-100 text-sm"
            >
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              placeholder="Enter verification code"
              value={form.code}
              onChange={handleChange}
              className="border rounded-md p-2 bg-gray-800"
              required
            />
          </div>

          {message && <p className="text-center mb-4">{message}</p>}

          <button
            type="submit"
            className="bg-gradient-to-br from-black dark:from-zinc-900 to-neutral-600 dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify Code ->"}
          </button>
        </form>
      </div>
    </div>
  );
};


export default VerifyAccount;
